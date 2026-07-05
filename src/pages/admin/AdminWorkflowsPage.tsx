import { useApiQuery } from "@/lib/hooks";
import { api } from "@/lib/api";
import {
  Bot,
  ChevronDown,
  ChevronRight,
  Clock,
  GitBranch,
  Globe,
  Play,
  Plus,
  ToggleLeft,
  ToggleRight,
  UserCheck,
  Webhook,
  Zap,
} from "lucide-react";
import { useState } from "react";
import type { Id } from "../../../convex/_generated/dataModel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

const STEP_TYPE_META: Record<string, { icon: React.ReactNode; color: string }> = {
  action: { icon: <Zap className="size-3" />, color: "bg-blue-50 text-blue-700 border-blue-200" },
  condition: { icon: <GitBranch className="size-3" />, color: "bg-amber-50 text-amber-700 border-amber-200" },
  delay: { icon: <Clock className="size-3" />, color: "bg-gray-50 text-gray-600 border-gray-200" },
  human_review: { icon: <UserCheck className="size-3" />, color: "bg-red-50 text-red-700 border-red-200" },
  api_call: { icon: <Webhook className="size-3" />, color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  ai_agent: { icon: <Bot className="size-3" />, color: "bg-purple-50 text-purple-700 border-purple-200" },
};

const TRIGGER_META: Record<string, { icon: React.ReactNode; label: string }> = {
  manual: { icon: <Play className="size-3" />, label: "Manual" },
  event: { icon: <Zap className="size-3" />, label: "Event" },
  schedule: { icon: <Clock className="size-3" />, label: "Scheduled" },
  api: { icon: <Webhook className="size-3" />, label: "API" },
};

export function AdminWorkflowsPage() {
  const workflows = useApiQuery(() => api.workflows.list(), []) ?? [];
  const stats = useApiQuery(() => api.workflows.stats(), []);
  const industries = useApiQuery(() => api.industries.list(), []) ?? [];
  const toggleActive = async (...args: any[]) => api.workflows.toggleActive(...args);
  const seedWorkflows = async (...args: any[]) => api.workflows.seed(...args);

  const [expandedId, setExpandedId] = useState<Id<"workflowTemplates"> | null>(null);
  const [filterIndustry, setFilterIndustry] = useState<string>("all");

  const filtered = workflows.filter((w) => {
    if (filterIndustry === "all") return true;
    if (filterIndustry === "universal") return !w.industrySlug;
    return w.industrySlug === filterIndustry;
  });

  const getIndustryName = (slug: string | undefined) => {
    if (!slug) return "Universal";
    const ind = industries.find((i) => i.slug === slug);
    return ind?.name ?? slug;
  };

  const handleSeed = async () => {
    const result = await seedWorkflows();
    if (result === "already_seeded") {
      toast.info("Workflows already seeded");
    } else {
      toast.success("Workflow templates seeded");
    }
  };

  const handleToggle = async (id: Id<"workflowTemplates">, name: string, active: boolean) => {
    await toggleActive({ id });
    toast.success(`${name} ${active ? "disabled" : "enabled"}`);
  };

  const usedIndustries = [...new Set(workflows.map((w) => w.industrySlug).filter(Boolean))] as string[];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Workflow Templates
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Automation workflows built into each platform. These templates are available as starters for clients.
          </p>
        </div>
        {workflows.length === 0 && (
          <Button onClick={handleSeed} className="gap-2 bg-slate-900 hover:bg-slate-800">
            <Plus className="size-4" />
            Seed Templates
          </Button>
        )}
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="border-gray-200 bg-slate-900 text-white">
            <CardContent className="pt-6">
              <p className="text-sm text-slate-400">Total Workflows</p>
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
              <p className="text-sm text-gray-500">Platforms Covered</p>
              <p className="text-3xl font-bold text-gray-900">
                {Object.keys(stats.byPlatform).length}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={filterIndustry === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilterIndustry("all")}
          className={filterIndustry === "all" ? "bg-slate-900" : ""}
        >
          All
        </Button>
        <Button
          variant={filterIndustry === "universal" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilterIndustry("universal")}
          className={filterIndustry === "universal" ? "bg-slate-900" : ""}
        >
          <Globe className="size-3 mr-1" /> Universal
        </Button>
        {usedIndustries.map((slug) => (
          <Button
            key={slug}
            variant={filterIndustry === slug ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterIndustry(slug)}
            className={filterIndustry === slug ? "bg-slate-900" : ""}
          >
            {getIndustryName(slug)}
          </Button>
        ))}
      </div>

      {/* Workflow Cards */}
      <div className="space-y-3">
        {filtered.map((wf) => {
          const isExpanded = expandedId === wf.id;
          const triggerMeta = TRIGGER_META[wf.triggerType];
          return (
            <Card
              key={wf.id}
              className={`border transition-all ${
                wf.isActive ? "border-gray-200" : "border-gray-100 opacity-60"
              }`}
            >
              <CardContent className="p-0">
                {/* Header Row */}
                <button
                  className="w-full flex items-center gap-4 px-5 py-4 text-left cursor-pointer hover:bg-gray-50/50 transition-colors"
                  onClick={() => setExpandedId(isExpanded ? null : wf.id)}
                >
                  <div className="size-10 shrink-0 rounded-xl bg-slate-900 flex items-center justify-center">
                    <Zap className="size-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="font-semibold text-gray-900 truncate">{wf.name}</h3>
                      <Badge variant="outline" className="text-[10px]">
                        {triggerMeta?.icon}
                        <span className="ml-1">{triggerMeta?.label}</span>
                      </Badge>
                      <Badge variant="secondary" className="text-[10px]">
                        {getIndustryName(wf.industrySlug ?? undefined)}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-500 truncate">{wf.description}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-sm text-gray-400">{wf.steps.length} steps</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggle(wf.id, wf.name, wf.isActive);
                      }}
                      className="p-1 cursor-pointer"
                    >
                      {wf.isActive ? (
                        <ToggleRight className="size-5 text-emerald-600" />
                      ) : (
                        <ToggleLeft className="size-5 text-gray-400" />
                      )}
                    </button>
                    {isExpanded ? (
                      <ChevronDown className="size-4 text-gray-400" />
                    ) : (
                      <ChevronRight className="size-4 text-gray-400" />
                    )}
                  </div>
                </button>

                {/* Expanded Steps */}
                {isExpanded && (
                  <div className="border-t border-gray-100 px-5 py-4 bg-gray-50/50">
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-3">
                      Trigger: {wf.triggerDescription}
                    </p>
                    <div className="space-y-0">
                      {wf.steps.map((step, idx) => {
                        const meta = STEP_TYPE_META[step.type];
                        return (
                          <div key={step.order} className="flex items-start gap-3">
                            {/* Connector Line */}
                            <div className="flex flex-col items-center">
                              <div className={`size-8 rounded-lg flex items-center justify-center border ${meta?.color ?? "bg-gray-50 text-gray-600 border-gray-200"}`}>
                                {meta?.icon ?? <Zap className="size-3" />}
                              </div>
                              {idx < wf.steps.length - 1 && (
                                <div className="w-px h-6 bg-gray-200" />
                              )}
                            </div>
                            <div className="pb-6">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-mono text-gray-400">{step.order}.</span>
                                <span className="text-sm font-medium text-gray-900">{step.name}</span>
                                <Badge variant="outline" className={`text-[9px] ${meta?.color}`}>
                                  {step.type.replace("_", " ")}
                                </Badge>
                              </div>
                              <p className="text-xs text-gray-500 mt-0.5 ml-5">{step.description}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filtered.length === 0 && workflows.length > 0 && (
        <div className="text-center py-12 text-gray-400">
          No workflows match the selected filter.
        </div>
      )}

      {workflows.length === 0 && (
        <div className="text-center py-16">
          <Zap className="size-12 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-700 mb-2">No Workflow Templates Yet</h3>
          <p className="text-gray-500 mb-4">Seed starter workflow templates for key industries.</p>
          <Button onClick={handleSeed} className="bg-slate-900 hover:bg-slate-800">
            Seed Workflow Templates
          </Button>
        </div>
      )}
    </div>
  );
}
