import { v } from "convex/values";
import { action, mutation, query } from "./_generated/server";

declare const process: { env: Record<string, string | undefined> };

/* ═══════════════════════════════════════════════════════════════════════════
 * VOICE AI AGENT ENGINE
 *
 * Handles inbound and outbound AI phone calls for all industry verticals.
 * Each deployed agent can have a dedicated phone number and voice persona.
 *
 * Architecture:
 *   Phone call → Voice Engine → AI Agent (industry-specific) → Response
 *   Human escalation → Transfer to owner/manager
 *
 * Integrates with the AI Gateway as a channel handler.
 * ═══════════════════════════════════════════════════════════════════════════ */

// ─── Voice Agent Personas (per industry) ───
const VOICE_PERSONAS: Record<string, {
  name: string; greeting: string; tone: string; voiceType: string;
}> = {
  "car-dealership": {
    name: "Alex", greeting: "Thank you for calling! I'm Alex, your AI sales assistant. Are you looking for a new or pre-owned vehicle today?",
    tone: "friendly-professional", voiceType: "male-warm",
  },
  "salon": {
    name: "Sophie", greeting: "Hi there! This is Sophie at the salon. Would you like to book an appointment or ask about our services?",
    tone: "warm-welcoming", voiceType: "female-warm",
  },
  "car-wash": {
    name: "Mike", greeting: "Welcome to our car wash! I'm Mike. Would you like to schedule a wash, ask about our packages, or check on a membership?",
    tone: "casual-efficient", voiceType: "male-casual",
  },
  "restaurant": {
    name: "Maria", greeting: "Thank you for calling! I'm Maria. Would you like to make a reservation, place a takeout order, or ask about our menu?",
    tone: "warm-professional", voiceType: "female-warm",
  },
  "healthcare": {
    name: "Dr. Sarah", greeting: "Thank you for calling our medical office. I'm Sarah, your AI patient coordinator. How may I help you today?",
    tone: "professional-empathetic", voiceType: "female-professional",
  },
  "insurance": {
    name: "James", greeting: "Thank you for calling. I'm James, your AI insurance advisor. Are you looking for a quote, need to file a claim, or have questions about your policy?",
    tone: "trustworthy-professional", voiceType: "male-professional",
  },
  "trucking": {
    name: "Jake", greeting: "Hey, this is Jake from dispatch. Need to book a load, check on a shipment, or get a rate?",
    tone: "direct-efficient", voiceType: "male-casual",
  },
  "construction": {
    name: "Tom", greeting: "Thanks for calling. I'm Tom, your project coordinator. Are you looking for an estimate, checking on a project, or need to schedule something?",
    tone: "professional-direct", voiceType: "male-professional",
  },
  "default": {
    name: "Jordan", greeting: "Thank you for calling! I'm Jordan, your AI assistant. How can I help you today?",
    tone: "friendly-professional", voiceType: "neutral-warm",
  },
};

// ─── Call Management ───
export const initiateCall = mutation({
  args: {
    orgId: v.optional(v.string()),
    direction: v.string(),       // inbound | outbound
    phoneNumber: v.string(),
    agentIndustry: v.optional(v.string()),
    agentName: v.optional(v.string()),
    purpose: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const persona = VOICE_PERSONAS[args.agentIndustry ?? "default"] ?? VOICE_PERSONAS["default"];

    const callId = await ctx.db.insert("voiceCalls", {
      orgId: args.orgId,
      direction: args.direction,
      phoneNumber: args.phoneNumber,
      agentName: args.agentName ?? persona.name,
      agentIndustry: args.agentIndustry ?? "default",
      voicePersona: persona,
      status: "ringing",
      purpose: args.purpose,
      startedAt: Date.now(),
      endedAt: undefined,
      durationSeconds: undefined,
      transcript: [],
      sentiment: undefined,
      outcome: undefined,
      escalatedToHuman: false,
      recordingUrl: undefined,
      summary: undefined,
      metadata: {},
    });

    return { callId, agentName: persona.name, greeting: persona.greeting, status: "ringing" };
  },
});

export const updateCallStatus = mutation({
  args: {
    callId: v.id("voiceCalls"),
    status: v.string(),
    transcript: v.optional(v.array(v.object({
      role: v.string(),
      content: v.string(),
      timestamp: v.number(),
    }))),
    outcome: v.optional(v.string()),
    sentiment: v.optional(v.string()),
    summary: v.optional(v.string()),
    escalatedToHuman: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const updates: any = { status: args.status };
    if (args.transcript) updates.transcript = args.transcript;
    if (args.outcome) updates.outcome = args.outcome;
    if (args.sentiment) updates.sentiment = args.sentiment;
    if (args.summary) updates.summary = args.summary;
    if (args.escalatedToHuman !== undefined) updates.escalatedToHuman = args.escalatedToHuman;
    if (args.status === "completed" || args.status === "ended") {
      const call: any = await ctx.db.get(args.callId);
      if (call) {
        updates.endedAt = Date.now();
        updates.durationSeconds = Math.round((Date.now() - call.startedAt) / 1000);
      }
    }
    await ctx.db.patch(args.callId, updates);
  },
});

