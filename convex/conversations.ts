import { query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

/* ─── List conversations for an org (enriched) ─── */
export const listByOrg = query({
  args: { orgId: v.id("organizations") },
  handler: async (ctx, { orgId }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const conversations = await ctx.db
      .query("conversations")
      .withIndex("by_org", (q) => q.eq("orgId", orgId))
      .order("desc")
      .collect();

    const enriched = await Promise.all(
      conversations.map(async (c) => {
        const deployment = await ctx.db.get(c.deploymentId);
        return {
          ...c,
          agentName: deployment?.displayName ?? "Agent",
        };
      })
    );

    return enriched;
  },
});

/* ─── Get conversations for a specific deployment ─── */
export const listByDeployment = query({
  args: { deploymentId: v.id("deployments") },
  handler: async (ctx, { deploymentId }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    return await ctx.db
      .query("conversations")
      .withIndex("by_deployment", (q) => q.eq("deploymentId", deploymentId))
      .order("desc")
      .collect();
  },
});

/* ─── Stats for conversations ─── */
export const stats = query({
  args: { orgId: v.id("organizations") },
  handler: async (ctx, { orgId }) => {
    const conversations = await ctx.db
      .query("conversations")
      .withIndex("by_org", (q) => q.eq("orgId", orgId))
      .collect();

    const now = Date.now();
    const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
    const monthAgo = now - 30 * 24 * 60 * 60 * 1000;

    const thisWeek = conversations.filter((c) => c.startedAt >= weekAgo);
    const thisMonth = conversations.filter((c) => c.startedAt >= monthAgo);

    const byChannel = conversations.reduce((acc, c) => {
      acc[c.channel] = (acc[c.channel] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const byOutcome = conversations.reduce((acc, c) => {
      if (c.outcome) acc[c.outcome] = (acc[c.outcome] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const avgDuration = conversations
      .filter((c) => c.durationSeconds)
      .reduce((sum, c) => sum + (c.durationSeconds ?? 0), 0) /
      Math.max(conversations.filter((c) => c.durationSeconds).length, 1);

    return {
      total: conversations.length,
      thisWeek: thisWeek.length,
      thisMonth: thisMonth.length,
      byChannel,
      byOutcome,
      avgDurationSeconds: Math.round(avgDuration),
      resolved: byOutcome.resolved ?? 0,
      escalated: byOutcome.escalated ?? 0,
    };
  },
});
