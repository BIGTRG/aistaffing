import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

/* ─── Seed all 22 agent templates ─── */
export const seed = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("agentTemplates").collect();
    if (existing.length > 0) return; // already seeded

    const templates = [
      // Executive Suite
      { name: "CEO Advisor", department: "Executive Suite", description: "Strategic planning, business growth, market positioning, competitive analysis", pricingModel: "flat_monthly", basePriceCents: 400000, icon: "Briefcase" },
      { name: "CFO Advisor", department: "Executive Suite", description: "Financial forecasting, cash flow management, budgeting, profitability analysis", pricingModel: "flat_monthly", basePriceCents: 350000, icon: "DollarSign" },
      { name: "CTO Advisor", department: "Executive Suite", description: "Technology roadmapping, vendor evaluation, architecture decisions, security planning", pricingModel: "flat_monthly", basePriceCents: 350000, icon: "Code" },
      { name: "President / COO", department: "Executive Suite", description: "Operations optimization, team coordination, process improvement, KPI tracking", pricingModel: "flat_monthly", basePriceCents: 400000, icon: "Briefcase" },
      // Management
      { name: "Project Manager", department: "Management", description: "Task tracking, deadline management, resource allocation, status reporting", pricingModel: "flat_monthly", basePriceCents: 150000, icon: "ClipboardList" },
      { name: "Account Manager", department: "Management", description: "Client relationship management, upselling, retention, satisfaction tracking", pricingModel: "flat_monthly", basePriceCents: 120000, icon: "Users" },
      { name: "HR Manager", department: "Management", description: "Policy enforcement, employee relations, onboarding workflows, compliance tracking", pricingModel: "flat_monthly", basePriceCents: 120000, icon: "UserCheck" },
      // Customer Service
      { name: "Live Chat Agent", department: "Customer Service", description: "24/7 live chat support, FAQ handling, ticket creation, customer routing", pricingModel: "flat_monthly", basePriceCents: 50000, icon: "MessageCircle" },
      { name: "Email Support Agent", department: "Customer Service", description: "Email triage, response drafting, follow-up scheduling, escalation management", pricingModel: "flat_monthly", basePriceCents: 40000, icon: "Mail" },
      { name: "Phone Triage Agent", department: "Customer Service", description: "Inbound call handling, appointment scheduling, call routing, voicemail management", pricingModel: "flat_monthly", basePriceCents: 60000, icon: "Phone" },
      // Sales
      { name: "Lead Gen Specialist", department: "Sales", description: "Prospect identification, outreach campaigns, lead scoring, pipeline building", pricingModel: "flat_monthly", basePriceCents: 80000, icon: "Target" },
      { name: "Follow-Up Agent", department: "Sales", description: "Automated follow-up sequences, re-engagement campaigns, deal nurturing", pricingModel: "flat_monthly", basePriceCents: 60000, icon: "RefreshCw" },
      { name: "Appointment Setter", department: "Sales", description: "Calendar management, meeting scheduling, confirmation calls, no-show follow-up", pricingModel: "flat_monthly", basePriceCents: 50000, icon: "Calendar" },
      // Marketing
      { name: "Social Media Manager", department: "Marketing", description: "Content scheduling, engagement monitoring, analytics reporting, trend tracking", pricingModel: "flat_monthly", basePriceCents: 80000, icon: "Share2" },
      { name: "Content Writer", department: "Marketing", description: "Blog posts, email newsletters, ad copy, landing page content, brand voice", pricingModel: "flat_monthly", basePriceCents: 60000, icon: "PenTool" },
      { name: "SEO Specialist", department: "Marketing", description: "Keyword research, on-page optimization, backlink analysis, ranking reports", pricingModel: "flat_monthly", basePriceCents: 70000, icon: "Search" },
      // Admin
      { name: "Data Entry Clerk", department: "Admin", description: "Data input, spreadsheet management, record keeping, database maintenance", pricingModel: "flat_monthly", basePriceCents: 30000, icon: "Database" },
      { name: "Virtual Receptionist", department: "Admin", description: "Call answering, message taking, appointment booking, visitor management", pricingModel: "flat_monthly", basePriceCents: 40000, icon: "Headphones" },
      // Tech
      { name: "IT Help Desk", department: "Tech", description: "Troubleshooting, password resets, software support, system monitoring", pricingModel: "flat_monthly", basePriceCents: 50000, icon: "Monitor" },
      { name: "Website Monitor", department: "Tech", description: "Uptime monitoring, performance alerts, security scanning, error tracking", pricingModel: "flat_monthly", basePriceCents: 30000, icon: "Globe" },
      // Legal Support
      { name: "Contract Review Assistant", department: "Legal Support", description: "Contract analysis, clause flagging, compliance checking, renewal tracking", pricingModel: "flat_monthly", basePriceCents: 100000, icon: "Scale" },
      // HR / Recruiting
      { name: "Resume Screener", department: "HR / Recruiting", description: "Resume parsing, candidate scoring, shortlist generation, skills matching", pricingModel: "flat_monthly", basePriceCents: 60000, icon: "FileText" },
    ];

    for (const t of templates) {
      await ctx.db.insert("agentTemplates", {
        ...t,
        isActive: true,
      });
    }
  },
});

/* ─── List all active templates ─── */
export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("agentTemplates")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .collect();
  },
});

/* ─── List by department ─── */
export const listByDepartment = query({
  args: { department: v.string() },
  handler: async (ctx, { department }) => {
    return await ctx.db
      .query("agentTemplates")
      .withIndex("by_department", (q) => q.eq("department", department))
      .collect();
  },
});

/* ─── Get single template ─── */
export const get = query({
  args: { id: v.id("agentTemplates") },
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id);
  },
});
