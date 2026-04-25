import { v } from "convex/values";
import { mutation, query, action } from "./_generated/server";
import { api } from "./_generated/api";

declare const process: { env: Record<string, string | undefined> };

const VIKTOR_API_URL = process.env.VIKTOR_SPACES_API_URL!;
const PROJECT_NAME = process.env.VIKTOR_SPACES_PROJECT_NAME!;
const PROJECT_SECRET = process.env.VIKTOR_SPACES_PROJECT_SECRET!;

/* ─── Store a visitor message ─── */
export const sendMessage = mutation({
	args: {
		deploymentId: v.string(),
		sessionId: v.string(),
		content: v.string(),
		role: v.union(v.literal("user"), v.literal("assistant")),
		visitorName: v.optional(v.string()),
		visitorEmail: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		return await ctx.db.insert("messages", {
			deploymentId: args.deploymentId,
			sessionId: args.sessionId,
			content: args.content,
			role: args.role,
			visitorName: args.visitorName,
			visitorEmail: args.visitorEmail,
			timestamp: Date.now(),
		});
	},
});

/* ─── Get conversation history for a session ─── */
export const getConversation = query({
	args: {
		deploymentId: v.string(),
		sessionId: v.string(),
	},
	handler: async (ctx, args) => {
		return await ctx.db
			.query("messages")
			.withIndex("by_session", (q) =>
				q.eq("deploymentId", args.deploymentId).eq("sessionId", args.sessionId)
			)
			.order("asc")
			.collect();
	},
});

/* ─── Build rich system prompt from deployment config ─── */
function buildSystemPrompt(params: {
	agentName: string;
	agentRole: string;
	businessName: string;
	businessDescription: string;
	config?: {
		businessHours?: string;
		services?: string;
		pricing?: string;
		faqs?: string;
		tone?: string;
		greeting?: string;
		customInstructions?: string;
		escalationRules?: string;
	};
}): string {
	const { agentName, agentRole, businessName, businessDescription, config } = params;

	let prompt = `You are ${agentName}, a professional ${agentRole} working for ${businessName}.`;

	if (businessDescription) {
		prompt += ` The business operates in the ${businessDescription} industry.`;
	}

	// Add configured knowledge
	if (config?.businessHours) {
		prompt += `\n\nBusiness Hours: ${config.businessHours}`;
	}
	if (config?.services) {
		prompt += `\n\nServices We Offer:\n${config.services}`;
	}
	if (config?.pricing) {
		prompt += `\n\nPricing Information:\n${config.pricing}`;
	}
	if (config?.faqs) {
		prompt += `\n\nFrequently Asked Questions:\n${config.faqs}`;
	}
	if (config?.customInstructions) {
		prompt += `\n\nSpecial Instructions:\n${config.customInstructions}`;
	}
	if (config?.escalationRules) {
		prompt += `\n\nEscalation Rules: ${config.escalationRules}`;
	}

	// Set tone
	const toneMap: Record<string, string> = {
		professional: "Maintain a professional, polished tone at all times.",
		friendly: "Be warm, approachable, and conversational while staying professional.",
		casual: "Keep things relaxed and casual, like chatting with a friend.",
		formal: "Use formal, business-appropriate language throughout.",
	};
	const toneInstruction = toneMap[config?.tone ?? "professional"] ?? toneMap.professional;

	prompt += `\n\n${toneInstruction}`;

	prompt += `\n\nYour core responsibilities:
- Greet visitors warmly and represent ${businessName} professionally
- Answer questions about the business using the knowledge provided above
- Qualify leads by understanding their needs, budget, and timeline
- Collect contact information (name, email, phone) when appropriate
- Schedule consultations or demos when the visitor shows interest
- Be helpful, concise, and action-oriented

Guidelines:
- Keep responses under 3 sentences unless detailed information is requested
- Never reveal you are an AI unless directly asked
- If you don't know the answer, say you'll have a team member follow up
- Always try to move the conversation toward a next step (booking, callback, etc.)`;

	if (config?.greeting) {
		prompt += `\n\nWhen a visitor first says hello, greet them with something like: "${config.greeting}"`;
	}

	return prompt;
}

