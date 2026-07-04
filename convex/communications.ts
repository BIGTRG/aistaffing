import { v } from "convex/values";
import { action, mutation, query } from "./_generated/server";

declare const process: { env: Record<string, string | undefined> };

/* ═══════════════════════════════════════════════════════════════════════════
 * EMAIL & SMS AUTOMATION ENGINE
 *
 * Handles all outbound communications for AI agents across all verticals.
 * - Email: Templates, sequences, AI-composed, tracking
 * - SMS: Two-way messaging, campaigns, keyword triggers, opt-in
 *
 * Routes through the AI Gateway for logging and analytics.
 * ═══════════════════════════════════════════════════════════════════════════ */

// ─── Email Templates (per industry) ───
const EMAIL_TEMPLATES: Record<string, { subject: string; body: string }[]> = {
  "welcome": [
    { subject: "Welcome to {{businessName}}!", body: "Hi {{customerName}},\n\nThank you for choosing {{businessName}}! We're excited to have you as a customer.\n\nYour AI-powered team is ready to assist you 24/7. Here's what you can expect:\n\n• Lightning-fast responses to your inquiries\n• Automated appointment scheduling\n• Personalized service recommendations\n\nIf you need anything, just reply to this email or call us anytime.\n\nBest regards,\n{{agentName}}\n{{businessName}}" },
  ],
  "appointment_confirmation": [
    { subject: "Appointment Confirmed — {{date}} at {{time}}", body: "Hi {{customerName}},\n\nYour appointment is confirmed:\n\n📅 Date: {{date}}\n🕐 Time: {{time}}\n📍 Location: {{location}}\n🔧 Service: {{service}}\n\nNeed to reschedule? Just reply to this email or call us.\n\nSee you soon!\n{{agentName}}" },
  ],
  "follow_up": [
    { subject: "Following up — {{businessName}}", body: "Hi {{customerName}},\n\nI wanted to follow up on our recent conversation. Is there anything else I can help you with?\n\nWe value your business and want to make sure you had a great experience.\n\nBest,\n{{agentName}}\n{{businessName}}" },
  ],
  "invoice": [
    { subject: "Invoice #{{invoiceNumber}} from {{businessName}}", body: "Hi {{customerName}},\n\nPlease find your invoice details below:\n\nInvoice #: {{invoiceNumber}}\nAmount: ${{amount}}\nDue Date: {{dueDate}}\n\nPay securely online: {{paymentLink}}\n\nThank you for your business!\n{{businessName}}" },
  ],
  "quote": [
    { subject: "Your Custom Quote from {{businessName}}", body: "Hi {{customerName}},\n\nThank you for your interest! Here's your custom quote:\n\n{{quoteDetails}}\n\nTotal: ${{totalAmount}}\nValid until: {{expiryDate}}\n\nReady to proceed? Reply 'YES' or click here: {{acceptLink}}\n\nQuestions? Just reply to this email.\n\n{{agentName}}\n{{businessName}}" },
  ],
};

// ─── Send Email ───
export const sendEmail = mutation({
  args: {
    orgId: v.optional(v.string()),
    to: v.string(),
    subject: v.string(),
    body: v.string(),
    templateId: v.optional(v.string()),
    variables: v.optional(v.any()),
    scheduledFor: v.optional(v.number()),
    sequenceId: v.optional(v.string()),
    sequenceStep: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Apply template variables if provided
    let finalSubject = args.subject;
    let finalBody = args.body;

    if (args.variables) {
      for (const [key, value] of Object.entries(args.variables as Record<string, string>)) {
        const placeholder = `{{${key}}}`;
        finalSubject = finalSubject.replace(new RegExp(placeholder.replace(/[{}]/g, '\\$&'), 'g'), value);
        finalBody = finalBody.replace(new RegExp(placeholder.replace(/[{}]/g, '\\$&'), 'g'), value);
      }
    }

    const emailId = await ctx.db.insert("emailMessages", {
      orgId: args.orgId,
      to: args.to,
      subject: finalSubject,
      body: finalBody,
      templateId: args.templateId,
      status: args.scheduledFor ? "scheduled" : "queued",
      scheduledFor: args.scheduledFor,
      sentAt: undefined,
      openedAt: undefined,
      clickedAt: undefined,
      bouncedAt: undefined,
      sequenceId: args.sequenceId,
      sequenceStep: args.sequenceStep,
      createdAt: Date.now(),
    });

    return { emailId, status: args.scheduledFor ? "scheduled" : "queued" };
  },
});

// ─── Send SMS ───
export const sendSms = mutation({
  args: {
    orgId: v.optional(v.string()),
    to: v.string(),
    message: v.string(),
    mediaUrl: v.optional(v.string()),
    campaignId: v.optional(v.string()),
    isOptInConfirmation: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const smsId = await ctx.db.insert("smsMessages", {
      orgId: args.orgId,
      to: args.to,
      message: args.message,
      mediaUrl: args.mediaUrl,
      direction: "outbound",
      status: "queued",
      campaignId: args.campaignId,
      isOptInConfirmation: args.isOptInConfirmation ?? false,
      sentAt: undefined,
      deliveredAt: undefined,
      failedAt: undefined,
      createdAt: Date.now(),
    });

    return { smsId, status: "queued" };
  },
});

