import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useState, useMemo } from "react";
import {
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  Bot,
  CheckCircle2,
  Clock,
  Cpu,
  Eye,
  Gauge,
  Globe,
  Layers,
  RefreshCw,
  TrendingUp,
  Zap,
  AlertTriangle,
  Shield,
  Target,
  Timer,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

/* ═══════════════════════════════════════════════════════════════
 * SIMULATED OPERATIONAL DATA
 * In production these would come from real workflow execution logs.
 * For demo purposes we generate realistic metrics from actual DB data.
 * ═══════════════════════════════════════════════════════════════ */

interface WorkflowExecution {
  clientName: string;
  workflowName: string;
  industry: string;
  status: "running" | "completed" | "warning" | "error";
  tasksCompleted: number;
  totalTasks: number;
  avgResponseTime: string;
  automationRate: number;
  lastRun: string;
  runsToday: number;
  runsWeek: number;
  uptime: number;
  costSaved: number;
}

function generateExecutionData(sessions: any[], workflows: any[]): WorkflowExecution[] {
  if (!sessions?.length || !workflows?.length) return [];

  const industryLabels: Record<string, string> = {
    "car-dealership": "Car Dealership",
    "salon": "Salon & Beauty",
    "car-wash": "Car Wash",
    "construction": "Construction",
    "insurance": "Insurance",
    "mortgage": "Mortgage",
    "bhph": "Buy Here Pay Here",
    "healthcare": "Healthcare",
    "ice-cream": "Ice Cream",
    "trucking": "Trucking",
  };

  const industryMetrics: Record<string, { avgResponse: string; automationRate: number; runsDay: number; runsWeek: number; costSaved: number }> = {
    "car-dealership": { avgResponse: "0.8s", automationRate: 94, runsDay: 47, runsWeek: 312, costSaved: 4200 },
    "salon": { avgResponse: "1.2s", automationRate: 91, runsDay: 34, runsWeek: 238, costSaved: 2800 },
    "car-wash": { avgResponse: "0.6s", automationRate: 96, runsDay: 89, runsWeek: 623, costSaved: 1950 },
    "construction": { avgResponse: "2.1s", automationRate: 87, runsDay: 18, runsWeek: 126, costSaved: 6100 },
    "insurance": { avgResponse: "1.5s", automationRate: 92, runsDay: 56, runsWeek: 392, costSaved: 5300 },
    "mortgage": { avgResponse: "1.8s", automationRate: 89, runsDay: 28, runsWeek: 196, costSaved: 4700 },
    "bhph": { avgResponse: "0.9s", automationRate: 93, runsDay: 62, runsWeek: 434, costSaved: 3600 },
    "healthcare": { avgResponse: "1.1s", automationRate: 90, runsDay: 73, runsWeek: 511, costSaved: 7200 },
    "ice-cream": { avgResponse: "0.5s", automationRate: 97, runsDay: 41, runsWeek: 287, costSaved: 1200 },
    "trucking": { avgResponse: "1.4s", automationRate: 91, runsDay: 52, runsWeek: 364, costSaved: 5800 },
  };

  return sessions
    .filter((s: any) => s.status === "deployed" && s.detectedIndustry)
    .map((s: any) => {
      const ind = s.detectedIndustry || "general";
      const metrics = industryMetrics[ind] || { avgResponse: "1.0s", automationRate: 88, runsDay: 30, runsWeek: 210, costSaved: 2500 };
      const wf = s.generatedWorkflowPreview;
      const totalSteps = wf?.steps?.length || 8;
      const completedSteps = totalSteps; // deployed = all steps active
      const statuses: ("running" | "completed" | "warning")[] = ["running", "running", "completed", "running", "running", "running", "completed", "running", "running", "running"];
      const idx = sessions.filter((x: any) => x.status === "deployed").indexOf(s);

      return {
        clientName: s.clientName,
        workflowName: wf?.name || `${s.clientName} Workflow`,
        industry: industryLabels[ind] || ind,
        status: statuses[idx % statuses.length],
        tasksCompleted: completedSteps,
        totalTasks: totalSteps,
        avgResponseTime: metrics.avgResponse,
        automationRate: metrics.automationRate,
        lastRun: getRelativeTime(idx),
        runsToday: metrics.runsDay,
        runsWeek: metrics.runsWeek,
        uptime: 99.2 + (idx * 0.08) % 0.8,
        costSaved: metrics.costSaved,
      };
    });
}

function getRelativeTime(idx: number): string {
  const times = ["2 min ago", "5 min ago", "12 min ago", "18 min ago", "24 min ago", "31 min ago", "45 min ago", "1 hr ago", "1.5 hrs ago", "2 hrs ago"];
  return times[idx % times.length];
}

/* ═══════════════════════════════════════════════════════ */

function StatCard({ title, value, subtitle, icon: Icon, trend, trendUp, color }: {
  title: string; value: string | number; subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  trend?: string; trendUp?: boolean; color: string;
}) {
  const colorMap: Record<string, string> = {
    blue: "bg-blue-500/10 text-blue-600",
    green: "bg-emerald-500/10 text-emerald-600",
    amber: "bg-amber-500/10 text-amber-600",
    purple: "bg-purple-500/10 text-purple-600",
    red: "bg-red-500/10 text-red-600",
    cyan: "bg-cyan-500/10 text-cyan-600",
    slate: "bg-slate-800 text-white",
  };

  return (
    <Card className="border-gray-200 hover:shadow-md transition-shadow">
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{title}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
            <div className="flex items-center gap-1.5 mt-1">
              {trend && (
                <span className={cn("text-xs font-medium flex items-center gap-0.5", trendUp ? "text-emerald-600" : "text-red-500")}>
                  {trendUp ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}
                  {trend}
                </span>
              )}
              <span className="text-xs text-muted-foreground">{subtitle}</span>
            </div>
          </div>
          <div className={cn("size-11 rounded-xl flex items-center justify-center", colorMap[color])}>
            <Icon className="size-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; className: string }> = {
    running: { label: "Running", className: "bg-emerald-100 text-emerald-700 border-emerald-200" },
    completed: { label: "Completed", className: "bg-blue-100 text-blue-700 border-blue-200" },
    warning: { label: "Warning", className: "bg-amber-100 text-amber-700 border-amber-200" },
    error: { label: "Error", className: "bg-red-100 text-red-700 border-red-200" },
  };
  const c = config[status] || config.running;
  return (
    <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border", c.className)}>
      {status === "running" && <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />}
      {status === "warning" && <AlertTriangle className="size-3" />}
      {c.label}
    </span>
  );
}

function MiniBar({ value, max = 100 }: { value: number; max?: number }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
      <div
        className={cn("h-full rounded-full transition-all", pct >= 95 ? "bg-emerald-500" : pct >= 85 ? "bg-blue-500" : pct >= 70 ? "bg-amber-500" : "bg-red-500")}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

/* ═══════════════════════ CLIENT DETAIL MODAL ═══════════════════════ */

function ClientDetailPanel({ exec, onClose }: { exec: WorkflowExecution; onClose: () => void }) {
  // Find matching session for workflow details
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] overflow-y-auto mx-4" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">{exec.clientName}</h2>
              <p className="text-slate-300 text-sm mt-1">{exec.industry} · {exec.workflowName}</p>
            </div>
            <StatusBadge status={exec.status} />
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-6 border-b">
          <div className="text-center">
            <p className="text-2xl font-bold text-emerald-600">{exec.automationRate}%</p>
            <p className="text-xs text-muted-foreground">Automation Rate</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">{exec.avgResponseTime}</p>
            <p className="text-xs text-muted-foreground">Avg Response</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600">{exec.uptime.toFixed(1)}%</p>
            <p className="text-xs text-muted-foreground">Uptime</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-amber-600">${exec.costSaved.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Monthly Savings</p>
          </div>
        </div>

        {/* Workflow Steps */}
        <div className="p-6">
          <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-4">Active Workflow Steps</h3>
          <div className="space-y-3">
            {Array.from({ length: exec.totalTasks }, (_, i) => {
              const stepStatuses = ["active", "active", "active", "active", "processing", "active", "idle", "active"];
              const stepStatus = stepStatuses[i % stepStatuses.length];
              const stepTypes = ["ai_agent", "action", "api_call", "condition", "ai_agent", "action", "delay", "ai_agent"];
              const stepType = stepTypes[i % stepTypes.length];
              return (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 border">
                  <div className={cn(
                    "size-8 rounded-lg flex items-center justify-center text-xs font-bold text-white",
                    stepStatus === "active" ? "bg-emerald-500" : stepStatus === "processing" ? "bg-blue-500 animate-pulse" : "bg-gray-400"
                  )}>
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">Step {i + 1}</p>
                    <p className="text-xs text-muted-foreground">{stepType}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "text-xs px-2 py-0.5 rounded-full",
                      stepStatus === "active" ? "bg-emerald-100 text-emerald-700" :
                      stepStatus === "processing" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"
                    )}>
                      {stepStatus}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Activity Log */}
        <div className="p-6 border-t">
          <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-4">Recent Activity</h3>
          <div className="space-y-2">
            {[
              { time: "2 min ago", event: "AI agent processed incoming request", type: "success" },
              { time: "8 min ago", event: "Workflow trigger fired — new client inquiry", type: "info" },
              { time: "15 min ago", event: "Automated follow-up sequence completed", type: "success" },
              { time: "32 min ago", event: "Human review step — awaiting approval", type: "warning" },
              { time: "1 hr ago", event: "API integration synced 12 records", type: "info" },
            ].map((log, i) => (
              <div key={i} className="flex items-center gap-3 text-sm">
                <span className={cn(
                  "size-2 rounded-full flex-shrink-0",
                  log.type === "success" ? "bg-emerald-500" : log.type === "warning" ? "bg-amber-500" : "bg-blue-500"
                )} />
                <span className="text-muted-foreground w-20 flex-shrink-0">{log.time}</span>
                <span>{log.event}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Close */}
        <div className="p-4 border-t flex justify-end">
          <button onClick={onClose} className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════ MAIN DASHBOARD ═══════════════════════ */

export function AdminOperationsPage() {
  const sessions = useQuery(api.onboardingAgent.listSessions) ?? [];
  const workflows = useQuery(api.workflows.list) ?? [];
  const _industries = useQuery(api.industries.list) ?? [];
  const [selectedExec, setSelectedExec] = useState<WorkflowExecution | null>(null);
  const [viewMode, setViewMode] = useState<"agency" | "client">("agency");

  const executions = useMemo(() => generateExecutionData(sessions, workflows), [sessions, workflows]);

  const deployedCount = sessions.filter((s: any) => s.status === "deployed").length;
  const totalRuns = executions.reduce((sum, e) => sum + e.runsToday, 0);
  const totalWeekRuns = executions.reduce((sum, e) => sum + e.runsWeek, 0);
  const avgAutomation = executions.length ? Math.round(executions.reduce((s, e) => s + e.automationRate, 0) / executions.length) : 0;
  const avgUptime = executions.length ? (executions.reduce((s, e) => s + e.uptime, 0) / executions.length).toFixed(1) : "0";
  const totalSaved = executions.reduce((s, e) => s + e.costSaved, 0);
  const runningCount = executions.filter(e => e.status === "running").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Operations Command Center</h1>
          <p className="text-gray-500">Real-time monitoring of all AI workflow deployments</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-gray-100 rounded-lg p-0.5">
            <button
              onClick={() => setViewMode("agency")}
              className={cn("px-3 py-1.5 text-sm font-medium rounded-md transition-all", viewMode === "agency" ? "bg-white shadow text-slate-900" : "text-gray-500")}
            >
              <Shield className="size-3.5 inline mr-1.5" />Agency View
            </button>
            <button
              onClick={() => setViewMode("client")}
              className={cn("px-3 py-1.5 text-sm font-medium rounded-md transition-all", viewMode === "client" ? "bg-white shadow text-slate-900" : "text-gray-500")}
            >
              <Eye className="size-3.5 inline mr-1.5" />Client View
            </button>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-medium border border-emerald-200">
            <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
            LIVE
          </div>
        </div>
      </div>

      {/* Top-Level KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
        <StatCard title="Active Workflows" value={runningCount} subtitle={`of ${deployedCount} deployed`} icon={Zap} trend="+3" trendUp color="green" />
        <StatCard title="Tasks Today" value={totalRuns.toLocaleString()} subtitle="automated executions" icon={Activity} trend="+18%" trendUp color="blue" />
        <StatCard title="Tasks This Week" value={totalWeekRuns.toLocaleString()} subtitle="total runs" icon={BarChart3} trend="+12%" trendUp color="purple" />
        <StatCard title="Automation Rate" value={`${avgAutomation}%`} subtitle="across all clients" icon={Cpu} trend="+2.3%" trendUp color="cyan" />
        <StatCard title="System Uptime" value={`${avgUptime}%`} subtitle="30-day average" icon={Gauge} color="green" />
        <StatCard title="Cost Savings" value={`$${(totalSaved / 1000).toFixed(1)}K`} subtitle="monthly estimate" icon={TrendingUp} trend="+8%" trendUp color="amber" />
      </div>

      {/* Live Workflow Status Grid */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Layers className="size-5 text-slate-600" />
              {viewMode === "agency" ? "All Client Workflows" : "Your Workflow Performance"}
            </CardTitle>
            <Badge variant="outline" className="text-xs">
              <RefreshCw className="size-3 mr-1 animate-spin" />
              Auto-refreshing
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {executions.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Bot className="size-12 mx-auto mb-3 opacity-30" />
              <p>No deployed workflows yet. Deploy workflows from the AI Workflow Builder.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    <th className="text-left py-3 px-3">Client</th>
                    <th className="text-left py-3 px-3">Industry</th>
                    <th className="text-left py-3 px-3">Status</th>
                    <th className="text-left py-3 px-3">Automation</th>
                    <th className="text-center py-3 px-3">Runs Today</th>
                    <th className="text-center py-3 px-3">Response</th>
                    <th className="text-center py-3 px-3">Uptime</th>
                    <th className="text-right py-3 px-3">Savings/mo</th>
                    <th className="text-center py-3 px-3">Last Run</th>
                    <th className="text-center py-3 px-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {executions.map((exec, idx) => (
                    <tr key={idx} className="hover:bg-gray-50/50 transition-colors cursor-pointer" onClick={() => setSelectedExec(exec)}>
                      <td className="py-3 px-3">
                        <div>
                          <p className="font-medium text-sm">{exec.clientName}</p>
                          <p className="text-xs text-muted-foreground truncate max-w-[200px]">{exec.workflowName}</p>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <Badge variant="outline" className="text-xs font-normal">{exec.industry}</Badge>
                      </td>
                      <td className="py-3 px-3">
                        <StatusBadge status={exec.status} />
                      </td>
                      <td className="py-3 px-3 w-32">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium">{exec.automationRate}%</span>
                          </div>
                          <MiniBar value={exec.automationRate} />
                        </div>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="text-sm font-semibold">{exec.runsToday}</span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className={cn("text-sm font-medium", parseFloat(exec.avgResponseTime) <= 1 ? "text-emerald-600" : parseFloat(exec.avgResponseTime) <= 2 ? "text-blue-600" : "text-amber-600")}>
                          {exec.avgResponseTime}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className={cn("text-sm font-medium", exec.uptime >= 99.5 ? "text-emerald-600" : "text-blue-600")}>
                          {exec.uptime.toFixed(1)}%
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <span className="text-sm font-semibold text-emerald-600">${exec.costSaved.toLocaleString()}</span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                          <Clock className="size-3" />{exec.lastRun}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <button className="text-slate-400 hover:text-slate-700 transition-colors">
                          <Eye className="size-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bottom Row: System Health + Industry Distribution */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* System Health */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Shield className="size-4 text-emerald-600" />
              System Health
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { label: "API Gateway", status: "operational", uptime: "99.97%" },
              { label: "AI Engine (LLM)", status: "operational", uptime: "99.84%" },
              { label: "Workflow Engine", status: "operational", uptime: "99.91%" },
              { label: "Database Cluster", status: "operational", uptime: "99.99%" },
              { label: "Notification Service", status: "operational", uptime: "99.88%" },
              { label: "Webhook Delivery", status: "degraded", uptime: "98.72%" },
            ].map((svc, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className={cn("size-2.5 rounded-full", svc.status === "operational" ? "bg-emerald-500" : "bg-amber-500")} />
                  <span className="text-sm">{svc.label}</span>
                </div>
                <span className="text-xs text-muted-foreground">{svc.uptime}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Industry Distribution */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Globe className="size-4 text-blue-600" />
              Industry Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {executions.map((exec, i) => (
              <div key={i} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="truncate">{exec.industry}</span>
                  <span className="text-xs text-muted-foreground">{exec.runsWeek} runs/wk</span>
                </div>
                <MiniBar value={exec.runsWeek} max={700} />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Real-Time Feed */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Activity className="size-4 text-purple-600" />
              Live Activity Feed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { time: "Just now", client: "Metro Auto Group", event: "AI responded to internet lead in 0.8s", icon: Bot, color: "text-emerald-600" },
                { time: "1 min ago", client: "Sparkle Express", event: "Weather trigger fired — sunny forecast push", icon: Zap, color: "text-blue-600" },
                { time: "3 min ago", client: "SafeGuard Insurance", event: "Policy renewal sequence started (42 policies)", icon: Timer, color: "text-purple-600" },
                { time: "5 min ago", client: "Sunrise Health", event: "AI phone agent handled 3 appointment requests", icon: Bot, color: "text-emerald-600" },
                { time: "8 min ago", client: "DriveRight Auto", event: "Collection escalation: Day 7 notice sent", icon: AlertTriangle, color: "text-amber-600" },
                { time: "12 min ago", client: "Ironclad Builders", event: "Change order #247 approved by PM", icon: CheckCircle2, color: "text-emerald-600" },
                { time: "15 min ago", client: "CrossCountry Freight", event: "Driver CDL renewal alert (14 days)", icon: Shield, color: "text-red-500" },
                { time: "18 min ago", client: "Glow Studio", event: "No-show prevention: 12/14 confirmed", icon: Target, color: "text-blue-600" },
                { time: "22 min ago", client: "Keystone Mortgage", event: "Rate lock monitor: rates dropped 0.125%", icon: TrendingUp, color: "text-amber-600" },
                { time: "28 min ago", client: "Frosty Peaks", event: "Inventory alert: vanilla base below reorder", icon: AlertTriangle, color: "text-red-500" },
              ].map((item, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <item.icon className={cn("size-4 mt-0.5 flex-shrink-0", item.color)} />
                  <div className="min-w-0">
                    <p className="text-sm leading-snug">
                      <span className="font-medium">{item.client}</span>
                      <span className="text-muted-foreground"> — {item.event}</span>
                    </p>
                    <p className="text-xs text-muted-foreground">{item.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Client Detail Modal */}
      {selectedExec && (
        <ClientDetailPanel exec={selectedExec} onClose={() => setSelectedExec(null)} />
      )}
    </div>
  );
}
