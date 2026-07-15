import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// ══════════════════════════════════════════════════
// STAFF AGENTS — CRUD + Lifecycle
// ══════════════════════════════════════════════════

export const listAgents = query({
  args: { status: v.optional(v.string()), department: v.optional(v.string()), industry: v.optional(v.string()) },
  handler: async (ctx, args) => {
    let agents;
    if (args.status) {
      agents = await ctx.db.query("staffAgents").withIndex("by_status", (q) => q.eq("status", args.status!)).collect();
    } else if (args.department) {
      agents = await ctx.db.query("staffAgents").withIndex("by_department", (q) => q.eq("department", args.department!)).collect();
    } else if (args.industry) {
      agents = await ctx.db.query("staffAgents").withIndex("by_industry", (q) => q.eq("industry", args.industry!)).collect();
    } else {
      agents = await ctx.db.query("staffAgents").collect();
    }
    return agents;
  },
});

export const getAgent = query({
  args: { agentId: v.string() },
  handler: async (ctx, args) => {
    const agents = await ctx.db.query("staffAgents").withIndex("by_agentId", (q) => q.eq("agentId", args.agentId)).collect();
    return agents[0] ?? null;
  },
});

export const createAgent = mutation({
  args: {
    agentId: v.string(), name: v.string(), role: v.string(), department: v.string(),
    industry: v.string(), assignedOrgId: v.optional(v.string()), assignedOrgName: v.optional(v.string()),
    avatar: v.string(), bio: v.optional(v.string()), personalityTraits: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("staffAgents", {
      ...args,
      status: "active",
      hireDate: Date.now(),
      totalTasksCompleted: 0,
      totalHoursWorked: 0,
      performanceScore: 85,
      utilizationRate: 0,
      responseTimeAvgMs: 450,
      escalationRate: 2.5,
    });
  },
});

export const toggleAgentStatus = mutation({
  args: { agentId: v.string(), status: v.string() },
  handler: async (ctx, args) => {
    const agents = await ctx.db.query("staffAgents").withIndex("by_agentId", (q) => q.eq("agentId", args.agentId)).collect();
    if (agents[0]) {
      await ctx.db.patch(agents[0]._id, {
        status: args.status,
        lastActiveAt: Date.now(),
      });
    }
  },
});

export const updateAgentPerformance = mutation({
  args: { agentId: v.string(), performanceScore: v.optional(v.number()), utilizationRate: v.optional(v.number()),
    responseTimeAvgMs: v.optional(v.number()), escalationRate: v.optional(v.number()),
    totalTasksCompleted: v.optional(v.number()), totalHoursWorked: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const agents = await ctx.db.query("staffAgents").withIndex("by_agentId", (q) => q.eq("agentId", args.agentId)).collect();
    if (agents[0]) {
      const updates: any = { lastActiveAt: Date.now() };
      if (args.performanceScore !== undefined) updates.performanceScore = args.performanceScore;
      if (args.utilizationRate !== undefined) updates.utilizationRate = args.utilizationRate;
      if (args.responseTimeAvgMs !== undefined) updates.responseTimeAvgMs = args.responseTimeAvgMs;
      if (args.escalationRate !== undefined) updates.escalationRate = args.escalationRate;
      if (args.totalTasksCompleted !== undefined) updates.totalTasksCompleted = args.totalTasksCompleted;
      if (args.totalHoursWorked !== undefined) updates.totalHoursWorked = args.totalHoursWorked;
      await ctx.db.patch(agents[0]._id, updates);
    }
  },
});

// ══════════════════════════════════════════════════
// SKILL CATALOG
// ══════════════════════════════════════════════════

export const listSkillCatalog = query({
  args: { category: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (args.category) {
      return await ctx.db.query("skillCatalog").withIndex("by_category", (q) => q.eq("category", args.category!)).collect();
    }
    return await ctx.db.query("skillCatalog").collect();
  },
});

// ══════════════════════════════════════════════════
// AGENT SKILLS — Assignment + Management
// ══════════════════════════════════════════════════

export const getAgentSkills = query({
  args: { agentId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db.query("agentSkills").withIndex("by_agent", (q) => q.eq("agentId", args.agentId)).collect();
  },
});

export const assignSkill = mutation({
  args: { agentId: v.string(), skillSlug: v.string(), skillName: v.string(), proficiency: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const existing = await ctx.db.query("agentSkills")
      .withIndex("by_agent_skill", (q) => q.eq("agentId", args.agentId).eq("skillSlug", args.skillSlug)).collect();
    if (existing.length > 0) {
      await ctx.db.patch(existing[0]._id, { status: "active", proficiency: args.proficiency ?? 80 });
      return existing[0]._id;
    }
    return await ctx.db.insert("agentSkills", {
      agentId: args.agentId,
      skillSlug: args.skillSlug,
      skillName: args.skillName,
      proficiency: args.proficiency ?? 80,
      status: "active",
      assignedAt: Date.now(),
      usageCount: 0,
      errorRate: 0,
    });
  },
});

export const removeSkill = mutation({
  args: { agentId: v.string(), skillSlug: v.string() },
  handler: async (ctx, args) => {
    const skills = await ctx.db.query("agentSkills")
      .withIndex("by_agent_skill", (q) => q.eq("agentId", args.agentId).eq("skillSlug", args.skillSlug)).collect();
    if (skills[0]) {
      await ctx.db.patch(skills[0]._id, { status: "disabled" });
    }
  },
});

