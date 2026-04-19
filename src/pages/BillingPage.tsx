import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import {
	CreditCard,
	DollarSign,
	FileText,
	ExternalLink,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function BillingPage() {
	const org = useQuery(api.organizations.getMine);
	const contracts = useQuery(
		api.billing.contractsByOrg,
		org ? { orgId: org._id } : "skip"
	);
	const invoices = useQuery(
		api.billing.invoicesByOrg,
		org ? { orgId: org._id } : "skip"
	);
	const spend = useQuery(
		api.billing.spendSummary,
		org ? { orgId: org._id } : "skip"
	);

	const activeContracts = contracts?.filter((c) => c.status === "active") ?? [];

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold tracking-tight text-gray-900">
						Billing
					</h1>
					<p className="text-gray-500">
						Manage your subscriptions and payment history.
					</p>
				</div>
				<Button
					variant="outline"
					className="border-gray-300"
					onClick={() =>
						window.open("https://trgpay.com", "_blank")
					}
				>
					<ExternalLink className="size-4 mr-2" />
					Payment Portal
				</Button>
			</div>

			{/* Spend Summary */}
			<div className="grid gap-4 sm:grid-cols-3">
				<Card className="border-gray-200">
					<CardHeader className="flex flex-row items-center justify-between pb-2">
						<CardTitle className="text-sm font-medium text-gray-500">
							Monthly Total
						</CardTitle>
						<DollarSign className="size-4 text-amber-700" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold text-gray-900">
							{spend?.formattedTotal ?? "$0"}
						</div>
						<p className="text-xs text-gray-500 mt-1">
							{spend?.activeContractCount ?? 0} active contracts
						</p>
					</CardContent>
				</Card>

				<Card className="border-gray-200">
					<CardHeader className="flex flex-row items-center justify-between pb-2">
						<CardTitle className="text-sm font-medium text-gray-500">
							Active Agents
						</CardTitle>
						<CreditCard className="size-4 text-slate-800" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold text-gray-900">
							{activeContracts.length}
						</div>
						<p className="text-xs text-gray-500 mt-1">
							Currently billed
						</p>
					</CardContent>
				</Card>

				<Card className="border-gray-200">
					<CardHeader className="flex flex-row items-center justify-between pb-2">
						<CardTitle className="text-sm font-medium text-gray-500">
							Payment Method
						</CardTitle>
						<CreditCard className="size-4 text-emerald-600" />
					</CardHeader>
					<CardContent>
						<div className="text-sm font-medium text-gray-900">
							{org?.stripeCustomerId
								? "Connected"
								: "Not connected"}
						</div>
						<p className="text-xs text-gray-500 mt-1">
							Powered by Stripe
						</p>
					</CardContent>
				</Card>
			</div>

			{/* Active Contracts */}
			<Card className="border-gray-200">
				<CardHeader>
					<CardTitle className="flex items-center gap-2 text-gray-900">
						<FileText className="size-5 text-slate-800" />
						Active Subscriptions
					</CardTitle>
				</CardHeader>
				<CardContent>
					{activeContracts.length > 0 ? (
						<div className="overflow-x-auto">
							<table className="w-full text-sm">
								<thead>
									<tr className="border-b border-gray-200">
										<th className="text-left py-3 font-medium text-gray-500">
											Agent
										</th>
										<th className="text-left py-3 font-medium text-gray-500">
											Department
										</th>
										<th className="text-right py-3 font-medium text-gray-500">
											Monthly Rate
										</th>
										<th className="text-right py-3 font-medium text-gray-500">
											Started
										</th>
									</tr>
								</thead>
								<tbody>
									{activeContracts.map((c) => (
										<tr
											key={c._id}
											className="border-b border-gray-100"
										>
											<td className="py-3 font-medium text-gray-900">
												{c.deployment?.displayName ??
													"Agent"}
											</td>
											<td className="py-3 text-gray-500">
												{c.template?.department ?? "—"}
											</td>
											<td className="py-3 text-right font-semibold text-slate-800">
												$
												{(
													c.monthlyRateCents / 100
												).toLocaleString()}
											</td>
											<td className="py-3 text-right text-gray-500">
												{new Date(
													c.startsAt
												).toLocaleDateString()}
											</td>
										</tr>
									))}
								</tbody>
								<tfoot>
									<tr className="border-t-2 border-gray-200">
										<td
											colSpan={2}
											className="py-3 font-bold text-gray-900"
										>
											Total
										</td>
										<td className="py-3 text-right font-bold text-lg text-slate-800">
											{spend?.formattedTotal}
										</td>
										<td />
									</tr>
								</tfoot>
							</table>
						</div>
					) : (
						<div className="text-center py-8">
							<p className="text-sm text-gray-500">
								No active subscriptions. Deploy agents to get
								started.
							</p>
						</div>
					)}
				</CardContent>
			</Card>

			{/* Invoices */}
			<Card className="border-gray-200">
				<CardHeader>
					<CardTitle className="flex items-center gap-2 text-gray-900">
						<DollarSign className="size-5 text-amber-700" />
						Invoice History
					</CardTitle>
				</CardHeader>
				<CardContent>
					{invoices && invoices.length > 0 ? (
						<div className="divide-y divide-gray-100">
							{invoices.map((inv) => (
								<div
									key={inv._id}
									className="flex items-center justify-between py-3"
								>
									<div>
										<p className="text-sm font-medium text-gray-900">
											$
											{(
												inv.amountCents / 100
											).toLocaleString()}
										</p>
										<p className="text-xs text-gray-500">
											{new Date(
												inv.periodStart
											).toLocaleDateString()}{" "}
											—{" "}
											{new Date(
												inv.periodEnd
											).toLocaleDateString()}
										</p>
									</div>
									<span
										className={`text-xs font-medium px-2 py-0.5 rounded-full ${
											inv.status === "paid"
												? "bg-emerald-50 text-emerald-700"
												: inv.status === "overdue"
													? "bg-red-50 text-red-700"
													: "bg-gray-100 text-gray-600"
										}`}
									>
										{inv.status}
									</span>
								</div>
							))}
						</div>
					) : (
						<div className="text-center py-8">
							<p className="text-sm text-gray-500">
								No invoices yet.
							</p>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
