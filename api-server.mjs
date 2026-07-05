import express from 'express';
import pg from 'pg';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load .env manually
try {
  const envFile = readFileSync(join(__dirname, '.env'), 'utf8');
  for (const line of envFile.split('\n')) {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) process.env[match[1].trim()] = match[2].trim();
  }
} catch(e) {}

const app = express();
app.use(express.json({ limit: '10mb' }));

// CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

const JWT_SECRET = process.env.JWT_SECRET || 'aistaffing-jwt-secret-2026';
const pool = new pg.Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'aistaffing',
  user: process.env.DB_USER || 'appuser',
  password: process.env.DB_PASS || 'Genius2026AppUser!',
});

// ── Auth Middleware ──
function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'No token' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch(e) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

function optionalAuth(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (token) {
    try { req.user = jwt.verify(token, JWT_SECRET); } catch(e) {}
  }
  next();
}

// ── Health ──
app.get('/api/health', async (req, res) => {
  try {
    const r = await pool.query('SELECT NOW() as time, (SELECT count(*) FROM information_schema.tables WHERE table_schema=\'public\') as tables');
    res.json({ status: 'ok', time: r.rows[0].time, tables: r.rows[0].tables });
  } catch(e) {
    res.status(500).json({ status: 'error', error: e.message });
  }
});

