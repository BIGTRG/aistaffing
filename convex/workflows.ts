import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// ── Queries ──

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("workflowTemplates").collect();
  },
});

export const listByIndustry = query({
  args: { industrySlug: v.string() },
  handler: async (ctx, { industrySlug }) => {
    return await ctx.db
      .query("workflowTemplates")
      .withIndex("by_industry", (q) => q.eq("industrySlug", industrySlug))
      .collect();
  },
});

export const listByPlatform = query({
  args: { platformSlug: v.string() },
  handler: async (ctx, { platformSlug }) => {
    return await ctx.db
      .query("workflowTemplates")
      .withIndex("by_platform", (q) => q.eq("platformSlug", platformSlug))
      .collect();
  },
});

export const stats = query({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("workflowTemplates").collect();
    const active = all.filter((w) => w.isActive);
    const byPlatform: Record<string, number> = {};
    for (const w of all) {
      byPlatform[w.platformSlug] = (byPlatform[w.platformSlug] || 0) + 1;
    }
    return { total: all.length, active: active.length, byPlatform };
  },
});

// ── Mutations ──

export const create = mutation({
  args: {
    name: v.string(),
    industrySlug: v.optional(v.string()),
    platformSlug: v.string(),
    description: v.string(),
    triggerType: v.string(),
    triggerDescription: v.string(),
    steps: v.array(v.object({
      order: v.number(),
      name: v.string(),
      type: v.string(),
      description: v.string(),
      config: v.optional(v.any()),
    })),
    isActive: v.boolean(),
    isTemplate: v.boolean(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("workflowTemplates", args);
  },
});

export const update = mutation({
  args: {
    id: v.id("workflowTemplates"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    triggerType: v.optional(v.string()),
    triggerDescription: v.optional(v.string()),
    steps: v.optional(v.array(v.object({
      order: v.number(),
      name: v.string(),
      type: v.string(),
      description: v.string(),
      config: v.optional(v.any()),
    }))),
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
  args: { id: v.id("workflowTemplates") },
  handler: async (ctx, { id }) => {
    const wf = await ctx.db.get(id);
    if (!wf) throw new Error("Workflow not found");
    await ctx.db.patch(id, { isActive: !wf.isActive });
  },
});

export const remove = mutation({
  args: { id: v.id("workflowTemplates") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});

// ── Seed ──

export const seed = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("workflowTemplates").first();
    if (existing) return "already_seeded";

    const templates = [
      // Insurance
      {
        name: "Insurance Quote-to-Bind",
        industrySlug: "insurance",
        platformSlug: "crm",
        description: "Automated insurance quoting from lead capture through policy binding.",
        triggerType: "event",
        triggerDescription: "New lead submits quote request form",
        steps: [
          { order: 1, name: "Capture Lead", type: "action", description: "AI captures lead info and insurance needs" },
          { order: 2, name: "Risk Assessment", type: "ai_agent", description: "AI analyzes risk profile and pre-qualifies" },
          { order: 3, name: "Multi-Carrier Quote", type: "api_call", description: "Pull quotes from connected carrier APIs" },
          { order: 4, name: "Present Options", type: "action", description: "AI presents top 3 options with comparison" },
          { order: 5, name: "Agent Review", type: "human_review", description: "Human agent reviews before binding" },
          { order: 6, name: "Bind Policy", type: "api_call", description: "Submit binding request to carrier" },
          { order: 7, name: "Welcome Package", type: "action", description: "Send policy docs + welcome email" },
        ],
        isActive: true,
        isTemplate: true,
      },
      // Healthcare
      {
        name: "Patient Intake to Appointment",
        industrySlug: "healthcare",
        platformSlug: "crm",
        description: "Automated patient onboarding from first contact through scheduled appointment.",
        triggerType: "event",
        triggerDescription: "New patient inquiry via phone, web, or chat",
        steps: [
          { order: 1, name: "Capture Info", type: "ai_agent", description: "AI receptionist captures patient info and reason for visit" },
          { order: 2, name: "Insurance Verify", type: "api_call", description: "Verify insurance eligibility in real-time" },
          { order: 3, name: "Match Provider", type: "ai_agent", description: "AI matches patient to best provider based on need" },
          { order: 4, name: "Schedule", type: "action", description: "Book appointment in calendar system" },
          { order: 5, name: "Pre-Visit Forms", type: "action", description: "Send digital intake forms via patient portal" },
          { order: 6, name: "Reminder", type: "delay", description: "24-hour reminder via SMS and email" },
        ],
        isActive: true,
        isTemplate: true,
      },
      // Home Services
      {
        name: "Service Call to Invoice",
        industrySlug: "home-services",
        platformSlug: "crm",
        description: "End-to-end service workflow from customer call through payment collection.",
        triggerType: "event",
        triggerDescription: "Customer calls or submits service request",
        steps: [
          { order: 1, name: "Take Call", type: "ai_agent", description: "AI receptionist captures issue details and urgency" },
          { order: 2, name: "Quote", type: "ai_agent", description: "AI generates estimate based on issue type and history" },
          { order: 3, name: "Dispatch", type: "action", description: "Assign nearest available technician" },
          { order: 4, name: "On-Site", type: "action", description: "Technician checks in, uploads photos" },
          { order: 5, name: "Complete", type: "human_review", description: "Technician marks complete, customer signs off" },
          { order: 6, name: "Invoice", type: "action", description: "Auto-generate and send invoice" },
          { order: 7, name: "Follow-Up", type: "ai_agent", description: "AI sends satisfaction survey + review request" },
        ],
        isActive: true,
        isTemplate: true,
      },
      // HR Recruitment (universal)
      {
        name: "Hire-to-Onboard",
        industrySlug: undefined,
        platformSlug: "hr-recruitment",
        description: "Full recruitment pipeline from job posting through employee onboarding.",
        triggerType: "manual",
        triggerDescription: "Manager creates new job requisition",
        steps: [
          { order: 1, name: "Post Job", type: "action", description: "Publish to job boards and careers page" },
          { order: 2, name: "Screen", type: "ai_agent", description: "AI screens applicants and ranks top candidates" },
          { order: 3, name: "Interview", type: "action", description: "Schedule interviews with top candidates" },
          { order: 4, name: "Background Check", type: "api_call", description: "Initiate check via YouKnowNow API" },
          { order: 5, name: "Offer", type: "human_review", description: "Manager reviews and approves offer letter" },
          { order: 6, name: "E-Sign", type: "action", description: "Send offer for electronic signature" },
          { order: 7, name: "Payroll Setup", type: "api_call", description: "Create employee in payroll system" },
          { order: 8, name: "Onboard", type: "action", description: "Trigger onboarding workflow + welcome package" },
        ],
        isActive: true,
        isTemplate: true,
      },
      // Author workflow
      {
        name: "Book Outline to Manuscript",
        industrySlug: "authors",
        platformSlug: "crm",
        description: "AI-assisted book writing from concept through formatted manuscript.",
        triggerType: "manual",
        triggerDescription: "Author creates new book project",
        steps: [
          { order: 1, name: "Concept Brief", type: "action", description: "Author defines genre, theme, target audience" },
          { order: 2, name: "Character Builder", type: "ai_agent", description: "AI helps develop character profiles and arcs" },
          { order: 3, name: "Chapter Outline", type: "ai_agent", description: "AI generates detailed chapter-by-chapter outline" },
          { order: 4, name: "Draft Chapters", type: "ai_agent", description: "AI fills in gaps, author reviews each chapter" },
          { order: 5, name: "Author Review", type: "human_review", description: "Author edits and approves each section" },
          { order: 6, name: "Format", type: "action", description: "Auto-format manuscript for publishing" },
          { order: 7, name: "Submit", type: "action", description: "Generate submission package for publishers" },
        ],
        isActive: true,
        isTemplate: true,
      },
    ];

    for (const t of templates) {
      await ctx.db.insert("workflowTemplates", t);
    }
    return "seeded_" + templates.length;
  },
});
