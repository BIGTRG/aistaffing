// @ts-nocheck
import { useApiQuery } from "@/lib/hooks";
import { api } from "@/lib/api";
import { useState, useMemo } from "react";
import {
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  Bot,
  Briefcase,
  CheckCircle2,
  Clock,
  DollarSign,
  ExternalLink,
  Headphones,
  MessageSquare,
  Phone,
  PieChart,
  Settings,
  Star,
  Target,
  TrendingUp,
  UserCheck,
  Zap,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

/* ═══════════════════════════════════════════════════════════════
 * CLIENT PORTAL — What the business owner sees when they log in.
 * "How are my AI agents performing? What deals are closing?
 *  What's the productivity gain? What's the ROI?"
 *
 * Inspired by ServiceNow's CSM / ITSM dashboards but focused
 * on AI agent performance, deal tracking, and business outcomes.
 * ═══════════════════════════════════════════════════════════════ */

// Simulated client-specific data for the demo (Metro Auto Group)
function useClientData(clientName: string) {
  return useMemo(() => {
    const clients: Record<string, any> = {
      "Metro Auto Group": {
        industry: "Car Dealership",
        plan: "Enterprise",
        joinedDate: "May 12, 2026",
        agents: [
          { name: "Sales AI Agent", type: "Internet Lead Response", status: "active", icon: MessageSquare, handled: 847, converted: 234, avgResponse: "12s", rating: 4.8 },
          { name: "Service AI Agent", type: "Service Appointment Booking", status: "active", icon: Phone, handled: 1243, converted: 891, avgResponse: "8s", rating: 4.9 },
          { name: "BDC AI Agent", type: "Follow-Up & Nurture", status: "active", icon: Headphones, handled: 2190, converted: 487, avgResponse: "2min", rating: 4.6 },
          { name: "Finance AI Agent", type: "F&I Pre-Qualification", status: "active", icon: DollarSign, handled: 312, converted: 198, avgResponse: "45s", rating: 4.7 },
        ],
        pipeline: {
          newLeads: 127,
          contacted: 89,
          qualified: 52,
          testDrive: 28,
          negotiation: 14,
          closed: 8,
        },
        deals: [
          { id: "D-1847", customer: "James Wilson", vehicle: "2025 Toyota Camry", value: 34500, stage: "Closed Won", agent: "Sales AI", date: "Today" },
          { id: "D-1846", customer: "Sarah Chen", vehicle: "2025 Honda CR-V", value: 38900, stage: "Closed Won", agent: "Sales AI", date: "Today" },
          { id: "D-1845", customer: "Mike Johnson", vehicle: "2024 Ford F-150", value: 52000, stage: "Negotiation", agent: "BDC AI", date: "Today" },
          { id: "D-1844", customer: "Lisa Rodriguez", vehicle: "2025 Hyundai Tucson", value: 32800, stage: "Test Drive", agent: "Sales AI", date: "Yesterday" },
          { id: "D-1843", customer: "David Thompson", vehicle: "2025 Kia Telluride", value: 45200, stage: "Closed Won", agent: "Sales AI", date: "Yesterday" },
          { id: "D-1842", customer: "Amy Park", vehicle: "2024 Chevrolet Equinox", value: 29900, stage: "Qualified", agent: "BDC AI", date: "Yesterday" },
          { id: "D-1841", customer: "Robert Kim", vehicle: "2025 BMW X3", value: 58700, stage: "Closed Won", agent: "Finance AI", date: "2 days ago" },
          { id: "D-1840", customer: "Jennifer Lee", vehicle: "2025 Mercedes GLC", value: 62300, stage: "F&I Review", agent: "Finance AI", date: "2 days ago" },
        ],
        productivity: {
          totalTasks: 4592,
          automated: 4180,
          manual: 412,
          hourssSaved: 847,
          costSaved: 42350,
          responseImprovement: 94, // % faster
          customerSat: 4.7,
          leadConversion: 27.6,
          prevLeadConversion: 18.2,
        },
        weeklyTrend: [
          { day: "Mon", leads: 42, deals: 3, tasks: 680 },
          { day: "Tue", leads: 38, deals: 2, tasks: 720 },
          { day: "Wed", leads: 51, deals: 5, tasks: 810 },
          { day: "Thu", leads: 44, deals: 4, tasks: 760 },
          { day: "Fri", leads: 56, deals: 6, tasks: 840 },
          { day: "Sat", leads: 63, deals: 7, tasks: 920 },
          { day: "Sun", leads: 24, deals: 1, tasks: 310 },
        ],
        recentActivity: [
          { time: "2 min ago", event: "Sales AI responded to internet lead from Cars.com in 12s", type: "lead" },
          { time: "5 min ago", event: "Service AI booked oil change appointment for VIN ...4872", type: "service" },
          { time: "8 min ago", event: "BDC AI completed Day-3 follow-up sequence (6 contacts)", type: "followup" },
          { time: "12 min ago", event: "Deal D-1847 closed — James Wilson, 2025 Toyota Camry", type: "deal" },
          { time: "18 min ago", event: "Finance AI pre-qualified Robert Kim for $58.7K loan", type: "finance" },
          { time: "25 min ago", event: "Sales AI scheduled test drive — Lisa Rodriguez, Tucson", type: "lead" },
          { time: "31 min ago", event: "Service AI handled recall notification for 42 vehicles", type: "service" },
          { time: "45 min ago", event: "BDC AI sent personalized birthday message to 8 customers", type: "followup" },
          { time: "1 hr ago", event: "Deal D-1846 closed — Sarah Chen, 2025 Honda CR-V", type: "deal" },
          { time: "1.5 hrs ago", event: "Finance AI flagged subprime application for human review", type: "escalation" },
        ],
      },
    };
    return clients[clientName] || clients["Metro Auto Group"];
  }, [clientName]);
}

/* ─── Components ─── */

function KPICard({ title, value, subtitle, icon: Icon, trend, trendUp, color, large }: {
  title: string; value: string | number; subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  trend?: string; trendUp?: boolean; color: string; large?: boolean;
}) {
  const bgMap: Record<string, string> = {
    emerald: "from-emerald-500 to-emerald-600",
    blue: "from-blue-500 to-blue-600",
    purple: "from-purple-500 to-purple-600",
    amber: "from-amber-500 to-amber-600",
    red: "from-red-500 to-red-600",
    cyan: "from-cyan-500 to-cyan-600",
    slate: "from-slate-700 to-slate-800",
    indigo: "from-indigo-500 to-indigo-600",
  };

  if (large) {
    return (
      <Card className={cn("text-white bg-gradient-to-br border-0 shadow-lg", bgMap[color])}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm font-medium">{title}</p>
              <p className="text-3xl font-bold mt-1">{value}</p>
              <div className="flex items-center gap-1.5 mt-2">
                {trend && (
                  <span className="text-sm font-medium flex items-center gap-0.5 bg-white/20 px-2 py-0.5 rounded-full">
                    {trendUp ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}
                    {trend}
                  </span>
                )}
                <span className="text-white/70 text-sm">{subtitle}</span>
              </div>
            </div>
            <div className="size-14 rounded-2xl bg-white/20 flex items-center justify-center">
              <Icon className="size-7" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
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
          <div className={cn("size-11 rounded-xl flex items-center justify-center", `bg-${color}-100 text-${color}-600`)}>
            <Icon className="size-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function PipelineBar({ pipeline }: { pipeline: any }) {
  const stages = [
    { key: "newLeads", label: "New Leads", color: "bg-blue-500", count: pipeline.newLeads },
    { key: "contacted", label: "Contacted", color: "bg-cyan-500", count: pipeline.contacted },
    { key: "qualified", label: "Qualified", color: "bg-indigo-500", count: pipeline.qualified },
    { key: "testDrive", label: "Test Drive", color: "bg-purple-500", count: pipeline.testDrive },
    { key: "negotiation", label: "Negotiation", color: "bg-amber-500", count: pipeline.negotiation },
    { key: "closed", label: "Closed", color: "bg-emerald-500", count: pipeline.closed },
  ];
  const total = stages.reduce((s, st) => s + st.count, 0);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Target className="size-4 text-indigo-600" />
          Sales Pipeline
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Funnel visualization */}
        <div className="flex h-8 rounded-lg overflow-hidden mb-4">
          {stages.map(st => (
            <div
              key={st.key}
              className={cn("flex items-center justify-center text-white text-xs font-medium transition-all", st.color)}
              style={{ width: `${(st.count / total) * 100}%` }}
              title={`${st.label}: ${st.count}`}
            >
              {(st.count / total) * 100 > 8 ? st.count : ""}
            </div>
          ))}
        </div>
        {/* Legend */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {stages.map(st => (
            <div key={st.key} className="text-center">
              <div className={cn("size-3 rounded-full mx-auto mb-1", st.color)} />
              <p className="text-lg font-bold">{st.count}</p>
              <p className="text-xs text-muted-foreground">{st.label}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function ProductivityGauge({ data }: { data: any }) {
  const automationPct = Math.round((data.automated / data.totalTasks) * 100);
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <BarChart3 className="size-4 text-emerald-600" />
          Productivity Tracker
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Automation Rate Circle */}
        <div className="flex items-center gap-6">
          <div className="relative size-28 flex-shrink-0">
            <svg viewBox="0 0 100 100" className="size-28 -rotate-90">
              <circle cx="50" cy="50" r="42" fill="none" stroke="#e5e7eb" strokeWidth="8" />
              <circle
                cx="50" cy="50" r="42" fill="none" stroke="#10b981" strokeWidth="8"
                strokeDasharray={`${automationPct * 2.64} 264`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold">{automationPct}%</span>
              <span className="text-[10px] text-muted-foreground">Automated</span>
            </div>
          </div>
          <div className="space-y-2 flex-1">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total Tasks</span>
              <span className="font-semibold">{data.totalTasks.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-emerald-600">AI Automated</span>
              <span className="font-semibold text-emerald-600">{data.automated.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-amber-600">Human Handled</span>
              <span className="font-semibold text-amber-600">{data.manual.toLocaleString()}</span>
            </div>
            <div className="h-px bg-gray-200 my-1" />
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Hours Saved</span>
              <span className="font-bold text-blue-600">{data.hourssSaved}</span>
            </div>
          </div>
        </div>

        {/* Response Improvement */}
        <div className="grid grid-cols-3 gap-3 pt-2 border-t">
          <div className="text-center">
            <p className="text-lg font-bold text-emerald-600">{data.responseImprovement}%</p>
            <p className="text-xs text-muted-foreground">Faster Response</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-blue-600">{data.leadConversion}%</p>
            <p className="text-xs text-muted-foreground">Lead → Sale</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-amber-600">
              <Star className="size-3.5 inline mb-0.5" /> {data.customerSat}
            </p>
            <p className="text-xs text-muted-foreground">CSAT Score</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function DealStage({ stage }: { stage: string }) {
  const config: Record<string, { bg: string; text: string }> = {
    "Closed Won": { bg: "bg-emerald-100 text-emerald-700", text: "Closed Won" },
    "Negotiation": { bg: "bg-amber-100 text-amber-700", text: "Negotiation" },
    "Test Drive": { bg: "bg-purple-100 text-purple-700", text: "Test Drive" },
    "Qualified": { bg: "bg-blue-100 text-blue-700", text: "Qualified" },
    "F&I Review": { bg: "bg-indigo-100 text-indigo-700", text: "F&I Review" },
  };
  const c = config[stage] || { bg: "bg-gray-100 text-gray-700", text: stage };
  return <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full", c.bg)}>{c.text}</span>;
}

function WeeklyChart({ data }: { data: any[] }) {
  const maxLeads = Math.max(...data.map(d => d.leads));
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <TrendingUp className="size-4 text-blue-600" />
          This Week&apos;s Performance
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-end gap-2 h-36">
          {data.map((d, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-xs font-medium text-muted-foreground">{d.leads}</span>
              <div className="w-full rounded-t-md bg-blue-500/80 transition-all" style={{ height: `${(d.leads / maxLeads) * 100}%` }} />
              <span className="text-xs text-muted-foreground">{d.day}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-center gap-4 mt-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5"><span className="size-2.5 rounded bg-blue-500" />Leads</span>
          <span>Total: {data.reduce((s, d) => s + d.leads, 0)} leads · {data.reduce((s, d) => s + d.deals, 0)} deals</span>
        </div>
      </CardContent>
    </Card>
  );
}

/* ═══════════════════════ MAIN PAGE ═══════════════════════ */

export function AdminClientPortalPage() {
  const sessions = useApiQuery(() => api.onboardingAgent.listSessions(), []) ?? [];
  const deployedClients = sessions.filter((s: any) => s.status === "deployed");
  const [selectedClient, setSelectedClient] = useState("Metro Auto Group");

  const clientData = useClientData(selectedClient);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">Client Portal</h1>
            <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">Live</Badge>
          </div>
          <p className="text-gray-500">What your clients see — performance, deals, productivity, and ROI</p>
        </div>

        {/* Client Selector */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Viewing as:</span>
          <select
            value={selectedClient}
            onChange={(e) => setSelectedClient(e.target.value)}
            className="px-3 py-2 rounded-lg border bg-white text-sm font-medium shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            {deployedClients.length > 0 ? (
              deployedClients.map((c: any) => (
                <option key={c.id} value={c.clientName}>{c.clientName}</option>
              ))
            ) : (
              <option>Metro Auto Group</option>
            )}
          </select>
        </div>
      </div>

      {/* Welcome Banner */}
      <Card className="bg-gradient-to-r from-slate-900 to-slate-800 text-white border-0">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">{selectedClient}</h2>
              <p className="text-slate-300 mt-1">{clientData.industry} · {clientData.plan} Plan · Member since {clientData.joinedDate}</p>
              <p className="text-slate-400 text-sm mt-2 flex items-center gap-1.5">
                <Zap className="size-3.5 text-amber-400" />
                {clientData.agents.length} AI Agents Active · Handling {clientData.productivity.totalTasks.toLocaleString()} tasks this month
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-3">
              <div className="text-center px-4 py-2 bg-white/10 rounded-xl">
                <p className="text-2xl font-bold text-emerald-400">${(clientData.productivity.costSaved / 1000).toFixed(1)}K</p>
                <p className="text-xs text-slate-400">Saved This Month</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top KPI Row — Large Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Deals Closed" value={clientData.deals.filter((d: any) => d.stage === "Closed Won").length} subtitle="this week"
          icon={CheckCircle2} trend="+33%" trendUp color="emerald" large
        />
        <KPICard
          title="Revenue Pipeline" value={`$${(clientData.deals.reduce((s: number, d: any) => s + d.value, 0) / 1000).toFixed(0)}K`} subtitle="in funnel"
          icon={DollarSign} trend="+18%" trendUp color="blue" large
        />
        <KPICard
          title="Lead Conversion" value={`${clientData.productivity.leadConversion}%`}
          subtitle={`was ${clientData.productivity.prevLeadConversion}%`}
          icon={TrendingUp} trend={`+${(clientData.productivity.leadConversion - clientData.productivity.prevLeadConversion).toFixed(1)}%`} trendUp color="purple" large
        />
        <KPICard
          title="Customer Satisfaction" value={clientData.productivity.customerSat} subtitle="out of 5.0"
          icon={Star} trend="+0.3" trendUp color="amber" large
        />
      </div>

      {/* AI Agent Performance */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Bot className="size-5 text-blue-600" />
            Your AI Agents
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {clientData.agents.map((agent: any, i: number) => (
              <div key={i} className="rounded-xl border p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-3">
                  <div className="size-10 rounded-lg bg-blue-50 flex items-center justify-center">
                    <agent.icon className="size-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{agent.name}</p>
                    <p className="text-xs text-muted-foreground">{agent.type}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-lg font-bold">{agent.handled.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">Interactions</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-emerald-600">{agent.converted}</p>
                    <p className="text-xs text-muted-foreground">Converted</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-blue-600">{agent.avgResponse}</p>
                    <p className="text-xs text-muted-foreground">Avg Response</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-amber-600">
                      <Star className="size-3 inline mb-0.5" /> {agent.rating}
                    </p>
                    <p className="text-xs text-muted-foreground">Rating</p>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs text-emerald-600 font-medium">Active</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Pipeline + Productivity Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        <PipelineBar pipeline={clientData.pipeline} />
        <ProductivityGauge data={clientData.productivity} />
      </div>

      {/* Deals Table + Weekly Chart */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Deals */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Briefcase className="size-4 text-emerald-600" />
              Recent Deals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    <th className="text-left py-2 px-2">Deal</th>
                    <th className="text-left py-2 px-2">Customer</th>
                    <th className="text-left py-2 px-2">Product</th>
                    <th className="text-right py-2 px-2">Value</th>
                    <th className="text-center py-2 px-2">Stage</th>
                    <th className="text-center py-2 px-2">Agent</th>
                    <th className="text-center py-2 px-2">When</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {clientData.deals.map((deal: any, i: number) => (
                    <tr key={i} className="hover:bg-gray-50/50">
                      <td className="py-2.5 px-2 text-xs font-mono text-muted-foreground">{deal.id}</td>
                      <td className="py-2.5 px-2 text-sm font-medium">{deal.customer}</td>
                      <td className="py-2.5 px-2 text-sm text-muted-foreground">{deal.vehicle}</td>
                      <td className="py-2.5 px-2 text-sm font-semibold text-right">${deal.value.toLocaleString()}</td>
                      <td className="py-2.5 px-2 text-center"><DealStage stage={deal.stage} /></td>
                      <td className="py-2.5 px-2 text-center">
                        <Badge variant="outline" className="text-xs">{deal.agent}</Badge>
                      </td>
                      <td className="py-2.5 px-2 text-xs text-muted-foreground text-center">{deal.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Weekly Chart */}
        <WeeklyChart data={clientData.weeklyTrend} />
      </div>

      {/* ROI Summary + Activity Feed */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* ROI Summary */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <PieChart className="size-4 text-purple-600" />
              ROI Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100/50 p-4 border border-emerald-200">
              <p className="text-sm text-emerald-700 font-medium">Monthly Cost Savings</p>
              <p className="text-3xl font-bold text-emerald-700 mt-1">${clientData.productivity.costSaved.toLocaleString()}</p>
              <p className="text-xs text-emerald-600/70 mt-1">vs. traditional staffing</p>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">FTEs Replaced</span>
                <span className="font-bold">3.2</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Hours Saved</span>
                <span className="font-bold">{clientData.productivity.hourssSaved}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">24/7 Coverage</span>
                <span className="font-bold text-emerald-600">✓ Active</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Response Time</span>
                <span className="font-bold text-blue-600">{clientData.productivity.responseImprovement}% faster</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Lead Conv. Lift</span>
                <span className="font-bold text-purple-600">+{(clientData.productivity.leadConversion - clientData.productivity.prevLeadConversion).toFixed(1)}%</span>
              </div>
            </div>

            <div className="rounded-xl bg-blue-50 p-3 border border-blue-200 text-center">
              <p className="text-xs text-blue-600 font-medium">Return on Investment</p>
              <p className="text-2xl font-bold text-blue-700">847%</p>
            </div>
          </CardContent>
        </Card>

        {/* Activity Feed */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Activity className="size-4 text-purple-600" />
              Live Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {clientData.recentActivity.map((item: any, i: number) => {
                const iconMap: Record<string, { icon: any; color: string }> = {
                  lead: { icon: UserCheck, color: "text-blue-600" },
                  deal: { icon: CheckCircle2, color: "text-emerald-600" },
                  service: { icon: Settings, color: "text-purple-600" },
                  followup: { icon: MessageSquare, color: "text-cyan-600" },
                  finance: { icon: DollarSign, color: "text-amber-600" },
                  escalation: { icon: ExternalLink, color: "text-red-500" },
                };
                const cfg = iconMap[item.type] || iconMap.lead;
                const IconComp = cfg.icon;
                return (
                  <div key={i} className="flex gap-3 items-start py-2 border-b border-gray-100 last:border-0">
                    <IconComp className={cn("size-4 mt-0.5 flex-shrink-0", cfg.color)} />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm">{item.event}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                        <Clock className="size-3" />{item.time}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
