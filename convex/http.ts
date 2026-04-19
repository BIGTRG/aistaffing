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

export default http;
