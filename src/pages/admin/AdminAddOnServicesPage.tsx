import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import {
  Package, DollarSign, Users, TrendingUp,
  Shield, Mail, PenTool, Stamp, CheckCircle,
  ChevronDown, ChevronUp, ToggleLeft, ToggleRight,
} from "lucide-react";
import { useState } from "react";

/* ═══════════════════════════════════════════════════════════════════════
 * ADD-ON SERVICES PAGE — TRG Product Marketplace & Client Subscriptions
 *
 * Shows all TRG-owned products available as add-ons for AI Staffing
 * clients, with pricing, subscription tracking, and revenue analytics.
 * ═══════════════════════════════════════════════════════════════════════ */

const ICON_MAP: Record<string, typeof Package> = {
  users: Users, "dollar-sign": DollarSign, mail: Mail,
  "shield-check": Shield, "pen-tool": PenTool, stamp: Stamp,
};

const TIER_COLORS: Record<string, string> = {
  starter: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  pro: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  enterprise: "bg-purple-500/15 text-purple-400 border-purple-500/30",
};

const STATUS_COLORS: Record<string, string> = {
  active: "bg-emerald-500/15 text-emerald-400",
  trial: "bg-blue-500/15 text-blue-400",
  paused: "bg-amber-500/15 text-amber-400",
  cancelled: "bg-red-500/15 text-red-400",
};

