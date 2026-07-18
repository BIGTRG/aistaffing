// @ts-nocheck
import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	Bot,
	Building2,
	Clock,
	DollarSign,
	Globe,
	HelpCircle,
	MessageSquare,
	Phone,
	Save,
	Settings,
	Sparkles,
	User,
	FileText,
	CheckCircle2,
	AlertTriangle,
} from "lucide-react";

interface AgentConfigPanelProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	deployment: any;
}

const toneOptions = [
	{ value: "professional", label: "Professional", desc: "Formal, business-appropriate" },
	{ value: "friendly", label: "Friendly", desc: "Warm and approachable" },
	{ value: "casual", label: "Casual", desc: "Relaxed and conversational" },
	{ value: "formal", label: "Formal", desc: "Very structured and polished" },
	{ value: "empathetic", label: "Empathetic", desc: "Understanding and supportive" },
];

export function AgentConfigPanel({
	open,
	onOpenChange,
	deployment,
}: AgentConfigPanelProps) {
	const updateConfig = async (...args: any[]) => api.deployments.updateConfig(...args);
	const [saving, setSaving] = useState(false);
	const [saved, setSaved] = useState(false);
	const [activeTab, setActiveTab] = useState("knowledge");

	// Form state
	const [displayName, setDisplayName] = useState(deployment?.displayName ?? "");
	const [businessHours, setBusinessHours] = useState("");
	const [services, setServices] = useState("");
	const [pricing, setPricing] = useState("");
	const [faqs, setFaqs] = useState("");
	const [phoneRouting, setPhoneRouting] = useState("");
	const [websiteUrl, setWebsiteUrl] = useState("");
	const [customInstructions, setCustomInstructions] = useState("");
	const [tone, setTone] = useState("professional");
	const [greeting, setGreeting] = useState("");
	const [escalationRules, setEscalationRules] = useState("");

	// Initialize from deployment config
	useEffect(() => {
		if (deployment) {
			setDisplayName(deployment.displayName ?? "");
			const c = deployment.config ?? {};
			setBusinessHours(c.businessHours ?? "");
			setServices(c.services ?? "");
			setPricing(c.pricing ?? "");
			setFaqs(c.faqs ?? "");
			setPhoneRouting(c.phoneRouting ?? "");
			setWebsiteUrl(c.websiteUrl ?? "");
			setCustomInstructions(c.customInstructions ?? "");
			setTone(c.tone ?? "professional");
			setGreeting(c.greeting ?? "");
			setEscalationRules(c.escalationRules ?? "");
		}
	}, [deployment]);

	const handleSave = async () => {
		if (!deployment) return;
		setSaving(true);
		try {
			await updateConfig({
				deploymentId: deployment.id,
				displayName: displayName || undefined,
				config: {
					businessHours: businessHours || undefined,
					services: services || undefined,
					pricing: pricing || undefined,
					faqs: faqs || undefined,
					phoneRouting: phoneRouting || undefined,
					websiteUrl: websiteUrl || undefined,
					customInstructions: customInstructions || undefined,
					tone: tone || undefined,
					greeting: greeting || undefined,
					escalationRules: escalationRules || undefined,
				},
			});
			setSaved(true);
			setTimeout(() => setSaved(false), 3000);
		} catch (err) {
			console.error("Save failed:", err);
		} finally {
			setSaving(false);
		}
	};

	const templateName = deployment?.template?.name ?? "Agent";
	const department = deployment?.template?.department ?? "";

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto p-0">
				<DialogHeader className="px-6 pt-6 pb-0">
					<div className="flex items-center gap-3">
						<div className="size-10 rounded-xl bg-slate-100 flex items-center justify-center">
							<Settings className="size-5 text-slate-700" />
						</div>
						<div>
							<DialogTitle className="text-lg">
								Configure {deployment?.displayName}
							</DialogTitle>
							<p className="text-sm text-gray-500">
								{department} · {templateName}
							</p>
						</div>
					</div>
				</DialogHeader>

				<Tabs value={activeTab} onValueChange={setActiveTab} className="px-6 pb-6">
					<TabsList className="w-full grid grid-cols-4 mb-4">
						<TabsTrigger value="knowledge" className="text-xs">
							<Building2 className="size-3.5 mr-1.5" />
							Knowledge
						</TabsTrigger>
						<TabsTrigger value="routing" className="text-xs">
							<Phone className="size-3.5 mr-1.5" />
							Routing
						</TabsTrigger>
						<TabsTrigger value="persona" className="text-xs">
							<User className="size-3.5 mr-1.5" />
							Persona
						</TabsTrigger>
						<TabsTrigger value="instructions" className="text-xs">
							<FileText className="size-3.5 mr-1.5" />
							Instructions
						</TabsTrigger>
					</TabsList>

					{/* Knowledge Base Tab */}
					<TabsContent value="knowledge" className="space-y-4 mt-0">
						<div className="bg-blue-50 rounded-lg p-3 flex items-start gap-2.5">
							<Sparkles className="size-4 text-blue-600 mt-0.5 flex-shrink-0" />
							<p className="text-xs text-blue-800">
								The more your agent knows about your business, the better it can help visitors.
								Fill in what applies — you can always update later.
							</p>
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1.5">
								<Clock className="size-3.5 inline mr-1.5" />
								Business Hours
							</label>
							<input
								type="text"
								value={businessHours}
								onChange={(e) => setBusinessHours(e.target.value)}
								placeholder="Mon-Fri 9am-5pm EST, Sat 10am-2pm"
								className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent"
							/>
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1.5">
								<Building2 className="size-3.5 inline mr-1.5" />
								Services Offered
							</label>
							<textarea
								value={services}
								onChange={(e) => setServices(e.target.value)}
								placeholder="List your main services, e.g.&#10;- Deep cleaning ($150-300)&#10;- Regular cleaning ($80-150)&#10;- Move-in/out cleaning ($200-400)"
								rows={4}
								className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent resize-none"
							/>
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1.5">
								<DollarSign className="size-3.5 inline mr-1.5" />
								Pricing Information
							</label>
							<textarea
								value={pricing}
								onChange={(e) => setPricing(e.target.value)}
								placeholder="Describe your pricing structure, packages, discounts..."
								rows={3}
								className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent resize-none"
							/>
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1.5">
								<HelpCircle className="size-3.5 inline mr-1.5" />
								FAQs
							</label>
							<textarea
								value={faqs}
								onChange={(e) => setFaqs(e.target.value)}
								placeholder="Q: Do you bring your own supplies?&#10;A: Yes, we bring all cleaning supplies and equipment.&#10;&#10;Q: What's your cancellation policy?&#10;A: Cancel 24 hours in advance for a full refund."
								rows={5}
								className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent resize-none"
							/>
						</div>
					</TabsContent>

					{/* Routing Tab */}
					<TabsContent value="routing" className="space-y-4 mt-0">
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1.5">
								<Phone className="size-3.5 inline mr-1.5" />
								Phone Number for Call Routing
							</label>
							<input
								type="tel"
								value={phoneRouting}
								onChange={(e) => setPhoneRouting(e.target.value)}
								placeholder="(555) 123-4567"
								className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent"
							/>
							<p className="text-xs text-gray-500 mt-1.5">
								When the agent can't handle a request, calls will be forwarded to this number.
							</p>
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1.5">
								<Globe className="size-3.5 inline mr-1.5" />
								Website URL
							</label>
							<div className="flex gap-2">
								<input
									type="url"
									value={websiteUrl}
									onChange={(e) => setWebsiteUrl(e.target.value)}
									placeholder="https://yourcompany.com"
									className="flex-1 rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent"
								/>
								<Button
									variant="outline"
									size="sm"
									className="h-auto px-3 whitespace-nowrap"
									disabled={!websiteUrl}
								>
									<Globe className="size-3.5 mr-1.5" />
									Pull Info
								</Button>
							</div>
							<p className="text-xs text-gray-500 mt-1.5">
								We'll scrape your website to auto-fill the agent's knowledge base with your services, pricing, and FAQs.
							</p>
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1.5">
								<AlertTriangle className="size-3.5 inline mr-1.5" />
								Escalation Rules
							</label>
							<textarea
								value={escalationRules}
								onChange={(e) => setEscalationRules(e.target.value)}
								placeholder="Define when the agent should escalate to a human:&#10;- Complaints or angry customers&#10;- Requests over $500&#10;- Legal questions&#10;- Technical emergencies"
								rows={4}
								className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent resize-none"
							/>
						</div>
					</TabsContent>

					{/* Persona Tab */}
					<TabsContent value="persona" className="space-y-4 mt-0">
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1.5">
								<Bot className="size-3.5 inline mr-1.5" />
								Agent Display Name
							</label>
							<input
								type="text"
								value={displayName}
								onChange={(e) => setDisplayName(e.target.value)}
								placeholder="e.g. Sarah, Max, Alex"
								className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent"
							/>
							<p className="text-xs text-gray-500 mt-1.5">
								The name visitors will see when chatting with this agent.
							</p>
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">
								<Sparkles className="size-3.5 inline mr-1.5" />
								Conversation Tone
							</label>
							<div className="grid grid-cols-1 gap-2">
								{toneOptions.map((opt) => (
									<button
										key={opt.value}
										type="button"
										onClick={() => setTone(opt.value)}
										className={`rounded-lg border px-4 py-3 text-left transition-all ${
											tone === opt.value
												? "border-slate-800 bg-slate-50 ring-1 ring-slate-800"
												: "border-gray-200 hover:border-gray-300"
										}`}
									>
										<div className="flex items-center justify-between">
											<div>
												<p className="text-sm font-medium text-gray-900">
													{opt.label}
												</p>
												<p className="text-xs text-gray-500">{opt.desc}</p>
											</div>
											{tone === opt.value && (
												<CheckCircle2 className="size-4 text-slate-800" />
											)}
										</div>
									</button>
								))}
							</div>
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1.5">
								<MessageSquare className="size-3.5 inline mr-1.5" />
								Custom Greeting
							</label>
							<textarea
								value={greeting}
								onChange={(e) => setGreeting(e.target.value)}
								placeholder="Hi! 👋 Welcome to [Your Business]. I'm here to help you with scheduling, quotes, and any questions. How can I assist you today?"
								rows={3}
								className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent resize-none"
							/>
						</div>
					</TabsContent>

					{/* Instructions Tab */}
					<TabsContent value="instructions" className="space-y-4 mt-0">
						<div className="bg-amber-50 rounded-lg p-3 flex items-start gap-2.5">
							<FileText className="size-4 text-amber-600 mt-0.5 flex-shrink-0" />
							<p className="text-xs text-amber-800">
								Custom instructions let you fine-tune exactly how your agent behaves. 
								Be specific — include do's and don'ts for your business context.
							</p>
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1.5">
								Custom Instructions
							</label>
							<textarea
								value={customInstructions}
								onChange={(e) => setCustomInstructions(e.target.value)}
								placeholder={`Example instructions for a ${templateName}:\n\n- Always greet callers by name if available\n- Offer a 10% first-time customer discount\n- Never discuss competitor pricing\n- If asked about availability, check our booking system\n- For urgent requests, offer same-day service at premium rate\n- Always confirm email and phone before ending conversation`}
								rows={12}
								className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent resize-none font-mono"
							/>
						</div>
					</TabsContent>

					{/* Save Button */}
					<div className="flex items-center justify-between pt-4 border-t border-gray-200 mt-4">
						<div>
							{saved && (
								<span className="text-sm text-emerald-600 flex items-center gap-1.5">
									<CheckCircle2 className="size-4" />
									Configuration saved
								</span>
							)}
						</div>
						<div className="flex gap-2">
							<Button
								variant="outline"
								onClick={() => onOpenChange(false)}
							>
								Cancel
							</Button>
							<Button
								className="bg-slate-800 hover:bg-slate-900 text-white"
								onClick={handleSave}
								disabled={saving}
							>
								{saving ? (
									"Saving..."
								) : (
									<>
										<Save className="size-4 mr-1.5" />
										Save Configuration
									</>
								)}
							</Button>
						</div>
					</div>
				</Tabs>
			</DialogContent>
		</Dialog>
	);
}
