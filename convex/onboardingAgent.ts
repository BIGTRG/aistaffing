import { v } from "convex/values";
import { mutation, query, action } from "./_generated/server";
import { api } from "./_generated/api";

declare const process: { env: Record<string, string | undefined> };

const VIKTOR_API_URL = process.env.VIKTOR_SPACES_API_URL!;
const PROJECT_NAME = process.env.VIKTOR_SPACES_PROJECT_NAME!;
const PROJECT_SECRET = process.env.VIKTOR_SPACES_PROJECT_SECRET!;

// ══════════════════════════════════════════════════
// QUERIES
// ══════════════════════════════════════════════════

export const listSessions = query({
  args: {},
  handler: async (ctx) => {
    const sessions = await ctx.db
      .query("onboardingSessions")
      .order("desc")
      .collect();
    return sessions;
  },
});

export const listSessionsByStatus = query({
  args: { status: v.string() },
  handler: async (ctx, { status }) => {
    return await ctx.db
      .query("onboardingSessions")
      .withIndex("by_status", (q) => q.eq("status", status))
      .order("desc")
      .collect();
  },
});

export const getSession = query({
  args: { id: v.id("onboardingSessions") },
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id);
  },
});

export const getSessionMessages = query({
  args: { sessionId: v.id("onboardingSessions") },
  handler: async (ctx, { sessionId }) => {
    return await ctx.db
      .query("onboardingMessages")
      .withIndex("by_session", (q) => q.eq("sessionId", sessionId))
      .order("asc")
      .collect();
  },
});

export const stats = query({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("onboardingSessions").collect();
    const byStatus: Record<string, number> = {};
    for (const s of all) {
      byStatus[s.status] = (byStatus[s.status] || 0) + 1;
    }
    return {
      total: all.length,
      byStatus,
      deployed: byStatus["deployed"] || 0,
      inProgress: (byStatus["intake"] || 0) + (byStatus["analyzing"] || 0),
    };
  },
});

// ══════════════════════════════════════════════════
// MUTATIONS
// ══════════════════════════════════════════════════

export const createSession = mutation({
  args: {
    clientName: v.string(),
    clientEmail: v.optional(v.string()),
    clientPhone: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const sessionId = await ctx.db.insert("onboardingSessions", {
      clientName: args.clientName,
      clientEmail: args.clientEmail,
      clientPhone: args.clientPhone,
      status: "intake",
      createdAt: now,
      updatedAt: now,
    });

    // Insert the agent's opening message
    await ctx.db.insert("onboardingMessages", {
      sessionId,
      role: "agent",
      content: `Welcome, ${args.clientName}! I'm the AI Workflow Builder — I'll help you set up the perfect automated system for your business.\n\nLet's start with the basics:\n\n**What industry or type of business do you operate?**\n\nFor example: plumbing, salon, restaurant, law firm, insurance agency, trucking, photography, etc.`,
      timestamp: now,
    });

    return sessionId;
  },
});

export const addMessage = mutation({
  args: {
    sessionId: v.id("onboardingSessions"),
    role: v.string(),
    content: v.string(),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("onboardingMessages", {
      sessionId: args.sessionId,
      role: args.role,
      content: args.content,
      metadata: args.metadata,
      timestamp: Date.now(),
    });
    await ctx.db.patch(args.sessionId, { updatedAt: Date.now() });
  },
});

export const updateSession = mutation({
  args: {
    id: v.id("onboardingSessions"),
    detectedIndustry: v.optional(v.string()),
    detectedPlatforms: v.optional(v.array(v.string())),
    businessSize: v.optional(v.string()),
    painPoints: v.optional(v.array(v.string())),
    automationGoals: v.optional(v.array(v.string())),
    answers: v.optional(v.any()),
    status: v.optional(v.string()),
    generatedWorkflowPreview: v.optional(v.any()),
    generatedWorkflowId: v.optional(v.id("workflowTemplates")),
  },
  handler: async (ctx, { id, ...fields }) => {
    const updates: Record<string, unknown> = { updatedAt: Date.now() };
    for (const [key, value] of Object.entries(fields)) {
      if (value !== undefined) updates[key] = value;
    }
    await ctx.db.patch(id, updates);
  },
});

