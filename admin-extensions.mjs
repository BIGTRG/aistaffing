// Admin extensions: Add-On Services + Agent Workforce, migrated from Convex to PostgreSQL.
// Documents are stored as JSONB to preserve the exact field shapes the frontend expects.
// Called from api-server.mjs at boot: initAdminExtensions(pool) then registerAdminRoutes(app, pool, authMiddleware).

const TABLES = `
CREATE TABLE IF NOT EXISTS addon_services (
  id SERIAL PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  doc JSONB NOT NULL
);
CREATE TABLE IF NOT EXISTS addon_subscriptions (
  id SERIAL PRIMARY KEY,
  org_id TEXT NOT NULL,
  service_slug TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  doc JSONB NOT NULL
);
CREATE TABLE IF NOT EXISTS staff_agents (
  id SERIAL PRIMARY KEY,
  agent_id TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  doc JSONB NOT NULL
);
CREATE TABLE IF NOT EXISTS skill_catalog (
  id SERIAL PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  doc JSONB NOT NULL
);
CREATE TABLE IF NOT EXISTS agent_skills (
  id SERIAL PRIMARY KEY,
  agent_id TEXT NOT NULL,
  skill_slug TEXT NOT NULL,
  doc JSONB NOT NULL,
  UNIQUE (agent_id, skill_slug)
);
CREATE TABLE IF NOT EXISTS agent_activity_log (
  id SERIAL PRIMARY KEY,
  agent_id TEXT NOT NULL,
  ts BIGINT NOT NULL,
  doc JSONB NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_activity_agent_ts ON agent_activity_log (agent_id, ts DESC);
CREATE TABLE IF NOT EXISTS agent_shifts (
  id SERIAL PRIMARY KEY,
  agent_id TEXT NOT NULL,
  shift_date TEXT NOT NULL,
  doc JSONB NOT NULL
);
CREATE TABLE IF NOT EXISTS agent_messages (
  id SERIAL PRIMARY KEY,
  message_id TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'unread',
  ts BIGINT NOT NULL,
  doc JSONB NOT NULL
);
CREATE TABLE IF NOT EXISTS skill_requests (
  id SERIAL PRIMARY KEY,
  request_id TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  doc JSONB NOT NULL
);
`;

function withId(row) {
  return { ...row.doc, _id: String(row.id) };
}

export async function initAdminExtensions(pool) {
  await pool.query(TABLES);
  await seedAddOnServices(pool);
  await seedWorkforce(pool);
}

