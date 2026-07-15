import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useState } from "react";
import {
	Users, Power, PowerOff, Brain, Activity, Mail, AlertTriangle,
	ChevronRight, Search, Clock, TrendingUp, Zap, CheckCircle2,
	XCircle, MessageSquare, Star, BarChart3, Shield, Phone,
	Calendar, FileText, DollarSign, ArrowUpRight, ArrowDownRight,
	Filter, Eye, Wrench, Inbox, Send, BookOpen,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// ══════════════════════════════════════════════════
// TABS
// ══════════════════════════════════════════════════

type Tab = "roster" | "activity" | "skills" | "comms" | "requests";

const TABS: { key: Tab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
	{ key: "roster", label: "Agent Roster", icon: Users },
	{ key: "activity", label: "Activity Log", icon: Activity },
	{ key: "skills", label: "Skills Matrix", icon: Brain },
	{ key: "comms", label: "Internal Comms", icon: Mail },
	{ key: "requests", label: "Skill Requests", icon: BookOpen },
];

// ══════════════════════════════════════════════════
// MAIN PAGE
// ══════════════════════════════════════════════════

export function AdminAgentWorkforcePage() {
	const [tab, setTab] = useState<Tab>("roster");
	const stats = useQuery(api.agentWorkforce.getWorkforceStats) ?? null;

	return (
		<div className="space-y-6">
			{/* Header */}
			<div>
				<h1 className="text-2xl font-bold tracking-tight text-gray-900">Agent Workforce</h1>
				<p className="text-gray-500">Manage, monitor, and control every AI agent in your staffing operation</p>
			</div>

			{/* KPI Cards */}
			{stats && (
				<div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
					<KpiCard label="Total Agents" value={stats.totalAgents} icon={Users} />
					<KpiCard label="Active Now" value={stats.activeAgents} icon={Power} accent="emerald" />
					<KpiCard label="Avg Performance" value={`${stats.avgPerformance}%`} icon={TrendingUp} accent="blue" />
					<KpiCard label="Avg Utilization" value={`${stats.avgUtilization}%`} icon={BarChart3} accent="violet" />
					<KpiCard label="Unread Messages" value={stats.unreadMessages} icon={Mail} accent={stats.unreadMessages > 0 ? "amber" : undefined} />
					<KpiCard label="Skill Requests" value={stats.pendingSkillRequests} icon={Zap} accent={stats.pendingSkillRequests > 0 ? "rose" : undefined} />
				</div>
			)}

			{/* Tab Bar */}
			<div className="flex gap-1 border-b border-gray-200 overflow-x-auto">
				{TABS.map((t) => (
					<button
						key={t.key}
						onClick={() => setTab(t.key)}
						className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
							tab === t.key
								? "border-gray-900 text-gray-900"
								: "border-transparent text-gray-500 hover:text-gray-700"
						}`}
					>
						<t.icon className="size-4" />
						{t.label}
						{t.key === "comms" && stats && stats.unreadMessages > 0 && (
							<span className="size-5 rounded-full bg-amber-500 text-white text-xs flex items-center justify-center">{stats.unreadMessages}</span>
						)}
						{t.key === "requests" && stats && stats.pendingSkillRequests > 0 && (
							<span className="size-5 rounded-full bg-rose-500 text-white text-xs flex items-center justify-center">{stats.pendingSkillRequests}</span>
						)}
					</button>
				))}
			</div>

			{/* Tab Content */}
			{tab === "roster" && <RosterTab />}
			{tab === "activity" && <ActivityTab />}
			{tab === "skills" && <SkillsTab />}
			{tab === "comms" && <CommsTab />}
			{tab === "requests" && <RequestsTab />}
		</div>
	);
}

// ══════════════════════════════════════════════════
// KPI CARD
// ══════════════════════════════════════════════════

function KpiCard({ label, value, icon: Icon, accent }: {
	label: string; value: string | number; icon: React.ComponentType<{ className?: string }>; accent?: string;
}) {
	const colors: Record<string, string> = {
		emerald: "bg-emerald-50 text-emerald-600",
		blue: "bg-blue-50 text-blue-600",
		violet: "bg-violet-50 text-violet-600",
		amber: "bg-amber-50 text-amber-600",
		rose: "bg-rose-50 text-rose-600",
	};
	const iconColor = accent ? colors[accent] ?? "bg-gray-100 text-gray-600" : "bg-gray-100 text-gray-600";

	return (
		<Card className="border-gray-200">
			<CardContent className="py-3 px-4">
				<div className="flex items-center gap-3">
					<div className={`size-9 rounded-lg flex items-center justify-center ${iconColor}`}>
						<Icon className="size-4" />
					</div>
					<div>
						<div className="text-xl font-bold text-gray-900">{value}</div>
						<div className="text-xs text-gray-500 uppercase tracking-wider">{label}</div>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}

// ══════════════════════════════════════════════════
// ROSTER TAB
// ══════════════════════════════════════════════════

function RosterTab() {
	const agents = useQuery(api.agentWorkforce.listAgents, {}) ?? [];
	const toggleStatus = useMutation(api.agentWorkforce.toggleAgentStatus);
	const [search, setSearch] = useState("");
	const [filterDept, setFilterDept] = useState<string>("");
	const [expanded, setExpanded] = useState<string | null>(null);

	const filtered = agents.filter((a) => {
		const matchesSearch = !search || a.name.toLowerCase().includes(search.toLowerCase()) ||
			a.role.toLowerCase().includes(search.toLowerCase()) ||
			a.industry.toLowerCase().includes(search.toLowerCase()) ||
			(a.assignedOrgName ?? "").toLowerCase().includes(search.toLowerCase());
		const matchesDept = !filterDept || a.department === filterDept;
		return matchesSearch && matchesDept;
	});

	const departments = [...new Set(agents.map((a) => a.department))];

	return (
		<div className="space-y-4">
			{/* Filters */}
			<div className="flex gap-3 flex-wrap">
				<div className="relative flex-1 min-w-[200px]">
					<Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
					<Input placeholder="Search agents by name, role, industry, client..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 h-10" />
				</div>
				<select
					value={filterDept}
					onChange={(e) => setFilterDept(e.target.value)}
					className="h-10 px-3 rounded-md border border-gray-200 text-sm text-gray-700 bg-white"
				>
					<option value="">All Departments</option>
					{departments.map((d) => (
						<option key={d} value={d}>{d.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}</option>
					))}
				</select>
			</div>

			{/* Agent Grid */}
			<div className="space-y-2">
				{filtered.map((agent) => (
					<Card key={agent.agentId} className={`border transition-all ${agent.status === "active" ? "border-gray-200" : "border-gray-200 opacity-60"}`}>
						<CardContent className="py-3 px-4">
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-4 flex-1 min-w-0">
									{/* Avatar */}
									<div className={`size-11 rounded-full flex items-center justify-center text-sm font-bold ${
										agent.status === "active" ? "bg-emerald-100 text-emerald-700" :
										agent.status === "paused" ? "bg-amber-100 text-amber-700" :
										agent.status === "training" ? "bg-blue-100 text-blue-700" :
										"bg-gray-100 text-gray-500"
									}`}>
										{agent.avatar}
									</div>

									{/* Info */}
									<div className="flex-1 min-w-0">
										<div className="flex items-center gap-2">
											<span className="font-semibold text-sm text-gray-900">{agent.name}</span>
											<span className="text-xs text-gray-400 font-mono">{agent.agentId}</span>
											<span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
												agent.status === "active" ? "bg-emerald-50 text-emerald-700" :
												agent.status === "paused" ? "bg-amber-50 text-amber-700" :
												agent.status === "training" ? "bg-blue-50 text-blue-700" :
												"bg-gray-100 text-gray-500"
											}`}>
												{agent.status}
											</span>
										</div>
										<div className="flex items-center gap-3 mt-0.5 text-xs text-gray-500">
											<span>{agent.role}</span>
											<span className="text-gray-300">|</span>
											<span>{agent.assignedOrgName ?? "Unassigned"}</span>
											<span className="text-gray-300">|</span>
											<span className="capitalize">{agent.industry.replace(/-/g, " ")}</span>
										</div>
									</div>
								</div>

								{/* Stats */}
								<div className="hidden lg:flex items-center gap-6 text-xs text-gray-500 mr-4">
									<div className="text-center">
										<div className="font-bold text-sm text-gray-900">{agent.performanceScore}%</div>
										<div>Performance</div>
									</div>
									<div className="text-center">
										<div className="font-bold text-sm text-gray-900">{agent.utilizationRate}%</div>
										<div>Utilization</div>
									</div>
									<div className="text-center">
										<div className="font-bold text-sm text-gray-900">{agent.totalTasksCompleted.toLocaleString()}</div>
										<div>Tasks Done</div>
									</div>
									<div className="text-center">
										<div className="font-bold text-sm text-gray-900">{agent.responseTimeAvgMs}ms</div>
										<div>Avg Response</div>
									</div>
									<div className="text-center">
										<div className="font-bold text-sm text-gray-900">{agent.escalationRate}%</div>
										<div>Escalation</div>
									</div>
								</div>

								{/* Controls */}
								<div className="flex items-center gap-2">
									{agent.status === "active" ? (
										<Button
											variant="outline" size="sm"
											className="text-amber-600 border-amber-200 hover:bg-amber-50"
											onClick={() => toggleStatus({ agentId: agent.agentId, status: "paused" })}
										>
											<PowerOff className="size-3.5 mr-1" /> Pause
										</Button>
									) : (
										<Button
											variant="outline" size="sm"
											className="text-emerald-600 border-emerald-200 hover:bg-emerald-50"
											onClick={() => toggleStatus({ agentId: agent.agentId, status: "active" })}
										>
											<Power className="size-3.5 mr-1" /> Activate
										</Button>
									)}
									<button
										onClick={() => setExpanded(expanded === agent.agentId ? null : agent.agentId)}
										className="size-8 rounded-md flex items-center justify-center text-gray-400 hover:bg-gray-100"
									>
										<ChevronRight className={`size-4 transition-transform ${expanded === agent.agentId ? "rotate-90" : ""}`} />
									</button>
								</div>
							</div>

							{/* Expanded Detail */}
							{expanded === agent.agentId && (
								<AgentDetail agentId={agent.agentId} agent={agent} />
							)}
						</CardContent>
					</Card>
				))}
			</div>
		</div>
	);
}

