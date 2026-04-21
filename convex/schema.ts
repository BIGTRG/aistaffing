import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const schema = defineSchema({
  ...authTables,

  // ── Platform Users (extends auth users) ──
  platformUsers: defineTable({
    userId: v.id("users"),
    role: v.string(), // employer | admin
  })
    .index("by_user", ["userId"])
    .index("by_role", ["role"]),

  // ── Identity ──
  organizations: defineTable({
    name: v.string(),
    slug: v.string(),
    industry: v.string(),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    website: v.optional(v.string()),
    onboardingStatus: v.string(), // pending | onboarding | active | churned
    stripeCustomerId: v.optional(v.string()),
    settings: v.optional(v.any()), // business hours, commission rate, etc.
    ownerId: v.id("users"), // who created this org
  })
    .index("by_slug", ["slug"])
    .index("by_owner", ["ownerId"]),

  orgMembers: defineTable({
    orgId: v.id("organizations"),
    userId: v.id("users"),
    role: v.string(), // owner | admin | member
  })
    .index("by_org", ["orgId"])
    .index("by_user", ["userId"])
    .index("by_org_user", ["orgId", "userId"]),

  // ── Agents ──
  agentTemplates: defineTable({
    name: v.string(),
    department: v.string(), // front_desk | sales | admin_ops | marketing | support | finance | executive
    description: v.string(),
    baseSystemPrompt: v.optional(v.string()),
    defaultPersona: v.optional(v.any()), // { tone, style, vocabulary }
    defaultTools: v.optional(v.array(v.string())),
    pricingModel: v.string(), // flat_monthly | hourly_plus_commission | retainer
    basePriceCents: v.number(),
    voiceId: v.optional(v.string()),
    icon: v.optional(v.string()),
    isActive: v.boolean(),
  })
    .index("by_department", ["department"])
    .index("by_active", ["isActive"]),

  deployments: defineTable({
    orgId: v.id("organizations"),
    templateId: v.id("agentTemplates"),
    displayName: v.string(), // "Sarah" — agent's name for this client
    status: v.string(), // configuring | active | paused | terminated
    systemPrompt: v.optional(v.string()),
    persona: v.optional(v.any()),
    toolsConfig: v.optional(v.any()),
    knowledgeBaseId: v.optional(v.string()),
    vapiAssistantId: v.optional(v.string()),
    twilioNumber: v.optional(v.string()),
    deployedAt: v.optional(v.number()),
    // ── Agent Configuration ──
    config: v.optional(v.object({
      businessHours: v.optional(v.string()),       // e.g. "Mon-Fri 9am-5pm EST"
      services: v.optional(v.string()),             // services offered
      pricing: v.optional(v.string()),              // pricing info
      faqs: v.optional(v.string()),                 // frequently asked questions
      phoneRouting: v.optional(v.string()),         // phone number to route calls to
      websiteUrl: v.optional(v.string()),           // website to pull info from
      customInstructions: v.optional(v.string()),   // custom role instructions
      tone: v.optional(v.string()),                 // professional | friendly | casual | formal
      greeting: v.optional(v.string()),             // custom greeting message
      escalationRules: v.optional(v.string()),      // when to escalate to human
    })),
  })
    .index("by_org", ["orgId"])
    .index("by_org_status", ["orgId", "status"])
    .index("by_template", ["templateId"]),

  // ── Communication ──
  conversations: defineTable({
    orgId: v.id("organizations"),
    deploymentId: v.id("deployments"),
    channel: v.string(), // phone | email | chat | sms
    direction: v.string(), // inbound | outbound
    contactName: v.optional(v.string()),
    contactInfo: v.optional(v.string()),
    summary: v.optional(v.string()),
    outcome: v.optional(v.string()), // resolved | escalated | sale_closed | appointment_booked | follow_up
    durationSeconds: v.optional(v.number()),
    recordingUrl: v.optional(v.string()),
    metadata: v.optional(v.any()),
    startedAt: v.number(),
  })
    .index("by_org", ["orgId"])
    .index("by_deployment", ["deploymentId"])
    .index("by_org_channel", ["orgId", "channel"]),

  messages: defineTable({
    conversationId: v.optional(v.id("conversations")),
    deploymentId: v.optional(v.string()),
    sessionId: v.optional(v.string()),
    role: v.string(), // agent | customer | system | user | assistant
    content: v.string(),
    visitorName: v.optional(v.string()),
    visitorEmail: v.optional(v.string()),
    tokensUsed: v.optional(v.number()),
    sentAt: v.optional(v.number()),
    timestamp: v.optional(v.number()),
  })
    .index("by_conversation", ["conversationId"])
    .index("by_session", ["deploymentId", "sessionId"])
    .index("by_deployment", ["deploymentId"]),

  // ── Billing ──
  contracts: defineTable({
    orgId: v.id("organizations"),
    deploymentId: v.id("deployments"),
    tier: v.string(), // 30_day | 3_month | 6_month
    monthlyRateCents: v.number(),
    hourlyRateCents: v.optional(v.number()),
    commissionPct: v.optional(v.number()),
    agencyCutPct: v.optional(v.number()), // default 0.30
    stripeSubscriptionId: v.optional(v.string()),
    startsAt: v.number(),
    endsAt: v.optional(v.number()),
    autoRenew: v.boolean(),
    status: v.string(), // active | expired | cancelled
  })
    .index("by_org", ["orgId"])
    .index("by_deployment", ["deploymentId"])
    .index("by_status", ["status"]),

  invoices: defineTable({
    orgId: v.id("organizations"),
    stripeInvoiceId: v.optional(v.string()),
    amountCents: v.number(),
    status: v.string(), // draft | open | paid | overdue | void
    periodStart: v.number(),
    periodEnd: v.number(),
    paidAt: v.optional(v.number()),
  })
    .index("by_org", ["orgId"])
    .index("by_status", ["status"]),

  // ── Activity ──
  activityLog: defineTable({
    orgId: v.id("organizations"),
    deploymentId: v.optional(v.id("deployments")),
    eventType: v.string(), // call.completed, email.drafted, sale.closed, agent.deployed, etc.
    title: v.string(),
    details: v.optional(v.any()),
  })
    .index("by_org", ["orgId"])
    .index("by_org_type", ["orgId", "eventType"]),
});

export default schema;
