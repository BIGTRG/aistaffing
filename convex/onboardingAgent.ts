import { v } from "convex/values";
import { mutation, query, action } from "./_generated/server";
import { api } from "./_generated/api";

declare const process: { env: Record<string, string | undefined> };

const VIKTOR_API_URL = process.env.VIKTOR_SPACES_API_URL!;
const PROJECT_NAME = process.env.VIKTOR_SPACES_PROJECT_NAME!;
const PROJECT_SECRET = process.env.VIKTOR_SPACES_PROJECT_SECRET!;

// ══════════════════════════════════════════════════
// QUERIES
// ══════════════════════════════════════════════════

export const listSessions = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("onboardingSessions").order("desc").collect();
  },
});

export const listSessionsByStatus = query({
  args: { status: v.string() },
  handler: async (ctx, { status }) => {
    return await ctx.db
      .query("onboardingSessions")
      .withIndex("by_status", (q) => q.eq("status", status))
      .order("desc")
      .collect();
  },
});

export const getSession = query({
  args: { id: v.id("onboardingSessions") },
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id);
  },
});

export const getSessionMessages = query({
  args: { sessionId: v.id("onboardingSessions") },
  handler: async (ctx, { sessionId }) => {
    return await ctx.db
      .query("onboardingMessages")
      .withIndex("by_session", (q) => q.eq("sessionId", sessionId))
      .order("asc")
      .collect();
  },
});

export const stats = query({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("onboardingSessions").collect();
    const byStatus: Record<string, number> = {};
    for (const s of all) {
      byStatus[s.status] = (byStatus[s.status] || 0) + 1;
    }
    return {
      total: all.length,
      byStatus,
      deployed: byStatus["deployed"] || 0,
      inProgress: (byStatus["intake"] || 0) + (byStatus["analyzing"] || 0),
    };
  },
});

// ══════════════════════════════════════════════════
// MUTATIONS
// ══════════════════════════════════════════════════

export const createSession = mutation({
  args: {
    clientName: v.string(),
    clientEmail: v.optional(v.string()),
    clientPhone: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const sessionId = await ctx.db.insert("onboardingSessions", {
      clientName: args.clientName,
      clientEmail: args.clientEmail,
      clientPhone: args.clientPhone,
      status: "intake",
      createdAt: now,
      updatedAt: now,
    });

    await ctx.db.insert("onboardingMessages", {
      sessionId,
      role: "agent",
      content: `Welcome, ${args.clientName}! I'm the AI Workflow Builder — I'll help you set up the perfect automated system for your business.\n\nLet's start with the basics:\n\n**What industry or type of business do you operate?**\n\nFor example: plumbing, salon, restaurant, law firm, insurance agency, trucking, photography, etc.`,
      timestamp: now,
    });

    return sessionId;
  },
});

export const addMessage = mutation({
  args: {
    sessionId: v.id("onboardingSessions"),
    role: v.string(),
    content: v.string(),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("onboardingMessages", {
      sessionId: args.sessionId,
      role: args.role,
      content: args.content,
      metadata: args.metadata,
      timestamp: Date.now(),
    });
    await ctx.db.patch(args.sessionId, { updatedAt: Date.now() });
  },
});

export const updateSession = mutation({
  args: {
    id: v.id("onboardingSessions"),
    detectedIndustry: v.optional(v.string()),
    detectedPlatforms: v.optional(v.array(v.string())),
    businessSize: v.optional(v.string()),
    painPoints: v.optional(v.array(v.string())),
    automationGoals: v.optional(v.array(v.string())),
    answers: v.optional(v.any()),
    status: v.optional(v.string()),
    generatedWorkflowPreview: v.optional(v.any()),
    generatedWorkflowId: v.optional(v.id("workflowTemplates")),
  },
  handler: async (ctx, { id, ...fields }) => {
    const updates: Record<string, unknown> = { updatedAt: Date.now() };
    for (const [key, value] of Object.entries(fields)) {
      if (value !== undefined) updates[key] = value;
    }
    await ctx.db.patch(id, updates);
  },
});

export const deleteSession = mutation({
  args: { id: v.id("onboardingSessions") },
  handler: async (ctx, { id }) => {
    const messages = await ctx.db
      .query("onboardingMessages")
      .withIndex("by_session", (q) => q.eq("sessionId", id))
      .collect();
    for (const msg of messages) {
      await ctx.db.delete(msg._id);
    }
    await ctx.db.delete(id);
  },
});

// ══════════════════════════════════════════════════
// AI ENGINE
// ══════════════════════════════════════════════════

async function callAI(prompt: string): Promise<string> {
  try {
    const response = await fetch(`${VIKTOR_API_URL}/api/viktor-spaces/tools/call`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        project_name: PROJECT_NAME,
        project_secret: PROJECT_SECRET,
        role: "quick_ai_search",
        arguments: { query: prompt },
      }),
    });

    if (response.ok) {
      const data = await response.json();
      if (data.result?.search_response) return data.result.search_response;
      if (data.response_text) return data.response_text;
      if (typeof data === "string") return data;
    }
  } catch (e) {
    console.error("AI call error:", e);
  }
  return "";
}

// ═══════════════════════════════════════════════════════════
// INDUSTRY MAP — Comprehensive keyword matching with weights
// ═══════════════════════════════════════════════════════════

interface IndustryInfo {
  slug: string;
  label: string;
  platforms: string[];
  keywords: string[];       // single-word matches (1 pt each)
  phrases: string[];        // multi-word matches (3 pts each — more specific)
}

