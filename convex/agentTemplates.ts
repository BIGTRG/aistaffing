import { query, internalMutation, action } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

/* ─── Clear all existing templates (for re-seeding) ─── */
export const clearAll = internalMutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("agentTemplates").collect();
    for (const t of existing) {
      await ctx.db.delete(t._id);
    }
  },
});

/* ─── Seed all 100 agent templates across 10 departments ─── */
export const seed = internalMutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("agentTemplates").collect();
    if (existing.length > 0) return; // already seeded

    const templates = [
      // ═══════════════════════════════════════════
      // FRONT OFFICE (10 agents)
      // ═══════════════════════════════════════════
      {
        name: "Virtual Receptionist",
        department: "Front Office",
        description: "Your always-on front desk. Answers every inbound call with a warm, professional greeting, takes detailed messages, routes callers to the right person, and ensures no opportunity slips through the cracks — even at 2 AM.",
        pricingModel: "flat_monthly",
        basePriceCents: 39900,
        icon: "Headphones",
      },
      {
        name: "Phone Triage Agent",
        department: "Front Office",
        description: "Intelligently screens and prioritizes incoming calls based on urgency, caller history, and business rules. Routes emergencies immediately, schedules callbacks for non-urgent matters, and filters spam so your team focuses on what matters.",
        pricingModel: "flat_monthly",
        basePriceCents: 44900,
        icon: "PhoneIncoming",
      },
      {
        name: "Live Chat Agent",
        department: "Front Office",
        description: "Handles real-time website chat conversations 24/7. Answers FAQs, captures visitor information, qualifies leads, and seamlessly escalates complex inquiries to your team — turning casual browsers into booked appointments.",
        pricingModel: "flat_monthly",
        basePriceCents: 34900,
        icon: "MessageCircle",
      },
      {
        name: "Appointment Setter",
        department: "Front Office",
        description: "Manages your entire booking flow from first contact to confirmation. Syncs with your calendar, sends reminders, handles rescheduling, and follows up on no-shows — keeping your schedule full and your revenue predictable.",
        pricingModel: "flat_monthly",
        basePriceCents: 34900,
        icon: "CalendarCheck",
      },
      {
        name: "After-Hours Answering Agent",
        department: "Front Office",
        description: "Takes over when your office closes. Handles calls, chats, and emails outside business hours with the same quality as your daytime staff. Captures leads, logs emergencies, and ensures customers never hit a dead end.",
        pricingModel: "flat_monthly",
        basePriceCents: 29900,
        icon: "Clock",
      },
      {
        name: "Bilingual Receptionist",
        department: "Front Office",
        description: "Serves your English and Spanish-speaking customers with equal fluency and professionalism. Automatically detects caller language preference and switches seamlessly — expanding your addressable market without hiring bilingual staff.",
        pricingModel: "flat_monthly",
        basePriceCents: 49900,
        icon: "Languages",
      },
      {
        name: "Queue Manager",
        department: "Front Office",
        description: "Orchestrates high call volumes during peak hours. Manages hold queues, provides estimated wait times, offers callback options, and distributes calls evenly across available agents — eliminating abandoned calls and frustrated customers.",
        pricingModel: "flat_monthly",
        basePriceCents: 39900,
        icon: "ListChecks",
      },
      {
        name: "Visitor Check-In Agent",
        department: "Front Office",
        description: "Digitizes your lobby experience. Greets visitors via tablet or kiosk, verifies appointments, notifies hosts, prints badges, and logs visit history — giving your business a polished, modern first impression.",
        pricingModel: "flat_monthly",
        basePriceCents: 24900,
        icon: "UserCheck",
      },
      {
        name: "Email Triage Agent",
        department: "Front Office",
        description: "Processes your general inbox around the clock. Categorizes incoming emails by urgency and topic, drafts initial responses, routes messages to the right department, and flags anything requiring immediate human attention.",
        pricingModel: "flat_monthly",
        basePriceCents: 29900,
        icon: "MailOpen",
      },
      {
        name: "Callback Scheduler",
        department: "Front Office",
        description: "Captures missed call details and automatically schedules callbacks at times convenient for both parties. Sends confirmation texts, reminds your team before each call, and tracks completion — so no lead goes cold.",
        pricingModel: "flat_monthly",
        basePriceCents: 24900,
        icon: "PhoneForwarded",
      },

      // ═══════════════════════════════════════════
      // SALES (10 agents)
      // ═══════════════════════════════════════════
      {
        name: "Lead Gen Specialist",
        department: "Sales",
        description: "Identifies and qualifies prospective customers from web forms, social media, directories, and inbound inquiries. Scores leads based on fit and intent, builds targeted prospect lists, and keeps your pipeline consistently full.",
        pricingModel: "flat_monthly",
        basePriceCents: 69900,
        icon: "Target",
      },
      {
        name: "Follow-Up Agent",
        department: "Sales",
        description: "Runs persistent, multi-touch follow-up sequences across email, SMS, and phone. Re-engages cold leads, nurtures warm prospects with relevant content, and ensures no deal dies from neglect — all on autopilot.",
        pricingModel: "flat_monthly",
        basePriceCents: 49900,
        icon: "RefreshCw",
      },
      {
        name: "BDC Agent",
        department: "Sales",
        description: "Your dedicated Business Development Center representative. Handles inbound sales inquiries, qualifies buyer intent, books appointments with your closers, and manages the critical handoff between marketing and sales.",
        pricingModel: "flat_monthly",
        basePriceCents: 59900,
        icon: "PhoneCall",
      },
      {
        name: "Quote Generator",
        department: "Sales",
        description: "Produces accurate, professional quotes and proposals in minutes. Pulls from your pricing catalog, applies volume discounts, generates branded PDFs, and tracks which quotes convert — giving you data to optimize pricing.",
        pricingModel: "flat_monthly",
        basePriceCents: 44900,
        icon: "FileText",
      },
      {
        name: "Pipeline Manager",
        department: "Sales",
        description: "Keeps your sales pipeline clean and actionable. Tracks every deal through stages, flags stalled opportunities, sends reminders to reps, forecasts close dates, and generates pipeline health reports for leadership.",
        pricingModel: "flat_monthly",
        basePriceCents: 79900,
        icon: "Workflow",
      },
      {
        name: "Cold Outreach Agent",
        department: "Sales",
        description: "Executes targeted outbound campaigns to new prospects. Crafts personalized emails, manages send schedules, tracks opens and replies, A/B tests subject lines, and books meetings with interested prospects.",
        pricingModel: "flat_monthly",
        basePriceCents: 59900,
        icon: "Send",
      },
      {
        name: "Upsell Specialist",
        department: "Sales",
        description: "Identifies expansion revenue opportunities within your existing customer base. Analyzes usage patterns, recommends upgrades and add-ons at the right moment, and increases average deal size without aggressive sales tactics.",
        pricingModel: "flat_monthly",
        basePriceCents: 54900,
        icon: "TrendingUp",
      },
      {
        name: "Contract Closer",
        department: "Sales",
        description: "Manages the final mile of your sales process. Sends contracts, tracks signature status, handles objections with approved responses, follows up on unsigned agreements, and celebrates closed deals with your team.",
        pricingModel: "flat_monthly",
        basePriceCents: 64900,
        icon: "Handshake",
      },
      {
        name: "Sales Forecaster",
        department: "Sales",
        description: "Turns your pipeline data into reliable revenue predictions. Analyzes historical close rates, seasonal patterns, and deal velocity to produce weekly and monthly forecasts your leadership team can actually trust.",
        pricingModel: "flat_monthly",
        basePriceCents: 69900,
        icon: "BarChart3",
      },
      {
        name: "Demo Scheduler",
        department: "Sales",
        description: "Converts inbound interest into booked product demos. Qualifies prospects, finds mutual availability, sends calendar invites with prep materials, and follows up post-demo to capture feedback and next steps.",
        pricingModel: "flat_monthly",
        basePriceCents: 39900,
        icon: "CalendarClock",
      },

      // ═══════════════════════════════════════════
      // MARKETING (10 agents)
      // ═══════════════════════════════════════════
      {
        name: "Social Media Manager",
        department: "Marketing",
        description: "Plans, creates, and publishes content across Instagram, Facebook, LinkedIn, and X. Monitors engagement, responds to comments, tracks trending topics in your industry, and delivers weekly performance analytics.",
        pricingModel: "flat_monthly",
        basePriceCents: 59900,
        icon: "Share2",
      },
      {
        name: "Content Writer",
        department: "Marketing",
        description: "Produces SEO-optimized blog posts, email newsletters, ad copy, landing pages, and social captions in your brand voice. Maintains an editorial calendar and ensures consistent publishing cadence that builds authority.",
        pricingModel: "flat_monthly",
        basePriceCents: 49900,
        icon: "PenTool",
      },
      {
        name: "SEO Specialist",
        department: "Marketing",
        description: "Drives organic search visibility through keyword research, on-page optimization, technical audits, and backlink analysis. Tracks ranking changes, identifies content gaps, and delivers monthly reports showing traffic growth.",
        pricingModel: "flat_monthly",
        basePriceCents: 59900,
        icon: "Search",
      },
      {
        name: "Email Marketing Agent",
        department: "Marketing",
        description: "Designs and executes email campaigns that convert. Segments your list, writes compelling copy, A/B tests subject lines and CTAs, manages automations and drip sequences, and maintains deliverability health.",
        pricingModel: "flat_monthly",
        basePriceCents: 49900,
        icon: "Mail",
      },
      {
        name: "Ad Campaign Manager",
        department: "Marketing",
        description: "Manages paid advertising across Google Ads, Meta, and LinkedIn. Sets up campaigns, manages budgets, optimizes bidding, tests creative variations, and reports on ROAS — stretching every ad dollar further.",
        pricingModel: "flat_monthly",
        basePriceCents: 79900,
        icon: "Megaphone",
      },
      {
        name: "Brand Monitor",
        department: "Marketing",
        description: "Tracks every mention of your brand, competitors, and industry keywords across social media, review sites, forums, and news. Alerts you to reputation risks, viral moments, and PR opportunities in real time.",
        pricingModel: "flat_monthly",
        basePriceCents: 44900,
        icon: "Eye",
      },
      {
        name: "PR / Outreach Agent",
        department: "Marketing",
        description: "Builds relationships with journalists, bloggers, and podcast hosts. Pitches story angles, manages media lists, coordinates press releases, and tracks coverage — growing your earned media presence systematically.",
        pricingModel: "flat_monthly",
        basePriceCents: 59900,
        icon: "Globe",
      },
      {
        name: "Analytics Reporter",
        department: "Marketing",
        description: "Consolidates marketing data from every channel into clear, actionable dashboards. Tracks KPIs, identifies what's working, spots declining campaigns early, and delivers weekly insights that guide budget decisions.",
        pricingModel: "flat_monthly",
        basePriceCents: 54900,
        icon: "BarChart2",
      },
      {
        name: "Video Content Planner",
        department: "Marketing",
        description: "Develops video content strategy for YouTube, TikTok, and Instagram Reels. Scripts short-form and long-form videos, plans production schedules, optimizes titles and thumbnails, and tracks view-to-conversion metrics.",
        pricingModel: "flat_monthly",
        basePriceCents: 54900,
        icon: "Video",
      },
      {
        name: "Influencer Coordinator",
        department: "Marketing",
        description: "Identifies relevant influencers in your niche, manages outreach and negotiations, coordinates content deliverables, tracks campaign performance, and calculates true ROI from influencer partnerships.",
        pricingModel: "flat_monthly",
        basePriceCents: 59900,
        icon: "Users",
      },

      // ═══════════════════════════════════════════
      // CUSTOMER SUCCESS (10 agents)
      // ═══════════════════════════════════════════
      {
        name: "Onboarding Specialist",
        department: "Customer Success",
        description: "Guides new customers through setup and first-value milestones. Sends welcome sequences, schedules kickoff calls, provides step-by-step tutorials, and tracks activation metrics — reducing time-to-value and early churn.",
        pricingModel: "flat_monthly",
        basePriceCents: 49900,
        icon: "Rocket",
      },
      {
        name: "Retention Agent",
        department: "Customer Success",
        description: "Monitors customer health scores and intervenes before churn happens. Identifies at-risk accounts through usage patterns, triggers win-back campaigns, offers targeted incentives, and escalates critical cases to your team.",
        pricingModel: "flat_monthly",
        basePriceCents: 59900,
        icon: "Heart",
      },
      {
        name: "Review Manager",
        department: "Customer Success",
        description: "Grows and protects your online reputation. Solicits reviews from satisfied customers at the right moment, responds to all reviews (positive and negative) professionally, and monitors Google, Yelp, and industry platforms.",
        pricingModel: "flat_monthly",
        basePriceCents: 39900,
        icon: "Star",
      },
      {
        name: "Customer Feedback Analyst",
        department: "Customer Success",
        description: "Collects and analyzes customer feedback from surveys, support tickets, reviews, and social media. Identifies recurring themes, sentiment trends, and product improvement opportunities — turning raw feedback into strategy.",
        pricingModel: "flat_monthly",
        basePriceCents: 49900,
        icon: "MessageSquare",
      },
      {
        name: "Loyalty Program Manager",
        department: "Customer Success",
        description: "Designs and manages customer loyalty and rewards programs. Tracks point balances, triggers milestone rewards, sends personalized offers, and measures program ROI — turning one-time buyers into lifetime advocates.",
        pricingModel: "flat_monthly",
        basePriceCents: 44900,
        icon: "Award",
      },
      {
        name: "Renewal Agent",
        department: "Customer Success",
        description: "Manages the entire contract renewal cycle. Sends timely reminders, highlights value delivered during the term, addresses concerns proactively, processes renewals, and flags accounts needing executive attention.",
        pricingModel: "flat_monthly",
        basePriceCents: 49900,
        icon: "Repeat",
      },
      {
        name: "NPS Survey Agent",
        department: "Customer Success",
        description: "Runs your Net Promoter Score program end to end. Distributes surveys at optimal touchpoints, categorizes responses, follows up with detractors, celebrates promoters, and tracks score trends over time.",
        pricingModel: "flat_monthly",
        basePriceCents: 34900,
        icon: "ClipboardList",
      },
      {
        name: "Issue Escalation Agent",
        department: "Customer Success",
        description: "Catches and routes critical customer issues before they become crises. Monitors support channels for high-severity signals, alerts the right team members instantly, tracks resolution time, and ensures SLA compliance.",
        pricingModel: "flat_monthly",
        basePriceCents: 39900,
        icon: "AlertTriangle",
      },
      {
        name: "Help Desk Tier 1",
        department: "Customer Success",
        description: "Resolves common customer issues instantly — password resets, order status checks, billing questions, how-to guides. Handles 70-80% of tickets autonomously and escalates complex cases with full context attached.",
        pricingModel: "flat_monthly",
        basePriceCents: 34900,
        icon: "MessageCirclePlus",
      },
      {
        name: "Knowledge Base Manager",
        department: "Customer Success",
        description: "Builds and maintains your self-service help center. Creates articles from support tickets, keeps documentation current, identifies content gaps, and tracks which articles deflect the most tickets — reducing support load.",
        pricingModel: "flat_monthly",
        basePriceCents: 39900,
        icon: "BookOpen",
      },

      // ═══════════════════════════════════════════
      // OPERATIONS (10 agents)
      // ═══════════════════════════════════════════
      {
        name: "Project Manager",
        department: "Operations",
        description: "Keeps projects on track from kickoff to delivery. Assigns tasks, tracks milestones, manages dependencies, sends deadline reminders, generates status reports, and flags risks before they derail timelines.",
        pricingModel: "flat_monthly",
        basePriceCents: 99900,
        icon: "ClipboardCheck",
      },
      {
        name: "Inventory Tracker",
        department: "Operations",
        description: "Monitors stock levels in real time across warehouses and locations. Sends reorder alerts before stockouts, tracks inventory turnover, reconciles discrepancies, and generates demand forecasts to optimize purchasing.",
        pricingModel: "flat_monthly",
        basePriceCents: 59900,
        icon: "Package",
      },
      {
        name: "Dispatch Coordinator",
        department: "Operations",
        description: "Optimizes field service and delivery routing. Assigns jobs to the nearest available technician, tracks real-time location, sends customer ETA updates, and ensures maximum jobs completed per day.",
        pricingModel: "flat_monthly",
        basePriceCents: 69900,
        icon: "Truck",
      },
      {
        name: "Process Optimizer",
        department: "Operations",
        description: "Analyzes your operational workflows to eliminate bottlenecks and waste. Maps current processes, identifies inefficiencies, recommends automation opportunities, and measures improvement after implementation.",
        pricingModel: "flat_monthly",
        basePriceCents: 89900,
        icon: "Cog",
      },
      {
        name: "Compliance Monitor",
        department: "Operations",
        description: "Tracks regulatory requirements and ensures your operations stay compliant. Monitors certification expiration dates, schedules inspections, generates compliance reports, and alerts you to regulatory changes in your industry.",
        pricingModel: "flat_monthly",
        basePriceCents: 79900,
        icon: "ShieldCheck",
      },
      {
        name: "Quality Assurance Agent",
        department: "Operations",
        description: "Maintains service and product quality standards. Runs checklists on deliverables, audits customer interactions, tracks defect rates, documents QA procedures, and generates quality trend reports for continuous improvement.",
        pricingModel: "flat_monthly",
        basePriceCents: 69900,
        icon: "CheckCircle2",
      },
      {
        name: "Vendor Manager",
        department: "Operations",
        description: "Manages supplier relationships and procurement. Tracks contracts, compares vendor pricing, monitors delivery performance, coordinates reorders, and negotiates better terms as your purchasing volume grows.",
        pricingModel: "flat_monthly",
        basePriceCents: 69900,
        icon: "Building2",
      },
      {
        name: "Fleet / Asset Tracker",
        department: "Operations",
        description: "Monitors your vehicles, equipment, and physical assets in real time. Tracks maintenance schedules, logs utilization rates, sends service reminders, and calculates total cost of ownership for smarter capital decisions.",
        pricingModel: "flat_monthly",
        basePriceCents: 59900,
        icon: "MapPin",
      },
      {
        name: "Shift Scheduler",
        department: "Operations",
        description: "Builds optimized staff schedules based on demand forecasts, employee availability, and labor regulations. Handles shift swaps, sends reminders, tracks overtime, and ensures adequate coverage at all times.",
        pricingModel: "flat_monthly",
        basePriceCents: 49900,
        icon: "CalendarDays",
      },
      {
        name: "Report Generator",
        department: "Operations",
        description: "Automatically compiles operational data into polished reports — daily summaries, weekly dashboards, monthly deep-dives. Pulls from multiple systems, highlights anomalies, and delivers on schedule without anyone asking.",
        pricingModel: "flat_monthly",
        basePriceCents: 44900,
        icon: "FileSpreadsheet",
      },

      // ═══════════════════════════════════════════
      // FINANCE & BILLING (10 agents)
      // ═══════════════════════════════════════════
      {
        name: "Invoice Manager",
        department: "Finance & Billing",
        description: "Generates and sends professional invoices on time, every time. Tracks payment status, sends automated reminders, matches payments to invoices, and maintains clean receivables records for accurate cash flow visibility.",
        pricingModel: "flat_monthly",
        basePriceCents: 49900,
        icon: "Receipt",
      },
      {
        name: "Collections Agent",
        department: "Finance & Billing",
        description: "Recovers overdue payments with persistent but professional follow-up. Sends graduated reminder sequences, negotiates payment plans, escalates delinquent accounts, and tracks collection rates — improving your cash conversion cycle.",
        pricingModel: "flat_monthly",
        basePriceCents: 59900,
        icon: "Banknote",
      },
      {
        name: "Payroll Assistant",
        department: "Finance & Billing",
        description: "Streamlines payroll processing by verifying time entries, calculating hours and overtime, flagging discrepancies, preparing payroll summaries, and ensuring deadlines are met — reducing errors and saving hours every pay period.",
        pricingModel: "flat_monthly",
        basePriceCents: 54900,
        icon: "Wallet",
      },
      {
        name: "Expense Tracker",
        department: "Finance & Billing",
        description: "Captures, categorizes, and reconciles business expenses automatically. Processes receipt images, enforces spending policies, flags out-of-policy expenses, and generates expense reports ready for approval.",
        pricingModel: "flat_monthly",
        basePriceCents: 39900,
        icon: "CreditCard",
      },
      {
        name: "Budget Analyst",
        department: "Finance & Billing",
        description: "Monitors spending against budgets across departments and projects. Tracks variance in real time, forecasts end-of-period spend, recommends reallocation, and alerts leadership when line items are trending over budget.",
        pricingModel: "flat_monthly",
        basePriceCents: 79900,
        icon: "Calculator",
      },
      {
        name: "Financial Reporter",
        department: "Finance & Billing",
        description: "Compiles financial statements, P&L reports, and cash flow summaries with accuracy and speed. Pulls data from your accounting system, highlights key metrics and trends, and delivers reports formatted for stakeholders.",
        pricingModel: "flat_monthly",
        basePriceCents: 69900,
        icon: "LineChart",
      },
      {
        name: "Tax Prep Assistant",
        department: "Finance & Billing",
        description: "Organizes financial records for tax season year-round. Categorizes deductible expenses, tracks estimated tax payments, prepares documentation packages for your CPA, and ensures nothing is missed at filing time.",
        pricingModel: "flat_monthly",
        basePriceCents: 59900,
        icon: "Landmark",
      },
      {
        name: "Payment Processor",
        department: "Finance & Billing",
        description: "Handles payment intake across credit cards, ACH, and invoicing. Processes transactions, sends confirmations, manages failed payment retries, tracks processing fees, and maintains PCI-compliant payment records.",
        pricingModel: "flat_monthly",
        basePriceCents: 44900,
        icon: "CircleDollarSign",
      },
      {
        name: "Accounts Receivable Agent",
        department: "Finance & Billing",
        description: "Manages your entire AR workflow. Tracks who owes what, applies payments, reconciles accounts, ages receivables, and produces AR reports that give you a clear picture of outstanding revenue at any moment.",
        pricingModel: "flat_monthly",
        basePriceCents: 54900,
        icon: "DollarSign",
      },
      {
        name: "Revenue Forecaster",
        department: "Finance & Billing",
        description: "Projects future revenue using historical data, pipeline analysis, and seasonal trends. Produces weekly rolling forecasts, scenario models (best/worst/expected), and variance reports — enabling confident financial planning.",
        pricingModel: "flat_monthly",
        basePriceCents: 79900,
        icon: "BadgeDollarSign",
      },

      // ═══════════════════════════════════════════
      // HR & RECRUITING (10 agents)
      // ═══════════════════════════════════════════
      {
        name: "Resume Screener",
        department: "HR & Recruiting",
        description: "Processes hundreds of applications in minutes. Parses resumes, scores candidates against job requirements, identifies standout qualifications, generates shortlists, and eliminates unconscious bias from initial screening.",
        pricingModel: "flat_monthly",
        basePriceCents: 49900,
        icon: "FileSearch",
      },
      {
        name: "Interview Scheduler",
        department: "HR & Recruiting",
        description: "Coordinates interviews across candidates, hiring managers, and panel members. Finds mutual availability, sends calendar invites, provides prep materials, manages rescheduling, and ensures a smooth candidate experience.",
        pricingModel: "flat_monthly",
        basePriceCents: 34900,
        icon: "Calendar",
      },
      {
        name: "Employee Onboarding Agent",
        department: "HR & Recruiting",
        description: "Delivers a structured onboarding experience for every new hire. Sends welcome packets, coordinates equipment setup, schedules orientation sessions, assigns training modules, and tracks completion through the first 90 days.",
        pricingModel: "flat_monthly",
        basePriceCents: 44900,
        icon: "UserPlus",
      },
      {
        name: "Benefits Coordinator",
        department: "HR & Recruiting",
        description: "Answers employee benefits questions instantly — health insurance, 401k, PTO policies, COBRA. Guides employees through enrollment periods, tracks eligibility, and ensures compliance with benefits regulations.",
        pricingModel: "flat_monthly",
        basePriceCents: 49900,
        icon: "GraduationCap",
      },
      {
        name: "Time-Off Manager",
        department: "HR & Recruiting",
        description: "Processes PTO requests, tracks accrual balances, enforces blackout dates, ensures minimum coverage, and maintains an accurate leave calendar. Employees get instant approvals while managers maintain full visibility.",
        pricingModel: "flat_monthly",
        basePriceCents: 29900,
        icon: "CalendarMinus",
      },
      {
        name: "Performance Review Agent",
        department: "HR & Recruiting",
        description: "Manages your performance review cycle from start to finish. Sends review reminders, collects 360-degree feedback, compiles self-assessments, generates review summaries, and tracks goal progress between cycles.",
        pricingModel: "flat_monthly",
        basePriceCents: 54900,
        icon: "ClipboardPen",
      },
      {
        name: "Training Coordinator",
        department: "HR & Recruiting",
        description: "Organizes and tracks employee training programs. Assigns courses based on role and skill gaps, sends completion reminders, tracks certifications, schedules recertification, and reports on team development progress.",
        pricingModel: "flat_monthly",
        basePriceCents: 44900,
        icon: "BookOpenCheck",
      },
      {
        name: "Candidate Outreach Agent",
        department: "HR & Recruiting",
        description: "Proactively sources and engages passive candidates. Crafts personalized outreach messages, manages talent pipelines, nurtures relationships over time, and surfaces qualified candidates when positions open.",
        pricingModel: "flat_monthly",
        basePriceCents: 59900,
        icon: "UserSearch",
      },
      {
        name: "Policy Compliance Agent",
        department: "HR & Recruiting",
        description: "Ensures your workplace policies are current and properly enforced. Tracks policy acknowledgments, alerts on regulatory changes, manages documentation, and answers employee questions about company policies instantly.",
        pricingModel: "flat_monthly",
        basePriceCents: 49900,
        icon: "Scale",
      },
      {
        name: "Workplace Culture Agent",
        department: "HR & Recruiting",
        description: "Monitors and strengthens company culture through pulse surveys, recognition programs, and engagement initiatives. Tracks employee sentiment, organizes team events, and flags culture concerns before they impact retention.",
        pricingModel: "flat_monthly",
        basePriceCents: 44900,
        icon: "HeartHandshake",
      },

      // ═══════════════════════════════════════════
      // IT & TECH SUPPORT (10 agents)
      // ═══════════════════════════════════════════
      {
        name: "IT Help Desk",
        department: "IT & Tech Support",
        description: "Your first line of technical support. Troubleshoots common issues — email problems, printer errors, software glitches, VPN connections. Resolves 70% of tickets instantly and escalates complex issues with full diagnostic context.",
        pricingModel: "flat_monthly",
        basePriceCents: 44900,
        icon: "Monitor",
      },
      {
        name: "Website Monitor",
        department: "IT & Tech Support",
        description: "Watches your website 24/7 for downtime, slow performance, broken links, and security issues. Sends instant alerts when problems are detected, logs incident history, and provides uptime reports for stakeholders.",
        pricingModel: "flat_monthly",
        basePriceCents: 29900,
        icon: "GlobeLock",
      },
      {
        name: "Security Alert Agent",
        department: "IT & Tech Support",
        description: "Monitors your systems for security threats — suspicious login attempts, malware indicators, data exfiltration patterns, and vulnerability disclosures. Sends real-time alerts and recommends immediate remediation steps.",
        pricingModel: "flat_monthly",
        basePriceCents: 59900,
        icon: "ShieldAlert",
      },
      {
        name: "Password Reset Agent",
        department: "IT & Tech Support",
        description: "Handles the #1 IT help desk request instantly. Verifies user identity, processes password resets securely, guides users through MFA setup, and logs all actions for security audit compliance.",
        pricingModel: "flat_monthly",
        basePriceCents: 19900,
        icon: "KeyRound",
      },
      {
        name: "System Admin Assistant",
        department: "IT & Tech Support",
        description: "Assists with routine sysadmin tasks — user account provisioning, permission management, software installations, system updates, and backup verification. Frees your IT team to focus on strategic projects.",
        pricingModel: "flat_monthly",
        basePriceCents: 54900,
        icon: "Server",
      },
      {
        name: "Software License Manager",
        department: "IT & Tech Support",
        description: "Tracks every software license, subscription, and SaaS tool across your organization. Monitors usage, flags unused licenses for reclamation, alerts on renewal dates, and ensures you're never over-provisioned or out of compliance.",
        pricingModel: "flat_monthly",
        basePriceCents: 39900,
        icon: "Key",
      },
      {
        name: "Data Backup Monitor",
        department: "IT & Tech Support",
        description: "Verifies that your data backups complete successfully every single time. Monitors backup jobs, validates data integrity, tests restoration procedures, alerts on failures, and maintains backup compliance documentation.",
        pricingModel: "flat_monthly",
        basePriceCents: 34900,
        icon: "HardDrive",
      },
      {
        name: "Network Monitor",
        department: "IT & Tech Support",
        description: "Watches your network infrastructure for outages, latency spikes, and bandwidth issues. Monitors routers, switches, and access points, sends alerts on anomalies, and provides performance trend reports.",
        pricingModel: "flat_monthly",
        basePriceCents: 39900,
        icon: "Network",
      },
      {
        name: "Cloud Infrastructure Monitor",
        department: "IT & Tech Support",
        description: "Monitors your cloud resources across AWS, Azure, or GCP. Tracks resource utilization, flags cost anomalies, alerts on service disruptions, recommends right-sizing, and ensures your cloud spend stays optimized.",
        pricingModel: "flat_monthly",
        basePriceCents: 54900,
        icon: "Cloud",
      },
      {
        name: "API Integration Agent",
        department: "IT & Tech Support",
        description: "Monitors and maintains integrations between your business systems. Detects broken API connections, tracks data sync status, alerts on failures, manages webhook endpoints, and ensures your tool stack works as one.",
        pricingModel: "flat_monthly",
        basePriceCents: 49900,
        icon: "Plug",
      },

      // ═══════════════════════════════════════════
      // LEGAL & COMPLIANCE (10 agents)
      // ═══════════════════════════════════════════
      {
        name: "Contract Review Assistant",
        department: "Legal & Compliance",
        description: "Analyzes contracts for risks, missing clauses, and unfavorable terms. Flags auto-renewal traps, liability exposure, and non-standard language — giving your legal team a head start on every agreement.",
        pricingModel: "flat_monthly",
        basePriceCents: 89900,
        icon: "FileScan",
      },
      {
        name: "NDA Generator",
        department: "Legal & Compliance",
        description: "Produces customized non-disclosure agreements in minutes. Selects the right template based on deal type, fills in party details, applies your preferred terms, and manages the signature workflow from draft to execution.",
        pricingModel: "flat_monthly",
        basePriceCents: 49900,
        icon: "FileSignature",
      },
      {
        name: "Compliance Checker",
        department: "Legal & Compliance",
        description: "Audits your business processes against industry regulations and internal policies. Runs compliance checklists, documents findings, tracks remediation, and generates audit-ready reports for regulators and leadership.",
        pricingModel: "flat_monthly",
        basePriceCents: 79900,
        icon: "BadgeCheck",
      },
      {
        name: "Regulatory Monitor",
        department: "Legal & Compliance",
        description: "Tracks regulatory changes across federal, state, and local jurisdictions relevant to your business. Summarizes new rules in plain language, assesses impact, and recommends compliance actions before deadlines hit.",
        pricingModel: "flat_monthly",
        basePriceCents: 69900,
        icon: "ScrollText",
      },
      {
        name: "Privacy (GDPR/CCPA) Agent",
        department: "Legal & Compliance",
        description: "Manages data privacy compliance across regulations. Handles data subject requests, maintains processing records, audits consent mechanisms, monitors data flows, and ensures your privacy policies stay current.",
        pricingModel: "flat_monthly",
        basePriceCents: 79900,
        icon: "Lock",
      },
      {
        name: "Dispute Resolution Agent",
        department: "Legal & Compliance",
        description: "Manages customer and vendor disputes before they escalate to litigation. Documents claims, proposes fair resolutions, tracks mediation progress, maintains communication logs, and protects your business relationships.",
        pricingModel: "flat_monthly",
        basePriceCents: 69900,
        icon: "Scale",
      },
      {
        name: "IP Monitor",
        department: "Legal & Compliance",
        description: "Protects your intellectual property by monitoring for trademark infringements, copyright violations, and unauthorized brand usage across the web, social media, and marketplaces — alerting you the moment issues arise.",
        pricingModel: "flat_monthly",
        basePriceCents: 59900,
        icon: "ScanSearch",
      },
      {
        name: "Document Filing Agent",
        department: "Legal & Compliance",
        description: "Organizes, indexes, and archives legal documents with proper retention policies. Manages version control, ensures documents are findable in seconds, tracks filing deadlines, and maintains chain-of-custody records.",
        pricingModel: "flat_monthly",
        basePriceCents: 39900,
        icon: "FolderOpen",
      },
      {
        name: "Legal Research Agent",
        department: "Legal & Compliance",
        description: "Researches legal questions, case precedents, and regulatory frameworks relevant to your business decisions. Summarizes findings in plain language, cites sources, and helps your team make informed decisions faster.",
        pricingModel: "flat_monthly",
        basePriceCents: 79900,
        icon: "BookSearch",
      },
      {
        name: "Trademark Watch Agent",
        department: "Legal & Compliance",
        description: "Continuously monitors trademark databases and the web for new filings or uses that could conflict with your marks. Sends early alerts on potential conflicts and provides analysis to support enforcement decisions.",
        pricingModel: "flat_monthly",
        basePriceCents: 49900,
        icon: "ScanEye",
      },

      // ═══════════════════════════════════════════
      // EXECUTIVE & STRATEGY (10 agents)
      // ═══════════════════════════════════════════
      {
        name: "CEO Advisor",
        department: "Executive & Strategy",
        description: "Your on-demand strategic partner. Analyzes market positioning, evaluates growth opportunities, reviews business performance, and provides actionable recommendations for scaling — like having a McKinsey consultant on retainer.",
        pricingModel: "flat_monthly",
        basePriceCents: 399900,
        icon: "Briefcase",
      },
      {
        name: "CFO Advisor",
        department: "Executive & Strategy",
        description: "Delivers executive-level financial guidance. Produces cash flow forecasts, evaluates investment decisions, models pricing scenarios, monitors financial health metrics, and prepares board-ready financial narratives.",
        pricingModel: "flat_monthly",
        basePriceCents: 349900,
        icon: "Coins",
      },
      {
        name: "CTO Advisor",
        department: "Executive & Strategy",
        description: "Provides technology leadership for your business. Evaluates build-vs-buy decisions, creates technology roadmaps, assesses vendor solutions, plans security architecture, and ensures your tech stack supports growth.",
        pricingModel: "flat_monthly",
        basePriceCents: 349900,
        icon: "Code",
      },
      {
        name: "COO / President",
        department: "Executive & Strategy",
        description: "Optimizes your entire operation. Coordinates cross-departmental initiatives, tracks company-wide KPIs, identifies process bottlenecks, manages strategic projects, and ensures every team is aligned and executing.",
        pricingModel: "flat_monthly",
        basePriceCents: 399900,
        icon: "BriefcaseBusiness",
      },
      {
        name: "Business Intelligence Agent",
        department: "Executive & Strategy",
        description: "Transforms your raw business data into strategic insights. Builds automated dashboards, identifies hidden trends, correlates data across departments, and delivers the intelligence your leadership team needs to act decisively.",
        pricingModel: "flat_monthly",
        basePriceCents: 299900,
        icon: "BrainCircuit",
      },
      {
        name: "Market Research Agent",
        department: "Executive & Strategy",
        description: "Conducts deep market analysis on demand. Sizes addressable markets, profiles target demographics, maps industry trends, surveys competitive landscapes, and delivers research briefs that power confident business decisions.",
        pricingModel: "flat_monthly",
        basePriceCents: 249900,
        icon: "SearchCheck",
      },
      {
        name: "Competitive Intel Agent",
        department: "Executive & Strategy",
        description: "Monitors your competitors' every move — pricing changes, product launches, marketing campaigns, hiring patterns, and customer reviews. Delivers weekly competitive briefings so you're never caught off guard.",
        pricingModel: "flat_monthly",
        basePriceCents: 249900,
        icon: "Binoculars",
      },
      {
        name: "Risk Assessment Agent",
        department: "Executive & Strategy",
        description: "Identifies and evaluates business risks across financial, operational, regulatory, and market dimensions. Maintains a living risk register, models potential impact scenarios, and recommends mitigation strategies.",
        pricingModel: "flat_monthly",
        basePriceCents: 249900,
        icon: "Activity",
      },
      {
        name: "Board Report Generator",
        department: "Executive & Strategy",
        description: "Produces polished board-ready reports automatically. Pulls KPIs from every department, writes executive summaries, visualizes performance trends, and formats everything to your board's specifications — saving days of prep work.",
        pricingModel: "flat_monthly",
        basePriceCents: 199900,
        icon: "FileChartLine",
      },
      {
        name: "Strategic Planning Agent",
        department: "Executive & Strategy",
        description: "Facilitates your strategic planning process. Analyzes strengths and weaknesses, models growth scenarios, benchmarks against industry peers, tracks OKR progress, and ensures your 1-year and 3-year plans stay actionable.",
        pricingModel: "flat_monthly",
        basePriceCents: 299900,
        icon: "Compass",
      },
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


