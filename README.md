<p align="center">
  <img src="public/logo.png" alt="AI Staffing Agency" width="180" />
</p>

<h1 align="center">AI Staffing Agency</h1>
<p align="center"><strong>Multi-Vertical AI Operations Platform</strong></p>
<p align="center">The turnkey AI staffing solution for 22+ industries. Deploy intelligent AI agents that run your business operations 24/7.</p>
<p align="center">Built by <strong>TRG Tech Link</strong> • Powered by <strong>Genius Eye</strong></p>

---

## Brand Assets

| Asset | Path | Usage |
|-------|------|-------|
| **Primary Logo** (shield) | `public/logo.png` | Sidebar, admin header, documentation |
| **White Logo** | `public/logo-white.png` | Dark backgrounds, landing page, footer |
| **Icon (192px)** | `public/logo-192.png` | PWA icon, app shortcuts, social |
| **Favicon** | `public/favicon.png` | Browser tab icon |

**Brand Colors:**
- Primary Navy: `#0B1120` / `slate-950`
- Accent Amber: `#F59E0B`
- Light Gray: `#F1F5F9`
- Blue: `#3B82F6`
- Orange: `#F97316`

---

## Architecture

```
┌─────────────────────────────────────────────────┐
│               AI GATEWAY                        │
│   Central routing • Auth • Rate limiting        │
│   Analytics • Service connector registry        │
├─────────┬─────────┬─────────┬────────┬─────────┤
│  Voice  │  Email  │   SMS   │  Chat  │   API   │
│  Agent  │  Engine │  Engine │ Widget │  Direct  │
├─────────┴─────────┴─────────┴────────┴─────────┤
│            SERVICE CONNECTORS (10)              │
│  G-Sign • SealProof • YouKnowNow • Stripe      │
│  Stewart Solution • Stewart Money               │
│  Genius Eye Mail • Voice • Email • SMS          │
├────────────────────────────────────────────────┤
│            AI ENGINE                            │
│  Claude Opus 4 (customer-facing, primary)       │
│  GPT-4o-mini (backend tasks, fallback)          │
├────────────────────────────────────────────────┤
│            WORKFLOW ENGINE                      │
│  Industry-specific automation templates         │
│  AI agent builder • Human handoff               │
├────────────────────────────────────────────────┤
│            ENTERPRISE AUTH (RBAC)               │
│  5-tier roles • API keys • Audit log           │
│  Multi-tenant isolation                         │
└────────────────────────────────────────────────┘
```

## Supported Industries (22+)

Car Dealerships, Salons, Restaurants, Healthcare, Insurance, Trucking, Construction, HVAC, Plumbing, Electrical, Car Washes, Lawn Care, Barber Shops, Bakeries, Boutiques, E-commerce, Phone Companies, Marketing Firms, Mobile Mechanics, Photographers, Film Editors, Authors

## AI Agent Workforce

### Voice AI Personas (9 Industry-Specific)

| Persona | Industry | Specialty |
|---------|----------|-----------|
| Alex | Car Dealership | Sales & test drives |
| Sophie | Salon | Booking & styling |
| Mike | Car Wash | Service packages |
| Maria | Restaurant | Reservations & takeout |
| Dr. Sarah | Healthcare | Patient coordination |
| James | Insurance | Coverage & claims |
| Jake | Trucking | Dispatch & loads |
| Tom | Construction | Project coordination |
| Jordan | Default | Universal assistant |

### Agent Workforce Management
- 15 deployed AI agents across 12 industries
- 36 skills in 7 categories
- On/off toggle per agent
- Activity logging & shift tracking
- Internal messaging system
- Skill request & approval workflow

## Tech Stack

- **Frontend:** React + TypeScript + Tailwind CSS + shadcn/ui
- **Backend:** Convex (real-time database + serverless functions)
- **AI Engine (Primary):** Claude Opus 4 — customer-facing voice & email
- **AI Engine (Fallback):** GPT-4o-mini — backend routing, classification
- **Payments:** Stripe (connector ready)
- **Auth:** Enterprise RBAC (5-tier)
- **Database:** 36 tables with full indexing
- **Hosting:** Viktor Spaces (preview + production)

## API Endpoints (14)

