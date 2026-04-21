import { useConvexAuth } from "convex/react";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, Check, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

/* ═══════════════════════════════════════════════════════
   AI STAFFING AGENCY — CUSTOM LANDING PAGE
   Theme: Military Command Center × Premium Tech
   ═══════════════════════════════════════════════════════ */

/* ─── DATA ─── */
const DEPARTMENTS = [
	{ name: "Executive Suite", agents: ["CEO Advisor", "CFO Advisor", "CTO Advisor", "President / COO"], count: 4 },
	{ name: "Management", agents: ["Project Manager", "Account Manager", "HR Manager"], count: 3 },
	{ name: "Customer Service", agents: ["Phone Receptionist", "Customer Service Rep"], count: 2 },
	{ name: "Sales", agents: ["Sales Representative", "Internet Sales Team"], count: 2 },
	{ name: "Consulting", agents: ["Business Consultant", "Legal Advisor", "Financial Advisor"], count: 3 },
	{ name: "Technology", agents: ["Software Engineer", "UI/UX Designer", "Software Architect", "IT Support Specialist", "Data Analyst"], count: 5 },
	{ name: "Marketing", agents: ["Marketing Specialist", "Copywriter"], count: 2 },
	{ name: "Operations", agents: ["Dispatcher"], count: 1 },
	{ name: "Training", agents: ["Business Trainer"], count: 1 },
];

const INDUSTRIES = [
	"Cleaning Services", "Law Firms", "Medical / Dental", "Real Estate",
	"Construction", "Insurance", "Lawn Care", "Restaurants",
	"Retail / E-commerce", "Financial Services", "Trucking / Logistics", "Tech Startups",
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
	// Always visible — animation is purely decorative enhancement
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
			{/* Animated grid */}
			<div className="absolute inset-0 grid-bg opacity-[0.08]" />
			{/* Radial glow behind logo area */}
			<div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#2B7AE0] opacity-[0.06] blur-[120px]" />
			{/* Corner accent glow */}
			<div className="absolute -bottom-20 -right-20 w-[400px] h-[400px] rounded-full bg-[#F27A2E] opacity-[0.04] blur-[100px]" />
			{/* Scan line animation */}
			<div className="absolute inset-0 scan-line opacity-[0.03]" />
		</div>
	);
}

function HudBadge({ children }: { children: React.ReactNode }) {
	return (
		<div className="inline-flex items-center gap-2 px-3 py-1 border border-[#2B7AE0]/30 rounded text-[11px] font-mono uppercase tracking-[0.2em] text-[#2B7AE0] bg-[#2B7AE0]/5">
			<span className="w-1.5 h-1.5 rounded-full bg-[#2B7AE0] animate-pulse" />
			{children}
		</div>
	);
}

