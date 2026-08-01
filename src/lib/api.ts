// @ts-nocheck
/**
 * API layer — wired directly to the Convex backend.
 *
 * Previously this module issued fetch() calls to a REST-style "/api" backend
 * that never existed, so every page silently fell back to empty data. It now
 * calls the real Convex functions via ConvexHttpClient while keeping the exact
 * same method surface, so no page code had to change.
 *
 * Conventions:
 *  - Query results are normalized so each document also exposes `id` (= `_id`).
 *  - Methods accept either a single args-object (Convex style) or the legacy
 *    positional arguments; both are converted to the Convex validator shape.
 */
import { ConvexHttpClient } from "convex/browser";
import { api as convexApi } from "../../convex/_generated/api";

const CONVEX_URL = import.meta.env.VITE_CONVEX_URL;
export const convexClient = new ConvexHttpClient(CONVEX_URL);

/* ── result normalization: expose `id` alongside Convex `_id` ── */
function norm(value: any): any {
  if (Array.isArray(value)) return value.map(norm);
  if (value && typeof value === "object") {
    const out: any = {};
    for (const [k, v] of Object.entries(value)) {
      out[k] = Array.isArray(v) || (v && typeof v === "object" && (v as any)._id) ? norm(v) : v;
    }
    if (out._id !== undefined && out.id === undefined) out.id = out._id;
    return out;
  }
  return value;
}

const q = (fn: any, args: any = {}) => convexClient.query(fn, args).then(norm);
const mut = (fn: any, args: any = {}) => convexClient.mutation(fn, args).then(norm);
const act = (fn: any, args: any = {}) => convexClient.action(fn, args).then(norm);

/* Accept either ({...args}) or legacy positional calls */
function shape(args: any[], keys: string[]): any {
  if (args.length === 1 && args[0] && typeof args[0] === "object" && !Array.isArray(args[0])) {
    return args[0];
  }
  const out: any = {};
  keys.forEach((k, i) => {
    if (args[i] !== undefined) out[k] = args[i];
  });
  return out;
}

/* Auth is intentionally disabled (demo runs direct-to-admin). */
const authDisabled = async () => {
  throw new Error("Authentication is disabled in this demo build");
};