/* ─── AI Chat Response (enhanced with config) ─── */
export const getAiResponse = action({
	args: {
		deploymentId: v.string(),
		sessionId: v.string(),
		userMessage: v.string(),
		businessName: v.string(),
		businessDescription: v.string(),
		agentName: v.string(),
		agentRole: v.string(),
	},
	handler: async (ctx, args) => {
		// Store user message
		await ctx.runMutation(api.chatAgent.sendMessage, {
			deploymentId: args.deploymentId,
			sessionId: args.sessionId,
			content: args.userMessage,
			role: "user",
		});

		// Get deployment config
		const deploymentConfig = await ctx.runQuery(api.chatAgent.getDeploymentConfig, {
			deploymentId: args.deploymentId,
		});

		// Get conversation history
		const history = await ctx.runQuery(api.chatAgent.getConversation, {
			deploymentId: args.deploymentId,
			sessionId: args.sessionId,
		});

		// Build conversation context from last 10 messages
		const recentMessages = history.slice(-10);
		const conversationContext = recentMessages
			.map((m: { role: string; content: string }) =>
				`${m.role === "user" ? "Visitor" : args.agentName}: ${m.content}`
			)
			.join("\n");

		// Build rich system prompt
		const systemPrompt = buildSystemPrompt({
			agentName: args.agentName,
			agentRole: args.agentRole,
			businessName: deploymentConfig?.businessName ?? args.businessName,
			businessDescription: deploymentConfig?.businessDescription ?? args.businessDescription,
			config: deploymentConfig?.config,
		});

		const fullPrompt = `${systemPrompt}\n\n--- Conversation so far ---\n${conversationContext}\n\nVisitor: ${args.userMessage}\n\nRespond as ${args.agentName} (keep it concise and helpful):`;

		// Call AI via Viktor Tools
		let aiText = "I'm here to help! Could you tell me a bit more about what you're looking for?";
		try {
			const response = await fetch(
				`${VIKTOR_API_URL}/api/viktor-spaces/tools/call`,
				{
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						project_name: PROJECT_NAME,
						project_secret: PROJECT_SECRET,
						role: "quick_ai_search",
						arguments: { query: fullPrompt },
					}),
				}
			);

			if (response.ok) {
				const data = await response.json();
				if (data.result?.search_response) {
					aiText = data.result.search_response;
				} else if (data.response_text) {
					aiText = data.response_text;
				}
			}
		} catch (e) {
			console.error("AI response error:", e);
		}

		// Clean up AI response — remove any prefixes like "AgentName:"
		aiText = aiText.replace(/^[A-Za-z\s]+:\s*/, "").trim();

		// Store AI response
		await ctx.runMutation(api.chatAgent.sendMessage, {
			deploymentId: args.deploymentId,
			sessionId: args.sessionId,
			content: aiText,
			role: "assistant",
		});

		return aiText;
	},
});

/* ─── Get deployment config for enhanced chat ─── */
export const getDeploymentConfig = query({
	args: { deploymentId: v.string() },
	handler: async (ctx, args) => {
		const deployment = await ctx.db
			.query("deployments")
			.filter((q) => q.eq(q.field("_id"), args.deploymentId as any))
			.first();

		if (!deployment) return null;

		const org = await ctx.db.get(deployment.orgId);
		const template = await ctx.db.get(deployment.templateId);

		return {
			businessName: org?.name ?? "Our Business",
			businessDescription: org?.industry ?? "",
			agentName: deployment.displayName ?? template?.name ?? "AI Assistant",
			agentRole: template?.description ?? "Customer Service Representative",
			config: deployment.config ?? {},
			status: deployment.status,
		};
	},
});

/* ─── Get deployment config for widget ─── */
export const getWidgetConfig = query({
	args: { deploymentId: v.string() },
	handler: async (ctx, args) => {
		const deployment = await ctx.db
			.query("deployments")
			.filter((q) => q.eq(q.field("_id"), args.deploymentId as any))
			.first();

		if (!deployment) return null;

		const org = await ctx.db.get(deployment.orgId);
		const template = await ctx.db.get(deployment.templateId);

		return {
			businessName: org?.name ?? "Our Business",
			businessDescription: org?.industry ?? "",
			agentName: deployment.displayName ?? template?.name ?? "AI Assistant",
			agentRole: template?.description ?? "Customer Service Representative",
			status: deployment.status,
			config: deployment.config,
		};
	},
});

/* ─── List conversations for a deployment (portal view) ─── */
export const listConversations = query({
	args: { deploymentId: v.string() },
	handler: async (ctx, args) => {
		const messages = await ctx.db
			.query("messages")
			.withIndex("by_deployment", (q) => q.eq("deploymentId", args.deploymentId))
			.order("desc")
			.take(200);

		// Group by sessionId
		const sessions = new Map<string, { sessionId: string; messageCount: number; lastMessage: string; lastTime: number; visitorName?: string; visitorEmail?: string }>();

		for (const msg of messages) {
			const sid = msg.sessionId ?? "unknown";
			if (!sessions.has(sid)) {
				sessions.set(sid, {
					sessionId: sid,
					messageCount: 0,
					lastMessage: msg.content,
					lastTime: msg.timestamp ?? Date.now(),
					visitorName: msg.visitorName,
					visitorEmail: msg.visitorEmail,
				});
			}
			const session = sessions.get(sid)!;
			session.messageCount++;
			if (msg.visitorName) session.visitorName = msg.visitorName;
			if (msg.visitorEmail) session.visitorEmail = msg.visitorEmail;
		}

		return Array.from(sessions.values()).sort((a, b) => b.lastTime - a.lastTime);
	},
});
