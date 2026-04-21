import { query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

/* ─── Get contracts for an org ─── */
export const contractsByOrg = query({
  args: { orgId: v.id("organizations") },
  handler: async (ctx, { orgId }) => {
    const contracts = await ctx.db
      .query("contracts")
      .withIndex("by_org", (q) => q.eq("orgId", orgId))
      .collect();

    const enriched = await Promise.all(
      contracts.map(async (c) => {
        const deployment = await ctx.db.get(c.deploymentId);
        const template = deployment ? await ctx.db.get(deployment.templateId) : null;
        return { ...c, deployment, template };
      })
    );

    return enriched;
  },
});

/* ─── Get invoices for an org ─── */
export const invoicesByOrg = query({
  args: { orgId: v.id("organizations") },
  handler: async (ctx, { orgId }) => {
    return await ctx.db
      .query("invoices")
      .withIndex("by_org", (q) => q.eq("orgId", orgId))
      .order("desc")
      .collect();
  },
});

/* ─── Monthly spend summary ─── */
export const spendSummary = query({
  args: { orgId: v.id("organizations") },
  handler: async (ctx, { orgId }) => {
    const contracts = await ctx.db
      .query("contracts")
      .withIndex("by_org", (q) => q.eq("orgId", orgId))
      .collect();

    const activeContracts = contracts.filter((c) => c.status === "active");
    const monthlyTotalCents = activeContracts.reduce(
      (sum, c) => sum + c.monthlyRateCents,
      0
    );

    return {
      monthlyTotalCents,
      activeContractCount: activeContracts.length,
      formattedTotal: `$${(monthlyTotalCents / 100).toLocaleString()}`,
    };
  },
});

/* ─── Admin: revenue overview ─── */
export const revenueOverview = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const allContracts = await ctx.db.query("contracts").collect();
    const active = allContracts.filter((c) => c.status === "active");
    const mrr = active.reduce((sum, c) => sum + c.monthlyRateCents, 0);

    const allInvoices = await ctx.db.query("invoices").collect();
    const paid = allInvoices.filter((i) => i.status === "paid");
    const totalRevenue = paid.reduce((sum, i) => sum + i.amountCents, 0);

    const orgs = await ctx.db.query("organizations").collect();

    return {
      mrrCents: mrr,
      formattedMRR: `$${(mrr / 100).toLocaleString()}`,
      totalRevenueCents: totalRevenue,
      formattedRevenue: `$${(totalRevenue / 100).toLocaleString()}`,
      totalClients: orgs.filter((o) => o.onboardingStatus === "active").length,
      activeContracts: active.length,
    };
  },
});

/* ─── Admin: list all contracts ─── */
export const listAllContracts = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const contracts = await ctx.db.query("contracts").collect();

    const enriched = await Promise.all(
      contracts.map(async (c) => {
        const org = await ctx.db.get(c.orgId);
        const deployment = await ctx.db.get(c.deploymentId);
        return { ...c, org, deployment };
      })
    );

    return enriched;
  },
});
