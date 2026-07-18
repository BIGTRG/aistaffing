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

  // ── Quotes ──
  quotes: defineTable({
    orgId: v.optional(v.id("organizations")),
    businessName: v.string(),
    industry: v.string(),
    contactEmail: v.optional(v.string()),
    contactPhone: v.optional(v.string()),
    lineItems: v.any(), // array of line items with pricing
    totalMonthlyCents: v.number(),
    humanEquivalentCents: v.number(),
    savingsCents: v.number(),
    status: v.string(), // draft | sent | accepted | expired
    createdAt: v.number(),
    expiresAt: v.number(),
  })
    .index("by_org", ["orgId"])
    .index("by_status", ["status"]),

  // ── Stripe / Payment ──
  stripeEvents: defineTable({
    stripeEventId: v.string(),
    type: v.string(),
    data: v.any(),
    processedAt: v.number(),
  })
    .index("by_event_id", ["stripeEventId"]),

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

  // ══════════════════════════════════════════════════
  // ENTERPRISE PLATFORM TABLES
  // ══════════════════════════════════════════════════

  // ── Industry Verticals ──
  industries: defineTable({
    name: v.string(),
    slug: v.string(),
    icon: v.string(),           // lucide icon name
    description: v.string(),
    category: v.string(),       // original | expanded | creative
    multiplier: v.number(),     // pricing multiplier (e.g. 1.5 for healthcare)
    platformIds: v.array(v.string()), // which platforms this industry uses (platform slugs)
    features: v.array(v.string()),    // industry-specific features
    isActive: v.boolean(),
    sortOrder: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_category", ["category"])
    .index("by_active", ["isActive"]),

  // ── Core Platforms ──
  corePlatforms: defineTable({
    name: v.string(),
    slug: v.string(),
    icon: v.string(),
    description: v.string(),
    evolvesFrom: v.optional(v.string()),  // e.g. "Stewards Solution"
    features: v.array(v.string()),
    aiAgents: v.array(v.string()),        // AI agents embedded in this platform
    starterPriceCents: v.number(),        // monthly price in cents
    proPriceCents: v.number(),
    enterprisePriceCents: v.number(),
    isActive: v.boolean(),
    sortOrder: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_active", ["isActive"]),

  // ── Onboarding Sessions (AI Workflow Builder Agent) ──
  onboardingSessions: defineTable({
    clientName: v.string(),
    clientEmail: v.optional(v.string()),
    clientPhone: v.optional(v.string()),
    detectedIndustry: v.optional(v.string()),     // slug from industries table
    detectedPlatforms: v.optional(v.array(v.string())), // platform slugs
    businessSize: v.optional(v.string()),          // solo | small | medium | large
    painPoints: v.optional(v.array(v.string())),
    automationGoals: v.optional(v.array(v.string())),
    answers: v.optional(v.any()),                  // structured answers from conversation
    status: v.string(),                            // intake | analyzing | workflow_generated | deployed | abandoned
    generatedWorkflowId: v.optional(v.id("workflowTemplates")),
    generatedWorkflowPreview: v.optional(v.any()), // preview before deploy
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_status", ["status"])
    .index("by_industry", ["detectedIndustry"])
    .index("by_created", ["createdAt"]),

  onboardingMessages: defineTable({
    sessionId: v.id("onboardingSessions"),
    role: v.string(),                              // agent | client | system
    content: v.string(),
    metadata: v.optional(v.any()),                 // e.g. detected intent, extracted data
    timestamp: v.number(),
  })
    .index("by_session", ["sessionId"])
    .index("by_session_time", ["sessionId", "timestamp"]),

  // ── Workflow Templates ──
  workflowTemplates: defineTable({
    name: v.string(),
    industrySlug: v.optional(v.string()),  // null = universal template
    platformSlug: v.string(),              // which platform this workflow lives in
    description: v.string(),
    triggerType: v.string(),               // manual | event | schedule | api
    triggerDescription: v.string(),
    steps: v.array(v.object({
      order: v.number(),
      name: v.string(),
      type: v.string(),                   // action | condition | delay | human_review | api_call | ai_agent
      description: v.string(),
      config: v.optional(v.any()),
    })),
    isActive: v.boolean(),
    isTemplate: v.boolean(),              // true = available as starter template
  })
    .index("by_industry", ["industrySlug"])
    .index("by_platform", ["platformSlug"])
    .index("by_active", ["isActive"]),
  // ══════════════════════════════════════════════════
  // AI GATEWAY
  // ══════════════════════════════════════════════════

  gatewayRequests: defineTable({
    channel: v.string(),        // voice | chat | email | sms | workflow | api
    orgId: v.optional(v.string()),
    agentId: v.optional(v.string()),
    payload: v.any(),
    priority: v.string(),       // low | normal | high | urgent
    status: v.string(),         // received | processing | completed | failed
    metadata: v.optional(v.any()),
    responsePayload: v.optional(v.any()),
    errorMessage: v.optional(v.string()),
    latencyMs: v.optional(v.number()),
    serviceConnectorsUsed: v.optional(v.array(v.string())),
    createdAt: v.number(),
    completedAt: v.optional(v.number()),
  })
    .index("by_channel", ["channel"])
    .index("by_status", ["status"])
    .index("by_org", ["orgId"])
    .index("by_created", ["createdAt"]),

  serviceConnectors: defineTable({
    name: v.string(),
    slug: v.string(),
    type: v.string(),           // esign | background_check | notary | payment | voice | email | sms | crm | custom
    baseUrl: v.string(),
    authType: v.string(),       // api_key | oauth2 | bearer | hmac
    description: v.string(),
    capabilities: v.array(v.string()),
    isActive: v.boolean(),
    requestCount: v.number(),
    lastUsedAt: v.optional(v.number()),
    avgLatencyMs: v.number(),
    errorRate: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_type", ["type"])
    .index("by_active", ["isActive"]),

  // ══════════════════════════════════════════════════
  // VOICE AI AGENT ENGINE
  // ══════════════════════════════════════════════════

  voiceCalls: defineTable({
    orgId: v.optional(v.string()),
    direction: v.string(),       // inbound | outbound
    phoneNumber: v.string(),
    agentName: v.string(),
    agentIndustry: v.string(),
    voicePersona: v.any(),
    status: v.string(),          // ringing | connected | on_hold | completed | ended | failed
    purpose: v.optional(v.string()),
    startedAt: v.number(),
    endedAt: v.optional(v.number()),
    durationSeconds: v.optional(v.number()),
    transcript: v.array(v.object({
      role: v.string(),
      content: v.string(),
      timestamp: v.number(),
    })),
    sentiment: v.optional(v.string()),    // positive | neutral | negative
    outcome: v.optional(v.string()),      // resolved | appointment_booked | sale | transfer | voicemail | missed
    escalatedToHuman: v.boolean(),
    recordingUrl: v.optional(v.string()),
    summary: v.optional(v.string()),
    metadata: v.optional(v.any()),
  })
    .index("by_org", ["orgId"])
    .index("by_status", ["status"])
    .index("by_industry", ["agentIndustry"])
    .index("by_started", ["startedAt"]),

  // ══════════════════════════════════════════════════
  // EMAIL & SMS AUTOMATION
  // ══════════════════════════════════════════════════

  emailMessages: defineTable({
    orgId: v.optional(v.string()),
    to: v.string(),
    subject: v.string(),
    body: v.string(),
    templateId: v.optional(v.string()),
    status: v.string(),          // queued | scheduled | sent | delivered | opened | clicked | bounced | failed
    scheduledFor: v.optional(v.number()),
    sentAt: v.optional(v.number()),
    openedAt: v.optional(v.number()),
    clickedAt: v.optional(v.number()),
    bouncedAt: v.optional(v.number()),
    sequenceId: v.optional(v.string()),
    sequenceStep: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_org", ["orgId"])
    .index("by_status", ["status"])
    .index("by_created", ["createdAt"]),

  smsMessages: defineTable({
    orgId: v.optional(v.string()),
    to: v.string(),
    message: v.string(),
    mediaUrl: v.optional(v.string()),
    direction: v.string(),       // inbound | outbound
    status: v.string(),          // queued | sent | delivered | failed
    campaignId: v.optional(v.string()),
    isOptInConfirmation: v.boolean(),
    sentAt: v.optional(v.number()),
    deliveredAt: v.optional(v.number()),
    failedAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_org", ["orgId"])
    .index("by_status", ["status"])
    .index("by_created", ["createdAt"]),

  emailSequences: defineTable({
    orgId: v.optional(v.string()),
    name: v.string(),
    triggerEvent: v.string(),
    steps: v.array(v.object({
      delayHours: v.number(),
      templateId: v.string(),
      subject: v.string(),
      body: v.string(),
      channel: v.string(),
    })),
    isActive: v.boolean(),
    enrolledCount: v.number(),
    completedCount: v.number(),
    createdAt: v.number(),
  })
    .index("by_org", ["orgId"])
    .index("by_active", ["isActive"]),

  // ══════════════════════════════════════════════════
  // ENTERPRISE AUTH & RBAC
  // ══════════════════════════════════════════════════

  enterpriseUsers: defineTable({
    userId: v.string(),
    email: v.string(),
    name: v.string(),
    role: v.string(),            // super_admin | agency_admin | client_admin | client_user | viewer
    orgId: v.optional(v.string()),
    permissions: v.array(v.string()),
    isActive: v.boolean(),
    lastLoginAt: v.optional(v.number()),
    invitedBy: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_email", ["email"])
    .index("by_role", ["role"])
    .index("by_org", ["orgId"])
    .index("by_user", ["userId"]),

  apiKeys: defineTable({
    name: v.string(),
    keyHash: v.string(),
    keyPrefix: v.string(),
    orgId: v.optional(v.string()),
    permissions: v.array(v.string()),
    isActive: v.boolean(),
    lastUsedAt: v.optional(v.number()),
    usageCount: v.number(),
    expiresAt: v.optional(v.number()),
    createdBy: v.string(),
    createdAt: v.number(),
  })
    .index("by_hash", ["keyHash"])
    .index("by_org", ["orgId"])
    .index("by_active", ["isActive"]),

  auditLog: defineTable({
    userId: v.string(),
    action: v.string(),
    resource: v.string(),
    resourceId: v.optional(v.any()),
    details: v.optional(v.any()),
    ipAddress: v.optional(v.string()),
    timestamp: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_action", ["action"])
    .index("by_timestamp", ["timestamp"]),

  // ══════════════════════════════════════════════════
  // AI AGENT WORKFORCE MANAGEMENT
  // ══════════════════════════════════════════════════

  // ── Staff Agents (individual AI employees) ──
  staffAgents: defineTable({
    agentId: v.string(),           // e.g. "AGT-0001"
    name: v.string(),              // "Sarah Mitchell"
    role: v.string(),              // "Front Desk Receptionist"
    department: v.string(),        // front_desk | sales | admin_ops | marketing | support | finance
    industry: v.string(),          // industry slug this agent specializes in
    assignedOrgId: v.optional(v.string()),   // which client org they're assigned to
    assignedOrgName: v.optional(v.string()), // client name for quick display
    status: v.string(),            // active | paused | training | maintenance | terminated
    avatar: v.string(),            // initials or emoji
    hireDate: v.number(),          // when this agent was created/deployed
    lastActiveAt: v.optional(v.number()),
    totalTasksCompleted: v.number(),
    totalHoursWorked: v.number(),
    performanceScore: v.number(),  // 0-100
    utilizationRate: v.number(),   // 0-100 percentage
    responseTimeAvgMs: v.number(), // average response time
    escalationRate: v.number(),    // percentage of tasks escalated to human
    currentShiftStart: v.optional(v.number()),
    bio: v.optional(v.string()),
    personalityTraits: v.optional(v.array(v.string())),
    voiceId: v.optional(v.string()),
    metadata: v.optional(v.any()),
  })
    .index("by_agentId", ["agentId"])
    .index("by_status", ["status"])
    .index("by_department", ["department"])
    .index("by_industry", ["industry"])
    .index("by_org", ["assignedOrgId"])
    .index("by_performance", ["performanceScore"]),

  // ── Skill Catalog (master list of all available skills) ──
  skillCatalog: defineTable({
    name: v.string(),
    slug: v.string(),
    category: v.string(),          // communication | scheduling | sales | finance | admin | technical | industry_specific
    description: v.string(),
    industrySpecific: v.optional(v.string()), // null = universal, or industry slug
    difficulty: v.string(),        // basic | intermediate | advanced | expert
    trainingTimeHours: v.number(), // how long to "train" an agent on this skill
    prerequisites: v.array(v.string()),      // skill slugs required first
    isActive: v.boolean(),
  })
    .index("by_slug", ["slug"])
    .index("by_category", ["category"])
    .index("by_industry", ["industrySpecific"]),

  // ── Agent Skills (skills assigned to each agent) ──
  agentSkills: defineTable({
    agentId: v.string(),           // staffAgent agentId
    skillSlug: v.string(),
    skillName: v.string(),
    proficiency: v.number(),       // 0-100
    status: v.string(),            // active | training | requested | disabled
    assignedAt: v.number(),
    lastUsedAt: v.optional(v.number()),
    usageCount: v.number(),
    errorRate: v.number(),         // percentage
  })
    .index("by_agent", ["agentId"])
    .index("by_skill", ["skillSlug"])
    .index("by_agent_skill", ["agentId", "skillSlug"])
    .index("by_status", ["status"]),

  // ── Agent Activity Log (every action an agent takes) ──
  agentActivityLog: defineTable({
    agentId: v.string(),
    agentName: v.string(),
    activityType: v.string(),      // call_handled | email_sent | appointment_booked | invoice_created | lead_captured | escalation | skill_used | message_sent | report_generated | crm_update | payment_processed
    category: v.string(),          // communication | sales | admin | support | finance
    title: v.string(),
    description: v.string(),
    outcome: v.string(),           // success | partial | failed | escalated | pending
    durationMs: v.optional(v.number()),
    skillUsed: v.optional(v.string()),
    clientId: v.optional(v.string()),
    clientName: v.optional(v.string()),
    metadata: v.optional(v.any()),
    timestamp: v.number(),
  })
    .index("by_agent", ["agentId"])
    .index("by_type", ["activityType"])
    .index("by_agent_time", ["agentId", "timestamp"])
    .index("by_timestamp", ["timestamp"])
    .index("by_outcome", ["outcome"]),

  // ── Agent Shifts (daily duty records) ──
  agentShifts: defineTable({
    agentId: v.string(),
    agentName: v.string(),
    date: v.string(),              // "2026-07-14"
    shiftStart: v.number(),
    shiftEnd: v.optional(v.number()),
    status: v.string(),            // on_duty | off_duty | break | maintenance
    tasksCompleted: v.number(),
    callsHandled: v.number(),
    emailsSent: v.number(),
    appointmentsBooked: v.number(),
    leadsGenerated: v.number(),
    escalations: v.number(),
    avgResponseTimeMs: v.number(),
    utilization: v.number(),       // 0-100
    notes: v.optional(v.string()),
  })
    .index("by_agent", ["agentId"])
    .index("by_date", ["date"])
    .index("by_agent_date", ["agentId", "date"]),

  // ── Agent Messages (internal comms between agents and agency) ──
  agentMessages: defineTable({
    messageId: v.string(),         // "MSG-0001"
    fromAgentId: v.optional(v.string()),     // null if from agency
    fromName: v.string(),
    toAgentId: v.optional(v.string()),       // null if to agency
    toName: v.string(),
    direction: v.string(),         // agent_to_agency | agency_to_agent | system
    type: v.string(),              // skill_request | escalation | status_update | question | alert | performance_review | task_report | anomaly
    priority: v.string(),          // low | normal | high | urgent
    subject: v.string(),
    body: v.string(),
    status: v.string(),            // unread | read | replied | resolved | archived
    relatedSkill: v.optional(v.string()),
    relatedActivity: v.optional(v.string()),
    replyToId: v.optional(v.string()),
    timestamp: v.number(),
    readAt: v.optional(v.number()),
    resolvedAt: v.optional(v.number()),
  })
    .index("by_from", ["fromAgentId"])
    .index("by_to", ["toAgentId"])
    .index("by_type", ["type"])
    .index("by_status", ["status"])
    .index("by_priority", ["priority"])
    .index("by_timestamp", ["timestamp"])
    .index("by_direction", ["direction"]),

  // ── Skill Requests (formal requests for new skills) ──
  skillRequests: defineTable({
    requestId: v.string(),         // "REQ-0001"
    agentId: v.string(),
    agentName: v.string(),
    skillSlug: v.string(),
    skillName: v.string(),
    reason: v.string(),
    clientId: v.optional(v.string()),
    clientName: v.optional(v.string()),
    status: v.string(),            // pending | approved | in_training | completed | denied
    priority: v.string(),          // low | normal | high | urgent
    estimatedTrainingHours: v.number(),
    approvedBy: v.optional(v.string()),
    approvedAt: v.optional(v.number()),
    completedAt: v.optional(v.number()),
    denialReason: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_agent", ["agentId"])
    .index("by_status", ["status"])
    .index("by_skill", ["skillSlug"])
    .index("by_created", ["createdAt"]),

  // ══════════════════════════════════════════════════
  // ADD-ON SERVICES (TRG Product Integrations)
  // ══════════════════════════════════════════════════
  addOnServices: defineTable({
    name: v.string(),
    slug: v.string(),
    description: v.string(),
    category: v.string(),           // core | industry | premium
    icon: v.string(),               // emoji or icon name
    connectorSlug: v.optional(v.string()), // links to serviceConnectors
    pricingStarter: v.optional(v.number()),
    pricingPro: v.optional(v.number()),
    pricingEnterprise: v.optional(v.number()),
    features: v.array(v.string()),
    applicableIndustries: v.optional(v.array(v.string())), // null = all industries
    isActive: v.boolean(),
    subscriberCount: v.number(),
    createdAt: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_category", ["category"])
    .index("by_active", ["isActive"]),

  clientServiceSubscriptions: defineTable({
    orgId: v.string(),
    orgName: v.string(),
    serviceId: v.id("addOnServices"),
    serviceSlug: v.string(),
    serviceName: v.string(),
    tier: v.string(),               // starter | pro | enterprise
    status: v.string(),             // active | paused | cancelled | trial
    monthlyPrice: v.number(),
    activatedAt: v.number(),
    cancelledAt: v.optional(v.number()),
    lastBilledAt: v.optional(v.number()),
    usageThisMonth: v.optional(v.number()),
    usageLimit: v.optional(v.number()),
    notes: v.optional(v.string()),
  })
    .index("by_org", ["orgId"])
    .index("by_service", ["serviceId"])
    .index("by_status", ["status"])
    .index("by_slug", ["serviceSlug"]),
});

export default schema;
