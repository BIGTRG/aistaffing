// @ts-nocheck
import {
	DollarSign,
	Banknote,
	Users,
	ArrowRight,
	Check,
	Shield,
	Briefcase,
	Calculator,
	UserPlus,
	ClipboardList,
	Handshake,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const partnerServices = [
	{
		id: "stewart-money",
		name: "Steward's Money",
		tagline: "Payroll & Bookkeeping Services",
		desc: "Let professionals handle your numbers. Steward's Money provides expert payroll processing and bookkeeping services so you can focus on growing your business while we handle the financial operations.",
		icon: Banknote,
		color: "text-emerald-600",
		bg: "bg-emerald-50",
		border: "border-emerald-200",
		gradient: "from-emerald-50 to-white",
		features: [
			{
				name: "Payroll Processing",
				desc: "Automated payroll for your human staff, tax filings, direct deposits",
				icon: DollarSign,
			},
			{
				name: "Bookkeeping",
				desc: "Monthly reconciliation, financial statements, expense tracking",
				icon: Calculator,
			},
			{
				name: "Tax Preparation",
				desc: "Quarterly and annual tax filings, deduction optimization",
				icon: ClipboardList,
			},
		],
		cta: "Get Started with Steward's Money",
	},
	{
		id: "stewart-solution",
		name: "Steward's Solution",
		tagline: "HR & Recruiting System",
		desc: "Need to hire human staff alongside your AI agents? Steward's Solution provides a complete HR and recruiting system to help you find, onboard, and manage your team.",
		icon: Users,
		color: "text-slate-800",
		bg: "bg-slate-50",
		border: "border-slate-200",
		gradient: "from-slate-50 to-white",
		features: [
			{
				name: "Recruiting System",
				desc: "Job postings, applicant tracking, interview scheduling",
				icon: UserPlus,
			},
			{
				name: "HR Management",
				desc: "Employee records, benefits administration, compliance",
				icon: Briefcase,
			},
			{
				name: "Onboarding",
				desc: "Automated onboarding workflows, document collection, training",
				icon: ClipboardList,
			},
		],
		cta: "Get Started with Steward's Solution",
	},
];

export function PartnersPage() {
	return (
		<div className="space-y-8">
			<div>
				<h1 className="text-2xl font-bold tracking-tight text-gray-900">
					Partner Services
				</h1>
				<p className="text-gray-500">
					Extend your AI workforce with trusted partner services
					for payroll, bookkeeping, HR, and recruiting.
				</p>
			</div>

			{/* Partner banner */}
			<Card className="border-gray-200 bg-gradient-to-r from-gray-50 to-white overflow-hidden">
				<CardContent className="p-6 flex flex-col md:flex-row items-start md:items-center gap-4">
					<div className="inline-flex size-14 items-center justify-center rounded-2xl bg-amber-50 shrink-0">
						<Handshake className="size-7 text-amber-700" />
					</div>
					<div className="flex-1">
						<h3 className="font-semibold text-gray-900 text-lg">
							Powered by Steward's Partnership
						</h3>
						<p className="text-sm text-gray-600 mt-1">
							AI Staffing Agency handles your AI workforce.
							Steward's handles payroll, bookkeeping, and HR for
							your human staff. Together, your entire business
							is covered.
						</p>
					</div>
					<div className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full">
						<Shield className="size-3" />
						Trusted Partner
					</div>
				</CardContent>
			</Card>

			{/* Partner Service Cards */}
			{partnerServices.map((service) => (
				<Card
					key={service.id}
					className={`border-gray-200 overflow-hidden hover:shadow-md transition-shadow`}
				>
					<div
						className={`bg-gradient-to-r ${service.gradient} p-6 md:p-8`}
					>
						<div className="flex flex-col md:flex-row items-start gap-6">
							<div
								className={`inline-flex size-16 items-center justify-center rounded-2xl ${service.bg} shrink-0`}
							>
								<service.icon
									className={`size-8 ${service.color}`}
								/>
							</div>
							<div className="flex-1">
								<h2 className="text-xl font-bold text-gray-900">
									{service.name}
								</h2>
								<p className="text-sm font-medium text-gray-500 mt-0.5">
									{service.tagline}
								</p>
								<p className="text-gray-600 mt-3 leading-relaxed">
									{service.desc}
								</p>
							</div>
						</div>
					</div>

					<CardContent className="p-6 md:p-8 space-y-6">
						<div className="grid sm:grid-cols-3 gap-4">
							{service.features.map((f) => (
								<div
									key={f.name}
									className="rounded-lg border border-gray-100 p-4 hover:border-gray-200 transition-colors"
								>
									<div
										className={`inline-flex size-9 items-center justify-center rounded-lg ${service.bg} mb-3`}
									>
										<f.icon
											className={`size-4 ${service.color}`}
										/>
									</div>
									<h4 className="font-medium text-sm text-gray-900">
										{f.name}
									</h4>
									<p className="text-xs text-gray-500 mt-1 leading-relaxed">
										{f.desc}
									</p>
								</div>
							))}
						</div>

						<div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-2 border-t border-gray-100">
							<div className="flex-1">
								<ul className="flex flex-wrap gap-x-4 gap-y-1">
									{[
										"No long-term contract",
										"Setup in days",
										"Dedicated support",
									].map((item) => (
										<li
											key={item}
											className="flex items-center gap-1.5 text-xs text-gray-500"
										>
											<Check className="size-3 text-emerald-500" />
											{item}
										</li>
									))}
								</ul>
							</div>
							<Button className="bg-slate-800 hover:bg-slate-900 text-white shadow-sm">
								{service.cta}
								<ArrowRight className="size-4" />
							</Button>
						</div>
					</CardContent>
				</Card>
			))}

			{/* FAQ/info */}
			<Card className="border-gray-200">
				<CardContent className="p-6">
					<h3 className="font-semibold text-gray-900 mb-3">
						How Partner Services Work
					</h3>
					<ol className="space-y-3">
						{[
							"Click the service you're interested in above",
							"Fill out a short onboarding form with your business details",
							"A Steward's representative will contact you within 24 hours",
							"Services are billed separately from your AI agent subscriptions",
						].map((step, i) => (
							<li
								key={step}
								className="flex items-start gap-3 text-sm text-gray-600"
							>
								<span className="inline-flex size-6 items-center justify-center rounded-full bg-slate-50 text-slate-800 text-xs font-semibold shrink-0 mt-0.5">
									{i + 1}
								</span>
								{step}
							</li>
						))}
					</ol>
				</CardContent>
			</Card>
		</div>
	);
}