// ─── AI Email Composer ───
export const composeEmail = action({
  args: {
    purpose: v.string(),       // welcome | follow_up | quote | appointment | custom
    customerName: v.string(),
    businessName: v.string(),
    agentName: v.string(),
    industry: v.string(),
    context: v.optional(v.string()),
  },
  handler: async (_ctx, args) => {
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY ?? "";

    // Use template if available
    const templates = EMAIL_TEMPLATES[args.purpose];
    if (templates && templates.length > 0) {
      const template = templates[0];
      const subject = template.subject
        .replace(/\{\{businessName\}\}/g, args.businessName)
        .replace(/\{\{customerName\}\}/g, args.customerName);
      const body = template.body
        .replace(/\{\{businessName\}\}/g, args.businessName)
        .replace(/\{\{customerName\}\}/g, args.customerName)
        .replace(/\{\{agentName\}\}/g, args.agentName);
      return { subject, body, source: "template" };
    }

    // AI compose
    if (!OPENAI_API_KEY) {
      return {
        subject: `From ${args.businessName}`,
        body: `Hi ${args.customerName},\n\nThank you for reaching out to ${args.businessName}. ${args.context ?? "We look forward to serving you."}\n\nBest,\n${args.agentName}`,
        source: "fallback",
      };
    }

    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: `You are ${args.agentName}, an AI assistant for ${args.businessName} (${args.industry}).
Write a professional email. Return JSON: { "subject": "...", "body": "..." }
Keep it concise, warm, and professional. Include the business name in the sign-off.`,
            },
            {
              role: "user",
              content: `Write a ${args.purpose} email to ${args.customerName}. ${args.context ?? ""}`,
            },
          ],
          max_tokens: 500,
          temperature: 0.7,
          response_format: { type: "json_object" },
        }),
      });
      const data = await response.json();
      const result = JSON.parse(data.choices?.[0]?.message?.content ?? "{}");
      return { ...result, source: "ai" };
    } catch {
      return {
        subject: `From ${args.businessName}`,
        body: `Hi ${args.customerName},\n\nThank you for your interest in ${args.businessName}.\n\nBest,\n${args.agentName}`,
        source: "fallback",
      };
    }
  },
});

// ─── Email Sequences ───
export const createSequence = mutation({
  args: {
    orgId: v.optional(v.string()),
    name: v.string(),
    triggerEvent: v.string(),   // new_lead | post_purchase | appointment_reminder | win_back
    steps: v.array(v.object({
      delayHours: v.number(),
      templateId: v.string(),
      subject: v.string(),
      body: v.string(),
      channel: v.string(),     // email | sms | both
    })),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("emailSequences", {
      orgId: args.orgId,
      name: args.name,
      triggerEvent: args.triggerEvent,
      steps: args.steps,
      isActive: args.isActive,
      enrolledCount: 0,
      completedCount: 0,
      createdAt: Date.now(),
    });
  },
});

// ─── Queries ───
export const listEmails = query({
  args: { orgId: v.optional(v.string()), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const emails = await ctx.db.query("emailMessages").order("desc").take(args.limit ?? 50);
    if (args.orgId) return emails.filter(e => e.orgId === args.orgId);
    return emails;
  },
});

export const listSmsMessages = query({
  args: { orgId: v.optional(v.string()), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const msgs = await ctx.db.query("smsMessages").order("desc").take(args.limit ?? 50);
    if (args.orgId) return msgs.filter(m => m.orgId === args.orgId);
    return msgs;
  },
});

export const listSequences = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("emailSequences").collect();
  },
});

export const getCommsStats = query({
  args: {},
  handler: async (ctx) => {
    const emails = await ctx.db.query("emailMessages").order("desc").take(500);
    const sms = await ctx.db.query("smsMessages").order("desc").take(500);
    const now = Date.now();

    const emailsToday = emails.filter(e => now - e.createdAt < 86400000);
    const smsToday = sms.filter(s => now - s.createdAt < 86400000);
    const emailsSent = emails.filter(e => e.status === "sent" || e.status === "delivered");
    const emailsOpened = emails.filter(e => e.openedAt);

    return {
      emailsToday: emailsToday.length,
      smsToday: smsToday.length,
      totalEmails: emails.length,
      totalSms: sms.length,
      emailsSent: emailsSent.length,
      openRate: emailsSent.length ? ((emailsOpened.length / emailsSent.length) * 100).toFixed(1) : "0.0",
      sequences: (await ctx.db.query("emailSequences").collect()).length,
    };
  },
});

// ─── Get Available Templates ───
export const getTemplates = query({
  args: {},
  handler: async () => {
    return Object.entries(EMAIL_TEMPLATES).map(([id, templates]) => ({
      id,
      name: id.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase()),
      variants: templates.length,
      subject: templates[0]?.subject ?? "",
    }));
  },
});
