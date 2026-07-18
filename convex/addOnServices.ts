import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/* ═══════════════════════════════════════════════════════════════════════════
 * ADD-ON SERVICES — TRG Product Integrations for AI Staffing Clients
 *
 * These are TRG-owned products that clients can subscribe to as add-ons
 * when they sign up for AI Staffing Agency services. Each add-on connects
 * through the AI Gateway via its service connector.
 *
 * Products:
 *   Core:     Stewart Solution, Stewart Money, Genius Eye Mail, YouKnowNow, G-Sign, SealProof
 *   Channels: TRG Voice, TRG Email, TRG SMS (bundled with agent deployment)
 * ═══════════════════════════════════════════════════════════════════════════ */

// ─── Queries ───
export const listAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("addOnServices").order("asc").collect();
  },
});

export const listActive = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("addOnServices")
      .withIndex("by_active", q => q.eq("isActive", true))
      .collect();
  },
});

export const listByCategory = query({
  args: { category: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db.query("addOnServices")
      .withIndex("by_category", q => q.eq("category", args.category))
      .collect();
  },
});

export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db.query("addOnServices")
      .withIndex("by_slug", q => q.eq("slug", args.slug))
      .first();
  },
});

// ─── Subscriptions ───
export const listSubscriptions = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("clientServiceSubscriptions").collect();
  },
});

export const listSubscriptionsByOrg = query({
  args: { orgId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db.query("clientServiceSubscriptions")
      .withIndex("by_org", q => q.eq("orgId", args.orgId))
      .collect();
  },
});

export const getSubscriptionStats = query({
  args: {},
  handler: async (ctx) => {
    const subs = await ctx.db.query("clientServiceSubscriptions").collect();
    const services = await ctx.db.query("addOnServices").collect();

    const activeSubs = subs.filter(s => s.status === "active");
    const totalMRR = activeSubs.reduce((sum, s) => sum + s.monthlyPrice, 0);

    const byService: Record<string, { count: number; mrr: number; name: string }> = {};
    for (const sub of activeSubs) {
      if (!byService[sub.serviceSlug]) {
        byService[sub.serviceSlug] = { count: 0, mrr: 0, name: sub.serviceName };
      }
      byService[sub.serviceSlug].count++;
      byService[sub.serviceSlug].mrr += sub.monthlyPrice;
    }

    const byTier: Record<string, number> = {};
    for (const sub of activeSubs) {
      byTier[sub.tier] = (byTier[sub.tier] ?? 0) + 1;
    }

    return {
      totalServices: services.length,
      activeServices: services.filter(s => s.isActive).length,
      totalSubscriptions: activeSubs.length,
      totalMRR,
      byService,
      byTier,
      trialCount: subs.filter(s => s.status === "trial").length,
      cancelledCount: subs.filter(s => s.status === "cancelled").length,
    };
  },
});

// ─── Mutations ───
export const subscribe = mutation({
  args: {
    orgId: v.string(),
    orgName: v.string(),
    serviceId: v.id("addOnServices"),
    tier: v.string(),
  },
  handler: async (ctx, args) => {
    const service = await ctx.db.get(args.serviceId);
    if (!service) throw new Error("Service not found");

    const price = args.tier === "starter"
      ? service.pricingStarter
      : args.tier === "pro"
        ? service.pricingPro
        : service.pricingEnterprise;

    const subId = await ctx.db.insert("clientServiceSubscriptions", {
      orgId: args.orgId,
      orgName: args.orgName,
      serviceId: args.serviceId,
      serviceSlug: service.slug,
      serviceName: service.name,
      tier: args.tier,
      status: "active",
      monthlyPrice: price ?? 0,
      activatedAt: Date.now(),
      cancelledAt: undefined,
      lastBilledAt: Date.now(),
      usageThisMonth: 0,
      usageLimit: undefined,
      notes: undefined,
    });

    await ctx.db.patch(args.serviceId, { subscriberCount: service.subscriberCount + 1 });
    return subId;
  },
});