export const deleteSession = mutation({
  args: { id: v.id("onboardingSessions") },
  handler: async (ctx, { id }) => {
    // Delete all messages
    const messages = await ctx.db
      .query("onboardingMessages")
      .withIndex("by_session", (q) => q.eq("sessionId", id))
      .collect();
    for (const msg of messages) {
      await ctx.db.delete(msg._id);
    }
    await ctx.db.delete(id);
  },
});

// ══════════════════════════════════════════════════
// AI ACTIONS
// ══════════════════════════════════════════════════

async function callAI(prompt: string): Promise<string> {
  try {
    const response = await fetch(`${VIKTOR_API_URL}/api/viktor-spaces/tools/call`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        project_name: PROJECT_NAME,
        project_secret: PROJECT_SECRET,
        role: "quick_ai_search",
        arguments: { query: prompt },
      }),
    });

    if (response.ok) {
      const data = await response.json();
      if (data.result?.search_response) return data.result.search_response;
      if (data.response_text) return data.response_text;
    }
  } catch (e) {
    console.error("AI call error:", e);
  }
  return "";
}

// ── Industry/context data for the agent ──
const INDUSTRY_MAP: Record<string, { slug: string; platforms: string[]; keywords: string[] }> = {
  "healthcare": { slug: "healthcare", platforms: ["crm", "hr-recruitment", "finance", "background-check"], keywords: ["hospital", "clinic", "medical", "doctor", "patient", "health", "nursing", "dental", "pharmacy"] },
  "home-services": { slug: "home-services", platforms: ["crm", "hr-recruitment", "finance", "ai-workforce"], keywords: ["hvac", "plumbing", "plumber", "electrical", "electrician", "handyman", "contractor", "repair"] },
  "insurance": { slug: "insurance", platforms: ["crm", "finance", "legal", "background-check"], keywords: ["insurance", "policy", "premium", "underwriting", "claims", "carrier", "broker"] },
  "real-estate": { slug: "real-estate", platforms: ["crm", "legal", "finance", "background-check"], keywords: ["real estate", "realtor", "property", "listing", "mls", "mortgage", "brokerage"] },
  "lending": { slug: "lending", platforms: ["crm", "finance", "legal", "background-check"], keywords: ["lending", "loan", "mortgage", "factoring", "credit", "underwrite"] },
  "legal": { slug: "legal", platforms: ["crm", "legal", "finance", "background-check"], keywords: ["law firm", "lawyer", "attorney", "legal", "litigation", "case", "court"] },
  "lawn-care": { slug: "lawn-care", platforms: ["crm", "hr-recruitment", "finance"], keywords: ["lawn", "landscaping", "mowing", "irrigation", "yard", "garden"] },
  "barber-shops": { slug: "barber-shops", platforms: ["crm", "finance", "hr-recruitment"], keywords: ["barber", "barbershop", "haircut", "grooming", "fade"] },
  "restaurants": { slug: "restaurants", platforms: ["crm", "hr-recruitment", "finance"], keywords: ["restaurant", "cafe", "food", "dining", "kitchen", "catering", "bar"] },
  "salon": { slug: "salon", platforms: ["crm", "finance", "hr-recruitment"], keywords: ["salon", "hair", "nails", "spa", "beauty", "stylist", "cosmetology"] },
  "bakeries": { slug: "bakeries", platforms: ["crm", "finance"], keywords: ["bakery", "pastry", "cake", "bread", "baking"] },
  "boutique": { slug: "boutique", platforms: ["crm", "finance"], keywords: ["boutique", "clothing", "retail", "fashion", "apparel", "store"] },
  "ecommerce": { slug: "ecommerce", platforms: ["crm", "finance"], keywords: ["ecommerce", "e-commerce", "online store", "shopify", "dropship", "dtc"] },
  "phone-companies": { slug: "phone-companies", platforms: ["crm", "finance", "hr-recruitment"], keywords: ["phone", "telecom", "mobile", "carrier", "wireless", "cellular"] },
  "construction": { slug: "construction", platforms: ["crm", "hr-recruitment", "finance", "legal"], keywords: ["construction", "builder", "contractor", "building", "renovation", "remodel"] },
  "marketing": { slug: "marketing", platforms: ["crm", "finance"], keywords: ["marketing", "agency", "advertising", "digital", "social media", "seo", "branding"] },
  "mobile-mechanics": { slug: "mobile-mechanics", platforms: ["crm", "finance", "hr-recruitment"], keywords: ["mechanic", "auto repair", "mobile mechanic", "car", "vehicle", "automotive"] },
  "trucking": { slug: "trucking", platforms: ["crm", "hr-recruitment", "finance", "legal"], keywords: ["trucking", "truck", "freight", "logistics", "driver", "fleet", "dispatch", "delivery", "route"] },
  "mental-health": { slug: "mental-health", platforms: ["crm", "hr-recruitment", "finance"], keywords: ["therapy", "therapist", "counseling", "psychiatry", "mental health", "psychology"] },
  "photographers": { slug: "photographers", platforms: ["crm", "finance"], keywords: ["photographer", "photography", "photo", "studio", "shoot", "wedding photo"] },
  "film-editors": { slug: "film-editors", platforms: ["crm", "finance"], keywords: ["film", "video", "editor", "production", "post-production", "editing"] },
  "authors": { slug: "authors", platforms: ["crm", "finance"], keywords: ["author", "writer", "book", "publishing", "manuscript", "ghostwrit"] },
};

