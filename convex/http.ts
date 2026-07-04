import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { auth } from "./auth";
import { api } from "./_generated/api";

const http = httpRouter();
auth.addHttpRoutes(http);

/* ─── CORS headers for chat widget ─── */
const corsHeaders = {
	"Access-Control-Allow-Origin": "*",
	"Access-Control-Allow-Methods": "POST, GET, OPTIONS",
	"Access-Control-Allow-Headers": "Content-Type",
};

/* ─── Preflight for CORS ─── */
http.route({
	path: "/widget/chat",
	method: "OPTIONS",
	handler: httpAction(async () => {
		return new Response(null, { status: 204, headers: corsHeaders });
	}),
});

/* ─── Chat widget endpoint ─── */
http.route({
	path: "/widget/chat",
	method: "POST",
	handler: httpAction(async (ctx, req) => {
		try {
			const body = await req.json();
			const { deploymentId, sessionId, message } = body;

			if (!deploymentId || !sessionId || !message) {
				return new Response(
					JSON.stringify({ error: "Missing required fields" }),
					{ status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
				);
			}

			// Get widget config
			const config = await ctx.runQuery(api.chatAgent.getWidgetConfig, { deploymentId });
			if (!config || config.status !== "active") {
				return new Response(
					JSON.stringify({ error: "Agent not available" }),
					{ status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
				);
			}

			// Get AI response
			const aiResponse = await ctx.runAction(api.chatAgent.getAiResponse, {
				deploymentId,
				sessionId,
				userMessage: message,
				businessName: config.businessName,
				businessDescription: config.businessDescription,
				agentName: config.agentName,
				agentRole: config.agentRole,
			});

			return new Response(
				JSON.stringify({ response: aiResponse, agentName: config.agentName }),
				{ status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
			);
		} catch (e: any) {
			return new Response(
				JSON.stringify({ error: "Internal error", details: e.message }),
				{ status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
			);
		}
	}),
});

/* ─── Widget config endpoint (for initial load) ─── */
http.route({
	path: "/widget/config",
	method: "OPTIONS",
	handler: httpAction(async () => {
		return new Response(null, { status: 204, headers: corsHeaders });
	}),
});

http.route({
	path: "/widget/config",
	method: "POST",
	handler: httpAction(async (ctx, req) => {
		try {
			const { deploymentId } = await req.json();
			const config = await ctx.runQuery(api.chatAgent.getWidgetConfig, { deploymentId });
			if (!config) {
				return new Response(
					JSON.stringify({ error: "Not found" }),
					{ status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
				);
			}
			return new Response(
				JSON.stringify(config),
				{ status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
			);
		} catch (e: any) {
			return new Response(
				JSON.stringify({ error: e.message }),
				{ status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
			);
		}
	}),
});

/* ─── Stripe Webhook ─── */
http.route({
	path: "/stripe/webhook",
	method: "POST",
	handler: httpAction(async (ctx, req) => {
		try {
			const body = await req.text();
			const event = JSON.parse(body);

			// Record the event
			await ctx.runMutation(api.stripe.recordEvent, {
				stripeEventId: event.id ?? `evt_${Date.now()}`,
				type: event.type ?? "unknown",
				data: event.data?.object ?? {},
			});

			// Handle specific event types
			if (event.type === "checkout.session.completed") {
				const session = event.data.object;
				const orgId = session.metadata?.orgId;
				if (orgId && session.customer) {
					await ctx.runMutation(api.stripe.setStripeCustomerId, {
						orgId,
						stripeCustomerId: session.customer,
					});
				}
			}

			return new Response(JSON.stringify({ received: true }), {
				status: 200,
				headers: { "Content-Type": "application/json" },
			});
		} catch (e: any) {
			return new Response(
				JSON.stringify({ error: e.message }),
				{ status: 400, headers: { "Content-Type": "application/json" } }
			);
		}
	}),
});

/* ═══════════════════════════════════════════════
   AI GATEWAY HTTP ENDPOINTS
   All agent services route through /gateway/*
   ═══════════════════════════════════════════════ */

// Preflight
http.route({
	path: "/gateway",
	method: "OPTIONS",
	handler: httpAction(async () => {
		return new Response(null, { status: 204, headers: corsHeaders });
	}),
});

// Main Gateway Endpoint
http.route({
	path: "/gateway",
	method: "POST",
	handler: httpAction(async (ctx, req) => {
		try {
			const body = await req.json();
			const { channel, orgId, agentId, payload, priority, apiKey } = body;

			if (!channel || !payload) {
				return new Response(
					JSON.stringify({ error: "Missing required fields: channel, payload" }),
					{ status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
				);
			}

			// Process through gateway
			const result = await ctx.runMutation(api.gateway.processRequest, {
				channel,
				orgId: orgId ?? undefined,
				agentId: agentId ?? undefined,
				payload,
				priority: priority ?? "normal",
				metadata: { apiKey: apiKey ? "provided" : "none", source: "http" },
			});

			// Execute the request
			const execution = await ctx.runAction(api.gateway.executeRequest, {
				requestId: result.requestId,
			});

			return new Response(
				JSON.stringify({
					requestId: result.requestId,
					status: execution.status,
					channel: result.channel,
					response: execution.response,
					latencyMs: execution.latencyMs,
				}),
				{ status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
			);
		} catch (e: any) {
			return new Response(
				JSON.stringify({ error: "Gateway error", details: e.message }),
				{ status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
			);
		}
	}),
});

// Gateway Stats
http.route({
	path: "/gateway/stats",
	method: "GET",
	handler: httpAction(async (ctx) => {
		const stats = await ctx.runQuery(api.gateway.getGatewayStats);
		return new Response(
			JSON.stringify(stats),
			{ status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
		);
	}),
});

// Voice Agent Endpoint
http.route({
	path: "/gateway/voice",
	method: "OPTIONS",
	handler: httpAction(async () => {
		return new Response(null, { status: 204, headers: corsHeaders });
	}),
});

http.route({
	path: "/gateway/voice",
	method: "POST",
	handler: httpAction(async (ctx, req) => {
		try {
			const body = await req.json();
			const { action: callAction, phoneNumber, direction, industry, callId, userSpeech } = body;

			if (callAction === "initiate") {
				const result = await ctx.runMutation(api.voiceAgent.initiateCall, {
					direction: direction ?? "inbound",
					phoneNumber: phoneNumber ?? "unknown",
					agentIndustry: industry,
				});
				return new Response(JSON.stringify(result), {
					status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
				});
			}

			if (callAction === "respond" && callId && userSpeech) {
				const result = await ctx.runAction(api.voiceAgent.processVoiceInput, {
					callId,
					userSpeech,
					agentIndustry: industry ?? "default",
				});
				return new Response(JSON.stringify(result), {
					status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
				});
			}

			return new Response(
				JSON.stringify({ error: "Invalid action. Use 'initiate' or 'respond'" }),
				{ status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
			);
		} catch (e: any) {
			return new Response(
				JSON.stringify({ error: e.message }),
				{ status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
			);
		}
	}),
});

// Email Endpoint
http.route({
	path: "/gateway/email",
	method: "OPTIONS",
	handler: httpAction(async () => {
		return new Response(null, { status: 204, headers: corsHeaders });
	}),
});

http.route({
	path: "/gateway/email",
	method: "POST",
	handler: httpAction(async (ctx, req) => {
		try {
			const body = await req.json();
			const result = await ctx.runMutation(api.communications.sendEmail, {
				to: body.to,
				subject: body.subject,
				body: body.body,
				orgId: body.orgId,
				templateId: body.templateId,
				variables: body.variables,
				scheduledFor: body.scheduledFor,
			});
			return new Response(JSON.stringify(result), {
				status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
			});
		} catch (e: any) {
			return new Response(
				JSON.stringify({ error: e.message }),
				{ status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
			);
		}
	}),
});

// SMS Endpoint
http.route({
	path: "/gateway/sms",
	method: "OPTIONS",
	handler: httpAction(async () => {
		return new Response(null, { status: 204, headers: corsHeaders });
	}),
});

http.route({
	path: "/gateway/sms",
	method: "POST",
	handler: httpAction(async (ctx, req) => {
		try {
			const body = await req.json();
			const result = await ctx.runMutation(api.communications.sendSms, {
				to: body.to,
				message: body.message,
				orgId: body.orgId,
				mediaUrl: body.mediaUrl,
				campaignId: body.campaignId,
			});
			return new Response(JSON.stringify(result), {
				status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
			});
		} catch (e: any) {
			return new Response(
				JSON.stringify({ error: e.message }),
				{ status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
			);
		}
	}),
});

export default http;
