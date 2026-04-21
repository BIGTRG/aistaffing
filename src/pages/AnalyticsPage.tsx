import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import {
	BarChart3,
	Bot,
	Clock,
	MessageSquare,
	Phone,
	TrendingUp,
	Users,
	Zap,
	CheckCircle2,
	AlertTriangle,

	Activity,
	Mail,
	Globe,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function AnalyticsPage() {
	const org = useQuery(api.organizations.getMine);
	const stats = useQuery(
		api.conversations.stats,
		org ? { orgId: org._id } : "skip",
	);
	const deployments = useQuery(
		api.deployments.listByOrg,
		org ? { orgId: org._id } : "skip",
	);
	const activity = useQuery(
		api.activity.listByOrg,
		org ? { orgId: org._id, limit: 20 } : "skip",
	);

	const activeAgents = deployments?.filter((d) => d.status === "active").length ?? 0;

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-2xl font-bold tracking-tight text-gray-900">
					Analytics Dashboard
				</h1>
				<p className="text-gray-500">
					Performance insights across all your AI agents.
				</p>
			</div>

			{/* KPI Cards */}
			<div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
				<KpiCard
					icon={MessageSquare}
					iconColor="text-blue-600"
					iconBg="bg-blue-50"
					label="Total Conversations"
					value={stats?.total ?? 0}
					subtext={`${stats?.thisWeek ?? 0} this week`}
				/>
				<KpiCard
					icon={Bot}
					iconColor="text-slate-700"
					iconBg="bg-slate-100"
					label="Active Agents"
					value={activeAgents}
					subtext={`${deployments?.length ?? 0} total deployed`}
				/>
				<KpiCard
					icon={Clock}
					iconColor="text-emerald-600"
					iconBg="bg-emerald-50"
					label="Avg Response Time"
					value={stats?.avgDurationSeconds ? `${Math.floor(stats.avgDurationSeconds / 60)}m ${stats.avgDurationSeconds % 60}s` : "—"}
					subtext="per conversation"
				/>
				<KpiCard
					icon={CheckCircle2}
					iconColor="text-purple-600"
					iconBg="bg-purple-50"
					label="Resolution Rate"
					value={
						stats && stats.total > 0
							? `${Math.round(((stats.resolved) / stats.total) * 100)}%`
							: "—"
					}
					subtext={`${stats?.resolved ?? 0} resolved`}
				/>
			</div>

			{/* Channel Breakdown & Outcomes */}
			<div className="grid lg:grid-cols-2 gap-4">
				{/* Channel Breakdown */}
				<Card className="border-gray-200">
					<CardHeader>
						<CardTitle className="flex items-center gap-2 text-gray-900 text-base">
							<BarChart3 className="size-5 text-slate-700" />
							Conversations by Channel
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-4">
							{[
								{ key: "chat", label: "Live Chat", icon: MessageSquare, color: "bg-blue-500" },
								{ key: "phone", label: "Phone", icon: Phone, color: "bg-emerald-500" },
								{ key: "email", label: "Email", icon: Mail, color: "bg-purple-500" },
								{ key: "sms", label: "SMS", icon: Globe, color: "bg-amber-500" },
							].map(({ key, label, icon: Icon, color }) => {
								const count = stats?.byChannel?.[key] ?? 0;
								const pct = stats && stats.total > 0 ? (count / stats.total) * 100 : 0;
								return (
									<div key={key} className="flex items-center gap-3">
										<div className="size-8 rounded-lg bg-gray-50 flex items-center justify-center">
											<Icon className="size-4 text-gray-600" />
										</div>
										<div className="flex-1">
											<div className="flex items-center justify-between mb-1">
												<span className="text-sm font-medium text-gray-700">{label}</span>
												<span className="text-sm text-gray-500">{count}</span>
											</div>
											<div className="h-2 bg-gray-100 rounded-full overflow-hidden">
												<div
													className={`h-full rounded-full ${color} transition-all`}
													style={{ width: `${pct}%` }}
												/>
											</div>
										</div>
									</div>
								);
							})}
						</div>
					</CardContent>
				</Card>

				{/* Outcomes */}
				<Card className="border-gray-200">
					<CardHeader>
						<CardTitle className="flex items-center gap-2 text-gray-900 text-base">
							<TrendingUp className="size-5 text-slate-700" />
							Conversation Outcomes
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="grid grid-cols-2 gap-3">
							{[
								{ key: "resolved", label: "Resolved", icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
								{ key: "escalated", label: "Escalated", icon: AlertTriangle, color: "text-red-600", bg: "bg-red-50" },
								{ key: "sale_closed", label: "Sales Closed", icon: Zap, color: "text-blue-600", bg: "bg-blue-50" },
								{ key: "appointment_booked", label: "Appointments", icon: Users, color: "text-purple-600", bg: "bg-purple-50" },
								{ key: "follow_up", label: "Follow-ups", icon: Activity, color: "text-amber-600", bg: "bg-amber-50" },
							].map(({ key, label, icon: Icon, color, bg }) => {
								const count = stats?.byOutcome?.[key] ?? 0;
								return (
									<div key={key} className={`rounded-lg ${bg} p-3`}>
										<div className="flex items-center gap-2 mb-1">
											<Icon className={`size-4 ${color}`} />
											<span className="text-xs text-gray-600">{label}</span>
										</div>
										<p className={`text-xl font-bold ${color}`}>{count}</p>
									</div>
								);
							})}
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Agent Performance & Recent Activity */}
			<div className="grid lg:grid-cols-2 gap-4">
				{/* Agent Performance */}
				<Card className="border-gray-200">
					<CardHeader>
						<CardTitle className="flex items-center gap-2 text-gray-900 text-base">
							<Bot className="size-5 text-slate-700" />
							Agent Performance
						</CardTitle>
					</CardHeader>
					<CardContent>
						{deployments && deployments.length > 0 ? (
							<div className="divide-y divide-gray-100">
								{deployments.map((d) => (
									<div key={d._id} className="flex items-center gap-3 py-3">
										<div className="size-9 rounded-lg bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center">
											<span className="text-white text-xs font-bold">
												{d.displayName.slice(0, 2).toUpperCase()}
											</span>
										</div>
										<div className="flex-1 min-w-0">
											<p className="text-sm font-medium text-gray-900 truncate">
												{d.displayName}
											</p>
											<p className="text-xs text-gray-500">
												{d.template?.name ?? "Agent"} · {d.template?.department ?? ""}
											</p>
										</div>
										<div className="flex items-center gap-2">
											<span
												className={`text-xs px-2 py-0.5 rounded-full font-medium ${
													d.status === "active"
														? "bg-emerald-50 text-emerald-700"
														: d.status === "paused"
														? "bg-amber-50 text-amber-700"
														: "bg-gray-100 text-gray-600"
												}`}
											>
												{d.status}
											</span>
										</div>
									</div>
								))}
							</div>
						) : (
							<div className="flex flex-col items-center justify-center py-8 text-center">
								<Bot className="size-8 text-gray-300 mb-2" />
								<p className="text-sm text-gray-500">No agents deployed</p>
							</div>
						)}
					</CardContent>
				</Card>

				{/* Activity Feed */}
				<Card className="border-gray-200">
					<CardHeader>
						<CardTitle className="flex items-center gap-2 text-gray-900 text-base">
							<Activity className="size-5 text-slate-700" />
							Recent Activity
						</CardTitle>
					</CardHeader>
					<CardContent>
						{activity && activity.length > 0 ? (
							<div className="space-y-3">
								{activity.slice(0, 10).map((event) => {
									const eventIcons: Record<string, React.ElementType> = {
										"agent.deployed": Bot,
										"agent.configured": Zap,
										"agent.paused": Clock,
										"agent.resumed": CheckCircle2,
										"agent.terminated": AlertTriangle,
										"call.completed": Phone,
										"email.drafted": Mail,
										"sale.closed": TrendingUp,
									};
									const EventIcon = eventIcons[event.eventType] ?? Activity;
									return (
										<div key={event._id} className="flex items-start gap-3">
											<div className="size-7 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
												<EventIcon className="size-3.5 text-gray-600" />
											</div>
											<div className="flex-1 min-w-0">
												<p className="text-sm text-gray-700">{event.title}</p>
												<p className="text-xs text-gray-400">
													{new Date(event._creationTime).toLocaleString()}
												</p>
											</div>
										</div>
									);
								})}
							</div>
						) : (
							<div className="flex flex-col items-center justify-center py-8 text-center">
								<Activity className="size-8 text-gray-300 mb-2" />
								<p className="text-sm text-gray-500">No activity yet</p>
							</div>
						)}
					</CardContent>
				</Card>
			</div>
		</div>
	);
}

function KpiCard({
	icon: Icon,
	iconColor,
	iconBg,
	label,
	value,
	subtext,
}: {
	icon: React.ElementType;
	iconColor: string;
	iconBg: string;
	label: string;
	value: string | number;
	subtext: string;
}) {
	return (
		<Card className="border-gray-200">
			<CardContent className="p-4">
				<div className="flex items-center gap-3">
					<div className={`size-10 rounded-xl ${iconBg} flex items-center justify-center`}>
						<Icon className={`size-5 ${iconColor}`} />
					</div>
					<div>
						<p className="text-xs text-gray-500">{label}</p>
						<p className="text-xl font-bold text-gray-900">{value}</p>
						<p className="text-xs text-gray-400">{subtext}</p>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