const INDUSTRIES: IndustryInfo[] = [
  { slug: "car-dealership", label: "Car Dealership", platforms: ["crm", "finance", "hr-recruitment"],
    keywords: ["dealership", "dealer", "showroom", "test-drive", "f&i"],
    phrases: ["car dealership", "auto dealership", "used car", "new car", "car lot", "auto group", "car sales", "vehicle sales", "auto sales", "car inventory"] },
  { slug: "salon", label: "Salon & Beauty", platforms: ["crm", "finance", "hr-recruitment"],
    keywords: ["salon", "stylist", "cosmetology", "blowout", "nails", "pedicure", "manicure", "waxing"],
    phrases: ["hair salon", "beauty salon", "nail salon", "day spa", "beauty shop", "hair studio", "full-service salon"] },
  { slug: "car-wash", label: "Car Wash", platforms: ["crm", "finance"],
    keywords: ["carwash", "detailing", "detail"],
    phrases: ["car wash", "express wash", "auto wash", "car detail", "auto detail", "wash tunnel", "wash plan", "unlimited wash"] },
  { slug: "construction", label: "Construction", platforms: ["crm", "hr-recruitment", "finance", "legal"],
    keywords: ["construction", "contractor", "builder", "renovation", "remodel", "excavation", "framing", "subcontractor", "estimator", "foreman"],
    phrases: ["general contractor", "construction company", "building contractor", "commercial construction", "residential construction", "change order", "bid template"] },
  { slug: "insurance", label: "Insurance", platforms: ["crm", "finance", "legal", "background-check"],
    keywords: ["insurance", "policy", "premium", "underwriting", "claims", "carrier", "adjuster", "deductible"],
    phrases: ["insurance agency", "insurance broker", "p&c insurance", "insurance agent", "policy renewal", "insurance company", "claims intake"] },
  { slug: "mortgage", label: "Mortgage & Lending", platforms: ["crm", "finance", "legal", "background-check"],
    keywords: ["mortgage", "lending", "refinance", "underwrite", "origination", "amortization"],
    phrases: ["mortgage broker", "mortgage company", "loan officer", "mortgage partner", "mortgage brokering", "rate lock", "loan pipeline", "trid deadline"] },
  { slug: "bhph", label: "Buy Here Pay Here", platforms: ["crm", "finance", "legal"],
    keywords: ["collections", "repossession", "repo"],
    phrases: ["buy here pay here", "bhph", "buy here", "pay here", "in-house financing", "used car lot", "payment tracking", "gps tracking"] },
  { slug: "healthcare", label: "Healthcare & Clinics", platforms: ["crm", "hr-recruitment", "finance", "background-check"],
    keywords: ["hospital", "clinic", "medical", "doctor", "patient", "nursing", "dental", "pharmacy", "physician", "ehr", "hipaa"],
    phrases: ["health clinic", "medical practice", "family health", "urgent care", "primary care", "patient intake", "insurance verification", "medical assistant"] },
  { slug: "ice-cream", label: "Ice Cream & Frozen Treats", platforms: ["crm", "finance"],
    keywords: ["gelato", "frozen", "sorbet", "popsicle", "sundae", "cone"],
    phrases: ["ice cream", "ice cream stand", "ice cream shop", "ice cream truck", "food truck", "frozen treats", "flavor board", "seasonal stand"] },
  { slug: "trucking", label: "Trucking & Freight", platforms: ["crm", "hr-recruitment", "finance", "legal"],
    keywords: ["trucking", "freight", "dispatch", "fleet", "cdl", "bol", "dot", "hos", "eld"],
    phrases: ["trucking company", "freight company", "long-haul", "regional trucking", "truck driver", "fleet management", "route optimization", "driver compliance"] },
  { slug: "home-services", label: "Home Services", platforms: ["crm", "hr-recruitment", "finance", "ai-workforce"],
    keywords: ["hvac", "plumbing", "plumber", "electrical", "electrician", "handyman", "contractor", "repair"],
    phrases: ["home service", "home repair", "service call", "field service", "mobile mechanic"] },
  { slug: "real-estate", label: "Real Estate", platforms: ["crm", "legal", "finance", "background-check"],
    keywords: ["realtor", "property", "listing", "mls", "brokerage", "escrow"],
    phrases: ["real estate", "real estate agent", "property management", "real estate broker", "open house"] },
  { slug: "legal", label: "Legal & Law Firms", platforms: ["crm", "legal", "finance", "background-check"],
    keywords: ["lawyer", "attorney", "litigation", "paralegal", "deposition", "retainer"],
    phrases: ["law firm", "legal practice", "legal services", "case management"] },
  { slug: "lawn-care", label: "Lawn Care & Landscaping", platforms: ["crm", "hr-recruitment", "finance"],
    keywords: ["lawn", "landscaping", "mowing", "irrigation", "garden", "turf"],
    phrases: ["lawn care", "lawn service", "landscaping company", "yard maintenance"] },
  { slug: "barber-shops", label: "Barber Shops", platforms: ["crm", "finance", "hr-recruitment"],
    keywords: ["barber", "barbershop", "haircut", "grooming", "fade", "shave"],
    phrases: ["barber shop", "men's grooming"] },
  { slug: "restaurants", label: "Restaurants & Food Service", platforms: ["crm", "hr-recruitment", "finance"],
    keywords: ["restaurant", "cafe", "dining", "kitchen", "catering", "bistro", "diner", "chef"],
    phrases: ["food service", "restaurant management", "food business", "bar and grill"] },
  { slug: "bakeries", label: "Bakeries", platforms: ["crm", "finance"],
    keywords: ["bakery", "pastry", "cake", "bread", "baking", "confectionery"],
    phrases: ["cake shop", "pastry shop"] },
  { slug: "boutique", label: "Boutique & Retail", platforms: ["crm", "finance"],
    keywords: ["boutique", "clothing", "retail", "fashion", "apparel", "store", "shop"],
    phrases: ["clothing store", "retail shop", "fashion boutique"] },
  { slug: "ecommerce", label: "E-Commerce", platforms: ["crm", "finance"],
    keywords: ["ecommerce", "shopify", "dropship", "dtc", "amazon"],
    phrases: ["e-commerce", "online store", "online shop", "direct to consumer"] },
  { slug: "phone-companies", label: "Telecom & Phone", platforms: ["crm", "finance", "hr-recruitment"],
    keywords: ["telecom", "wireless", "cellular", "5g"],
    phrases: ["phone company", "mobile carrier", "phone service", "cell phone"] },
  { slug: "marketing", label: "Marketing & Advertising", platforms: ["crm", "finance"],
    keywords: ["marketing", "advertising", "branding", "seo", "ppc", "agency"],
    phrases: ["marketing agency", "ad agency", "digital marketing", "social media agency"] },
  { slug: "mobile-mechanics", label: "Mobile Mechanics & Auto Repair", platforms: ["crm", "finance", "hr-recruitment"],
    keywords: ["mechanic", "automotive", "garage"],
    phrases: ["auto repair", "mobile mechanic", "car repair", "auto shop", "mechanic shop"] },
  { slug: "mental-health", label: "Mental Health & Therapy", platforms: ["crm", "hr-recruitment", "finance"],
    keywords: ["therapy", "therapist", "counseling", "psychiatry", "psychology", "counselor"],
    phrases: ["mental health", "therapy practice", "counseling center"] },
  { slug: "photographers", label: "Photography", platforms: ["crm", "finance"],
    keywords: ["photographer", "photography", "studio", "portrait", "headshot"],
    phrases: ["photo studio", "wedding photographer", "photography business"] },
  { slug: "film-editors", label: "Film & Video Production", platforms: ["crm", "finance"],
    keywords: ["film", "video", "editor", "production", "post-production", "editing", "cinematography"],
    phrases: ["video production", "film production", "video editing", "post production"] },
  { slug: "authors", label: "Authors & Publishing", platforms: ["crm", "finance"],
    keywords: ["author", "writer", "book", "publishing", "manuscript", "ghostwriter", "novel"],
    phrases: ["self-publishing", "book launch"] },
];