export const cancelSubscription = mutation({
  args: { subscriptionId: v.id("clientServiceSubscriptions") },
  handler: async (ctx, args) => {
    const sub = await ctx.db.get(args.subscriptionId);
    if (!sub) throw new Error("Subscription not found");
    await ctx.db.patch(args.subscriptionId, {
      status: "cancelled",
      cancelledAt: Date.now(),
    });
    const service = await ctx.db.get(sub.serviceId);
    if (service && service.subscriberCount > 0) {
      await ctx.db.patch(sub.serviceId, { subscriberCount: service.subscriberCount - 1 });
    }
  },
});

export const toggleServiceActive = mutation({
  args: { serviceId: v.id("addOnServices") },
  handler: async (ctx, args) => {
    const service = await ctx.db.get(args.serviceId);
    if (!service) throw new Error("Service not found");
    await ctx.db.patch(args.serviceId, { isActive: !service.isActive });
  },
});

export const updatePricing = mutation({
  args: {
    serviceId: v.id("addOnServices"),
    pricingStarter: v.optional(v.number()),
    pricingPro: v.optional(v.number()),
    pricingEnterprise: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { serviceId, ...pricing } = args;
    await ctx.db.patch(serviceId, pricing);
  },
});

// ─── Seed TRG Add-On Services ───
export const seedAddOnServices = mutation({
  args: {},
  handler: async (ctx) => {
    const services = [
      // ─── CORE (available to all clients) ───
      {
        name: "Stewart Solution",
        slug: "stewart-solution",
        description: "HR, recruitment, and employee management. Post jobs, screen applicants, onboard employees, manage benefits, track compliance. For clients who hire humans alongside AI agents.",
        category: "core",
        icon: "users",
        connectorSlug: "stewart-solution",
        pricingStarter: 149,
        pricingPro: 349,
        pricingEnterprise: 799,
        features: [
          "Job posting & applicant tracking",
          "Employee onboarding workflows",
          "Benefits administration",
          "Compliance tracking & alerts",
          "Offer letter generation",
          "Performance review templates",
          "Termination workflow management",
          "HR document vault",
        ],
        applicableIndustries: undefined,
        isActive: true,
        subscriberCount: 0,
        createdAt: Date.now(),
      },
      {
        name: "Stewart Money",
        slug: "stewart-money",
        description: "Bookkeeping, invoicing, and payroll. Process payroll, track expenses, generate financial reports, prepare taxes. Full back-office financial operations.",
        category: "core",
        icon: "dollar-sign",
        connectorSlug: "stewart-money",
        pricingStarter: 99,
        pricingPro: 249,
        pricingEnterprise: 599,
        features: [
          "Invoicing & accounts receivable",
          "Payroll processing",
          "Expense tracking & categorization",
          "Bank reconciliation",
          "Financial reporting (P&L, balance sheet)",
          "Tax preparation & filing support",
          "Accounts payable management",
          "Multi-entity bookkeeping",
        ],
        applicableIndustries: undefined,
        isActive: true,
        subscriberCount: 0,
        createdAt: Date.now(),
      },
      {
        name: "Genius Eye Mail",
        slug: "genius-eye-mail",
        description: "Business email platform powered by AI. Custom domain email accounts, AI-native inbox, smart sorting, spam filtering. AI agents send and receive through your business domain.",
        category: "core",
        icon: "mail",
        connectorSlug: "genius-eye-mail",
        pricingStarter: 29,
        pricingPro: 79,
        pricingEnterprise: 199,
        features: [
          "Custom domain email (you@yourbusiness.com)",
          "AI-powered inbox sorting",
          "Smart spam filtering",
          "AI compose & reply suggestions",
          "Shared team inboxes",
          "Email forwarding & aliases",
          "25GB storage per mailbox",
          "Agent email integration (AI sends from your domain)",
        ],
        applicableIndustries: undefined,
        isActive: true,
        subscriberCount: 0,
        createdAt: Date.now(),
      },
      {
        name: "YouKnowNow",
        slug: "youknownow",
        description: "AI-powered background checks and risk scoring. Criminal records, employment verification, education verification, credit checks, identity verification. Results in under 10 seconds.",
        category: "core",
        icon: "shield-check",
        connectorSlug: "youknownow",
        pricingStarter: 49,
        pricingPro: 149,
        pricingEnterprise: 399,
        features: [
          "Criminal background checks",
          "Employment verification",
          "Education verification",
          "Credit checks",
          "Identity verification",
          "AI risk scoring",
          "Continuous monitoring alerts",
          "Batch processing (bulk checks)",
        ],
        applicableIndustries: undefined,
        isActive: true,
        subscriberCount: 0,
        createdAt: Date.now(),
      },
      {
        name: "G-Sign",
        slug: "gsign",
        description: "Electronic document signing. Create signature envelopes, send for signing, track status, download completed documents. DocuSign alternative owned by TRG.",
        category: "core",
        icon: "pen-tool",
        connectorSlug: "gsign",
        pricingStarter: 19,
        pricingPro: 49,
        pricingEnterprise: 149,
        features: [
          "Unlimited signature requests",
          "Reusable document templates",
          "Multi-signer workflows",
          "Audit trail & compliance",
          "Mobile signing support",
          "API integration with all platforms",
          "Bulk send capability",
          "Custom branding on envelopes",
        ],
        applicableIndustries: undefined,
        isActive: true,
        subscriberCount: 0,
        createdAt: Date.now(),
      },
      {
        name: "SealProof",
        slug: "sealproof",
        description: "Remote online notarization. Schedule a notary session, verify identity, notarize documents via live video, generate certificates. Fully compliant with state regulations.",
        category: "core",
        icon: "stamp",
        connectorSlug: "sealproof",
        pricingStarter: 25,
        pricingPro: 99,
        pricingEnterprise: 299,
        features: [
          "On-demand remote notarization",
          "Identity verification (KBA + ID scan)",
          "Live video notary sessions",
          "Digital certificate generation",
          "Full audit trail",
          "Multi-state compliance",
          "Bulk notarization scheduling",
          "API integration for embedded notarization",
        ],
        applicableIndustries: undefined,
        isActive: true,
        subscriberCount: 0,
        createdAt: Date.now(),
      },
    ];

    let seeded = 0;
    for (const s of services) {
      const existing = await ctx.db.query("addOnServices")
        .withIndex("by_slug", q => q.eq("slug", s.slug))
        .first();
      if (!existing) {
        await ctx.db.insert("addOnServices", s);
        seeded++;
      }
    }
    return { seeded, total: services.length };
  },
});