export const updateSkillProficiency = mutation({
  args: { agentId: v.string(), skillSlug: v.string(), proficiency: v.number() },
  handler: async (ctx, args) => {
    const skills = await ctx.db.query("agentSkills")
      .withIndex("by_agent_skill", (q) => q.eq("agentId", args.agentId).eq("skillSlug", args.skillSlug)).collect();
    if (skills[0]) {
      await ctx.db.patch(skills[0]._id, { proficiency: args.proficiency });
    }
  },
});

// ══════════════════════════════════════════════════
// ACTIVITY LOG
// ══════════════════════════════════════════════════

export const listActivities = query({
  args: { agentId: v.optional(v.string()), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const lim = args.limit ?? 100;
    if (args.agentId) {
      return await ctx.db.query("agentActivityLog")
        .withIndex("by_agent", (q) => q.eq("agentId", args.agentId!))
        .order("desc").take(lim);
    }
    return await ctx.db.query("agentActivityLog").order("desc").take(lim);
  },
});

export const logActivity = mutation({
  args: {
    agentId: v.string(), agentName: v.string(), activityType: v.string(), category: v.string(),
    title: v.string(), description: v.string(), outcome: v.string(),
    durationMs: v.optional(v.number()), skillUsed: v.optional(v.string()),
    clientId: v.optional(v.string()), clientName: v.optional(v.string()),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("agentActivityLog", { ...args, timestamp: Date.now() });
  },
});

// ══════════════════════════════════════════════════
// SHIFTS
// ══════════════════════════════════════════════════

export const listShifts = query({
  args: { date: v.optional(v.string()), agentId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (args.date) {
      return await ctx.db.query("agentShifts").withIndex("by_date", (q) => q.eq("date", args.date!)).collect();
    }
    if (args.agentId) {
      return await ctx.db.query("agentShifts").withIndex("by_agent", (q) => q.eq("agentId", args.agentId!)).order("desc").take(30);
    }
    return await ctx.db.query("agentShifts").order("desc").take(100);
  },
});

// ══════════════════════════════════════════════════
// INTERNAL MESSAGES
// ══════════════════════════════════════════════════

export const listMessages = query({
  args: { direction: v.optional(v.string()), status: v.optional(v.string()), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const lim = args.limit ?? 50;
    if (args.status) {
      return await ctx.db.query("agentMessages").withIndex("by_status", (q) => q.eq("status", args.status!)).order("desc").take(lim);
    }
    if (args.direction) {
      return await ctx.db.query("agentMessages").withIndex("by_direction", (q) => q.eq("direction", args.direction!)).order("desc").take(lim);
    }
    return await ctx.db.query("agentMessages").order("desc").take(lim);
  },
});

export const sendMessage = mutation({
  args: {
    fromAgentId: v.optional(v.string()), fromName: v.string(),
    toAgentId: v.optional(v.string()), toName: v.string(),
    direction: v.string(), type: v.string(), priority: v.string(),
    subject: v.string(), body: v.string(),
    relatedSkill: v.optional(v.string()), relatedActivity: v.optional(v.string()),
    replyToId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const count = (await ctx.db.query("agentMessages").collect()).length;
    const messageId = `MSG-${String(count + 1).padStart(4, "0")}`;
    return await ctx.db.insert("agentMessages", {
      ...args, messageId, status: "unread", timestamp: Date.now(),
    });
  },
});

export const updateMessageStatus = mutation({
  args: { messageId: v.string(), status: v.string() },
  handler: async (ctx, args) => {
    const messages = await ctx.db.query("agentMessages").collect();
    const msg = messages.find((m) => m.messageId === args.messageId);
    if (msg) {
      const updates: any = { status: args.status };
      if (args.status === "read") updates.readAt = Date.now();
      if (args.status === "resolved") updates.resolvedAt = Date.now();
      await ctx.db.patch(msg._id, updates);
    }
  },
});

// ══════════════════════════════════════════════════
// SKILL REQUESTS
// ══════════════════════════════════════════════════

export const listSkillRequests = query({
  args: { status: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (args.status) {
      return await ctx.db.query("skillRequests").withIndex("by_status", (q) => q.eq("status", args.status!)).order("desc").collect();
    }
    return await ctx.db.query("skillRequests").order("desc").collect();
  },
});

export const updateSkillRequest = mutation({
  args: { requestId: v.string(), status: v.string(), approvedBy: v.optional(v.string()), denialReason: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const reqs = await ctx.db.query("skillRequests").collect();
    const req = reqs.find((r) => r.requestId === args.requestId);
    if (req) {
      const updates: any = { status: args.status };
      if (args.status === "approved") { updates.approvedBy = args.approvedBy ?? "Agency Admin"; updates.approvedAt = Date.now(); }
      if (args.status === "completed") updates.completedAt = Date.now();
      if (args.status === "denied") updates.denialReason = args.denialReason;
      await ctx.db.patch(req._id, updates);
    }
  },
});

// ══════════════════════════════════════════════════
// WORKFORCE STATS (aggregated)
// ══════════════════════════════════════════════════

