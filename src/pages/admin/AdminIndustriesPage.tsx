import { useApiQuery } from "@/lib/hooks";
import { api } from "@/lib/api";
import {
  Activity,
  Globe,
  Layers,
  Palette,
  Plus,
  Search,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  TrendingUp,
} from "lucide-react";
import { useState } from "react";
import type { Id } from "../../../convex/_generated/dataModel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";

const CATEGORY_META: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  original: { label: "Original", icon: <Globe className="size-3.5" />, color: "bg-blue-50 text-blue-700 border-blue-200" },
  expanded: { label: "Expanded", icon: <Layers className="size-3.5" />, color: "bg-amber-50 text-amber-700 border-amber-200" },
  creative: { label: "Creative", icon: <Palette className="size-3.5" />, color: "bg-purple-50 text-purple-700 border-purple-200" },
};

export function AdminIndustriesPage() {
  const industries = useApiQuery(() => api.industries.list(), []) ?? [];
  const stats = useApiQuery(() => api.industries.stats(), []);
  const platforms = useApiQuery(() => api.corePlatforms.list(), []) ?? [];
  const toggleActive = async (...args: any[]) => api.industries.toggleActive(...args);
  const updateMultiplier = async (...args: any[]) => api.industries.updateMultiplier(...args);
  const seedIndustries = async (...args: any[]) => api.industries.seed(...args);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [editingMultiplier, setEditingMultiplier] = useState<{
    id: Id<"industries">;
    name: string;
    multiplier: number;
  } | null>(null);

  const sorted = [...industries].sort((a, b) => a.sortOrder - b.sortOrder);
  const filtered = sorted.filter((i) => {
    const matchesSearch = i.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === "all" || i.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const getPlatformNames = (slugs: string[]) => {
    return slugs.map((slug) => {
      const p = platforms.find((pl) => pl.slug === slug);
      return p?.name?.replace(" Platform", "") ?? slug;
    });
  };

  const handleSeed = async () => {
    const result = await seedIndustries();
    if (result === "already_seeded") {
      toast.info("Industries already seeded");
    } else {
      toast.success("Industries seeded successfully");
    }
  };

  const handleToggle = async (id: Id<"industries">, name: string, currentlyActive: boolean) => {
    await toggleActive({ id });
    toast.success(`${name} ${currentlyActive ? "disabled" : "enabled"}`);
  };

  const handleMultiplierSave = async () => {
    if (!editingMultiplier) return;
    await updateMultiplier({
      id: editingMultiplier.id,
      multiplier: editingMultiplier.multiplier,
    });
    toast.success(`${editingMultiplier.name} multiplier updated to ${editingMultiplier.multiplier}x`);
    setEditingMultiplier(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Industry Verticals
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage industry verticals, pricing multipliers, and platform assignments.
          </p>
        </div>
        {industries.length === 0 && (
          <Button onClick={handleSeed} className="gap-2 bg-slate-900 hover:bg-slate-800">
            <Plus className="size-4" />
            Seed Industries
          </Button>
        )}
      </div>

      {/* Stats Row */}
      {stats && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="border-gray-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Verticals</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <div className="size-12 rounded-xl bg-slate-100 flex items-center justify-center">
                  <Globe className="size-6 text-slate-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-gray-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Active</p>
                  <p className="text-3xl font-bold text-emerald-600">{stats.active}</p>
                </div>
                <div className="size-12 rounded-xl bg-emerald-50 flex items-center justify-center">
                  <Activity className="size-6 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-gray-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Original / Expanded / Creative</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {stats.categories.original} / {stats.categories.expanded} / {stats.categories.creative}
                  </p>
                </div>
                <div className="size-12 rounded-xl bg-purple-50 flex items-center justify-center">
                  <Sparkles className="size-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-gray-200 bg-slate-900 text-white">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Avg Multiplier</p>
                  <p className="text-3xl font-bold">
                    {industries.length > 0
                      ? (industries.reduce((s, i) => s + i.multiplier, 0) / industries.length).toFixed(2)
                      : "—"}x
                  </p>
                </div>
                <div className="size-12 rounded-xl bg-slate-800 flex items-center justify-center">
                  <TrendingUp className="size-6 text-amber-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
          <Input
            placeholder="Search industries..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          {[
            { key: "all", label: "All" },
            { key: "original", label: "Original" },
            { key: "expanded", label: "Expanded" },
            { key: "creative", label: "Creative" },
          ].map((cat) => (
            <Button
              key={cat.key}
              variant={categoryFilter === cat.key ? "default" : "outline"}
              size="sm"
              onClick={() => setCategoryFilter(cat.key)}
              className={categoryFilter === cat.key ? "bg-slate-900" : ""}
            >
              {cat.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Industries Grid */}
      <div className="grid gap-3">
        {filtered.map((industry) => {
          const catMeta = CATEGORY_META[industry.category];
          return (
            <Card
              key={industry.id}
              className={`border transition-all ${
                industry.isActive ? "border-gray-200 bg-white" : "border-gray-100 bg-gray-50 opacity-60"
              }`}
            >
              <CardContent className="py-4 px-5">
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className={`size-12 shrink-0 rounded-xl flex items-center justify-center text-lg font-bold ${
                    industry.isActive ? "bg-slate-900 text-white" : "bg-gray-200 text-gray-500"
                  }`}>
                    {industry.name.charAt(0)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {industry.name}
                      </h3>
                      <Badge variant="outline" className={`text-[10px] ${catMeta?.color}`}>
                        {catMeta?.icon}
                        <span className="ml-1">{catMeta?.label}</span>
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-500 line-clamp-1 mb-2">
                      {industry.description}
                    </p>
                    {/* Platforms */}
                    <div className="flex flex-wrap gap-1.5">
                      {getPlatformNames(industry.platformIds).map((name) => (
                        <Badge key={name} variant="secondary" className="text-[10px] bg-gray-100 text-gray-600">
                          {name}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Multiplier + Actions */}
                  <div className="flex items-center gap-3 shrink-0">
                    {/* Multiplier Button */}
                    <button
                      onClick={() =>
                        setEditingMultiplier({
                          id: industry.id,
                          name: industry.name,
                          multiplier: industry.multiplier,
                        })
                      }
                      className="flex flex-col items-center px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 transition-colors border border-amber-200 cursor-pointer"
                    >
                      <span className="text-[10px] text-amber-600 font-medium uppercase tracking-wider">
                        Multiplier
                      </span>
                      <span className="text-lg font-bold text-amber-700">
                        {industry.multiplier}x
                      </span>
                    </button>

                    {/* Features Count */}
                    <div className="flex flex-col items-center px-3 py-1.5">
                      <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">
                        Features
                      </span>
                      <span className="text-lg font-bold text-gray-600">
                        {industry.features.length}
                      </span>
                    </div>

                    {/* Toggle */}
                    <button
                      onClick={() => handleToggle(industry.id, industry.name, industry.isActive)}
                      className="p-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                    >
                      {industry.isActive ? (
                        <ToggleRight className="size-6 text-emerald-600" />
                      ) : (
                        <ToggleLeft className="size-6 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filtered.length === 0 && industries.length > 0 && (
        <div className="text-center py-12 text-gray-400">
          No industries match your search.
        </div>
      )}

      {industries.length === 0 && (
        <div className="text-center py-16">
          <Globe className="size-12 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-700 mb-2">No Industries Yet</h3>
          <p className="text-gray-500 mb-4">Seed the 22 industry verticals to get started.</p>
          <Button onClick={handleSeed} className="bg-slate-900 hover:bg-slate-800">
            Seed 22 Industries
          </Button>
        </div>
      )}

      {/* Multiplier Edit Dialog */}
      <Dialog open={!!editingMultiplier} onOpenChange={() => setEditingMultiplier(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Pricing Multiplier</DialogTitle>
          </DialogHeader>
          {editingMultiplier && (
            <div className="space-y-6 pt-2">
              <div>
                <p className="text-sm text-gray-600 mb-1">
                  Industry: <span className="font-semibold text-gray-900">{editingMultiplier.name}</span>
                </p>
                <p className="text-xs text-gray-400">
                  This multiplier applies to all platform pricing for clients in this industry.
                </p>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Multiplier</Label>
                  <span className="text-2xl font-bold text-amber-600">
                    {editingMultiplier.multiplier.toFixed(1)}x
                  </span>
                </div>
                <Slider
                  value={[editingMultiplier.multiplier * 10]}
                  min={5}
                  max={30}
                  step={1}
                  onValueChange={([val]) =>
                    setEditingMultiplier((prev) =>
                      prev ? { ...prev, multiplier: val / 10 } : null
                    )
                  }
                />
                <div className="flex justify-between text-xs text-gray-400">
                  <span>0.5x</span>
                  <span>1.0x (base)</span>
                  <span>2.0x</span>
                  <span>3.0x</span>
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500 mb-2">Example pricing impact (CRM Pro at $1,000/mo base):</p>
                <p className="text-lg font-bold text-gray-900">
                  ${(1000 * editingMultiplier.multiplier).toLocaleString()}/mo
                </p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setEditingMultiplier(null)}>
                  Cancel
                </Button>
                <Button className="flex-1 bg-slate-900 hover:bg-slate-800" onClick={handleMultiplierSave}>
                  Save Multiplier
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
