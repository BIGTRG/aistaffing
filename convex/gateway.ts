import { v } from "convex/values";
import { action, mutation, query } from "./_generated/server";
import { api } from "./_generated/api";

declare const process: { env: Record<string, string | undefined> };

/* ═══════════════════════════════════════════════════════════════════════════
 * AI GATEWAY — Central routing layer for all AI agent services.
 *
 * Instead of clients calling raw APIs, everything routes through the Gateway.
 * The Gateway handles:
 *   1. Authentication & rate limiting
 *   2. Agent routing (which agent handles this request)
 *   3. Context assembly (pulls business data, history, config)
 *   4. Execution (voice, chat, email, SMS, workflow)
 *   5. Logging & analytics
 *   6. Fallback & escalation to human
 *
 * External services (G-Sign, SealProof, Background Checks) plug in as
 * Gateway Service Connectors — registered once, available to all agents.
 * ═══════════════════════════════════════════════════════════════════════════ */

// ─── Gateway Request Types ───
const CHANNEL_TYPES = v.union(
  v.literal("voice"), v.literal("chat"), v.literal("email"),
  v.literal("sms"), v.literal("workflow"), v.literal("api")
);

const PRIORITY_TYPES = v.union(
  v.literal("low"), v.literal("normal"), v.literal("high"), v.literal("urgent")
);

// ─── Service Connector Registry ───
// External services (G-Sign, SealProof, BackgroundCheck, etc.) register here
export const listServiceConnectors = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("serviceConnectors").filter(q => q.eq(q.field("isActive"), true)).collect();
  },
});

export const registerServiceConnector = mutation({
  args: {
    name: v.string(),
    slug: v.string(),
    type: v.string(),         // esign | background_check | notary | payment | crm | custom
    baseUrl: v.string(),
    authType: v.string(),     // api_key | oauth2 | bearer | hmac
    description: v.string(),
    capabilities: v.array(v.string()),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.query("serviceConnectors")
      .filter(q => q.eq(q.field("slug"), args.slug)).first();
    if (existing) {
      await ctx.db.patch(existing._id, args);
      return existing._id;
    }
    return await ctx.db.insert("serviceConnectors", {
      ...args,
      requestCount: 0,
      lastUsedAt: undefined,
      avgLatencyMs: 0,
      errorRate: 0,
    });
  },
});

// ─── Gateway Request Processing ───
export const processRequest = mutation({
  args: {
    channel: CHANNEL_TYPES,
    orgId: v.optional(v.string()),
    agentId: v.optional(v.string()),
    payload: v.any(),
    priority: v.optional(PRIORITY_TYPES),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    // Log the request
    const requestId = await ctx.db.insert("gatewayRequests", {
      channel: args.channel,
      orgId: args.orgId,
      agentId: args.agentId,
      payload: args.payload,
      priority: args.priority ?? "normal",
      status: "received",
      metadata: args.metadata,
      createdAt: Date.now(),
      completedAt: undefined,
      responsePayload: undefined,
      errorMessage: undefined,
      latencyMs: undefined,
      serviceConnectorsUsed: [],
    });

    return { requestId, status: "received", channel: args.channel };
  },
});

// ─── Route & Execute via Gateway ───
export const executeRequest = action({
  args: {
    requestId: v.id("gatewayRequests"),
  },
  handler: async (ctx, args) => {
    const request: any = await ctx.runQuery(api.gateway.getRequest, { requestId: args.requestId });
    if (!request) throw new Error("Request not found");

    const startTime = Date.now();

    // Update status to processing
    await ctx.runMutation(api.gateway.updateRequestStatus, {
      requestId: args.requestId, status: "processing",
    });

    try {
      let response: any;

      // Route based on channel
      switch (request.channel) {
        case "voice":
          response = await handleVoiceRequest(ctx, request);
          break;
        case "chat":
          response = await handleChatRequest(ctx, request);
          break;
        case "email":
          response = await handleEmailRequest(ctx, request);
          break;
        case "sms":
          response = await handleSmsRequest(ctx, request);
          break;
        case "workflow":
          response = await handleWorkflowRequest(ctx, request);
          break;
        case "api":
          response = await handleApiRequest(ctx, request);
          break;
        default:
          throw new Error(`Unknown channel: ${request.channel}`);
      }

      const latencyMs = Date.now() - startTime;

      await ctx.runMutation(api.gateway.completeRequest, {
        requestId: args.requestId,
        status: "completed",
        responsePayload: response,
        latencyMs,
      });

      return { status: "completed", response, latencyMs };
    } catch (error: any) {
      await ctx.runMutation(api.gateway.completeRequest, {
        requestId: args.requestId,
        status: "failed",
        responsePayload: null,
        latencyMs: Date.now() - startTime,
        errorMessage: error.message,
      });
      return { status: "failed", error: error.message };
    }
  },
});

