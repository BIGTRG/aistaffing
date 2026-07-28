import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

/* ─── Deploy an agent to an organization ─── */
export const deploy = mutation({
  args: {
    orgId: v.id("organizations"),
    templateId: v.id("agentTemplates"),
    displayName: v.string(),
  },
  handler: async (ctx, { orgId, templateId, displayName }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const template = await ctx.db.get(templateId);
    if (!template) throw new Error("Template not found");

    const deploymentId = await ctx.db.insert("deployments", {
      orgId,
      templateId,
      displayName,
      status: "active",
      deployedAt: Date.now(),
    });

    // Create a contract
    await ctx.db.insert("contracts", {
      orgId,
      deploymentId,
      tier: "30_day",
      monthlyRateCents: template.basePriceCents,
      startsAt: Date.now(),
      autoRenew: true,
      status: "active",
    });

    // Log activity
    await ctx.db.insert("activityLog", {
      orgId,
      deploymentId,
      eventType: "agent.deployed",
      title: `${displayName} (${template.name}) deployed`,
    });

    return deploymentId;
  },
});

/* ─── List deployments for an org ─── */
export const listByOrg = query({
  args: { orgId: v.id("organizations") },
  handler: async (ctx, { orgId }) => {
    const deployments = await ctx.db
      .query("deployments")
      .withIndex("by_org", (q) => q.eq("orgId", orgId))
      .collect();

    // Enrich with template info
    const enriched = await Promise.all(
      deployments.map(async (d) => {
        const template = await ctx.db.get(d.templateId);
        return { ...d, template };
      })
    );

    return enriched;
  },
});

/* ─── Pause / Resume / Terminate ─── */
export const updateStatus = mutation({
  args: {
    deploymentId: v.id("deployments"),
    status: v.union(v.literal("active"), v.literal("paused"), v.literal("terminated")),
  },
  handler: async (ctx, { deploymentId, status }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const deployment = await ctx.db.get(deploymentId);
    if (!deployment) throw new Error("Deployment not found");

    await ctx.db.patch(deploymentId, { status });

    const template = await ctx.db.get(deployment.templateId);
    const actionWord = status === "active" ? "resumed" : status === "paused" ? "paused" : "terminated";

    await ctx.db.insert("activityLog", {
      orgId: deployment.orgId,
      deploymentId,
      eventType: `agent.${actionWord}`,
      title: `${deployment.displayName} (${template?.name ?? "Agent"}) ${actionWord}`,
    });

    return deploymentId;
  },
});

/* ─── Get single deployment ─── */
export const get = query({
  args: { deploymentId: v.id("deployments") },
  handler: async (ctx, { deploymentId }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const deployment = await ctx.db.get(deploymentId);
    if (!deployment) throw new Error("Deployment not found");

    const template = await ctx.db.get(deployment.templateId);
    return { ...deployment, template };
  },
});

/* ─── Update agent configuration ─── */
export const updateConfig = mutation({
  args: {
    deploymentId: v.id("deployments"),
    displayName: v.optional(v.string()),
    config: v.object({
      businessHours: v.optional(v.string()),
      services: v.optional(v.string()),
      pricing: v.optional(v.string()),
      faqs: v.optional(v.string()),
      phoneRouting: v.optional(v.string()),
      websiteUrl: v.optional(v.string()),
      customInstructions: v.optional(v.string()),
      tone: v.optional(v.string()),
      greeting: v.optional(v.string()),
      escalationRules: v.optional(v.string()),
    }),
  },
  handler: async (ctx, { deploymentId, displayName, config }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const deployment = await ctx.db.get(deploymentId);
    if (!deployment) throw new Error("Deployment not found");

    const updates: any = { config };
    if (displayName) updates.displayName = displayName;

    await ctx.db.patch(deploymentId, updates);

    await ctx.db.insert("activityLog", {
      orgId: deployment.orgId,
      deploymentId,
      eventType: "agent.configured",
      title: `${deployment.displayName} configuration updated`,
    });

    return deploymentId;
  },
});

/* ─── Get deployment count for org ─── */
export const countByOrg = query({
  args: { orgId: v.id("organizations") },
  handler: async (ctx, { orgId }) => {
    const all = await ctx.db
      .query("deployments")
      .withIndex("by_org", (q) => q.eq("orgId", orgId))
      .collect();

    return {
      total: all.length,
      active: all.filter((d) => d.status === "active").length,
      paused: all.filter((d) => d.status === "paused").length,
    };
  },
});

/* ─── Admin: list all deployments ─── */
export const listAll = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    const deployments = await ctx.db.query("deployments").collect();
    const enriched = await Promise.all(
      deployments.map(async (d) => {
        const template = await ctx.db.get(d.templateId);
        const org = await ctx.db.get(d.orgId);
        return { ...d, template, org };
      })
    );
    return enriched;
  },
});