function detectIndustry(text: string): { slug: string; platforms: string[] } | null {
  const lower = text.toLowerCase();
  let bestMatch: { slug: string; platforms: string[]; score: number } | null = null;

  for (const [, info] of Object.entries(INDUSTRY_MAP)) {
    let score = 0;
    for (const kw of info.keywords) {
      if (lower.includes(kw)) score++;
    }
    if (score > 0 && (!bestMatch || score > bestMatch.score)) {
      bestMatch = { slug: info.slug, platforms: info.platforms, score };
    }
  }

  return bestMatch ? { slug: bestMatch.slug, platforms: bestMatch.platforms } : null;
}

// ── The main chat action ──
export const chat = action({
  args: {
    sessionId: v.id("onboardingSessions"),
    userMessage: v.string(),
  },
  handler: async (ctx, { sessionId, userMessage }): Promise<string> => {
    // Save user message
    await ctx.runMutation(api.onboardingAgent.addMessage, {
      sessionId,
      role: "client",
      content: userMessage,
    });

    // Get session state + history
    const session: any = await ctx.runQuery(api.onboardingAgent.getSession, { id: sessionId });
    if (!session) throw new Error("Session not found");

    const messages: any[] = await ctx.runQuery(api.onboardingAgent.getSessionMessages, { sessionId });

    // Get all industries for context
    const industries: any[] = await ctx.runQuery(api.industries.list, {});
    const industryNames = industries.map((i: { name: string; slug: string }) => `${i.name} (${i.slug})`).join(", ");

    // Build conversation history
    const conversationHistory = messages
      .slice(-20)
      .map((m: { role: string; content: string }) => `${m.role === "client" ? "Client" : "Agent"}: ${m.content}`)
      .join("\n\n");

    // Detect industry from full conversation
    const fullText = messages.map((m: { content: string }) => m.content).join(" ") + " " + userMessage;
    const detected = detectIndustry(fullText);

    // Determine conversation phase
    const messageCount = messages.filter((m: { role: string }) => m.role === "client").length + 1;
    const hasIndustry = session.detectedIndustry || detected;
    const hasSize = session.businessSize || /\b(solo|small|medium|large|\d+\s*(employee|people|staff|person|team))/i.test(fullText);
    const hasPainPoints = session.painPoints?.length || messageCount >= 3;

    let phaseInstruction = "";

    if (!hasIndustry) {
      phaseInstruction = `PHASE: INDUSTRY DETECTION
The client hasn't clearly stated their industry yet. Ask them specifically what type of business they run. Be conversational and friendly.`;
    } else if (!hasSize) {
      phaseInstruction = `PHASE: BUSINESS SIZE
You've identified the industry. Now ask about their team size: How many employees do they have? Are they a solo operator, small team (2-10), medium (11-50), or larger?`;
    } else if (!hasPainPoints) {
      phaseInstruction = `PHASE: PAIN POINTS & GOALS
Now dig into their biggest pain points. What tasks take the most time? What do they wish was automated? What's their biggest operational headache? Ask 1-2 targeted questions based on their industry.`;
    } else if (messageCount >= 4 && session.status === "intake") {
      phaseInstruction = `PHASE: READY TO ANALYZE
You have enough information to build their workflow. Tell the client you understand their needs and you're now going to analyze their industry and generate a custom automated workflow. End with: "Let me build your custom workflow now — give me a moment."
      
IMPORTANT: Include the exact phrase "READY_TO_GENERATE" at the very end of your response (after your message to the client).`;
    }

    // Build the AI prompt
    const systemPrompt = `You are the AI Workflow Builder Agent for Genius Eye Business Platform. Your job is to onboard new business clients by understanding their industry, operations, and pain points — then generate a custom automated workflow for them.

Available industries: ${industryNames}

Current session info:
- Client: ${session.clientName}
- Detected industry: ${session.detectedIndustry || detected?.slug || "not yet detected"}
- Business size: ${session.businessSize || "unknown"}
- Pain points: ${session.painPoints?.join(", ") || "not yet captured"}
- Automation goals: ${session.automationGoals?.join(", ") || "not yet captured"}

${phaseInstruction}

RULES:
- Be conversational, warm, and professional
- Ask ONE question at a time (don't overwhelm)
- Show you understand their industry — reference specific challenges they'd face
- Keep responses under 150 words
- Use bold (**text**) for emphasis
- When you detect their industry, confirm it with them

CONVERSATION SO FAR:
${conversationHistory}

Client: ${userMessage}

Respond as the Agent:`;

    const aiResponse = await callAI(systemPrompt);
    const cleanResponse = aiResponse.replace(/^Agent:\s*/i, "").trim();

    // Check if we should trigger workflow generation
    const shouldGenerate = cleanResponse.includes("READY_TO_GENERATE") || (messageCount >= 5 && hasIndustry && hasPainPoints);
    const displayResponse = cleanResponse.replace("READY_TO_GENERATE", "").trim();

    // Update session with detected info
    const updates: Record<string, unknown> = {};
    if (detected && !session.detectedIndustry) {
      updates.detectedIndustry = detected.slug;
      updates.detectedPlatforms = detected.platforms;
    }

    // Try to extract business size
    const sizeMatch = fullText.match(/(\d+)\s*(employee|people|staff|person|team|worker)/i);
    if (sizeMatch && !session.businessSize) {
      const count = parseInt(sizeMatch[1]);
      if (count <= 1) updates.businessSize = "solo";
      else if (count <= 10) updates.businessSize = "small";
      else if (count <= 50) updates.businessSize = "medium";
      else updates.businessSize = "large";
    }
    if (/\bsolo\b|\bjust me\b|\bmyself\b|\bone.?man\b/i.test(fullText) && !session.businessSize) {
      updates.businessSize = "solo";
    }

    if (Object.keys(updates).length > 0) {
      await ctx.runMutation(api.onboardingAgent.updateSession, {
        id: sessionId,
        ...updates,
      } as any);
    }

    // Save agent response
    await ctx.runMutation(api.onboardingAgent.addMessage, {
      sessionId,
      role: "agent",
      content: displayResponse,
    });

    // If ready to generate, trigger workflow generation
    if (shouldGenerate) {
      await ctx.runMutation(api.onboardingAgent.updateSession, {
        id: sessionId,
        status: "analyzing",
      } as any);

      // Run workflow generation
      try {
        await ctx.runAction(api.onboardingAgent.generateWorkflow, { sessionId });
      } catch (e) {
        console.error("Workflow generation error:", e);
      }
    }

    return displayResponse;
  },
});