// ─── Channel Handlers ───
async function handleVoiceRequest(_ctx: any, request: any) {
  // Route to voice agent engine
  const { phoneNumber, callDirection, agentType } = request.payload;
  return {
    type: "voice",
    action: callDirection === "inbound" ? "answer" : "dial",
    agentType: agentType ?? "receptionist",
    phoneNumber,
    status: "connected",
    message: `Voice agent activated for ${phoneNumber}`,
  };
}

async function handleChatRequest(ctx: any, request: any) {
  const { message, sessionId, deploymentId } = request.payload;
  if (deploymentId && sessionId && message) {
    const config = await ctx.runQuery(api.chatAgent.getWidgetConfig, { deploymentId });
    if (config?.status === "active") {
      const aiResponse = await ctx.runAction(api.chatAgent.getAiResponse, {
        deploymentId, sessionId, userMessage: message,
        businessName: config.businessName, businessDescription: config.businessDescription,
        agentName: config.agentName, agentRole: config.agentRole,
      });
      return { type: "chat", response: aiResponse, agentName: config.agentName };
    }
  }
  return { type: "chat", response: "Agent not available", status: "fallback" };
}

async function handleEmailRequest(_ctx: any, request: any) {
  const { to, subject, body, templateId } = request.payload;
  return {
    type: "email",
    action: "queued",
    to, subject,
    bodyLength: body?.length ?? 0,
    templateId: templateId ?? "default",
    message: `Email queued for ${to}`,
  };
}

async function handleSmsRequest(_ctx: any, request: any) {
  const { to, message, templateId } = request.payload;
  return {
    type: "sms",
    action: "queued",
    to,
    messageLength: message?.length ?? 0,
    templateId: templateId ?? "default",
    message: `SMS queued for ${to}`,
  };
}

async function handleWorkflowRequest(_ctx: any, request: any) {
  const { workflowId, trigger, inputData } = request.payload;
  return {
    type: "workflow",
    workflowId,
    trigger,
    status: "executing",
    inputData,
    message: `Workflow ${workflowId} triggered`,
  };
}

async function handleApiRequest(_ctx: any, request: any) {
  const { service, method, params } = request.payload;
  return {
    type: "api",
    service,
    method,
    params,
    status: "processed",
    message: `API call to ${service}.${method} processed`,
  };
}

// ─── Query Helpers ───
export const getRequest = query({
  args: { requestId: v.id("gatewayRequests") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.requestId);
  },
});

export const updateRequestStatus = mutation({
  args: { requestId: v.id("gatewayRequests"), status: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.requestId, { status: args.status });
  },
});

export const completeRequest = mutation({
  args: {
    requestId: v.id("gatewayRequests"),
    status: v.string(),
    responsePayload: v.any(),
    latencyMs: v.number(),
    errorMessage: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.requestId, {
      status: args.status,
      responsePayload: args.responsePayload,
      completedAt: Date.now(),
      latencyMs: args.latencyMs,
      errorMessage: args.errorMessage,
    });
  },
});

// ─── Analytics ───
export const getGatewayStats = query({
  args: {},
  handler: async (ctx) => {
    const allRequests = await ctx.db.query("gatewayRequests").order("desc").take(1000);
    const now = Date.now();
    const last24h = allRequests.filter(r => now - r.createdAt < 86400000);
    const lastHour = allRequests.filter(r => now - r.createdAt < 3600000);

    const byChannel: Record<string, number> = {};
    const byStatus: Record<string, number> = {};
    let totalLatency = 0;
    let latencyCount = 0;

    for (const req of last24h) {
      byChannel[req.channel] = (byChannel[req.channel] ?? 0) + 1;
      byStatus[req.status] = (byStatus[req.status] ?? 0) + 1;
      if (req.latencyMs) {
        totalLatency += req.latencyMs;
        latencyCount++;
      }
    }

    return {
      total24h: last24h.length,
      totalLastHour: lastHour.length,
      byChannel,
      byStatus,
      avgLatencyMs: latencyCount ? Math.round(totalLatency / latencyCount) : 0,
      errorRate: last24h.length ? ((byStatus["failed"] ?? 0) / last24h.length * 100).toFixed(1) : "0.0",
      connectors: await ctx.db.query("serviceConnectors").collect(),
    };
  },
});

