import { useApiQuery } from "@/lib/hooks";
import { api } from "@/lib/api";
import {
  Bot,
  Check,
  DollarSign,
  Edit,
  Layers,
  ToggleLeft,
  ToggleRight,
  Zap,
} from "lucide-react";
import { useState } from "react";
import type { Id } from "../../../convex/_generated/dataModel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

function formatPrice(cents: number) {
  return `$${(cents / 100).toLocaleString()}`;
}

export function AdminPlatformsPage() {
  const platforms = useApiQuery(() => api.corePlatforms.list(), []) ?? [];
  const stats = useApiQuery(() => api.corePlatforms.stats(), []);
  const toggleActive = async (...args: any[]) => (api.corePlatforms.toggleActive as any)(...args);
  const updatePricing = async (...args: any[]) => (api.corePlatforms.updatePricing as any)(...args);
  const seedPlatforms = async (...args: any[]) => (api.corePlatforms.seed as any)(...args);

  const [editingPricing, setEditingPricing] = useState<{
    id: Id<"corePlatforms">;
    name: string;
    starterPriceCents: number;
    proPriceCents: number;
    enterprisePriceCents: number;
  } | null>(null);

  const handleSeed = async () => {
    const result = await seedPlatforms();
    if (result === "already_seeded") {
      toast.info("Platforms already seeded");
    } else {
      toast.success("6 core platforms seeded");
    }
  };

  const handleToggle = async (id: Id<"corePlatforms">, name: string, active: boolean) => {
    await toggleActive({ id });
    toast.success(`${name} ${active ? "disabled" : "enabled"}`);
  };

  const handlePricingSave = async () => {
    if (!editingPricing) return;
    await updatePricing({
      id: editingPricing.id,
      starterPriceCents: editingPricing.starterPriceCents,
      proPriceCents: editingPricing.proPriceCents,
      enterprisePriceCents: editingPricing.enterprisePriceCents,
    });
    toast.success(`${editingPricing.name} pricing updated`);
    setEditingPricing(null);
  };

  const PLATFORM_COLORS: Record<string, string> = {
    crm: "from-blue-600 to-blue-800",
    "hr-recruitment": "from-emerald-600 to-emerald-800",
    finance: "from-amber-600 to-amber-800",
    legal: "from-purple-600 to-purple-800",
    "background-check": "from-red-600 to-red-800",
    "ai-workforce": "from-slate-700 to-slate-900",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Core Platforms
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage the 6 standalone platforms, features, AI agents, and pricing tiers.
          </p>
        </div>
        {platforms.length === 0 && (
          <Button onClick={handleSeed} className="gap-2 bg-slate-900 hover:bg-slate-800">
            Seed 6 Platforms
          </Button>
        )}
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid gap-4 sm:grid-cols-4">
          <Card className="border-gray-200 bg-slate-900 text-white">
            <CardContent className="pt-6">
              <p className="text-sm text-slate-400">Platforms</p>
              <p className="text-3xl font-bold">{stats.total}</p>
            </CardContent>
          </Card>
          <Card className="border-gray-200">
            <CardContent className="pt-6">
              <p className="text-sm text-gray-500">Active</p>
              <p className="text-3xl font-bold text-emerald-600">{stats.active}</p>
            </CardContent>
          </Card>
          <Card className="border-gray-200">
            <CardContent className="pt-6">
              <p className="text-sm text-gray-500">Total Features</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalFeatures}</p>
            </CardContent>
          </Card>
          <Card className="border-gray-200">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Bot className="size-5 text-purple-600" />
                <p className="text-sm text-gray-500">AI Agents</p>
              </div>
              <p className="text-3xl font-bold text-purple-600">{stats.totalAgents}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Platform Cards */}
      <div className="grid gap-4 lg:grid-cols-2">
        {platforms.map((platform) => (
          <Card
            key={platform.id}
            className={`border overflow-hidden transition-all ${
              platform.isActive ? "border-gray-200" : "border-gray-100 opacity-60"
            }`}
          >
            {/* Color Header */}
            <div className={`bg-gradient-to-r ${PLATFORM_COLORS[platform.slug] ?? "from-gray-600 to-gray-800"} px-5 py-4`}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white">{platform.name}</h3>
                  {platform.evolvesFrom && (
                    <p className="text-xs text-white/60 mt-0.5">
                      Evolves from {platform.evolvesFrom}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      setEditingPricing({
                        id: platform.id,
                        name: platform.name,
                        starterPriceCents: platform.starterPriceCents,
                        proPriceCents: platform.proPriceCents,
                        enterprisePriceCents: platform.enterprisePriceCents,
                      })
                    }
                    className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
                  >
                    <Edit className="size-4 text-white" />
                  </button>
                  <button
                    onClick={() => handleToggle(platform.id, platform.name, platform.isActive)}
                    className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
                  >
                    {platform.isActive ? (
                      <ToggleRight className="size-5 text-emerald-300" />
                    ) : (
                      <ToggleLeft className="size-5 text-white/50" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <CardContent className="p-5 space-y-4">
              <p className="text-sm text-gray-600">{platform.description}</p>

              {/* Pricing Tiers */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: "Starter", price: platform.starterPriceCents },
                  { label: "Pro", price: platform.proPriceCents },
                  { label: "Enterprise", price: platform.enterprisePriceCents },
                ].map((tier) => (
                  <div key={tier.label} className="text-center p-2 rounded-lg bg-gray-50">
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider">{tier.label}</p>
                    <p className="text-sm font-bold text-gray-900">{formatPrice(tier.price)}/mo</p>
                  </div>
                ))}
              </div>

              {/* Features */}
              <div>
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                  <Zap className="size-3" /> Features ({platform.features.length})
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {platform.features.slice(0, 6).map((f) => (
                    <Badge key={f} variant="secondary" className="text-[10px] bg-gray-100 text-gray-600">
                      <Check className="size-2.5 mr-1" />
                      {f}
                    </Badge>
                  ))}
                  {platform.features.length > 6 && (
                    <Badge variant="secondary" className="text-[10px] bg-gray-100 text-gray-500">
                      +{platform.features.length - 6} more
                    </Badge>
                  )}
                </div>
              </div>

              {/* AI Agents */}
              <div>
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                  <Bot className="size-3" /> AI Agents ({platform.aiAgents.length})
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {platform.aiAgents.map((a) => (
                    <Badge key={a} variant="outline" className="text-[10px] border-purple-200 text-purple-700 bg-purple-50">
                      <Bot className="size-2.5 mr-1" />
                      {a}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {platforms.length === 0 && (
        <div className="text-center py-16">
          <Layers className="size-12 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-700 mb-2">No Platforms Yet</h3>
          <p className="text-gray-500 mb-4">Seed the 6 core platforms to get started.</p>
          <Button onClick={handleSeed} className="bg-slate-900 hover:bg-slate-800">
            Seed 6 Core Platforms
          </Button>
        </div>
      )}

      {/* Pricing Edit Dialog */}
      <Dialog open={!!editingPricing} onOpenChange={() => setEditingPricing(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <DollarSign className="size-5" />
              Edit Pricing — {editingPricing?.name}
            </DialogTitle>
          </DialogHeader>
          {editingPricing && (
            <div className="space-y-4 pt-2">
              <p className="text-xs text-gray-400">
                Base monthly prices before industry multiplier. All prices in USD.
              </p>
              {[
                { label: "Starter", key: "starterPriceCents" as const },
                { label: "Professional", key: "proPriceCents" as const },
                { label: "Enterprise", key: "enterprisePriceCents" as const },
              ].map((tier) => (
                <div key={tier.key} className="space-y-1">
                  <Label className="text-sm">{tier.label} Tier ($/month)</Label>
                  <Input
                    type="number"
                    value={editingPricing[tier.key] / 100}
                    onChange={(e) =>
                      setEditingPricing((prev) =>
                        prev
                          ? { ...prev, [tier.key]: Math.round(Number(e.target.value) * 100) }
                          : null
                      )
                    }
                  />
                </div>
              ))}
              <div className="flex gap-3 pt-2">
                <Button variant="outline" className="flex-1" onClick={() => setEditingPricing(null)}>
                  Cancel
                </Button>
                <Button className="flex-1 bg-slate-900 hover:bg-slate-800" onClick={handlePricingSave}>
                  Save Pricing
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
