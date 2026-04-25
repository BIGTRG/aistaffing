import { useConvexAuth } from "convex/react";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, Check, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ROICalculator } from "@/components/ROICalculator";
import { GuaranteeBadge } from "@/components/GuaranteeBadge";

/* ═══════════════════════════════════════════════════════
   AI STAFFING AGENCY — CUSTOM LANDING PAGE
   Theme: Silver & Light — Dark Trim Edition
   ═══════════════════════════════════════════════════════ */

/* ─── DATA ─── */
const DEPARTMENTS = [
	{ name: "Front Office", agents: ["Virtual Receptionist", "Phone Triage Agent", "Live Chat Agent", "Appointment Setter", "After-Hours Answering", "Bilingual Receptionist", "Queue Manager", "Visitor Check-In Agent", "Email Triage Agent", "Callback Scheduler"], count: 10 },
	{ name: "Sales", agents: ["Lead Gen Specialist", "Follow-Up Agent", "BDC Agent", "Quote Generator", "Pipeline Manager", "Cold Outreach Agent", "Upsell Specialist", "Contract Closer", "Sales Forecaster", "Demo Scheduler"], count: 10 },
	{ name: "Marketing", agents: ["Social Media Manager", "Content Writer", "SEO Specialist", "Email Marketing Agent", "Ad Campaign Manager", "Brand Monitor", "PR / Outreach Agent", "Analytics Reporter", "Video Content Planner", "Influencer Coordinator"], count: 10 },
	{ name: "Customer Success", agents: ["Onboarding Specialist", "Retention Agent", "Review Manager", "Customer Feedback Analyst", "Loyalty Program Manager", "Renewal Agent", "NPS Survey Agent", "Issue Escalation Agent", "Help Desk Tier 1", "Knowledge Base Manager"], count: 10 },
	{ name: "Operations", agents: ["Project Manager", "Inventory Tracker", "Dispatch Coordinator", "Process Optimizer", "Compliance Monitor", "Quality Assurance Agent", "Vendor Manager", "Fleet / Asset Tracker", "Shift Scheduler", "Report Generator"], count: 10 },
	{ name: "Finance & Billing", agents: ["Invoice Manager", "Collections Agent", "Payroll Assistant", "Expense Tracker", "Budget Analyst", "Financial Reporter", "Tax Prep Assistant", "Payment Processor", "Accounts Receivable Agent", "Revenue Forecaster"], count: 10 },
	{ name: "HR & Recruiting", agents: ["Resume Screener", "Interview Scheduler", "Employee Onboarding Agent", "Benefits Coordinator", "Time-Off Manager", "Performance Review Agent", "Training Coordinator", "Candidate Outreach Agent", "Policy Compliance Agent", "Workplace Culture Agent"], count: 10 },
	{ name: "IT & Tech Support", agents: ["IT Help Desk", "Website Monitor", "Security Alert Agent", "Password Reset Agent", "System Admin Assistant", "Software License Manager", "Data Backup Monitor", "Network Monitor", "Cloud Infrastructure Monitor", "API Integration Agent"], count: 10 },
	{ name: "Legal & Compliance", agents: ["Contract Review Assistant", "NDA Generator", "Compliance Checker", "Regulatory Monitor", "Privacy (GDPR/CCPA) Agent", "Dispute Resolution Agent", "IP Monitor", "Document Filing Agent", "Legal Research Agent", "Trademark Watch Agent"], count: 10 },
	{ name: "Executive & Strategy", agents: ["CEO Advisor", "CFO Advisor", "CTO Advisor", "COO / President", "Business Intelligence Agent", "Market Research Agent", "Competitive Intel Agent", "Risk Assessment Agent", "Board Report Generator", "Strategic Planning Agent"], count: 10 },
];

const INDUSTRY_LINKS = [
	{ name: "Legal Firms", slug: "legal-firms", icon: "⚖️" },
	{ name: "Medical & Healthcare", slug: "medical-healthcare", icon: "🏥" },
	{ name: "Insurance", slug: "insurance", icon: "🛡️" },
	{ name: "Dental Offices", slug: "dental-offices", icon: "🦷" },
	{ name: "Veterinary Clinics", slug: "veterinary-clinics", icon: "🐾" },
	{ name: "Real Estate", slug: "real-estate", icon: "🏠" },
	{ name: "Auto Dealerships", slug: "auto-dealerships", icon: "🚗" },
	{ name: "Restaurants & Hospitality", slug: "restaurants-hospitality", icon: "🍽️" },
	{ name: "Pool Services", slug: "pool-services", icon: "🏊" },
	{ name: "Plumbing & HVAC", slug: "plumbing-hvac", icon: "🔧" },
	{ name: "Landscaping", slug: "landscaping", icon: "🌿" },
	{ name: "Construction", slug: "construction", icon: "🏗️" },
	{ name: "Property Management", slug: "property-management", icon: "🏢" },
	{ name: "Salons & Spas", slug: "salons-spas", icon: "💇" },
	{ name: "Technology Companies", slug: "technology-companies", icon: "💻" },
	{ name: "E-Commerce", slug: "e-commerce", icon: "🛒" },
	{ name: "Financial Services", slug: "financial-services", icon: "📊" },
	{ name: "Education", slug: "education", icon: "📚" },
	{ name: "Logistics & Shipping", slug: "logistics-shipping", icon: "🚛" },
	{ name: "Cleaning Services", slug: "cleaning-services", icon: "🧹" },
	{ name: "Roofing", slug: "roofing", icon: "🏠" },
	{ name: "Fitness & Gyms", slug: "fitness-gyms", icon: "💪" },
	{ name: "Accounting Firms", slug: "accounting-firms", icon: "📋" },
	{ name: "Consulting", slug: "consulting", icon: "🎯" },
	{ name: "Nonprofits", slug: "nonprofits", icon: "🤝" },
];