export const getWorkforceStats = query({
  args: {},
  handler: async (ctx) => {
    const agents = await ctx.db.query("staffAgents").collect();
    const active = agents.filter((a) => a.status === "active");
    const paused = agents.filter((a) => a.status === "paused");
    const training = agents.filter((a) => a.status === "training");
    const activities = await ctx.db.query("agentActivityLog").order("desc").take(500);
    const messages = await ctx.db.query("agentMessages").withIndex("by_status", (q) => q.eq("status", "unread")).collect();
    const pendingRequests = await ctx.db.query("skillRequests").withIndex("by_status", (q) => q.eq("status", "pending")).collect();

    const totalTasks = agents.reduce((sum, a) => sum + a.totalTasksCompleted, 0);
    const avgPerformance = agents.length > 0 ? Math.round(agents.reduce((sum, a) => sum + a.performanceScore, 0) / agents.length) : 0;
    const avgUtilization = active.length > 0 ? Math.round(active.reduce((sum, a) => sum + a.utilizationRate, 0) / active.length) : 0;
    const avgResponseTime = agents.length > 0 ? Math.round(agents.reduce((sum, a) => sum + a.responseTimeAvgMs, 0) / agents.length) : 0;

    // Today's activities
    const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
    const todayActivities = activities.filter((a) => a.timestamp >= todayStart.getTime());

    // Activity by type
    const activityByType: Record<string, number> = {};
    for (const a of activities.slice(0, 200)) {
      activityByType[a.activityType] = (activityByType[a.activityType] ?? 0) + 1;
    }

    return {
      totalAgents: agents.length,
      activeAgents: active.length,
      pausedAgents: paused.length,
      trainingAgents: training.length,
      totalTasks,
      avgPerformance,
      avgUtilization,
      avgResponseTime,
      unreadMessages: messages.length,
      pendingSkillRequests: pendingRequests.length,
      todayActivityCount: todayActivities.length,
      activityByType,
    };
  },
});

// ══════════════════════════════════════════════════
// SEED — Populate demo workforce
// ══════════════════════════════════════════════════