// ─────────────────────────────────────────────────────────────
// SEED: Add-On Services (TRG product marketplace)
// ─────────────────────────────────────────────────────────────
async function seedAddOnServices(pool) {
  const { rows } = await pool.query('SELECT COUNT(*)::int AS n FROM addon_services');
  if (rows[0].n === 0) {
    const now = Date.now();
    const services = [
      { name: 'Stewart Solution', slug: 'stewart-solution', description: 'HR, recruitment, and employee management. Post jobs, screen applicants, onboard employees, manage benefits, track compliance. For clients who hire humans alongside AI agents.', category: 'core', icon: 'users', connectorSlug: 'stewart-solution', pricingStarter: 149, pricingPro: 349, pricingEnterprise: 799, features: ['Job posting & applicant tracking','Employee onboarding workflows','Benefits administration','Compliance tracking & alerts','Offer letter generation','Performance review templates','Termination workflow management','HR document vault'] },
      { name: 'Stewart Money', slug: 'stewart-money', description: 'Bookkeeping, invoicing, and payroll. Process payroll, track expenses, generate financial reports, prepare taxes. Full back-office financial operations.', category: 'core', icon: 'dollar-sign', connectorSlug: 'stewart-money', pricingStarter: 99, pricingPro: 249, pricingEnterprise: 599, features: ['Invoicing & accounts receivable','Payroll processing','Expense tracking & categorization','Bank reconciliation','Financial reporting (P&L, balance sheet)','Tax preparation & filing support','Accounts payable management','Multi-entity bookkeeping'] },
      { name: 'Genius Eye Mail', slug: 'genius-eye-mail', description: 'Business email platform powered by AI. Custom domain email accounts, AI-native inbox, smart sorting, spam filtering. AI agents send and receive through your business domain.', category: 'core', icon: 'mail', connectorSlug: 'genius-eye-mail', pricingStarter: 29, pricingPro: 79, pricingEnterprise: 199, features: ['Custom domain email (you@yourbusiness.com)','AI-powered inbox sorting','Smart spam filtering','AI compose & reply suggestions','Shared team inboxes','Email forwarding & aliases','25GB storage per mailbox','Agent email integration (AI sends from your domain)'] },
      { name: 'YouKnowNow', slug: 'youknownow', description: 'AI-powered background checks and risk scoring. Criminal records, employment verification, education verification, credit checks, identity verification. Results in under 10 seconds.', category: 'core', icon: 'shield-check', connectorSlug: 'youknownow', pricingStarter: 49, pricingPro: 149, pricingEnterprise: 399, features: ['Criminal background checks','Employment verification','Education verification','Credit checks','Identity verification','AI risk scoring','Continuous monitoring alerts','Batch processing (bulk checks)'] },
      { name: 'G-Sign', slug: 'gsign', description: 'Electronic document signing. Create signature envelopes, send for signing, track status, download completed documents. DocuSign alternative owned by TRG.', category: 'core', icon: 'pen-tool', connectorSlug: 'gsign', pricingStarter: 19, pricingPro: 49, pricingEnterprise: 149, features: ['Unlimited signature requests','Reusable document templates','Multi-signer workflows','Audit trail & compliance','Mobile signing support','API integration with all platforms','Bulk send capability','Custom branding on envelopes'] },
      { name: 'SealProof', slug: 'sealproof', description: 'Remote online notarization. Schedule a notary session, verify identity, notarize documents via live video, generate certificates. Fully compliant with state regulations.', category: 'core', icon: 'stamp', connectorSlug: 'sealproof', pricingStarter: 25, pricingPro: 99, pricingEnterprise: 299, features: ['On-demand remote notarization','Identity verification (KBA + ID scan)','Live video notary sessions','Digital certificate generation','Full audit trail','Multi-state compliance','Bulk notarization scheduling','API integration for embedded notarization'] },
    ];
    for (const s of services) {
      const doc = { ...s, applicableIndustries: undefined, isActive: true, subscriberCount: 0, createdAt: now };
      await pool.query('INSERT INTO addon_services (slug, doc) VALUES ($1, $2) ON CONFLICT (slug) DO NOTHING', [s.slug, JSON.stringify(doc)]);
    }
  }

  const subCount = await pool.query('SELECT COUNT(*)::int AS n FROM addon_subscriptions');
  if (subCount.rows[0].n > 0) return;

  const { rows: svcRows } = await pool.query('SELECT id, slug, doc FROM addon_services');
  const svcMap = Object.fromEntries(svcRows.map((r) => [r.slug, r]));
  const now = Date.now();
  const clients = {
    'comfort-air-hvac': 'Comfort Air HVAC', 'bella-cucina': 'Bella Cucina Restaurant',
    'lakewood-family-med': 'Lakewood Family Medicine', 'premier-plumbing': 'Premier Plumbing Co',
    'bright-smile-dental': 'Bright Smile Dental', 'carolina-electric': 'Carolina Electric',
    'fresh-cuts-barber': 'Fresh Cuts Barbershop', 'summit-construction': 'Summit Construction',
  };
  const subs = [
    ['comfort-air-hvac','stewart-solution','pro'],['comfort-air-hvac','stewart-money','pro'],['comfort-air-hvac','genius-eye-mail','pro'],['comfort-air-hvac','gsign','starter'],['comfort-air-hvac','youknownow','pro'],
    ['bella-cucina','stewart-money','starter'],['bella-cucina','genius-eye-mail','starter'],['bella-cucina','gsign','starter'],
    ['lakewood-family-med','stewart-solution','enterprise'],['lakewood-family-med','stewart-money','enterprise'],['lakewood-family-med','genius-eye-mail','pro'],['lakewood-family-med','youknownow','enterprise'],['lakewood-family-med','gsign','pro'],['lakewood-family-med','sealproof','pro'],
    ['premier-plumbing','stewart-solution','starter'],['premier-plumbing','stewart-money','pro'],['premier-plumbing','youknownow','starter'],['premier-plumbing','genius-eye-mail','starter'],
    ['bright-smile-dental','stewart-money','pro'],['bright-smile-dental','genius-eye-mail','pro'],['bright-smile-dental','gsign','pro'],['bright-smile-dental','sealproof','starter'],
    ['carolina-electric','stewart-solution','pro'],['carolina-electric','stewart-money','pro'],['carolina-electric','youknownow','pro'],['carolina-electric','genius-eye-mail','starter'],
    ['fresh-cuts-barber','stewart-money','starter'],['fresh-cuts-barber','genius-eye-mail','starter'],
    ['summit-construction','stewart-solution','enterprise'],['summit-construction','stewart-money','enterprise'],['summit-construction','youknownow','enterprise'],['summit-construction','genius-eye-mail','pro'],['summit-construction','gsign','pro'],['summit-construction','sealproof','pro'],
  ];
  const counts = {};
  for (const [orgId, slug, tier] of subs) {
    const svc = svcMap[slug];
    if (!svc) continue;
    const price = tier === 'starter' ? svc.doc.pricingStarter : tier === 'pro' ? svc.doc.pricingPro : svc.doc.pricingEnterprise;
    const doc = {
      orgId, orgName: clients[orgId], serviceId: String(svc.id), serviceSlug: slug, serviceName: svc.doc.name,
      tier, status: 'active', monthlyPrice: price ?? 0,
      activatedAt: now - Math.floor(Math.random() * 30 * 86400000),
      lastBilledAt: now - Math.floor(Math.random() * 7 * 86400000),
      usageThisMonth: Math.floor(Math.random() * 500),
      usageLimit: tier === 'starter' ? 100 : tier === 'pro' ? 500 : undefined,
    };
    await pool.query('INSERT INTO addon_subscriptions (org_id, service_slug, status, doc) VALUES ($1,$2,$3,$4)', [orgId, slug, 'active', JSON.stringify(doc)]);
    counts[slug] = (counts[slug] ?? 0) + 1;
  }
  for (const [slug, n] of Object.entries(counts)) {
    await pool.query(`UPDATE addon_services SET doc = jsonb_set(doc, '{subscriberCount}', to_jsonb($1::int)) WHERE slug = $2`, [n, slug]);
  }
}

