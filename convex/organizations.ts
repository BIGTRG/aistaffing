import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

/* ─── Create organization (onboarding) ─── */
export const create = mutation({
  args: {
    name: v.string(),
    industry: v.string(),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    website: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Generate slug from name
    const slug = args.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    const orgId = await ctx.db.insert("organizations", {
      name: args.name,
      slug,
      industry: args.industry,
      phone: args.phone,
      email: args.email,
      website: args.website,
      onboardingStatus: "onboarding",
      ownerId: userId,
    });

    // Add creator as owner member
    await ctx.db.insert("orgMembers", {
      orgId,
      userId,
      role: "owner",
    });

    // Log activity
    await ctx.db.insert("activityLog", {
      orgId,
      eventType: "org.created",
      title: `${args.name} created their account`,
    });

    return orgId;
  },
});

/* ─── Get current user's organization ─── */
export const getMine = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const membership = await ctx.db
      .query("orgMembers")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!membership) return null;

    return await ctx.db.get(membership.orgId);
  },
});

/* ─── Update organization ─── */
export const update = mutation({
  args: {
    orgId: v.id("organizations"),
    name: v.optional(v.string()),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    website: v.optional(v.string()),
    onboardingStatus: v.optional(v.string()),
  },
  handler: async (ctx, { orgId, ...updates }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const member = await ctx.db
      .query("orgMembers")
      .withIndex("by_org_user", (q) => q.eq("orgId", orgId).eq("userId", userId))
      .first();

    if (!member || (member.role !== "owner" && member.role !== "admin")) {
      throw new Error("Not authorized");
    }

    const clean: Record<string, string> = {};
    for (const [k, val] of Object.entries(updates)) {
      if (val !== undefined) clean[k] = val;
    }

    await ctx.db.patch(orgId, clean);
    return orgId;
  },
});

/* ─── Complete onboarding ─── */
export const completeOnboarding = mutation({
  args: { orgId: v.id("organizations") },
  handler: async (ctx, { orgId }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    await ctx.db.patch(orgId, { onboardingStatus: "active" });

    await ctx.db.insert("activityLog", {
      orgId,
      eventType: "org.activated",
      title: "Account activated — welcome to AI Staffing Agency",
    });

    return orgId;
  },
});

/* ─── Get org by ID (for internal use) ─── */
export const getById = query({
  args: { orgId: v.id("organizations") },
  handler: async (ctx, { orgId }) => {
    return await ctx.db.get(orgId);
  },
});

/* ─── Admin: list all organizations ─── */
export const listAll = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    // In production, check admin role. For now return all.
    return await ctx.db.query("organizations").collect();
  },
});
