import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { useNavigate } from "react-router-dom";
import { api } from "../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
	ArrowRight,
	ArrowLeft,
	Building2,
	Users,
	CheckCircle2,
	Briefcase,
	Headphones,
	DollarSign,
	Megaphone,
	Scale,
	GraduationCap,
	CreditCard,
	Sparkles,
	Shield,
	TrendingUp,
	Tag,
	Heart,
	Cog,
	Banknote,
	Monitor,
} from "lucide-react";

const industries = [
	"Cleaning Services",
	"Lawn Care / Landscaping",
	"Janitorial Services",
	"Insurance",
	"Sales / Call Center",
	"Legal (Small Office)",
	"Medical / Dental",
	"Marketing / Social Media",
	"Real Estate",
	"Construction",
	"Retail / E-Commerce",
	"Restaurant / Hospitality",
	"Auto Dealerships",
	"Accounting / Finance",
	"Property Management",
	"Other",
];

const departmentIcons: Record<string, React.ElementType> = {
	"Front Office": Headphones,
	Sales: DollarSign,
	Marketing: Megaphone,
	"Customer Success": Heart,
	Operations: Cog,
	"Finance & Billing": Banknote,
	"HR & Recruiting": GraduationCap,
	"IT & Tech Support": Monitor,
	"Legal & Compliance": Scale,
	"Executive & Strategy": Briefcase,
};

const TIERS = [
	{ id: "30_day", label: "Monthly", discount: 0, commitment: "Cancel anytime", icon: "📅" },
	{ id: "3_month", label: "Quarterly", discount: 5, commitment: "3-month commitment", icon: "📊" },
	{ id: "6_month", label: "Semi-Annual", discount: 10, commitment: "6-month commitment", icon: "🏆" },
	{ id: "12_month", label: "Annual", discount: 15, commitment: "12-month commitment", icon: "⭐" },
];