function detectIndustry(text: string): { slug: string; label: string; platforms: string[] } | null {
  const lower = text.toLowerCase();
  let bestMatch: { slug: string; label: string; platforms: string[]; score: number } | null = null;

  for (const ind of INDUSTRIES) {
    let score = 0;
    // Phrases are worth 3 points each (more specific = higher weight)
    for (const ph of ind.phrases) {
      if (lower.includes(ph)) score += 3;
    }
    // Keywords are worth 1 point each
    for (const kw of ind.keywords) {
      if (lower.includes(kw)) score += 1;
    }
    if (score > 0 && (!bestMatch || score > bestMatch.score)) {
      bestMatch = { slug: ind.slug, label: ind.label, platforms: ind.platforms, score };
    }
  }

  return bestMatch ? { slug: bestMatch.slug, label: bestMatch.label, platforms: bestMatch.platforms } : null;
}

// ═══════════════════════════════════════════════════════════
// INDUSTRY-SPECIFIC WORKFLOW TEMPLATES (smart fallbacks)
// ═══════════════════════════════════════════════════════════

function getIndustryWorkflow(slug: string, clientName: string, _painPoints: string[]): any {
  const templates: Record<string, any> = {
    "car-dealership": {
      name: `${clientName} — Dealership Automation Suite`,
      description: `End-to-end automation for ${clientName}: instant lead response, BDC automation, service scheduling, F&I document flow, and customer lifecycle management.`,
      platformSlug: "crm",
      triggerType: "event",
      triggerDescription: "New internet lead, walk-in, phone call, or service request",
      steps: [
        { order: 1, name: "Instant Lead Capture & Response", type: "ai_agent", description: "AI responds to internet leads within 60 seconds via text/email. Captures lead source, vehicle interest, trade-in info, and credit range." },
        { order: 2, name: "Lead Qualification & Scoring", type: "ai_agent", description: "AI scores lead based on intent signals, credit profile, and vehicle match. Routes hot leads to sales floor immediately." },
        { order: 3, name: "BDC Follow-Up Sequences", type: "action", description: "Automated multi-touch follow-up: Day 1 call, Day 2 text, Day 3 email with matching inventory. Escalates non-responsive leads." },
        { order: 4, name: "Test Drive & Appointment Scheduler", type: "action", description: "Self-service booking for test drives and sales appointments. Syncs with sales rep calendars and sends reminders." },
        { order: 5, name: "Deal Jacket Builder", type: "ai_agent", description: "Digital deal jacket auto-populates from CRM: buyer info, vehicle details, trade appraisal, credit app — flows from sales to F&I without re-entry." },
        { order: 6, name: "F&I Document Processing", type: "api_call", description: "Automated credit pulls, lender submissions, and contract generation. E-signature for all deal documents." },
        { order: 7, name: "Service Department Scheduler", type: "action", description: "AI handles service appointment booking, recalls, maintenance reminders. Sends pre-visit check-in and post-service surveys." },
        { order: 8, name: "Customer Lifecycle & Equity Mining", type: "ai_agent", description: "Tracks ownership milestones. AI identifies customers with positive equity positions and triggers upgrade campaigns at optimal timing." },
      ],
    },
    "salon": {
      name: `${clientName} — Salon Operations Automation`,
      description: `Complete salon automation for ${clientName}: appointment management, no-show prevention, automated rebooking, social media content, and loyalty tracking.`,
      platformSlug: "crm",
      triggerType: "event",
      triggerDescription: "New booking request, appointment reminder trigger, or client check-in",
      steps: [
        { order: 1, name: "Smart Appointment Booking", type: "ai_agent", description: "AI handles booking via text, DM, or web — matches client preferences with stylist availability. Suggests optimal time slots." },
        { order: 2, name: "No-Show Prevention System", type: "action", description: "Automated confirmation sequence: 48hr email, 24hr text, 2hr reminder. Requires confirmation reply or auto-releases the slot." },
        { order: 3, name: "Client Check-In & Upsell", type: "ai_agent", description: "Digital check-in on arrival. AI suggests add-on services based on client history (deep conditioning, color refresh, etc.)." },
        { order: 4, name: "Auto-Rebook Before Checkout", type: "action", description: "System prompts rebook at checkout based on service cycle (6-week cut, 8-week color). Pre-schedules next appointment." },
        { order: 5, name: "Social Media Content Engine", type: "ai_agent", description: "AI generates and schedules social media posts: before/after transformations, daily specials, stylist spotlights, and seasonal promotions." },
        { order: 6, name: "Loyalty & Rewards Tracker", type: "action", description: "Automated point tracking: earn per visit, per referral, per product purchase. Triggers reward notifications at milestones." },
        { order: 7, name: "Review & Referral Generator", type: "delay", description: "24-hour post-visit automated review request. Happy clients get referral code for friend discounts." },
        { order: 8, name: "Win-Back Campaigns", type: "ai_agent", description: "AI detects clients who haven't visited in 8+ weeks. Sends personalized win-back offers based on their service history." },
      ],
    },
    "car-wash": {
      name: `${clientName} — Car Wash Command Center`,
      description: `Smart automation for ${clientName}: membership management, weather-triggered marketing, queue management, and revenue optimization.`,
      platformSlug: "crm",
      triggerType: "event",
      triggerDescription: "New membership signup, weather trigger, or customer arrival",
      steps: [
        { order: 1, name: "Membership Auto-Billing", type: "api_call", description: "Automated monthly billing for unlimited wash plans. Handles failed payments with retry sequences and dunning emails." },
        { order: 2, name: "Churn Detection & Save", type: "ai_agent", description: "AI monitors usage patterns — members who haven't washed in 2+ weeks get re-engagement offers. Cancellation requests trigger save offers." },
        { order: 3, name: "Weather-Triggered Campaigns", type: "condition", description: "Monitors 3-day forecast. Sunny weekends trigger 'Perfect Wash Weather' push notifications. Post-rain triggers 'Mud Season Special' blasts." },
        { order: 4, name: "Live Queue Management", type: "action", description: "Real-time wait time display on website and Google. Customers can join virtual queue and get notified when it's their turn." },
        { order: 5, name: "Express Upsell at Entry", type: "ai_agent", description: "Smart upsell screen at entry point: recommends premium wash, wax, or detail based on vehicle type and wash history." },
        { order: 6, name: "Membership Renewal Engine", type: "action", description: "30-day pre-renewal notifications with usage stats. Annual members get early-bird renewal discount. Auto-upgrades heavy users." },
        { order: 7, name: "Fleet & Commercial Accounts", type: "action", description: "Automated fleet account management: volume tracking, consolidated billing, and dedicated account dashboards for business clients." },
        { order: 8, name: "Revenue & Capacity Analytics", type: "ai_agent", description: "Daily revenue dashboards, peak hour analysis, membership conversion rates, and wash-per-member metrics for optimization." },
      ],
    },
    "construction": {
      name: `${clientName} — Construction Project Automation`,
      description: `Project management automation for ${clientName}: rapid estimating, change order workflows, subcontractor compliance, and project tracking.`,
      platformSlug: "crm",
      triggerType: "event",
      triggerDescription: "New bid request, change order submission, or project milestone",
      steps: [
        { order: 1, name: "AI-Assisted Estimating", type: "ai_agent", description: "Bid builder pulls from historical cost database. AI suggests line items based on project type, auto-calculates labor/material with current pricing." },
        { order: 2, name: "Bid Submission & Tracking", type: "action", description: "Professional bid package generation with scope of work, timeline, and terms. Tracks bid status and follow-up reminders." },
        { order: 3, name: "Change Order Workflow", type: "human_review", description: "Digital change order requests with cost impact analysis. Routes through approval chain: PM → estimator → client. Auto-updates project budget." },
        { order: 4, name: "Subcontractor Compliance Portal", type: "api_call", description: "Self-service portal for subs: upload insurance certs, W-9s, lien waivers. Auto-reminders for expiring documents. No docs = no payment." },
        { order: 5, name: "Daily Log & Progress Tracking", type: "action", description: "Mobile daily logs: weather, crew hours, materials used, work completed. Auto-generates progress reports for clients." },
        { order: 6, name: "Schedule & Milestone Manager", type: "condition", description: "Gantt-style scheduling with dependency tracking. Alerts when tasks fall behind. Notifies next-in-line trades when predecessors complete." },
        { order: 7, name: "Invoice & Pay Application Processing", type: "api_call", description: "Automated AIA-format pay applications. Tracks retainage, lien releases, and payment status. Generates client invoices from completed work." },
        { order: 8, name: "Project Close-Out Package", type: "ai_agent", description: "Auto-compiles close-out documents: warranties, O&M manuals, as-builts, final lien waivers. Triggers warranty period tracking." },
      ],
    },
    "insurance": {
      name: `${clientName} — Insurance Agency Automation`,
      description: `Agency management automation for ${clientName}: renewal tracking, multi-carrier quoting, claims routing, and client lifecycle management.`,
      platformSlug: "crm",
      triggerType: "event",
      triggerDescription: "Policy renewal date approaching, new quote request, or claim submission",
      steps: [
        { order: 1, name: "90/60/30 Renewal Engine", type: "action", description: "Automated renewal pipeline: 90-day review trigger, 60-day re-quote, 30-day client contact. Ensures zero missed renewals across 4,000+ policies." },
        { order: 2, name: "Multi-Carrier Rate Comparison", type: "ai_agent", description: "AI pulls quotes from integrated carrier portals. Side-by-side comparison with coverage analysis. Recommends best value options per client profile." },
        { order: 3, name: "New Business Intake & Quoting", type: "ai_agent", description: "Digital intake form captures risk info. AI pre-fills applications for multiple carriers. Generates quote proposals with coverage explanations." },
        { order: 4, name: "Claims Intake & Routing", type: "condition", description: "First notice of loss intake with guided questions. Auto-routes to correct department (auto, property, liability). Notifies carrier and assigns adjuster." },
        { order: 5, name: "Policy Document Management", type: "api_call", description: "Auto-downloads policy documents from carrier portals. Organizes by client, line of business, and effective date. Client self-service portal for dec pages." },
        { order: 6, name: "Cross-Sell & Coverage Gap AI", type: "ai_agent", description: "AI analyzes client portfolio for coverage gaps. Identifies cross-sell opportunities (umbrella, cyber, EPLI). Generates personalized recommendations." },
        { order: 7, name: "Commission Tracking & Reconciliation", type: "api_call", description: "Automated commission statement processing. Reconciles carrier payments against expected amounts. Alerts on discrepancies." },
        { order: 8, name: "Client Review Campaigns", type: "delay", description: "Annual review scheduling with pre-meeting coverage summary. Post-review follow-up with updated recommendations and quotes." },
      ],
    },
    "mortgage": {
      name: `${clientName} — Mortgage Pipeline Automation`,
      description: `Loan pipeline automation for ${clientName}: borrower portal, compliance tracking, rate monitoring, and milestone notifications.`,
      platformSlug: "crm",
      triggerType: "event",
      triggerDescription: "New loan application, document upload, or rate change alert",
      steps: [
        { order: 1, name: "Borrower Portal & Doc Checklist", type: "action", description: "Self-service portal with dynamic document checklist. Borrowers upload paystubs, tax returns, bank statements. Status tracker shows what's still needed." },
        { order: 2, name: "AI Document Verification", type: "ai_agent", description: "AI reviews uploaded documents for completeness: checks dates, amounts, names match. Flags discrepancies before processor review." },
        { order: 3, name: "Pipeline Status Automation", type: "action", description: "Real-time pipeline dashboard. Automated status updates to borrower, LO, processor, and realtor at each milestone (submitted, conditionally approved, clear-to-close)." },
        { order: 4, name: "Rate Lock Monitor & Alerts", type: "condition", description: "Monitors market rates. Alerts LO when rates hit client's target. Tracks lock expirations with countdown alerts. Auto-extends or relocks per policy." },
        { order: 5, name: "TRID Compliance Tracker", type: "action", description: "Automated TRID timeline management. Tracks LE delivery, CD delivery, and waiting periods. Alerts team before any deadline could be missed." },
        { order: 6, name: "Condition Clearing Workflow", type: "human_review", description: "Underwriting conditions routed to appropriate party. Borrower conditions trigger portal notifications. Internal conditions assigned to processors with deadlines." },
        { order: 7, name: "Closing Coordination", type: "api_call", description: "Automated closing package preparation. Title company coordination. Schedules closing with all parties. Sends final walkthrough reminders to borrowers." },
        { order: 8, name: "Post-Close & Retention", type: "ai_agent", description: "Welcome package automation. Rate watch for refi opportunities. Anniversary and milestone touchpoints. Referral program triggers." },
      ],
    },
    "bhph": {
      name: `${clientName} — BHPH Operations Automation`,
      description: `Buy-here-pay-here automation for ${clientName}: digital deal processing, payment collection, GPS management, and compliance tracking.`,
      platformSlug: "crm",
      triggerType: "event",
      triggerDescription: "New customer application, missed payment, or GPS alert",
      steps: [
        { order: 1, name: "Digital Credit Application", type: "ai_agent", description: "Mobile-friendly credit app with ID scan. AI evaluates ability-to-pay based on income verification. Instant approval or decline with compliant adverse action notices." },
        { order: 2, name: "Digital Deal Jacket", type: "action", description: "Automated contract generation: retail installment contract, buyer's guide, warranty disclosures. E-signature for all documents." },
        { order: 3, name: "Payment Collection Engine", type: "api_call", description: "Automated payment processing: ACH, debit card, cash tracking. Sends reminders 3 days before due date. Accepts partial payments with balance tracking." },
        { order: 4, name: "Collection Escalation Workflow", type: "condition", description: "Tiered collection: Day 1 text reminder → Day 3 call → Day 7 formal notice → Day 15 demand letter → Day 30 repo authorization. Each step auto-triggered." },
        { order: 5, name: "GPS Fleet Dashboard", type: "api_call", description: "Centralized GPS tracking for all financed vehicles. Geo-fence alerts, speed monitoring, starter-interrupt management. Single dashboard for entire portfolio." },
        { order: 6, name: "Repo & Recovery Management", type: "human_review", description: "Repo assignment workflow with GPS last-known location. Tracks recovery agent status. Auto-generates right-to-cure notices and deficiency balance calculations." },
        { order: 7, name: "Inventory & Reconditioning", type: "action", description: "Vehicle intake workflow: inspection checklist, repair cost tracking, reconditioning status. Auto-lists ready vehicles to website with photos." },
        { order: 8, name: "Compliance & Reporting", type: "ai_agent", description: "State-specific compliance tracking (title, registration, temp tags). Portfolio performance dashboards: delinquency rates, charge-offs, recovery rates." },
      ],
    },
    "healthcare": {
      name: `${clientName} — Clinical Operations Automation`,
      description: `Healthcare automation for ${clientName}: digital intake, AI phone system, insurance verification, and patient engagement.`,
      platformSlug: "crm",
      triggerType: "event",
      triggerDescription: "New patient registration, appointment scheduled, or prescription request",
      steps: [
        { order: 1, name: "Digital Patient Intake", type: "action", description: "Pre-visit digital forms: demographics, medical history, medications, allergies, consent forms. Auto-populates into EHR. Available via text link 48hrs before visit." },
        { order: 2, name: "Insurance Eligibility Verification", type: "api_call", description: "Real-time insurance verification at scheduling. Checks coverage, copay, deductible status. Alerts front desk of authorization requirements." },
        { order: 3, name: "AI Phone Agent", type: "ai_agent", description: "AI handles inbound calls: appointment scheduling, prescription refill requests, lab result inquiries, provider messages. Routes urgent matters to nurse line." },
        { order: 4, name: "Smart Appointment Scheduling", type: "ai_agent", description: "AI optimizes provider schedules. Matches appointment types to time slots. Manages same-day urgent care slots. Sends multi-channel reminders." },
        { order: 5, name: "Clinical Documentation Assist", type: "ai_agent", description: "AI assists with visit documentation: suggests ICD-10 codes based on notes, flags missing documentation for E/M level support." },
        { order: 6, name: "Prescription & Refill Automation", type: "condition", description: "Refill request workflow: patient request → provider review queue → pharmacy notification. Tracks controlled substance protocols separately." },
        { order: 7, name: "Preventive Care Recall Engine", type: "delay", description: "Automated patient recall: annual physicals, flu shots, screenings by age/gender/risk factors. Multi-channel outreach with self-scheduling links." },
        { order: 8, name: "Revenue Cycle Optimization", type: "api_call", description: "Claim submission tracking, denial management workflows, patient balance follow-up. Automated statement generation and payment plan setup." },
      ],
    },
    "ice-cream": {
      name: `${clientName} — Sweet Ops Automation`,
      description: `Seasonal business automation for ${clientName}: inventory management, mobile ordering, social media automation, and demand forecasting.`,
      platformSlug: "crm",
      triggerType: "event",
      triggerDescription: "Inventory threshold alert, pre-order received, or weather trigger",
      steps: [
        { order: 1, name: "Smart Inventory Tracking", type: "action", description: "Track every flavor, topping, and supply item. Automatic reorder alerts when inventory hits minimum levels. Supplier auto-ordering for staple items." },
        { order: 2, name: "Weather-Based Demand Forecasting", type: "ai_agent", description: "AI analyzes weather forecasts + historical sales data. Predicts daily demand by flavor. Recommends prep quantities to minimize waste and stockouts." },
        { order: 3, name: "Mobile Pre-Order System", type: "action", description: "Customers order ahead via web/app. Pick a time slot, skip the line. Payment processed at order. Reduces wait times by 60% during peak hours." },
        { order: 4, name: "Daily Flavor Board Automation", type: "ai_agent", description: "AI generates and posts today's flavor lineup across Instagram, TikTok, Facebook, and Google. Creates eye-catching graphics with seasonal themes." },
        { order: 5, name: "Social Media Content Engine", type: "ai_agent", description: "Automated content calendar: behind-the-scenes prep, customer spotlights, flavor polls, seasonal announcements. AI writes captions and suggests hashtags." },
        { order: 6, name: "Seasonal Staff Scheduler", type: "action", description: "Shift scheduling based on predicted demand. Auto-fills busy periods. Staff can swap shifts via app. Tracks hours for payroll." },
        { order: 7, name: "Loyalty & Punch Card System", type: "action", description: "Digital punch card: buy 10 get 1 free. Birthday rewards. Seasonal bonus points. All tracked automatically via phone number." },
        { order: 8, name: "Season Opening & Closing Playbooks", type: "delay", description: "Automated checklists for season startup (equipment, permits, hiring) and shutdown (inventory clearance, equipment winterization, social announcements)." },
      ],
    },
    "trucking": {
      name: `${clientName} — Fleet Operations Automation`,
      description: `Trucking automation for ${clientName}: driver compliance, dispatch optimization, fuel management, and automated billing.`,
      platformSlug: "crm",
      triggerType: "event",
      triggerDescription: "New load assignment, compliance expiration alert, or delivery completion",
      steps: [
        { order: 1, name: "Driver Compliance Tracker", type: "action", description: "Automated tracking of CDL renewals, medical certs, drug tests, HOS violations, annual MVR. Color-coded dashboard: green/yellow/red. 30/15/7-day alerts." },
        { order: 2, name: "Digital Dispatching", type: "ai_agent", description: "AI-powered load assignment: matches driver availability, location, HOS remaining, and equipment type to available loads. Real-time GPS tracking." },
        { order: 3, name: "Fuel Route Optimization", type: "ai_agent", description: "AI plans optimal routes considering fuel costs by station, traffic patterns, and delivery windows. Tracks fuel card transactions against planned stops." },
        { order: 4, name: "Electronic BOL & POD", type: "action", description: "Digital bill of lading generation at pickup. E-signature capture. Photo proof of delivery. Documents available instantly — no waiting for driver to return paperwork." },
        { order: 5, name: "Automated Invoicing", type: "api_call", description: "Invoice generated automatically at delivery confirmation. Attaches BOL, POD, and rate confirmation. Sends to broker/shipper. Tracks payment status." },
        { order: 6, name: "Maintenance & DVIR Tracking", type: "condition", description: "Pre/post-trip DVIR digital checklists. Defects auto-create maintenance work orders. PM scheduling based on mileage/hours. Parts inventory tracking." },
        { order: 7, name: "DOT Audit Ready Package", type: "ai_agent", description: "Continuously compiled audit files: driver qualification files, vehicle maintenance records, HOS logs, drug testing records. One-click DOT audit package." },
        { order: 8, name: "Profitability Analytics", type: "api_call", description: "Per-truck and per-lane profitability dashboards. Revenue per mile, cost per mile, deadhead percentage, fuel efficiency trends." },
      ],
    },
  };

  // Check for exact industry match
  if (templates[slug]) {
    return templates[slug];
  }

  // Generic fallback for industries without a specific template
  return {
    name: `${clientName} — Business Automation Suite`,
    description: `Custom automated workflow for ${clientName} covering client management, operations, and growth.`,
    platformSlug: "crm",
    triggerType: "event",
    triggerDescription: "New client inquiry, service request, or scheduled trigger",
    steps: [
      { order: 1, name: "AI Client Intake", type: "ai_agent", description: "AI captures new inquiries across all channels (phone, web, email, social). Extracts key details and creates client profile." },
      { order: 2, name: "Smart Lead Qualification", type: "ai_agent", description: "AI scores and qualifies leads based on service needs, budget signals, and urgency. Routes hot leads for immediate follow-up." },
      { order: 3, name: "Automated Scheduling", type: "action", description: "Self-service booking with real-time availability. Confirmation and reminder sequences to prevent no-shows." },
      { order: 4, name: "Service Delivery Tracking", type: "human_review", description: "Digital checklists and progress tracking during service delivery. Team assignments and status updates." },
      { order: 5, name: "Automated Invoicing & Payment", type: "api_call", description: "Auto-generate invoices at service completion. Accept payments via multiple methods. Track AR and send payment reminders." },
      { order: 6, name: "Client Follow-Up Engine", type: "delay", description: "Post-service satisfaction check. Automated review requests. Referral program triggers for happy clients." },
      { order: 7, name: "Recurring Service Automation", type: "condition", description: "Track service intervals and trigger proactive outreach for recurring needs. Membership and subscription management." },
      { order: 8, name: "Performance Analytics Dashboard", type: "ai_agent", description: "Revenue tracking, client retention metrics, team productivity, and growth opportunity identification." },
    ],
  };
}