// ─────────────────────────────────────────────────────────────
// SEED: Agent Workforce (agents, skills, activity, shifts, comms)
// ─────────────────────────────────────────────────────────────
async function seedWorkforce(pool) {
  const { rows } = await pool.query('SELECT COUNT(*)::int AS n FROM staff_agents');
  if (rows[0].n > 0) return;

  const now = Date.now();
  const day = 86400000;

  const agents = [
    { agentId: 'AGT-0001', name: 'Sarah Mitchell', role: 'Front Desk Receptionist', department: 'front_desk', industry: 'hvac', assignedOrgName: 'CoolBreeze HVAC', avatar: 'SM', bio: 'Handles all inbound calls, schedules service appointments, and manages customer inquiries for HVAC companies.', personalityTraits: ['professional','warm','efficient'], performanceScore: 96, utilizationRate: 91, totalTasksCompleted: 4280, totalHoursWorked: 1420, responseTimeAvgMs: 340, escalationRate: 1.8 },
    { agentId: 'AGT-0002', name: 'Marcus Johnson', role: 'Sales Development Rep', department: 'sales', industry: 'insurance', assignedOrgName: 'SafeGuard Insurance', avatar: 'MJ', bio: 'Qualifies leads, books consultations, and follows up with prospects for insurance agencies.', personalityTraits: ['persuasive','persistent','knowledgeable'], performanceScore: 92, utilizationRate: 87, totalTasksCompleted: 3150, totalHoursWorked: 1280, responseTimeAvgMs: 420, escalationRate: 3.2 },
    { agentId: 'AGT-0003', name: 'Elena Rodriguez', role: 'Scheduling Coordinator', department: 'admin_ops', industry: 'healthcare', assignedOrgName: 'Sunrise Medical Clinic', avatar: 'ER', bio: 'Manages patient scheduling, appointment reminders, insurance verification, and patient intake for clinics.', personalityTraits: ['organized','compassionate','detail-oriented'], performanceScore: 98, utilizationRate: 94, totalTasksCompleted: 5620, totalHoursWorked: 1560, responseTimeAvgMs: 280, escalationRate: 1.2 },
    { agentId: 'AGT-0004', name: 'Devon Williams', role: 'Dispatch Coordinator', department: 'admin_ops', industry: 'plumbing', assignedOrgName: 'PipeFix Plumbing', avatar: 'DW', bio: 'Dispatches technicians, manages emergency calls, tracks job completion, and handles customer follow-ups.', personalityTraits: ['calm','decisive','multitasker'], performanceScore: 94, utilizationRate: 89, totalTasksCompleted: 3890, totalHoursWorked: 1380, responseTimeAvgMs: 310, escalationRate: 2.1 },
    { agentId: 'AGT-0005', name: 'Aisha Thompson', role: 'Marketing Assistant', department: 'marketing', industry: 'salon', assignedOrgName: 'Luxe Hair Studio', avatar: 'AT', bio: 'Creates social media content, manages review responses, sends promotional emails, and tracks campaign performance.', personalityTraits: ['creative','trendy','analytical'], performanceScore: 90, utilizationRate: 82, totalTasksCompleted: 2740, totalHoursWorked: 1100, responseTimeAvgMs: 520, escalationRate: 4.1 },
    { agentId: 'AGT-0006', name: 'James Carter', role: 'Accounts Receivable Clerk', department: 'finance', industry: 'construction', assignedOrgName: 'BuildRight Construction', avatar: 'JC', bio: 'Processes invoices, follows up on payments, manages billing disputes, and generates financial reports.', personalityTraits: ['precise','firm','thorough'], performanceScore: 93, utilizationRate: 86, totalTasksCompleted: 3420, totalHoursWorked: 1340, responseTimeAvgMs: 380, escalationRate: 2.8 },
    { agentId: 'AGT-0007', name: 'Olivia Chen', role: 'Customer Support Agent', department: 'support', industry: 'ecommerce', assignedOrgName: 'TrendSetters Online', avatar: 'OC', bio: 'Handles order inquiries, returns, shipping issues, and product questions for e-commerce stores.', personalityTraits: ['patient','empathetic','solution-oriented'], performanceScore: 95, utilizationRate: 93, totalTasksCompleted: 6120, totalHoursWorked: 1580, responseTimeAvgMs: 290, escalationRate: 1.5 },
    { agentId: 'AGT-0008', name: 'Robert Hayes', role: 'Fleet Coordinator', department: 'admin_ops', industry: 'trucking', assignedOrgName: 'Southeast Freight Lines', avatar: 'RH', bio: 'Manages fleet scheduling, driver communication, load assignments, DOT compliance tracking, and route optimization.', personalityTraits: ['organized','technical','reliable'], performanceScore: 91, utilizationRate: 88, totalTasksCompleted: 2980, totalHoursWorked: 1260, responseTimeAvgMs: 410, escalationRate: 3.5 },
    { agentId: 'AGT-0009', name: 'Keisha Brown', role: 'Booking Agent', department: 'front_desk', industry: 'barbershop', assignedOrgName: 'Crown Cuts Barbershop', avatar: 'KB', bio: 'Books appointments, manages walk-in queue, sends reminders, processes payments, and handles customer loyalty program.', personalityTraits: ['friendly','quick','organized'], performanceScore: 97, utilizationRate: 90, totalTasksCompleted: 4850, totalHoursWorked: 1440, responseTimeAvgMs: 250, escalationRate: 0.9 },
    { agentId: 'AGT-0010', name: 'Daniel Park', role: 'Order Manager', department: 'admin_ops', industry: 'restaurant', assignedOrgName: 'Spice Route Kitchen', avatar: 'DP', bio: 'Manages online orders, handles reservations, coordinates delivery logistics, and responds to customer reviews.', personalityTraits: ['fast','accurate','courteous'], performanceScore: 94, utilizationRate: 92, totalTasksCompleted: 5340, totalHoursWorked: 1500, responseTimeAvgMs: 320, escalationRate: 1.7 },
    { agentId: 'AGT-0011', name: 'Victoria Adams', role: 'Lead Qualifier', department: 'sales', industry: 'auto-dealership', assignedOrgName: 'Premier Auto Group', avatar: 'VA', bio: 'Handles inbound leads, qualifies buyers, schedules test drives, and manages follow-up sequences for dealerships.', personalityTraits: ['persuasive','knowledgeable','persistent'], performanceScore: 89, utilizationRate: 85, totalTasksCompleted: 2560, totalHoursWorked: 1180, responseTimeAvgMs: 460, escalationRate: 4.5 },
    { agentId: 'AGT-0012', name: 'Carlos Mendez', role: 'Estimate Coordinator', department: 'admin_ops', industry: 'electrical', assignedOrgName: 'BrightSpark Electric', avatar: 'CM', bio: 'Generates estimates, schedules inspections, manages permits tracking, and handles customer communications.', personalityTraits: ['technical','precise','professional'], performanceScore: 92, utilizationRate: 84, totalTasksCompleted: 2890, totalHoursWorked: 1220, responseTimeAvgMs: 400, escalationRate: 3.0 },
    { agentId: 'AGT-0013', name: 'Jasmine Wright', role: 'Virtual Office Manager', department: 'admin_ops', industry: 'lawn-care', assignedOrgName: 'GreenScape Lawn Care', avatar: 'JW', bio: 'Manages crew scheduling, customer quotes, seasonal service plans, equipment tracking, and invoice follow-ups.', personalityTraits: ['organized','friendly','proactive'], performanceScore: 93, utilizationRate: 87, totalTasksCompleted: 3210, totalHoursWorked: 1300, responseTimeAvgMs: 370, escalationRate: 2.4 },
    { agentId: 'AGT-0014', name: 'Nathan Pierce', role: 'Compliance Monitor', department: 'support', industry: 'healthcare', assignedOrgName: 'Sunrise Medical Clinic', avatar: 'NP', bio: 'Monitors HIPAA compliance, manages document workflows, tracks certifications, and handles audit preparation.', personalityTraits: ['meticulous','regulatory-focused','thorough'], performanceScore: 97, utilizationRate: 78, totalTasksCompleted: 1890, totalHoursWorked: 980, responseTimeAvgMs: 550, escalationRate: 5.2 },
    { agentId: 'AGT-0015', name: 'Mia Torres', role: 'Executive Assistant', department: 'admin_ops', industry: 'marketing-firm', assignedOrgName: 'Catalyst Marketing', avatar: 'MT', bio: 'Manages calendars, prepares meeting briefs, drafts client communications, tracks project deadlines, and handles vendor coordination.', personalityTraits: ['proactive','articulate','detail-oriented'], performanceScore: 95, utilizationRate: 91, totalTasksCompleted: 3680, totalHoursWorked: 1360, responseTimeAvgMs: 300, escalationRate: 1.9 },
  ];

  for (const a of agents) {
    const doc = {
      ...a, status: 'active', assignedOrgId: `org_${a.industry}`,
      hireDate: now - Math.floor(Math.random() * 180 * day),
      lastActiveAt: now - Math.floor(Math.random() * 3600000),
      currentShiftStart: now - Math.floor(Math.random() * 28800000),
    };
    await pool.query('INSERT INTO staff_agents (agent_id, status, doc) VALUES ($1,$2,$3) ON CONFLICT (agent_id) DO NOTHING', [a.agentId, 'active', JSON.stringify(doc)]);
  }

  const skills = [
    { name: 'Inbound Call Handling', slug: 'inbound-calls', category: 'communication', description: 'Answer and route inbound phone calls professionally', difficulty: 'basic', trainingTimeHours: 2 },
    { name: 'Outbound Calling', slug: 'outbound-calls', category: 'communication', description: 'Make proactive outbound calls for follow-ups, reminders, and sales', difficulty: 'intermediate', trainingTimeHours: 4 },
    { name: 'Email Composition', slug: 'email-compose', category: 'communication', description: 'Draft and send professional business emails', difficulty: 'basic', trainingTimeHours: 1 },
    { name: 'SMS/Text Messaging', slug: 'sms-messaging', category: 'communication', description: 'Send and manage SMS conversations with customers', difficulty: 'basic', trainingTimeHours: 1 },
    { name: 'Live Chat Support', slug: 'live-chat', category: 'communication', description: 'Handle real-time chat conversations on websites', difficulty: 'basic', trainingTimeHours: 2 },
    { name: 'Review Response Management', slug: 'review-response', category: 'communication', description: 'Respond to Google, Yelp, and social media reviews', difficulty: 'intermediate', trainingTimeHours: 3 },
    { name: 'Appointment Scheduling', slug: 'appointment-scheduling', category: 'scheduling', description: 'Book, reschedule, and cancel appointments', difficulty: 'basic', trainingTimeHours: 2 },
    { name: 'Dispatch Coordination', slug: 'dispatch', category: 'scheduling', description: 'Assign and route field technicians to job sites', difficulty: 'advanced', trainingTimeHours: 8 },
    { name: 'Calendar Management', slug: 'calendar-mgmt', category: 'scheduling', description: 'Manage multiple calendars, avoid conflicts, optimize time blocks', difficulty: 'intermediate', trainingTimeHours: 3 },
    { name: 'Reminder & Follow-up Automation', slug: 'reminders', category: 'scheduling', description: 'Send automated appointment reminders and follow-ups', difficulty: 'basic', trainingTimeHours: 2 },
    { name: 'Lead Qualification', slug: 'lead-qualification', category: 'sales', description: 'Score and qualify inbound leads based on criteria', difficulty: 'intermediate', trainingTimeHours: 4 },
    { name: 'Quote Generation', slug: 'quote-generation', category: 'sales', description: 'Generate price quotes and estimates for services', difficulty: 'intermediate', trainingTimeHours: 5 },
    { name: 'Follow-up Sequences', slug: 'follow-up-sequences', category: 'sales', description: 'Execute multi-touch follow-up campaigns for leads', difficulty: 'intermediate', trainingTimeHours: 4 },
    { name: 'Upselling & Cross-selling', slug: 'upsell-crosssell', category: 'sales', description: 'Identify and suggest additional services or upgrades', difficulty: 'advanced', trainingTimeHours: 6 },
    { name: 'Pipeline Management', slug: 'pipeline-mgmt', category: 'sales', description: 'Track and update deals through CRM pipeline stages', difficulty: 'intermediate', trainingTimeHours: 4 },
    { name: 'Invoice Generation', slug: 'invoice-generation', category: 'finance', description: 'Create and send invoices for completed work', difficulty: 'basic', trainingTimeHours: 2 },
    { name: 'Payment Processing', slug: 'payment-processing', category: 'finance', description: 'Process credit card and ACH payments via Stripe', difficulty: 'intermediate', trainingTimeHours: 3 },
    { name: 'Collections Follow-up', slug: 'collections', category: 'finance', description: 'Follow up on overdue invoices and manage payment plans', difficulty: 'advanced', trainingTimeHours: 5 },
    { name: 'Financial Reporting', slug: 'financial-reporting', category: 'finance', description: 'Generate revenue, expense, and profitability reports', difficulty: 'advanced', trainingTimeHours: 6 },
    { name: 'Expense Tracking', slug: 'expense-tracking', category: 'finance', description: 'Track and categorize business expenses', difficulty: 'basic', trainingTimeHours: 2 },
    { name: 'CRM Data Entry', slug: 'crm-data-entry', category: 'admin', description: 'Update and maintain customer records in the CRM', difficulty: 'basic', trainingTimeHours: 1 },
    { name: 'Document Management', slug: 'document-mgmt', category: 'admin', description: 'Organize, file, and retrieve business documents', difficulty: 'basic', trainingTimeHours: 2 },
    { name: 'Contract Processing', slug: 'contract-processing', category: 'admin', description: 'Process contracts via G-Sign, track signatures, manage renewals', difficulty: 'intermediate', trainingTimeHours: 4 },
    { name: 'Background Checks', slug: 'background-checks', category: 'admin', description: 'Initiate and track background checks via TRG BGC', difficulty: 'intermediate', trainingTimeHours: 3 },
    { name: 'Notarization Coordination', slug: 'notarization', category: 'admin', description: 'Coordinate document notarization via SealProof', difficulty: 'intermediate', trainingTimeHours: 3 },
    { name: 'Workflow Automation', slug: 'workflow-automation', category: 'technical', description: 'Create and manage automated business workflows', difficulty: 'advanced', trainingTimeHours: 8 },
    { name: 'Data Analysis & Reporting', slug: 'data-analysis', category: 'technical', description: 'Analyze business data and generate insights', difficulty: 'advanced', trainingTimeHours: 6 },
    { name: 'API Integration', slug: 'api-integration', category: 'technical', description: 'Connect and manage third-party API integrations', difficulty: 'expert', trainingTimeHours: 12 },
    { name: 'Knowledge Base Management', slug: 'kb-management', category: 'technical', description: 'Build and maintain industry-specific knowledge bases', difficulty: 'intermediate', trainingTimeHours: 4 },
    { name: 'HVAC Service Diagnostics', slug: 'hvac-diagnostics', category: 'industry_specific', description: 'Guide customers through basic HVAC troubleshooting', difficulty: 'advanced', trainingTimeHours: 8, industrySpecific: 'hvac' },
    { name: 'Insurance Policy Explanation', slug: 'insurance-policy', category: 'industry_specific', description: 'Explain coverage options, deductibles, and policy details', difficulty: 'advanced', trainingTimeHours: 10, industrySpecific: 'insurance' },
    { name: 'Medical Intake Processing', slug: 'medical-intake', category: 'industry_specific', description: 'Process patient intake forms and insurance verification', difficulty: 'advanced', trainingTimeHours: 8, industrySpecific: 'healthcare' },
    { name: 'Menu Management', slug: 'menu-mgmt', category: 'industry_specific', description: 'Update menus, handle dietary inquiries, manage specials', difficulty: 'intermediate', trainingTimeHours: 3, industrySpecific: 'restaurant' },
    { name: 'DOT Compliance Tracking', slug: 'dot-compliance', category: 'industry_specific', description: 'Track driver hours, inspections, and DOT compliance', difficulty: 'expert', trainingTimeHours: 12, industrySpecific: 'trucking' },
    { name: 'Permit Tracking', slug: 'permit-tracking', category: 'industry_specific', description: 'Track building permits, inspections, and code compliance', difficulty: 'advanced', trainingTimeHours: 6, industrySpecific: 'construction' },
    { name: 'Vehicle Inventory Management', slug: 'vehicle-inventory', category: 'industry_specific', description: 'Manage vehicle listings, pricing, and availability', difficulty: 'intermediate', trainingTimeHours: 4, industrySpecific: 'auto-dealership' },
  ];

  for (const s of skills) {
    const doc = { ...s, prerequisites: [], isActive: true };
    await pool.query('INSERT INTO skill_catalog (slug, doc) VALUES ($1,$2) ON CONFLICT (slug) DO NOTHING', [s.slug, JSON.stringify(doc)]);
  }

  const assignments = {
    'AGT-0001': [['inbound-calls','Inbound Call Handling',98],['appointment-scheduling','Appointment Scheduling',96],['email-compose','Email Composition',92],['sms-messaging','SMS/Text Messaging',90],['crm-data-entry','CRM Data Entry',94],['reminders','Reminder & Follow-up Automation',95],['hvac-diagnostics','HVAC Service Diagnostics',85]],
    'AGT-0002': [['outbound-calls','Outbound Calling',94],['lead-qualification','Lead Qualification',96],['follow-up-sequences','Follow-up Sequences',92],['pipeline-mgmt','Pipeline Management',88],['insurance-policy','Insurance Policy Explanation',91],['upsell-crosssell','Upselling & Cross-selling',87]],
    'AGT-0003': [['appointment-scheduling','Appointment Scheduling',99],['inbound-calls','Inbound Call Handling',95],['medical-intake','Medical Intake Processing',97],['reminders','Reminder & Follow-up Automation',96],['calendar-mgmt','Calendar Management',98],['document-mgmt','Document Management',90]],
    'AGT-0007': [['live-chat','Live Chat Support',97],['email-compose','Email Composition',94],['crm-data-entry','CRM Data Entry',92],['review-response','Review Response Management',89],['reminders','Reminder & Follow-up Automation',91]],
    'AGT-0009': [['appointment-scheduling','Appointment Scheduling',98],['inbound-calls','Inbound Call Handling',96],['payment-processing','Payment Processing',93],['sms-messaging','SMS/Text Messaging',95],['reminders','Reminder & Follow-up Automation',97]],
  };

  async function insertSkill(agentId, slug, name, prof, ageDays, usageBase, usageRange, errMax) {
    const doc = {
      agentId, skillSlug: slug, skillName: name, proficiency: prof, status: 'active',
      assignedAt: now - Math.floor(Math.random() * ageDays * day),
      usageCount: Math.floor(Math.random() * usageRange) + usageBase,
      errorRate: Math.random() * errMax,
    };
    await pool.query('INSERT INTO agent_skills (agent_id, skill_slug, doc) VALUES ($1,$2,$3) ON CONFLICT (agent_id, skill_slug) DO NOTHING', [agentId, slug, JSON.stringify(doc)]);
  }

  for (const [agentId, list] of Object.entries(assignments)) {
    for (const [slug, name, prof] of list) await insertSkill(agentId, slug, name, prof, 90, 100, 500, 3);
  }
  for (const a of agents) {
    if (!assignments[a.agentId]) {
      await insertSkill(a.agentId, 'inbound-calls', 'Inbound Call Handling', 88 + Math.floor(Math.random() * 10), 60, 50, 300, 4);
      await insertSkill(a.agentId, 'email-compose', 'Email Composition', 85 + Math.floor(Math.random() * 10), 60, 50, 300, 4);
      await insertSkill(a.agentId, 'crm-data-entry', 'CRM Data Entry', 82 + Math.floor(Math.random() * 15), 60, 50, 300, 4);
    }
  }

  const activityTypes = [
    { type: 'call_handled', cat: 'communication', titles: ['Answered inbound call','Completed service call','Handled customer inquiry call'] },
    { type: 'email_sent', cat: 'communication', titles: ['Sent appointment confirmation','Sent follow-up email','Sent invoice email'] },
    { type: 'appointment_booked', cat: 'scheduling', titles: ['Booked service appointment','Scheduled consultation','Rescheduled appointment'] },
    { type: 'invoice_created', cat: 'finance', titles: ['Generated service invoice','Created billing statement','Processed payment'] },
    { type: 'lead_captured', cat: 'sales', titles: ['Qualified new lead','Captured prospect info','Added lead to pipeline'] },
    { type: 'escalation', cat: 'support', titles: ['Escalated to human agent','Requested manager review','Flagged complex issue'] },
    { type: 'crm_update', cat: 'admin', titles: ['Updated customer record','Added contact notes','Updated deal stage'] },
    { type: 'report_generated', cat: 'admin', titles: ['Generated daily summary','Created performance report','Produced analytics export'] },
  ];
  const outcomes = ['success','success','success','success','partial','escalated'];

  for (let d = 0; d < 7; d++) {
    for (const a of agents) {
      const n = 8 + Math.floor(Math.random() * 20);
      for (let i = 0; i < n; i++) {
        const act = activityTypes[Math.floor(Math.random() * activityTypes.length)];
        const title = act.titles[Math.floor(Math.random() * act.titles.length)];
        const ts = now - d * day - Math.floor(Math.random() * day);
        const doc = {
          agentId: a.agentId, agentName: a.name, activityType: act.type, category: act.cat, title,
          description: `${a.name} ${title.toLowerCase()} for ${a.assignedOrgName}`,
          outcome: outcomes[Math.floor(Math.random() * outcomes.length)],
          durationMs: 10000 + Math.floor(Math.random() * 300000),
          clientId: `org_${a.industry}`, clientName: a.assignedOrgName, timestamp: ts,
        };
        await pool.query('INSERT INTO agent_activity_log (agent_id, ts, doc) VALUES ($1,$2,$3)', [a.agentId, ts, JSON.stringify(doc)]);
      }
    }
  }

  for (let d = 0; d < 7; d++) {
    const dateStr = new Date(now - d * day).toISOString().split('T')[0];
    for (const a of agents) {
      const doc = {
        agentId: a.agentId, agentName: a.name, date: dateStr,
        shiftStart: now - d * day - 28800000,
        shiftEnd: d === 0 ? undefined : now - d * day,
        status: d === 0 ? 'on_duty' : 'off_duty',
        tasksCompleted: 15 + Math.floor(Math.random() * 25),
        callsHandled: 5 + Math.floor(Math.random() * 15),
        emailsSent: 3 + Math.floor(Math.random() * 10),
        appointmentsBooked: 2 + Math.floor(Math.random() * 8),
        leadsGenerated: Math.floor(Math.random() * 5),
        escalations: Math.floor(Math.random() * 3),
        avgResponseTimeMs: 250 + Math.floor(Math.random() * 300),
        utilization: 75 + Math.floor(Math.random() * 20),
      };
      await pool.query('INSERT INTO agent_shifts (agent_id, shift_date, doc) VALUES ($1,$2,$3)', [a.agentId, dateStr, JSON.stringify(doc)]);
    }
  }

  const messages = [
    { fromId: 'AGT-0001', fromName: 'Sarah Mitchell', type: 'skill_request', priority: 'normal', subject: 'Requesting Quote Generation skill', body: "I've been receiving more requests from CoolBreeze HVAC customers asking for service estimates. Adding the Quote Generation skill would let me handle these directly instead of transferring to the office manager. This would reduce response time by approximately 45 minutes per estimate request." },
    { fromId: 'AGT-0003', fromName: 'Elena Rodriguez', type: 'anomaly', priority: 'high', subject: 'Unusual appointment cancellation pattern detected', body: "I've noticed a 340% increase in appointment cancellations at Sunrise Medical Clinic over the past 48 hours. 12 of the 18 cancellations cited 'insurance issues' as the reason. This may indicate a billing system or insurance verification problem that needs human investigation." },
    { fromId: 'AGT-0007', fromName: 'Olivia Chen', type: 'status_update', priority: 'normal', subject: 'Weekly performance summary — TrendSetters Online', body: 'This week I handled 847 customer inquiries: 612 via live chat, 185 via email, 50 via SMS. Resolution rate: 94.2%. Average response time: 18 seconds (chat), 12 minutes (email). Top issues: shipping delays (34%), return requests (22%), product availability (18%). Escalated 49 cases to human support (5.8%).' },
    { fromId: 'AGT-0008', fromName: 'Robert Hayes', type: 'escalation', priority: 'urgent', subject: 'DOT compliance alert — Driver hours exceeded', body: "Driver #127 (Mike Patterson) at Southeast Freight Lines has logged 62 hours in the past 7 days, exceeding the 60-hour/7-day DOT limit. I've flagged the violation and blocked further dispatches for this driver. Immediate human review required — potential FMCSA fine exposure." },
    { fromId: 'AGT-0011', fromName: 'Victoria Adams', type: 'skill_request', priority: 'normal', subject: 'Requesting Financial Reporting skill', body: 'Premier Auto Group has asked if I can generate monthly sales performance reports. Currently I can only track leads and deals in the pipeline, but the dealership GM wants automated reports showing conversion rates, average deal size, and sales rep performance. The Financial Reporting skill would let me produce these directly.' },
    { fromId: 'AGT-0014', fromName: 'Nathan Pierce', type: 'alert', priority: 'high', subject: 'HIPAA training certificates expiring', body: "3 staff members at Sunrise Medical Clinic have HIPAA training certificates expiring within 14 days. I've sent reminder emails but haven't received confirmation of renewal. If certificates lapse, the clinic may be non-compliant during any audit. Recommend human follow-up with HR department." },
    { fromId: 'AGT-0004', fromName: 'Devon Williams', type: 'question', priority: 'normal', subject: 'Handling after-hours emergency pricing', body: 'PipeFix Plumbing has been getting 3-5 emergency plumbing calls per night. Current pricing rules only cover standard business hours. Should I apply a 1.5x emergency rate automatically, or should each after-hours call be quoted individually? Need guidance on the pricing policy to program into my workflow.' },
    { fromId: 'AGT-0013', fromName: 'Jasmine Wright', type: 'task_report', priority: 'low', subject: 'Seasonal service plan renewals — Q3 status', body: "42 of 68 annual lawn care service plans are up for renewal this quarter. I've sent renewal notices to all 68 customers. So far: 28 renewed (41%), 6 declined (9%), 8 requested modified plans (12%), and 26 haven't responded yet (38%). Planning second outreach to non-responders next week." },
  ];

  for (let i = 0; i < messages.length; i++) {
    const m = messages[i];
    const messageId = `MSG-${String(i + 1).padStart(4, '0')}`;
    const ts = now - Math.floor(Math.random() * 7 * day);
    const status = i < 3 ? 'read' : 'unread';
    const doc = {
      messageId, fromAgentId: m.fromId, fromName: m.fromName, toName: 'Agency HQ',
      direction: 'agent_to_agency', type: m.type, priority: m.priority,
      subject: m.subject, body: m.body, status, timestamp: ts,
      readAt: i < 3 ? now - Math.floor(Math.random() * 2 * day) : undefined,
    };
    await pool.query('INSERT INTO agent_messages (message_id, status, ts, doc) VALUES ($1,$2,$3,$4) ON CONFLICT (message_id) DO NOTHING', [messageId, status, ts, JSON.stringify(doc)]);
  }

  const skillReqs = [
    { agentId: 'AGT-0001', agentName: 'Sarah Mitchell', skillSlug: 'quote-generation', skillName: 'Quote Generation', reason: 'Customers frequently request service estimates during calls. Currently escalating all estimate requests to office manager.', status: 'pending', priority: 'normal', hours: 5 },
    { agentId: 'AGT-0011', agentName: 'Victoria Adams', skillSlug: 'financial-reporting', skillName: 'Financial Reporting', reason: 'Dealership GM wants automated monthly sales performance reports.', status: 'pending', priority: 'normal', hours: 6 },
    { agentId: 'AGT-0005', agentName: 'Aisha Thompson', skillSlug: 'outbound-calls', skillName: 'Outbound Calling', reason: 'Need to call salon clients for appointment reminders and promotional campaigns.', status: 'approved', priority: 'normal', hours: 4 },
    { agentId: 'AGT-0010', agentName: 'Daniel Park', skillSlug: 'payment-processing', skillName: 'Payment Processing', reason: 'Restaurant wants to process phone orders with payment directly during the call.', status: 'in_training', priority: 'high', hours: 3 },
  ];

  for (let i = 0; i < skillReqs.length; i++) {
    const r = skillReqs[i];
    const requestId = `REQ-${String(i + 1).padStart(4, '0')}`;
    const approved = r.status === 'approved' || r.status === 'in_training';
    const doc = {
      requestId, agentId: r.agentId, agentName: r.agentName, skillSlug: r.skillSlug, skillName: r.skillName,
      reason: r.reason, status: r.status, priority: r.priority, estimatedTrainingHours: r.hours,
      approvedBy: approved ? 'Agency Admin' : undefined,
      approvedAt: approved ? now - 2 * day : undefined,
      createdAt: now - (3 + i) * day,
    };
    await pool.query('INSERT INTO skill_requests (request_id, status, doc) VALUES ($1,$2,$3) ON CONFLICT (request_id) DO NOTHING', [requestId, r.status, JSON.stringify(doc)]);
  }
}