export function OnboardingPage() {
	const navigate = useNavigate();
	const [step, setStep] = useState(1);
	// Step 1: Business info
	const [businessName, setBusinessName] = useState("");
	const [industry, setIndustry] = useState("");
	const [phone, setPhone] = useState("");
	const [email, setEmail] = useState("");
	const [website, setWebsite] = useState("");
	// Step 2: Agents
	const [selectedAgents, setSelectedAgents] = useState<string[]>([]);
	// Step 3: Contract & Pricing
	const [selectedTier, setSelectedTier] = useState("30_day");
	const [commissionRate, setCommissionRate] = useState(10);
	const [enableCommission, setEnableCommission] = useState(false);
	// Submit
	const [isSubmitting, setIsSubmitting] = useState(false);

	const templates = useQuery(api.agentTemplates.list) ?? [];
	const createOrg = useMutation(api.organizations.create);
	const deployAgent = useMutation(api.deployments.deploy);
	const completeOnboarding = useMutation(api.organizations.completeOnboarding);

	// Group templates by department
	const departments = templates.reduce(
		(acc, t) => {
			if (!acc[t.department]) acc[t.department] = [];
			acc[t.department].push(t);
			return acc;
		},
		{} as Record<string, typeof templates>
	);

	const toggleAgent = (id: string) => {
		setSelectedAgents((prev) =>
			prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
		);
	};

	// Recommended agents based on industry
	const getRecommendedDepts = (ind: string): string[] => {
		const map: Record<string, string[]> = {
			"Cleaning Services": ["Front Office", "Sales", "Customer Success"],
			"Legal (Small Office)": ["Front Office", "Legal & Compliance", "Customer Success"],
			"Medical / Dental": ["Front Office", "Customer Success", "Operations"],
			"Real Estate": ["Front Office", "Sales", "Marketing"],
			"Insurance": ["Front Office", "Sales", "Customer Success"],
			"Auto Dealerships": ["Front Office", "Sales", "Marketing"],
			"Restaurant / Hospitality": ["Front Office", "Operations", "Marketing"],
			"Sales / Call Center": ["Sales", "Front Office", "Customer Success"],
			"Marketing / Social Media": ["Marketing", "Sales", "Customer Success"],
		};
		return map[ind] ?? ["Front Office", "Sales", "Customer Success"];
	};

	const recommendedDepts = getRecommendedDepts(industry);

	const handleComplete = async () => {
		setIsSubmitting(true);
		try {
			const orgId = await createOrg({
				name: businessName,
				industry,
				phone: phone || undefined,
				email: email || undefined,
				website: website || undefined,
			});

			// Deploy selected agents
			for (const templateId of selectedAgents) {
				const template = templates.find((t) => t._id === templateId);
				if (template) {
					await deployAgent({
						orgId,
						templateId: template._id,
						displayName: template.name,
					});
				}
			}

			await completeOnboarding({ orgId });
			navigate("/employer/dashboard");
		} catch (err) {
			console.error("Onboarding error:", err);
		} finally {
			setIsSubmitting(false);
		}
	};

	const currentTier = TIERS.find((t) => t.id === selectedTier) ?? TIERS[0];
	const baseMonthlyTotal = selectedAgents.reduce((sum, id) => {
		const t = templates.find((t) => t._id === id);
		return sum + (t?.basePriceCents ?? 0);
	}, 0);
	const discountedTotal = Math.round(baseMonthlyTotal * (1 - currentTier.discount / 100));
	const savings = baseMonthlyTotal - discountedTotal;
	const humanEquivalent = Math.round(discountedTotal * 2.5);

	// Check if any selected agent is a sales agent
	const hasSalesAgent = selectedAgents.some((id) => {
		const t = templates.find((t) => t._id === id);
		return t?.department === "Sales";
	});

	return (
		<div className="min-h-screen bg-white">
			{/* Header */}
			<div className="bg-slate-900 py-6">
				<div className="container flex items-center gap-3">
					<img src="/logo.png" alt="AI Staffing Agency" className="h-10 w-10" />
					<span className="font-bold text-xl text-white tracking-tight">
						AI Staffing Agency
					</span>
				</div>
			</div>

			{/* Progress */}
			<div className="border-b border-gray-100 bg-gray-50 py-4">
				<div className="container">
					<div className="flex items-center gap-2 max-w-3xl mx-auto">
						{[
							{ num: 1, label: "Your Business" },
							{ num: 2, label: "Select Agents" },
							{ num: 3, label: "Plan & Pricing" },
							{ num: 4, label: "Review & Launch" },
						].map((s, i) => (
							<div key={s.num} className="flex items-center gap-2 flex-1">
								<div
									className={`flex items-center justify-center size-8 rounded-full text-sm font-semibold transition-colors ${
										step >= s.num
											? "bg-slate-900 text-white"
											: "bg-gray-200 text-gray-500"
									}`}
								>
									{step > s.num ? <CheckCircle2 className="size-5" /> : s.num}
								</div>
								<span
									className={`text-sm font-medium hidden sm:block ${
										step >= s.num ? "text-gray-900" : "text-gray-400"
									}`}
								>
									{s.label}
								</span>
								{i < 3 && (
									<div
										className={`flex-1 h-0.5 ${
											step > s.num ? "bg-slate-900" : "bg-gray-200"
										}`}
									/>
								)}
							</div>
						))}
					</div>
				</div>
			</div>

			{/* Content */}
			<div className="container py-10">
				{/* Step 1: Business Info */}
				{step === 1 && (
					<div className="max-w-lg mx-auto space-y-6">
						<div className="text-center mb-8">
							<div className="inline-flex items-center justify-center size-14 rounded-2xl bg-slate-100 mb-4">
								<Building2 className="size-7 text-slate-800" />
							</div>
							<h2 className="text-2xl font-bold text-gray-900">
								Tell us about your business
							</h2>
							<p className="text-gray-500 mt-2">
								We'll tailor your AI team to fit your needs.
							</p>
						</div>

						<div className="space-y-4">
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1.5">
									Business Name *
								</label>
								<input
									type="text"
									value={businessName}
									onChange={(e) => setBusinessName(e.target.value)}
									placeholder="Your Company LLC"
									className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent"
								/>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1.5">
									Industry *
								</label>
								<div className="grid grid-cols-2 gap-2">
									{industries.map((ind) => (
										<button
											key={ind}
											type="button"
											onClick={() => setIndustry(ind)}
											className={`rounded-lg border px-3 py-2.5 text-sm font-medium text-left transition-all ${
												industry === ind
													? "border-slate-800 bg-slate-50 text-slate-900"
													: "border-gray-200 text-gray-600 hover:border-gray-300"
											}`}
										>
											{ind}
										</button>
									))}
								</div>
							</div>

							<div className="grid grid-cols-2 gap-4">
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1.5">
										Phone
									</label>
									<input
										type="tel"
										value={phone}
										onChange={(e) => setPhone(e.target.value)}
										placeholder="(555) 123-4567"
										className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent"
									/>
								</div>
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1.5">
										Business Email
									</label>
									<input
										type="email"
										value={email}
										onChange={(e) => setEmail(e.target.value)}
										placeholder="you@company.com"
										className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent"
									/>
								</div>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1.5">
									Website
								</label>
								<input
									type="url"
									value={website}
									onChange={(e) => setWebsite(e.target.value)}
									placeholder="https://yourcompany.com"
									className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent"
								/>
							</div>
						</div>

						<Button
							className="w-full h-12 bg-slate-800 hover:bg-slate-900 text-white text-base font-semibold"
							disabled={!businessName || !industry}
							onClick={() => setStep(2)}
						>
							Continue
							<ArrowRight className="size-4 ml-2" />
						</Button>
					</div>
				)}

				{/* Step 2: Select Agents */}
				{step === 2 && (
					<div className="max-w-4xl mx-auto space-y-6">
						<div className="text-center mb-8">
							<div className="inline-flex items-center justify-center size-14 rounded-2xl bg-slate-100 mb-4">
								<Users className="size-7 text-slate-800" />
							</div>
							<h2 className="text-2xl font-bold text-gray-900">
								Build your AI team
							</h2>
							<p className="text-gray-500 mt-2">
								Select the agents you want deployed. You can add or remove anytime.
							</p>
							{industry && (
								<div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 text-xs font-medium rounded-full">
									<Sparkles className="size-3" />
									Recommended for {industry}: {recommendedDepts.join(", ")}
								</div>
							)}
						</div>

						{/* Sticky total bar */}
						{selectedAgents.length > 0 && (
							<div className="sticky top-0 z-10 bg-slate-900 text-white rounded-xl px-6 py-4 flex items-center justify-between shadow-lg">
								<div>
									<span className="text-sm text-slate-300">
										{selectedAgents.length} agent
										{selectedAgents.length !== 1 ? "s" : ""} selected
									</span>
									<span className="mx-3 text-slate-600">|</span>
									<span className="font-bold text-lg">
										${(baseMonthlyTotal / 100).toLocaleString()}/mo
									</span>
								</div>
								<Button
									className="bg-amber-600 hover:bg-amber-700 text-white font-semibold"
									onClick={() => setStep(3)}
								>
									Choose Plan
									<ArrowRight className="size-4 ml-2" />
								</Button>
							</div>
						)}

						{Object.entries(departments).map(([dept, agents]) => {
							const Icon = departmentIcons[dept] ?? Briefcase;
							const isRecommended = recommendedDepts.includes(dept);
							return (
								<div key={dept}>
									<div className="flex items-center gap-2 mb-3">
										<Icon className="size-5 text-slate-700" />
										<h3 className="font-semibold text-gray-900">{dept}</h3>
										{isRecommended && (
											<span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full">
												Recommended
											</span>
										)}
									</div>
									<div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
										{agents.map((agent) => {
											const isSelected = selectedAgents.includes(agent._id);
											return (
												<button
													key={agent._id}
													type="button"
													onClick={() => toggleAgent(agent._id)}
													className={`rounded-xl border p-4 text-left transition-all ${
														isSelected
															? "border-slate-800 bg-slate-50 ring-1 ring-slate-800"
															: "border-gray-200 hover:border-gray-300 bg-white"
													}`}
												>
													<div className="flex items-start justify-between mb-2">
														<h4 className="font-semibold text-sm text-gray-900">
															{agent.name}
														</h4>
														<div
															className={`size-5 rounded-full border-2 flex items-center justify-center transition-colors ${
																isSelected
																	? "bg-slate-800 border-slate-800"
																	: "border-gray-300"
															}`}
														>
															{isSelected && (
																<CheckCircle2 className="size-4 text-white" />
															)}
														</div>
													</div>
													<p className="text-xs text-gray-500 mb-3 line-clamp-2">
														{agent.description}
													</p>
													<div className="text-sm font-bold text-slate-800">
														${(agent.basePriceCents / 100).toLocaleString()}/mo
													</div>
												</button>
											);
										})}
									</div>
								</div>
							);
						})}

						<div className="flex gap-3 pt-4">
							<Button variant="outline" className="h-12 px-6" onClick={() => setStep(1)}>
								<ArrowLeft className="size-4 mr-2" />
								Back
							</Button>
							<Button
								className="flex-1 h-12 bg-slate-800 hover:bg-slate-900 text-white text-base font-semibold"
								disabled={selectedAgents.length === 0}
								onClick={() => setStep(3)}
							>
								Choose Plan ({selectedAgents.length} agent{selectedAgents.length !== 1 ? "s" : ""})
								<ArrowRight className="size-4 ml-2" />
							</Button>
						</div>
					</div>
				)}

				{/* Step 3: Plan & Pricing */}
				{step === 3 && (
					<div className="max-w-3xl mx-auto space-y-6">
						<div className="text-center mb-8">
							<div className="inline-flex items-center justify-center size-14 rounded-2xl bg-amber-100 mb-4">
								<CreditCard className="size-7 text-amber-700" />
							</div>
							<h2 className="text-2xl font-bold text-gray-900">
								Choose your plan
							</h2>
							<p className="text-gray-500 mt-2">
								Longer commitments = bigger discounts. All plans include the same features.
							</p>
						</div>

						{/* Tier cards */}
						<div className="grid sm:grid-cols-2 gap-3">
							{TIERS.map((tier) => (
								<button
									key={tier.id}
									type="button"
									onClick={() => setSelectedTier(tier.id)}
									className={`rounded-xl border p-5 text-left transition-all ${
										selectedTier === tier.id
											? "border-slate-800 bg-slate-50 ring-1 ring-slate-800"
											: "border-gray-200 hover:border-gray-300 bg-white"
									}`}
								>
									<div className="flex items-center justify-between mb-2">
										<div className="flex items-center gap-2">
											<span className="text-xl">{tier.icon}</span>
											<h4 className="font-bold text-gray-900">{tier.label}</h4>
										</div>
										{tier.discount > 0 && (
											<span className="text-xs font-semibold px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full">
												Save {tier.discount}%
											</span>
										)}
									</div>
									<p className="text-xs text-gray-500">{tier.commitment}</p>
									{tier.discount > 0 && (
										<p className="text-sm font-semibold text-emerald-600 mt-2">
											${(Math.round(baseMonthlyTotal * tier.discount / 10000)).toLocaleString()}/mo saved
										</p>
									)}
								</button>
							))}
						</div>

						{/* Commission rate for sales agents */}
						{hasSalesAgent && (
							<Card className="border-gray-200">
								<CardContent className="p-6">
									<div className="flex items-center gap-3 mb-4">
										<div className="size-10 rounded-xl bg-amber-50 flex items-center justify-center">
											<TrendingUp className="size-5 text-amber-700" />
										</div>
										<div>
											<h3 className="font-semibold text-gray-900">Sales Commission Rate</h3>
											<p className="text-xs text-gray-500">
												Set a commission % for your sales agents on closed deals
											</p>
										</div>
									</div>
									<div className="flex items-center gap-4">
										<label className="flex items-center gap-2 cursor-pointer">
											<input
												type="checkbox"
												checked={enableCommission}
												onChange={(e) => setEnableCommission(e.target.checked)}
												className="rounded border-gray-300 text-slate-800 focus:ring-slate-800"
											/>
											<span className="text-sm font-medium text-gray-700">
												Enable commission tracking
											</span>
										</label>
									</div>
									{enableCommission && (
										<div className="mt-4 ml-6">
											<label className="text-sm text-gray-600 mb-2 block">
												Commission rate: <span className="font-bold text-gray-900">{commissionRate}%</span>
											</label>
											<input
												type="range"
												min={5}
												max={30}
												step={1}
												value={commissionRate}
												onChange={(e) => setCommissionRate(parseInt(e.target.value))}
												className="w-full accent-amber-600"
											/>
											<div className="flex justify-between text-xs text-gray-400 mt-1">
												<span>5%</span>
												<span>30%</span>
											</div>
										</div>
									)}
								</CardContent>
							</Card>
						)}

						{/* Cost summary */}
						<Card className="border-gray-200 bg-gray-50">
							<CardContent className="p-6 space-y-4">
								<h3 className="font-semibold text-gray-900 flex items-center gap-2">
									<Tag className="size-4" />
									Cost Summary
								</h3>

								<div className="space-y-2 text-sm">
									<div className="flex justify-between">
										<span className="text-gray-500">{selectedAgents.length} agents (base rate)</span>
										<span className="font-mono">${(baseMonthlyTotal / 100).toLocaleString()}/mo</span>
									</div>
									{currentTier.discount > 0 && (
										<div className="flex justify-between text-emerald-600">
											<span>{currentTier.label} discount (-{currentTier.discount}%)</span>
											<span className="font-mono">-${(savings / 100).toLocaleString()}/mo</span>
										</div>
									)}
									<div className="border-t border-gray-200 pt-2 flex justify-between">
										<span className="font-bold text-gray-900">Your monthly total</span>
										<span className="font-bold text-xl text-slate-800">
											${(discountedTotal / 100).toLocaleString()}/mo
										</span>
									</div>
								</div>

								<div className="bg-blue-50 rounded-lg p-4 mt-4">
									<div className="flex items-center gap-2 mb-1">
										<Shield className="size-4 text-blue-600" />
										<span className="text-xs font-semibold text-blue-700 uppercase tracking-wider">Human equivalent cost</span>
									</div>
									<p className="text-lg font-bold text-blue-800">${(humanEquivalent / 100).toLocaleString()}/mo</p>
									<p className="text-xs text-blue-600 mt-1">
										You're saving ${((humanEquivalent - discountedTotal) / 100).toLocaleString()}/mo vs. hiring humans
									</p>
								</div>
							</CardContent>
						</Card>

						<div className="flex gap-3">
							<Button variant="outline" className="h-12 px-6" onClick={() => setStep(2)}>
								<ArrowLeft className="size-4 mr-2" />
								Edit Team
							</Button>
							<Button
								className="flex-1 h-12 bg-slate-800 hover:bg-slate-900 text-white text-base font-semibold"
								onClick={() => setStep(4)}
							>
								Review & Launch
								<ArrowRight className="size-4 ml-2" />
							</Button>
						</div>
					</div>
				)}

				{/* Step 4: Review & Launch */}
				{step === 4 && (
					<div className="max-w-2xl mx-auto space-y-6">
						<div className="text-center mb-8">
							<div className="inline-flex items-center justify-center size-14 rounded-2xl bg-emerald-100 mb-4">
								<CheckCircle2 className="size-7 text-emerald-600" />
							</div>
							<h2 className="text-2xl font-bold text-gray-900">
								Ready to launch
							</h2>
							<p className="text-gray-500 mt-2">
								Confirm your selections and deploy your AI team.
							</p>
						</div>

						{/* Business summary */}
						<Card className="border-gray-200">
							<CardContent className="p-6">
								<h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
									<Building2 className="size-4" />
									Business Details
								</h3>
								<div className="space-y-2 text-sm">
									<div className="flex justify-between">
										<span className="text-gray-500">Name</span>
										<span className="font-medium text-gray-900">{businessName}</span>
									</div>
									<div className="flex justify-between">
										<span className="text-gray-500">Industry</span>
										<span className="font-medium text-gray-900">{industry}</span>
									</div>
									{phone && (
										<div className="flex justify-between">
											<span className="text-gray-500">Phone</span>
											<span className="font-medium text-gray-900">{phone}</span>
										</div>
									)}
									{email && (
										<div className="flex justify-between">
											<span className="text-gray-500">Email</span>
											<span className="font-medium text-gray-900">{email}</span>
										</div>
									)}
									{website && (
										<div className="flex justify-between">
											<span className="text-gray-500">Website</span>
											<span className="font-medium text-gray-900">{website}</span>
										</div>
									)}
								</div>
							</CardContent>
						</Card>

						{/* Plan summary */}
						<Card className="border-gray-200">
							<CardContent className="p-6">
								<h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
									<CreditCard className="size-4" />
									Plan Details
								</h3>
								<div className="space-y-2 text-sm">
									<div className="flex justify-between">
										<span className="text-gray-500">Billing cycle</span>
										<span className="font-medium text-gray-900">{currentTier.label}</span>
									</div>
									{currentTier.discount > 0 && (
										<div className="flex justify-between">
											<span className="text-gray-500">Discount</span>
											<span className="font-medium text-emerald-600">{currentTier.discount}% off</span>
										</div>
									)}
									{enableCommission && hasSalesAgent && (
										<div className="flex justify-between">
											<span className="text-gray-500">Sales commission</span>
											<span className="font-medium text-amber-700">{commissionRate}%</span>
										</div>
									)}
								</div>
							</CardContent>
						</Card>

						{/* Agent list */}
						<Card className="border-gray-200">
							<CardContent className="p-6">
								<h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
									<Users className="size-4" />
									Your AI Team
								</h3>
								<div className="divide-y divide-gray-100">
									{selectedAgents.map((id) => {
										const t = templates.find((t) => t._id === id);
										if (!t) return null;
										const discountedPrice = Math.round(t.basePriceCents * (1 - currentTier.discount / 100));
										return (
											<div key={id} className="flex items-center justify-between py-3">
												<div>
													<p className="font-medium text-sm text-gray-900">{t.name}</p>
													<p className="text-xs text-gray-500">{t.department}</p>
												</div>
												<div className="text-right">
													{currentTier.discount > 0 && (
														<span className="text-xs text-gray-400 line-through mr-2">
															${(t.basePriceCents / 100).toLocaleString()}
														</span>
													)}
													<span className="font-semibold text-sm text-slate-800">
														${(discountedPrice / 100).toLocaleString()}/mo
													</span>
												</div>
											</div>
										);
									})}
								</div>
								<div className="border-t border-gray-200 mt-3 pt-3 flex justify-between">
									<span className="font-bold text-gray-900">Monthly Total</span>
									<span className="font-bold text-lg text-slate-800">
										${(discountedTotal / 100).toLocaleString()}/mo
									</span>
								</div>
							</CardContent>
						</Card>

						{/* Human savings callout */}
						<div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 flex items-center gap-4">
							<div className="size-12 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
								<TrendingUp className="size-6 text-emerald-600" />
							</div>
							<div>
								<p className="font-semibold text-emerald-800">
									Saving ${((humanEquivalent - discountedTotal) / 100).toLocaleString()}/mo vs. human staff
								</p>
								<p className="text-xs text-emerald-600 mt-0.5">
									That's ${(((humanEquivalent - discountedTotal) * 12) / 100).toLocaleString()} per year in savings
								</p>
							</div>
						</div>

						<div className="flex gap-3">
							<Button variant="outline" className="h-12 px-6" onClick={() => setStep(3)}>
								<ArrowLeft className="size-4 mr-2" />
								Change Plan
							</Button>
							<Button
								className="flex-1 h-12 bg-slate-800 hover:bg-slate-900 text-white text-base font-semibold"
								disabled={isSubmitting}
								onClick={handleComplete}
							>
								{isSubmitting ? "Deploying your team..." : "🚀 Launch My AI Team"}
								{!isSubmitting && <ArrowRight className="size-4 ml-2" />}
							</Button>
						</div>

						<p className="text-center text-xs text-gray-400">
							By launching, you agree to our Terms of Service. Your 7-day free trial starts today.
						</p>
					</div>
				)}
			</div>
		</div>
	);
}