// ══════════════════════════════════════════════════
// AI ACTIONS
// ══════════════════════════════════════════════════

// ── The main chat action ──
export const chat = action({
  args: {
    sessionId: v.id("onboardingSessions"),
    userMessage: v.string(),
  },
  handler: async (ctx, { sessionId, userMessage }): Promise<string> => {
    // Save user message
    await ctx.runMutation(api.onboardingAgent.addMessage, {
      sessionId,
      role: "client",
      content: userMessage,
    });

    // Get session state + history
    const session: any = await ctx.runQuery(api.onboardingAgent.getSession, { id: sessionId });
    if (!session) throw new Error("Session not found");

    const messages: any[] = await ctx.runQuery(api.onboardingAgent.getSessionMessages, { sessionId });

    // Build conversation history
    const conversationHistory = messages
      .slice(-20)
      .map((m: { role: string; content: string }) => `${m.role === "client" ? "Client" : "Agent"}: ${m.content}`)
      .join("\n\n");

    // Detect industry from full conversation
    const fullText = messages.map((m: { content: string }) => m.content).join(" ") + " " + userMessage;
    const detected = detectIndustry(fullText);

    // Determine conversation phase
    const clientMessageCount = messages.filter((m: { role: string }) => m.role === "client").length + 1;
    const hasIndustry = session.detectedIndustry || detected;
    const hasSize = session.businessSize || /\b(solo|small|medium|large|\d+\s*(employee|people|staff|person|team|worker))/i.test(fullText);
    const hasPainPoints = session.painPoints?.length || clientMessageCount >= 3;

    let phaseInstruction = "";

    if (!hasIndustry) {
      phaseInstruction = `PHASE: INDUSTRY DETECTION\nThe client hasn't clearly stated their industry yet. Ask them what type of business they run.`;
    } else if (!hasSize) {
      phaseInstruction = `PHASE: BUSINESS SIZE\nYou've identified the industry (${detected?.label || session.detectedIndustry}). Now ask about team size.`;
    } else if (!hasPainPoints) {
      phaseInstruction = `PHASE: PAIN POINTS\nAsk about their biggest operational headaches and what they wish was automated.`;
    } else if (clientMessageCount >= 4 && session.status === "intake") {
      phaseInstruction = `PHASE: READY\nYou have enough info. Tell them you'll now build their custom workflow. End with exactly: READY_TO_GENERATE`;
    }

    const systemPrompt = `You are the AI Workflow Builder Agent. Onboard clients by understanding their industry, operations, and pain points, then generate a custom workflow.

Session: ${session.clientName} | Industry: ${session.detectedIndustry || detected?.label || "unknown"} | Size: ${session.businessSize || "unknown"}
${phaseInstruction}

Rules: Be warm and professional. One question at a time. Under 150 words. Use **bold** for emphasis.

${conversationHistory}

Client: ${userMessage}

Agent:`;

    let aiResponse = await callAI(systemPrompt);
    let displayResponse = aiResponse.replace(/^Agent:\s*/i, "").replace("READY_TO_GENERATE", "").trim();

    // Fallback response if AI call fails
    if (!displayResponse) {
      if (!hasIndustry) {
        displayResponse = `Thanks for reaching out, ${session.clientName}! I'd love to help automate your business. Could you tell me — **what industry or type of business do you run?**`;
      } else if (!hasSize) {
        displayResponse = `Got it — **${detected?.label || session.detectedIndustry}**! Great industry with tons of automation potential. To tailor the right solution, **how many people are on your team?** Solo operator, small team, or larger?`;
      } else if (!hasPainPoints) {
        displayResponse = `Perfect. Now let's dig into the details — **what are your biggest operational headaches?** What tasks eat up the most time? What do you wish was automated?`;
      } else {
        displayResponse = `Excellent — I've got a clear picture of your business and the pain points we need to solve. **Let me build your custom workflow now** — give me just a moment to analyze your industry and create something tailored specifically for ${session.clientName}. 🔄`;
      }
    }

    // Check if we should trigger workflow generation
    const shouldGenerate = aiResponse.includes("READY_TO_GENERATE") || (clientMessageCount >= 4 && hasIndustry && hasPainPoints);

    // Update session with detected info
    const updates: Record<string, unknown> = {};
    if (detected && !session.detectedIndustry) {
      updates.detectedIndustry = detected.slug;
      updates.detectedPlatforms = detected.platforms;
    }

    // Extract business size
    const sizeMatch = fullText.match(/(\d+)\s*(employee|people|staff|person|team|worker)/i);
    if (sizeMatch && !session.businessSize) {
      const count = parseInt(sizeMatch[1]);
      if (count <= 1) updates.businessSize = "solo";
      else if (count <= 10) updates.businessSize = "small";
      else if (count <= 50) updates.businessSize = "medium";
      else updates.businessSize = "large";
    }
    if (/\bsolo\b|\bjust me\b|\bmyself\b|\bone.?man\b/i.test(fullText) && !session.businessSize) {
      updates.businessSize = "solo";
    }

    // Extract pain points from conversation
    if (clientMessageCount >= 3 && !session.painPoints?.length) {
      const painKeywords = fullText.match(/(?:headache|problem|pain|issue|struggle|hate|waste|lose|chaos|mess|manual|slow|overwhelm|nightmare)[^.!?]*/gi);
      if (painKeywords && painKeywords.length > 0) {
        updates.painPoints = painKeywords.slice(0, 5).map((p: string) => p.trim().substring(0, 100));
      }
    }

    if (Object.keys(updates).length > 0) {
      await ctx.runMutation(api.onboardingAgent.updateSession, {
        id: sessionId,
        ...updates,
      } as any);
    }

    // Save agent response
    await ctx.runMutation(api.onboardingAgent.addMessage, {
      sessionId,
      role: "agent",
      content: displayResponse,
    });

    // Trigger workflow generation
    if (shouldGenerate) {
      await ctx.runMutation(api.onboardingAgent.updateSession, {
        id: sessionId,
        status: "analyzing",
      } as any);

      try {
        await ctx.runAction(api.onboardingAgent.generateWorkflow, { sessionId });
      } catch (e) {
        console.error("Workflow generation error:", e);
      }
    }

    return displayResponse;
  },
});