export const api = {
  auth: {
    login: authDisabled,
    register: authDisabled,
    adminLogin: authDisabled,
    me: authDisabled,
    role: authDisabled,
    setRole: authDisabled,
    deleteAccount: authDisabled,
  },
  organizations: {
    listAll: () => q(convexApi.organizations.listAll),
    getMine: () => q(convexApi.organizations.getMine),
    create: (data: any) => mut(convexApi.organizations.create, data),
    update: (...args: any[]) => mut(convexApi.organizations.update, shape(args, ["orgId"])),
    completeOnboarding: (...args: any[]) => mut(convexApi.organizations.completeOnboarding, shape(args, ["orgId"])),
  },
  agentTemplates: {
    list: () => q(convexApi.agentTemplates.list),
    listByDepartment: (...args: any[]) => q(convexApi.agentTemplates.listByDepartment, shape(args, ["department"])),
    get: (...args: any[]) => q(convexApi.agentTemplates.get, shape(args, ["templateId"])),
    create: async () => {
      throw new Error("Agent templates are managed through seeding");
    },
  },
  deployments: {
    listAll: () => q(convexApi.deployments.listAll),
    listByOrg: (...args: any[]) => q(convexApi.deployments.listByOrg, shape(args, ["orgId"])),
    deploy: (data: any) => mut(convexApi.deployments.deploy, data),
    updateStatus: (...args: any[]) => mut(convexApi.deployments.updateStatus, shape(args, ["deploymentId", "status"])),
    updateConfig: (...args: any[]) => mut(convexApi.deployments.updateConfig, shape(args, ["deploymentId", "config"])),
  },
  conversations: {
    listByOrg: (...args: any[]) => q(convexApi.conversations.listByOrg, shape(args, ["orgId"])),
    getMessages: (...args: any[]) => q(convexApi.messages.listByConversation, shape(args, ["conversationId"])),
  },
  messages: {
    list: (...args: any[]) => q(convexApi.messages.listByConversation, shape(args, ["conversationId"])),
    send: (data: any) => mut(convexApi.chatAgent.sendMessage, data),
  },
  billing: {
    revenueOverview: () => q(convexApi.billing.revenueOverview),
    listAllContracts: () => q(convexApi.billing.listAllContracts),
    listByOrg: (...args: any[]) => q(convexApi.billing.contractsByOrg, shape(args, ["orgId"])),
    invoices: (...args: any[]) => q(convexApi.billing.invoicesByOrg, shape(args, ["orgId"])),
    spend: (...args: any[]) => q(convexApi.billing.spendSummary, shape(args, ["orgId"])),
  },
  stripe: {
    isConfigured: () => q(convexApi.stripe.isConfigured),
  },
  activity: {
    listAll: (...args: any[]) => q(convexApi.activity.listAll, shape(args, ["limit"])),
    listByOrg: (...args: any[]) => q(convexApi.activity.listByOrg, shape(args, ["orgId", "limit"])),
    stats: (...args: any[]) => q(convexApi.activity.stats, shape(args, ["orgId"])),
  },
  platformUsers: {
    listAll: () => q(convexApi.platformUsers.listAll),
  },
  industries: {
    list: () => q(convexApi.industries.list),
    stats: () => q(convexApi.industries.stats),
    toggleActive: (...args: any[]) => mut(convexApi.industries.toggleActive, shape(args, ["id"])),
    updateMultiplier: (...args: any[]) => mut(convexApi.industries.updateMultiplier, shape(args, ["id", "multiplier"])),
    seed: () => mut(convexApi.industries.seed),
  },
  corePlatforms: {
    list: () => q(convexApi.corePlatforms.list),
    stats: () => q(convexApi.corePlatforms.stats),
    toggleActive: (...args: any[]) => mut(convexApi.corePlatforms.toggleActive, shape(args, ["id"])),
    updatePricing: (...args: any[]) => mut(convexApi.corePlatforms.updatePricing, shape(args, ["id"])),
    seed: () => mut(convexApi.corePlatforms.seed),
  },
  workflows: {
    list: () => q(convexApi.workflows.list),
    stats: () => q(convexApi.workflows.stats),
    toggleActive: (...args: any[]) => mut(convexApi.workflows.toggleActive, shape(args, ["id"])),
    seed: () => mut(convexApi.workflows.seed),
  },
  onboardingAgent: {
    listSessions: () => q(convexApi.onboardingAgent.listSessions),
    getSession: (...args: any[]) => q(convexApi.onboardingAgent.getSession, shape(args, ["id"])),
    getSessionMessages: (...args: any[]) => q(convexApi.onboardingAgent.getSessionMessages, shape(args, ["sessionId"])),
    createSession: (data: any) => mut(convexApi.onboardingAgent.createSession, data),
    deleteSession: (...args: any[]) => mut(convexApi.onboardingAgent.deleteSession, shape(args, ["id"])),
    stats: () => q(convexApi.onboardingAgent.stats),
    chat: (...args: any[]) => act(convexApi.onboardingAgent.chat, shape(args, ["sessionId", "userMessage"])),
    deployWorkflow: (...args: any[]) => act(convexApi.onboardingAgent.deployWorkflow, shape(args, ["sessionId"])),
    triggerGeneration: (...args: any[]) => act(convexApi.onboardingAgent.triggerGeneration, shape(args, ["sessionId"])),
  },
  gateway: {
    getGatewayStats: () => q(convexApi.gateway.getGatewayStats),
    listServiceConnectors: () => q(convexApi.gateway.listServiceConnectors),
    seedConnectors: () => mut(convexApi.gateway.seedConnectors),
    route: (data: any) => mut(convexApi.gateway.processRequest, data),
  },
  voiceAgent: {
    getCallStats: () => q(convexApi.voiceAgent.getCallStats),
    listCalls: (...args: any[]) => q(convexApi.voiceAgent.listCalls, shape(args, ["orgId", "limit"])),
  },
  communications: {
    getCommsStats: () => q(convexApi.communications.getCommsStats),
    sendEmail: (data: any) => mut(convexApi.communications.sendEmail, data),
    sendSms: (data: any) => mut(convexApi.communications.sendSms, data),
  },
  enterpriseAuth: {
    listUsers: (params?: any) => q(convexApi.enterpriseAuth.listUsers, params?.org_id ? { orgId: params.org_id } : {}),
    listApiKeys: (params?: any) => q(convexApi.enterpriseAuth.listApiKeys, params?.org_id ? { orgId: params.org_id } : {}),
    getAuditLog: (params?: any) => q(convexApi.enterpriseAuth.getAuditLog, params?.limit ? { limit: params.limit } : {}),
    getRoles: () => q(convexApi.enterpriseAuth.getRoles),
  },
  chatAgent: {
    getConversation: (params: any) =>
      q(convexApi.chatAgent.getConversation, { deploymentId: params.deploymentId, sessionId: params.sessionId }),
    listConversations: (params: any) => q(convexApi.chatAgent.listConversations, { deploymentId: params.deploymentId }),
  },
  quotes: {
    list: () => q(convexApi.quotes.listAll),
    create: (data: any) => mut(convexApi.quotes.generate, data),
    getPricingTiers: () => q(convexApi.quotes.getPricingTiers),
  },
  addOnServices: {
    listAll: () => q(convexApi.addOnServices.listAll),
    listSubscriptions: () => q(convexApi.addOnServices.listSubscriptions),
    getSubscriptionStats: () => q(convexApi.addOnServices.getSubscriptionStats),
  },
};