// ─── Seed Demo Subscriptions ───
export const seedDemoSubscriptions = mutation({
  args: {},
  handler: async (ctx) => {
    const services = await ctx.db.query("addOnServices").collect();
    if (services.length === 0) return { seeded: 0 };

    const existing = await ctx.db.query("clientServiceSubscriptions").first();
    if (existing) return { seeded: 0, message: "Subscriptions already seeded" };

    const demoClients = [
      { orgId: "comfort-air-hvac", orgName: "Comfort Air HVAC" },
      { orgId: "bella-cucina", orgName: "Bella Cucina Restaurant" },
      { orgId: "lakewood-family-med", orgName: "Lakewood Family Medicine" },
      { orgId: "premier-plumbing", orgName: "Premier Plumbing Co" },
      { orgId: "bright-smile-dental", orgName: "Bright Smile Dental" },
      { orgId: "carolina-electric", orgName: "Carolina Electric" },
      { orgId: "fresh-cuts-barber", orgName: "Fresh Cuts Barbershop" },
      { orgId: "summit-construction", orgName: "Summit Construction" },
    ];

    const serviceMap = Object.fromEntries(services.map(s => [s.slug, s]));
    let seeded = 0;
    const now = Date.now();

    // Each client gets a realistic mix of add-ons
    const subscriptions: Array<{ client: typeof demoClients[0]; slug: string; tier: string }> = [
      // Comfort Air HVAC - needs HR, bookkeeping, email, e-sign, background checks
      { client: demoClients[0], slug: "stewart-solution", tier: "pro" },
      { client: demoClients[0], slug: "stewart-money", tier: "pro" },
      { client: demoClients[0], slug: "genius-eye-mail", tier: "pro" },
      { client: demoClients[0], slug: "gsign", tier: "starter" },
      { client: demoClients[0], slug: "youknownow", tier: "pro" },

      // Bella Cucina - bookkeeping, email, e-sign
      { client: demoClients[1], slug: "stewart-money", tier: "starter" },
      { client: demoClients[1], slug: "genius-eye-mail", tier: "starter" },
      { client: demoClients[1], slug: "gsign", tier: "starter" },

      // Lakewood Family Medicine - full suite
      { client: demoClients[2], slug: "stewart-solution", tier: "enterprise" },
      { client: demoClients[2], slug: "stewart-money", tier: "enterprise" },
      { client: demoClients[2], slug: "genius-eye-mail", tier: "pro" },
      { client: demoClients[2], slug: "youknownow", tier: "enterprise" },
      { client: demoClients[2], slug: "gsign", tier: "pro" },
      { client: demoClients[2], slug: "sealproof", tier: "pro" },

      // Premier Plumbing - HR, bookkeeping, background checks
      { client: demoClients[3], slug: "stewart-solution", tier: "starter" },
      { client: demoClients[3], slug: "stewart-money", tier: "pro" },
      { client: demoClients[3], slug: "youknownow", tier: "starter" },
      { client: demoClients[3], slug: "genius-eye-mail", tier: "starter" },

      // Bright Smile Dental - bookkeeping, email, e-sign, notary
      { client: demoClients[4], slug: "stewart-money", tier: "pro" },
      { client: demoClients[4], slug: "genius-eye-mail", tier: "pro" },
      { client: demoClients[4], slug: "gsign", tier: "pro" },
      { client: demoClients[4], slug: "sealproof", tier: "starter" },

      // Carolina Electric - HR, bookkeeping, background checks
      { client: demoClients[5], slug: "stewart-solution", tier: "pro" },
      { client: demoClients[5], slug: "stewart-money", tier: "pro" },
      { client: demoClients[5], slug: "youknownow", tier: "pro" },
      { client: demoClients[5], slug: "genius-eye-mail", tier: "starter" },

      // Fresh Cuts - bookkeeping, email
      { client: demoClients[6], slug: "stewart-money", tier: "starter" },
      { client: demoClients[6], slug: "genius-eye-mail", tier: "starter" },

      // Summit Construction - full suite
      { client: demoClients[7], slug: "stewart-solution", tier: "enterprise" },
      { client: demoClients[7], slug: "stewart-money", tier: "enterprise" },
      { client: demoClients[7], slug: "youknownow", tier: "enterprise" },
      { client: demoClients[7], slug: "genius-eye-mail", tier: "pro" },
      { client: demoClients[7], slug: "gsign", tier: "pro" },
      { client: demoClients[7], slug: "sealproof", tier: "pro" },
    ];

    for (const sub of subscriptions) {
      const svc = serviceMap[sub.slug];
      if (!svc) continue;
      const price = sub.tier === "starter"
        ? svc.pricingStarter
        : sub.tier === "pro"
          ? svc.pricingPro
          : svc.pricingEnterprise;

      await ctx.db.insert("clientServiceSubscriptions", {
        orgId: sub.client.orgId,
        orgName: sub.client.orgName,
        serviceId: svc._id,
        serviceSlug: svc.slug,
        serviceName: svc.name,
        tier: sub.tier,
        status: "active",
        monthlyPrice: price ?? 0,
        activatedAt: now - Math.floor(Math.random() * 30 * 86400000),
        cancelledAt: undefined,
        lastBilledAt: now - Math.floor(Math.random() * 7 * 86400000),
        usageThisMonth: Math.floor(Math.random() * 500),
        usageLimit: sub.tier === "starter" ? 100 : sub.tier === "pro" ? 500 : undefined,
        notes: undefined,
      });

      await ctx.db.patch(svc._id, { subscriberCount: svc.subscriberCount + 1 });
      seeded++;
    }

    return { seeded };
  },
});
