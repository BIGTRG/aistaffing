import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

/* ═══════════════════════════════════════════════════
   PRICING & QUOTING ENGINE
   Supports: flat_monthly, hourly_plus_commission, retainer
   ═══════════════════════════════════════════════════ */

/* ─── Generate a quote ─── */
export const generate = mutation({
  args: {
    orgId: v.optional(v.id("organizations")),
    businessName: v.string(),
    industry: v.string(),
    contactEmail: v.optional(v.string()),
    contactPhone: v.optional(v.string()),
    agents: v.array(
      v.object({
        templateId: v.id("agentTemplates"),
        pricingModel: v.string(), // flat_monthly | hourly_plus_commission | retainer
        tier: v.string(), // 30_day | 3_month | 6_month | 12_month
        commissionPct: v.optional(v.number()), // for hourly_plus_commission
        hourlyRateCents: v.optional(v.number()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const tierDiscounts: Record<string, number> = {
      "30_day": 0,
      "3_month": 0.05,
      "6_month": 0.10,
      "12_month": 0.15,
    };

    let totalMonthlyCents = 0;
    const lineItems: Array<{
      templateId: string;
      agentName: string;
      department: string;
      basePriceCents: number;
      discountPct: number;
      finalMonthlyCents: number;
      pricingModel: string;
      tier: string;
      commissionPct?: number;
    }> = [];

    for (const agentReq of args.agents) {
      const template = await ctx.db.get(agentReq.templateId);
      if (!template) continue;

      const discount = tierDiscounts[agentReq.tier] ?? 0;
      const baseCents = template.basePriceCents;
      const discounted = Math.round(baseCents * (1 - discount));

      totalMonthlyCents += discounted;
      lineItems.push({
        templateId: agentReq.templateId,
        agentName: template.name,
        department: template.department,
        basePriceCents: baseCents,
        discountPct: discount * 100,
        finalMonthlyCents: discounted,
        pricingModel: agentReq.pricingModel,
        tier: agentReq.tier,
        commissionPct: agentReq.commissionPct,
      });
    }

    // Estimate human equivalent cost (2.5x AI cost)
    const humanEquivalentCents = Math.round(totalMonthlyCents * 2.5);
    const savingsCents = humanEquivalentCents - totalMonthlyCents;

    const quoteId = await ctx.db.insert("quotes", {
      orgId: args.orgId,
      businessName: args.businessName,
      industry: args.industry,
      contactEmail: args.contactEmail,
      contactPhone: args.contactPhone,
      lineItems,
      totalMonthlyCents,
      humanEquivalentCents,
      savingsCents,
      status: "draft",
      createdAt: Date.now(),
      expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    return {
      quoteId,
      totalMonthlyCents,
      humanEquivalentCents,
      savingsCents,
      lineItems,
    };
  },
});

/* ─── Get a quote by ID ─── */
export const get = query({
  args: { quoteId: v.id("quotes") },
  handler: async (ctx, { quoteId }) => {
    return await ctx.db.get(quoteId);
  },
});

/* ─── List quotes for an org ─── */
export const listByOrg = query({
  args: { orgId: v.id("organizations") },
  handler: async (ctx, { orgId }) => {
    return await ctx.db
      .query("quotes")
      .withIndex("by_org", (q) => q.eq("orgId", orgId))
      .order("desc")
      .collect();
  },
});

/* ─── Pricing tiers info (public) ─── */
export const getPricingTiers = query({
  args: {},
  handler: async () => {
    return {
      tiers: [
        { id: "30_day", label: "Monthly", discount: 0, description: "Pay month-to-month, cancel anytime" },
        { id: "3_month", label: "Quarterly", discount: 5, description: "5% discount, billed quarterly" },
        { id: "6_month", label: "Semi-Annual", discount: 10, description: "10% discount, billed every 6 months" },
        { id: "12_month", label: "Annual", discount: 15, description: "15% discount, billed annually" },
      ],
      pricingModels: [
        { id: "flat_monthly", label: "Flat Monthly", description: "Fixed rate per month — best for predictable workloads" },
        { id: "hourly_plus_commission", label: "Hourly + Commission", description: "Base hourly rate plus % of sales — best for sales agents" },
        { id: "retainer", label: "Retainer", description: "Premium dedicated service — best for executive agents" },
      ],
    };
  },
});

/* ─── Admin: list all quotes ─── */
export const listAll = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    return await ctx.db
      .query("quotes")
      .order("desc")
      .take(100);
  },
});
