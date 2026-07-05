# AI Staffing Agency

**Multi-Vertical AI Operations Platform** — The turnkey AI staffing solution for 22+ industries.

Built by TRG Tech Link. Every small business gets an AI team that handles sales, customer service, scheduling, and operations — without enterprise pricing.

## Architecture

```
┌─────────────────────────────────────────────┐
│              AI GATEWAY                     │
│  Central routing • Auth • Rate limiting     │
│  Analytics • Service connector registry     │
├────────┬────────┬────────┬────────┬────────┤
│ Voice  │ Email  │  SMS   │  Chat  │  API   │
│ Agent  │ Engine │ Engine │ Widget │ Direct │
├────────┴────────┴────────┴────────┴────────┤
│           SERVICE CONNECTORS               │
│  G-Sign • SealProof • Background Check     │
│  Stripe • Voice • Email • SMS              │
├────────────────────────────────────────────┤
│           WORKFLOW ENGINE                  │
│  Industry-specific automation templates    │
│  AI agent builder • Human handoff          │
├────────────────────────────────────────────┤
│           ENTERPRISE AUTH (RBAC)           │
│  5-tier roles • API keys • Audit log      │
│  Multi-tenant isolation                    │
└────────────────────────────────────────────┘
```

## Supported Industries (22+)

Car Dealerships, Salons, Restaurants, Healthcare, Insurance, Trucking, Construction, HVAC, Plumbing, Electrical, Car Washes, Lawn Care, Barber Shops, Bakeries, Boutiques, E-commerce, Phone Companies, Marketing Firms, Mobile Mechanics, Photographers, Film Editors, Authors

## Voice AI Personas

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

## Tech Stack

- **Frontend:** React + TypeScript + Tailwind CSS + shadcn/ui
- **Backend:** Convex (real-time database + serverless functions)
- **AI:** GPT-4o-mini for voice, chat, and email composition
- **Payments:** Stripe
- **Auth:** Enterprise RBAC (5-tier)
- **Hosting:** Viktor Spaces (preview + production)

## API Endpoints

```
POST /gateway           → Central AI router
GET  /gateway/stats     → Real-time analytics
POST /gateway/voice     → Voice AI agent
POST /gateway/email     → Email automation
POST /gateway/sms       → SMS messaging
POST /stripe/webhook    → Payment processing
POST /widget/chat       → Embeddable chat widget
```

## TRG Service Connectors

| Service | Type | Status |
|---------|------|--------|
| G-Sign | Electronic Signatures | ✅ Active |
| SealProof | Online Notarization | ✅ Active |
| TRG Background Check | Screening & Verification | ✅ Active |
| Stripe Payments | Payment Processing | ✅ Active |
| TRG Voice Engine | AI Voice Calls | ✅ Active |
| TRG Email Engine | Email Automation | ✅ Active |
| TRG SMS Engine | SMS Messaging | ✅ Active |

## Admin Dashboard Pages

- `/admin/dashboard` — Overview & KPIs
- `/admin/operations` — Operations Command Center
- `/admin/client-portal` — Client-facing portal
- `/admin/gateway` — AI Gateway management
- `/admin/industries` — Industry configuration
- `/admin/platforms` — Core platform management
- `/admin/workflows` — Workflow templates
- `/admin/deployments` — Active deployments
- `/admin/agent-templates` — AI agent templates
- `/admin/onboarding-agent` — Onboarding assistant
- `/admin/clients` — Client management
- `/admin/invoices` — Billing & invoices
- `/admin/revenue` — Revenue analytics
- `/admin/users` — User management
- `/admin/settings` — System settings

## Getting Started

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env.local
# Add your Convex URL and API keys

# Run development server
npx convex dev    # Convex backend
npm run dev       # Vite frontend

# Seed data
# Industries: call industries:seedIndustries via Convex dashboard
# Platforms: call corePlatforms:seedPlatforms
# Connectors: call gateway:seedConnectors
# Workflows: call workflows:seedWorkflows
```

## License

Proprietary — TRG Tech Link © 2026