// ─────────────────────────────────────────────────────────────
// ROUTES
// ─────────────────────────────────────────────────────────────
export function registerAdminRoutes(app, pool, authMiddleware) {
  const guard = authMiddleware;

  // ── Add-On Services ──
  app.get('/api/admin/addons/services', guard, async (req, res) => {
    const { rows } = await pool.query('SELECT id, doc FROM addon_services ORDER BY id ASC');
    res.json(rows.map(withId));
  });

  app.get('/api/admin/addons/services-active', guard, async (req, res) => {
    const { rows } = await pool.query(`SELECT id, doc FROM addon_services WHERE (doc->>'isActive')::boolean ORDER BY id ASC`);
    res.json(rows.map(withId));
  });

  app.get('/api/admin/addons/subscriptions', guard, async (req, res) => {
    const { rows } = await pool.query('SELECT id, doc FROM addon_subscriptions ORDER BY id ASC');
    res.json(rows.map(withId));
  });

  app.get('/api/admin/addons/stats', guard, async (req, res) => {
    const subs = (await pool.query('SELECT id, doc FROM addon_subscriptions')).rows.map(withId);
    const services = (await pool.query('SELECT id, doc FROM addon_services')).rows.map(withId);
    const activeSubs = subs.filter((s) => s.status === 'active');
    const totalMRR = activeSubs.reduce((sum, s) => sum + (s.monthlyPrice ?? 0), 0);
    const byService = {};
    for (const sub of activeSubs) {
      if (!byService[sub.serviceSlug]) byService[sub.serviceSlug] = { count: 0, mrr: 0, name: sub.serviceName };
      byService[sub.serviceSlug].count++;
      byService[sub.serviceSlug].mrr += sub.monthlyPrice ?? 0;
    }
    const byTier = {};
    for (const sub of activeSubs) byTier[sub.tier] = (byTier[sub.tier] ?? 0) + 1;
    res.json({
      totalServices: services.length,
      activeServices: services.filter((s) => s.isActive).length,
      totalSubscriptions: activeSubs.length,
      totalMRR, byService, byTier,
      trialCount: subs.filter((s) => s.status === 'trial').length,
      cancelledCount: subs.filter((s) => s.status === 'cancelled').length,
    });
  });

  // ── Agent Workforce ──
  app.get('/api/admin/workforce/agents', guard, async (req, res) => {
    const { status, department, industry } = req.query;
    let sql = 'SELECT id, doc FROM staff_agents';
    const params = [];
    if (status) { params.push(status); sql += ` WHERE status = $1`; }
    else if (department) { params.push(department); sql += ` WHERE doc->>'department' = $1`; }
    else if (industry) { params.push(industry); sql += ` WHERE doc->>'industry' = $1`; }
    sql += ' ORDER BY agent_id ASC';
    const { rows } = await pool.query(sql, params);
    res.json(rows.map(withId));
  });

  app.post('/api/admin/workforce/agent-status', guard, async (req, res) => {
    const { agentId, status } = req.body;
    if (!agentId || !status) return res.status(400).json({ error: 'agentId and status required' });
    await pool.query(
      `UPDATE staff_agents SET status = $1, doc = doc || jsonb_build_object('status', $1::text, 'lastActiveAt', $2::bigint) WHERE agent_id = $3`,
      [status, Date.now(), agentId]
    );
    res.json({ ok: true });
  });

  app.get('/api/admin/workforce/agent-skills', guard, async (req, res) => {
    const { agentId } = req.query;
    if (!agentId) return res.status(400).json({ error: 'agentId required' });
    const { rows } = await pool.query('SELECT id, doc FROM agent_skills WHERE agent_id = $1 ORDER BY id ASC', [agentId]);
    res.json(rows.map(withId));
  });

  app.get('/api/admin/workforce/skill-catalog', guard, async (req, res) => {
    const { category } = req.query;
    const { rows } = category
      ? await pool.query(`SELECT id, doc FROM skill_catalog WHERE doc->>'category' = $1 ORDER BY id ASC`, [category])
      : await pool.query('SELECT id, doc FROM skill_catalog ORDER BY id ASC');
    res.json(rows.map(withId));
  });

  app.get('/api/admin/workforce/activities', guard, async (req, res) => {
    const limit = Math.min(parseInt(req.query.limit ?? '100', 10) || 100, 500);
    const { agentId } = req.query;
    const { rows } = agentId
      ? await pool.query('SELECT id, doc FROM agent_activity_log WHERE agent_id = $1 ORDER BY ts DESC LIMIT $2', [agentId, limit])
      : await pool.query('SELECT id, doc FROM agent_activity_log ORDER BY ts DESC LIMIT $1', [limit]);
    res.json(rows.map(withId));
  });

  app.get('/api/admin/workforce/shifts', guard, async (req, res) => {
    const { date, agentId } = req.query;
    let result;
    if (date) result = await pool.query('SELECT id, doc FROM agent_shifts WHERE shift_date = $1 ORDER BY id ASC', [date]);
    else if (agentId) result = await pool.query('SELECT id, doc FROM agent_shifts WHERE agent_id = $1 ORDER BY shift_date DESC LIMIT 30', [agentId]);
    else result = await pool.query('SELECT id, doc FROM agent_shifts ORDER BY shift_date DESC LIMIT 100');
    res.json(result.rows.map(withId));
  });

  app.get('/api/admin/workforce/messages', guard, async (req, res) => {
    const limit = Math.min(parseInt(req.query.limit ?? '50', 10) || 50, 200);
    const { status, direction } = req.query;
    let result;
    if (status) result = await pool.query('SELECT id, doc FROM agent_messages WHERE status = $1 ORDER BY ts DESC LIMIT $2', [status, limit]);
    else if (direction) result = await pool.query(`SELECT id, doc FROM agent_messages WHERE doc->>'direction' = $1 ORDER BY ts DESC LIMIT $2`, [direction, limit]);
    else result = await pool.query('SELECT id, doc FROM agent_messages ORDER BY ts DESC LIMIT $1', [limit]);
    res.json(result.rows.map(withId));
  });

  app.post('/api/admin/workforce/message-status', guard, async (req, res) => {
    const { messageId, status } = req.body;
    if (!messageId || !status) return res.status(400).json({ error: 'messageId and status required' });
    const extra = {};
    if (status === 'read') extra.readAt = Date.now();
    if (status === 'resolved') extra.resolvedAt = Date.now();
    await pool.query(
      `UPDATE agent_messages SET status = $1, doc = doc || jsonb_build_object('status', $1::text) || $2::jsonb WHERE message_id = $3`,
      [status, JSON.stringify(extra), messageId]
    );
    res.json({ ok: true });
  });

  app.get('/api/admin/workforce/skill-requests', guard, async (req, res) => {
    const { status } = req.query;
    const { rows } = status
      ? await pool.query('SELECT id, doc FROM skill_requests WHERE status = $1 ORDER BY id DESC', [status])
      : await pool.query('SELECT id, doc FROM skill_requests ORDER BY id DESC');
    res.json(rows.map(withId));
  });

  app.post('/api/admin/workforce/skill-request', guard, async (req, res) => {
    const { requestId, status, approvedBy, denialReason } = req.body;
    if (!requestId || !status) return res.status(400).json({ error: 'requestId and status required' });
    const extra = { status };
    if (status === 'approved') { extra.approvedBy = approvedBy ?? 'Agency Admin'; extra.approvedAt = Date.now(); }
    if (status === 'completed') extra.completedAt = Date.now();
    if (status === 'denied') extra.denialReason = denialReason;
    await pool.query(
      `UPDATE skill_requests SET status = $1, doc = doc || $2::jsonb WHERE request_id = $3`,
      [status, JSON.stringify(extra), requestId]
    );
    res.json({ ok: true });
  });

  app.get('/api/admin/workforce/stats', guard, async (req, res) => {
    const agents = (await pool.query('SELECT id, doc FROM staff_agents')).rows.map(withId);
    const active = agents.filter((a) => a.status === 'active');
    const paused = agents.filter((a) => a.status === 'paused');
    const training = agents.filter((a) => a.status === 'training');
    const activities = (await pool.query('SELECT id, doc FROM agent_activity_log ORDER BY ts DESC LIMIT 500')).rows.map(withId);
    const unread = (await pool.query(`SELECT COUNT(*)::int AS n FROM agent_messages WHERE status = 'unread'`)).rows[0].n;
    const pendingReqs = (await pool.query(`SELECT COUNT(*)::int AS n FROM skill_requests WHERE status = 'pending'`)).rows[0].n;

    const totalTasks = agents.reduce((sum, a) => sum + (a.totalTasksCompleted ?? 0), 0);
    const avgPerformance = agents.length ? Math.round(agents.reduce((s, a) => s + (a.performanceScore ?? 0), 0) / agents.length) : 0;
    const avgUtilization = active.length ? Math.round(active.reduce((s, a) => s + (a.utilizationRate ?? 0), 0) / active.length) : 0;
    const avgResponseTime = agents.length ? Math.round(agents.reduce((s, a) => s + (a.responseTimeAvgMs ?? 0), 0) / agents.length) : 0;

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayActivityCount = activities.filter((a) => a.timestamp >= todayStart.getTime()).length;

    const activityByType = {};
    for (const a of activities.slice(0, 200)) activityByType[a.activityType] = (activityByType[a.activityType] ?? 0) + 1;

    res.json({
      totalAgents: agents.length, activeAgents: active.length, pausedAgents: paused.length,
      trainingAgents: training.length, totalTasks, avgPerformance, avgUtilization, avgResponseTime,
      unreadMessages: unread, pendingSkillRequests: pendingReqs, todayActivityCount, activityByType,
    });
  });
}