// ── Generate workflow from session data ──
export const generateWorkflow = action({
  args: { sessionId: v.id("onboardingSessions") },
  handler: async (ctx, { sessionId }): Promise<any> => {
    const session: any = await ctx.runQuery(api.onboardingAgent.getSession, { id: sessionId });
    if (!session) throw new Error("Session not found");

    const messages: any[] = await ctx.runQuery(api.onboardingAgent.getSessionMessages, { sessionId });
    const conversationSummary = messages
      .map((m: { role: string; content: string }) => `${m.role}: ${m.content}`)
      .join("\n");

    const industrySlug = session.detectedIndustry || "general";

    // Get matching industry data from DB
    const industry: any = await ctx.runQuery(api.industries.getBySlug, { slug: industrySlug });

    // Try AI generation first
    const generatePrompt = `You are an expert workflow automation architect. Generate a custom workflow JSON for this business.

CLIENT: ${session.clientName} | INDUSTRY: ${industry?.name || industrySlug} | SIZE: ${session.businessSize || "small"}

CONVERSATION:
${conversationSummary}

Output ONLY valid JSON (no markdown, no code blocks):
{"name":"...","description":"...","platformSlug":"crm","triggerType":"event","triggerDescription":"...","steps":[{"order":1,"name":"...","type":"action|ai_agent|api_call|condition|delay|human_review","description":"..."}]}

Create 6-8 steps that directly address their stated pain points. Make it specific to their business, not generic.`;

    const aiResponse = await callAI(generatePrompt);

    let workflow = null;
    try {
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        // Validate the structure
        if (parsed.name && parsed.steps && Array.isArray(parsed.steps) && parsed.steps.length >= 3) {
          workflow = parsed;
        }
      }
    } catch (e) {
      console.error("Failed to parse AI workflow JSON:", e);
    }

    // Use industry-specific template as fallback
    if (!workflow) {
      workflow = getIndustryWorkflow(industrySlug, session.clientName, session.painPoints || []);
    }

    // Save as preview
    await ctx.runMutation(api.onboardingAgent.updateSession, {
      id: sessionId,
      status: "workflow_generated",
      generatedWorkflowPreview: workflow,
    } as any);

    // Post the workflow as an agent message
    const stepsDisplay = workflow.steps
      .map((s: { order: number; name: string; type: string; description: string }) =>
        `**Step ${s.order}: ${s.name}** (${s.type})\n${s.description}`
      )
      .join("\n\n");

    await ctx.runMutation(api.onboardingAgent.addMessage, {
      sessionId,
      role: "agent",
      content: `✅ **Your custom workflow is ready!**\n\n**${workflow.name}**\n${workflow.description}\n\n**Trigger:** ${workflow.triggerDescription}\n\n${stepsDisplay}\n\n---\n\nThis workflow is customized for your business. You can deploy it now or adjust any steps. Hit **Deploy Workflow** when you're ready to go live!`,
    });

    return workflow;
  },
});