const COMPARISON = [
	{ old: "Human workers on a roster", new: "AI agents ready to deploy" },
	{ old: "Client pays hourly + markup", new: "Flat monthly subscription" },
	{ old: "One worker per client", new: "Unlimited capacity per agent" },
	{ old: "You handle payroll & insurance", new: "Zero liability, ever" },
	{ old: "Weeks to hire & train", new: "Live in under 24 hours" },
	{ old: "Workers call in sick", new: "24/7/365 — no exceptions" },
];

/* ─── HOOKS ─── */
function useScrollReveal() {
	const ref = useRef<HTMLDivElement>(null);
	const [animated, setAnimated] = useState(false);
	useEffect(() => {
		const el = ref.current;
		if (!el) return;
		const obs = new IntersectionObserver(
			([e]) => { if (e.isIntersecting) { setAnimated(true); obs.disconnect(); } },
			{ threshold: 0.05, rootMargin: "0px 0px 50px 0px" }
		);
		obs.observe(el);
		return () => obs.disconnect();
	}, []);
	return { ref, animated };
}

function useTypingText(text: string, speed = 60, startDelay = 800) {
	const [displayed, setDisplayed] = useState("");
	const [started, setStarted] = useState(false);
	useEffect(() => {
		const t = setTimeout(() => setStarted(true), startDelay);
		return () => clearTimeout(t);
	}, [startDelay]);
	useEffect(() => {
		if (!started) return;
		let i = 0;
		const iv = setInterval(() => {
			i++;
			setDisplayed(text.slice(0, i));
			if (i >= text.length) clearInterval(iv);
		}, speed);
		return () => clearInterval(iv);
	}, [text, speed, started]);
	return displayed;
}

/* ─── COMPONENTS ─── */

function GridBackground() {
	return (
		<div className="absolute inset-0 overflow-hidden pointer-events-none">
			{/* Subtle grid on silver */}
			<div className="absolute inset-0 grid-bg opacity-[0.04]" />
			{/* Radial glow */}
			<div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#2B7AE0] opacity-[0.06] blur-[140px]" />
			{/* Corner accent */}
			<div className="absolute -bottom-20 -right-20 w-[400px] h-[400px] rounded-full bg-[#F27A2E] opacity-[0.04] blur-[100px]" />
		</div>
	);
}

function HudBadge({ children }: { children: React.ReactNode }) {
	return (
		<div className="inline-flex items-center gap-2 px-3 py-1 border border-[#1A1D23]/20 rounded text-[11px] font-mono uppercase tracking-[0.2em] text-[#1A1D23]/70 bg-white/50">
			<span className="w-1.5 h-1.5 rounded-full bg-[#2B7AE0] animate-pulse" />
			{children}
		</div>
	);
}

function StatBlock({ value, label }: { value: string; label: string }) {
	return (
		<div className="text-center px-6">
			<div className="text-3xl md:text-4xl font-bold text-[#1A1D23] font-mono tracking-tight">{value}</div>
			<div className="text-[11px] uppercase tracking-[0.15em] text-[#5A6070] mt-1">{label}</div>
		</div>
	);
}

function SectionTag({ children }: { children: React.ReactNode }) {
	return (
		<div className="flex items-center gap-3 mb-6">
			<div className="w-8 h-px bg-[#F27A2E]" />
			<span className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#F27A2E]">{children}</span>
		</div>
	);
}

/* ─── MAIN PAGE ─── */

