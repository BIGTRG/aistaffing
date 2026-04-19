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
	Code,
	Scale,
	GraduationCap,
	Database,
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
	"Other",
];

const departmentIcons: Record<string, React.ElementType> = {
	"Executive Suite": Briefcase,
	Management: Users,
	"Customer Service": Headphones,
	Sales: DollarSign,
	Marketing: Megaphone,
	Admin: Database,
	Tech: Code,
	"Legal Support": Scale,
	"HR / Recruiting": GraduationCap,
};

export function OnboardingPage() {
	const navigate = useNavigate();
	const [step, setStep] = useState(1);
	const [businessName, setBusinessName] = useState("");
	const [industry, setIndustry] = useState("");
	const [phone, setPhone] = useState("");
	const [email, setEmail] = useState("");
	const [website, setWebsite] = useState("");
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
		{} as Record<string, typeof templates>
	);

	const toggleAgent = (id: string) => {
		setSelectedAgents((prev) =>
			prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
		);
	};

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
			navigate("/dashboard");
		} catch (err) {
			console.error("Onboarding error:", err);
		} finally {
			setIsSubmitting(false);
		}
	};

	const monthlyTotal = selectedAgents.reduce((sum, id) => {
		const t = templates.find((t) => t._id === id);
		return sum + (t?.basePriceCents ?? 0);
	}, 0);

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
					<div className="flex items-center gap-2 max-w-2xl mx-auto">
						{[1, 2, 3].map((s) => (
							<div key={s} className="flex items-center gap-2 flex-1">
								<div
									className={`flex items-center justify-center size-8 rounded-full text-sm font-semibold transition-colors ${
										step >= s
											? "bg-slate-900 text-white"
											: "bg-gray-200 text-gray-500"
									}`}
								>
									{step > s ? (
										<CheckCircle2 className="size-5" />
									) : (
										s
									)}
								</div>
								<span
									className={`text-sm font-medium hidden sm:block ${
										step >= s ? "text-gray-900" : "text-gray-400"
									}`}
								>
									{s === 1
										? "Your Business"
										: s === 2
											? "Select Agents"
											: "Review & Launch"}
								</span>
								{s < 3 && (
									<div
										className={`flex-1 h-0.5 ${
											step > s ? "bg-slate-900" : "bg-gray-200"
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
								We will tailor your AI team to fit your needs.
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
								Select the agents you want deployed to your
								business. You can add or remove any time.
							</p>
						</div>

						{/* Sticky total bar */}
						{selectedAgents.length > 0 && (
							<div className="sticky top-0 z-10 bg-slate-900 text-white rounded-xl px-6 py-4 flex items-center justify-between shadow-lg">
								<div>
									<span className="text-sm text-slate-300">
										{selectedAgents.length} agent
										{selectedAgents.length !== 1 ? "s" : ""}{" "}
										selected
									</span>
									<span className="mx-3 text-slate-600">|</span>
									<span className="font-bold text-lg">
										${(monthlyTotal / 100).toLocaleString()}/mo
									</span>
								</div>
								<Button
									className="bg-amber-600 hover:bg-amber-700 text-white font-semibold"
									onClick={() => setStep(3)}
								>
									Review Team
									<ArrowRight className="size-4 ml-2" />
								</Button>
							</div>
						)}

						{Object.entries(departments).map(([dept, agents]) => {
							const Icon = departmentIcons[dept] ?? Briefcase;
							return (
								<div key={dept}>
									<div className="flex items-center gap-2 mb-3">
										<Icon className="size-5 text-slate-700" />
										<h3 className="font-semibold text-gray-900">
											{dept}
										</h3>
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
														$
														{(agent.basePriceCents / 100).toLocaleString()}
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
								disabled={selectedAgents.length === 0}
								onClick={() => setStep(3)}
							>
								Review Team ({selectedAgents.length} agent
								{selectedAgents.length !== 1 ? "s" : ""})
								<ArrowRight className="size-4 ml-2" />
							</Button>
						</div>
					</div>
				)}

				{/* Step 3: Review & Launch */}
				{step === 3 && (
					<div className="max-w-2xl mx-auto space-y-6">
						<div className="text-center mb-8">
							<div className="inline-flex items-center justify-center size-14 rounded-2xl bg-emerald-100 mb-4">
								<CheckCircle2 className="size-7 text-emerald-600" />
							</div>
							<h2 className="text-2xl font-bold text-gray-900">
								Review your AI team
							</h2>
							<p className="text-gray-500 mt-2">
								Confirm your selections and launch your agents.
							</p>
						</div>

						{/* Business summary */}
						<Card className="border-gray-200">
							<CardContent className="p-6">
								<h3 className="font-semibold text-gray-900 mb-3">
									Business Details
								</h3>
								<div className="space-y-2 text-sm">
									<div className="flex justify-between">
										<span className="text-gray-500">Name</span>
										<span className="font-medium text-gray-900">
											{businessName}
										</span>
									</div>
									<div className="flex justify-between">
										<span className="text-gray-500">Industry</span>
										<span className="font-medium text-gray-900">
											{industry}
										</span>
									</div>
									{phone && (
										<div className="flex justify-between">
											<span className="text-gray-500">Phone</span>
											<span className="font-medium text-gray-900">
												{phone}
											</span>
										</div>
									)}
									{email && (
										<div className="flex justify-between">
											<span className="text-gray-500">Email</span>
											<span className="font-medium text-gray-900">
												{email}
											</span>
										</div>
									)}
								</div>
							</CardContent>
						</Card>

						{/* Agent list */}
						<Card className="border-gray-200">
							<CardContent className="p-6">
								<h3 className="font-semibold text-gray-900 mb-3">
									Your AI Team
								</h3>
								<div className="divide-y divide-gray-100">
									{selectedAgents.map((id) => {
										const t = templates.find((t) => t._id === id);
										if (!t) return null;
										return (
											<div
												key={id}
												className="flex items-center justify-between py-3"
											>
												<div>
													<p className="font-medium text-sm text-gray-900">
														{t.name}
													</p>
													<p className="text-xs text-gray-500">
														{t.department}
													</p>
												</div>
												<span className="font-semibold text-sm text-slate-800">
													$
													{(
														t.basePriceCents / 100
													).toLocaleString()}
													/mo
												</span>
											</div>
										);
									})}
								</div>
								<div className="border-t border-gray-200 mt-3 pt-3 flex justify-between">
									<span className="font-bold text-gray-900">
										Monthly Total
									</span>
									<span className="font-bold text-lg text-slate-800">
										$
										{(monthlyTotal / 100).toLocaleString()}
										/mo
									</span>
								</div>
							</CardContent>
						</Card>

						<div className="flex gap-3">
							<Button
								variant="outline"
								className="h-12 px-6"
								onClick={() => setStep(2)}
							>
								<ArrowLeft className="size-4 mr-2" />
								Edit Team
							</Button>
							<Button
								className="flex-1 h-12 bg-slate-800 hover:bg-slate-900 text-white text-base font-semibold"
								disabled={isSubmitting}
								onClick={handleComplete}
							>
								{isSubmitting
									? "Deploying your team..."
									: "Launch My AI Team"}
								{!isSubmitting && (
									<ArrowRight className="size-4 ml-2" />
								)}
							</Button>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