// ── Generate workflow from session data ──
export const generateWorkflow = action({
  args: { sessionId: v.id("onboardingSessions") },
  handler: async (ctx, { sessionId }): Promise<any> => {
    const session: any = await ctx.runQuery(api.onboardingAgent.getSession, { id: sessionId });
    if (!session) throw new Error("Session not found");

    const messages: any[] = await ctx.runQuery(api.onboardingAgent.getSessionMessages, { sessionId });
    const conversationSummary = messages
      .map((m: { role: string; content: string }) => `${m.role}: ${m.content}`)
      .join("\n");

    const industrySlug = session.detectedIndustry || "general";

    // Get matching industry data
    const industry: any = await ctx.runQuery(api.industries.getBySlug, { slug: industrySlug });

    const generatePrompt = `You are an expert workflow automation architect. Based on this client onboarding conversation, generate a detailed custom workflow.

CLIENT INFO:
- Name: ${session.clientName}
- Industry: ${industry?.name || industrySlug}
- Business Size: ${session.businessSize || "small"}
- Industry Features: ${industry?.features?.join(", ") || "general business"}

CONVERSATION:
${conversationSummary}

Generate a JSON workflow with this EXACT structure (no markdown, no code blocks, just raw JSON):
{
  "name": "Workflow Name - specific to their business",
  "description": "2-3 sentence description of what this workflow automates",
  "platformSlug": "crm",
  "triggerType": "event",
  "triggerDescription": "What triggers this workflow",
  "steps": [
    {
      "order": 1,
      "name": "Step Name",
      "type": "action|ai_agent|api_call|condition|delay|human_review",
      "description": "What this step does"
    }
  ]
}

RULES:
- Create 5-8 steps that directly address their pain points
- Use "ai_agent" type for steps where AI handles intelligence
- Use "human_review" type for steps needing human approval/oversight
- Use "api_call" for external integrations
- Use "delay" for timed steps (follow-ups, reminders)
- Use "condition" for branching logic
- Make step names action-oriented and specific to their business
- The workflow should feel custom-built, not generic`;

    const aiResponse = await callAI(generatePrompt);

    // Parse the JSON
    let workflow;
    try {
      // Try to extract JSON from response
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        workflow = JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      console.error("Failed to parse workflow JSON:", e);
    }

    if (!workflow) {
      // Fallback: generate a reasonable default
      workflow = {
        name: `${session.clientName} — Automated Operations`,
        description: `Custom automated workflow for ${session.clientName} in the ${industry?.name || industrySlug} industry.`,
        platformSlug: industry?.platformIds?.[0] || "crm",
        triggerType: "event",
        triggerDescription: "New client inquiry or service request",
        steps: [
          { order: 1, name: "Capture Inquiry", type: "ai_agent", description: "AI captures incoming request and extracts key details" },
          { order: 2, name: "Qualify & Route", type: "ai_agent", description: "AI qualifies the request and routes to appropriate service" },
          { order: 3, name: "Schedule Service", type: "action", description: "Automatically schedule based on availability" },
          { order: 4, name: "Assign Team", type: "action", description: "Assign the right team member or resource" },
          { order: 5, name: "Service Delivery", type: "human_review", description: "Team delivers service, logs completion" },
          { order: 6, name: "Auto-Invoice", type: "api_call", description: "Generate and send invoice automatically" },
          { order: 7, name: "Follow-Up", type: "delay", description: "24-hour automated follow-up for satisfaction" },
          { order: 8, name: "Review Request", type: "ai_agent", description: "AI sends personalized review request" },
        ],
      };
    }

    // Save as preview
    await ctx.runMutation(api.onboardingAgent.updateSession, {
      id: sessionId,
      status: "workflow_generated",
      generatedWorkflowPreview: workflow,
    } as any);

    // Post the workflow as an agent message
    const stepsDisplay = workflow.steps
      .map((s: { order: number; name: string; type: string; description: string }) =>
        `**Step ${s.order}: ${s.name}** (${s.type})\n${s.description}`
      )
      .join("\n\n");

    await ctx.runMutation(api.onboardingAgent.addMessage, {
      sessionId,
      role: "agent",
      content: `✅ **Your custom workflow is ready!**\n\n**${workflow.name}**\n${workflow.description}\n\n**Trigger:** ${workflow.triggerDescription}\n\n${stepsDisplay}\n\n---\n\nThis workflow is customized for your business. You can deploy it now or adjust any steps. Hit **Deploy Workflow** when you're ready to go live!`,
    });

    return workflow;
  },
});