export function LandingPage() {
	const { isAuthenticated, isLoading } = useConvexAuth();
	const typedTagline = useTypingText("When you sleep, your staff doesn't.", 55, 600);

	const mission = useScrollReveal();
	const agents = useScrollReveal();
	const compare = useScrollReveal();
	const howIt = useScrollReveal();
	const industries = useScrollReveal();
	const pricing = useScrollReveal();

	return (
		<div className="bg-[#C8CDD5] text-[#1A1D23] overflow-x-hidden">

			{/* ═══════════════════ NAV ═══════════════════ */}
			<nav className="fixed top-0 left-0 right-0 z-50 nav-glass-light">
				<div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-16">
					<Link to="/" className="flex items-center gap-3 group">
						<img src="/logo-white.png" alt="AI Staffing Agency" className="h-9 w-9 transition-transform group-hover:scale-105 brightness-0" />
						<span className="text-sm font-semibold tracking-tight text-[#1A1D23]/80">AI Staffing Agency</span>
					</Link>
					<div className="hidden md:flex items-center gap-8">
						<a href="#agents" className="text-xs font-medium tracking-wide text-[#1A1D23]/40 hover:text-[#1A1D23] transition-colors uppercase">Agents</a>
						<a href="#roi-calculator" className="text-xs font-medium tracking-wide text-[#1A1D23]/40 hover:text-[#1A1D23] transition-colors uppercase">ROI Calculator</a>
						<Link to="/pricing" className="text-xs font-medium tracking-wide text-[#1A1D23]/40 hover:text-[#1A1D23] transition-colors uppercase">Pricing</Link>
						<a href="#industries" className="text-xs font-medium tracking-wide text-[#1A1D23]/40 hover:text-[#1A1D23] transition-colors uppercase">Industries</a>
						{isAuthenticated ? (
							<Link to="/employer/dashboard">
								<Button size="sm" className="bg-[#1A1D23] hover:bg-[#2A2D33] text-white text-xs font-semibold px-5 h-8 rounded-sm">
									Dashboard <ArrowRight className="size-3 ml-1" />
								</Button>
							</Link>
						) : (
							<>
								<Link to="/login" className="text-xs font-medium tracking-wide text-[#1A1D23]/40 hover:text-[#1A1D23] transition-colors uppercase">Sign In</Link>
								<Link to="/signup">
									<Button size="sm" className="bg-[#1A1D23] hover:bg-[#2A2D33] text-white text-xs font-semibold px-5 h-8 rounded-sm">
										Get Started <ArrowRight className="size-3 ml-1" />
									</Button>
								</Link>
							</>
						)}
					</div>
				</div>
			</nav>

			{/* ═══════════════════ HERO ═══════════════════ */}
			<section className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-16">
				<GridBackground />

				<div className="relative z-10 max-w-5xl mx-auto text-center space-y-8">
					<HudBadge>Systems Online — Deploying Agents</HudBadge>

					<h1 className="hero-title text-[clamp(2.5rem,8vw,7rem)] font-black leading-[0.9] tracking-[-0.03em]">
						<span className="block text-[#1A1D23]">YOUR STAFF</span>
						<span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#2B7AE0] via-[#4A9AF5] to-[#2B7AE0]">
							NEVER SLEEPS
						</span>
					</h1>

					<p className="font-mono text-sm md:text-base text-[#3A3F48]/70 max-w-xl mx-auto h-6">
						{typedTagline}<span className="animate-pulse text-[#1A1D23]/40">▊</span>
					</p>

					<p className="text-base md:text-lg text-[#3A3F48]/60 max-w-2xl mx-auto leading-relaxed">
						The first staffing agency that deploys <span className="text-[#1A1D23] font-medium">AI agents</span> instead
						of human temps. Receptionists, sales reps, C-suite advisors — deployed to your business
						in under 24 hours. <span className="text-[#F27A2E] font-semibold">No liability. No insurance. No days off.</span>
					</p>

					{!isAuthenticated && !isLoading && (
						<div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
							<Link to="/signup">
								<Button size="lg" className="bg-[#F27A2E] hover:bg-[#d96a24] text-white text-sm font-semibold h-12 px-8 rounded-sm shadow-[0_0_30px_rgba(242,122,46,0.25)] hover:shadow-[0_0_40px_rgba(242,122,46,0.35)] transition-all">
									Go to Dashboard
									<ArrowRight className="size-4 ml-2" />
								</Button>
							</Link>
						</div>
					)}
					{isAuthenticated && (
						<div className="pt-4">
							<Link to="/employer/dashboard">
								<Button size="lg" className="bg-[#F27A2E] hover:bg-[#d96a24] text-white text-sm font-semibold h-12 px-8 rounded-sm shadow-[0_0_30px_rgba(242,122,46,0.25)]">
									Go to Dashboard <ArrowRight className="size-4 ml-2" />
								</Button>
							</Link>
						</div>
					)}
				</div>

				{/* Stats */}
				<div className="relative z-10 mt-auto mb-12 w-full max-w-4xl mx-auto">
					<div className="flex items-center justify-center divide-x divide-[#1A1D23]/10">
						<StatBlock value="24/7" label="Availability" />
						<StatBlock value="<24h" label="Deploy Time" />
						<StatBlock value="$0" label="Workers' Comp" />
						<StatBlock value="100" label="Agent Roles" />
					</div>
				</div>

				{/* Scroll indicator */}
				<div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-[#1A1D23]/20">
					<span className="text-[10px] uppercase tracking-[0.3em] font-mono">Scroll</span>
					<div className="w-px h-8 bg-gradient-to-b from-[#1A1D23]/20 to-transparent scroll-pulse" />
				</div>
			</section>

			{/* ═══════════════════ TICKER ═══════════════════ */}
			<div className="border-y border-[#1A1D23]/8 bg-[#BFC5CD] py-3 overflow-hidden">
				<div className="ticker-track">
					{[...Array(2)].map((_, copy) => (
						<div key={copy} className="ticker-content">
							{["⬡ 100 AI AGENTS READY", "⬡ 10 DEPARTMENTS", "⬡ 25 INDUSTRIES", "⬡ DEPLOY IN 24 HRS", "⬡ $0 WORKERS COMP", "⬡ 24/7 OPERATIONS", "⬡ 95% MARGIN TARGET", "⬡ FROM $199/MO"].map((t) => (
								<span key={`${copy}-${t}`} className="text-[11px] font-mono uppercase tracking-[0.15em] text-[#1A1D23]/20 whitespace-nowrap px-8">{t}</span>
							))}
						</div>
					))}
				</div>
			</div>

			{/* ═══════════════════ THE MISSION ═══════════════════ */}
			<section ref={mission.ref} className={`py-24 md:py-32 px-6 transition-all duration-1000 ${mission.animated ? "opacity-100 translate-y-0" : "opacity-90 translate-y-2"}`}>
				<div className="max-w-7xl mx-auto grid lg:grid-cols-[1.2fr_1fr] gap-16 items-start">
					<div>
						<SectionTag>The Mission</SectionTag>
						<h2 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.05] tracking-tight mb-8 text-[#1A1D23]">
							A Real Staffing Agency.{" "}
							<span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2B7AE0] to-[#4A9AF5]">Powered&nbsp;by&nbsp;AI.</span>
						</h2>
						<p className="text-[#3A3F48]/60 text-lg leading-relaxed max-w-lg">
							We operate exactly like a traditional staffing agency — but instead of placing
							human workers, we deploy intelligent AI agents. Same process. Better results.
							A fraction of the cost.
						</p>
					</div>

					<div className="space-y-6 pt-4">
						{[
							{ num: "01", title: "Zero Liability", desc: "No workers' comp, no insurance, no HR issues, no payroll taxes." },
							{ num: "02", title: "24/7 Operations", desc: "No sick days. No vacations. Always on, always professional." },
							{ num: "03", title: "Instant Deploy", desc: "Tell us about your business, agent is live within 24 hours." },
							{ num: "04", title: "We Build Your Setup", desc: "No tech team? We build the phone system, portal, and tools." },
							{ num: "05", title: "Multi-Channel", desc: "Phone, email, chat, social media — every channel covered." },
							{ num: "06", title: "Unlimited Scale", desc: "Add more agents as you grow. No recruiting, no turnover." },
						].map((f) => (
							<div key={f.num} className="group flex gap-5 p-4 -mx-4 rounded-lg hover:bg-[#1A1D23]/[0.03] transition-colors">
								<span className="text-xs font-mono text-[#F27A2E]/70 mt-1 shrink-0">{f.num}</span>
								<div>
									<h3 className="text-sm font-semibold text-[#1A1D23] mb-1">{f.title}</h3>
									<p className="text-sm text-[#3A3F48]/50 leading-relaxed">{f.desc}</p>
								</div>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* ═══════════════════ AGENT DEPLOYMENT MANIFEST ═══════════════════ */}
			<section ref={agents.ref} id="agents" className={`py-24 md:py-32 px-6 bg-[#BFC5CD] transition-all duration-1000 ${agents.animated ? "opacity-100 translate-y-0" : "opacity-90 translate-y-2"}`}>
				<div className="max-w-7xl mx-auto">
					<SectionTag>Deployment Manifest</SectionTag>
					<div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
						<div>
							<h2 className="text-4xl md:text-5xl font-bold tracking-tight text-[#1A1D23]">
								100 Agents. 10 Departments.
							</h2>
							<p className="text-[#3A3F48]/50 mt-3 max-w-lg">
								Every agent has a defined role, skill set, and knowledge base.
								Browse the roster, pick who you need, and we deploy them.
							</p>
						</div>
						<Link to="/signup" className="text-[#F27A2E] text-sm font-medium flex items-center gap-1 hover:gap-2 transition-all shrink-0">
							Deploy your first agent <ChevronRight className="size-4" />
						</Link>
					</div>

					{/* Agent grid — dark trim cards on silver */}
					<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
						{DEPARTMENTS.map((dept, i) => (
							<div
								key={dept.name}
								className="group relative border border-[#1A1D23]/10 rounded-lg p-5 hover:border-[#2B7AE0]/40 transition-all duration-300 bg-white/40 backdrop-blur-sm"
								style={{ transitionDelay: `${i * 50}ms` }}
							>
								<div className="flex items-center justify-between mb-4">
									<div className="flex items-center gap-2">
										<div className="w-2 h-2 rounded-full bg-emerald-500 group-hover:animate-pulse" />
										<span className="text-xs font-mono uppercase tracking-wider text-[#1A1D23]/50">{dept.name}</span>
									</div>
									<span className="text-[10px] font-mono text-[#1A1D23]/20">{dept.count} AGENT{dept.count > 1 ? "S" : ""}</span>
								</div>
								<div className="space-y-2">
									{dept.agents.map((agent) => (
										<div key={agent} className="flex items-center gap-2.5 text-sm text-[#1A1D23]/60 group-hover:text-[#1A1D23]/80 transition-colors">
											<span className="text-[#2B7AE0]/50 text-xs font-mono">›</span>
											{agent}
										</div>
									))}
								</div>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* ═══════════════════ COMPARISON ═══════════════════ */}
			<section ref={compare.ref} className={`py-24 md:py-32 px-6 transition-all duration-1000 ${compare.animated ? "opacity-100 translate-y-0" : "opacity-90 translate-y-2"}`}>
				<div className="max-w-4xl mx-auto">
					<div className="text-center mb-16">
						<SectionTag>Threat Assessment</SectionTag>
						<h2 className="text-4xl md:text-5xl font-bold tracking-tight text-[#1A1D23]">
							Old Guard vs. <span className="text-[#2B7AE0]">New Era</span>
						</h2>
					</div>

					<div className="border border-[#1A1D23]/10 rounded-lg overflow-hidden bg-white/30 backdrop-blur-sm">
						<div className="grid grid-cols-2 bg-[#1A1D23]/[0.04]">
							<div className="px-6 py-4 text-[11px] font-mono uppercase tracking-[0.15em] text-red-500/70 border-r border-[#1A1D23]/10">
								⚠ Traditional Staffing
							</div>
							<div className="px-6 py-4 text-[11px] font-mono uppercase tracking-[0.15em] text-emerald-600/70">
								✓ AI Staffing Agency
							</div>
						</div>
						{COMPARISON.map((row, i) => (
							<div key={row.old} className={`grid grid-cols-2 border-t border-[#1A1D23]/[0.06] ${i % 2 === 0 ? "" : "bg-[#1A1D23]/[0.02]"}`}>
								<div className="px-6 py-4 text-sm text-[#3A3F48]/40 border-r border-[#1A1D23]/[0.06]">{row.old}</div>
								<div className="px-6 py-4 text-sm text-[#1A1D23]/80 font-medium">{row.new}</div>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* ═══════════════════ HOW IT WORKS — VERTICAL TIMELINE ═══════════════════ */}
			<section ref={howIt.ref} className={`py-24 md:py-32 px-6 bg-[#BFC5CD] transition-all duration-1000 ${howIt.animated ? "opacity-100 translate-y-0" : "opacity-90 translate-y-2"}`}>
				<div className="max-w-3xl mx-auto">
					<div className="text-center mb-20">
						<SectionTag>Operations Protocol</SectionTag>
						<h2 className="text-4xl md:text-5xl font-bold tracking-tight text-[#1A1D23]">
							Four Steps to Deployment
						</h2>
					</div>

					<div className="relative">
						<div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-[#2B7AE0]/40 via-[#2B7AE0]/20 to-transparent" />

						{[
							{ step: "01", title: "CONTACT", desc: "Visit our site, browse the agent roster, or submit a contact form describing your business needs." },
							{ step: "02", title: "ASSESS", desc: "An account manager evaluates your needs and determines what infrastructure you have in place." },
							{ step: "03", title: "BUILD & DEPLOY", desc: "We build your phone system, portal, and tools if needed. Then configure and deploy your AI agent." },
							{ step: "04", title: "OPERATIONAL", desc: "Your AI agent starts working immediately. Monitor activity in your portal. Add more agents anytime." },
						].map((s, i) => (
							<div key={s.step} className="relative flex gap-8 mb-16 last:mb-0">
								<div className="relative z-10 shrink-0">
									<div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center text-xs font-mono font-bold ${
										i === 3 ? "border-[#F27A2E] text-[#F27A2E] bg-[#F27A2E]/10" : "border-[#2B7AE0]/40 text-[#2B7AE0] bg-white/50"
									}`}>
										{s.step}
									</div>
								</div>
								<div className="pt-2.5">
									<h3 className="text-sm font-mono font-bold tracking-[0.1em] text-[#1A1D23] mb-2">{s.title}</h3>
									<p className="text-sm text-[#3A3F48]/50 leading-relaxed">{s.desc}</p>
								</div>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* ═══════════════════ VIDEO DEMOS / EXPLAINER ═══════════════════ */}
			<section className="py-24 md:py-32 px-6 relative overflow-hidden">
				<div className="absolute inset-0 pointer-events-none">
					<div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] rounded-full bg-[#F27A2E] opacity-[0.04] blur-[120px]" />
					<div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-[#2B7AE0] opacity-[0.04] blur-[100px]" />
				</div>
				<div className="max-w-6xl mx-auto relative z-10">
					<div className="text-center mb-16">
						<SectionTag>See It In Action</SectionTag>
						<h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-[#1A1D23]">
							Watch Your AI Team <span className="text-[#2B7AE0]">Come Alive</span>
						</h2>
						<p className="text-[#3A3F48]/50 max-w-xl mx-auto">
							From sign-up to live deployment in under 24 hours. Here's how it works.
						</p>
					</div>

					{/* Hero Video Placeholder */}
					<div className="relative rounded-2xl overflow-hidden mb-16 bg-[#1A1D23] aspect-video max-w-4xl mx-auto shadow-[0_8px_60px_rgba(0,0,0,0.15)]">
						<div className="absolute inset-0 flex flex-col items-center justify-center">
							<div className="absolute inset-0 bg-gradient-to-br from-[#2B7AE0]/20 via-transparent to-[#F27A2E]/10" />
							{/* Animated glow ring play button */}
							<button className="relative z-10 group cursor-pointer">
								<div className="absolute inset-0 rounded-full bg-white/20 animate-ping" style={{animationDuration: '2s'}} />
								<div className="w-20 h-20 rounded-full bg-white/90 flex items-center justify-center shadow-[0_4px_30px_rgba(0,0,0,0.2)] group-hover:bg-white transition-colors">
									<svg className="size-8 text-[#1A1D23] ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
								</div>
							</button>
							<p className="relative z-10 mt-6 text-white/50 text-sm font-medium">Watch the 2-minute overview</p>
						</div>
						{/* Decorative UI lines */}
						<div className="absolute top-4 left-4 right-4 flex justify-between items-center text-white/20 text-[10px] font-mono">
							<span>AI-STAFFING-AGENCY://DEMO</span>
							<span>▶ 02:14</span>
						</div>
						<div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
							<div className="h-full w-0 bg-[#F27A2E] rounded-full" />
						</div>
					</div>

					{/* Animated Process Steps */}
					<div className="grid md:grid-cols-3 gap-6 mb-20">
						{[
							{
								icon: "📋",
								title: "Sign Up & Select",
								desc: "Create your account, tell us your industry, and pick your agents from our roster of 100+.",
								animation: (
									<div className="relative h-32 flex items-center justify-center">
										<div className="absolute w-24 h-24 rounded-2xl border-2 border-dashed border-[#2B7AE0]/30 animate-spin" style={{animationDuration: '12s'}} />
										<div className="w-16 h-16 rounded-xl bg-[#2B7AE0]/10 flex items-center justify-center text-2xl">📋</div>
									</div>
								)
							},
							{
								icon: "⚙️",
								title: "We Configure & Train",
								desc: "Our team configures your agents with your business knowledge, services, FAQs, and brand voice.",
								animation: (
									<div className="relative h-32 flex items-center justify-center">
										<div className="flex gap-1 items-center">
											{[0,1,2,3,4].map(i => (
												<div key={i} className="w-3 rounded-full bg-[#F27A2E]/30 animate-pulse" style={{height: `${20 + Math.random() * 40}px`, animationDelay: `${i * 200}ms`}} />
											))}
										</div>
										<div className="absolute w-16 h-16 rounded-xl bg-[#F27A2E]/10 flex items-center justify-center text-2xl">⚙️</div>
									</div>
								)
							},
							{
								icon: "🚀",
								title: "Go Live in 24 Hours",
								desc: "Your AI team starts handling calls, chats, and emails. Monitor everything from your dashboard.",
								animation: (
									<div className="relative h-32 flex items-center justify-center">
										<div className="absolute w-20 h-20 rounded-full border border-emerald-400/30 animate-ping" style={{animationDuration: '2s'}} />
										<div className="absolute w-14 h-14 rounded-full border border-emerald-400/20 animate-ping" style={{animationDuration: '2.5s'}} />
										<div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center text-xl">🚀</div>
									</div>
								)
							},
						].map((step) => (
							<div key={step.title} className="text-center group">
								{step.animation}
								<h3 className="font-bold text-[#1A1D23] mb-2 mt-2">{step.title}</h3>
								<p className="text-sm text-[#3A3F48]/50 leading-relaxed">{step.desc}</p>
							</div>
						))}
					</div>

					{/* Testimonials */}
					<div className="grid md:grid-cols-3 gap-6">
						{[
							{
								quote: "Our AI receptionist handles 200+ calls a day. We went from missing 40% of calls to missing zero.",
								name: "Sarah M.",
								role: "Owner, Bright Smile Dental",
								savings: "$4,200/mo saved",
							},
							{
								quote: "The sales follow-up agent closed 3 deals in the first week that we would have lost. Paid for itself instantly.",
								name: "Marcus T.",
								role: "CEO, TrueNorth Roofing",
								savings: "$12,000 new revenue",
							},
							{
								quote: "We replaced our $3,500/mo receptionist with a $399/mo AI that works 24/7. The ROI is insane.",
								name: "Jennifer L.",
								role: "Managing Partner, West Law Group",
								savings: "$3,100/mo saved",
							},
						].map((t) => (
							<div key={t.name} className="bg-white/40 backdrop-blur-sm border border-[#1A1D23]/10 rounded-xl p-6 hover:border-[#2B7AE0]/20 transition-colors">
								<div className="flex gap-0.5 mb-3">
									{[1,2,3,4,5].map(s => (
										<svg key={s} className="size-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
											<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
										</svg>
									))}
								</div>
								<p className="text-sm text-[#3A3F48]/70 leading-relaxed mb-4 italic">"{t.quote}"</p>
								<div className="flex items-center justify-between">
									<div>
										<p className="text-sm font-semibold text-[#1A1D23]">{t.name}</p>
										<p className="text-xs text-[#3A3F48]/40">{t.role}</p>
									</div>
									<span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">{t.savings}</span>
								</div>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* ═══════════════════ INDUSTRIES ═══════════════════ */}
			<section ref={industries.ref} id="industries" className={`py-24 md:py-32 px-6 transition-all duration-1000 ${industries.animated ? "opacity-100 translate-y-0" : "opacity-90 translate-y-2"}`}>
				<div className="max-w-6xl mx-auto">
					<div className="text-center mb-16">
						<SectionTag>Target Sectors</SectionTag>
						<h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-[#1A1D23]">
							Built for <span className="text-[#2B7AE0]">25 Industries</span>
						</h2>
						<p className="text-[#3A3F48]/50 max-w-xl mx-auto">
							If your business takes calls, sends emails, or communicates with customers — we have an AI agent for you. Click any industry to see how.
						</p>
					</div>

					<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
						{INDUSTRY_LINKS.map((ind, i) => (
							<Link
								key={ind.slug}
								to={`/industries/${ind.slug}`}
								className="group relative px-4 py-4 border border-[#1A1D23]/10 rounded-lg hover:border-[#2B7AE0]/30 hover:bg-white/40 transition-all duration-300 text-center bg-white/20 backdrop-blur-sm"
								style={{ transitionDelay: `${i * 20}ms` }}
							>
								<span className="text-lg block mb-1">{ind.icon}</span>
								<span className="text-xs text-[#1A1D23]/50 group-hover:text-[#1A1D23]/80 transition-colors font-medium leading-tight block">{ind.name}</span>
								<ChevronRight className="size-3 text-[#2B7AE0]/0 group-hover:text-[#2B7AE0]/50 transition-all absolute top-2 right-2" />
							</Link>
						))}
					</div>
				</div>
			</section>

			{/* ═══════════════════ ROI CALCULATOR ═══════════════════ */}
			<ROICalculator />

			{/* ═══════════════════ PRICING ═══════════════════ */}
			<section ref={pricing.ref} id="pricing" className={`py-24 md:py-32 px-6 bg-[#BFC5CD] transition-all duration-1000 ${pricing.animated ? "opacity-100 translate-y-0" : "opacity-90 translate-y-2"}`}>
				<div className="max-w-5xl mx-auto">
					<div className="text-center mb-16">
						<SectionTag>Investment Tiers</SectionTag>
						<h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-[#1A1D23]">
							Pay Less Than a Human. <span className="text-[#F27A2E]">Get&nbsp;More.</span>
						</h2>
						<p className="text-[#3A3F48]/50 max-w-xl mx-auto">
							Monthly subscriptions based on agent complexity. One-time platform setup starts at $500.
						</p>
					</div>

					<div className="grid md:grid-cols-3 gap-6">
						{/* Basic */}
						<div className="relative border border-[#1A1D23]/10 rounded-lg p-8 hover:border-[#1A1D23]/20 transition-all group bg-white/30 backdrop-blur-sm">
							<div className="text-[11px] font-mono uppercase tracking-[0.15em] text-[#3A3F48]/40 mb-4">Basic</div>
							<div className="text-3xl font-bold text-[#1A1D23] mb-1">$200 – $500</div>
							<div className="text-xs text-[#3A3F48]/40 mb-6">per month</div>
							<p className="text-sm text-[#3A3F48]/50 mb-6 leading-relaxed">Phone answering, scheduling, dispatch. Your AI handles the front lines 24/7.</p>
							<div className="space-y-2.5 mb-8">
								{["24/7 phone answering", "Appointment scheduling", "Call logging & transcripts", "FAQ handling", "SMS follow-ups"].map((f) => (
									<div key={f} className="flex items-center gap-2 text-sm text-[#3A3F48]/50">
										<Check className="size-3.5 text-[#2B7AE0]/60 shrink-0" />{f}
									</div>
								))}
							</div>
							<Button className="w-full bg-[#1A1D23]/5 hover:bg-[#1A1D23]/10 text-[#1A1D23] border border-[#1A1D23]/10 rounded-sm h-10 text-sm mb-3" asChild>
								<Link to="/signup">Get Started <ArrowRight className="size-3.5 ml-1" /></Link>
							</Button>
							<GuaranteeBadge variant="inline" className="justify-center" />
						</div>

						{/* Professional — Featured */}
						<div className="relative border border-[#1A1D23]/20 rounded-lg p-8 bg-[#1A1D23] text-white shadow-[0_4px_40px_rgba(26,29,35,0.25)] group">
							<div className="absolute -top-3 left-1/2 -translate-x-1/2">
								<span className="text-[10px] font-mono uppercase tracking-[0.2em] text-white bg-[#2B7AE0] px-3 py-1 rounded-full">Recommended</span>
							</div>
							<div className="text-[11px] font-mono uppercase tracking-[0.15em] text-[#2B7AE0] mb-4">Professional</div>
							<div className="text-3xl font-bold text-white mb-1">$500 – $1,500</div>
							<div className="text-xs text-white/40 mb-6">per month</div>
							<p className="text-sm text-white/50 mb-6 leading-relaxed">Project managers, sales reps, marketing teams. The agents that grow your revenue.</p>
							<div className="space-y-2.5 mb-8">
								{["Everything in Basic", "Lead qualification & outreach", "Social media management", "CRM integration", "Weekly performance reports"].map((f) => (
									<div key={f} className="flex items-center gap-2 text-sm text-white/60">
										<Check className="size-3.5 text-[#2B7AE0] shrink-0" />{f}
									</div>
								))}
							</div>
							<Button className="w-full bg-[#2B7AE0] hover:bg-[#2468c4] text-white rounded-sm h-10 text-sm shadow-[0_0_20px_rgba(43,122,224,0.25)] mb-3" asChild>
								<Link to="/signup">Get Started <ArrowRight className="size-3.5 ml-1" /></Link>
							</Button>
							<GuaranteeBadge variant="inline" className="justify-center [&_span]:text-white/40 [&_svg]:text-[#2B7AE0]" />
						</div>

						{/* Executive */}
						<div className="relative border border-[#1A1D23]/10 rounded-lg p-8 hover:border-[#1A1D23]/20 transition-all group bg-white/30 backdrop-blur-sm">
							<div className="text-[11px] font-mono uppercase tracking-[0.15em] text-[#3A3F48]/40 mb-4">Executive</div>
							<div className="text-3xl font-bold text-[#1A1D23] mb-1">$1,500 – $5,000</div>
							<div className="text-xs text-[#3A3F48]/40 mb-6">per month</div>
							<p className="text-sm text-[#3A3F48]/50 mb-6 leading-relaxed">C-suite advisory, strategic planning, and technology leadership for your business.</p>
							<div className="space-y-2.5 mb-8">
								{["Everything in Professional", "Strategic business planning", "Financial forecasting", "Technology roadmapping", "Dedicated account manager"].map((f) => (
									<div key={f} className="flex items-center gap-2 text-sm text-[#3A3F48]/50">
										<Check className="size-3.5 text-[#2B7AE0]/60 shrink-0" />{f}
									</div>
								))}
							</div>
							<Button className="w-full bg-[#1A1D23]/5 hover:bg-[#1A1D23]/10 text-[#1A1D23] border border-[#1A1D23]/10 rounded-sm h-10 text-sm mb-3" asChild>
								<Link to="/signup">Get Started <ArrowRight className="size-3.5 ml-1" /></Link>
							</Button>
							<GuaranteeBadge variant="inline" className="justify-center" />
						</div>
					</div>

					<div className="flex justify-center mt-10">
						<GuaranteeBadge variant="dark" className="max-w-sm w-full" />
					</div>

					<p className="text-center text-xs text-[#3A3F48]/30 mt-6 font-mono">
						Platform setup fee: $500 – $1,500 (one-time) for businesses needing phone systems, portals, or scheduling tools.
					</p>
				</div>
			</section>

			{/* ═══════════════════ CTA ═══════════════════ */}
			<section className="relative py-32 md:py-40 px-6 overflow-hidden">
				<div className="absolute inset-0">
					<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#2B7AE0] opacity-[0.06] blur-[150px]" />
				</div>

				<div className="relative z-10 max-w-3xl mx-auto text-center space-y-8">
					<h2 className="text-4xl md:text-6xl font-bold tracking-tight leading-[1.05] text-[#1A1D23]">
						Ready to Deploy<br />
						<span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F27A2E] to-[#FF9A52]">Your First Agent?</span>
					</h2>
					<p className="text-[#3A3F48]/50 text-lg max-w-lg mx-auto">
						Book a free consultation. Tell us what your business needs. We'll have you live in under 24 hours.
					</p>
					<div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
						<Link to="/signup">
							<Button size="lg" className="bg-[#F27A2E] hover:bg-[#d96a24] text-white text-sm font-semibold h-14 px-10 rounded-sm shadow-[0_0_40px_rgba(242,122,46,0.25)] hover:shadow-[0_0_50px_rgba(242,122,46,0.35)] transition-all">
								Book a Free Consultation
								<ArrowRight className="size-4 ml-2" />
							</Button>
						</Link>
					</div>
				</div>
			</section>

			{/* ═══════════════════ FOOTER ═══════════════════ */}
			<footer className="border-t border-[#1A1D23]/8 py-12 px-6 bg-[#1A1D23]">
				<div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start justify-between gap-8">
					<div>
						<div className="flex items-center gap-3 mb-3">
							<img src="/logo-white.png" alt="AI Staffing Agency" className="h-8 w-8 opacity-60" />
							<span className="text-sm font-semibold text-white/60">AI Staffing Agency</span>
						</div>
						<p className="text-xs text-white/20 max-w-xs leading-relaxed">
							The first staffing agency that deploys AI agents instead of human temps.
							Built for small service businesses.
						</p>
					</div>
					<div className="flex gap-12 text-xs">
						<div>
							<h4 className="font-mono uppercase tracking-[0.15em] text-white/30 mb-3 text-[10px]">Company</h4>
							<ul className="space-y-2 text-white/20">
								<li><a href="#" className="hover:text-white/50 transition-colors">About</a></li>
								<li><a href="#pricing" className="hover:text-white/50 transition-colors">Pricing</a></li>
								<li><a href="#" className="hover:text-white/50 transition-colors">Contact</a></li>
							</ul>
						</div>
						<div>
							<h4 className="font-mono uppercase tracking-[0.15em] text-white/30 mb-3 text-[10px]">Legal</h4>
							<ul className="space-y-2 text-white/20">
								<li><a href="#" className="hover:text-white/50 transition-colors">Privacy</a></li>
								<li><a href="#" className="hover:text-white/50 transition-colors">Terms</a></li>
							</ul>
						</div>
					</div>
				</div>
				<div className="max-w-7xl mx-auto mt-10 pt-6 border-t border-white/[0.04] text-center text-[11px] text-white/15 font-mono">
					© {new Date().getFullYear()} AI STAFFING AGENCY — A TRG TECH LINK COMPANY
				</div>
			</footer>
		</div>
	);
}