export default function AdminAddOnServicesPage() {
  const services = useQuery(api.addOnServices.listAll);
  const subscriptions = useQuery(api.addOnServices.listSubscriptions);
  const stats = useQuery(api.addOnServices.getSubscriptionStats);
  const [activeTab, setActiveTab] = useState<"marketplace" | "subscriptions" | "revenue">("marketplace");
  const [expandedService, setExpandedService] = useState<string | null>(null);

  if (!services || !subscriptions || !stats) {
    return (
      <div className="min-h-screen bg-[#0B0F1A] flex items-center justify-center">
        <div className="text-gray-400 text-lg">Loading add-on services...</div>
      </div>
    );
  }

  const tabs = [
    { id: "marketplace" as const, label: "Service Marketplace", icon: Package },
    { id: "subscriptions" as const, label: "Client Subscriptions", icon: Users },
    { id: "revenue" as const, label: "Add-On Revenue", icon: TrendingUp },
  ];

  return (
    <div className="min-h-screen bg-[#0B0F1A] text-gray-100 p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Add-On Services</h1>
        <p className="text-gray-400 mt-1">TRG product integrations available for AI Staffing clients</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard label="Available Services" value={stats.totalServices} sub={`${stats.activeServices} active`} color="blue" />
        <KPICard label="Active Subscriptions" value={stats.totalSubscriptions} sub={`${stats.trialCount} trials`} color="emerald" />
        <KPICard label="Add-On MRR" value={`$${stats.totalMRR.toLocaleString()}`} sub="monthly recurring" color="amber" />
        <KPICard label="Avg per Client" value={stats.totalSubscriptions > 0 ? `$${Math.round(stats.totalMRR / new Set(subscriptions.filter(s => s.status === "active").map(s => s.orgId)).size).toLocaleString()}` : "$0"} sub="per active client" color="purple" />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-[#141B2D] rounded-lg p-1 w-fit">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.id ? "bg-amber-500/20 text-amber-400" : "text-gray-400 hover:text-gray-200"
            }`}>
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "marketplace" && (
        <div className="space-y-4">
          {/* Core Services */}
          <SectionHeader title="Core Services" sub="Available to all clients" />
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {services.filter(s => s.category === "core").map(service => (
              <ServiceCard key={service._id} service={service}
                subscriptions={subscriptions.filter(s => s.serviceSlug === service.slug && s.status === "active")}
                expanded={expandedService === service.slug}
                onToggle={() => setExpandedService(expandedService === service.slug ? null : service.slug)} />
            ))}
          </div>
        </div>
      )}

      {activeTab === "subscriptions" && (
        <div className="space-y-4">
          {/* Group by client */}
          {Object.entries(
            subscriptions
              .filter(s => s.status === "active")
              .reduce((acc, sub) => {
                if (!acc[sub.orgId]) acc[sub.orgId] = { name: sub.orgName, subs: [] };
                acc[sub.orgId].subs.push(sub);
                return acc;
              }, {} as Record<string, { name: string; subs: typeof subscriptions }>)
          )
            .sort((a, b) => b[1].subs.reduce((s, x) => s + x.monthlyPrice, 0) - a[1].subs.reduce((s, x) => s + x.monthlyPrice, 0))
            .map(([orgId, { name, subs }]) => (
              <div key={orgId} className="bg-[#141B2D] border border-[#1E293B] rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold">{name}</h3>
                    <p className="text-sm text-gray-400">{subs.length} active add-on{subs.length !== 1 ? "s" : ""}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-amber-400 font-mono">
                      ${subs.reduce((s, x) => s + x.monthlyPrice, 0).toLocaleString()}/mo
                    </div>
                    <p className="text-xs text-gray-500">add-on spend</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {subs.map(sub => (
                    <div key={sub._id} className="bg-[#0B0F1A] border border-[#1E293B] rounded-lg p-3 flex items-center justify-between">
                      <div>
                        <div className="text-sm font-semibold">{sub.serviceName}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-xs px-2 py-0.5 rounded-full border ${TIER_COLORS[sub.tier]}`}>
                            {sub.tier}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[sub.status]}`}>
                            {sub.status}
                          </span>
                        </div>
                      </div>
                      <div className="text-sm font-mono text-emerald-400">${sub.monthlyPrice}/mo</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
        </div>
      )}

      {activeTab === "revenue" && (
        <div className="space-y-4">
          {/* Revenue by Service */}
          <SectionHeader title="Revenue by Service" sub="Monthly recurring revenue breakdown" />
          <div className="bg-[#141B2D] border border-[#1E293B] rounded-xl p-5">
            <div className="space-y-3">
              {Object.entries(stats.byService)
                .sort((a, b) => b[1].mrr - a[1].mrr)
                .map(([slug, data]) => {
                  const pct = stats.totalMRR > 0 ? (data.mrr / stats.totalMRR * 100) : 0;
                  return (
                    <div key={slug} className="flex items-center gap-4">
                      <div className="w-40 text-sm font-medium truncate">{data.name}</div>
                      <div className="flex-1 bg-[#0B0F1A] rounded-full h-6 relative overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-amber-500/30 to-amber-500/60 rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }} />
                        <span className="absolute inset-0 flex items-center justify-center text-xs font-mono text-gray-300">
                          {pct.toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-20 text-right text-sm font-mono text-emerald-400">${data.mrr.toLocaleString()}</div>
                      <div className="w-16 text-right text-xs text-gray-400">{data.count} subs</div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Revenue by Tier */}
          <SectionHeader title="Tier Distribution" sub="Subscription tier breakdown" />
          <div className="grid grid-cols-3 gap-4">
            {["starter", "pro", "enterprise"].map(tier => {
              const count = stats.byTier[tier] ?? 0;
              const totalActive = stats.totalSubscriptions || 1;
              return (
                <div key={tier} className="bg-[#141B2D] border border-[#1E293B] rounded-xl p-5 text-center">
                  <div className={`inline-block px-3 py-1 rounded-full border text-sm font-medium mb-3 ${TIER_COLORS[tier]}`}>
                    {tier.charAt(0).toUpperCase() + tier.slice(1)}
                  </div>
                  <div className="text-3xl font-bold font-mono">{count}</div>
                  <div className="text-sm text-gray-400 mt-1">{((count / totalActive) * 100).toFixed(0)}% of subscriptions</div>
                </div>
              );
            })}
          </div>

          {/* Projected Annual */}
          <div className="bg-gradient-to-r from-amber-500/10 to-emerald-500/10 border border-amber-500/20 rounded-xl p-6 text-center">
            <div className="text-sm text-amber-400 font-mono uppercase tracking-wider mb-2">Projected Annual Add-On Revenue</div>
            <div className="text-4xl font-bold font-mono text-emerald-400">${(stats.totalMRR * 12).toLocaleString()}</div>
            <div className="text-sm text-gray-400 mt-2">Based on ${stats.totalMRR.toLocaleString()}/mo MRR from {stats.totalSubscriptions} active subscriptions</div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Components ───

function KPICard({ label, value, sub, color }: { label: string; value: string | number; sub: string; color: string }) {
  const colorMap: Record<string, string> = {
    blue: "text-blue-400", emerald: "text-emerald-400", amber: "text-amber-400", purple: "text-purple-400",
  };
  return (
    <div className="bg-[#141B2D] border border-[#1E293B] rounded-xl p-5">
      <div className="text-xs text-gray-400 font-mono uppercase tracking-wider">{label}</div>
      <div className={`text-2xl font-bold font-mono mt-1 ${colorMap[color]}`}>{value}</div>
      <div className="text-xs text-gray-500 mt-1">{sub}</div>
    </div>
  );
}

function SectionHeader({ title, sub }: { title: string; sub: string }) {
  return (
    <div>
      <h2 className="text-lg font-bold">{title}</h2>
      <p className="text-sm text-gray-400">{sub}</p>
    </div>
  );
}

function ServiceCard({ service, subscriptions, expanded, onToggle }: {
  service: any; subscriptions: any[]; expanded: boolean; onToggle: () => void;
}) {
  const IconComponent = ICON_MAP[service.icon] || Package;

  return (
    <div className={`bg-[#141B2D] border rounded-xl overflow-hidden transition-all ${
      service.isActive ? "border-[#1E293B]" : "border-red-500/20 opacity-60"
    }`}>
      {/* Header */}
      <div className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/15 flex items-center justify-center">
              <IconComponent className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="font-bold text-base">{service.name}</h3>
              <span className={`text-xs px-2 py-0.5 rounded-full ${service.isActive ? "bg-emerald-500/15 text-emerald-400" : "bg-red-500/15 text-red-400"}`}>
                {service.isActive ? "Active" : "Disabled"}
              </span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm font-mono text-emerald-400">{subscriptions.length}</div>
            <div className="text-xs text-gray-500">clients</div>
          </div>
        </div>
        <p className="text-sm text-gray-400 mt-3 line-clamp-2">{service.description}</p>

        {/* Pricing */}
        <div className="flex gap-2 mt-4">
          {service.pricingStarter != null && (
            <div className="flex-1 bg-[#0B0F1A] rounded-lg p-2 text-center">
              <div className="text-xs text-gray-500">Starter</div>
              <div className="text-sm font-mono font-bold text-blue-400">${service.pricingStarter}</div>
            </div>
          )}
          {service.pricingPro != null && (
            <div className="flex-1 bg-[#0B0F1A] rounded-lg p-2 text-center border border-amber-500/20">
              <div className="text-xs text-amber-400">Pro</div>
              <div className="text-sm font-mono font-bold text-amber-400">${service.pricingPro}</div>
            </div>
          )}
          {service.pricingEnterprise != null && (
            <div className="flex-1 bg-[#0B0F1A] rounded-lg p-2 text-center">
              <div className="text-xs text-gray-500">Enterprise</div>
              <div className="text-sm font-mono font-bold text-purple-400">${service.pricingEnterprise}</div>
            </div>
          )}
        </div>
      </div>

      {/* Expand toggle */}
      <button onClick={onToggle}
        className="w-full flex items-center justify-center gap-1 py-2 text-xs text-gray-400 hover:text-gray-200 border-t border-[#1E293B] transition-colors">
        {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        {expanded ? "Hide features" : "Show features"}
      </button>

      {/* Features */}
      {expanded && (
        <div className="px-5 pb-5 space-y-1.5">
          {service.features.map((f: string, i: number) => (
            <div key={i} className="flex items-center gap-2 text-sm text-gray-300">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
              {f}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
