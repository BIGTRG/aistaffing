import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// ── Queries ──

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("industries")
      .collect();
  },
});

export const listActive = query({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db
      .query("industries")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .collect();
    return all.sort((a, b) => a.sortOrder - b.sortOrder);
  },
});

export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    return await ctx.db
      .query("industries")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .first();
  },
});

export const stats = query({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("industries").collect();
    const active = all.filter((i) => i.isActive);
    const categories = {
      original: all.filter((i) => i.category === "original").length,
      expanded: all.filter((i) => i.category === "expanded").length,
      creative: all.filter((i) => i.category === "creative").length,
    };
    return {
      total: all.length,
      active: active.length,
      inactive: all.length - active.length,
      categories,
    };
  },
});

// ── Mutations ──

export const create = mutation({
  args: {
    name: v.string(),
    slug: v.string(),
    icon: v.string(),
    description: v.string(),
    category: v.string(),
    multiplier: v.number(),
    platformIds: v.array(v.string()),
    features: v.array(v.string()),
    isActive: v.boolean(),
    sortOrder: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("industries", args);
  },
});

export const update = mutation({
  args: {
    id: v.id("industries"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    icon: v.optional(v.string()),
    multiplier: v.optional(v.number()),
    platformIds: v.optional(v.array(v.string())),
    features: v.optional(v.array(v.string())),
    isActive: v.optional(v.boolean()),
    sortOrder: v.optional(v.number()),
  },
  handler: async (ctx, { id, ...fields }) => {
    const updates: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(fields)) {
      if (value !== undefined) updates[key] = value;
    }
    await ctx.db.patch(id, updates);
  },
});

export const toggleActive = mutation({
  args: { id: v.id("industries") },
  handler: async (ctx, { id }) => {
    const industry = await ctx.db.get(id);
    if (!industry) throw new Error("Industry not found");
    await ctx.db.patch(id, { isActive: !industry.isActive });
  },
});

export const updateMultiplier = mutation({
  args: { id: v.id("industries"), multiplier: v.number() },
  handler: async (ctx, { id, multiplier }) => {
    await ctx.db.patch(id, { multiplier });
  },
});

