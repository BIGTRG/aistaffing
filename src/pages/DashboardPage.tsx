// @ts-nocheck
import { useApiQuery } from "@/lib/hooks";
import { api } from "@/lib/api";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import {
	Activity,
	Bot,
	Clock,
	DollarSign,
	Mail,
	MessageSquare,
	Pause,
	Phone,
	Play,
	Plus,
	TrendingUp,
	Users,
	Zap,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TestAgentChat } from "@/components/TestAgentChat";
import { AgentConfigPanel } from "@/components/AgentConfigPanel";

export function DashboardPage() {
	const navigate = useNavigate();
	const org = useApiQuery(() => api.organizations.getMine(), []);
	const deployments = useApiQuery(org ? () => api.deployments.listByOrg(org.id) : null, [org]);
	const activityItems = useApiQuery(org ? () => api.activity.listByOrg(org.id, 10) : null, [org]);
	const activityStats = useApiQuery(org ? () => api.activity.stats(org.id) : null, [org]);
	const spendSummary = useApiQuery(org ? () => api.billing.spend(org.id) : null, [org]);
	const updateStatus = async (...args: any[]) => api.deployments.updateStatus(...args);

	// Test chat state
	const [testChatDeployment, setTestChatDeployment] = useState<any>(null);
	// Config panel state
	const [configDeployment, setConfigDeployment] = useState<any>(null);

	// If no org yet, redirect to onboarding
	if (org === null) {
		navigate("/onboarding");  // onboarding stays at top level
		return null;
	}

	const activeAgents = deployments?.filter((d) => d.status === "active") ?? [];

	const stats = [
		{
			label: "Active Agents",
			value: activeAgents.length.toString(),
			icon: Bot,
			color: "text-slate-800",
			bg: "bg-slate-50",
		},
		{
			label: "Calls Handled",
			value: (activityStats?.callsHandled ?? 0).toString(),
			icon: Phone,
			color: "text-emerald-600",
			bg: "bg-emerald-50",
		},
		{
			label: "Emails Processed",
			value: (activityStats?.emailsProcessed ?? 0).toString(),
			icon: Mail,
			color: "text-purple-600",
			bg: "bg-purple-50",
		},
		{
			label: "Monthly Spend",
			value: spendSummary?.formattedTotal ?? "$0",
			icon: DollarSign,
			color: "text-amber-700",
			bg: "bg-amber-50",
		},
	];

	const handleToggle = async (
		deploymentId: string,
		currentStatus: string,
	) => {
		const newStatus = currentStatus === "active" ? "paused" : "active";
		await updateStatus({
			deploymentId: deploymentId as any,
			status: newStatus,
		});
	};

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold tracking-tight text-gray-900">
						Dashboard
					</h1>
					<p className="text-gray-500">
						{org?.name
							? `${org.name} — Your AI workforce at a glance.`
							: "Your AI workforce at a glance."}
					</p>
				</div>
				<Link to="/employer/agents">
					<Button className="bg-slate-800 hover:bg-slate-900 text-white">
						<Plus className="size-4 mr-2" />
						Add Agent
					</Button>
				</Link>
			</div>

			{/* Stats Grid */}
			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
				{stats.map((stat) => (
					<Card key={stat.label} className="border-gray-200">
						<CardHeader className="flex flex-row items-center justify-between pb-2">
							<CardTitle className="text-sm font-medium text-gray-500">
								{stat.label}
							</CardTitle>
							<div
								className={`inline-flex size-9 items-center justify-center rounded-lg ${stat.bg}`}
							>
								<stat.icon className={`size-4 ${stat.color}`} />
							</div>
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold text-gray-900">
								{stat.value}
							</div>
						</CardContent>
					</Card>
				))}
			</div>

			{/* My Agents + Activity */}
			<div className="grid gap-4 lg:grid-cols-2">
				{/* Agent List */}
				<Card className="border-gray-200">
					<CardHeader>
						<CardTitle className="flex items-center gap-2 text-gray-900">
							<Users className="size-5 text-slate-800" />
							My Agents
						</CardTitle>
					</CardHeader>
					<CardContent>
						{deployments && deployments.length > 0 ? (
							<div className="divide-y divide-gray-100">
								{deployments.map((d) => (
									<div
										key={d.id}
										className="flex items-center justify-between py-3"
									>
										<div className="flex items-center gap-3">
											<div
												className={`size-9 rounded-lg flex items-center justify-center ${
													d.status === "active"
														? "bg-emerald-50"
														: d.status === "paused"
															? "bg-amber-50"
															: "bg-gray-100"
												}`}
											>
												<Bot
													className={`size-4 ${
														d.status === "active"
															? "text-emerald-600"
															: d.status === "paused"
																? "text-amber-600"
																: "text-gray-400"
													}`}
												/>
											</div>
											<div>
												<p className="font-medium text-sm text-gray-900">
													{d.displayName}
												</p>
												<p className="text-xs text-gray-500">
													{d.template?.department ?? "Agent"}
												</p>
											</div>
										</div>
										<div className="flex items-center gap-2">
											{/* Configure Button */}
											<button
												onClick={() => setConfigDeployment(d)}
												className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors"
												title="Configure this agent"
											>
												<Zap className="size-3" />
												Configure
											</button>
											{/* Test Chat Button */}
											<button
												onClick={() => setTestChatDeployment(d)}
												className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
												title="Test this agent"
											>
												<MessageSquare className="size-3" />
												Test
											</button>
											<span
												className={`text-xs font-medium px-2 py-0.5 rounded-full ${
													d.status === "active"
														? "bg-emerald-50 text-emerald-700"
														: d.status === "paused"
															? "bg-amber-50 text-amber-700"
															: "bg-gray-100 text-gray-500"
												}`}
											>
												{d.status}
											</span>
											{d.status !== "terminated" && (
												<button
													onClick={() =>
														handleToggle(d.id, d.status)
													}
													className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
													title={
														d.status === "active"
															? "Pause"
															: "Resume"
													}
												>
													{d.status === "active" ? (
														<Pause className="size-3.5 text-gray-500" />
													) : (
														<Play className="size-3.5 text-emerald-600" />
													)}
												</button>
											)}
										</div>
									</div>
								))}
							</div>
						) : (
							<div className="flex flex-col items-center justify-center py-8 text-center">
								<div className="size-14 rounded-2xl bg-gray-100 flex items-center justify-center mb-3">
									<Bot className="size-7 text-gray-400" />
								</div>
								<p className="text-sm font-medium text-gray-700">
									No agents deployed yet
								</p>
								<p className="text-xs text-gray-500 mt-1 mb-4">
									Your AI staff will appear here once deployed.
								</p>
								<Link to="/employer/agents">
									<Button
										size="sm"
										className="bg-slate-800 hover:bg-slate-900 text-white"
									>
										<Plus className="size-3.5 mr-1.5" />
										Deploy Your First Agent
									</Button>
								</Link>
							</div>
						)}
					</CardContent>
				</Card>

				{/* Activity Feed */}
				<Card className="border-gray-200">
					<CardHeader>
						<CardTitle className="flex items-center gap-2 text-gray-900">
							<Activity className="size-5 text-amber-700" />
							Recent Activity
						</CardTitle>
					</CardHeader>
					<CardContent>
						{activityItems && activityItems.length > 0 ? (
							<div className="space-y-3">
								{activityItems.map((item) => (
									<div
										key={item.id}
										className="flex items-start gap-3"
									>
										<div className="size-8 rounded-lg bg-slate-50 flex items-center justify-center flex-shrink-0 mt-0.5">
											<Zap className="size-3.5 text-slate-600" />
										</div>
										<div>
											<p className="text-sm text-gray-900">
												{item.title}
											</p>
											<p className="text-xs text-gray-400">
												{new Date(
													item._creationTime,
												).toLocaleString()}
											</p>
										</div>
									</div>
								))}
							</div>
						) : (
							<div className="flex flex-col items-center justify-center py-8 text-center">
								<div className="size-14 rounded-2xl bg-gray-100 flex items-center justify-center mb-3">
									<Clock className="size-7 text-gray-400" />
								</div>
								<p className="text-sm font-medium text-gray-700">
									No activity yet
								</p>
								<p className="text-xs text-gray-500 mt-1">
									Calls, emails, and sales will appear in
									real-time.
								</p>
							</div>
						)}
					</CardContent>
				</Card>
			</div>

			{/* Performance Preview */}
			<Card className="border-gray-200">
				<CardHeader>
					<CardTitle className="flex items-center gap-2 text-gray-900">
						<TrendingUp className="size-5 text-emerald-600" />
						Performance Overview
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-3 gap-6">
						<div className="text-center py-6">
							<div className="text-3xl font-bold text-gray-900">
								{activityStats?.totalConversations ?? 0}
							</div>
							<p className="text-sm text-gray-500 mt-1">
								Total Conversations
							</p>
						</div>
						<div className="text-center py-6">
							<div className="text-3xl font-bold text-gray-900">
								{activeAgents.length}
							</div>
							<p className="text-sm text-gray-500 mt-1">
								Agents Working
							</p>
						</div>
						<div className="text-center py-6">
							<div className="text-3xl font-bold text-gray-900">
								{spendSummary?.formattedTotal ?? "$0"}
							</div>
							<p className="text-sm text-gray-500 mt-1">
								Monthly Investment
							</p>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Test Agent Chat Dialog */}
			{testChatDeployment && (
				<TestAgentChat
					open={!!testChatDeployment}
					onOpenChange={(open) => {
						if (!open) setTestChatDeployment(null);
					}}
					deployment={testChatDeployment}
					orgName={org?.name ?? "Our Business"}
					orgIndustry={org?.industry ?? ""}
				/>
			)}

			{/* Agent Config Panel */}
			{configDeployment && (
				<AgentConfigPanel
					open={!!configDeployment}
					onOpenChange={(open) => {
						if (!open) setConfigDeployment(null);
					}}
					deployment={configDeployment}
				/>
			)}
		</div>
	);
}
