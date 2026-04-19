import { query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

/* ─── Get recent activity for an org ─── */
export const listByOrg = query({
  args: { orgId: v.id("organizations"), limit: v.optional(v.number()) },
  handler: async (ctx, { orgId, limit }) => {
    const all = await ctx.db
      .query("activityLog")
      .withIndex("by_org", (q) => q.eq("orgId", orgId))
      .order("desc")
      .collect();

    return all.slice(0, limit ?? 20);
  },
});

/* ─── Get activity stats for dashboard ─── */
export const stats = query({
  args: { orgId: v.id("organizations") },
  handler: async (ctx, { orgId }) => {
    const all = await ctx.db
      .query("activityLog")
      .withIndex("by_org", (q) => q.eq("orgId", orgId))
      .collect();

    const conversations = await ctx.db
      .query("conversations")
      .withIndex("by_org", (q) => q.eq("orgId", orgId))
      .collect();

    const calls = conversations.filter((c) => c.channel === "phone");
    const emails = conversations.filter((c) => c.channel === "email");
    const chats = conversations.filter((c) => c.channel === "chat");

    return {
      totalEvents: all.length,
      totalConversations: conversations.length,
      callsHandled: calls.length,
      emailsProcessed: emails.length,
      chatsHandled: chats.length,
    };
  },
});

/* ─── Admin: all activity ─── */
export const listAll = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    const all = await ctx.db.query("activityLog").order("desc").collect();
    return all.slice(0, limit ?? 50);
  },
});