// ══════════════════════════════════════
// AUTH ENDPOINTS
// ══════════════════════════════════════
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    const hash = crypto.createHash('sha256').update(password).digest('hex');
    const existing = await pool.query('SELECT id FROM users WHERE email=$1', [email]);
    if (existing.rows.length) return res.status(409).json({ error: 'Email taken' });
    const r = await pool.query('INSERT INTO users (email, name, password_hash) VALUES ($1,$2,$3) RETURNING id, email, name', [email, name, hash]);
    await pool.query('INSERT INTO platform_users (user_id, role) VALUES ($1, $2)', [r.rows[0].id, 'employer']);
    const token = jwt.sign({ id: r.rows[0].id, email, name, role: 'employer' }, JWT_SECRET, { expiresIn: '30d' });
    res.json({ token, user: r.rows[0] });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const hash = crypto.createHash('sha256').update(password).digest('hex');
    const r = await pool.query('SELECT u.id, u.email, u.name, pu.role FROM users u LEFT JOIN platform_users pu ON pu.user_id=u.id WHERE u.email=$1 AND u.password_hash=$2', [email, hash]);
    if (!r.rows.length) return res.status(401).json({ error: 'Invalid credentials' });
    const user = r.rows[0];
    const token = jwt.sign({ id: user.id, email: user.email, name: user.name, role: user.role || 'employer' }, JWT_SECRET, { expiresIn: '30d' });
    res.json({ token, user });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/auth/admin-login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const hash = crypto.createHash('sha256').update(password).digest('hex');
    const r = await pool.query('SELECT u.id, u.email, u.name FROM users u WHERE u.email=$1 AND u.password_hash=$2', [email, hash]);
    if (!r.rows.length) return res.status(401).json({ error: 'Invalid credentials' });
    const user = r.rows[0];
    await pool.query('INSERT INTO platform_users (user_id, role) VALUES ($1, $2) ON CONFLICT DO NOTHING', [user.id, 'admin']);
    await pool.query('UPDATE platform_users SET role=$1 WHERE user_id=$2', ['admin', user.id]);
    const token = jwt.sign({ id: user.id, email: user.email, name: user.name, role: 'admin' }, JWT_SECRET, { expiresIn: '30d' });
    res.json({ token, user: { ...user, role: 'admin' } });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/auth/me', authMiddleware, async (req, res) => {
  try {
    const r = await pool.query('SELECT u.id, u.email, u.name, pu.role FROM users u LEFT JOIN platform_users pu ON pu.user_id=u.id WHERE u.id=$1', [req.user.id]);
    if (!r.rows.length) return res.status(404).json({ error: 'User not found' });
    res.json(r.rows[0]);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/auth/role', authMiddleware, async (req, res) => {
  try {
    const r = await pool.query('SELECT role FROM platform_users WHERE user_id=$1', [req.user.id]);
    res.json({ role: r.rows[0]?.role || 'employer' });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/auth/set-role', authMiddleware, async (req, res) => {
  try {
    const { role } = req.body;
    await pool.query('INSERT INTO platform_users (user_id, role) VALUES ($1,$2) ON CONFLICT (user_id) DO UPDATE SET role=$2', [req.user.id, role]);
    res.json({ ok: true });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/auth/account', authMiddleware, async (req, res) => {
  try {
    await pool.query('DELETE FROM platform_users WHERE user_id=$1', [req.user.id]);
    await pool.query('DELETE FROM users WHERE id=$1', [req.user.id]);
    res.json({ ok: true });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// ══════════════════════════════════════
// ORGANIZATIONS
// ══════════════════════════════════════
app.get('/api/organizations', optionalAuth, async (req, res) => {
  try {
    const r = await pool.query('SELECT * FROM organizations ORDER BY created_at DESC');
    res.json(r.rows);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/organizations/mine', authMiddleware, async (req, res) => {
  try {
    const r = await pool.query('SELECT * FROM organizations WHERE owner_id=$1', [req.user.id]);
    res.json(r.rows[0] || null);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/organizations', authMiddleware, async (req, res) => {
  try {
    const { name, slug, industry, phone, email, website } = req.body;
    const r = await pool.query(
      'INSERT INTO organizations (name, slug, industry, phone, email, website, owner_id, onboarding_status) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *',
      [name, slug || name.toLowerCase().replace(/\s+/g, '-'), industry, phone, email, website, req.user.id, 'pending']
    );
    await pool.query('INSERT INTO org_members (org_id, user_id, role) VALUES ($1,$2,$3)', [r.rows[0].id, req.user.id, 'owner']);
    res.json(r.rows[0]);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/organizations/complete-onboarding', authMiddleware, async (req, res) => {
  try {
    await pool.query('UPDATE organizations SET onboarding_status=$1 WHERE owner_id=$2', ['active', req.user.id]);
    res.json({ ok: true });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/organizations/:id', authMiddleware, async (req, res) => {
  try {
    const { name, industry, phone, email, website, settings } = req.body;
    const r = await pool.query(
      'UPDATE organizations SET name=COALESCE($1,name), industry=COALESCE($2,industry), phone=COALESCE($3,phone), email=COALESCE($4,email), website=COALESCE($5,website), settings=COALESCE($6,settings), updated_at=NOW() WHERE id=$7 RETURNING *',
      [name, industry, phone, email, website, settings ? JSON.stringify(settings) : null, req.params.id]
    );
    res.json(r.rows[0]);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// ══════════════════════════════════════
// AGENT TEMPLATES
// ══════════════════════════════════════
app.get('/api/agent-templates', async (req, res) => {
  try {
    const r = await pool.query('SELECT * FROM agent_templates ORDER BY department, name');
    res.json(r.rows);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/agent-templates', async (req, res) => {
  try {
    const { name, department, description, base_system_prompt, default_persona, default_tools, pricing_model, base_price_cents, voice_id, icon, is_active } = req.body;
    const r = await pool.query(
      'INSERT INTO agent_templates (name, department, description, base_system_prompt, default_persona, default_tools, pricing_model, base_price_cents, voice_id, icon, is_active) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *',
      [name, department, description, base_system_prompt, default_persona ? JSON.stringify(default_persona) : null, default_tools, pricing_model, base_price_cents || 0, voice_id, icon, is_active !== false]
    );
    res.json(r.rows[0]);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// ══════════════════════════════════════
// DEPLOYMENTS
// ══════════════════════════════════════
app.get('/api/deployments', async (req, res) => {
  try {
    const { org_id, status } = req.query;
    let q = 'SELECT d.*, at.name as template_name, at.department, at.icon as template_icon, o.name as org_name FROM deployments d LEFT JOIN agent_templates at ON d.template_id=at.id LEFT JOIN organizations o ON d.org_id=o.id';
    const params = [];
    const where = [];
    if (org_id) { params.push(org_id); where.push(`d.org_id=$${params.length}`); }
    if (status) { params.push(status); where.push(`d.status=$${params.length}`); }
    if (where.length) q += ' WHERE ' + where.join(' AND ');
    q += ' ORDER BY d.created_at DESC';
    const r = await pool.query(q, params);
    res.json(r.rows);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/deployments', authMiddleware, async (req, res) => {
  try {
    const { org_id, template_id, display_name, system_prompt, persona, config } = req.body;
    const r = await pool.query(
      'INSERT INTO deployments (org_id, template_id, display_name, status, system_prompt, persona, config, deployed_at) VALUES ($1,$2,$3,$4,$5,$6,$7,NOW()) RETURNING *',
      [org_id, template_id, display_name, 'active', system_prompt, persona ? JSON.stringify(persona) : null, config ? JSON.stringify(config) : null]
    );
    res.json(r.rows[0]);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

app.patch('/api/deployments/:id/status', authMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    const r = await pool.query('UPDATE deployments SET status=$1, updated_at=NOW() WHERE id=$2 RETURNING *', [status, req.params.id]);
    res.json(r.rows[0]);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

app.patch('/api/deployments/:id/config', authMiddleware, async (req, res) => {
  try {
    const { config } = req.body;
    const r = await pool.query('UPDATE deployments SET config=$1, updated_at=NOW() WHERE id=$2 RETURNING *', [JSON.stringify(config), req.params.id]);
    res.json(r.rows[0]);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// ══════════════════════════════════════
// CONVERSATIONS & MESSAGES
// ══════════════════════════════════════
app.get('/api/conversations', async (req, res) => {
  try {
    const { org_id } = req.query;
    let q = 'SELECT c.*, d.display_name as agent_name FROM conversations c LEFT JOIN deployments d ON c.deployment_id=d.id';
    if (org_id) q += ` WHERE c.org_id=$1 ORDER BY c.started_at DESC`;
    else q += ' ORDER BY c.started_at DESC';
    const r = await pool.query(q, org_id ? [org_id] : []);
    res.json(r.rows);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/conversations/:id/messages', async (req, res) => {
  try {
    const r = await pool.query('SELECT * FROM messages WHERE conversation_id=$1 ORDER BY sent_at ASC, id ASC', [req.params.id]);
    res.json(r.rows);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/messages', async (req, res) => {
  try {
    const { deployment_id, session_id } = req.query;
    let q = 'SELECT * FROM messages WHERE 1=1';
    const params = [];
    if (deployment_id) { params.push(deployment_id); q += ` AND deployment_id=$${params.length}`; }
    if (session_id) { params.push(session_id); q += ` AND session_id=$${params.length}`; }
    q += ' ORDER BY COALESCE(sent_at, "timestamp", 0) ASC, id ASC';
    const r = await pool.query(q, params);
    res.json(r.rows);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/messages', async (req, res) => {
  try {
    const { conversation_id, deployment_id, session_id, role, content, visitor_name, visitor_email, tokens_used } = req.body;
    const now = Date.now();
    const r = await pool.query(
      'INSERT INTO messages (conversation_id, deployment_id, session_id, role, content, visitor_name, visitor_email, tokens_used, sent_at, "timestamp") VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$9) RETURNING *',
      [conversation_id, deployment_id, session_id, role, content, visitor_name, visitor_email, tokens_used, now]
    );
    res.json(r.rows[0]);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// ══════════════════════════════════════
// BILLING
// ══════════════════════════════════════
app.get('/api/billing/revenue', async (req, res) => {
  try {
    const contracts = await pool.query("SELECT * FROM contracts WHERE status='active'");
    const mrr = contracts.rows.reduce((sum, c) => sum + (c.monthly_rate_cents || 0), 0);
    const activeContracts = contracts.rows.length;
    res.json({
      mrr, formattedMRR: '$' + (mrr / 100).toLocaleString('en-US', { minimumFractionDigits: 2 }),
      arr: mrr * 12, formattedARR: '$' + ((mrr * 12) / 100).toLocaleString('en-US', { minimumFractionDigits: 2 }),
      activeContracts,
      totalRevenue: mrr, formattedTotalRevenue: '$' + (mrr / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })
    });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/billing/contracts', async (req, res) => {
  try {
    const { org_id } = req.query;
    let q = 'SELECT c.*, o.name as org_name, d.display_name as deployment_name FROM contracts c LEFT JOIN organizations o ON c.org_id=o.id LEFT JOIN deployments d ON c.deployment_id=d.id';
    if (org_id) q += ' WHERE c.org_id=$1';
    q += ' ORDER BY c.created_at DESC';
    const r = await pool.query(q, org_id ? [org_id] : []);
    res.json(r.rows);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/billing/invoices', async (req, res) => {
  try {
    const { org_id } = req.query;
    let q = 'SELECT i.*, o.name as org_name FROM invoices i LEFT JOIN organizations o ON i.org_id=o.id';
    if (org_id) q += ' WHERE i.org_id=$1';
    q += ' ORDER BY i.created_at DESC';
    const r = await pool.query(q, org_id ? [org_id] : []);
    res.json(r.rows);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/billing/spend', async (req, res) => {
  try {
    const { org_id } = req.query;
    const invoices = await pool.query("SELECT SUM(amount_cents) as total FROM invoices WHERE org_id=$1 AND status='paid'", [org_id]);
    res.json({ totalSpentCents: parseInt(invoices.rows[0]?.total || 0), formattedTotal: '$' + ((invoices.rows[0]?.total || 0) / 100).toFixed(2) });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/stripe/configured', async (req, res) => {
  res.json({ configured: !!process.env.STRIPE_SECRET_KEY });
});

// ══════════════════════════════════════
// ACTIVITY LOG
// ══════════════════════════════════════
app.get('/api/activity', async (req, res) => {
  try {
    const { org_id, limit } = req.query;
    let q = 'SELECT a.*, o.name as org_name FROM activity_log a LEFT JOIN organizations o ON a.org_id=o.id';
    const params = [];
    if (org_id) { params.push(org_id); q += ` WHERE a.org_id=$${params.length}`; }
    q += ' ORDER BY a.created_at DESC';
    if (limit) { params.push(parseInt(limit)); q += ` LIMIT $${params.length}`; }
    const r = await pool.query(q, params);
    res.json(r.rows);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/activity/stats', async (req, res) => {
  try {
    const { org_id } = req.query;
    const r = await pool.query('SELECT event_type, count(*) as count FROM activity_log WHERE org_id=$1 GROUP BY event_type', [org_id]);
    res.json(r.rows);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// ══════════════════════════════════════
// PLATFORM USERS
// ══════════════════════════════════════
app.get('/api/platform-users', async (req, res) => {
  try {
    const r = await pool.query('SELECT pu.*, u.email, u.name FROM platform_users pu LEFT JOIN users u ON pu.user_id=u.id ORDER BY pu.created_at DESC');
    res.json(r.rows);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// ══════════════════════════════════════
// INDUSTRIES
// ══════════════════════════════════════
app.get('/api/industries', async (req, res) => {
  try {
    const r = await pool.query('SELECT * FROM industries ORDER BY sort_order, name');
    res.json(r.rows);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/industries/stats', async (req, res) => {
  try {
    const total = await pool.query('SELECT count(*) as c FROM industries');
    const active = await pool.query("SELECT count(*) as c FROM industries WHERE is_active=true");
    const categories = await pool.query('SELECT category, count(*) as c FROM industries GROUP BY category');
    res.json({ total: parseInt(total.rows[0].c), active: parseInt(active.rows[0].c), categories: categories.rows });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/industries/toggle-active', async (req, res) => {
  try {
    const { id } = req.body;
    await pool.query('UPDATE industries SET is_active = NOT is_active WHERE id=$1', [id]);
    res.json({ ok: true });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/industries/update-multiplier', async (req, res) => {
  try {
    const { id, multiplier } = req.body;
    await pool.query('UPDATE industries SET multiplier=$1 WHERE id=$2', [multiplier, id]);
    res.json({ ok: true });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/industries/seed', async (req, res) => {
  try {
    const industries = [
      { name: 'Healthcare', slug: 'healthcare', icon: 'Heart', description: 'Hospitals, clinics, telehealth', category: 'original', multiplier: 1.5, features: ['HIPAA Compliance','Patient Scheduling','Medical Records'] },
      { name: 'Real Estate', slug: 'real-estate', icon: 'Home', description: 'Brokerages, property management', category: 'original', multiplier: 1.2, features: ['Lead Management','Property Listings','Client Portal'] },
      { name: 'Legal', slug: 'legal', icon: 'Scale', description: 'Law firms, legal services', category: 'original', multiplier: 1.4, features: ['Case Management','Document Automation','Client Intake'] },
      { name: 'Automotive', slug: 'automotive', icon: 'Car', description: 'Dealerships, service centers', category: 'original', multiplier: 1.1, features: ['Inventory Management','Service Scheduling','Customer Follow-up'] },
      { name: 'Insurance', slug: 'insurance', icon: 'Shield', description: 'Insurance agencies and brokers', category: 'original', multiplier: 1.3, features: ['Policy Management','Claims Processing','Quote Generation'] },
      { name: 'Financial Services', slug: 'financial-services', icon: 'DollarSign', description: 'Banking, lending, fintech', category: 'expanded', multiplier: 1.4, features: ['Loan Processing','KYC/AML','Portfolio Management'] },
      { name: 'Education', slug: 'education', icon: 'GraduationCap', description: 'Schools, universities, training', category: 'expanded', multiplier: 1.0, features: ['Student Management','Course Delivery','Certification'] },
    ];
    for (const ind of industries) {
      await pool.query(
        'INSERT INTO industries (name, slug, icon, description, category, multiplier, platform_ids, features, is_active, sort_order) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,true,$9) ON CONFLICT (slug) DO NOTHING',
        [ind.name, ind.slug, ind.icon, ind.description, ind.category, ind.multiplier, [], ind.features, industries.indexOf(ind)]
      );
    }
    res.json({ ok: true, count: industries.length });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// ══════════════════════════════════════
// CORE PLATFORMS
// ══════════════════════════════════════
app.get('/api/core-platforms', async (req, res) => {
  try {
    const r = await pool.query('SELECT * FROM core_platforms ORDER BY sort_order, name');
    res.json(r.rows);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/core-platforms/stats', async (req, res) => {
  try {
    const total = await pool.query('SELECT count(*) as c FROM core_platforms');
    const active = await pool.query("SELECT count(*) as c FROM core_platforms WHERE is_active=true");
    res.json({ total: parseInt(total.rows[0].c), active: parseInt(active.rows[0].c) });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/core-platforms/toggle-active', async (req, res) => {
  try {
    const { id } = req.body;
    await pool.query('UPDATE core_platforms SET is_active = NOT is_active WHERE id=$1', [id]);
    res.json({ ok: true });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/core-platforms/update-pricing', async (req, res) => {
  try {
    const { id, starter_price_cents, pro_price_cents, enterprise_price_cents } = req.body;
    await pool.query('UPDATE core_platforms SET starter_price_cents=COALESCE($1,starter_price_cents), pro_price_cents=COALESCE($2,pro_price_cents), enterprise_price_cents=COALESCE($3,enterprise_price_cents) WHERE id=$4',
      [starter_price_cents, pro_price_cents, enterprise_price_cents, id]);
    res.json({ ok: true });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/core-platforms/seed', async (req, res) => {
  try {
    const platforms = [
      { name: 'Business Command Center', slug: 'command-center', icon: 'LayoutDashboard', description: 'Central dashboard for all AI operations', features: ['Real-time Analytics','Agent Management','Workflow Builder'], ai_agents: ['Operations AI','Analytics AI'], starter: 29900, pro: 59900, enterprise: 149900 },
      { name: 'Customer Intelligence Hub', slug: 'customer-hub', icon: 'Users', description: 'AI-powered CRM and customer engagement', features: ['Smart CRM','Sentiment Analysis','Automated Follow-ups'], ai_agents: ['Sales AI','Support AI'], starter: 19900, pro: 49900, enterprise: 129900 },
      { name: 'Communication Engine', slug: 'comms-engine', icon: 'MessageSquare', description: 'Multi-channel communication automation', features: ['Voice AI','Email Automation','SMS Campaigns'], ai_agents: ['Voice Agent','Email AI','SMS AI'], starter: 24900, pro: 54900, enterprise: 139900 },
    ];
    for (const p of platforms) {
      await pool.query(
        'INSERT INTO core_platforms (name, slug, icon, description, features, ai_agents, starter_price_cents, pro_price_cents, enterprise_price_cents, is_active, sort_order) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,true,$10) ON CONFLICT (slug) DO NOTHING',
        [p.name, p.slug, p.icon, p.description, p.features, p.ai_agents, p.starter, p.pro, p.enterprise, platforms.indexOf(p)]
      );
    }
    res.json({ ok: true, count: platforms.length });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// ══════════════════════════════════════
// WORKFLOWS
// ══════════════════════════════════════
app.get('/api/workflows', async (req, res) => {
  try {
    const r = await pool.query('SELECT * FROM workflow_templates ORDER BY created_at DESC');
    res.json(r.rows);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/workflows/stats', async (req, res) => {
  try {
    const total = await pool.query('SELECT count(*) as c FROM workflow_templates');
    const active = await pool.query("SELECT count(*) as c FROM workflow_templates WHERE is_active=true");
    const templates = await pool.query("SELECT count(*) as c FROM workflow_templates WHERE is_template=true");
    res.json({ total: parseInt(total.rows[0].c), active: parseInt(active.rows[0].c), templates: parseInt(templates.rows[0].c) });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/workflows/toggle-active', async (req, res) => {
  try {
    const { id } = req.body;
    await pool.query('UPDATE workflow_templates SET is_active = NOT is_active WHERE id=$1', [id]);
    res.json({ ok: true });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/workflows/seed', async (req, res) => {
  try {
    const workflows = [
      { name: 'New Client Onboarding', industry_slug: null, platform_slug: 'command-center', description: 'Automated client onboarding workflow', trigger_type: 'event', trigger_description: 'New organization created', steps: [{ order: 1, name: 'Welcome Email', type: 'action', description: 'Send welcome email to new client' }, { order: 2, name: 'Setup Meeting', type: 'action', description: 'Schedule onboarding call' }] },
      { name: 'Lead Follow-up Sequence', industry_slug: 'real-estate', platform_slug: 'customer-hub', description: 'Automated lead nurturing', trigger_type: 'event', trigger_description: 'New lead captured', steps: [{ order: 1, name: 'Initial Contact', type: 'action', description: 'Send intro email' }, { order: 2, name: 'Follow-up Call', type: 'delay', description: 'Wait 24h then call' }] },
    ];
    for (const w of workflows) {
      await pool.query(
        'INSERT INTO workflow_templates (name, industry_slug, platform_slug, description, trigger_type, trigger_description, steps, is_active, is_template) VALUES ($1,$2,$3,$4,$5,$6,$7,true,true)',
        [w.name, w.industry_slug, w.platform_slug, w.description, w.trigger_type, w.trigger_description, JSON.stringify(w.steps)]
      );
    }
    res.json({ ok: true, count: workflows.length });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// ══════════════════════════════════════
// ONBOARDING AGENT
// ══════════════════════════════════════
app.get('/api/onboarding/sessions', async (req, res) => {
  try {
    const r = await pool.query('SELECT * FROM onboarding_sessions ORDER BY created_at DESC');
    res.json(r.rows);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/onboarding/sessions/:id', async (req, res) => {
  try {
    const r = await pool.query('SELECT * FROM onboarding_sessions WHERE id=$1', [req.params.id]);
    res.json(r.rows[0] || null);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/onboarding/sessions/:id/messages', async (req, res) => {
  try {
    const r = await pool.query('SELECT * FROM onboarding_messages WHERE session_id=$1 ORDER BY "timestamp" ASC', [req.params.id]);
    res.json(r.rows);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/onboarding/sessions', async (req, res) => {
  try {
    const { client_name, client_email, client_phone } = req.body;
    const now = Date.now();
    const r = await pool.query(
      'INSERT INTO onboarding_sessions (client_name, client_email, client_phone, status, created_at, updated_at) VALUES ($1,$2,$3,$4,$5,$5) RETURNING *',
      [client_name, client_email, client_phone, 'intake', now]
    );
    res.json(r.rows[0]);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/onboarding/sessions/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM onboarding_messages WHERE session_id=$1', [req.params.id]);
    await pool.query('DELETE FROM onboarding_sessions WHERE id=$1', [req.params.id]);
    res.json({ ok: true });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/onboarding/stats', async (req, res) => {
  try {
    const total = await pool.query('SELECT count(*) as c FROM onboarding_sessions');
    const byStatus = await pool.query('SELECT status, count(*) as c FROM onboarding_sessions GROUP BY status');
    res.json({ total: parseInt(total.rows[0].c), byStatus: byStatus.rows });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// ══════════════════════════════════════
// GATEWAY
// ══════════════════════════════════════
app.get('/api/gateway/stats', async (req, res) => {
  try {
    const total = await pool.query('SELECT count(*) as c FROM gateway_requests');
    const byStatus = await pool.query('SELECT status, count(*) as c FROM gateway_requests GROUP BY status');
    const byChannel = await pool.query('SELECT channel, count(*) as c FROM gateway_requests GROUP BY channel');
    const avgLatency = await pool.query('SELECT AVG(latency_ms) as avg FROM gateway_requests WHERE latency_ms IS NOT NULL');
    res.json({
      totalRequests: parseInt(total.rows[0].c),
      byStatus: byStatus.rows,
      byChannel: byChannel.rows,
      avgLatencyMs: parseFloat(avgLatency.rows[0]?.avg || 0)
    });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/gateway/connectors', async (req, res) => {
  try {
    const r = await pool.query('SELECT * FROM service_connectors ORDER BY name');
    res.json(r.rows);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/gateway/seed-connectors', async (req, res) => {
  try {
    const connectors = [
      { name: 'DocuSign', slug: 'docusign', type: 'esign', base_url: 'https://api.docusign.com', auth_type: 'oauth2', description: 'E-signature platform', capabilities: ['sign','template','envelope'], avg_latency_ms: 450 },
      { name: 'Twilio', slug: 'twilio', type: 'voice', base_url: 'https://api.twilio.com', auth_type: 'api_key', description: 'Voice and SMS platform', capabilities: ['call','sms','verify'], avg_latency_ms: 200 },
      { name: 'SendGrid', slug: 'sendgrid', type: 'email', base_url: 'https://api.sendgrid.com', auth_type: 'bearer', description: 'Email delivery platform', capabilities: ['send','template','analytics'], avg_latency_ms: 150 },
      { name: 'Stripe', slug: 'stripe', type: 'payment', base_url: 'https://api.stripe.com', auth_type: 'bearer', description: 'Payment processing', capabilities: ['charge','subscribe','invoice'], avg_latency_ms: 300 },
    ];
    for (const c of connectors) {
      await pool.query(
        'INSERT INTO service_connectors (name, slug, type, base_url, auth_type, description, capabilities, is_active, request_count, avg_latency_ms, error_rate) VALUES ($1,$2,$3,$4,$5,$6,$7,true,0,$8,0) ON CONFLICT (slug) DO NOTHING',
        [c.name, c.slug, c.type, c.base_url, c.auth_type, c.description, c.capabilities, c.avg_latency_ms]
      );
    }
    res.json({ ok: true, count: connectors.length });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/gateway/route', async (req, res) => {
  try {
    const { channel, org_id, agent_id, payload, priority } = req.body;
    const now = Date.now();
    const r = await pool.query(
      'INSERT INTO gateway_requests (channel, org_id, agent_id, payload, priority, status, created_at) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *',
      [channel, org_id, agent_id, JSON.stringify(payload), priority || 'normal', 'received', now]
    );
    res.json(r.rows[0]);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// ══════════════════════════════════════
// VOICE AGENT
// ══════════════════════════════════════
app.get('/api/voice/stats', async (req, res) => {
  try {
    const total = await pool.query('SELECT count(*) as c FROM voice_calls');
    const byStatus = await pool.query('SELECT status, count(*) as c FROM voice_calls GROUP BY status');
    const byOutcome = await pool.query('SELECT outcome, count(*) as c FROM voice_calls GROUP BY outcome');
    const avgDuration = await pool.query('SELECT AVG(duration_seconds) as avg FROM voice_calls WHERE duration_seconds IS NOT NULL');
    res.json({
      totalCalls: parseInt(total.rows[0].c),
      byStatus: byStatus.rows,
      byOutcome: byOutcome.rows,
      avgDurationSeconds: parseFloat(avgDuration.rows[0]?.avg || 0)
    });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/voice/calls', async (req, res) => {
  try {
    const r = await pool.query('SELECT * FROM voice_calls ORDER BY started_at DESC LIMIT 100');
    res.json(r.rows);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// ══════════════════════════════════════
// COMMUNICATIONS
// ══════════════════════════════════════
app.get('/api/communications/stats', async (req, res) => {
  try {
    const emailTotal = await pool.query('SELECT count(*) as c FROM email_messages');
    const smsTotal = await pool.query('SELECT count(*) as c FROM sms_messages');
    const emailByStatus = await pool.query('SELECT status, count(*) as c FROM email_messages GROUP BY status');
    const smsByStatus = await pool.query('SELECT status, count(*) as c FROM sms_messages GROUP BY status');
    const sequences = await pool.query('SELECT count(*) as c FROM email_sequences');
    res.json({
      emails: { total: parseInt(emailTotal.rows[0].c), byStatus: emailByStatus.rows },
      sms: { total: parseInt(smsTotal.rows[0].c), byStatus: smsByStatus.rows },
      sequences: parseInt(sequences.rows[0].c)
    });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/communications/email', async (req, res) => {
  try {
    const { org_id, to, subject, body, template_id, scheduled_for } = req.body;
    const now = Date.now();
    const r = await pool.query(
      'INSERT INTO email_messages (org_id, "to", subject, body, template_id, status, scheduled_for, created_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *',
      [org_id, to, subject, body, template_id, scheduled_for ? 'scheduled' : 'queued', scheduled_for, now]
    );
    res.json(r.rows[0]);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/communications/sms', async (req, res) => {
  try {
    const { org_id, to, message, media_url, campaign_id } = req.body;
    const now = Date.now();
    const r = await pool.query(
      'INSERT INTO sms_messages (org_id, "to", message, media_url, direction, status, campaign_id, is_opt_in_confirmation, created_at) VALUES ($1,$2,$3,$4,$5,$6,$7,false,$8) RETURNING *',
      [org_id, to, message, media_url, 'outbound', 'queued', campaign_id, now]
    );
    res.json(r.rows[0]);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// ══════════════════════════════════════
// ENTERPRISE AUTH
// ══════════════════════════════════════
app.get('/api/enterprise/users', async (req, res) => {
  try {
    const { org_id } = req.query;
    let q = 'SELECT * FROM enterprise_users';
    if (org_id) q += ' WHERE org_id=$1';
    q += ' ORDER BY created_at DESC';
    const r = await pool.query(q, org_id ? [org_id] : []);
    res.json(r.rows);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/enterprise/api-keys', async (req, res) => {
  try {
    const { org_id } = req.query;
    let q = 'SELECT * FROM api_keys';
    if (org_id) q += ' WHERE org_id=$1';
    q += ' ORDER BY created_at DESC';
    const r = await pool.query(q, org_id ? [org_id] : []);
    res.json(r.rows);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/enterprise/audit-log', async (req, res) => {
  try {
    const { limit } = req.query;
    const r = await pool.query('SELECT * FROM audit_log ORDER BY "timestamp" DESC LIMIT $1', [parseInt(limit) || 50]);
    res.json(r.rows);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/enterprise/roles', async (req, res) => {
  res.json([
    { id: 'super_admin', name: 'Super Admin', permissions: ['*'] },
    { id: 'agency_admin', name: 'Agency Admin', permissions: ['manage_org','manage_agents','manage_billing','view_analytics'] },
    { id: 'client_admin', name: 'Client Admin', permissions: ['manage_org','view_agents','view_billing'] },
    { id: 'client_user', name: 'Client User', permissions: ['view_agents','use_agents'] },
    { id: 'viewer', name: 'Viewer', permissions: ['view_agents','view_analytics'] },
  ]);
});

// ══════════════════════════════════════
// QUOTES
// ══════════════════════════════════════
app.get('/api/quotes', async (req, res) => {
  try {
    const r = await pool.query('SELECT * FROM quotes ORDER BY created_at DESC');
    res.json(r.rows);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/quotes', async (req, res) => {
  try {
    const { org_id, business_name, industry, contact_email, contact_phone, line_items, total_monthly_cents, human_equivalent_cents, savings_cents } = req.body;
    const now = Date.now();
    const r = await pool.query(
      'INSERT INTO quotes (org_id, business_name, industry, contact_email, contact_phone, line_items, total_monthly_cents, human_equivalent_cents, savings_cents, status, created_at, expires_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *',
      [org_id, business_name, industry, contact_email, contact_phone, JSON.stringify(line_items), total_monthly_cents, human_equivalent_cents, savings_cents, 'draft', now, now + 30*24*60*60*1000]
    );
    res.json(r.rows[0]);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// ══════════════════════════════════════
// CHAT AGENT
// ══════════════════════════════════════
app.get('/api/chat/conversations', async (req, res) => {
  try {
    const { deployment_id } = req.query;
    const r = await pool.query(
      'SELECT DISTINCT session_id, deployment_id, MIN(sent_at) as started, MAX(sent_at) as last_message, count(*) as message_count FROM messages WHERE deployment_id=$1 AND session_id IS NOT NULL GROUP BY session_id, deployment_id ORDER BY MAX(sent_at) DESC',
      [deployment_id]
    );
    res.json(r.rows);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/chat/messages', async (req, res) => {
  try {
    const { deployment_id, session_id } = req.query;
    const r = await pool.query(
      'SELECT * FROM messages WHERE deployment_id=$1 AND session_id=$2 ORDER BY COALESCE(sent_at, "timestamp", 0) ASC',
      [deployment_id, session_id]
    );
    res.json(r.rows);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// ══════════════════════════════════════
// WEBHOOKS
// ══════════════════════════════════════
app.post('/api/webhooks/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const event = req.body;
    await pool.query(
      'INSERT INTO stripe_events (stripe_event_id, type, data, processed_at) VALUES ($1,$2,$3,$4) ON CONFLICT (stripe_event_id) DO NOTHING',
      [event.id, event.type, JSON.stringify(event.data), Date.now()]
    );
    res.json({ received: true });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// Start
const PORT = process.env.API_PORT || 3070;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`AI Staffing API running on port ${PORT}`);
});
