// @ts-nocheck
// import { useApiQuery } from "@/lib/hooks";
import { api } from "@/lib/api";
// import { Link } from "react-router-dom";
import { useState } from "react";
import {
	ArrowRight,
	Check,
	Crown,
	Sparkles,
	Zap,
	Shield,
	Clock,
	TrendingUp,
	Users,
	Calculator,
	ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";

/* ═══════════════════════════════════════════════════
   PUBLIC PRICING PAGE
   Shows pricing tiers, agent costs, ROI calculator
   ═══════════════════════════════════════════════════ */

const TIERS = [
	{
		id: "monthly",
		name: "Monthly",
		badge: null,
		discount: 0,
		commitment: "Month-to-month",
		billing: "Billed monthly",
		color: "border-gray-200",
		popular: false,
	},
	{
		id: "quarterly",
		name: "Quarterly",
		badge: "Save 5%",
		discount: 5,
		commitment: "3-month commitment",
		billing: "Billed every 3 months",
		color: "border-blue-300",
		popular: false,
	},
	{
		id: "semi_annual",
		name: "Semi-Annual",
		badge: "Save 10%",
		discount: 10,
		commitment: "6-month commitment",
		billing: "Billed every 6 months",
		color: "border-amber-300",
		popular: true,
	},
	{
		id: "annual",
		name: "Annual",
		badge: "Save 15%",
		discount: 15,
		commitment: "12-month commitment",
		billing: "Billed annually",
		color: "border-emerald-300",
		popular: false,
	},
];

const STARTER_AGENTS = [
	{ name: "Virtual Receptionist", price: 1257 },
	{ name: "Live Chat Agent", price: 1100 },
	{ name: "Appointment Setter", price: 1100 },
];

const GROWTH_AGENTS = [
	{ name: "Lead Gen Specialist", price: 2202 },
	{ name: "Follow-Up Agent", price: 1572 },
	{ name: "Social Media Manager", price: 1887 },
	{ name: "Email Marketing Agent", price: 1415 },
];

const ENTERPRISE_AGENTS = [
	{ name: "Full-Stack Platform Builder", price: 8500 },
	{ name: "CEO Advisor", price: 12597 },
	{ name: "CFO Advisor", price: 11025 },
	{ name: "AI & ML Engineer", price: 11000 },
];

const PACKAGES = [
	{
		name: "Starter",
		description: "Perfect for small businesses getting started with AI",
		startingAt: 1100,
		agents: STARTER_AGENTS,
		icon: Zap,
		features: [
			"Up to 3 AI agents",
			"Phone, chat & email channels",
			"Business hours configuration",
			"Monthly performance reports",
			"Email support",
		],
		cta: "Start with Starter",
		highlight: false,
		gradient: "from-gray-100 to-gray-50",
	},
	{
		name: "Growth",
		description: "Scale your operations with dedicated AI teams",
		startingAt: 1415,
		agents: GROWTH_AGENTS,
		icon: TrendingUp,
		features: [
			"Up to 10 AI agents",
			"All channels + social media",
			"Custom knowledge base",
			"Sales commission tracking",
			"Priority support",
			"Weekly performance reviews",
			"Custom agent personas",
		],
		cta: "Start with Growth",
		highlight: true,
		gradient: "from-blue-50 to-indigo-50",
	},
	{
		name: "Enterprise",
		description: "Full AI workforce with digital platform building",
		startingAt: 2517,
		agents: ENTERPRISE_AGENTS,
		icon: Crown,
		features: [
			"Unlimited AI agents",
			"All channels + custom integrations",
			"Dedicated account manager",
			"Custom model training",
			"API access",
			"SLA guarantee",
			"White-label options",
			"24/7 priority support",
		],
		cta: "Contact Sales",
		highlight: false,
		gradient: "from-amber-50 to-orange-50",
	},
];

const COMPARISON_ITEMS = [
	{ feature: "Salary", human: "$5,000+/mo", ai: "$630–$12,600/mo" },
	{ feature: "Benefits & Insurance", human: "$1,200+/mo", ai: "$0" },
	{ feature: "Workers' Comp", human: "$300+/mo", ai: "$0" },
	{ feature: "Training Time", human: "2-4 weeks", ai: "48 hours" },
	{ feature: "Availability", human: "40 hrs/week", ai: "24/7/365" },
	{ feature: "Sick Days", human: "10+ days/year", ai: "0" },
	{ feature: "Turnover Risk", human: "High", ai: "Zero" },
	{ feature: "Scalability", human: "Weeks to hire", ai: "48 hours" },
	{ feature: "Platform Building", human: "$50K+ project", ai: "Included" },
];

export function PricingPage() {
	const [selectedTier, setSelectedTier] = useState("semi_annual");
	const [agentCount, setAgentCount] = useState(3);
	const [avgPrice, setAvgPrice] = useState(1415);
	const [showFaq, setShowFaq] = useState<string | null>(null);

	const currentTier = TIERS.find((t) => t.id === selectedTier) ?? TIERS[0];
	const discountedPrice = Math.round(avgPrice * (1 - currentTier.discount / 100));
	const totalMonthly = discountedPrice * agentCount;
	const humanEquivalent = Math.round(totalMonthly * 2.5);
	const savings = humanEquivalent - totalMonthly;

	const FAQS = [
		{
			q: "How quickly can I deploy agents?",
			a: "All agents are deployed within 48 hours of signing up — guaranteed. Onboarding takes just 5 minutes.",
		},
		{
			q: "Can I cancel anytime?",
			a: "Monthly plans can be cancelled anytime. Quarterly and annual plans include a commitment period but you can pause agents when not needed.",
		},
		{
			q: "Do you offer a free trial?",
			a: "Yes! Every new account gets a 7-day free trial with one agent of your choice. No credit card required to start.",
		},
		{
			q: "What channels do the agents work on?",
			a: "Our agents handle phone calls, live chat, email, SMS, and social media messages. Each agent can be configured for specific channels.",
		},
		{
			q: "Can I customize the agents?",
			a: "Absolutely. You can configure business hours, services, pricing info, FAQs, custom instructions, tone of voice, and escalation rules for each agent.",
		},
		{
			q: "What happens if the AI can't handle a request?",
			a: "Agents are configured with escalation rules. They'll seamlessly hand off to your human team when needed, ensuring no customer falls through the cracks.",
		},
	];

	return (
		<div className="bg-[#C8CDD5] text-[#1A1D23] min-h-screen">
			{/* Nav */}
			<nav className="fixed top-0 left-0 right-0 z-50 nav-glass-light">
				<div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-16">
					<Link to="/" className="flex items-center gap-3 group">
						<img src="/logo-white.png" alt="AI Staffing Agency" className="h-9 w-9 brightness-0" />
						<span className="text-sm font-semibold tracking-tight text-[#1A1D23]/80">AI Staffing Agency</span>
					</Link>
					<div className="flex items-center gap-4">
						<Link to="/login" className="text-xs font-medium text-[#1A1D23]/50 hover:text-[#1A1D23] transition-colors uppercase">
							Sign In
						</Link>
						<Link to="/signup">
							<Button size="sm" className="bg-[#1A1D23] hover:bg-[#2A2D33] text-white text-xs font-semibold px-5 h-8 rounded-sm">
								Get Started <ArrowRight className="size-3 ml-1" />
							</Button>
						</Link>
					</div>
				</div>
			</nav>

			{/* Hero */}
			<section className="pt-32 pb-16 px-6 text-center">
				<div className="max-w-3xl mx-auto">
					<div className="inline-flex items-center gap-2 px-3 py-1 border border-[#1A1D23]/20 rounded text-[11px] font-mono uppercase tracking-[0.2em] text-[#1A1D23]/70 bg-white/50 mb-6">
						<Sparkles className="size-3" />
						Transparent Pricing
					</div>
					<h1 className="text-5xl md:text-6xl font-black tracking-tight leading-[1.05] mb-4">
						AI Agents at a{" "}
						<span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2B7AE0] to-[#4A9AF5]">
							Fraction
						</span>{" "}
						of the Cost
					</h1>
					<p className="text-lg text-[#3A3F48]/60 max-w-xl mx-auto">
						Deploy professional AI agents from $630/month. $3,000 one-time setup. Live in 48 hours. 5-minute onboarding.
					</p>
				</div>
			</section>

			{/* Tier Selector */}
			<section className="px-6 pb-8">
				<div className="max-w-xl mx-auto flex gap-2 p-1 bg-white/40 rounded-lg">
					{TIERS.map((tier) => (
						<button
							key={tier.id}
							onClick={() => setSelectedTier(tier.id)}
							className={`flex-1 py-2.5 px-3 rounded-md text-center transition-all ${
								selectedTier === tier.id
									? "bg-[#1A1D23] text-white shadow-sm"
									: "text-[#3A3F48]/60 hover:text-[#1A1D23] hover:bg-white/50"
							}`}
						>
							<div className="text-xs font-semibold">{tier.name}</div>
							{tier.badge && (
								<div className={`text-[10px] mt-0.5 ${
									selectedTier === tier.id ? "text-emerald-300" : "text-emerald-600"
								}`}>
									{tier.badge}
								</div>
							)}
						</button>
					))}
				</div>
			</section>

			{/* Packages */}
			<section className="px-6 pb-20">
				<div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-6">
					{PACKAGES.map((pkg) => {
						const Icon = pkg.icon;
						const price = Math.round(pkg.startingAt * (1 - currentTier.discount / 100));
						return (
							<div
								key={pkg.name}
								className={`relative bg-gradient-to-b ${pkg.gradient} rounded-2xl border ${
									pkg.highlight ? "border-[#2B7AE0] ring-1 ring-[#2B7AE0]/20" : "border-[#1A1D23]/10"
								} p-8 flex flex-col`}
							>
								{pkg.highlight && (
									<div className="absolute -top-3 left-1/2 -translate-x-1/2">
										<span className="bg-[#2B7AE0] text-white text-[10px] font-semibold uppercase tracking-wider px-4 py-1 rounded-full">
											Most Popular
										</span>
									</div>
								)}
								<div className="flex items-center gap-3 mb-4">
									<div className={`size-10 rounded-xl ${pkg.highlight ? "bg-blue-100" : "bg-white/70"} flex items-center justify-center`}>
										<Icon className={`size-5 ${pkg.highlight ? "text-blue-600" : "text-[#1A1D23]/60"}`} />
									</div>
									<div>
										<h3 className="font-bold text-lg">{pkg.name}</h3>
									</div>
								</div>
								<p className="text-sm text-[#3A3F48]/60 mb-6">{pkg.description}</p>
								<div className="mb-6">
									<div className="flex items-baseline gap-1">
										<span className="text-4xl font-black">${price}</span>
										<span className="text-sm text-[#3A3F48]/50">/mo per agent</span>
									</div>
									{currentTier.discount > 0 && (
										<p className="text-xs text-emerald-600 mt-1">
											Save {currentTier.discount}% with {currentTier.name.toLowerCase()} billing
										</p>
									)}
								</div>

								<div className="space-y-3 mb-8 flex-1">
									{pkg.features.map((f) => (
										<div key={f} className="flex items-start gap-2.5">
											<Check className="size-4 text-emerald-500 mt-0.5 flex-shrink-0" />
											<span className="text-sm text-[#3A3F48]/70">{f}</span>
										</div>
									))}
								</div>

								<div className="mb-4">
									<p className="text-xs font-semibold text-[#1A1D23]/40 uppercase tracking-wider mb-2">Popular agents</p>
									{pkg.agents.map((a) => {
										const agentPrice = Math.round(a.price * (1 - currentTier.discount / 100));
										return (
											<div key={a.name} className="flex items-center justify-between py-1.5">
												<span className="text-xs text-[#3A3F48]/60">{a.name}</span>
												<span className="text-xs font-mono font-semibold">${agentPrice}/mo</span>
											</div>
										);
									})}
								</div>

								<Link to="/signup">
									<Button className={`w-full h-11 font-semibold rounded-lg ${
										pkg.highlight
											? "bg-[#2B7AE0] hover:bg-[#2568C0] text-white"
											: "bg-[#1A1D23] hover:bg-[#2A2D33] text-white"
									}`}>
										{pkg.cta}
										<ArrowRight className="size-4 ml-2" />
									</Button>
								</Link>
							</div>
						);
					})}
				</div>
			</section>

			{/* ROI Calculator */}
			<section className="px-6 py-20 bg-[#BFC5CD]">
				<div className="max-w-4xl mx-auto">
					<div className="text-center mb-12">
						<div className="inline-flex items-center gap-2 px-3 py-1 border border-[#1A1D23]/20 rounded text-[11px] font-mono uppercase tracking-[0.2em] text-[#1A1D23]/70 bg-white/50 mb-4">
							<Calculator className="size-3" />
							ROI Calculator
						</div>
						<h2 className="text-3xl md:text-4xl font-bold tracking-tight">See Your Savings</h2>
						<p className="text-[#3A3F48]/50 mt-2">
							Compare your costs: AI agents vs. traditional human staff
						</p>
					</div>

					<div className="bg-white/50 rounded-2xl border border-[#1A1D23]/10 p-8">
						<div className="grid md:grid-cols-2 gap-8">
							{/* Inputs */}
							<div className="space-y-6">
								<div>
									<label className="text-sm font-semibold text-[#1A1D23]/70 mb-2 block">Number of agents</label>
									<input
										type="range"
										min={1}
										max={20}
										value={agentCount}
										onChange={(e) => setAgentCount(parseInt(e.target.value))}
										className="w-full accent-[#2B7AE0]"
									/>
									<div className="flex justify-between text-xs text-[#3A3F48]/50 mt-1">
										<span>1 agent</span>
										<span className="font-bold text-[#1A1D23]">{agentCount} agents</span>
										<span>20 agents</span>
									</div>
								</div>
								<div>
									<label className="text-sm font-semibold text-[#1A1D23]/70 mb-2 block">Average agent price</label>
									<input
										type="range"
										min={630}
										max={12600}
										step={100}
										value={avgPrice}
										onChange={(e) => setAvgPrice(parseInt(e.target.value))}
										className="w-full accent-[#2B7AE0]"
									/>
									<div className="flex justify-between text-xs text-[#3A3F48]/50 mt-1">
										<span>$630/mo</span>
										<span className="font-bold text-[#1A1D23]">${avgPrice.toLocaleString()}/mo</span>
										<span>$12,600/mo</span>
									</div>
								</div>
							</div>

							{/* Results */}
							<div className="space-y-4">
								<div className="bg-red-50 rounded-xl p-5">
									<div className="flex items-center gap-2 mb-1">
										<Users className="size-4 text-red-500" />
										<span className="text-xs font-semibold text-red-600 uppercase tracking-wider">Human staff cost</span>
									</div>
									<div className="text-2xl font-black text-red-700">${humanEquivalent.toLocaleString()}/mo</div>
									<p className="text-xs text-red-500/70 mt-1">Salary + benefits + insurance + training</p>
								</div>
								<div className="bg-emerald-50 rounded-xl p-5">
									<div className="flex items-center gap-2 mb-1">
										<Zap className="size-4 text-emerald-500" />
										<span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">AI agent cost</span>
									</div>
									<div className="text-2xl font-black text-emerald-700">${totalMonthly.toLocaleString()}/mo</div>
									<p className="text-xs text-emerald-500/70 mt-1">
										{agentCount} agents × ${discountedPrice}/mo ({currentTier.name})
									</p>
								</div>
								<div className="bg-blue-50 rounded-xl p-5">
									<div className="flex items-center gap-2 mb-1">
										<TrendingUp className="size-4 text-blue-500" />
										<span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Your savings</span>
									</div>
									<div className="text-3xl font-black text-blue-700">${savings.toLocaleString()}/mo</div>
									<p className="text-xs text-blue-500/70 mt-1">
										That's ${(savings * 12).toLocaleString()} per year
									</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Human vs AI Comparison */}
			<section className="px-6 py-20">
				<div className="max-w-4xl mx-auto">
					<div className="text-center mb-12">
						<h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
							Human Staff vs. AI Agents
						</h2>
						<p className="text-[#3A3F48]/50">
							See exactly why businesses are switching to AI-powered staffing
						</p>
					</div>
					<div className="bg-white/40 rounded-2xl border border-[#1A1D23]/10 overflow-hidden">
						<div className="grid grid-cols-3 gap-px bg-[#1A1D23]/5">
							<div className="bg-[#C8CDD5] p-4">
								<span className="text-xs font-semibold uppercase tracking-wider text-[#1A1D23]/40">Feature</span>
							</div>
							<div className="bg-[#C8CDD5] p-4 text-center">
								<span className="text-xs font-semibold uppercase tracking-wider text-red-500">Human Staff</span>
							</div>
							<div className="bg-[#C8CDD5] p-4 text-center">
								<span className="text-xs font-semibold uppercase tracking-wider text-emerald-600">AI Agents</span>
							</div>
						</div>
						{COMPARISON_ITEMS.map((item, i) => (
							<div key={item.feature} className={`grid grid-cols-3 gap-px ${i % 2 === 0 ? "bg-white/30" : "bg-white/50"}`}>
								<div className="p-4">
									<span className="text-sm font-medium text-[#1A1D23]">{item.feature}</span>
								</div>
								<div className="p-4 text-center">
									<span className="text-sm text-red-600 font-mono">{item.human}</span>
								</div>
								<div className="p-4 text-center">
									<span className="text-sm text-emerald-600 font-semibold">{item.ai}</span>
								</div>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* FAQ */}
			<section className="px-6 py-20 bg-[#BFC5CD]">
				<div className="max-w-3xl mx-auto">
					<div className="text-center mb-12">
						<h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
							Frequently Asked Questions
						</h2>
					</div>
					<div className="space-y-3">
						{FAQS.map((faq) => (
							<div
								key={faq.q}
								className="bg-white/50 rounded-xl border border-[#1A1D23]/10 overflow-hidden"
							>
								<button
									onClick={() => setShowFaq(showFaq === faq.q ? null : faq.q)}
									className="w-full flex items-center justify-between p-5 text-left"
								>
									<span className="font-semibold text-sm text-[#1A1D23]">{faq.q}</span>
									<ChevronDown className={`size-4 text-[#1A1D23]/40 transition-transform ${
										showFaq === faq.q ? "rotate-180" : ""
									}`} />
								</button>
								{showFaq === faq.q && (
									<div className="px-5 pb-5">
										<p className="text-sm text-[#3A3F48]/60 leading-relaxed">{faq.a}</p>
									</div>
								)}
							</div>
						))}
					</div>
				</div>
			</section>

			{/* CTA */}
			<section className="px-6 py-20 text-center">
				<div className="max-w-2xl mx-auto">
					<h2 className="text-4xl font-black tracking-tight mb-4">
						Ready to Build Your AI Team?
					</h2>
					<p className="text-[#3A3F48]/50 text-lg mb-8">
						Join hundreds of businesses that replaced expensive temps with 24/7 AI agents.
					</p>
					<div className="flex flex-col sm:flex-row gap-4 justify-center">
						<Link to="/signup">
							<Button size="lg" className="bg-[#F27A2E] hover:bg-[#d96a24] text-white text-sm font-semibold h-12 px-8 rounded-sm shadow-[0_0_30px_rgba(242,122,46,0.25)]">
								Get Started Free
								<ArrowRight className="size-4 ml-2" />
							</Button>
						</Link>
						<Link to="/">
							<Button variant="outline" size="lg" className="border-[#1A1D23]/20 text-[#1A1D23] hover:bg-white/50 h-12 px-8 rounded-sm">
								Back to Home
							</Button>
						</Link>
					</div>
					<div className="flex items-center justify-center gap-6 mt-8 text-xs text-[#3A3F48]/40">
						<span className="flex items-center gap-1"><Shield className="size-3" /> 7-day free trial</span>
						<span className="flex items-center gap-1"><Clock className="size-3" /> Deploy in 48hrs</span>
						<span className="flex items-center gap-1"><Zap className="size-3" /> Cancel anytime</span>
					</div>
				</div>
			</section>

			{/* Footer */}
			<footer className="border-t border-[#1A1D23]/10 py-8 px-6">
				<div className="max-w-6xl mx-auto flex items-center justify-between">
					<span className="text-xs text-[#3A3F48]/40">© {new Date().getFullYear()} AI Staffing Agency</span>
					<Link to="/" className="text-xs text-[#3A3F48]/40 hover:text-[#1A1D23] transition-colors">
						Home
					</Link>
				</div>
			</footer>
		</div>
	);
}
