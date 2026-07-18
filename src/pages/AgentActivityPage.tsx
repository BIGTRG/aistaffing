// @ts-nocheck
import { useApiQuery } from "@/lib/hooks";
import { api } from "@/lib/api";
import {
	Activity,
	Bot,
	Clock,
	MessageSquare,
	Phone,
	Mail,
	Globe,
	CheckCircle2,
	AlertTriangle,
	Zap,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";

export function AgentActivityPage() {
	const org = useApiQuery(() => api.organizations.getMine(), []);
	const deployments = useApiQuery(org ? () => api.deployments.listByOrg(org.id) : null, [org]);
	const activity = useApiQuery(org ? () => api.activity.listByOrg(org.id, 50) : null, [org]);
	const conversations = useApiQuery(org ? () => api.conversations.listByOrg(org.id) : null, [org]);

	const [selectedAgent, setSelectedAgent] = useState<string | null>(null);

	// Group activity by deployment
	const activityByAgent = (activity ?? []).reduce(
		(acc, item) => {
			const key = item.deploymentId ?? "general";
			if (!acc[key]) acc[key] = [];
			acc[key].push(item);
			return acc;
		},
		{} as Record<string, typeof activity>,
	);

	// Recent conversations by deployment
	const convByAgent = (conversations ?? []).reduce(
		(acc, item) => {
			const key = item.deploymentId;
			if (!acc[key]) acc[key] = [];
			acc[key].push(item);
			return acc;
		},
		{} as Record<string, typeof conversations>,
	);

	const channelIcon: Record<string, React.ElementType> = {
		chat: MessageSquare,
		phone: Phone,
		email: Mail,
		sms: Globe,
	};

	const outcomeColors: Record<string, { bg: string; text: string }> = {
		resolved: { bg: "bg-emerald-50", text: "text-emerald-700" },
		escalated: { bg: "bg-red-50", text: "text-red-700" },
		sale_closed: { bg: "bg-blue-50", text: "text-blue-700" },
		appointment_booked: { bg: "bg-purple-50", text: "text-purple-700" },
		follow_up: { bg: "bg-amber-50", text: "text-amber-700" },
	};

	const filteredDeployments = selectedAgent
		? deployments?.filter((d) => d.id === selectedAgent)
		: deployments;

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold tracking-tight text-gray-900">
						Agent Activity
					</h1>
					<p className="text-gray-500">
						Live view of what your AI agents are handling.
					</p>
				</div>
				<div className="flex items-center gap-2">
					<div className="flex items-center gap-1.5 text-xs text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full">
						<span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
						Live
					</div>
				</div>
			</div>

			{/* Agent Filter Bar */}
			<div className="flex gap-2 flex-wrap">
				<button
					onClick={() => setSelectedAgent(null)}
					className={`px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
						!selectedAgent
							? "bg-slate-800 text-white"
							: "bg-gray-100 text-gray-600 hover:bg-gray-200"
					}`}
				>
					All Agents
				</button>
				{deployments?.map((d) => (
					<button
						key={d.id}
						onClick={() => setSelectedAgent(d.id)}
						className={`px-3 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
							selectedAgent === d.id
								? "bg-slate-800 text-white"
								: "bg-gray-100 text-gray-600 hover:bg-gray-200"
						}`}
					>
						<span
							className={`size-2 rounded-full ${
								d.status === "active"
									? "bg-emerald-500"
									: d.status === "paused"
										? "bg-amber-500"
										: "bg-gray-400"
							}`}
						/>
						{d.displayName}
					</button>
				))}
			</div>

			{/* Agent Cards with Activity */}
			<div className="space-y-4">
				{filteredDeployments?.map((d) => {
					const agentActivity = activityByAgent[d.id] ?? [];
					const agentConvs = convByAgent[d.id] ?? [];
					const recentConvs = agentConvs.slice(0, 5);
					const totalConvs = agentConvs.length;
					const resolvedConvs = agentConvs.filter(
						(c) => c.outcome === "resolved",
					).length;

					return (
						<Card key={d.id} className="border-gray-200">
							<CardHeader className="pb-3">
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-3">
										<div
											className={`size-10 rounded-xl flex items-center justify-center ${
												d.status === "active"
													? "bg-emerald-50"
													: "bg-gray-100"
											}`}
										>
											<Bot
												className={`size-5 ${
													d.status === "active"
														? "text-emerald-600"
														: "text-gray-400"
												}`}
											/>
										</div>
										<div>
											<CardTitle className="text-base text-gray-900">
												{d.displayName}
											</CardTitle>
											<p className="text-xs text-gray-500">
												{d.template?.department ?? "Agent"} ·{" "}
												{d.template?.name ?? ""}
											</p>
										</div>
									</div>
									<div className="flex items-center gap-3">
										{/* Quick stats */}
										<div className="flex items-center gap-4 text-xs text-gray-500">
											<span className="flex items-center gap-1">
												<MessageSquare className="size-3.5" />
												{totalConvs} convos
											</span>
											<span className="flex items-center gap-1">
												<CheckCircle2 className="size-3.5 text-emerald-500" />
												{resolvedConvs} resolved
											</span>
										</div>
										<span
											className={`text-xs font-medium px-2.5 py-1 rounded-full ${
												d.status === "active"
													? "bg-emerald-50 text-emerald-700"
													: d.status === "paused"
														? "bg-amber-50 text-amber-700"
														: "bg-gray-100 text-gray-500"
											}`}
										>
											{d.status === "active"
												? "🟢 Active"
												: d.status === "paused"
													? "⏸ Paused"
													: d.status}
										</span>
									</div>
								</div>
							</CardHeader>
							<CardContent>
								<div className="grid lg:grid-cols-2 gap-4">
									{/* Recent Conversations */}
									<div>
										<h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
											Recent Conversations
										</h4>
										{recentConvs.length > 0 ? (
											<div className="space-y-2">
												{recentConvs.map((conv) => {
													const ChannelIcon =
														channelIcon[conv.channel] ?? MessageSquare;
													const colors =
														outcomeColors[conv.outcome ?? ""] ?? {
															bg: "bg-gray-50",
															text: "text-gray-600",
														};
													return (
														<div
															key={conv.id}
															className="flex items-center gap-3 p-2.5 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
														>
															<div className="size-8 rounded-lg bg-white flex items-center justify-center border border-gray-200">
																<ChannelIcon className="size-3.5 text-gray-500" />
															</div>
															<div className="flex-1 min-w-0">
																<p className="text-sm text-gray-900 truncate">
																	{conv.contactName ??
																		conv.contactInfo ??
																		"Unknown Contact"}
																</p>
																<p className="text-xs text-gray-400 truncate">
																	{conv.summary ?? conv.channel}
																</p>
															</div>
															<div className="flex items-center gap-2">
																{conv.outcome && (
																	<span
																		className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${colors.bg} ${colors.text}`}
																	>
																		{conv.outcome.replace("_", " ")}
																	</span>
																)}
																<span className="text-[10px] text-gray-400">
																	{new Date(
																		conv.startedAt,
																	).toLocaleDateString()}
																</span>
															</div>
														</div>
													);
												})}
											</div>
										) : (
											<div className="flex items-center gap-2 text-sm text-gray-400 py-4">
												<Clock className="size-4" />
												No conversations yet
											</div>
										)}
									</div>

									{/* Activity Log */}
									<div>
										<h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
											Activity Log
										</h4>
										{agentActivity.length > 0 ? (
											<div className="space-y-2">
												{agentActivity.slice(0, 5).map((event) => {
													const eventIcons: Record<
														string,
														React.ElementType
													> = {
														"agent.deployed": Bot,
														"agent.configured": Zap,
														"agent.paused": Clock,
														"agent.resumed": CheckCircle2,
														"agent.terminated": AlertTriangle,
														"call.completed": Phone,
														"email.drafted": Mail,
														"sale.closed": Zap,
													};
													const EventIcon =
														eventIcons[event.eventType] ?? Activity;
													return (
														<div
															key={event.id}
															className="flex items-start gap-2.5 p-2.5 rounded-lg bg-gray-50"
														>
															<div className="size-6 rounded-full bg-white flex items-center justify-center flex-shrink-0 mt-0.5 border border-gray-200">
																<EventIcon className="size-3 text-gray-500" />
															</div>
															<div className="flex-1 min-w-0">
																<p className="text-xs text-gray-700">
																	{event.title}
																</p>
																<p className="text-[10px] text-gray-400">
																	{new Date(
																		event._creationTime,
																	).toLocaleString()}
																</p>
															</div>
														</div>
													);
												})}
											</div>
										) : (
											<div className="flex items-center gap-2 text-sm text-gray-400 py-4">
												<Activity className="size-4" />
												No activity yet
											</div>
										)}
									</div>
								</div>
							</CardContent>
						</Card>
					);
				})}

				{(!filteredDeployments || filteredDeployments.length === 0) && (
					<div className="text-center py-16">
						<div className="size-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
							<Bot className="size-8 text-gray-400" />
						</div>
						<p className="font-medium text-gray-700">No agents deployed</p>
						<p className="text-sm text-gray-500 mt-1">
							Deploy agents from the Agent Roster to see their activity here.
						</p>
					</div>
				)}
			</div>
		</div>
	);
}
