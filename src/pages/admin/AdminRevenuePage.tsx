import { useApiQuery } from "@/lib/hooks";
import { api } from "@/lib/api";
import { DollarSign, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function AdminRevenuePage() {
	const revenue = useApiQuery(() => api.billing.revenueOverview(), []);
	const contracts = useApiQuery(() => api.billing.listAllContracts(), []) ?? [];

	const activeContracts = contracts.filter((c) => c.status === "active");

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-2xl font-bold tracking-tight text-gray-900">Revenue</h1>
				<p className="text-gray-500">Platform-wide revenue and contract overview</p>
			</div>

			<div className="grid gap-4 sm:grid-cols-3">
				<Card className="border-gray-200 bg-slate-900 text-white">
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium text-slate-300 flex items-center justify-between">
							MRR
							<DollarSign className="size-4 text-amber-400" />
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-3xl font-bold">{revenue?.formattedMRR ?? "$0"}</div>
					</CardContent>
				</Card>

				<Card className="border-gray-200">
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium text-gray-500 flex items-center justify-between">
							Total Revenue
							<TrendingUp className="size-4 text-emerald-600" />
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-3xl font-bold text-gray-900">{revenue?.formattedRevenue ?? "$0"}</div>
					</CardContent>
				</Card>

				<Card className="border-gray-200">
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium text-gray-500">Active Contracts</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-3xl font-bold text-gray-900">{activeContracts.length}</div>
					</CardContent>
				</Card>
			</div>

			<Card className="border-gray-200">
				<CardHeader>
					<CardTitle className="text-gray-900">Active Contracts</CardTitle>
				</CardHeader>
				<CardContent>
					{activeContracts.length > 0 ? (
						<div className="divide-y divide-gray-100">
							{activeContracts.map((c) => (
								<div key={c.id} className="flex items-center justify-between py-3">
									<div>
										<p className="font-medium text-sm text-gray-900">
											{c.org?.name ?? "Unknown"} — {c.deployment?.displayName ?? "Unknown Agent"}
										</p>
										<p className="text-xs text-gray-500">
											{c.tier} • Started {new Date(c.startsAt).toLocaleDateString()}
										</p>
									</div>
									<span className="text-sm font-semibold text-gray-900">
										${(c.monthlyRateCents / 100).toLocaleString()}/mo
									</span>
								</div>
							))}
						</div>
					) : (
						<div className="text-center py-8">
							<p className="text-sm text-gray-500">No active contracts.</p>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