function StatBlock({ value, label }: { value: string; label: string }) {
	return (
		<div className="text-center px-6">
			<div className="text-3xl md:text-4xl font-bold text-white font-mono tracking-tight">{value}</div>
			<div className="text-[11px] uppercase tracking-[0.15em] text-[#B8C4CE] mt-1">{label}</div>
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
		<div className="bg-[#0A0F17] text-white overflow-x-hidden">

			{/* ═══════════════════ NAV ═══════════════════ */}
			<nav className="fixed top-0 left-0 right-0 z-50 nav-glass">
				<div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-16">
					<Link to="/" className="flex items-center gap-3 group">
						<img src="/logo-white.png" alt="AI Staffing Agency" className="h-9 w-9 transition-transform group-hover:scale-105" />
						<span className="text-sm font-semibold tracking-tight text-white/90">AI Staffing Agency</span>
					</Link>
					<div className="hidden md:flex items-center gap-8">
						<a href="#agents" className="text-xs font-medium tracking-wide text-white/50 hover:text-white transition-colors uppercase">Agents</a>
						<a href="#pricing" className="text-xs font-medium tracking-wide text-white/50 hover:text-white transition-colors uppercase">Pricing</a>
						<a href="#industries" className="text-xs font-medium tracking-wide text-white/50 hover:text-white transition-colors uppercase">Industries</a>
						{isAuthenticated ? (
							<Link to="/dashboard">
								<Button size="sm" className="bg-[#F27A2E] hover:bg-[#d96a24] text-white text-xs font-semibold px-5 h-8 rounded-sm">
									Dashboard <ArrowRight className="size-3 ml-1" />
								</Button>
							</Link>
						) : (
							<>
								<Link to="/login" className="text-xs font-medium tracking-wide text-white/50 hover:text-white transition-colors uppercase">Sign In</Link>
								<Link to="/signup">
									<Button size="sm" className="bg-[#F27A2E] hover:bg-[#d96a24] text-white text-xs font-semibold px-5 h-8 rounded-sm">
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
						<span className="block text-white">YOUR STAFF</span>
						<span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#2B7AE0] via-[#4A9AF5] to-[#2B7AE0]">
							NEVER SLEEPS
						</span>
					</h1>

					<p className="font-mono text-sm md:text-base text-[#B8C4CE]/80 max-w-xl mx-auto h-6">
						{typedTagline}<span className="animate-pulse">▊</span>
					</p>

					<p className="text-base md:text-lg text-white/50 max-w-2xl mx-auto leading-relaxed">
						The first staffing agency that deploys <span className="text-white font-medium">AI agents</span> instead
						of human temps. Receptionists, sales reps, C-suite advisors — deployed to your business
						in under 24 hours. <span className="text-[#F27A2E]">No liability. No insurance. No days off.</span>
					</p>

					{!isAuthenticated && !isLoading && (
						<div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
							<Link to="/signup">
								<Button size="lg" className="bg-[#F27A2E] hover:bg-[#d96a24] text-white text-sm font-semibold h-12 px-8 rounded-sm shadow-[0_0_30px_rgba(242,122,46,0.3)] hover:shadow-[0_0_40px_rgba(242,122,46,0.4)] transition-all">
									Book a Free Consultation
									<ArrowRight className="size-4 ml-2" />
								</Button>
							</Link>
							<Link to="/login">
								<Button size="lg" variant="outline" className="text-white/70 border-white/10 hover:bg-white/5 hover:text-white text-sm font-semibold h-12 px-8 rounded-sm">
									Sign In
								</Button>
							</Link>
						</div>
					)}
					{isAuthenticated && (
						<div className="pt-4">
							<Link to="/dashboard">
								<Button size="lg" className="bg-[#F27A2E] hover:bg-[#d96a24] text-white text-sm font-semibold h-12 px-8 rounded-sm shadow-[0_0_30px_rgba(242,122,46,0.3)]">
									Go to Dashboard <ArrowRight className="size-4 ml-2" />
								</Button>
							</Link>
						</div>
					)}
				</div>

				{/* HUD Stats at bottom of hero */}
				<div className="relative z-10 mt-auto mb-12 w-full max-w-4xl mx-auto">
					<div className="flex items-center justify-center divide-x divide-white/10">
						<StatBlock value="24/7" label="Availability" />
						<StatBlock value="<24h" label="Deploy Time" />
						<StatBlock value="$0" label="Workers' Comp" />
						<StatBlock value="22+" label="Agent Roles" />
					</div>
				</div>

				{/* Scroll indicator */}
				<div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/20">
					<span className="text-[10px] uppercase tracking-[0.3em] font-mono">Scroll</span>
					<div className="w-px h-8 bg-gradient-to-b from-white/20 to-transparent scroll-pulse" />
				</div>
			</section>

			{/* ═══════════════════ TICKER ═══════════════════ */}
			<div className="border-y border-white/5 bg-[#0D1320] py-3 overflow-hidden">
				<div className="ticker-track">
					{[...Array(2)].map((_, copy) => (
						<div key={copy} className="ticker-content">
							{["⬡ 22 AI AGENTS READY", "⬡ 9 DEPARTMENTS", "⬡ 12 INDUSTRIES", "⬡ DEPLOY IN 24 HRS", "⬡ $0 WORKERS COMP", "⬡ 24/7 OPERATIONS", "⬡ 95% MARGIN TARGET", "⬡ FROM $200/MO"].map((t) => (
								<span key={`${copy}-${t}`} className="text-[11px] font-mono uppercase tracking-[0.15em] text-white/25 whitespace-nowrap px-8">{t}</span>
							))}
						</div>
					))}
				</div>
			</div>

			{/* ═══════════════════ THE MISSION ═══════════════════ */}
			<section ref={mission.ref} className={`py-24 md:py-32 px-6 transition-all duration-1000 ${mission.animated ? "opacity-100 translate-y-0" : "opacity-90 translate-y-2"}`}>
				<div className="max-w-7xl mx-auto grid lg:grid-cols-[1.2fr_1fr] gap-16 items-start">
					{/* Left — Big statement */}
					<div>
						<SectionTag>The Mission</SectionTag>
						<h2 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.05] tracking-tight mb-8">
							A Real Staffing Agency.{" "}
							<span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2B7AE0] to-[#4A9AF5]">Powered&nbsp;by&nbsp;AI.</span>
						</h2>
						<p className="text-white/40 text-lg leading-relaxed max-w-lg">
							We operate exactly like a traditional staffing agency — but instead of placing
							human workers, we deploy intelligent AI agents. Same process. Better results.
							A fraction of the cost.
						</p>
					</div>

					{/* Right — Feature list with military numbering */}
					<div className="space-y-6 pt-4">
						{[
							{ num: "01", title: "Zero Liability", desc: "No workers' comp, no insurance, no HR issues, no payroll taxes." },
							{ num: "02", title: "24/7 Operations", desc: "No sick days. No vacations. Always on, always professional." },
							{ num: "03", title: "Instant Deploy", desc: "Tell us about your business, agent is live within 24 hours." },
							{ num: "04", title: "We Build Your Setup", desc: "No tech team? We build the phone system, portal, and tools." },
							{ num: "05", title: "Multi-Channel", desc: "Phone, email, chat, social media — every channel covered." },
							{ num: "06", title: "Unlimited Scale", desc: "Add more agents as you grow. No recruiting, no turnover." },
						].map((f) => (
							<div key={f.num} className="group flex gap-5 p-4 -mx-4 rounded-lg hover:bg-white/[0.02] transition-colors">
								<span className="text-xs font-mono text-[#F27A2E]/60 mt-1 shrink-0">{f.num}</span>
								<div>
									<h3 className="text-sm font-semibold text-white mb-1">{f.title}</h3>
									<p className="text-sm text-white/35 leading-relaxed">{f.desc}</p>
								</div>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* ═══════════════════ AGENT DEPLOYMENT MANIFEST ═══════════════════ */}
			<section ref={agents.ref} id="agents" className={`py-24 md:py-32 px-6 bg-[#0D1320] transition-all duration-1000 ${agents.animated ? "opacity-100 translate-y-0" : "opacity-90 translate-y-2"}`}>
				<div className="max-w-7xl mx-auto">
					<SectionTag>Deployment Manifest</SectionTag>
					<div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
						<div>
							<h2 className="text-4xl md:text-5xl font-bold tracking-tight">
								22 Agents. 9 Departments.
							</h2>
							<p className="text-white/40 mt-3 max-w-lg">
								Every agent has a defined role, skill set, and knowledge base.
								Browse the roster, pick who you need, and we deploy them.
							</p>
						</div>
						<Link to="/signup" className="text-[#F27A2E] text-sm font-medium flex items-center gap-1 hover:gap-2 transition-all shrink-0">
							Deploy your first agent <ChevronRight className="size-4" />
						</Link>
					</div>

					{/* Terminal-style agent grid */}
					<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
						{DEPARTMENTS.map((dept, i) => (
							<div
								key={dept.name}
								className="group relative border border-white/[0.06] rounded-lg p-5 hover:border-[#2B7AE0]/30 transition-all duration-300 bg-gradient-to-br from-white/[0.02] to-transparent"
								style={{ transitionDelay: `${i * 50}ms` }}
							>
								{/* Department header */}
								<div className="flex items-center justify-between mb-4">
									<div className="flex items-center gap-2">
										<div className="w-2 h-2 rounded-full bg-emerald-500/80 group-hover:animate-pulse" />
										<span className="text-xs font-mono uppercase tracking-wider text-white/60">{dept.name}</span>
									</div>
									<span className="text-[10px] font-mono text-white/20">{dept.count} AGENT{dept.count > 1 ? "S" : ""}</span>
								</div>
								{/* Agent list */}
								<div className="space-y-2">
									{dept.agents.map((agent) => (
										<div key={agent} className="flex items-center gap-2.5 text-sm text-white/70 group-hover:text-white/90 transition-colors">
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
						<h2 className="text-4xl md:text-5xl font-bold tracking-tight">
							Old Guard vs. <span className="text-[#2B7AE0]">New Era</span>
						</h2>
					</div>

					<div className="border border-white/[0.06] rounded-lg overflow-hidden">
						{/* Header */}
						<div className="grid grid-cols-2 bg-white/[0.03]">
							<div className="px-6 py-4 text-[11px] font-mono uppercase tracking-[0.15em] text-red-400/60 border-r border-white/[0.06]">
								⚠ Traditional Staffing
							</div>
							<div className="px-6 py-4 text-[11px] font-mono uppercase tracking-[0.15em] text-emerald-400/60">
								✓ AI Staffing Agency
							</div>
						</div>
						{/* Rows */}
						{COMPARISON.map((row, i) => (
							<div key={row.old} className={`grid grid-cols-2 border-t border-white/[0.04] ${i % 2 === 0 ? "" : "bg-white/[0.01]"}`}>
								<div className="px-6 py-4 text-sm text-white/30 border-r border-white/[0.06]">{row.old}</div>
								<div className="px-6 py-4 text-sm text-white/80 font-medium">{row.new}</div>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* ═══════════════════ HOW IT WORKS — VERTICAL TIMELINE ═══════════════════ */}
			<section ref={howIt.ref} className={`py-24 md:py-32 px-6 bg-[#0D1320] transition-all duration-1000 ${howIt.animated ? "opacity-100 translate-y-0" : "opacity-90 translate-y-2"}`}>
				<div className="max-w-3xl mx-auto">
					<div className="text-center mb-20">
						<SectionTag>Operations Protocol</SectionTag>
						<h2 className="text-4xl md:text-5xl font-bold tracking-tight">
							Four Steps to Deployment
						</h2>
					</div>

					<div className="relative">
						{/* Vertical line */}
						<div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-[#2B7AE0]/40 via-[#2B7AE0]/20 to-transparent" />

						{[
							{ step: "01", title: "CONTACT", desc: "Visit our site, browse the agent roster, or submit a contact form describing your business needs." },
							{ step: "02", title: "ASSESS", desc: "An account manager evaluates your needs and determines what infrastructure you have in place." },
							{ step: "03", title: "BUILD & DEPLOY", desc: "We build your phone system, portal, and tools if needed. Then configure and deploy your AI agent." },
							{ step: "04", title: "OPERATIONAL", desc: "Your AI agent starts working immediately. Monitor activity in your portal. Add more agents anytime." },
						].map((s, i) => (
							<div key={s.step} className="relative flex gap-8 mb-16 last:mb-0">
								{/* Timeline dot */}
								<div className="relative z-10 shrink-0">
									<div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center text-xs font-mono font-bold ${
										i === 3 ? "border-[#F27A2E] text-[#F27A2E] bg-[#F27A2E]/10" : "border-[#2B7AE0]/40 text-[#2B7AE0] bg-[#2B7AE0]/5"
									}`}>
										{s.step}
									</div>
								</div>
								{/* Content */}
								<div className="pt-2.5">
									<h3 className="text-sm font-mono font-bold tracking-[0.1em] text-white mb-2">{s.title}</h3>
									<p className="text-sm text-white/40 leading-relaxed">{s.desc}</p>
								</div>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* ═══════════════════ INDUSTRIES ═══════════════════ */}
			<section ref={industries.ref} id="industries" className={`py-24 md:py-32 px-6 transition-all duration-1000 ${industries.animated ? "opacity-100 translate-y-0" : "opacity-90 translate-y-2"}`}>
				<div className="max-w-5xl mx-auto">
					<div className="text-center mb-16">
						<SectionTag>Target Sectors</SectionTag>
						<h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
							Built for Small Service Businesses
						</h2>
						<p className="text-white/40 max-w-xl mx-auto">
							If your business takes calls, sends emails, or communicates with customers — we have an AI agent for you.
						</p>
					</div>

					<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
						{INDUSTRIES.map((ind, i) => (
							<div
								key={ind}
								className="group relative px-5 py-4 border border-white/[0.06] rounded-lg hover:border-[#2B7AE0]/20 hover:bg-[#2B7AE0]/[0.03] transition-all duration-300 text-center"
								style={{ transitionDelay: `${i * 30}ms` }}
							>
								<span className="text-sm text-white/60 group-hover:text-white/90 transition-colors font-medium">{ind}</span>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* ═══════════════════ PRICING ═══════════════════ */}
			<section ref={pricing.ref} id="pricing" className={`py-24 md:py-32 px-6 bg-[#0D1320] transition-all duration-1000 ${pricing.animated ? "opacity-100 translate-y-0" : "opacity-90 translate-y-2"}`}>
				<div className="max-w-5xl mx-auto">
					<div className="text-center mb-16">
						<SectionTag>Investment Tiers</SectionTag>
						<h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
							Pay Less Than a Human. <span className="text-[#F27A2E]">Get&nbsp;More.</span>
						</h2>
						<p className="text-white/40 max-w-xl mx-auto">
							Monthly subscriptions based on agent complexity. One-time platform setup starts at $500.
						</p>
					</div>

					<div className="grid md:grid-cols-3 gap-6">
						{/* Basic */}
						<div className="relative border border-white/[0.06] rounded-lg p-8 hover:border-white/[0.12] transition-all group">
							<div className="text-[11px] font-mono uppercase tracking-[0.15em] text-white/30 mb-4">Basic</div>
							<div className="text-3xl font-bold mb-1">$200 – $500</div>
							<div className="text-xs text-white/30 mb-6">per month</div>
							<p className="text-sm text-white/40 mb-6 leading-relaxed">Phone answering, scheduling, dispatch. Your AI handles the front lines 24/7.</p>
							<div className="space-y-2.5 mb-8">
								{["24/7 phone answering", "Appointment scheduling", "Call logging & transcripts", "FAQ handling", "SMS follow-ups"].map((f) => (
									<div key={f} className="flex items-center gap-2 text-sm text-white/50">
										<Check className="size-3.5 text-[#2B7AE0]/60 shrink-0" />{f}
									</div>
								))}
							</div>
							<Button className="w-full bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-sm h-10 text-sm" asChild>
								<Link to="/signup">Get Started <ArrowRight className="size-3.5 ml-1" /></Link>
							</Button>
						</div>

						{/* Professional — Featured */}
						<div className="relative border border-[#2B7AE0]/30 rounded-lg p-8 bg-gradient-to-b from-[#2B7AE0]/[0.06] to-transparent shadow-[0_0_40px_rgba(43,122,224,0.08)] group">
							<div className="absolute -top-3 left-1/2 -translate-x-1/2">
								<span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#2B7AE0] bg-[#0D1320] border border-[#2B7AE0]/30 px-3 py-1 rounded-full">Recommended</span>
							</div>
							<div className="text-[11px] font-mono uppercase tracking-[0.15em] text-[#2B7AE0] mb-4">Professional</div>
							<div className="text-3xl font-bold mb-1">$500 – $1,500</div>
							<div className="text-xs text-white/30 mb-6">per month</div>
							<p className="text-sm text-white/40 mb-6 leading-relaxed">Project managers, sales reps, marketing teams. The agents that grow your revenue.</p>
							<div className="space-y-2.5 mb-8">
								{["Everything in Basic", "Lead qualification & outreach", "Social media management", "CRM integration", "Weekly performance reports"].map((f) => (
									<div key={f} className="flex items-center gap-2 text-sm text-white/60">
										<Check className="size-3.5 text-[#2B7AE0] shrink-0" />{f}
									</div>
								))}
							</div>
							<Button className="w-full bg-[#2B7AE0] hover:bg-[#2468c4] text-white rounded-sm h-10 text-sm shadow-[0_0_20px_rgba(43,122,224,0.25)]" asChild>
								<Link to="/signup">Get Started <ArrowRight className="size-3.5 ml-1" /></Link>
							</Button>
						</div>

						{/* Executive */}
						<div className="relative border border-white/[0.06] rounded-lg p-8 hover:border-white/[0.12] transition-all group">
							<div className="text-[11px] font-mono uppercase tracking-[0.15em] text-white/30 mb-4">Executive</div>
							<div className="text-3xl font-bold mb-1">$1,500 – $5,000</div>
							<div className="text-xs text-white/30 mb-6">per month</div>
							<p className="text-sm text-white/40 mb-6 leading-relaxed">C-suite advisory, strategic planning, and technology leadership for your business.</p>
							<div className="space-y-2.5 mb-8">
								{["Everything in Professional", "Strategic business planning", "Financial forecasting", "Technology roadmapping", "Dedicated account manager"].map((f) => (
									<div key={f} className="flex items-center gap-2 text-sm text-white/50">
										<Check className="size-3.5 text-[#2B7AE0]/60 shrink-0" />{f}
									</div>
								))}
							</div>
							<Button className="w-full bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-sm h-10 text-sm" asChild>
								<Link to="/signup">Get Started <ArrowRight className="size-3.5 ml-1" /></Link>
							</Button>
						</div>
					</div>

					<p className="text-center text-xs text-white/20 mt-8 font-mono">
						Platform setup fee: $500 – $1,500 (one-time) for businesses needing phone systems, portals, or scheduling tools.
					</p>
				</div>
			</section>

			{/* ═══════════════════ CTA ═══════════════════ */}
			<section className="relative py-32 md:py-40 px-6 overflow-hidden">
				{/* Background glow */}
				<div className="absolute inset-0">
					<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#2B7AE0] opacity-[0.04] blur-[150px]" />
				</div>

				<div className="relative z-10 max-w-3xl mx-auto text-center space-y-8">
					<h2 className="text-4xl md:text-6xl font-bold tracking-tight leading-[1.05]">
						Ready to Deploy<br />
						<span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F27A2E] to-[#FF9A52]">Your First Agent?</span>
					</h2>
					<p className="text-white/40 text-lg max-w-lg mx-auto">
						Book a free consultation. Tell us what your business needs. We'll have you live in under 24 hours.
					</p>
					<div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
						<Link to="/signup">
							<Button size="lg" className="bg-[#F27A2E] hover:bg-[#d96a24] text-white text-sm font-semibold h-14 px-10 rounded-sm shadow-[0_0_40px_rgba(242,122,46,0.3)] hover:shadow-[0_0_50px_rgba(242,122,46,0.4)] transition-all">
								Book a Free Consultation
								<ArrowRight className="size-4 ml-2" />
							</Button>
						</Link>
					</div>
				</div>
			</section>

			{/* ═══════════════════ FOOTER ═══════════════════ */}
			<footer className="border-t border-white/[0.04] py-12 px-6 bg-[#080C14]">
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
