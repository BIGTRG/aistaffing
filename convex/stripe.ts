import { v } from "convex/values";
import { action, mutation, query } from "./_generated/server";
import { api } from "./_generated/api";
// import { getAuthUserId } from "@convex-dev/auth/server";

declare const process: { env: Record<string, string | undefined> };

/* ═══════════════════════════════════════════════════
   STRIPE INTEGRATION
   Creates checkout sessions and handles webhooks
   ═══════════════════════════════════════════════════ */

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY ?? "";
// const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET ?? "";
const APP_URL = process.env.APP_URL ?? "https://ai-staffing-agency-58b75145.viktor.space";

/* ─── Create Stripe Checkout Session ─── */
export const createCheckoutSession = action({
  args: {
    orgId: v.id("organizations"),
    lineItems: v.array(
      v.object({
        name: v.string(),
        description: v.string(),
        amountCents: v.number(),
        quantity: v.number(),
      })
    ),
    successUrl: v.optional(v.string()),
    cancelUrl: v.optional(v.string()),
  },
  handler: async (_ctx, args) => {
    // If Stripe is not configured, return a mock URL
    if (!STRIPE_SECRET_KEY) {
      return {
        url: `${APP_URL}/employer/billing?session=demo&status=success`,
        sessionId: "demo_session_" + Date.now(),
      };
    }

    const response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${STRIPE_SECRET_KEY}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        mode: "subscription",
        success_url: args.successUrl ?? `${APP_URL}/employer/billing?session={CHECKOUT_SESSION_ID}&status=success`,
        cancel_url: args.cancelUrl ?? `${APP_URL}/employer/billing?status=cancelled`,
        "metadata[orgId]": args.orgId,
        ...Object.fromEntries(
          args.lineItems.flatMap((item, i) => [
            [`line_items[${i}][price_data][currency]`, "usd"],
            [`line_items[${i}][price_data][product_data][name]`, item.name],
            [`line_items[${i}][price_data][product_data][description]`, item.description],
            [`line_items[${i}][price_data][unit_amount]`, String(item.amountCents)],
            [`line_items[${i}][price_data][recurring][interval]`, "month"],
            [`line_items[${i}][quantity]`, String(item.quantity)],
          ])
        ),
      }),
    });

    const session = await response.json();
    return { url: session.url, sessionId: session.id };
  },
});

/* ─── Create Stripe Customer Portal Session ─── */
export const createPortalSession = action({
  args: { orgId: v.id("organizations") },
  handler: async (ctx, args): Promise<{ url: string }> => {
    const org: any = await ctx.runQuery(api.organizations.getById, { orgId: args.orgId });
    if (!org?.stripeCustomerId || !STRIPE_SECRET_KEY) {
      return { url: `${APP_URL}/employer/billing` };
    }

    const response: Response = await fetch("https://api.stripe.com/v1/billing_portal/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${STRIPE_SECRET_KEY}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        customer: org.stripeCustomerId,
        return_url: `${APP_URL}/employer/billing`,
      }),
    });

    const session: any = await response.json();
    return { url: session.url };
  },
});

/* ─── Store Stripe customer ID ─── */
export const setStripeCustomerId = mutation({
  args: {
    orgId: v.id("organizations"),
    stripeCustomerId: v.string(),
  },
  handler: async (ctx, { orgId, stripeCustomerId }) => {
    await ctx.db.patch(orgId, { stripeCustomerId });
  },
});

/* ─── Record a stripe event ─── */
export const recordEvent = mutation({
  args: {
    stripeEventId: v.string(),
    type: v.string(),
    data: v.any(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("stripeEvents", {
      stripeEventId: args.stripeEventId,
      type: args.type,
      data: args.data,
      processedAt: Date.now(),
    });
  },
});

/* ─── Check if Stripe is configured ─── */
export const isConfigured = query({
  args: {},
  handler: async () => {
    return { configured: !!STRIPE_SECRET_KEY };
  },
});
