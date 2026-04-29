import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { useNavigate } from "react-router-dom";
import { api } from "../../convex/_generated/api";
import { Button } from "@/components/ui/button";
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
	Sparkles,
	Rocket,
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

export function OnboardingPage() {
	const navigate = useNavigate();
	const [step, setStep] = useState(1);
	// Step 1: Business info
	const [businessName, setBusinessName] = useState("");
	const [industry, setIndustry] = useState("");
	// Step 2: Select agents
	const [selectedAgents, setSelectedAgents] = useState<string[]>([]);
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
		{} as Record<string, typeof templates>,
	);

	const toggleAgent = (id: string) => {
		setSelectedAgents((prev) =>
			prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id],
		);
	};

	// Recommended agents based on industry
	const getRecommendedDepts = (ind: string): string[] => {
		const map: Record<string, string[]> = {
			"Cleaning Services": ["Front Office", "Sales", "Customer Success"],
			"Legal (Small Office)": [
				"Front Office",
				"Legal & Compliance",
				"Customer Success",
			],
			"Medical / Dental": [
				"Front Office",
				"Customer Success",
				"Operations",
			],
			"Real Estate": ["Front Office", "Sales", "Marketing"],
			Insurance: ["Front Office", "Sales", "Customer Success"],
			"Auto Dealerships": ["Front Office", "Sales", "Marketing"],
			"Restaurant / Hospitality": [
				"Front Office",
				"Operations",
				"Marketing",
			],
			"Sales / Call Center": [
				"Sales",
				"Front Office",
				"Customer Success",
			],
			"Marketing / Social Media": [
				"Marketing",
				"Sales",
				"Customer Success",
			],
		};
		return map[ind] ?? ["Front Office", "Sales", "Customer Success"];
	};

	const recommendedDepts = getRecommendedDepts(industry);

	// Auto-select recommended agents when industry is picked
	const autoSelectRecommended = () => {
		const recommended = templates
			.filter((t) => recommendedDepts.includes(t.department))
			.slice(0, 5)
			.map((t) => t._id);
		setSelectedAgents(recommended);
	};

	const handleComplete = async () => {
		setIsSubmitting(true);
		try {
			const orgId = await createOrg({
				name: businessName,
				industry,
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

	const baseMonthlyTotal = selectedAgents.reduce((sum, id) => {
		const t = templates.find((tmpl) => tmpl._id === id);
		return sum + (t?.basePriceCents ?? 0);
	}, 0);

	return (
		<div className="min-h-screen bg-white">
			{/* Header */}
			<div className="bg-slate-900 py-5">
				<div className="container flex items-center gap-3">
					<img
						src="/logo.png"
						alt="AI Staffing Agency"
						className="h-10 w-10"
					/>
					<span className="font-bold text-xl text-white tracking-tight">
						AI Staffing Agency
					</span>
				</div>
			</div>

			{/* Simple 2-step progress */}
			<div className="border-b border-gray-100 bg-gray-50 py-3">
				<div className="container">
					<div className="flex items-center gap-3 max-w-xl mx-auto">
						{[
							{ num: 1, label: "Your Business" },
							{ num: 2, label: "Choose Agents & Launch" },
						].map((s, i) => (
							<div
								key={s.num}
								className="flex items-center gap-2 flex-1"
							>
								<div
									className={`flex items-center justify-center size-8 rounded-full text-sm font-semibold transition-colors ${
										step >= s.num
											? "bg-slate-900 text-white"
											: "bg-gray-200 text-gray-500"
									}`}
								>
									{step > s.num ? (
										<CheckCircle2 className="size-5" />
									) : (
										s.num
									)}
								</div>
								<span
									className={`text-sm font-medium ${
										step >= s.num
											? "text-gray-900"
											: "text-gray-400"
									}`}
								>
									{s.label}
								</span>
								{i < 1 && (
									<div
										className={`flex-1 h-0.5 ${
											step > s.num
												? "bg-slate-900"
												: "bg-gray-200"
										}`}
									/>
								)}
							</div>
						))}
					</div>
				</div>
			</div>

			{/* Content */}
			<div className="container py-8">
				{/* Step 1: Business Info — fast and simple */}
				{step === 1 && (
					<div className="max-w-md mx-auto space-y-6">
						<div className="text-center mb-6">
							<div className="inline-flex items-center justify-center size-14 rounded-2xl bg-slate-100 mb-4">
								<Building2 className="size-7 text-slate-800" />
							</div>
							<h2 className="text-2xl font-bold text-gray-900">
								Let's get started
							</h2>
							<p className="text-gray-500 mt-1 text-sm">
								Just two quick things and you're in.
							</p>
						</div>

						<div className="space-y-4">
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1.5">
									Business Name
								</label>
								<input
									type="text"
									value={businessName}
									onChange={(e) =>
										setBusinessName(e.target.value)
									}
									placeholder="Your Company LLC"
									className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent"
									autoFocus
								/>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1.5">
									What industry are you in?
								</label>
								<div className="grid grid-cols-2 gap-2">
									{industries.map((ind) => (
										<button
											key={ind}
											type="button"
											onClick={() => {
												setIndustry(ind);
											}}
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
						</div>

						<Button
							className="w-full h-12 bg-slate-800 hover:bg-slate-900 text-white text-base font-semibold"
							disabled={!businessName || !industry}
							onClick={() => {
								setStep(2);
								// Auto-select recommended agents for their industry
								if (selectedAgents.length === 0) {
									autoSelectRecommended();
								}
							}}
						>
							Next — Choose Your Agents
							<ArrowRight className="size-4 ml-2" />
						</Button>
					</div>
				)}

				{/* Step 2: Select Agents & Launch */}
				{step === 2 && (
					<div className="max-w-4xl mx-auto space-y-6">
						<div className="text-center mb-6">
							<div className="inline-flex items-center justify-center size-14 rounded-2xl bg-slate-100 mb-4">
								<Users className="size-7 text-slate-800" />
							</div>
							<h2 className="text-2xl font-bold text-gray-900">
								Pick your AI team
							</h2>
							<p className="text-gray-500 mt-1 text-sm">
								We've pre-selected the best agents for{" "}
								{industry}. Adjust as needed — you can always
								add more later.
							</p>
						</div>

						{/* Sticky launch bar */}
						<div className="sticky top-0 z-10 bg-slate-900 text-white rounded-xl px-6 py-4 flex items-center justify-between shadow-lg">
							<div>
								<span className="text-sm text-slate-300">
									{selectedAgents.length} agent
									{selectedAgents.length !== 1 ? "s" : ""}{" "}
									selected
								</span>
								<span className="mx-3 text-slate-600">|</span>
								<span className="font-bold text-lg">
									$
									{(baseMonthlyTotal / 100).toLocaleString()}
									/mo
								</span>
								<span className="text-xs text-slate-400 ml-2">
									(7-day free trial)
								</span>
							</div>
							<Button
								className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold px-6"
								disabled={
									selectedAgents.length === 0 || isSubmitting
								}
								onClick={handleComplete}
							>
								{isSubmitting ? (
									"Deploying..."
								) : (
									<>
										<Rocket className="size-4 mr-2" />
										Launch My Team
									</>
								)}
							</Button>
						</div>

						{/* Recommended banner */}
						{industry && (
							<div className="flex items-center gap-2 px-4 py-2.5 bg-blue-50 text-blue-700 text-xs font-medium rounded-lg">
								<Sparkles className="size-3.5" />
								We pre-selected the top agents for {industry}.
								Tap any agent to add or remove.
							</div>
						)}

						{Object.entries(departments).map(([dept, agents]) => {
							const Icon = departmentIcons[dept] ?? Briefcase;
							const isRecommended =
								recommendedDepts.includes(dept);
							return (
								<div key={dept}>
									<div className="flex items-center gap-2 mb-3">
										<Icon className="size-5 text-slate-700" />
										<h3 className="font-semibold text-gray-900">
											{dept}
										</h3>
										{isRecommended && (
											<span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full">
												Recommended
											</span>
										)}
									</div>
									<div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
										{agents.map((agent) => {
											const isSelected =
												selectedAgents.includes(
													agent._id,
												);
											return (
												<button
													key={agent._id}
													type="button"
													onClick={() =>
														toggleAgent(agent._id)
													}
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
														$
														{(
															agent.basePriceCents /
															100
														).toLocaleString()}
														/mo
													</div>
												</button>
											);
										})}
									</div>
								</div>
							);
						})}

						<div className="flex gap-3 pt-4">
							<Button
								variant="outline"
								className="h-12 px-6"
								onClick={() => setStep(1)}
							>
								<ArrowLeft className="size-4 mr-2" />
								Back
							</Button>
							<Button
								className="flex-1 h-12 bg-slate-800 hover:bg-slate-900 text-white text-base font-semibold"
								disabled={
									selectedAgents.length === 0 || isSubmitting
								}
								onClick={handleComplete}
							>
								{isSubmitting ? (
									"Deploying your team..."
								) : (
									<>
										🚀 Launch My AI Team (
										{selectedAgents.length} agent
										{selectedAgents.length !== 1
											? "s"
											: ""}
										)
									</>
								)}
							</Button>
						</div>

						<p className="text-center text-xs text-gray-400">
							Your 7-day free trial starts today. Billing &
							plan details can be configured after launch.
						</p>
					</div>
				)}
			</div>
		</div>
	);
}