// ─── Process Voice Input (AI response generation) ───
export const processVoiceInput = action({
  args: {
    callId: v.id("voiceCalls"),
    userSpeech: v.string(),
    agentIndustry: v.string(),
    context: v.optional(v.any()),
  },
  handler: async (_ctx, args) => {
    const persona = VOICE_PERSONAS[args.agentIndustry] ?? VOICE_PERSONAS["default"];
    const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY ?? "";
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY ?? "";

    // Build system prompt for voice agent
    const systemPrompt = `You are ${persona.name}, an AI voice agent for a ${args.agentIndustry} business.
Your tone is: ${persona.tone}
You are currently on a ${args.context?.direction ?? "inbound"} phone call.

VOICE RULES:
- Keep responses SHORT (1-3 sentences max for phone)
- Be conversational and natural
- If asked something you can't handle, say "Let me transfer you to a team member who can help"
- Never mention you're AI unless directly asked
- Be helpful, efficient, and warm
- If scheduling, confirm date/time clearly
- If taking orders, repeat back the order
- If quoting prices, be clear and specific

ESCALATION TRIGGERS (transfer to human):
- Customer explicitly asks for a manager/human
- Legal or medical advice needed
- Complaint that needs resolution authority
- Payment disputes
- Emergency situations

${args.context?.businessInfo ? `Business Info: ${JSON.stringify(args.context.businessInfo)}` : ""}`;

    if (!ANTHROPIC_API_KEY && !OPENAI_API_KEY) {
      // Fallback intelligent response
      const fallbacks: Record<string, string> = {
        "car-dealership": "I'd love to help you find the right vehicle! Can you tell me what type you're looking for — sedan, SUV, truck? And do you have a budget range in mind?",
        "salon": "I can definitely help with that! We have openings this week. What service are you looking for — haircut, color, or a full treatment?",
        "restaurant": "Great choice! Let me check availability. How many guests and what date and time works best for you?",
        "healthcare": "I understand. Let me pull up our schedule. Is this for a new patient visit or a follow-up appointment?",
        "default": "Absolutely, I can help with that. Could you give me a few more details so I can assist you better?",
      };
      return {
        agentResponse: fallbacks[args.agentIndustry] ?? fallbacks["default"],
        agentName: persona.name,
        shouldEscalate: false,
        intent: "general_inquiry",
      };
    }

    try {
      // ── Primary: Claude Sonnet 4 (superior for customer-facing conversations) ──
      if (ANTHROPIC_API_KEY) {
        const response = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "x-api-key": ANTHROPIC_API_KEY,
            "anthropic-version": "2023-06-01",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "claude-sonnet-4-20250514",
            max_tokens: 200,
            system: systemPrompt,
            messages: [
              { role: "user", content: args.userSpeech },
            ],
            temperature: 0.7,
          }),
        });
        const data = await response.json();
        const agentResponse = data.content?.[0]?.text ?? "Let me transfer you to someone who can help.";
        const shouldEscalate = agentResponse.toLowerCase().includes("transfer") || agentResponse.toLowerCase().includes("manager");
        return { agentResponse, agentName: persona.name, shouldEscalate, intent: "ai_response", engine: "claude-sonnet-4" };
      }

      // ── Fallback: GPT-4o-mini (if no Anthropic key) ──
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: args.userSpeech },
          ],
          max_tokens: 150,
          temperature: 0.7,
        }),
      });
      const data = await response.json();
      const agentResponse = data.choices?.[0]?.message?.content ?? "Let me transfer you to someone who can help.";
      const shouldEscalate = agentResponse.toLowerCase().includes("transfer") || agentResponse.toLowerCase().includes("manager");
      return { agentResponse, agentName: persona.name, shouldEscalate, intent: "ai_response", engine: "gpt-4o-mini" };
    } catch {
      return {
        agentResponse: "I'm sorry, I'm having a moment. Let me connect you with a team member.",
        agentName: persona.name, shouldEscalate: true, intent: "error_fallback",
      };
    }
  },
});

// ─── Queries ───
export const listCalls = query({
  args: { orgId: v.optional(v.string()), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    let q = ctx.db.query("voiceCalls").order("desc");
    const calls = await q.take(args.limit ?? 50);
    if (args.orgId) return calls.filter(c => c.orgId === args.orgId);
    return calls;
  },
});

export const getCall = query({
  args: { callId: v.id("voiceCalls") },
  handler: async (ctx, args) => await ctx.db.get(args.callId),
});

export const getCallStats = query({
  args: {},
  handler: async (ctx) => {
    const calls = await ctx.db.query("voiceCalls").order("desc").take(500);
    const now = Date.now();
    const today = calls.filter(c => now - c.startedAt < 86400000);
    const thisWeek = calls.filter(c => now - c.startedAt < 604800000);

    const byOutcome: Record<string, number> = {};
    const byIndustry: Record<string, number> = {};
    let totalDuration = 0;
    let escalated = 0;

    for (const call of thisWeek) {
      if (call.outcome) byOutcome[call.outcome] = (byOutcome[call.outcome] ?? 0) + 1;
      byIndustry[call.agentIndustry] = (byIndustry[call.agentIndustry] ?? 0) + 1;
      totalDuration += call.durationSeconds ?? 0;
      if (call.escalatedToHuman) escalated++;
    }

    return {
      totalToday: today.length,
      totalThisWeek: thisWeek.length,
      avgDurationSeconds: thisWeek.length ? Math.round(totalDuration / thisWeek.length) : 0,
      escalationRate: thisWeek.length ? ((escalated / thisWeek.length) * 100).toFixed(1) : "0.0",
      byOutcome,
      byIndustry,
    };
  },
});
