import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// ── Queries ──

export const list = query({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("corePlatforms").collect();
    return all.sort((a, b) => a.sortOrder - b.sortOrder);
  },
});

export const listActive = query({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db
      .query("corePlatforms")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .collect();
    return all.sort((a, b) => a.sortOrder - b.sortOrder);
  },
});

export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    return await ctx.db
      .query("corePlatforms")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .first();
  },
});

export const stats = query({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("corePlatforms").collect();
    const active = all.filter((p) => p.isActive);
    const totalFeatures = all.reduce((sum, p) => sum + p.features.length, 0);
    const totalAgents = all.reduce((sum, p) => sum + p.aiAgents.length, 0);
    return {
      total: all.length,
      active: active.length,
      totalFeatures,
      totalAgents,
    };
  },
});

// ── Mutations ──

export const update = mutation({
  args: {
    id: v.id("corePlatforms"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    features: v.optional(v.array(v.string())),
    aiAgents: v.optional(v.array(v.string())),
    starterPriceCents: v.optional(v.number()),
    proPriceCents: v.optional(v.number()),
    enterprisePriceCents: v.optional(v.number()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, { id, ...fields }) => {
    const updates: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(fields)) {
      if (value !== undefined) updates[key] = value;
    }
    await ctx.db.patch(id, updates);
  },
});

export const toggleActive = mutation({
  args: { id: v.id("corePlatforms") },
  handler: async (ctx, { id }) => {
    const platform = await ctx.db.get(id);
    if (!platform) throw new Error("Platform not found");
    await ctx.db.patch(id, { isActive: !platform.isActive });
  },
});

export const updatePricing = mutation({
  args: {
    id: v.id("corePlatforms"),
    starterPriceCents: v.number(),
    proPriceCents: v.number(),
    enterprisePriceCents: v.number(),
  },
  handler: async (ctx, { id, ...pricing }) => {
    await ctx.db.patch(id, pricing);
  },
});

// ── Seed ──

export const seed = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("corePlatforms").first();
    if (existing) return "already_seeded";

    const platforms = [
      {
        name: "CRM Platform",
        slug: "crm",
        icon: "Users",
        description: "Complete customer relationship management. Contacts, pipelines, email engine, social media integration, reporting.",
        evolvesFrom: "TRG CRM",
        features: [
          "Contact & company management",
          "Sales pipeline with drag-and-drop",
          "Email engine (sequences + templates)",
          "Social media integration",
          "Lead scoring & qualification",
          "Custom reports & dashboards",
          "Task & activity management",
          "API integrations",
        ],
        aiAgents: ["Lead Qualifier", "Follow-up Agent", "Pipeline Monitor", "Email Drafter"],
        starterPriceCents: 30000,
        proPriceCents: 100000,
        enterprisePriceCents: 200000,
        sortOrder: 1,
      },
      {
        name: "HR & Recruitment Platform",
        slug: "hr-recruitment",
        icon: "UserCheck",
        description: "Full HR suite with integrated recruitment. Employee records, payroll bridge, tax services, bookkeeping, credential validation.",
        evolvesFrom: "Stewards Solution",
        features: [
          "Employee records & PTO",
          "Recruiting engine (W-2 + 1099)",
          "Job posting & applicant tracking",
          "Payroll processing (Stewards Money API)",
          "Tax services (AI-driven)",
          "Bookkeeping services",
          "Credential validation & monitoring",
          "50-state compliance",
          "Grievance & benefits management",
          "Onboarding workflows",
        ],
        aiAgents: ["Recruiter Agent", "Onboarding Agent", "Compliance Monitor", "Payroll Processor", "Employee Assistant"],
        starterPriceCents: 50000,
        proPriceCents: 200000,
        enterprisePriceCents: 400000,
        sortOrder: 2,
      },
      {
        name: "Finance Platform",
        slug: "finance",
        icon: "DollarSign",
        description: "Full financial operations. Invoicing, bookkeeping, reporting, tax prep, payroll, payment processing.",
        evolvesFrom: "Stewards Money",
        features: [
          "Invoicing & billing",
          "Bookkeeping automation",
          "Financial reporting",
          "Tax preparation",
          "Payroll processing",
          "Payment processing (TRG Pay / Cash Now)",
          "P2P transfers",
          "Expense tracking",
          "Revenue recognition",
        ],
        aiAgents: ["Bookkeeper Agent", "Invoice Agent", "Tax Agent", "Collections Agent"],
        starterPriceCents: 40000,
        proPriceCents: 150000,
        enterprisePriceCents: 300000,
        sortOrder: 3,
      },
      {
        name: "Legal Intelligence Platform",
        slug: "legal",
        icon: "Scale",
        description: "AI-powered legal operations. Contracts, document vault, legal research, due diligence, compliance tracking.",
        evolvesFrom: "Michael AI",
        features: [
          "Contract management & drafting",
          "Document vault & search",
          "Legal research assistant",
          "Due diligence automation",
          "Compliance tracking",
          "E-signature integration",
          "Billable hours tracking",
          "Case management",
        ],
        aiAgents: ["Contract Drafter", "Legal Reviewer", "Research Assistant", "Compliance Scanner"],
        starterPriceCents: 60000,
        proPriceCents: 250000,
        enterprisePriceCents: 500000,
        sortOrder: 4,
      },
      {
        name: "Background Check & Risk Platform",
        slug: "background-check",
        icon: "ShieldCheck",
        description: "Instant screening with AI risk analysis. Background checks, continuous monitoring, batch processing, API-first.",
        evolvesFrom: "YouKnowNow",
        features: [
          "Instant background checks",
          "AI risk scoring",
          "Continuous monitoring",
          "Batch processing",
          "Criminal records search",
          "Employment verification",
          "Education verification",
          "Credit checks",
          "API-first integration",
        ],
        aiAgents: ["Screening Agent", "Risk Analyzer", "Alert Monitor"],
        starterPriceCents: 20000,
        proPriceCents: 75000,
        enterprisePriceCents: 150000,
        sortOrder: 5,
      },
      {
        name: "AI Workforce Deployment",
        slug: "ai-workforce",
        icon: "Bot",
        description: "The AI Staffing Agency platform. Agent marketplace, multi-channel deployment, performance dashboards, contract management.",
        evolvesFrom: "AI Staffing Agency",
        features: [
          "Agent marketplace & catalog",
          "Multi-channel deployment (phone/email/chat/SMS/social)",
          "Performance dashboards",
          "Contract management",
          "Usage-based billing",
          "Knowledge base management",
          "Voice AI integration",
          "Custom agent training",
        ],
        aiAgents: ["Receptionist", "Sales Agent", "Support Agent", "Scheduler", "Collection Agent"],
        starterPriceCents: 30000,
        proPriceCents: 100000,
        enterprisePriceCents: 200000,
        sortOrder: 6,
      },
    ];

    for (const p of platforms) {
      await ctx.db.insert("corePlatforms", { ...p, isActive: true });
    }
    return "seeded_" + platforms.length;
  },
});
