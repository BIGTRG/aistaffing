import { useApiQuery } from "@/lib/hooks";
import { api } from "@/lib/api";
import {
	Bot,
	Building2,
	DollarSign,
	TrendingUp,
	Zap,
	ArrowUpRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";

export function AdminDashboardPage() {
	const orgs = useApiQuery(() => api.organizations.listAll(), []) ?? [];
	const allDeployments = useApiQuery(() => api.deployments.listAll(), []) ?? [];
	const revenue = useApiQuery(() => api.billing.revenueOverview(), []);
	const recentActivity = useApiQuery(() => api.activity.listAll(20), []) ?? [];

	const activeOrgs = orgs.filter((o) => o.onboardingStatus === "active");
	const activeDeployments = allDeployments.filter((d) => d.status === "active");

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-2xl font-bold tracking-tight text-gray-900">
					Platform Overview
				</h1>
				<p className="text-gray-500">
					AI Staffing Agency management dashboard
				</p>
			</div>

			{/* Revenue Stats */}
			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
				<Card className="border-gray-200 bg-slate-900 text-white">
					<CardHeader className="flex flex-row items-center justify-between pb-2">
						<CardTitle className="text-sm font-medium text-slate-300">
							Monthly Recurring Revenue
						</CardTitle>
						<DollarSign className="size-4 text-amber-400" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{revenue?.formattedMRR ?? "$0"}
						</div>
						<p className="text-xs text-slate-400 mt-1">
							{revenue?.activeContracts ?? 0} active contracts
						</p>
					</CardContent>
				</Card>

				<Card className="border-gray-200">
					<CardHeader className="flex flex-row items-center justify-between pb-2">
						<CardTitle className="text-sm font-medium text-gray-500">
							Total Clients
						</CardTitle>
						<Building2 className="size-4 text-slate-800" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold text-gray-900">
							{activeOrgs.length}
						</div>
						<p className="text-xs text-gray-500 mt-1">
							{orgs.length} total accounts
						</p>
					</CardContent>
				</Card>

				<Card className="border-gray-200">
					<CardHeader className="flex flex-row items-center justify-between pb-2">
						<CardTitle className="text-sm font-medium text-gray-500">
							Agents Deployed
						</CardTitle>
						<Bot className="size-4 text-emerald-600" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold text-gray-900">
							{activeDeployments.length}
						</div>
						<p className="text-xs text-gray-500 mt-1">
							{allDeployments.length} total deployments
						</p>
					</CardContent>
				</Card>

				<Card className="border-gray-200">
					<CardHeader className="flex flex-row items-center justify-between pb-2">
						<CardTitle className="text-sm font-medium text-gray-500">
							Total Revenue
						</CardTitle>
						<TrendingUp className="size-4 text-amber-700" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold text-gray-900">
							{revenue?.formattedRevenue ?? "$0"}
						</div>
						<p className="text-xs text-gray-500 mt-1">
							All-time collected
						</p>
					</CardContent>
				</Card>
			</div>

			<div className="grid gap-4 lg:grid-cols-2">
				{/* Client List */}
				<Card className="border-gray-200">
					<CardHeader className="flex flex-row items-center justify-between">
						<CardTitle className="flex items-center gap-2 text-gray-900">
							<Building2 className="size-5 text-slate-800" />
							Recent Clients
						</CardTitle>
						<Link to="/admin/clients" className="text-xs text-amber-600 hover:text-amber-700 font-medium flex items-center gap-1">
							View all <ArrowUpRight className="size-3" />
						</Link>
					</CardHeader>
					<CardContent>
						{orgs.length > 0 ? (
							<div className="divide-y divide-gray-100">
								{orgs.slice(0, 8).map((org) => {
									const orgDeps = allDeployments.filter(
										(d) => d.orgId === org.id && d.status === "active"
									);
									return (
										<div key={org.id} className="flex items-center justify-between py-3">
											<div>
												<p className="font-medium text-sm text-gray-900">{org.name}</p>
												<p className="text-xs text-gray-500">
													{org.industry} — {orgDeps.length} active agent{orgDeps.length !== 1 ? "s" : ""}
												</p>
											</div>
											<span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
												org.onboardingStatus === "active"
													? "bg-emerald-50 text-emerald-700"
													: org.onboardingStatus === "onboarding"
														? "bg-amber-50 text-amber-700"
														: "bg-gray-100 text-gray-500"
											}`}>
												{org.onboardingStatus}
											</span>
										</div>
									);
								})}
							</div>
						) : (
							<div className="text-center py-8">
								<p className="text-sm text-gray-500">No clients yet.</p>
							</div>
						)}
					</CardContent>
				</Card>

				{/* All Deployments */}
				<Card className="border-gray-200">
					<CardHeader className="flex flex-row items-center justify-between">
						<CardTitle className="flex items-center gap-2 text-gray-900">
							<Bot className="size-5 text-emerald-600" />
							Recent Deployments
						</CardTitle>
						<Link to="/admin/deployments" className="text-xs text-amber-600 hover:text-amber-700 font-medium flex items-center gap-1">
							View all <ArrowUpRight className="size-3" />
						</Link>
					</CardHeader>
					<CardContent>
						{allDeployments.length > 0 ? (
							<div className="divide-y divide-gray-100">
								{allDeployments.slice(0, 10).map((d) => (
									<div key={d.id} className="flex items-center justify-between py-3">
										<div>
											<p className="font-medium text-sm text-gray-900">{d.displayName}</p>
											<p className="text-xs text-gray-500">
												{d.org?.name ?? "Unknown"} — {d.template?.department ?? ""}
											</p>
										</div>
										<span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
											d.status === "active"
												? "bg-emerald-50 text-emerald-700"
												: d.status === "paused"
													? "bg-amber-50 text-amber-700"
													: "bg-gray-100 text-gray-500"
										}`}>
											{d.status}
										</span>
									</div>
								))}
							</div>
						) : (
							<div className="text-center py-8">
								<p className="text-sm text-gray-500">No deployments yet.</p>
							</div>
						)}
					</CardContent>
				</Card>
			</div>

			{/* Activity Stream */}
			<Card className="border-gray-200">
				<CardHeader>
					<CardTitle className="flex items-center gap-2 text-gray-900">
						<Zap className="size-5 text-amber-700" />
						Platform Activity
					</CardTitle>
				</CardHeader>
				<CardContent>
					{recentActivity.length > 0 ? (
						<div className="space-y-3">
							{recentActivity.map((item) => (
								<div key={item.id} className="flex items-start gap-3">
									<div className="size-8 rounded-lg bg-slate-50 flex items-center justify-center flex-shrink-0 mt-0.5">
										<Zap className="size-3.5 text-slate-600" />
									</div>
									<div>
										<p className="text-sm text-gray-900">{item.title}</p>
										<p className="text-xs text-gray-400">
											{new Date(item._creationTime).toLocaleString()}
										</p>
									</div>
								</div>
							))}
						</div>
					) : (
						<div className="text-center py-8">
							<p className="text-sm text-gray-500">No platform activity yet.</p>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
