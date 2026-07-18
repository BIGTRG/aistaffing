// @ts-nocheck
const API_BASE = "/api";

async function request(path: string, options: RequestInit = {}) {
  const token = localStorage.getItem("auth_token");
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> || {}),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || res.statusText);
  }
  return res.json();
}

export const api = {
  auth: {
    login: (email: string, password: string) => request("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),
    register: (email: string, password: string, name: string) => request("/auth/register", { method: "POST", body: JSON.stringify({ email, password, name }) }),
    adminLogin: (email: string, password: string) => request("/auth/admin-login", { method: "POST", body: JSON.stringify({ email, password }) }),
    me: () => request("/auth/me"),
    role: () => request("/auth/role"),
    setRole: (role: string) => request("/auth/set-role", { method: "POST", body: JSON.stringify({ role }) }),
    deleteAccount: () => request("/auth/account", { method: "DELETE" }),
  },
  organizations: {
    listAll: () => request("/organizations"),
    getMine: () => request("/organizations/mine"),
    create: (data: any) => request("/organizations", { method: "POST", body: JSON.stringify(data) }),
    update: (id: number, data: any) => request(`/organizations/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    completeOnboarding: () => request("/organizations/complete-onboarding", { method: "POST" }),
  },
  agentTemplates: {
    list: () => request("/agent-templates"),
    create: (data: any) => request("/agent-templates", { method: "POST", body: JSON.stringify(data) }),
  },
  deployments: {
    listAll: () => request("/deployments"),
    listByOrg: (orgId: number) => request(`/deployments?org_id=${orgId}`),
    deploy: (data: any) => request("/deployments", { method: "POST", body: JSON.stringify(data) }),
    updateStatus: (id: number, status: string) => request(`/deployments/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) }),
    updateConfig: (id: number, config: any) => request(`/deployments/${id}/config`, { method: "PATCH", body: JSON.stringify({ config }) }),
  },
  conversations: {
    listByOrg: (orgId: number) => request(`/conversations?org_id=${orgId}`),
    getMessages: (id: number) => request(`/conversations/${id}/messages`),
  },
  messages: {
    list: (params: any) => request(`/messages?${new URLSearchParams(params)}`),
    send: (data: any) => request("/messages", { method: "POST", body: JSON.stringify(data) }),
  },
  billing: {
    revenueOverview: () => request("/billing/revenue"),
    listAllContracts: () => request("/billing/contracts"),
    listByOrg: (orgId: number) => request(`/billing/contracts?org_id=${orgId}`),
    invoices: (orgId?: number) => request(`/billing/invoices${orgId ? `?org_id=${orgId}` : ""}`),
    spend: (orgId: number) => request(`/billing/spend?org_id=${orgId}`),
  },
  stripe: {
    isConfigured: () => request("/stripe/configured"),
  },
  activity: {
    listAll: (limit?: number) => request(`/activity${limit ? `?limit=${limit}` : ""}`),
    listByOrg: (orgId: number, limit?: number) => request(`/activity?org_id=${orgId}${limit ? `&limit=${limit}` : ""}`),
    stats: (orgId: number) => request(`/activity/stats?org_id=${orgId}`),
  },
  platformUsers: {
    listAll: () => request("/platform-users"),
  },
  industries: {
    list: () => request("/industries"),
    stats: () => request("/industries/stats"),
    toggleActive: (id: number) => request("/industries/toggle-active", { method: "POST", body: JSON.stringify({ id }) }),
    updateMultiplier: (id: number, multiplier: number) => request("/industries/update-multiplier", { method: "POST", body: JSON.stringify({ id, multiplier }) }),
    seed: () => request("/industries/seed", { method: "POST" }),
  },
  corePlatforms: {
    list: () => request("/core-platforms"),
    stats: () => request("/core-platforms/stats"),
    toggleActive: (id: number) => request("/core-platforms/toggle-active", { method: "POST", body: JSON.stringify({ id }) }),
    updatePricing: (id: number, data: any) => request("/core-platforms/update-pricing", { method: "POST", body: JSON.stringify({ id, ...data }) }),
    seed: () => request("/core-platforms/seed", { method: "POST" }),
  },
  workflows: {
    list: () => request("/workflows"),
    stats: () => request("/workflows/stats"),
    toggleActive: (id: number) => request("/workflows/toggle-active", { method: "POST", body: JSON.stringify({ id }) }),
    seed: () => request("/workflows/seed", { method: "POST" }),
  },
  onboardingAgent: {
    listSessions: () => request("/onboarding/sessions"),
    getSession: (id: number) => request(`/onboarding/sessions/${id}`),
    getSessionMessages: (sessionId: number) => request(`/onboarding/sessions/${sessionId}/messages`),
    createSession: (data: any) => request("/onboarding/sessions", { method: "POST", body: JSON.stringify(data) }),
    deleteSession: (id: number) => request(`/onboarding/sessions/${id}`, { method: "DELETE" }),
    stats: () => request("/onboarding/stats"),
  },
  gateway: {
    getGatewayStats: () => request("/gateway/stats"),
    listServiceConnectors: () => request("/gateway/connectors"),
    seedConnectors: () => request("/gateway/seed-connectors", { method: "POST" }),
    route: (data: any) => request("/gateway/route", { method: "POST", body: JSON.stringify(data) }),
  },
  voiceAgent: {
    getCallStats: () => request("/voice/stats"),
    listCalls: () => request("/voice/calls"),
  },
  communications: {
    getCommsStats: () => request("/communications/stats"),
    sendEmail: (data: any) => request("/communications/email", { method: "POST", body: JSON.stringify(data) }),
    sendSms: (data: any) => request("/communications/sms", { method: "POST", body: JSON.stringify(data) }),
  },
  enterpriseAuth: {
    listUsers: (params?: any) => request(`/enterprise/users${params?.org_id ? `?org_id=${params.org_id}` : ""}`),
    listApiKeys: (params?: any) => request(`/enterprise/api-keys${params?.org_id ? `?org_id=${params.org_id}` : ""}`),
    getAuditLog: (params?: any) => request(`/enterprise/audit-log${params?.limit ? `?limit=${params.limit}` : ""}`),
    getRoles: () => request("/enterprise/roles"),
  },
  chatAgent: {
    getConversation: (params: any) => request(`/chat/messages?deployment_id=${params.deploymentId}&session_id=${params.sessionId}`),
    listConversations: (params: any) => request(`/chat/conversations?deployment_id=${params.deploymentId}`),
  },
  quotes: {
    list: () => request("/quotes"),
    create: (data: any) => request("/quotes", { method: "POST", body: JSON.stringify(data) }),
  },
};