// ── Deploy the generated workflow ──
export const deployWorkflow = action({
  args: { sessionId: v.id("onboardingSessions") },
  handler: async (ctx, { sessionId }): Promise<string> => {
    const session: any = await ctx.runQuery(api.onboardingAgent.getSession, { id: sessionId });
    if (!session) throw new Error("Session not found");
    if (!session.generatedWorkflowPreview) throw new Error("No workflow to deploy");

    const wf: any = session.generatedWorkflowPreview;

    const workflowId: any = await ctx.runMutation(api.workflows.create, {
      name: wf.name,
      industrySlug: session.detectedIndustry || undefined,
      platformSlug: wf.platformSlug || "crm",
      description: wf.description,
      triggerType: wf.triggerType || "event",
      triggerDescription: wf.triggerDescription || "Triggered by client action",
      steps: wf.steps.map((s: any) => ({
        order: s.order,
        name: s.name,
        type: s.type,
        description: s.description,
        config: s.config,
      })),
      isActive: true,
      isTemplate: false,
    });

    await ctx.runMutation(api.onboardingAgent.updateSession, {
      id: sessionId,
      status: "deployed",
      generatedWorkflowId: workflowId,
    } as any);

    await ctx.runMutation(api.onboardingAgent.addMessage, {
      sessionId,
      role: "agent",
      content: `🚀 **Workflow deployed successfully!**\n\nYour custom workflow "${wf.name}" is now live and active. It will automatically trigger when ${wf.triggerDescription.toLowerCase()}.\n\nYou can view and manage this workflow in the **Workflow Templates** section of the admin panel.`,
    });

    return workflowId;
  },
});

// ── Force-trigger workflow generation (manual) ──
export const triggerGeneration = action({
  args: { sessionId: v.id("onboardingSessions") },
  handler: async (ctx, { sessionId }): Promise<any> => {
    await ctx.runMutation(api.onboardingAgent.updateSession, {
      id: sessionId,
      status: "analyzing",
    } as any);

    await ctx.runMutation(api.onboardingAgent.addMessage, {
      sessionId,
      role: "agent",
      content: "Analyzing your business and building a custom workflow now... 🔄",
    });

    const workflow: any = await ctx.runAction(api.onboardingAgent.generateWorkflow, { sessionId });
    return workflow;
  },
});