```
POST /gateway             → Central AI router
GET  /gateway/stats       → Real-time analytics
POST /gateway/voice       → Voice AI agent
POST /gateway/email       → Email automation
POST /gateway/sms         → SMS messaging
POST /stripe/webhook      → Payment processing
POST /widget/chat         → Embeddable chat widget
GET  /widget/chat         → Chat widget loader
POST /onboarding/start    → Client onboarding flow
POST /onboarding/message  → Onboarding conversation
POST /onboarding/complete → Onboarding finalization
GET  /demo/sessions       → Demo session listing
POST /demo/start          → Start demo session
GET  /.well-known/openid  → OpenID configuration
```

## TRG Service Connectors (10)

| Service | Type | Status |
|---------|------|--------|
| G-Sign | Electronic Signatures | ✅ Active |
| SealProof | Online Notarization | ✅ Active |
| YouKnowNow | Background Checks & Screening | ✅ Active |
| Stripe Payments | Payment Processing | ✅ Active |
| Stewart Solution | HR, Payroll & Recruitment | ✅ Active |
| Stewart Money | Bookkeeping & Financial Services | ✅ Active |
| Genius Eye Mail | Email Platform | ✅ Active |
| TRG Voice Engine | AI Voice Calls | ✅ Active |
| TRG Email Engine | Email Automation | ✅ Active |
| TRG SMS Engine | SMS Messaging | ✅ Active |

## Add-On Services Marketplace

| Service | Tiers | Pricing |
|---------|-------|---------|
| Stewart Solution | Starter / Pro / Enterprise | $149–$599/mo |
| Stewart Money | Starter / Pro / Enterprise | $99–$399/mo |
| Genius Eye Mail | Starter / Pro / Enterprise | $29–$149/mo |
| YouKnowNow | Per-Check / Bundle / Unlimited | $9.99–$299/mo |
| G-Sign | Starter / Pro / Enterprise | $19–$99/mo |
| SealProof | Per-Session / Bundle / Unlimited | $24.99–$199/mo |

## Admin Dashboard Pages (17)

| Route | Page |
|-------|------|
| `/` | Public landing page (agent roster, pricing, industries) |
| `/admin/dashboard` | Platform overview & KPIs |
| `/admin/operations` | Operations Command Center |
| `/admin/workforce` | Agent Workforce Management |
| `/admin/client-portal` | Client-facing portal |
| `/admin/gateway` | AI Gateway management |
| `/admin/add-on-services` | Add-On Services marketplace |
| `/admin/industries` | Industry configuration |
| `/admin/platforms` | Core platform management |
| `/admin/workflows` | Workflow templates |
| `/admin/onboarding-agent` | AI Workflow Builder |
| `/admin/deployments` | Active deployments |
| `/admin/agents` | AI agent templates |
| `/admin/clients` | Client management |
| `/admin/invoices` | Billing & invoices |
| `/admin/revenue` | Revenue analytics |
| `/admin/users` | User management |
| `/admin/settings` | System settings |

## Environment Variables

```bash
# Required
ANTHROPIC_API_KEY=sk-ant-...     # Claude Opus 4 (primary AI engine)

# Optional (fallbacks)
OPENAI_API_KEY=sk-...            # GPT-4o-mini (fallback AI engine)
STRIPE_SECRET_KEY=sk_...         # Payment processing

# Auto-configured
JWKS=...                         # Auth keys
JWT_PRIVATE_KEY=...              # JWT signing
SITE_URL=...                     # Deployment URL
```

## Getting Started

```bash
# Install dependencies
npm install

# Set up Convex
npx convex dev

# Set environment variables
npx convex env set ANTHROPIC_API_KEY sk-ant-your-key-here

# Run development server
npm run dev

# Seed data
# Via Convex dashboard, run:
#   industries:seedIndustries
#   corePlatforms:seedPlatforms
#   gateway:seedConnectors
#   workflows:seedWorkflows
#   agentWorkforce:seedAgents
#   addOnServices:seedServices
```

## Deployment

```bash
# Deploy backend + frontend
npx convex deploy --cmd 'npm run build'
```

## Live URLs

- **Frontend:** https://preview-ai-staffing-agency-58b75145.viktor.space
- **Backend API:** https://posh-dodo-411.convex.site
- **GitHub:** https://github.com/BIGTRG/aistaffing

---

**Proprietary — TRG Tech Link © 2026**
