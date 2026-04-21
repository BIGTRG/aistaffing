import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

/* Get current user's platform role */
export const getMyRole = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const platformUser = await ctx.db
      .query("platformUsers")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    return platformUser?.role ?? "employer"; // default to employer
  },
});

/* Set a user's platform role (self-assign on first login, or admin can set) */
export const setRole = mutation({
  args: {
    role: v.union(v.literal("employer"), v.literal("admin")),
  },
  handler: async (ctx, { role }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const existing = await ctx.db
      .query("platformUsers")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, { role });
    } else {
      await ctx.db.insert("platformUsers", { userId, role });
    }

    return role;
  },
});

/* Admin-only: list all platform users */
export const listAll = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const caller = await ctx.db
      .query("platformUsers")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (caller?.role !== "admin") return [];

    const platformUsers = await ctx.db.query("platformUsers").collect();
    const enriched = await Promise.all(
      platformUsers.map(async (pu) => {
        const user = await ctx.db.get(pu.userId);
        return { ...pu, user };
      })
    );
    return enriched;
  },
});