// ── Deploy the generated workflow ──
export const deployWorkflow = action({
  args: { sessionId: v.id("onboardingSessions") },
  handler: async (ctx, { sessionId }): Promise<string> => {
    const session: any = await ctx.runQuery(api.onboardingAgent.getSession, { id: sessionId });
    if (!session) throw new Error("Session not found");
    if (!session.generatedWorkflowPreview) throw new Error("No workflow to deploy");

    const wf: any = session.generatedWorkflowPreview;

    // Create the workflow template
    const workflowId: any = await ctx.runMutation(api.workflows.create, {
      name: wf.name,
      industrySlug: session.detectedIndustry || undefined,
      platformSlug: wf.platformSlug || "crm",
      description: wf.description,
      triggerType: wf.triggerType || "event",
      triggerDescription: wf.triggerDescription || "Triggered by client action",
      steps: wf.steps.map((s: any) => ({
        order: s.order,
        name: s.name,
        type: s.type,
        description: s.description,
        config: s.config,
      })),
      isActive: true,
      isTemplate: false,
    });

    // Update session
    await ctx.runMutation(api.onboardingAgent.updateSession, {
      id: sessionId,
      status: "deployed",
      generatedWorkflowId: workflowId,
    } as any);

    // Post deployment message
    await ctx.runMutation(api.onboardingAgent.addMessage, {
      sessionId,
      role: "agent",
      content: `🚀 **Workflow deployed successfully!**\n\nYour custom workflow "${wf.name}" is now live and active. It will automatically trigger when ${wf.triggerDescription.toLowerCase()}.\n\nYou can view and manage this workflow in the **Workflow Templates** section of the admin panel.`,
    });

    return workflowId;
  },
});

// ── Force-trigger workflow generation (manual) ──
export const triggerGeneration = action({
  args: { sessionId: v.id("onboardingSessions") },
  handler: async (ctx, { sessionId }): Promise<any> => {
    await ctx.runMutation(api.onboardingAgent.updateSession, {
      id: sessionId,
      status: "analyzing",
    } as any);

    await ctx.runMutation(api.onboardingAgent.addMessage, {
      sessionId,
      role: "agent",
      content: "Analyzing your business and building a custom workflow now... 🔄",
    });

    const workflow: any = await ctx.runAction(api.onboardingAgent.generateWorkflow, { sessionId });
    return workflow;
  },
});