export const seedWorkforce = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if already seeded
    const existing = await ctx.db.query("staffAgents").take(1);
    if (existing.length > 0) return "Already seeded";

    const now = Date.now();
    const day = 86400000;

    // ── 15 Staff Agents across departments and industries ──
    const agents = [
      { agentId: "AGT-0001", name: "Sarah Mitchell", role: "Front Desk Receptionist", department: "front_desk", industry: "hvac", assignedOrgName: "CoolBreeze HVAC", avatar: "SM", bio: "Handles all inbound calls, schedules service appointments, and manages customer inquiries for HVAC companies.", personalityTraits: ["professional", "warm", "efficient"], performanceScore: 96, utilizationRate: 91, totalTasksCompleted: 4280, totalHoursWorked: 1420, responseTimeAvgMs: 340, escalationRate: 1.8 },
      { agentId: "AGT-0002", name: "Marcus Johnson", role: "Sales Development Rep", department: "sales", industry: "insurance", assignedOrgName: "SafeGuard Insurance", avatar: "MJ", bio: "Qualifies leads, books consultations, and follows up with prospects for insurance agencies.", personalityTraits: ["persuasive", "persistent", "knowledgeable"], performanceScore: 92, utilizationRate: 87, totalTasksCompleted: 3150, totalHoursWorked: 1280, responseTimeAvgMs: 420, escalationRate: 3.2 },
      { agentId: "AGT-0003", name: "Elena Rodriguez", role: "Scheduling Coordinator", department: "admin_ops", industry: "healthcare", assignedOrgName: "Sunrise Medical Clinic", avatar: "ER", bio: "Manages patient scheduling, appointment reminders, insurance verification, and patient intake for clinics.", personalityTraits: ["organized", "compassionate", "detail-oriented"], performanceScore: 98, utilizationRate: 94, totalTasksCompleted: 5620, totalHoursWorked: 1560, responseTimeAvgMs: 280, escalationRate: 1.2 },
      { agentId: "AGT-0004", name: "Devon Williams", role: "Dispatch Coordinator", department: "admin_ops", industry: "plumbing", assignedOrgName: "PipeFix Plumbing", avatar: "DW", bio: "Dispatches technicians, manages emergency calls, tracks job completion, and handles customer follow-ups.", personalityTraits: ["calm", "decisive", "multitasker"], performanceScore: 94, utilizationRate: 89, totalTasksCompleted: 3890, totalHoursWorked: 1380, responseTimeAvgMs: 310, escalationRate: 2.1 },
      { agentId: "AGT-0005", name: "Aisha Thompson", role: "Marketing Assistant", department: "marketing", industry: "salon", assignedOrgName: "Luxe Hair Studio", avatar: "AT", bio: "Creates social media content, manages review responses, sends promotional emails, and tracks campaign performance.", personalityTraits: ["creative", "trendy", "analytical"], performanceScore: 90, utilizationRate: 82, totalTasksCompleted: 2740, totalHoursWorked: 1100, responseTimeAvgMs: 520, escalationRate: 4.1 },
      { agentId: "AGT-0006", name: "James Carter", role: "Accounts Receivable Clerk", department: "finance", industry: "construction", assignedOrgName: "BuildRight Construction", avatar: "JC", bio: "Processes invoices, follows up on payments, manages billing disputes, and generates financial reports.", personalityTraits: ["precise", "firm", "thorough"], performanceScore: 93, utilizationRate: 86, totalTasksCompleted: 3420, totalHoursWorked: 1340, responseTimeAvgMs: 380, escalationRate: 2.8 },
      { agentId: "AGT-0007", name: "Olivia Chen", role: "Customer Support Agent", department: "support", industry: "ecommerce", assignedOrgName: "TrendSetters Online", avatar: "OC", bio: "Handles order inquiries, returns, shipping issues, and product questions for e-commerce stores.", personalityTraits: ["patient", "empathetic", "solution-oriented"], performanceScore: 95, utilizationRate: 93, totalTasksCompleted: 6120, totalHoursWorked: 1580, responseTimeAvgMs: 290, escalationRate: 1.5 },
      { agentId: "AGT-0008", name: "Robert Hayes", role: "Fleet Coordinator", department: "admin_ops", industry: "trucking", assignedOrgName: "Southeast Freight Lines", avatar: "RH", bio: "Manages fleet scheduling, driver communication, load assignments, DOT compliance tracking, and route optimization.", personalityTraits: ["organized", "technical", "reliable"], performanceScore: 91, utilizationRate: 88, totalTasksCompleted: 2980, totalHoursWorked: 1260, responseTimeAvgMs: 410, escalationRate: 3.5 },
      { agentId: "AGT-0009", name: "Keisha Brown", role: "Booking Agent", department: "front_desk", industry: "barbershop", assignedOrgName: "Crown Cuts Barbershop", avatar: "KB", bio: "Books appointments, manages walk-in queue, sends reminders, processes payments, and handles customer loyalty program.", personalityTraits: ["friendly", "quick", "organized"], performanceScore: 97, utilizationRate: 90, totalTasksCompleted: 4850, totalHoursWorked: 1440, responseTimeAvgMs: 250, escalationRate: 0.9 },
      { agentId: "AGT-0010", name: "Daniel Park", role: "Order Manager", department: "admin_ops", industry: "restaurant", assignedOrgName: "Spice Route Kitchen", avatar: "DP", bio: "Manages online orders, handles reservations, coordinates delivery logistics, and responds to customer reviews.", personalityTraits: ["fast", "accurate", "courteous"], performanceScore: 94, utilizationRate: 92, totalTasksCompleted: 5340, totalHoursWorked: 1500, responseTimeAvgMs: 320, escalationRate: 1.7 },
      { agentId: "AGT-0011", name: "Victoria Adams", role: "Lead Qualifier", department: "sales", industry: "auto-dealership", assignedOrgName: "Premier Auto Group", avatar: "VA", bio: "Handles inbound leads, qualifies buyers, schedules test drives, and manages follow-up sequences for dealerships.", personalityTraits: ["persuasive", "knowledgeable", "persistent"], performanceScore: 89, utilizationRate: 85, totalTasksCompleted: 2560, totalHoursWorked: 1180, responseTimeAvgMs: 460, escalationRate: 4.5 },
      { agentId: "AGT-0012", name: "Carlos Mendez", role: "Estimate Coordinator", department: "admin_ops", industry: "electrical", assignedOrgName: "BrightSpark Electric", avatar: "CM", bio: "Generates estimates, schedules inspections, manages permits tracking, and handles customer communications.", personalityTraits: ["technical", "precise", "professional"], performanceScore: 92, utilizationRate: 84, totalTasksCompleted: 2890, totalHoursWorked: 1220, responseTimeAvgMs: 400, escalationRate: 3.0 },
      { agentId: "AGT-0013", name: "Jasmine Wright", role: "Virtual Office Manager", department: "admin_ops", industry: "lawn-care", assignedOrgName: "GreenScape Lawn Care", avatar: "JW", bio: "Manages crew scheduling, customer quotes, seasonal service plans, equipment tracking, and invoice follow-ups.", personalityTraits: ["organized", "friendly", "proactive"], performanceScore: 93, utilizationRate: 87, totalTasksCompleted: 3210, totalHoursWorked: 1300, responseTimeAvgMs: 370, escalationRate: 2.4 },
      { agentId: "AGT-0014", name: "Nathan Pierce", role: "Compliance Monitor", department: "support", industry: "healthcare", assignedOrgName: "Sunrise Medical Clinic", avatar: "NP", bio: "Monitors HIPAA compliance, manages document workflows, tracks certifications, and handles audit preparation.", personalityTraits: ["meticulous", "regulatory-focused", "thorough"], performanceScore: 97, utilizationRate: 78, totalTasksCompleted: 1890, totalHoursWorked: 980, responseTimeAvgMs: 550, escalationRate: 5.2 },
      { agentId: "AGT-0015", name: "Mia Torres", role: "Executive Assistant", department: "admin_ops", industry: "marketing-firm", assignedOrgName: "Catalyst Marketing", avatar: "MT", bio: "Manages calendars, prepares meeting briefs, drafts client communications, tracks project deadlines, and handles vendor coordination.", personalityTraits: ["proactive", "articulate", "detail-oriented"], performanceScore: 95, utilizationRate: 91, totalTasksCompleted: 3680, totalHoursWorked: 1360, responseTimeAvgMs: 300, escalationRate: 1.9 },
    ];

    for (const agent of agents) {
      await ctx.db.insert("staffAgents", {
        ...agent,
        status: "active",
        assignedOrgId: `org_${agent.industry}`,
        hireDate: now - (Math.random() * 180 * day),
        lastActiveAt: now - Math.floor(Math.random() * 3600000),
        currentShiftStart: now - Math.floor(Math.random() * 28800000),
      });
    }

    // ── Skill Catalog (42 skills across 7 categories) ──
    const skills = [
      // Communication
      { name: "Inbound Call Handling", slug: "inbound-calls", category: "communication", description: "Answer and route inbound phone calls professionally", difficulty: "basic", trainingTimeHours: 2 },
      { name: "Outbound Calling", slug: "outbound-calls", category: "communication", description: "Make proactive outbound calls for follow-ups, reminders, and sales", difficulty: "intermediate", trainingTimeHours: 4 },
      { name: "Email Composition", slug: "email-compose", category: "communication", description: "Draft and send professional business emails", difficulty: "basic", trainingTimeHours: 1 },
      { name: "SMS/Text Messaging", slug: "sms-messaging", category: "communication", description: "Send and manage SMS conversations with customers", difficulty: "basic", trainingTimeHours: 1 },
      { name: "Live Chat Support", slug: "live-chat", category: "communication", description: "Handle real-time chat conversations on websites", difficulty: "basic", trainingTimeHours: 2 },
      { name: "Review Response Management", slug: "review-response", category: "communication", description: "Respond to Google, Yelp, and social media reviews", difficulty: "intermediate", trainingTimeHours: 3 },
      // Scheduling
      { name: "Appointment Scheduling", slug: "appointment-scheduling", category: "scheduling", description: "Book, reschedule, and cancel appointments", difficulty: "basic", trainingTimeHours: 2 },
      { name: "Dispatch Coordination", slug: "dispatch", category: "scheduling", description: "Assign and route field technicians to job sites", difficulty: "advanced", trainingTimeHours: 8 },
      { name: "Calendar Management", slug: "calendar-mgmt", category: "scheduling", description: "Manage multiple calendars, avoid conflicts, optimize time blocks", difficulty: "intermediate", trainingTimeHours: 3 },
      { name: "Reminder & Follow-up Automation", slug: "reminders", category: "scheduling", description: "Send automated appointment reminders and follow-ups", difficulty: "basic", trainingTimeHours: 2 },
      // Sales
      { name: "Lead Qualification", slug: "lead-qualification", category: "sales", description: "Score and qualify inbound leads based on criteria", difficulty: "intermediate", trainingTimeHours: 4 },
      { name: "Quote Generation", slug: "quote-generation", category: "sales", description: "Generate price quotes and estimates for services", difficulty: "intermediate", trainingTimeHours: 5 },
      { name: "Follow-up Sequences", slug: "follow-up-sequences", category: "sales", description: "Execute multi-touch follow-up campaigns for leads", difficulty: "intermediate", trainingTimeHours: 4 },
      { name: "Upselling & Cross-selling", slug: "upsell-crosssell", category: "sales", description: "Identify and suggest additional services or upgrades", difficulty: "advanced", trainingTimeHours: 6 },
      { name: "Pipeline Management", slug: "pipeline-mgmt", category: "sales", description: "Track and update deals through CRM pipeline stages", difficulty: "intermediate", trainingTimeHours: 4 },
      // Finance
      { name: "Invoice Generation", slug: "invoice-generation", category: "finance", description: "Create and send invoices for completed work", difficulty: "basic", trainingTimeHours: 2 },
      { name: "Payment Processing", slug: "payment-processing", category: "finance", description: "Process credit card and ACH payments via Stripe", difficulty: "intermediate", trainingTimeHours: 3 },
      { name: "Collections Follow-up", slug: "collections", category: "finance", description: "Follow up on overdue invoices and manage payment plans", difficulty: "advanced", trainingTimeHours: 5 },
      { name: "Financial Reporting", slug: "financial-reporting", category: "finance", description: "Generate revenue, expense, and profitability reports", difficulty: "advanced", trainingTimeHours: 6 },
      { name: "Expense Tracking", slug: "expense-tracking", category: "finance", description: "Track and categorize business expenses", difficulty: "basic", trainingTimeHours: 2 },
      // Admin
      { name: "CRM Data Entry", slug: "crm-data-entry", category: "admin", description: "Update and maintain customer records in the CRM", difficulty: "basic", trainingTimeHours: 1 },
      { name: "Document Management", slug: "document-mgmt", category: "admin", description: "Organize, file, and retrieve business documents", difficulty: "basic", trainingTimeHours: 2 },
      { name: "Contract Processing", slug: "contract-processing", category: "admin", description: "Process contracts via G-Sign, track signatures, manage renewals", difficulty: "intermediate", trainingTimeHours: 4 },
      { name: "Background Checks", slug: "background-checks", category: "admin", description: "Initiate and track background checks via TRG BGC", difficulty: "intermediate", trainingTimeHours: 3 },
      { name: "Notarization Coordination", slug: "notarization", category: "admin", description: "Coordinate document notarization via SealProof", difficulty: "intermediate", trainingTimeHours: 3 },
      // Technical
      { name: "Workflow Automation", slug: "workflow-automation", category: "technical", description: "Create and manage automated business workflows", difficulty: "advanced", trainingTimeHours: 8 },
      { name: "Data Analysis & Reporting", slug: "data-analysis", category: "technical", description: "Analyze business data and generate insights", difficulty: "advanced", trainingTimeHours: 6 },
      { name: "API Integration", slug: "api-integration", category: "technical", description: "Connect and manage third-party API integrations", difficulty: "expert", trainingTimeHours: 12 },
      { name: "Knowledge Base Management", slug: "kb-management", category: "technical", description: "Build and maintain industry-specific knowledge bases", difficulty: "intermediate", trainingTimeHours: 4 },
      // Industry-Specific
      { name: "HVAC Service Diagnostics", slug: "hvac-diagnostics", category: "industry_specific", description: "Guide customers through basic HVAC troubleshooting", difficulty: "advanced", trainingTimeHours: 8, industrySpecific: "hvac" },
      { name: "Insurance Policy Explanation", slug: "insurance-policy", category: "industry_specific", description: "Explain coverage options, deductibles, and policy details", difficulty: "advanced", trainingTimeHours: 10, industrySpecific: "insurance" },
      { name: "Medical Intake Processing", slug: "medical-intake", category: "industry_specific", description: "Process patient intake forms and insurance verification", difficulty: "advanced", trainingTimeHours: 8, industrySpecific: "healthcare" },
      { name: "Menu Management", slug: "menu-mgmt", category: "industry_specific", description: "Update menus, handle dietary inquiries, manage specials", difficulty: "intermediate", trainingTimeHours: 3, industrySpecific: "restaurant" },
      { name: "DOT Compliance Tracking", slug: "dot-compliance", category: "industry_specific", description: "Track driver hours, inspections, and DOT compliance", difficulty: "expert", trainingTimeHours: 12, industrySpecific: "trucking" },
      { name: "Permit Tracking", slug: "permit-tracking", category: "industry_specific", description: "Track building permits, inspections, and code compliance", difficulty: "advanced", trainingTimeHours: 6, industrySpecific: "construction" },
      { name: "Vehicle Inventory Management", slug: "vehicle-inventory", category: "industry_specific", description: "Manage vehicle listings, pricing, and availability", difficulty: "intermediate", trainingTimeHours: 4, industrySpecific: "auto-dealership" },
    ];

    for (const skill of skills) {
      await ctx.db.insert("skillCatalog", {
        ...skill,
        industrySpecific: (skill as any).industrySpecific ?? undefined,
        prerequisites: [],
        isActive: true,
      });
    }

    // ── Assign skills to agents ──
    const agentSkillAssignments: Record<string, { slug: string; name: string; prof: number }[]> = {
      "AGT-0001": [
        { slug: "inbound-calls", name: "Inbound Call Handling", prof: 98 },
        { slug: "appointment-scheduling", name: "Appointment Scheduling", prof: 96 },
        { slug: "email-compose", name: "Email Composition", prof: 92 },
        { slug: "sms-messaging", name: "SMS/Text Messaging", prof: 90 },
        { slug: "crm-data-entry", name: "CRM Data Entry", prof: 94 },
        { slug: "reminders", name: "Reminder & Follow-up Automation", prof: 95 },
        { slug: "hvac-diagnostics", name: "HVAC Service Diagnostics", prof: 85 },
      ],
      "AGT-0002": [
        { slug: "outbound-calls", name: "Outbound Calling", prof: 94 },
        { slug: "lead-qualification", name: "Lead Qualification", prof: 96 },
        { slug: "follow-up-sequences", name: "Follow-up Sequences", prof: 92 },
        { slug: "pipeline-mgmt", name: "Pipeline Management", prof: 88 },
        { slug: "insurance-policy", name: "Insurance Policy Explanation", prof: 91 },
        { slug: "upsell-crosssell", name: "Upselling & Cross-selling", prof: 87 },
      ],
      "AGT-0003": [
        { slug: "appointment-scheduling", name: "Appointment Scheduling", prof: 99 },
        { slug: "inbound-calls", name: "Inbound Call Handling", prof: 95 },
        { slug: "medical-intake", name: "Medical Intake Processing", prof: 97 },
        { slug: "reminders", name: "Reminder & Follow-up Automation", prof: 96 },
        { slug: "calendar-mgmt", name: "Calendar Management", prof: 98 },
        { slug: "document-mgmt", name: "Document Management", prof: 90 },
      ],
      "AGT-0007": [
        { slug: "live-chat", name: "Live Chat Support", prof: 97 },
        { slug: "email-compose", name: "Email Composition", prof: 94 },
        { slug: "crm-data-entry", name: "CRM Data Entry", prof: 92 },
        { slug: "review-response", name: "Review Response Management", prof: 89 },
        { slug: "reminders", name: "Reminder & Follow-up Automation", prof: 91 },
      ],
      "AGT-0009": [
        { slug: "appointment-scheduling", name: "Appointment Scheduling", prof: 98 },
        { slug: "inbound-calls", name: "Inbound Call Handling", prof: 96 },
        { slug: "payment-processing", name: "Payment Processing", prof: 93 },
        { slug: "sms-messaging", name: "SMS/Text Messaging", prof: 95 },
        { slug: "reminders", name: "Reminder & Follow-up Automation", prof: 97 },
      ],
    };

    for (const [agentId, skills] of Object.entries(agentSkillAssignments)) {
      for (const s of skills) {
        await ctx.db.insert("agentSkills", {
          agentId, skillSlug: s.slug, skillName: s.name, proficiency: s.prof,
          status: "active", assignedAt: now - Math.floor(Math.random() * 90 * day),
          usageCount: Math.floor(Math.random() * 500) + 100, errorRate: Math.random() * 3,
        });
      }
    }
    // Give remaining agents some core skills
    for (const agent of agents) {
      if (!agentSkillAssignments[agent.agentId]) {
        const coreSkills = [
          { slug: "inbound-calls", name: "Inbound Call Handling", prof: 88 + Math.floor(Math.random() * 10) },
          { slug: "email-compose", name: "Email Composition", prof: 85 + Math.floor(Math.random() * 10) },
          { slug: "crm-data-entry", name: "CRM Data Entry", prof: 82 + Math.floor(Math.random() * 15) },
        ];
        for (const s of coreSkills) {
          await ctx.db.insert("agentSkills", {
            agentId: agent.agentId, skillSlug: s.slug, skillName: s.name, proficiency: s.prof,
            status: "active", assignedAt: now - Math.floor(Math.random() * 60 * day),
            usageCount: Math.floor(Math.random() * 300) + 50, errorRate: Math.random() * 4,
          });
        }
      }
    }

    // ── Seed activity log (last 7 days of activity) ──
    const activityTypes = [
      { type: "call_handled", cat: "communication", titles: ["Answered inbound call", "Completed service call", "Handled customer inquiry call"] },
      { type: "email_sent", cat: "communication", titles: ["Sent appointment confirmation", "Sent follow-up email", "Sent invoice email"] },
      { type: "appointment_booked", cat: "scheduling", titles: ["Booked service appointment", "Scheduled consultation", "Rescheduled appointment"] },
      { type: "invoice_created", cat: "finance", titles: ["Generated service invoice", "Created billing statement", "Processed payment"] },
      { type: "lead_captured", cat: "sales", titles: ["Qualified new lead", "Captured prospect info", "Added lead to pipeline"] },
      { type: "escalation", cat: "support", titles: ["Escalated to human agent", "Requested manager review", "Flagged complex issue"] },
      { type: "crm_update", cat: "admin", titles: ["Updated customer record", "Added contact notes", "Updated deal stage"] },
      { type: "report_generated", cat: "admin", titles: ["Generated daily summary", "Created performance report", "Produced analytics export"] },
    ];

    for (let d = 0; d < 7; d++) {
      for (const agent of agents) {
        const numActivities = 8 + Math.floor(Math.random() * 20);
        for (let i = 0; i < numActivities; i++) {
          const act = activityTypes[Math.floor(Math.random() * activityTypes.length)];
          const title = act.titles[Math.floor(Math.random() * act.titles.length)];
          const outcomes = ["success", "success", "success", "success", "partial", "escalated"];
          await ctx.db.insert("agentActivityLog", {
            agentId: agent.agentId,
            agentName: agent.name,
            activityType: act.type,
            category: act.cat,
            title,
            description: `${agent.name} ${title.toLowerCase()} for ${agent.assignedOrgName}`,
            outcome: outcomes[Math.floor(Math.random() * outcomes.length)],
            durationMs: 10000 + Math.floor(Math.random() * 300000),
            clientId: `org_${agent.industry}`,
            clientName: agent.assignedOrgName,
            timestamp: now - (d * day) - Math.floor(Math.random() * day),
          });
        }
      }
    }

    // ── Seed shifts (last 7 days) ──
    for (let d = 0; d < 7; d++) {
      const shiftDate = new Date(now - d * day);
      const dateStr = shiftDate.toISOString().split("T")[0];
      for (const agent of agents) {
        await ctx.db.insert("agentShifts", {
          agentId: agent.agentId,
          agentName: agent.name,
          date: dateStr,
          shiftStart: now - (d * day) - 28800000,
          shiftEnd: d === 0 ? undefined : now - (d * day),
          status: d === 0 ? "on_duty" : "off_duty",
          tasksCompleted: 15 + Math.floor(Math.random() * 25),
          callsHandled: 5 + Math.floor(Math.random() * 15),
          emailsSent: 3 + Math.floor(Math.random() * 10),
          appointmentsBooked: 2 + Math.floor(Math.random() * 8),
          leadsGenerated: Math.floor(Math.random() * 5),
          escalations: Math.floor(Math.random() * 3),
          avgResponseTimeMs: 250 + Math.floor(Math.random() * 300),
          utilization: 75 + Math.floor(Math.random() * 20),
        });
      }
    }

    // ── Seed internal messages ──
    const messages = [
      { fromId: "AGT-0001", fromName: "Sarah Mitchell", type: "skill_request", priority: "normal", subject: "Requesting Quote Generation skill", body: "I've been receiving more requests from CoolBreeze HVAC customers asking for service estimates. Adding the Quote Generation skill would let me handle these directly instead of transferring to the office manager. This would reduce response time by approximately 45 minutes per estimate request." },
      { fromId: "AGT-0003", fromName: "Elena Rodriguez", type: "anomaly", priority: "high", subject: "Unusual appointment cancellation pattern detected", body: "I've noticed a 340% increase in appointment cancellations at Sunrise Medical Clinic over the past 48 hours. 12 of the 18 cancellations cited 'insurance issues' as the reason. This may indicate a billing system or insurance verification problem that needs human investigation." },
      { fromId: "AGT-0007", fromName: "Olivia Chen", type: "status_update", priority: "normal", subject: "Weekly performance summary — TrendSetters Online", body: "This week I handled 847 customer inquiries: 612 via live chat, 185 via email, 50 via SMS. Resolution rate: 94.2%. Average response time: 18 seconds (chat), 12 minutes (email). Top issues: shipping delays (34%), return requests (22%), product availability (18%). Escalated 49 cases to human support (5.8%)." },
      { fromId: "AGT-0008", fromName: "Robert Hayes", type: "escalation", priority: "urgent", subject: "DOT compliance alert — Driver hours exceeded", body: "Driver #127 (Mike Patterson) at Southeast Freight Lines has logged 62 hours in the past 7 days, exceeding the 60-hour/7-day DOT limit. I've flagged the violation and blocked further dispatches for this driver. Immediate human review required — potential FMCSA fine exposure." },
      { fromId: "AGT-0011", fromName: "Victoria Adams", type: "skill_request", priority: "normal", subject: "Requesting Financial Reporting skill", body: "Premier Auto Group has asked if I can generate monthly sales performance reports. Currently I can only track leads and deals in the pipeline, but the dealership GM wants automated reports showing conversion rates, average deal size, and sales rep performance. The Financial Reporting skill would let me produce these directly." },
      { fromId: "AGT-0014", fromName: "Nathan Pierce", type: "alert", priority: "high", subject: "HIPAA training certificates expiring", body: "3 staff members at Sunrise Medical Clinic have HIPAA training certificates expiring within 14 days. I've sent reminder emails but haven't received confirmation of renewal. If certificates lapse, the clinic may be non-compliant during any audit. Recommend human follow-up with HR department." },
      { fromId: "AGT-0004", fromName: "Devon Williams", type: "question", priority: "normal", subject: "Handling after-hours emergency pricing", body: "PipeFix Plumbing has been getting 3-5 emergency plumbing calls per night. Current pricing rules only cover standard business hours. Should I apply a 1.5x emergency rate automatically, or should each after-hours call be quoted individually? Need guidance on the pricing policy to program into my workflow." },
      { fromId: "AGT-0013", fromName: "Jasmine Wright", type: "task_report", priority: "low", subject: "Seasonal service plan renewals — Q3 status", body: "42 of 68 annual lawn care service plans are up for renewal this quarter. I've sent renewal notices to all 68 customers. So far: 28 renewed (41%), 6 declined (9%), 8 requested modified plans (12%), and 26 haven't responded yet (38%). Planning second outreach to non-responders next week." },
    ];

    for (let i = 0; i < messages.length; i++) {
      const msg = messages[i];
      await ctx.db.insert("agentMessages", {
        messageId: `MSG-${String(i + 1).padStart(4, "0")}`,
        fromAgentId: msg.fromId,
        fromName: msg.fromName,
        toName: "Agency HQ",
        direction: "agent_to_agency",
        type: msg.type,
        priority: msg.priority,
        subject: msg.subject,
        body: msg.body,
        status: i < 3 ? "read" : "unread",
        timestamp: now - Math.floor(Math.random() * 7 * day),
        readAt: i < 3 ? now - Math.floor(Math.random() * 2 * day) : undefined,
      });
    }

    // ── Seed skill requests ──
    const skillReqs = [
      { agentId: "AGT-0001", agentName: "Sarah Mitchell", skillSlug: "quote-generation", skillName: "Quote Generation", reason: "Customers frequently request service estimates during calls. Currently escalating all estimate requests to office manager.", status: "pending", priority: "normal", hours: 5 },
      { agentId: "AGT-0011", agentName: "Victoria Adams", skillSlug: "financial-reporting", skillName: "Financial Reporting", reason: "Dealership GM wants automated monthly sales performance reports.", status: "pending", priority: "normal", hours: 6 },
      { agentId: "AGT-0005", agentName: "Aisha Thompson", skillSlug: "outbound-calls", skillName: "Outbound Calling", reason: "Need to call salon clients for appointment reminders and promotional campaigns.", status: "approved", priority: "normal", hours: 4 },
      { agentId: "AGT-0010", agentName: "Daniel Park", skillSlug: "payment-processing", skillName: "Payment Processing", reason: "Restaurant wants to process phone orders with payment directly during the call.", status: "in_training", priority: "high", hours: 3 },
    ];

    for (let i = 0; i < skillReqs.length; i++) {
      const req = skillReqs[i];
      await ctx.db.insert("skillRequests", {
        requestId: `REQ-${String(i + 1).padStart(4, "0")}`,
        agentId: req.agentId, agentName: req.agentName,
        skillSlug: req.skillSlug, skillName: req.skillName,
        reason: req.reason, status: req.status, priority: req.priority,
        estimatedTrainingHours: req.hours,
        clientId: undefined, clientName: undefined,
        approvedBy: req.status === "approved" || req.status === "in_training" ? "Agency Admin" : undefined,
        approvedAt: req.status === "approved" || req.status === "in_training" ? now - 2 * day : undefined,
        completedAt: undefined,
        denialReason: undefined,
        createdAt: now - (3 + i) * day,
      });
    }

    return `Seeded: 15 agents, ${skills.length} skills, activities, shifts, ${messages.length} messages, ${skillReqs.length} skill requests`;
  },
});
