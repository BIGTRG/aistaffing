-- Create database and user
DO $$ BEGIN
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'appuser') THEN
    CREATE ROLE appuser WITH LOGIN PASSWORD 'Genius2026AppUser!';
  END IF;
END $$;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE aistaffing TO appuser;

-- Schema
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE,
  name VARCHAR(255),
  password_hash VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS platform_users (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  role VARCHAR(50) NOT NULL DEFAULT 'employer',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS organizations (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  industry VARCHAR(255),
  phone VARCHAR(50),
  email VARCHAR(255),
  website VARCHAR(255),
  onboarding_status VARCHAR(50) DEFAULT 'pending',
  stripe_customer_id VARCHAR(255),
  settings JSONB,
  owner_id INTEGER REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS org_members (
  id SERIAL PRIMARY KEY,
  org_id INTEGER REFERENCES organizations(id),
  user_id INTEGER REFERENCES users(id),
  role VARCHAR(50) DEFAULT 'member',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(org_id, user_id)
);

CREATE TABLE IF NOT EXISTS agent_templates (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  department VARCHAR(100) NOT NULL,
  description TEXT,
  base_system_prompt TEXT,
  default_persona JSONB,
  default_tools TEXT[],
  pricing_model VARCHAR(50),
  base_price_cents INTEGER DEFAULT 0,
  voice_id VARCHAR(255),
  icon VARCHAR(100),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS deployments (
  id SERIAL PRIMARY KEY,
  org_id INTEGER REFERENCES organizations(id),
  template_id INTEGER REFERENCES agent_templates(id),
  display_name VARCHAR(255),
  status VARCHAR(50) DEFAULT 'configuring',
  system_prompt TEXT,
  persona JSONB,
  tools_config JSONB,
  knowledge_base_id VARCHAR(255),
  vapi_assistant_id VARCHAR(255),
  twilio_number VARCHAR(50),
  deployed_at TIMESTAMPTZ,
  config JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS conversations (
  id SERIAL PRIMARY KEY,
  org_id INTEGER REFERENCES organizations(id),
  deployment_id INTEGER REFERENCES deployments(id),
  channel VARCHAR(50),
  direction VARCHAR(20),
  contact_name VARCHAR(255),
  contact_info VARCHAR(255),
  summary TEXT,
  outcome VARCHAR(100),
  duration_seconds INTEGER,
  recording_url TEXT,
  metadata JSONB,
  started_at BIGINT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS messages (
  id SERIAL PRIMARY KEY,
  conversation_id INTEGER REFERENCES conversations(id),
  deployment_id VARCHAR(255),
  session_id VARCHAR(255),
  role VARCHAR(50),
  content TEXT,
  visitor_name VARCHAR(255),
  visitor_email VARCHAR(255),
  tokens_used INTEGER,
  sent_at BIGINT,
  "timestamp" BIGINT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS contracts (
  id SERIAL PRIMARY KEY,
  org_id INTEGER REFERENCES organizations(id),
  deployment_id INTEGER REFERENCES deployments(id),
  tier VARCHAR(50),
  monthly_rate_cents INTEGER,
  hourly_rate_cents INTEGER,
  commission_pct NUMERIC(5,2),
  agency_cut_pct NUMERIC(5,2) DEFAULT 0.30,
  stripe_subscription_id VARCHAR(255),
  starts_at BIGINT,
  ends_at BIGINT,
  auto_renew BOOLEAN DEFAULT true,
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS invoices (
  id SERIAL PRIMARY KEY,
  org_id INTEGER REFERENCES organizations(id),
  stripe_invoice_id VARCHAR(255),
  amount_cents INTEGER,
  status VARCHAR(50) DEFAULT 'draft',
  period_start BIGINT,
  period_end BIGINT,
  paid_at BIGINT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS quotes (
  id SERIAL PRIMARY KEY,
  org_id INTEGER REFERENCES organizations(id),
  business_name VARCHAR(255),
  industry VARCHAR(255),
  contact_email VARCHAR(255),
  contact_phone VARCHAR(50),
  line_items JSONB,
  total_monthly_cents INTEGER,
  human_equivalent_cents INTEGER,
  savings_cents INTEGER,
  status VARCHAR(50) DEFAULT 'draft',
  created_at BIGINT,
  expires_at BIGINT
);

CREATE TABLE IF NOT EXISTS stripe_events (
  id SERIAL PRIMARY KEY,
  stripe_event_id VARCHAR(255) UNIQUE,
  type VARCHAR(255),
  data JSONB,
  processed_at BIGINT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS activity_log (
  id SERIAL PRIMARY KEY,
  org_id INTEGER REFERENCES organizations(id),
  deployment_id INTEGER REFERENCES deployments(id),
  event_type VARCHAR(100),
  title VARCHAR(255),
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS industries (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  icon VARCHAR(100),
  description TEXT,
  category VARCHAR(50),
  multiplier NUMERIC(5,2) DEFAULT 1.0,
  platform_ids TEXT[],
  features TEXT[],
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS core_platforms (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  icon VARCHAR(100),
  description TEXT,
  evolves_from VARCHAR(255),
  features TEXT[],
  ai_agents TEXT[],
  starter_price_cents INTEGER DEFAULT 0,
  pro_price_cents INTEGER DEFAULT 0,
  enterprise_price_cents INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS onboarding_sessions (
  id SERIAL PRIMARY KEY,
  client_name VARCHAR(255),
  client_email VARCHAR(255),
  client_phone VARCHAR(50),
  detected_industry VARCHAR(255),
  detected_platforms TEXT[],
  business_size VARCHAR(50),
  pain_points TEXT[],
  automation_goals TEXT[],
  answers JSONB,
  status VARCHAR(50) DEFAULT 'intake',
  generated_workflow_id INTEGER,
  generated_workflow_preview JSONB,
  created_at BIGINT,
  updated_at BIGINT
);

CREATE TABLE IF NOT EXISTS onboarding_messages (
  id SERIAL PRIMARY KEY,
  session_id INTEGER REFERENCES onboarding_sessions(id),
  role VARCHAR(50),
  content TEXT,
  metadata JSONB,
  "timestamp" BIGINT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS workflow_templates (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255),
  industry_slug VARCHAR(255),
  platform_slug VARCHAR(255),
  description TEXT,
  trigger_type VARCHAR(50),
  trigger_description TEXT,
  steps JSONB,
  is_active BOOLEAN DEFAULT true,
  is_template BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS gateway_requests (
  id SERIAL PRIMARY KEY,
  channel VARCHAR(50),
  org_id VARCHAR(255),
  agent_id VARCHAR(255),
  payload JSONB,
  priority VARCHAR(20) DEFAULT 'normal',
  status VARCHAR(50) DEFAULT 'received',
  metadata JSONB,
  response_payload JSONB,
  error_message TEXT,
  latency_ms INTEGER,
  service_connectors_used TEXT[],
  created_at BIGINT,
  completed_at BIGINT
);

CREATE TABLE IF NOT EXISTS service_connectors (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255),
  slug VARCHAR(255) UNIQUE,
  type VARCHAR(50),
  base_url TEXT,
  auth_type VARCHAR(50),
  description TEXT,
  capabilities TEXT[],
  is_active BOOLEAN DEFAULT true,
  request_count INTEGER DEFAULT 0,
  last_used_at BIGINT,
  avg_latency_ms NUMERIC(10,2) DEFAULT 0,
  error_rate NUMERIC(5,4) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS voice_calls (
  id SERIAL PRIMARY KEY,
  org_id VARCHAR(255),
  direction VARCHAR(20),
  phone_number VARCHAR(50),
  agent_name VARCHAR(255),
  agent_industry VARCHAR(255),
  voice_persona JSONB,
  status VARCHAR(50),
  purpose TEXT,
  started_at BIGINT,
  ended_at BIGINT,
  duration_seconds INTEGER,
  transcript JSONB,
  sentiment VARCHAR(20),
  outcome VARCHAR(100),
  escalated_to_human BOOLEAN DEFAULT false,
  recording_url TEXT,
  summary TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS email_messages (
  id SERIAL PRIMARY KEY,
  org_id VARCHAR(255),
  "to" VARCHAR(255),
  subject VARCHAR(500),
  body TEXT,
  template_id VARCHAR(255),
  status VARCHAR(50) DEFAULT 'queued',
  scheduled_for BIGINT,
  sent_at BIGINT,
  opened_at BIGINT,
  clicked_at BIGINT,
  bounced_at BIGINT,
  sequence_id VARCHAR(255),
  sequence_step INTEGER,
  created_at BIGINT
);

CREATE TABLE IF NOT EXISTS sms_messages (
  id SERIAL PRIMARY KEY,
  org_id VARCHAR(255),
  "to" VARCHAR(50),
  message TEXT,
  media_url TEXT,
  direction VARCHAR(20),
  status VARCHAR(50) DEFAULT 'queued',
  campaign_id VARCHAR(255),
  is_opt_in_confirmation BOOLEAN DEFAULT false,
  sent_at BIGINT,
  delivered_at BIGINT,
  failed_at BIGINT,
  created_at BIGINT
);

CREATE TABLE IF NOT EXISTS email_sequences (
  id SERIAL PRIMARY KEY,
  org_id VARCHAR(255),
  name VARCHAR(255),
  trigger_event VARCHAR(255),
  steps JSONB,
  is_active BOOLEAN DEFAULT true,
  enrolled_count INTEGER DEFAULT 0,
  completed_count INTEGER DEFAULT 0,
  created_at BIGINT
);

CREATE TABLE IF NOT EXISTS enterprise_users (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255),
  email VARCHAR(255),
  name VARCHAR(255),
  role VARCHAR(50),
  org_id VARCHAR(255),
  permissions TEXT[],
  is_active BOOLEAN DEFAULT true,
  last_login_at BIGINT,
  invited_by VARCHAR(255),
  created_at BIGINT
);

CREATE TABLE IF NOT EXISTS api_keys (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255),
  key_hash VARCHAR(255),
  key_prefix VARCHAR(20),
  org_id VARCHAR(255),
  permissions TEXT[],
  is_active BOOLEAN DEFAULT true,
  last_used_at BIGINT,
  usage_count INTEGER DEFAULT 0,
  expires_at BIGINT,
  created_by VARCHAR(255),
  created_at BIGINT
);

CREATE TABLE IF NOT EXISTS audit_log (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255),
  action VARCHAR(255),
  resource VARCHAR(255),
  resource_id VARCHAR(255),
  details JSONB,
  ip_address VARCHAR(50),
  "timestamp" BIGINT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_platform_users_user ON platform_users(user_id);
CREATE INDEX IF NOT EXISTS idx_organizations_slug ON organizations(slug);
CREATE INDEX IF NOT EXISTS idx_organizations_owner ON organizations(owner_id);
CREATE INDEX IF NOT EXISTS idx_org_members_org ON org_members(org_id);
CREATE INDEX IF NOT EXISTS idx_org_members_user ON org_members(user_id);
CREATE INDEX IF NOT EXISTS idx_agent_templates_dept ON agent_templates(department);
CREATE INDEX IF NOT EXISTS idx_deployments_org ON deployments(org_id);
CREATE INDEX IF NOT EXISTS idx_deployments_template ON deployments(template_id);
CREATE INDEX IF NOT EXISTS idx_conversations_org ON conversations(org_id);
CREATE INDEX IF NOT EXISTS idx_conversations_deployment ON conversations(deployment_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_session ON messages(deployment_id, session_id);
CREATE INDEX IF NOT EXISTS idx_contracts_org ON contracts(org_id);
CREATE INDEX IF NOT EXISTS idx_invoices_org ON invoices(org_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_org ON activity_log(org_id);
CREATE INDEX IF NOT EXISTS idx_industries_slug ON industries(slug);
CREATE INDEX IF NOT EXISTS idx_core_platforms_slug ON core_platforms(slug);
CREATE INDEX IF NOT EXISTS idx_onboarding_sessions_status ON onboarding_sessions(status);
CREATE INDEX IF NOT EXISTS idx_gateway_requests_status ON gateway_requests(status);
CREATE INDEX IF NOT EXISTS idx_voice_calls_org ON voice_calls(org_id);
CREATE INDEX IF NOT EXISTS idx_email_messages_org ON email_messages(org_id);
CREATE INDEX IF NOT EXISTS idx_sms_messages_org ON sms_messages(org_id);
CREATE INDEX IF NOT EXISTS idx_enterprise_users_email ON enterprise_users(email);
CREATE INDEX IF NOT EXISTS idx_api_keys_hash ON api_keys(key_hash);
CREATE INDEX IF NOT EXISTS idx_audit_log_user ON audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_timestamp ON audit_log("timestamp");

-- Grant all to appuser
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO appuser;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO appuser;