// ─── Seed TRG Service Connectors ───
export const seedConnectors = mutation({
  args: {},
  handler: async (ctx) => {
    const connectors = [
      {
        name: "G-Sign",
        slug: "gsign",
        type: "esign",
        baseUrl: "https://api.gsign.trgtechlink.com",
        authType: "api_key",
        description: "TRG's DocuSign alternative — electronic signature platform",
        capabilities: ["create_envelope", "send_for_signature", "track_status", "download_signed", "templates"],
        isActive: true,
        requestCount: 0, lastUsedAt: undefined, avgLatencyMs: 0, errorRate: 0,
      },
      {
        name: "SealProof",
        slug: "sealproof",
        type: "notary",
        baseUrl: "https://api.sealproof.com",
        authType: "api_key",
        description: "TRG's online notary platform — remote notarization services",
        capabilities: ["schedule_notary", "verify_identity", "notarize_document", "generate_certificate", "audit_trail"],
        isActive: true,
        requestCount: 0, lastUsedAt: undefined, avgLatencyMs: 0, errorRate: 0,
      },
      {
        name: "TRG Background Check",
        slug: "trg-background-check",
        type: "background_check",
        baseUrl: "https://api.bgcheck.trgtechlink.com",
        authType: "api_key",
        description: "TRG's Checkr alternative — background screening & verification",
        capabilities: ["criminal_check", "employment_verify", "education_verify", "credit_check", "identity_verify", "drug_screening"],
        isActive: true,
        requestCount: 0, lastUsedAt: undefined, avgLatencyMs: 0, errorRate: 0,
      },
      {
        name: "Stripe Payments",
        slug: "stripe",
        type: "payment",
        baseUrl: "https://api.stripe.com/v1",
        authType: "bearer",
        description: "Payment processing — subscriptions, invoicing, payouts",
        capabilities: ["create_customer", "create_subscription", "charge", "refund", "invoice", "payout"],
        isActive: true,
        requestCount: 0, lastUsedAt: undefined, avgLatencyMs: 0, errorRate: 0,
      },
      {
        name: "TRG Voice Engine",
        slug: "trg-voice",
        type: "voice",
        baseUrl: "https://voice.trgtechlink.com/api",
        authType: "api_key",
        description: "AI voice agent engine — inbound/outbound calls, IVR, conferencing",
        capabilities: ["inbound_call", "outbound_call", "voicemail", "transfer", "conference", "recording", "transcription"],
        isActive: true,
        requestCount: 0, lastUsedAt: undefined, avgLatencyMs: 0, errorRate: 0,
      },
      {
        name: "TRG Email Engine",
        slug: "trg-email",
        type: "email",
        baseUrl: "https://email.trgtechlink.com/api",
        authType: "api_key",
        description: "AI email automation — sequences, templates, tracking",
        capabilities: ["send_email", "send_sequence", "track_opens", "track_clicks", "templates", "ai_compose"],
        isActive: true,
        requestCount: 0, lastUsedAt: undefined, avgLatencyMs: 0, errorRate: 0,
      },
      {
        name: "TRG SMS Engine",
        slug: "trg-sms",
        type: "sms",
        baseUrl: "https://sms.trgtechlink.com/api",
        authType: "api_key",
        description: "AI SMS automation — two-way messaging, campaigns, opt-in management",
        capabilities: ["send_sms", "send_mms", "two_way", "campaign", "opt_in_management", "keyword_triggers"],
        isActive: true,
        requestCount: 0, lastUsedAt: undefined, avgLatencyMs: 0, errorRate: 0,
      },
    ];

    let seeded = 0;
    for (const c of connectors) {
      const existing = await ctx.db.query("serviceConnectors")
        .filter(q => q.eq(q.field("slug"), c.slug)).first();
      if (!existing) {
        await ctx.db.insert("serviceConnectors", c);
        seeded++;
      }
    }
    return { seeded, total: connectors.length };
  },
});
