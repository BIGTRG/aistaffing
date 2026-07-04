import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useState } from "react";
import {
  Activity,
  ArrowUpRight,
  Bot,
  CheckCircle2,
  Clock,
  Globe,
  Key,
  Link2,
  Mail,
  MessageSquare,
  Phone,
  PhoneCall,
  Radio,
  RefreshCw,
  Server,
  Shield,
  Smartphone,
  TrendingUp,
  Workflow,
  Zap,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/* ═══════════════════════════════════════════════════════════════
 * AI GATEWAY DASHBOARD — The nerve center for all agent services.
 *
 * Shows:
 *   - Gateway throughput, latency, error rates
 *   - Service connector status (G-Sign, SealProof, BG Check, etc.)
 *   - Channel breakdown (voice, chat, email, SMS, workflow)
 *   - Enterprise auth overview (users, API keys, audit log)
 *   - Live request feed
 * ═══════════════════════════════════════════════════════════════ */

function StatCard({ title, value, subtitle, icon: Icon, color }: {
  title: string; value: string | number; subtitle: string;
  icon: React.ComponentType<{ className?: string }>; color: string;
}) {
  const bgMap: Record<string, string> = {
    blue: "from-blue-500 to-blue-600",
    emerald: "from-emerald-500 to-emerald-600",
    purple: "from-purple-500 to-purple-600",
    amber: "from-amber-500 to-amber-600",
    red: "from-red-500 to-red-600",
    cyan: "from-cyan-500 to-cyan-600",
    indigo: "from-indigo-500 to-indigo-600",
    slate: "from-slate-700 to-slate-800",
  };
  return (
    <Card className={cn("text-white bg-gradient-to-br border-0 shadow-lg", bgMap[color])}>
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/80 text-xs font-medium uppercase tracking-wider">{title}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
            <p className="text-white/60 text-xs mt-1">{subtitle}</p>
          </div>
          <div className="size-12 rounded-xl bg-white/20 flex items-center justify-center">
            <Icon className="size-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ConnectorCard({ connector }: { connector: any }) {
  const typeIcons: Record<string, any> = {
    esign: Shield, notary: CheckCircle2, background_check: Key,
    payment: Zap, voice: Phone, email: Mail, sms: Smartphone,
  };
  const Icon = typeIcons[connector.type] || Link2;

  return (
    <div className="rounded-xl border p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className="size-9 rounded-lg bg-blue-50 flex items-center justify-center">
            <Icon className="size-4.5 text-blue-600" />
          </div>
          <div>
            <p className="font-semibold text-sm">{connector.name}</p>
            <p className="text-xs text-muted-foreground">{connector.type}</p>
          </div>
        </div>
        <Badge className={connector.isActive
          ? "bg-emerald-100 text-emerald-700 border-emerald-200"
          : "bg-red-100 text-red-700 border-red-200"
        }>
          {connector.isActive ? "Active" : "Inactive"}
        </Badge>
      </div>
      <p className="text-xs text-muted-foreground mb-3">{connector.description}</p>
      <div className="flex flex-wrap gap-1.5">
        {connector.capabilities?.slice(0, 4).map((cap: string, i: number) => (
          <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
            {cap}
          </span>
        ))}
        {(connector.capabilities?.length ?? 0) > 4 && (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
            +{connector.capabilities.length - 4} more
          </span>
        )}
      </div>
      <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t">
        <div className="text-center">
          <p className="text-sm font-bold">{connector.requestCount ?? 0}</p>
          <p className="text-[10px] text-muted-foreground">Requests</p>
        </div>
        <div className="text-center">
          <p className="text-sm font-bold">{connector.avgLatencyMs ?? 0}ms</p>
          <p className="text-[10px] text-muted-foreground">Avg Latency</p>
        </div>
        <div className="text-center">
          <p className="text-sm font-bold text-emerald-600">{(100 - (connector.errorRate ?? 0)).toFixed(1)}%</p>
          <p className="text-[10px] text-muted-foreground">Uptime</p>
        </div>
      </div>
    </div>
  );
}

export function AdminGatewayPage() {
  const gatewayStats = useQuery(api.gateway.getGatewayStats);
  const connectors = useQuery(api.gateway.listServiceConnectors);
  const voiceStats = useQuery(api.voiceAgent.getCallStats);
  const commsStats = useQuery(api.communications.getCommsStats);
  const users = useQuery(api.enterpriseAuth.listUsers, {});
  const apiKeys = useQuery(api.enterpriseAuth.listApiKeys, {});
  const auditLog = useQuery(api.enterpriseAuth.getAuditLog, { limit: 10 });
  const roles = useQuery(api.enterpriseAuth.getRoles);

  const seedConnectorsMut = useMutation(api.gateway.seedConnectors);
  const [seeding, setSeeding] = useState(false);

  const [activeTab, setActiveTab] = useState<"gateway" | "connectors" | "channels" | "auth">("gateway");

  const handleSeedConnectors = async () => {
    setSeeding(true);
    try { await seedConnectorsMut(); } catch {}
    setSeeding(false);
  };

  const channelData = [
    { name: "Voice", icon: PhoneCall, count: gatewayStats?.byChannel?.voice ?? 0, color: "text-purple-600", bg: "bg-purple-50" },
    { name: "Chat", icon: MessageSquare, count: gatewayStats?.byChannel?.chat ?? 0, color: "text-blue-600", bg: "bg-blue-50" },
    { name: "Email", icon: Mail, count: gatewayStats?.byChannel?.email ?? 0, color: "text-emerald-600", bg: "bg-emerald-50" },
    { name: "SMS", icon: Smartphone, count: gatewayStats?.byChannel?.sms ?? 0, color: "text-amber-600", bg: "bg-amber-50" },
    { name: "Workflow", icon: Workflow, count: gatewayStats?.byChannel?.workflow ?? 0, color: "text-cyan-600", bg: "bg-cyan-50" },
    { name: "API", icon: Globe, count: gatewayStats?.byChannel?.api ?? 0, color: "text-indigo-600", bg: "bg-indigo-50" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">AI Gateway</h1>
            <Badge className="bg-blue-100 text-blue-700 border-blue-200">Enterprise</Badge>
          </div>
          <p className="text-gray-500">Central routing layer for all AI agent services, integrations & security</p>
        </div>
        <div className="flex gap-2">
          {(connectors?.length ?? 0) === 0 && (
            <Button onClick={handleSeedConnectors} disabled={seeding} size="sm">
              <Zap className="size-4 mr-1" />
              {seeding ? "Initializing..." : "Initialize Connectors"}
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-gray-100 rounded-lg w-fit">
        {[
          { id: "gateway" as const, label: "Gateway", icon: Server },
          { id: "connectors" as const, label: "Service Connectors", icon: Link2 },
          { id: "channels" as const, label: "Channels", icon: Radio },
          { id: "auth" as const, label: "Enterprise Auth", icon: Shield },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all",
              activeTab === tab.id ? "bg-white shadow text-gray-900" : "text-gray-500 hover:text-gray-700"
            )}
          >
            <tab.icon className="size-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* GATEWAY TAB */}
      {activeTab === "gateway" && (
        <div className="space-y-6">
          {/* Top Stats */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard title="Requests (24h)" value={gatewayStats?.total24h ?? 0} subtitle="through gateway" icon={Activity} color="blue" />
            <StatCard title="Requests (1h)" value={gatewayStats?.totalLastHour ?? 0} subtitle="last hour" icon={TrendingUp} color="emerald" />
            <StatCard title="Avg Latency" value={`${gatewayStats?.avgLatencyMs ?? 0}ms`} subtitle="response time" icon={Clock} color="purple" />
            <StatCard title="Error Rate" value={`${gatewayStats?.errorRate ?? "0.0"}%`} subtitle="failure rate" icon={RefreshCw} color={Number(gatewayStats?.errorRate ?? 0) > 5 ? "red" : "emerald"} />
          </div>

          {/* Channel Breakdown */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Radio className="size-4 text-blue-600" />
                Channel Breakdown (24h)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                {channelData.map(ch => (
                  <div key={ch.name} className="text-center p-3 rounded-xl border hover:shadow-sm transition-shadow">
                    <div className={cn("size-10 rounded-lg mx-auto mb-2 flex items-center justify-center", ch.bg)}>
                      <ch.icon className={cn("size-5", ch.color)} />
                    </div>
                    <p className="text-xl font-bold">{ch.count}</p>
                    <p className="text-xs text-muted-foreground">{ch.name}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Status Breakdown */}
          <div className="grid gap-4 sm:grid-cols-2">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-emerald-600" />
                  Request Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(gatewayStats?.byStatus ?? {}).map(([status, count]) => (
                    <div key={status} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={cn("size-2 rounded-full", {
                          "bg-emerald-500": status === "completed",
                          "bg-blue-500": status === "processing",
                          "bg-red-500": status === "failed",
                          "bg-amber-500": status === "received",
                        }[status] ?? "bg-gray-400")} />
                        <span className="text-sm capitalize">{status}</span>
                      </div>
                      <span className="font-semibold">{count as number}</span>
                    </div>
                  ))}
                  {Object.keys(gatewayStats?.byStatus ?? {}).length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">No requests yet — gateway ready</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Gateway Endpoint Info */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Globe className="size-4 text-indigo-600" />
                  Gateway Endpoints
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2.5 font-mono text-xs">
                  {[
                    { method: "POST", path: "/gateway", desc: "Main gateway router" },
                    { method: "GET", path: "/gateway/stats", desc: "Analytics & metrics" },
                    { method: "POST", path: "/gateway/voice", desc: "Voice AI agent" },
                    { method: "POST", path: "/gateway/email", desc: "Email automation" },
                    { method: "POST", path: "/gateway/sms", desc: "SMS messaging" },
                    { method: "POST", path: "/widget/chat", desc: "Chat widget" },
                    { method: "POST", path: "/stripe/webhook", desc: "Stripe payments" },
                  ].map((ep, i) => (
                    <div key={i} className="flex items-center gap-2 p-2 rounded bg-gray-50">
                      <span className={cn("px-1.5 py-0.5 rounded text-[10px] font-bold",
                        ep.method === "POST" ? "bg-blue-100 text-blue-700" : "bg-emerald-100 text-emerald-700"
                      )}>
                        {ep.method}
                      </span>
                      <span className="text-gray-700 flex-1">{ep.path}</span>
                      <span className="text-gray-400">{ep.desc}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* CONNECTORS TAB */}
      {activeTab === "connectors" && (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {connectors?.map((c: any) => (
              <ConnectorCard key={c._id} connector={c} />
            ))}
          </div>
          {(connectors?.length ?? 0) === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <Link2 className="size-12 text-gray-300 mx-auto mb-3" />
                <p className="font-semibold text-gray-700">No connectors registered</p>
                <p className="text-sm text-muted-foreground mt-1 mb-4">Initialize G-Sign, SealProof, Background Check, and more</p>
                <Button onClick={handleSeedConnectors} disabled={seeding}>
                  <Zap className="size-4 mr-1" />
                  {seeding ? "Initializing..." : "Initialize TRG Connectors"}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* CHANNELS TAB */}
      {activeTab === "channels" && (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard title="Voice Calls Today" value={voiceStats?.totalToday ?? 0} subtitle="AI handled" icon={PhoneCall} color="purple" />
            <StatCard title="Emails Today" value={commsStats?.emailsToday ?? 0} subtitle="sent/queued" icon={Mail} color="emerald" />
            <StatCard title="SMS Today" value={commsStats?.smsToday ?? 0} subtitle="sent/queued" icon={Smartphone} color="amber" />
            <StatCard title="Escalation Rate" value={`${voiceStats?.escalationRate ?? "0.0"}%`} subtitle="transferred to human" icon={ArrowUpRight} color={Number(voiceStats?.escalationRate ?? 0) > 20 ? "red" : "emerald"} />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {/* Voice Stats */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Phone className="size-4 text-purple-600" />
                  Voice Engine
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Calls This Week</span>
                  <span className="font-semibold">{voiceStats?.totalThisWeek ?? 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Avg Duration</span>
                  <span className="font-semibold">{voiceStats?.avgDurationSeconds ?? 0}s</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Industries Active</span>
                  <span className="font-semibold">{Object.keys(voiceStats?.byIndustry ?? {}).length}</span>
                </div>
                <div className="pt-2 border-t">
                  <p className="text-xs text-muted-foreground mb-2">Outcomes</p>
                  {Object.entries(voiceStats?.byOutcome ?? {}).map(([outcome, count]) => (
                    <div key={outcome} className="flex justify-between text-xs py-0.5">
                      <span className="capitalize">{outcome}</span>
                      <span className="font-medium">{count as number}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Email Stats */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Mail className="size-4 text-emerald-600" />
                  Email Engine
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Emails</span>
                  <span className="font-semibold">{commsStats?.totalEmails ?? 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Sent</span>
                  <span className="font-semibold">{commsStats?.emailsSent ?? 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Open Rate</span>
                  <span className="font-semibold text-emerald-600">{commsStats?.openRate ?? "0.0"}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Active Sequences</span>
                  <span className="font-semibold">{commsStats?.sequences ?? 0}</span>
                </div>
              </CardContent>
            </Card>

            {/* SMS Stats */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Smartphone className="size-4 text-amber-600" />
                  SMS Engine
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Messages</span>
                  <span className="font-semibold">{commsStats?.totalSms ?? 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Today</span>
                  <span className="font-semibold">{commsStats?.smsToday ?? 0}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* AUTH TAB */}
      {activeTab === "auth" && (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard title="Enterprise Users" value={users?.length ?? 0} subtitle="registered" icon={Bot} color="blue" />
            <StatCard title="API Keys" value={apiKeys?.length ?? 0} subtitle="active" icon={Key} color="purple" />
            <StatCard title="Roles" value={roles?.length ?? 0} subtitle="configured" icon={Shield} color="emerald" />
            <StatCard title="Audit Events" value={auditLog?.length ?? 0} subtitle="recent" icon={Activity} color="slate" />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Roles */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Shield className="size-4 text-blue-600" />
                  Role Hierarchy
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {roles?.map((role: any, i: number) => (
                    <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-gray-50">
                      <div className="flex items-center gap-2">
                        <span className={cn("size-2 rounded-full",
                          role.role === "super_admin" ? "bg-red-500" :
                          role.role === "agency_admin" ? "bg-purple-500" :
                          role.role === "client_admin" ? "bg-blue-500" :
                          role.role === "client_user" ? "bg-emerald-500" :
                          "bg-gray-400"
                        )} />
                        <span className="text-sm font-medium capitalize">{role.role.replace(/_/g, " ")}</span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {role.permissionCount === 999 ? "All" : role.permissionCount} permissions
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* API Keys */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Key className="size-4 text-purple-600" />
                  API Keys
                </CardTitle>
              </CardHeader>
              <CardContent>
                {(apiKeys?.length ?? 0) > 0 ? (
                  <div className="space-y-2">
                    {apiKeys?.map((key: any) => (
                      <div key={key._id} className="flex items-center justify-between p-2.5 rounded-lg bg-gray-50">
                        <div>
                          <p className="text-sm font-medium">{key.name}</p>
                          <p className="text-xs text-muted-foreground font-mono">{key.keyPrefix}...</p>
                        </div>
                        <div className="text-right">
                          <Badge className={key.isActive ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}>
                            {key.isActive ? "Active" : "Revoked"}
                          </Badge>
                          <p className="text-xs text-muted-foreground mt-1">{key.usageCount} uses</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">No API keys generated yet</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Audit Log */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Activity className="size-4 text-slate-600" />
                Audit Log
              </CardTitle>
            </CardHeader>
            <CardContent>
              {(auditLog?.length ?? 0) > 0 ? (
                <div className="space-y-2">
                  {auditLog?.map((log: any, i: number) => (
                    <div key={i} className="flex items-center gap-3 p-2 rounded bg-gray-50 text-sm">
                      <span className="text-xs text-muted-foreground w-28 flex-shrink-0">
                        {new Date(log.timestamp).toLocaleString()}
                      </span>
                      <Badge variant="outline" className="text-xs">{log.action}</Badge>
                      <span className="text-muted-foreground truncate flex-1">
                        {log.resource} {log.details ? JSON.stringify(log.details).slice(0, 50) : ""}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No audit events — system clean</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