export const remove = mutation({
  args: { id: v.id("industries") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});

// ── Seed ──

export const seed = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("industries").first();
    if (existing) return "already_seeded";

    const industries = [
      // Original 6
      { name: "Healthcare & Clinics", slug: "healthcare", icon: "Heart", description: "Hospitals, clinics, mental health, home health. HIPAA + credential engine + Medicaid billing.", category: "original", multiplier: 1.5, platformIds: ["crm", "hr-recruitment", "finance", "background-check"], features: ["HIPAA compliance", "Credential validation", "Medicaid billing", "Patient scheduling", "50-state compliance"], sortOrder: 1 },
      { name: "Home Services", slug: "home-services", icon: "Wrench", description: "HVAC, plumbing, electrical, general contractors. Dispatch + quoting + review collection.", category: "original", multiplier: 1.0, platformIds: ["crm", "hr-recruitment", "finance", "ai-workforce"], features: ["Dispatch engine", "Service quoting", "Review collection", "Route optimization", "Equipment tracking"], sortOrder: 2 },
      { name: "Insurance Agencies", slug: "insurance", icon: "Shield", description: "P&C, life, health insurance. AI-driven quoting engine + carrier integrations.", category: "original", multiplier: 1.4, platformIds: ["crm", "finance", "legal", "background-check"], features: ["AI quoting engine", "Carrier API integrations", "Policy management", "Claims processing", "Commission tracking"], sortOrder: 3 },
      { name: "Real Estate", slug: "real-estate", icon: "Home", description: "Brokerages, property management, mortgage. MLS + transaction coordination.", category: "original", multiplier: 1.2, platformIds: ["crm", "legal", "finance", "background-check"], features: ["MLS integration", "Transaction coordination", "Document management", "Commission splits", "Property listings"], sortOrder: 4 },
      { name: "Lending & Finance", slug: "lending", icon: "Landmark", description: "Mortgage, business lending, factoring. Loan origination + underwriting + collections.", category: "original", multiplier: 1.5, platformIds: ["crm", "finance", "legal", "background-check"], features: ["Loan origination", "AI underwriting", "Collections automation", "Compliance reporting", "Risk scoring"], sortOrder: 5 },
      { name: "Legal", slug: "legal", icon: "Scale", description: "Law firms, legal services. Full Michael AI + billable hours + trust accounting.", category: "original", multiplier: 1.4, platformIds: ["crm", "legal", "finance", "background-check"], features: ["Case management", "Billable hours", "Trust accounting", "Document automation", "Court filing"], sortOrder: 6 },
      // Expanded
      { name: "Lawn Care", slug: "lawn-care", icon: "Trees", description: "Landscaping, lawn maintenance, irrigation. Route optimization + seasonal scheduling.", category: "expanded", multiplier: 1.0, platformIds: ["crm", "hr-recruitment", "finance"], features: ["Route optimization", "Seasonal scheduling", "Estimate builder", "Equipment tracking", "Crew management"], sortOrder: 7 },
      { name: "Barber Shops", slug: "barber-shops", icon: "Scissors", description: "Barbershops, men's grooming. Appointment booking + chair rental management.", category: "expanded", multiplier: 1.0, platformIds: ["crm", "finance", "hr-recruitment"], features: ["Chair rental management", "Appointment booking", "Walk-in queue", "Product inventory", "Tip tracking"], sortOrder: 8 },
      { name: "Restaurants", slug: "restaurants", icon: "UtensilsCrossed", description: "Restaurants, cafes, food service. POS integration + staff scheduling + inventory.", category: "expanded", multiplier: 1.1, platformIds: ["crm", "hr-recruitment", "finance"], features: ["POS integration", "Staff scheduling", "Inventory management", "Menu management", "Online ordering"], sortOrder: 9 },
      { name: "Salon & Stylists", slug: "salon", icon: "Sparkles", description: "Hair salons, nail salons, spas. Booking + stylist management + product sales.", category: "expanded", multiplier: 1.0, platformIds: ["crm", "finance", "hr-recruitment"], features: ["Online booking", "Stylist scheduling", "Product sales", "Loyalty program", "Client history"], sortOrder: 10 },
      { name: "Bakeries", slug: "bakeries", icon: "CakeSlice", description: "Bakeries, pastry shops, catering. Order management + recipe costing + production scheduling.", category: "expanded", multiplier: 1.0, platformIds: ["crm", "finance"], features: ["Custom order management", "Recipe costing", "Production scheduling", "Ingredient inventory", "Delivery routing"], sortOrder: 11 },
      { name: "Boutique & Clothing", slug: "boutique", icon: "Shirt", description: "Boutique clothing, retail stores. Inventory + POS + e-commerce integration.", category: "expanded", multiplier: 1.1, platformIds: ["crm", "finance"], features: ["Inventory management", "POS integration", "E-commerce sync", "Size/color tracking", "Supplier management"], sortOrder: 12 },
      { name: "E-Commerce", slug: "ecommerce", icon: "ShoppingCart", description: "Online stores, dropshipping, DTC brands. Shopify/WooCommerce + fulfillment + returns.", category: "expanded", multiplier: 1.1, platformIds: ["crm", "finance"], features: ["Shopify integration", "Order fulfillment", "Returns management", "Inventory sync", "Customer segmentation"], sortOrder: 13 },
      { name: "Phone Companies", slug: "phone-companies", icon: "Smartphone", description: "Mobile carriers, phone repair, telecom. Subscriber management + billing + support.", category: "expanded", multiplier: 1.2, platformIds: ["crm", "finance", "hr-recruitment"], features: ["Subscriber management", "Usage billing", "Device inventory", "Support ticketing", "Carrier integrations"], sortOrder: 14 },
      { name: "Construction & Builders", slug: "construction", icon: "HardHat", description: "General contractors, builders, developers. Project management + bidding + compliance.", category: "expanded", multiplier: 1.2, platformIds: ["crm", "hr-recruitment", "finance", "legal"], features: ["Project management", "Bid estimation", "Subcontractor management", "Permit tracking", "Safety compliance"], sortOrder: 15 },
      { name: "Marketing Firms", slug: "marketing", icon: "Megaphone", description: "Agencies, consultants, digital marketing. Client management + campaign tracking + reporting.", category: "expanded", multiplier: 1.1, platformIds: ["crm", "finance"], features: ["Client portal", "Campaign tracking", "Performance reporting", "Social media management", "Content calendar"], sortOrder: 16 },
      { name: "Mobile Mechanics", slug: "mobile-mechanics", icon: "Car", description: "Mobile auto repair, roadside service. Dispatch + parts inventory + mobile payments.", category: "expanded", multiplier: 1.0, platformIds: ["crm", "finance", "hr-recruitment"], features: ["Mobile dispatch", "Parts inventory", "Mobile payments", "Diagnostic tracking", "Vehicle history"], sortOrder: 17 },
      { name: "Trucking & Routes", slug: "trucking", icon: "Truck", description: "Trucking companies, delivery routes, logistics. Fleet management + DOT compliance.", category: "expanded", multiplier: 1.2, platformIds: ["crm", "hr-recruitment", "finance", "legal"], features: ["Fleet management", "DOT compliance", "Load matching", "Fuel tracking", "Driver logs"], sortOrder: 18 },
      { name: "Mental Health Clinics", slug: "mental-health", icon: "Brain", description: "Therapy practices, counseling, psychiatry. HIPAA + telehealth + insurance billing.", category: "expanded", multiplier: 1.5, platformIds: ["crm", "hr-recruitment", "finance"], features: ["Telehealth integration", "Insurance billing", "HIPAA compliance", "Session notes", "Client portal"], sortOrder: 19 },
      // Creative
      { name: "Photographers", slug: "photographers", icon: "Camera", description: "Photo studios, freelance photographers. Gallery delivery + automated editing workflows.", category: "creative", multiplier: 1.0, platformIds: ["crm", "finance"], features: ["Photo upload → auto workflow", "Gallery generation", "Client delivery portals", "Editing queue", "Print fulfillment"], sortOrder: 20 },
      { name: "Film & Video Editors", slug: "film-editors", icon: "Film", description: "Video production, post-production. Project management + asset organization + client review.", category: "creative", multiplier: 1.1, platformIds: ["crm", "finance"], features: ["Project timeline", "Asset organization", "Client review portal", "Delivery automation", "Revision tracking"], sortOrder: 21 },
      { name: "Authors & Book Writers", slug: "authors", icon: "BookOpen", description: "Authors, ghostwriters, publishers. AI-assisted writing + chapter outlining + publishing.", category: "creative", multiplier: 1.1, platformIds: ["crm", "finance"], features: ["Chapter outlining", "Character management", "AI writing assistant", "Manuscript formatting", "Publisher submission"], sortOrder: 22 },
    ];

    for (const ind of industries) {
      await ctx.db.insert("industries", { ...ind, isActive: true });
    }
    return "seeded_" + industries.length;
  },
});