// ══════════════════════════════════════════════════
// AGENT DETAIL (expanded row)
// ══════════════════════════════════════════════════

function AgentDetail({ agentId, agent }: { agentId: string; agent: any }) {
	const skills = useQuery(api.agentWorkforce.getAgentSkills, { agentId }) ?? [];
	const activities = useQuery(api.agentWorkforce.listActivities, { agentId, limit: 10 }) ?? [];
	const shifts = useQuery(api.agentWorkforce.listShifts, { agentId }) ?? [];
	const activeSkills = skills.filter((s) => s.status === "active");

	return (
		<div className="mt-4 pt-4 border-t border-gray-100 space-y-4">
			{/* Bio */}
			{agent.bio && <p className="text-sm text-gray-600">{agent.bio}</p>}
			{agent.personalityTraits && (
				<div className="flex gap-1.5 flex-wrap">
					{agent.personalityTraits.map((t: string) => (
						<span key={t} className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">{t}</span>
					))}
				</div>
			)}

			{/* Mobile Stats */}
			<div className="grid grid-cols-2 md:grid-cols-5 gap-3 lg:hidden">
				<MiniStat label="Performance" value={`${agent.performanceScore}%`} />
				<MiniStat label="Utilization" value={`${agent.utilizationRate}%`} />
				<MiniStat label="Tasks Done" value={agent.totalTasksCompleted.toLocaleString()} />
				<MiniStat label="Avg Response" value={`${agent.responseTimeAvgMs}ms`} />
				<MiniStat label="Escalation" value={`${agent.escalationRate}%`} />
			</div>

			{/* Skills */}
			<div>
				<h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Active Skills ({activeSkills.length})</h4>
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
					{activeSkills.map((skill) => (
						<div key={skill.skillSlug} className="flex items-center justify-between p-2 rounded-lg bg-gray-50">
							<div>
								<span className="text-sm font-medium text-gray-900">{skill.skillName}</span>
								<div className="text-xs text-gray-500">{skill.usageCount} uses</div>
							</div>
							<div className="flex items-center gap-2">
								<div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
									<div
										className={`h-full rounded-full ${
											skill.proficiency >= 90 ? "bg-emerald-500" :
											skill.proficiency >= 70 ? "bg-blue-500" :
											"bg-amber-500"
										}`}
										style={{ width: `${skill.proficiency}%` }}
									/>
								</div>
								<span className="text-xs font-mono text-gray-500 w-8 text-right">{skill.proficiency}%</span>
							</div>
						</div>
					))}
				</div>
			</div>

			{/* Recent Activity */}
			<div>
				<h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Recent Activity</h4>
				<div className="space-y-1">
					{activities.slice(0, 5).map((act, i) => (
						<div key={i} className="flex items-center gap-3 py-1.5 text-sm">
							<span className={`size-2 rounded-full ${
								act.outcome === "success" ? "bg-emerald-500" :
								act.outcome === "escalated" ? "bg-amber-500" : "bg-gray-400"
							}`} />
							<span className="text-gray-700 flex-1">{act.title}</span>
							<span className="text-xs text-gray-400">{timeAgo(act.timestamp)}</span>
						</div>
					))}
				</div>
			</div>

			{/* Shift History */}
			{shifts.length > 0 && (
				<div>
					<h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Shift History (Last 7 Days)</h4>
					<div className="overflow-x-auto">
						<table className="w-full text-xs">
							<thead>
								<tr className="border-b border-gray-200 text-gray-500">
									<th className="text-left py-1.5 font-medium">Date</th>
									<th className="text-right py-1.5 font-medium">Tasks</th>
									<th className="text-right py-1.5 font-medium">Calls</th>
									<th className="text-right py-1.5 font-medium">Emails</th>
									<th className="text-right py-1.5 font-medium">Appts</th>
									<th className="text-right py-1.5 font-medium">Leads</th>
									<th className="text-right py-1.5 font-medium">Util%</th>
								</tr>
							</thead>
							<tbody>
								{shifts.slice(0, 7).map((s, i) => (
									<tr key={i} className="border-b border-gray-50">
										<td className="py-1.5 font-mono text-gray-700">{s.date}</td>
										<td className="text-right py-1.5 text-gray-700">{s.tasksCompleted}</td>
										<td className="text-right py-1.5 text-gray-700">{s.callsHandled}</td>
										<td className="text-right py-1.5 text-gray-700">{s.emailsSent}</td>
										<td className="text-right py-1.5 text-gray-700">{s.appointmentsBooked}</td>
										<td className="text-right py-1.5 text-gray-700">{s.leadsGenerated}</td>
										<td className="text-right py-1.5">
											<span className={`font-medium ${s.utilization >= 85 ? "text-emerald-600" : s.utilization >= 70 ? "text-blue-600" : "text-amber-600"}`}>
												{s.utilization}%
											</span>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>
			)}
		</div>
	);
}

function MiniStat({ label, value }: { label: string; value: string }) {
	return (
		<div className="p-2 rounded-lg bg-gray-50 text-center">
			<div className="font-bold text-sm text-gray-900">{value}</div>
			<div className="text-xs text-gray-500">{label}</div>
		</div>
	);
}

// ══════════════════════════════════════════════════
// ACTIVITY TAB
// ══════════════════════════════════════════════════

function ActivityTab() {
	const activities = useQuery(api.agentWorkforce.listActivities, { limit: 100 }) ?? [];
	const [filterType, setFilterType] = useState("");
	const [filterOutcome, setFilterOutcome] = useState("");

	const types = [...new Set(activities.map((a) => a.activityType))];

	const filtered = activities.filter((a) => {
		return (!filterType || a.activityType === filterType) && (!filterOutcome || a.outcome === filterOutcome);
	});

	// Group by date
	const grouped: Record<string, typeof activities> = {};
	for (const act of filtered) {
		const date = new Date(act.timestamp).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
		if (!grouped[date]) grouped[date] = [];
		grouped[date].push(act);
	}

	const typeIcons: Record<string, React.ComponentType<{ className?: string }>> = {
		call_handled: Phone,
		email_sent: Mail,
		appointment_booked: Calendar,
		invoice_created: FileText,
		lead_captured: TrendingUp,
		escalation: AlertTriangle,
		crm_update: Users,
		report_generated: BarChart3,
	};

	return (
		<div className="space-y-4">
			{/* Filters */}
			<div className="flex gap-3 flex-wrap">
				<select value={filterType} onChange={(e) => setFilterType(e.target.value)}
					className="h-9 px-3 rounded-md border border-gray-200 text-sm text-gray-700 bg-white">
					<option value="">All Activity Types</option>
					{types.map((t) => (
						<option key={t} value={t}>{t.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}</option>
					))}
				</select>
				<select value={filterOutcome} onChange={(e) => setFilterOutcome(e.target.value)}
					className="h-9 px-3 rounded-md border border-gray-200 text-sm text-gray-700 bg-white">
					<option value="">All Outcomes</option>
					<option value="success">Success</option>
					<option value="partial">Partial</option>
					<option value="escalated">Escalated</option>
					<option value="failed">Failed</option>
				</select>
				<div className="text-sm text-gray-500 flex items-center ml-auto">
					{filtered.length} activities shown
				</div>
			</div>

			{/* Activity Feed */}
			{Object.entries(grouped).map(([date, acts]) => (
				<div key={date}>
					<h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 sticky top-0 bg-white py-1">{date}</h3>
					<div className="space-y-1">
						{acts.map((act, i) => {
							const Icon = typeIcons[act.activityType] ?? Activity;
							return (
								<div key={i} className="flex items-start gap-3 py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors">
									<div className={`size-8 rounded-lg flex items-center justify-center mt-0.5 ${
										act.outcome === "success" ? "bg-emerald-50 text-emerald-600" :
										act.outcome === "escalated" ? "bg-amber-50 text-amber-600" :
										act.outcome === "failed" ? "bg-red-50 text-red-600" :
										"bg-gray-100 text-gray-500"
									}`}>
										<Icon className="size-4" />
									</div>
									<div className="flex-1 min-w-0">
										<div className="flex items-center gap-2">
											<span className="text-sm font-medium text-gray-900">{act.agentName}</span>
											<span className="text-xs text-gray-400">{act.agentId}</span>
										</div>
										<div className="text-sm text-gray-700">{act.title}</div>
										{act.clientName && <div className="text-xs text-gray-400 mt-0.5">{act.clientName}</div>}
									</div>
									<div className="text-right flex-shrink-0">
										<span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
											act.outcome === "success" ? "bg-emerald-50 text-emerald-700" :
											act.outcome === "escalated" ? "bg-amber-50 text-amber-700" :
											act.outcome === "failed" ? "bg-red-50 text-red-700" :
											"bg-gray-100 text-gray-500"
										}`}>{act.outcome}</span>
										<div className="text-xs text-gray-400 mt-1">
											{new Date(act.timestamp).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
										</div>
										{act.durationMs && (
											<div className="text-xs text-gray-400">{(act.durationMs / 1000).toFixed(0)}s</div>
										)}
									</div>
								</div>
							);
						})}
					</div>
				</div>
			))}
		</div>
	);
}

// ══════════════════════════════════════════════════
// SKILLS TAB
// ══════════════════════════════════════════════════

function SkillsTab() {
	const agents = useQuery(api.agentWorkforce.listAgents, {}) ?? [];
	const catalog = useQuery(api.agentWorkforce.listSkillCatalog, {}) ?? [];
	const [selectedAgent, setSelectedAgent] = useState<string>("");

	// Get all agent skills for selected agent or show catalog overview
	const agentSkills = useQuery(
		api.agentWorkforce.getAgentSkills,
		selectedAgent ? { agentId: selectedAgent } : "skip"
	) ?? [];

	// Group catalog by category
	const byCategory: Record<string, typeof catalog> = {};
	for (const s of catalog) {
		if (!byCategory[s.category]) byCategory[s.category] = [];
		byCategory[s.category].push(s);
	}

	const categoryLabels: Record<string, string> = {
		communication: "Communication",
		scheduling: "Scheduling",
		sales: "Sales",
		finance: "Finance",
		admin: "Administration",
		technical: "Technical",
		industry_specific: "Industry-Specific",
	};

	return (
		<div className="space-y-4">
			{/* Agent Selector */}
			<div className="flex items-center gap-3">
				<label className="text-sm font-medium text-gray-700">View skills for:</label>
				<select
					value={selectedAgent}
					onChange={(e) => setSelectedAgent(e.target.value)}
					className="h-10 px-3 rounded-md border border-gray-200 text-sm text-gray-700 bg-white min-w-[250px]"
				>
					<option value="">-- Skill Catalog Overview --</option>
					{agents.map((a) => (
						<option key={a.agentId} value={a.agentId}>{a.name} ({a.agentId}) — {a.role}</option>
					))}
				</select>
			</div>

			{/* Agent Skills View */}
			{selectedAgent && agentSkills.length > 0 && (
				<div className="space-y-3">
					<div className="text-sm text-gray-600">
						{agentSkills.filter((s) => s.status === "active").length} active skills assigned
					</div>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-2">
						{agentSkills.filter((s) => s.status === "active").map((skill) => (
							<Card key={skill.skillSlug} className="border-gray-200">
								<CardContent className="py-3 px-4">
									<div className="flex items-center justify-between">
										<div>
											<div className="font-medium text-sm text-gray-900">{skill.skillName}</div>
											<div className="text-xs text-gray-500 mt-0.5">
												{skill.usageCount} uses · {skill.errorRate.toFixed(1)}% error rate · Assigned {new Date(skill.assignedAt).toLocaleDateString()}
											</div>
										</div>
										<div className="flex flex-col items-end gap-1">
											<div className="flex items-center gap-2">
												<div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
													<div
														className={`h-full rounded-full ${
															skill.proficiency >= 90 ? "bg-emerald-500" :
															skill.proficiency >= 70 ? "bg-blue-500" :
															skill.proficiency >= 50 ? "bg-amber-500" : "bg-red-500"
														}`}
														style={{ width: `${skill.proficiency}%` }}
													/>
												</div>
												<span className="text-sm font-bold text-gray-900 w-10 text-right">{skill.proficiency}%</span>
											</div>
											<span className={`text-xs ${
												skill.proficiency >= 90 ? "text-emerald-600" :
												skill.proficiency >= 70 ? "text-blue-600" :
												skill.proficiency >= 50 ? "text-amber-600" : "text-red-600"
											}`}>
												{skill.proficiency >= 90 ? "Expert" : skill.proficiency >= 70 ? "Proficient" : skill.proficiency >= 50 ? "Learning" : "Novice"}
											</span>
										</div>
									</div>
								</CardContent>
							</Card>
						))}
					</div>
				</div>
			)}

			{/* Catalog Overview */}
			{!selectedAgent && (
				<div className="space-y-6">
					<div className="text-sm text-gray-600">{catalog.length} skills available in the catalog across {Object.keys(byCategory).length} categories</div>
					{Object.entries(byCategory).map(([cat, skills]) => (
						<div key={cat}>
							<h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
								<Brain className="size-4 text-gray-400" />
								{categoryLabels[cat] ?? cat} ({skills.length})
							</h3>
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
								{skills.map((s) => (
									<div key={s.slug} className="flex items-center justify-between p-3 rounded-lg border border-gray-100 bg-white">
										<div className="flex-1 min-w-0">
											<div className="text-sm font-medium text-gray-900">{s.name}</div>
											<div className="text-xs text-gray-500 mt-0.5 line-clamp-1">{s.description}</div>
										</div>
										<div className="flex items-center gap-2 ml-3">
											<span className={`text-xs px-2 py-0.5 rounded-full ${
												s.difficulty === "basic" ? "bg-emerald-50 text-emerald-700" :
												s.difficulty === "intermediate" ? "bg-blue-50 text-blue-700" :
												s.difficulty === "advanced" ? "bg-violet-50 text-violet-700" :
												"bg-rose-50 text-rose-700"
											}`}>{s.difficulty}</span>
											<span className="text-xs text-gray-400">{s.trainingTimeHours}h</span>
										</div>
									</div>
								))}
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	);
}

// ══════════════════════════════════════════════════
// COMMS TAB
// ══════════════════════════════════════════════════

function CommsTab() {
	const messages = useQuery(api.agentWorkforce.listMessages, { limit: 50 }) ?? [];
	const updateStatus = useMutation(api.agentWorkforce.updateMessageStatus);
	const [selected, setSelected] = useState<string | null>(null);
	const [filterType, setFilterType] = useState("");

	const filtered = messages.filter((m) => !filterType || m.type === filterType);
	const types = [...new Set(messages.map((m) => m.type))];
	const selectedMsg = messages.find((m) => m.messageId === selected);

	const typeIcons: Record<string, React.ComponentType<{ className?: string }>> = {
		skill_request: BookOpen,
		escalation: AlertTriangle,
		status_update: BarChart3,
		question: MessageSquare,
		alert: Shield,
		performance_review: Star,
		task_report: FileText,
		anomaly: Eye,
	};

	const priorityColors: Record<string, string> = {
		urgent: "bg-red-50 text-red-700 border-red-200",
		high: "bg-amber-50 text-amber-700 border-amber-200",
		normal: "bg-gray-50 text-gray-600 border-gray-200",
		low: "bg-blue-50 text-blue-600 border-blue-200",
	};

	return (
		<div className="flex gap-4 min-h-[500px]">
			{/* Message List */}
			<div className="w-full md:w-2/5 space-y-3">
				<div className="flex gap-2">
					<select value={filterType} onChange={(e) => setFilterType(e.target.value)}
						className="h-9 px-3 rounded-md border border-gray-200 text-sm text-gray-700 bg-white flex-1">
						<option value="">All Types</option>
						{types.map((t) => (
							<option key={t} value={t}>{t.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}</option>
						))}
					</select>
				</div>
				<div className="space-y-1 max-h-[600px] overflow-y-auto">
					{filtered.map((msg) => {
						const Icon = typeIcons[msg.type] ?? Mail;
						return (
							<button
								key={msg.messageId}
								onClick={() => {
									setSelected(msg.messageId);
									if (msg.status === "unread") updateStatus({ messageId: msg.messageId, status: "read" });
								}}
								className={`w-full text-left p-3 rounded-lg transition-colors ${
									selected === msg.messageId ? "bg-gray-100 border border-gray-300" :
									msg.status === "unread" ? "bg-white border border-gray-200 hover:bg-gray-50" :
									"bg-white border border-gray-100 hover:bg-gray-50"
								}`}
							>
								<div className="flex items-start gap-2.5">
									<div className={`size-7 rounded-md flex items-center justify-center mt-0.5 ${
										msg.priority === "urgent" ? "bg-red-100 text-red-600" :
										msg.priority === "high" ? "bg-amber-100 text-amber-600" :
										"bg-gray-100 text-gray-500"
									}`}>
										<Icon className="size-3.5" />
									</div>
									<div className="flex-1 min-w-0">
										<div className="flex items-center gap-2">
											<span className={`text-sm ${msg.status === "unread" ? "font-semibold text-gray-900" : "font-medium text-gray-700"}`}>
												{msg.fromName}
											</span>
											{msg.status === "unread" && <span className="size-2 rounded-full bg-blue-500" />}
										</div>
										<div className="text-xs text-gray-800 mt-0.5 line-clamp-1">{msg.subject}</div>
										<div className="flex items-center gap-2 mt-1">
											<span className={`text-xs px-1.5 py-0.5 rounded border ${priorityColors[msg.priority]}`}>{msg.priority}</span>
											<span className="text-xs text-gray-400">{timeAgo(msg.timestamp)}</span>
										</div>
									</div>
								</div>
							</button>
						);
					})}
				</div>
			</div>

			{/* Message Detail */}
			<div className="hidden md:block flex-1 border border-gray-200 rounded-lg p-5">
				{selectedMsg ? (
					<div className="space-y-4">
						<div className="flex items-center justify-between">
							<div>
								<h3 className="text-lg font-semibold text-gray-900">{selectedMsg.subject}</h3>
								<div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
									<span>From: <strong>{selectedMsg.fromName}</strong> ({selectedMsg.fromAgentId})</span>
									<span className="text-gray-300">|</span>
									<span>To: {selectedMsg.toName}</span>
								</div>
							</div>
							<div className="flex items-center gap-2">
								<span className={`text-xs px-2 py-1 rounded border ${priorityColors[selectedMsg.priority]}`}>{selectedMsg.priority}</span>
								<span className={`text-xs px-2 py-1 rounded ${
									selectedMsg.status === "unread" ? "bg-blue-50 text-blue-700" :
									selectedMsg.status === "resolved" ? "bg-emerald-50 text-emerald-700" :
									"bg-gray-100 text-gray-600"
								}`}>{selectedMsg.status}</span>
							</div>
						</div>
						<div className="text-xs text-gray-400">
							{new Date(selectedMsg.timestamp).toLocaleString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric", hour: "numeric", minute: "2-digit" })}
						</div>
						<hr className="border-gray-100" />
						<div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
							{selectedMsg.body}
						</div>
						<hr className="border-gray-100" />
						<div className="flex gap-2">
							{selectedMsg.status !== "resolved" && (
								<Button size="sm" variant="outline" onClick={() => updateStatus({ messageId: selectedMsg.messageId, status: "resolved" })}>
									<CheckCircle2 className="size-3.5 mr-1" /> Mark Resolved
								</Button>
							)}
						</div>
					</div>
				) : (
					<div className="flex flex-col items-center justify-center h-full text-gray-400 gap-2">
						<Inbox className="size-10" />
						<span className="text-sm">Select a message to view</span>
					</div>
				)}
			</div>
		</div>
	);
}

// ══════════════════════════════════════════════════
// REQUESTS TAB
// ══════════════════════════════════════════════════

function RequestsTab() {
	const requests = useQuery(api.agentWorkforce.listSkillRequests, {}) ?? [];
	const updateRequest = useMutation(api.agentWorkforce.updateSkillRequest);

	const statusColors: Record<string, string> = {
		pending: "bg-amber-50 text-amber-700",
		approved: "bg-blue-50 text-blue-700",
		in_training: "bg-violet-50 text-violet-700",
		completed: "bg-emerald-50 text-emerald-700",
		denied: "bg-red-50 text-red-700",
	};

	return (
		<div className="space-y-4">
			<div className="text-sm text-gray-600">
				{requests.filter((r) => r.status === "pending").length} pending requests
			</div>

			<div className="space-y-3">
				{requests.map((req) => (
					<Card key={req.requestId} className="border-gray-200">
						<CardContent className="py-4 px-5">
							<div className="flex items-start justify-between">
								<div className="flex-1">
									<div className="flex items-center gap-2 mb-1">
										<span className="font-mono text-xs text-gray-400">{req.requestId}</span>
										<span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColors[req.status] ?? "bg-gray-100 text-gray-500"}`}>
											{req.status.replace(/_/g, " ")}
										</span>
										<span className={`text-xs px-1.5 py-0.5 rounded border ${
											req.priority === "urgent" ? "border-red-200 text-red-600" :
											req.priority === "high" ? "border-amber-200 text-amber-600" :
											"border-gray-200 text-gray-500"
										}`}>{req.priority}</span>
									</div>
									<h3 className="text-sm font-semibold text-gray-900">
										{req.agentName} requests: <span className="text-blue-600">{req.skillName}</span>
									</h3>
									<p className="text-sm text-gray-600 mt-1">{req.reason}</p>
									<div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
										<span>Est. training: {req.estimatedTrainingHours}h</span>
										<span>Requested: {new Date(req.createdAt).toLocaleDateString()}</span>
										{req.approvedBy && <span>Approved by: {req.approvedBy}</span>}
									</div>
								</div>

								{req.status === "pending" && (
									<div className="flex gap-2 ml-4">
										<Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white"
											onClick={() => updateRequest({ requestId: req.requestId, status: "approved", approvedBy: "Agency Admin" })}>
											<CheckCircle2 className="size-3.5 mr-1" /> Approve
										</Button>
										<Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50"
											onClick={() => updateRequest({ requestId: req.requestId, status: "denied", denialReason: "Not required at this time" })}>
											<XCircle className="size-3.5 mr-1" /> Deny
										</Button>
									</div>
								)}
								{req.status === "approved" && (
									<Button size="sm" variant="outline" className="ml-4"
										onClick={() => updateRequest({ requestId: req.requestId, status: "in_training" })}>
										<Wrench className="size-3.5 mr-1" /> Start Training
									</Button>
								)}
								{req.status === "in_training" && (
									<Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white ml-4"
										onClick={() => updateRequest({ requestId: req.requestId, status: "completed" })}>
										<CheckCircle2 className="size-3.5 mr-1" /> Complete
									</Button>
								)}
							</div>
						</CardContent>
					</Card>
				))}
			</div>
		</div>
	);
}

// ══════════════════════════════════════════════════
// UTILS
// ══════════════════════════════════════════════════

function timeAgo(ts: number): string {
	const diff = Date.now() - ts;
	const mins = Math.floor(diff / 60000);
	if (mins < 1) return "just now";
	if (mins < 60) return `${mins}m ago`;
	const hours = Math.floor(mins / 60);
	if (hours < 24) return `${hours}h ago`;
	const days = Math.floor(hours / 24);
	if (days < 7) return `${days}d ago`;
	return new Date(ts).toLocaleDateString();
}
