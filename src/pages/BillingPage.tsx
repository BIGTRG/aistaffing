import { useApiQuery } from "@/lib/hooks";
import { api } from "@/lib/api";
import { useState } from "react";
import {
	CreditCard,
	DollarSign,
	FileText,
	ExternalLink,
	Shield,
	Loader2,
	CheckCircle2,
	AlertCircle,
	Zap,
	Receipt,
	ArrowUpRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function BillingPage() {
	const org = useApiQuery(() => api.organizations.getMine(), []);
	const contracts = useApiQuery(org ? () => api.billing.contractsByOrg(org.id) : null, [org]);
	const invoices = useApiQuery(org ? () => api.billing.invoicesByOrg(org.id) : null, [org]);
	const spend = useApiQuery(org ? () => api.billing.spend(org.id) : null, [org]);
	const stripeConfigured = useApiQuery(() => api.stripe.isConfigured(), []);

	const createCheckout = async (...args: any[]) => api.stripe.createCheckoutSession(...args);
	const createPortal = async (...args: any[]) => api.stripe.createPortalSession(...args);

	const [checkoutLoading, setCheckoutLoading] = useState(false);
	const [portalLoading, setPortalLoading] = useState(false);

	const activeContracts = contracts?.filter((c) => c.status === "active") ?? [];

	const handleManagePayments = async () => {
		if (!org) return;
		setPortalLoading(true);
		try {
			const result = await createPortal({ orgId: org.id });
			if (result.url) {
				window.open(result.url, "_blank");
			}
		} catch (err) {
			toast.error("Could not open payment portal.");
		} finally {
			setPortalLoading(false);
		}
	};

	const handleSetupPayment = async () => {
		if (!org) return;
		setCheckoutLoading(true);
		try {
			const lineItems = activeContracts.map((c) => ({
				name: c.deployment?.displayName ?? "AI Agent",
				description: `${c.template?.department ?? "Agent"} — ${c.template?.name ?? ""}`,
				amountCents: c.monthlyRateCents,
				quantity: 1,
			}));

			if (lineItems.length === 0) {
				lineItems.push({
					name: "AI Staffing Agency - Setup",
					description: "Initial payment setup",
					amountCents: 0,
					quantity: 1,
				});
			}

			const result = await createCheckout({
				orgId: org.id,
				lineItems,
			});

			if (result.url) {
				window.location.href = result.url;
			}
		} catch (err) {
			toast.error("Could not create checkout session.");
		} finally {
			setCheckoutLoading(false);
		}
	};

	// Check URL params for success/cancelled
	const urlParams = new URLSearchParams(window.location.search);
	const paymentStatus = urlParams.get("status");

	return (
		<div className="space-y-6">
			{/* Payment Status Banner */}
			{paymentStatus === "success" && (
				<div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3">
					<CheckCircle2 className="size-5 text-emerald-600 flex-shrink-0" />
					<div>
						<p className="font-semibold text-emerald-800 text-sm">Payment successful!</p>
						<p className="text-xs text-emerald-600">Your subscription is now active. Thank you!</p>
					</div>
				</div>
			)}
			{paymentStatus === "cancelled" && (
				<div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3">
					<AlertCircle className="size-5 text-amber-600 flex-shrink-0" />
					<div>
						<p className="font-semibold text-amber-800 text-sm">Payment cancelled</p>
						<p className="text-xs text-amber-600">No charges were made. You can try again anytime.</p>
					</div>
				</div>
			)}

			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold tracking-tight text-gray-900">Billing</h1>
					<p className="text-gray-500">Manage your subscriptions and payment history.</p>
				</div>
				<div className="flex gap-2">
					{org?.stripeCustomerId ? (
						<Button
							variant="outline"
							className="border-gray-300"
							onClick={handleManagePayments}
							disabled={portalLoading}
						>
							{portalLoading ? (
								<Loader2 className="size-4 mr-2 animate-spin" />
							) : (
								<ExternalLink className="size-4 mr-2" />
							)}
							Manage Payments
						</Button>
					) : (
						<Button
							className="bg-[#635BFF] hover:bg-[#5349E0] text-white"
							onClick={handleSetupPayment}
							disabled={checkoutLoading}
						>
							{checkoutLoading ? (
								<Loader2 className="size-4 mr-2 animate-spin" />
							) : (
								<CreditCard className="size-4 mr-2" />
							)}
							Set Up Payment
						</Button>
					)}
				</div>
			</div>

			{/* Spend Summary */}
			<div className="grid gap-4 sm:grid-cols-3">
				<Card className="border-gray-200">
					<CardHeader className="flex flex-row items-center justify-between pb-2">
						<CardTitle className="text-sm font-medium text-gray-500">Monthly Total</CardTitle>
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
						<CardTitle className="text-sm font-medium text-gray-500">Active Agents</CardTitle>
						<Zap className="size-4 text-slate-800" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold text-gray-900">
							{activeContracts.length}
						</div>
						<p className="text-xs text-gray-500 mt-1">Currently billed</p>
					</CardContent>
				</Card>

				<Card className="border-gray-200">
					<CardHeader className="flex flex-row items-center justify-between pb-2">
						<CardTitle className="text-sm font-medium text-gray-500">Payment Status</CardTitle>
						<Shield className="size-4 text-emerald-600" />
					</CardHeader>
					<CardContent>
						<div className="flex items-center gap-2">
							{org?.stripeCustomerId ? (
								<>
									<span className="size-2 rounded-full bg-emerald-500" />
									<span className="text-sm font-medium text-gray-900">Connected</span>
								</>
							) : (
								<>
									<span className="size-2 rounded-full bg-amber-500" />
									<span className="text-sm font-medium text-gray-900">Pending setup</span>
								</>
							)}
						</div>
						<p className="text-xs text-gray-500 mt-1">
							{org?.stripeCustomerId ? "Secure payments via Stripe" : "Set up payment to activate"}
						</p>
					</CardContent>
				</Card>
			</div>

			{/* Stripe not configured notice */}
			{stripeConfigured && !stripeConfigured.configured && (
				<div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center gap-3">
					<CreditCard className="size-5 text-blue-600 flex-shrink-0" />
					<div>
						<p className="font-semibold text-blue-800 text-sm">Demo Mode</p>
						<p className="text-xs text-blue-600">
							Stripe is not yet configured. Payment processing will be simulated. Contact your admin to connect Stripe.
						</p>
					</div>
				</div>
			)}

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
										<th className="text-left py-3 font-medium text-gray-500">Agent</th>
										<th className="text-left py-3 font-medium text-gray-500">Department</th>
										<th className="text-left py-3 font-medium text-gray-500">Plan</th>
										<th className="text-right py-3 font-medium text-gray-500">Monthly Rate</th>
										<th className="text-right py-3 font-medium text-gray-500">Started</th>
									</tr>
								</thead>
								<tbody>
									{activeContracts.map((c) => (
										<tr key={c.id} className="border-b border-gray-100">
											<td className="py-3 font-medium text-gray-900">
												{c.deployment?.displayName ?? "Agent"}
											</td>
											<td className="py-3 text-gray-500">
												{c.template?.department ?? "—"}
											</td>
											<td className="py-3">
												<span className="text-xs font-medium px-2 py-0.5 bg-slate-100 text-slate-700 rounded-full">
													{(c as any).tier ? String((c as any).tier).replace("_", " ") : "Monthly"}
												</span>
											</td>
											<td className="py-3 text-right font-semibold text-slate-800">
												${(c.monthlyRateCents / 100).toLocaleString()}
											</td>
											<td className="py-3 text-right text-gray-500">
												{new Date(c.startsAt).toLocaleDateString()}
											</td>
										</tr>
									))}
								</tbody>
								<tfoot>
									<tr className="border-t-2 border-gray-200">
										<td colSpan={3} className="py-3 font-bold text-gray-900">Total</td>
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
								No active subscriptions. Deploy agents to get started.
							</p>
						</div>
					)}
				</CardContent>
			</Card>

			{/* Invoices */}
			<Card className="border-gray-200">
				<CardHeader>
					<CardTitle className="flex items-center gap-2 text-gray-900">
						<Receipt className="size-5 text-amber-700" />
						Invoice History
					</CardTitle>
				</CardHeader>
				<CardContent>
					{invoices && invoices.length > 0 ? (
						<div className="divide-y divide-gray-100">
							{invoices.map((inv) => (
								<div key={inv.id} className="flex items-center justify-between py-3">
									<div>
										<p className="text-sm font-medium text-gray-900">
											${(inv.amountCents / 100).toLocaleString()}
										</p>
										<p className="text-xs text-gray-500">
											{new Date(inv.periodStart).toLocaleDateString()} — {new Date(inv.periodEnd).toLocaleDateString()}
										</p>
									</div>
									<div className="flex items-center gap-2">
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
										{(inv as any).stripeInvoiceId && (
											<button className="p-1 hover:bg-gray-100 rounded transition-colors">
												<ArrowUpRight className="size-3.5 text-gray-400" />
											</button>
										)}
									</div>
								</div>
							))}
						</div>
					) : (
						<div className="text-center py-8">
							<p className="text-sm text-gray-500">No invoices yet.</p>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
