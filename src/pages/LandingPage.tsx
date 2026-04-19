import { useConvexAuth } from "convex/react";
import {
	ArrowRight,
	Check,
	Clock,
	DollarSign,
	Headphones,
	Mail,
	Phone,
	Shield,
	Sparkles,
	Users,
	Zap,
	Bot,
	Play,
	Star,
	Briefcase,
	Code,
	Scale,
	GraduationCap,
	Truck,
	Megaphone,
	Scissors,
	Stethoscope,
	Home,
	HardHat,
	ShoppingCart,
	UtensilsCrossed,
	Landmark,
	Monitor,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

/* ─── FULL 22-AGENT ROSTER BY DEPARTMENT ─── */
const departments = [
	{
		name: "Executive Suite",
		icon: Briefcase,
		color: "text-amber-700",
		bg: "bg-amber-50",
		agents: [
			"CEO Advisor",
			"CFO Advisor",
			"CTO Advisor",
			"President / COO",
		],
	},
	{
		name: "Management",
		icon: Users,
		color: "text-slate-800",
		bg: "bg-slate-50",
		agents: ["Project Manager", "Account Manager", "HR Manager"],
	},
	{
		name: "Customer Service",
		icon: Headphones,
		color: "text-emerald-600",
		bg: "bg-emerald-50",
		agents: ["Phone Receptionist", "Customer Service Rep"],
	},
	{
		name: "Sales",
		icon: DollarSign,
		color: "text-amber-500",
		bg: "bg-amber-50",
		agents: ["Sales Representative", "Internet Sales Team"],
	},
	{
		name: "Consulting",
		icon: Scale,
		color: "text-purple-600",
		bg: "bg-purple-50",
		agents: ["Business Consultant", "Legal Advisor", "Financial Advisor"],
	},
	{
		name: "Training",
		icon: GraduationCap,
		color: "text-cyan-600",
		bg: "bg-cyan-50",
		agents: ["Business Trainer"],
	},
	{
		name: "Technology",
		icon: Code,
		color: "text-indigo-600",
		bg: "bg-indigo-50",
		agents: [
			"Software Engineer",
			"UI/UX Designer",
			"Software Architect",
			"IT Support Specialist",
			"Data Analyst",
		],
	},
	{
		name: "Marketing",
		icon: Megaphone,
		color: "text-pink-600",
		bg: "bg-pink-50",
		agents: ["Marketing Specialist", "Copywriter"],
	},
	{
		name: "Operations",
		icon: Truck,
		color: "text-slate-600",
		bg: "bg-slate-50",
		agents: ["Dispatcher"],
	},
];

/* ─── PRICING TIERS (from brief) ─── */
const pricing = [
	{
		title: "Basic",
		price: "$200 – $500",
		period: "/month",
		desc: "Phone answering, scheduling, dispatch. Your AI handles the front lines 24/7 so you never miss a call or appointment.",
		examples: [
			"Phone Receptionist",
			"Customer Service Rep",
			"Dispatcher",
		],
		features: [
			"24/7 phone answering",
			"Appointment scheduling",
			"Call logging & transcripts",
			"FAQ handling",
			"SMS follow-ups",
		],
		popular: false,
	},
	{
		title: "Professional",
		price: "$500 – $1,500",
		period: "/month",
		desc: "Project managers, sales reps, marketing teams, and business advisors. The agents that grow your revenue.",
		examples: [
			"Sales Representative",
			"Project Manager",
			"Marketing Specialist",
		],
		features: [
			"Everything in Basic",
			"Lead qualification & outreach",
			"Social media management",
			"CRM integration",
			"Weekly performance reports",
		],
		popular: true,
	},
	{
		title: "Executive",
		price: "$1,500 – $5,000",
		period: "/month",
		desc: "C-suite advisory, strategic planning, and technology leadership. Enterprise-grade intelligence for your business.",
		examples: ["CEO Advisor", "CTO Advisor", "CFO Advisor"],
		features: [
			"Everything in Professional",
			"Strategic business planning",
			"Financial forecasting",
			"Technology roadmapping",
			"Dedicated account manager",
		],
		popular: false,
	},
];

/* ─── INDUSTRIES ─── */
const industries = [
	{
		name: "Cleaning Services",
		icon: Sparkles,
		desc: "Answer phones, dispatch cleaners, schedule appointments, send reminders",
	},
	{
		name: "Law Firms",
		icon: Scale,
		desc: "Screen intake calls, schedule consultations, manage follow-ups",
	},
	{
		name: "Medical / Dental",
		icon: Stethoscope,
		desc: "Patient calls, appointment scheduling, reminders, health FAQs",
	},
	{
		name: "Real Estate",
		icon: Home,
		desc: "Answer buyer questions, schedule showings, follow up on leads",
	},
	{
		name: "Construction",
		icon: HardHat,
		desc: "Schedule jobs, coordinate subs, client check-ins, project tracking",
	},
	{
		name: "Insurance",
		icon: Shield,
		desc: "Quote requests, policy questions, claims intake, renewals",
	},
	{
		name: "Lawn Care",
		icon: Scissors,
		desc: "Booking, dispatch, seasonal scheduling, customer follow-ups",
	},
	{
		name: "Restaurants",
		icon: UtensilsCrossed,
		desc: "Reservations, menu questions, catering inquiries, special requests",
	},
	{
		name: "Retail / E-commerce",
		icon: ShoppingCart,
		desc: "Customer service, order tracking, product questions, returns",
	},
	{
		name: "Financial Services",
		icon: Landmark,
		desc: "Schedule advisor meetings, answer questions, send report summaries",
	},
	{
		name: "Trucking / Logistics",
		icon: Truck,
		desc: "Dispatch drivers, track loads, delivery status updates",
	},
	{
		name: "Tech Startups",
		icon: Monitor,
		desc: "Virtual CTO, project manager, or engineer for early-stage teams",
	},
];

const stats = [
	{ value: "24/7", label: "Availability" },
	{ value: "< 24hrs", label: "Deploy Time" },
	{ value: "$0", label: "Workers' Comp" },
	{ value: "22+", label: "Agent Roles" },
];

export function LandingPage() {
	const { isAuthenticated, isLoading } = useConvexAuth();

	return (
		<div className="flex-1 flex flex-col overflow-hidden">
			{/* ─── NAV ─── */}
			<nav className="sticky top-0 z-50 bg-slate-900">
				<div className="container flex h-20 items-center justify-between">
					<div className="flex items-center gap-3">
						<img src="/logo.png" alt="AI Staffing Agency" className="h-12 w-12" />
						<span className="font-bold text-xl text-white tracking-tight">AI Staffing Agency</span>
					</div>
					<div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
						<a href="#agents" className="hover:text-white transition-colors">Agents</a>
						<a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
						<a href="#industries" className="hover:text-white transition-colors">Industries</a>
						{isAuthenticated ? (
							<Link to="/dashboard">
								<Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white font-semibold">Dashboard</Button>
							</Link>
						) : (
							<Link to="/signup">
								<Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white font-semibold">Get Started</Button>
							</Link>
						)}
					</div>
				</div>
			</nav>

			{/* ─── HERO ─── */}
			<section className="relative flex flex-col items-center justify-center px-4 py-20 md:py-28 bg-gradient-to-b from-slate-50 to-white">
				<div className="absolute inset-0 -z-10 overflow-hidden">
					<div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(220_14%_90%)_1px,transparent_1px),linear-gradient(to_bottom,hsl(220_14%_90%)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-50" />
				</div>

				<div className="max-w-4xl mx-auto text-center space-y-6">
					<div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-900 tracking-wide uppercase">
						<Bot className="size-3.5" />
						The Future of Staffing
					</div>

					<h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] text-gray-900">
						Your Staff Never
						<br />
						<span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-800 to-slate-700">
							Sleeps.
						</span>
					</h1>

					<p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
						The first staffing agency that deploys AI agents instead
						of human temps. Receptionists, sales reps, project
						managers, marketing teams, and C-suite advisors
						&mdash; deployed to your business in under 24 hours.
						<span className="font-semibold text-gray-800">
							{" "}
							No liability. No insurance. No days off.
						</span>
					</p>

					{!isAuthenticated && !isLoading && (
						<div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
							<Button
								size="lg"
								className="text-base h-12 px-8 bg-slate-800 hover:bg-slate-900 text-white shadow-lg shadow-slate-800/25"
								asChild
							>
								<Link to="/signup">
									Get Started Free
									<ArrowRight className="size-4" />
								</Link>
							</Button>
							<Button
								size="lg"
								variant="outline"
								className="text-base h-12 px-8 border-gray-300 text-gray-700 hover:bg-gray-50"
								asChild
							>
								<Link to="/login">
									<Play className="size-4" />
									Watch Demo
								</Link>
							</Button>
						</div>
					)}
					{isAuthenticated && (
						<div className="pt-4">
							<Button
								size="lg"
								className="text-base h-12 px-8 bg-slate-800 hover:bg-slate-900 text-white shadow-lg shadow-slate-800/25"
								asChild
							>
								<Link to="/dashboard">
									Go to Dashboard
									<ArrowRight className="size-4" />
								</Link>
							</Button>
						</div>
					)}

					<div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 pt-2 text-sm text-gray-500">
						<div className="flex items-center gap-1.5">
							<Check className="size-4 text-slate-800" />
							<span>Free consultation</span>
						</div>
						<div className="flex items-center gap-1.5">
							<Check className="size-4 text-slate-800" />
							<span>Deploy in 24 hours</span>
						</div>
						<div className="flex items-center gap-1.5">
							<Check className="size-4 text-slate-800" />
							<span>Setup from $500</span>
						</div>
					</div>
				</div>
			</section>

			{/* ─── STATS BAR ─── */}
			<section className="py-8 bg-white border-y border-gray-100">
				<div className="container">
					<div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto">
						{stats.map((s) => (
							<div key={s.label} className="text-center">
								<div className="text-2xl md:text-3xl font-bold text-slate-800">
									{s.value}
								</div>
								<div className="text-sm text-gray-500 mt-1">
									{s.label}
								</div>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* ─── VALUE PROPS ─── */}
			<section className="py-16 md:py-24 bg-white">
				<div className="container">
					<div className="max-w-3xl mx-auto text-center mb-16">
						<p className="text-sm font-semibold text-amber-700 mb-3 tracking-wide uppercase">
							Why AI Staffing
						</p>
						<h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-gray-900">
							A Real Staffing Agency. Powered by AI.
						</h2>
						<p className="text-gray-600 text-lg leading-relaxed">
							We operate exactly like a traditional staffing agency
							&mdash; but instead of placing human workers, we
							deploy intelligent AI agents into your business. Same
							process. Better results. Fraction of the cost.
						</p>
					</div>

					<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
						<div className="group rounded-xl bg-white border border-gray-200 p-6 transition-all hover:shadow-md hover:border-slate-200">
							<div className="inline-flex size-12 items-center justify-center rounded-xl bg-slate-50 mb-4">
								<Shield className="size-6 text-slate-800" />
							</div>
							<h3 className="font-semibold text-lg mb-2 text-gray-900">
								Zero Liability
							</h3>
							<p className="text-gray-600 text-sm leading-relaxed">
								No workers' comp. No insurance. No HR issues. No
								payroll taxes. AI agents work without the legal
								overhead of human employees.
							</p>
						</div>

						<div className="group rounded-xl bg-white border border-gray-200 p-6 transition-all hover:shadow-md hover:border-amber-200">
							<div className="inline-flex size-12 items-center justify-center rounded-xl bg-amber-50 mb-4">
								<Clock className="size-6 text-amber-700" />
							</div>
							<h3 className="font-semibold text-lg mb-2 text-gray-900">
								24/7 Availability
							</h3>
							<p className="text-gray-600 text-sm leading-relaxed">
								No sick days. No vacations. No lunch breaks. Your
								AI staff is always on, always professional,
								always ready to serve your customers.
							</p>
						</div>

						<div className="group rounded-xl bg-white border border-gray-200 p-6 transition-all hover:shadow-md hover:border-green-200">
							<div className="inline-flex size-12 items-center justify-center rounded-xl bg-green-50 mb-4">
								<Zap className="size-6 text-green-600" />
							</div>
							<h3 className="font-semibold text-lg mb-2 text-gray-900">
								Deploy in 24 Hours
							</h3>
							<p className="text-gray-600 text-sm leading-relaxed">
								No training period. No ramp-up time. Tell us
								about your business, and your AI agent is
								configured and live within a day.
							</p>
						</div>

						<div className="group rounded-xl bg-white border border-gray-200 p-6 transition-all hover:shadow-md hover:border-purple-200">
							<div className="inline-flex size-12 items-center justify-center rounded-xl bg-purple-50 mb-4">
								<Phone className="size-6 text-purple-600" />
							</div>
							<h3 className="font-semibold text-lg mb-2 text-gray-900">
								We Build Your Setup
							</h3>
							<p className="text-gray-600 text-sm leading-relaxed">
								No tech team? No problem. We build the phone
								system, client portal, and scheduling tools your
								business needs before deploying your agent.
							</p>
						</div>

						<div className="group rounded-xl bg-white border border-gray-200 p-6 transition-all hover:shadow-md hover:border-cyan-200">
							<div className="inline-flex size-12 items-center justify-center rounded-xl bg-cyan-50 mb-4">
								<Mail className="size-6 text-cyan-600" />
							</div>
							<h3 className="font-semibold text-lg mb-2 text-gray-900">
								Multi-Channel
							</h3>
							<p className="text-gray-600 text-sm leading-relaxed">
								Phone, email, chat, social media. Your AI agents
								work across every communication channel your
								customers use.
							</p>
						</div>

						<div className="group rounded-xl bg-gradient-to-br from-slate-50 to-amber-50 border border-slate-200 p-6 transition-all hover:shadow-md">
							<div className="inline-flex size-12 items-center justify-center rounded-xl bg-amber-50 mb-4">
								<Sparkles className="size-6 text-amber-700" />
							</div>
							<h3 className="font-semibold text-lg mb-2 text-gray-900">
								Scale Without Limits
							</h3>
							<p className="text-gray-600 text-sm leading-relaxed">
								One AI agent can serve unlimited interactions.
								Add more agents as you grow. No recruiting, no
								onboarding, no turnover.
							</p>
						</div>
					</div>
				</div>
			</section>

			{/* ─── COMPARISON TABLE ─── */}
			<section className="py-16 md:py-20 bg-gray-50">
				<div className="container">
					<div className="max-w-3xl mx-auto text-center mb-12">
						<p className="text-sm font-semibold text-slate-800 mb-3 tracking-wide uppercase">
							See the Difference
						</p>
						<h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-gray-900">
							Traditional Staffing vs. AI Staffing
						</h2>
					</div>

					<div className="max-w-3xl mx-auto overflow-hidden rounded-xl border border-gray-200 bg-white">
						<div className="grid grid-cols-2 bg-gray-900 text-white">
							<div className="px-6 py-4 text-sm font-semibold">
								Traditional Staffing
							</div>
							<div className="px-6 py-4 text-sm font-semibold text-slate-400">
								AI Staffing Agency
							</div>
						</div>
						{[
							[
								"Human workers on a roster",
								"AI agents on a roster",
							],
							[
								"Client pays hourly + markup",
								"Client pays monthly subscription",
							],
							[
								"One worker, one client at a time",
								"One AI agent serves unlimited clients",
							],
							[
								"You handle payroll, taxes, insurance",
								"We handle platform, tech, and support",
							],
							[
								"Call in, we send a person",
								"Call in, we deploy an AI agent + build your setup",
							],
							[
								"Weeks to find & train a hire",
								"Live in under 24 hours",
							],
						].map(([trad, ai], i) => (
							<div
								key={trad}
								className={`grid grid-cols-2 ${i % 2 === 0 ? "bg-white" : "bg-gray-50"}`}
							>
								<div className="px-6 py-4 text-sm text-gray-500 border-r border-gray-100">
									{trad}
								</div>
								<div className="px-6 py-4 text-sm text-gray-900 font-medium">
									{ai}
								</div>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* ─── HOW IT WORKS ─── */}
			<section className="py-16 md:py-24 bg-white">
				<div className="container">
					<div className="text-center mb-16">
						<p className="text-sm font-semibold text-slate-800 mb-3 tracking-wide uppercase">
							How It Works
						</p>
						<h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-gray-900">
							From Sign-Up to Deployed in 4 Steps
						</h2>
					</div>

					<div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl mx-auto">
						{[
							{
								step: "1",
								title: "Contact Us",
								desc: "Visit our site, browse the agent roster, or fill out a contact form describing what your business needs.",
								color: "bg-slate-800",
								shadow: "shadow-slate-800/25",
							},
							{
								step: "2",
								title: "We Assess",
								desc: "An account manager contacts you to understand your needs and determine what infrastructure you have in place.",
								color: "bg-slate-800",
								shadow: "shadow-slate-800/25",
							},
							{
								step: "3",
								title: "We Build & Deploy",
								desc: "If you need a phone system, portal, or tools — we build them. Then we configure and deploy your AI agent.",
								color: "bg-slate-800",
								shadow: "shadow-slate-800/25",
							},
							{
								step: "4",
								title: "You're Live",
								desc: "Your AI agent starts working immediately. Monitor activity in your portal. Add more agents anytime.",
								color: "bg-amber-700",
								shadow: "shadow-orange-500/25",
							},
						].map((s) => (
							<div key={s.step} className="text-center">
								<div
									className={`inline-flex size-16 items-center justify-center rounded-2xl ${s.color} text-white text-2xl font-bold mb-4 shadow-lg ${s.shadow}`}
								>
									{s.step}
								</div>
								<h3 className="font-semibold text-lg mb-2 text-gray-900">
									{s.title}
								</h3>
								<p className="text-gray-600 text-sm">
									{s.desc}
								</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* ─── FULL AGENT ROSTER ─── */}
			<section className="py-16 md:py-24 bg-gray-50">
				<div className="container">
					<div className="text-center mb-16">
						<p className="text-sm font-semibold text-slate-800 mb-3 tracking-wide uppercase">
							The Full Roster
						</p>
						<h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-gray-900">
							22 AI Agents. 9 Departments. Your Pick.
						</h2>
						<p className="text-gray-600 max-w-2xl mx-auto text-lg">
							Every agent has a defined role, skill set, and
							knowledge base. Browse the roster, pick who you
							need, and we deploy them to your business.
						</p>
					</div>

					<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
						{departments.map((dept) => (
							<div
								key={dept.name}
								className="rounded-xl border border-gray-200 bg-white p-6 hover:shadow-md hover:border-slate-200 transition-all"
							>
								<div className="flex items-center gap-3 mb-4">
									<div
										className={`inline-flex size-10 items-center justify-center rounded-lg ${dept.bg}`}
									>
										<dept.icon
											className={`size-5 ${dept.color}`}
										/>
									</div>
									<div>
										<h3 className="font-semibold text-gray-900">
											{dept.name}
										</h3>
										<p className="text-xs text-gray-500">
											{dept.agents.length} agent
											{dept.agents.length > 1 ? "s" : ""}
										</p>
									</div>
								</div>
								<ul className="space-y-2">
									{dept.agents.map((agent) => (
										<li
											key={agent}
											className="flex items-center gap-2 text-sm text-gray-600"
										>
											<Check className="size-4 text-slate-800 shrink-0" />
											{agent}
										</li>
									))}
								</ul>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* ─── INDUSTRIES ─── */}
			<section className="py-16 md:py-24 bg-white">
				<div className="container">
					<div className="text-center mb-16">
						<p className="text-sm font-semibold text-amber-700 mb-3 tracking-wide uppercase">
							Industries We Serve
						</p>
						<h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-gray-900">
							Built for Small Service Businesses
						</h2>
						<p className="text-gray-600 max-w-2xl mx-auto text-lg">
							If your business takes calls, sends emails, or
							communicates with customers digitally &mdash; we
							have an AI agent for you.
						</p>
					</div>

					<div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 max-w-6xl mx-auto">
						{industries.map((ind) => (
							<div
								key={ind.name}
								className="flex items-start gap-3 rounded-lg border border-gray-100 bg-white p-4 hover:border-slate-200 hover:shadow-sm transition-all"
							>
								<div className="inline-flex size-9 items-center justify-center rounded-lg bg-slate-50 shrink-0 mt-0.5">
									<ind.icon className="size-4 text-slate-800" />
								</div>
								<div>
									<h4 className="font-medium text-sm text-gray-900">
										{ind.name}
									</h4>
									<p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
										{ind.desc}
									</p>
								</div>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* ─── PRICING ─── */}
			<section className="py-16 md:py-24 bg-gray-50">
				<div className="container">
					<div className="text-center mb-16">
						<p className="text-sm font-semibold text-amber-700 mb-3 tracking-wide uppercase">
							Simple Pricing
						</p>
						<h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-gray-900">
							Pay Less Than a Human. Get More.
						</h2>
						<p className="text-gray-600 max-w-xl mx-auto text-lg">
							Monthly subscriptions based on agent complexity.
							One-time platform setup starts at $500 for
							businesses that need infrastructure built.
						</p>
					</div>

					<div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
						{pricing.map((plan) => (
							<div
								key={plan.title}
								className={`rounded-xl border p-6 md:p-8 transition-all hover:shadow-lg flex flex-col ${
									plan.popular
										? "border-slate-300 bg-white ring-2 ring-slate-100 shadow-md"
										: "border-gray-200 bg-white"
								}`}
							>
								{plan.popular && (
									<span className="inline-block self-start text-xs font-semibold text-white bg-red-500 px-3 py-1 rounded-full mb-3">
										<Star className="size-3 inline mr-1" />
										Most Popular
									</span>
								)}
								<h3 className="font-semibold text-lg mb-1 text-gray-900">
									{plan.title}
								</h3>
								<div className="mb-1">
									<span className="text-2xl font-bold text-gray-900">
										{plan.price}
									</span>
									<span className="text-sm text-gray-500">
										{plan.period}
									</span>
								</div>
								<div className="flex flex-wrap gap-1 mb-3">
									{plan.examples.map((ex) => (
										<span
											key={ex}
											className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded"
										>
											{ex}
										</span>
									))}
								</div>
								<p className="text-sm text-gray-600 mb-5">
									{plan.desc}
								</p>
								<ul className="space-y-2 mb-6 flex-1">
									{plan.features.map((f) => (
										<li
											key={f}
											className="flex items-center gap-2 text-sm text-gray-600"
										>
											<Check className="size-4 text-slate-800 shrink-0" />
											{f}
										</li>
									))}
								</ul>
								<Button
									className={`w-full ${
										plan.popular
											? "bg-slate-800 hover:bg-slate-900 text-white shadow-sm"
											: "bg-gray-900 hover:bg-gray-800 text-white"
									}`}
									asChild
								>
									<Link to="/signup">
										Get Started{" "}
										<ArrowRight className="size-4" />
									</Link>
								</Button>
							</div>
						))}
					</div>

					<div className="text-center mt-8">
						<p className="text-sm text-gray-500">
							Platform setup fee: $500 &ndash; $1,500 (one-time)
							for businesses that need phone systems, portals, or
							scheduling tools built.
						</p>
					</div>
				</div>
			</section>

			{/* ─── CTA ─── */}
			<section className="py-16 md:py-24 bg-gradient-to-br from-slate-900 to-slate-800">
				<div className="container">
					<div className="max-w-3xl mx-auto text-center space-y-6">
						<h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
							Ready to Staff Up?
						</h2>
						<p className="text-lg text-slate-300">
							Book a free consultation. Tell us what your business
							needs. We'll recommend the right agents, build your
							setup if needed, and have you live in under 24
							hours.
						</p>
						<div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
							<Button
								size="lg"
								className="text-base h-12 px-8 bg-white text-slate-900 hover:bg-slate-50 shadow-lg"
								asChild
							>
								<Link to="/signup">
									Book a Free Consultation
									<ArrowRight className="size-4" />
								</Link>
							</Button>
							<Button
								size="lg"
								variant="outline"
								className="text-base h-12 px-8 border-slate-300 text-white hover:bg-slate-700/20"
								asChild
							>
								<Link to="/login">Sign In</Link>
							</Button>
						</div>
					</div>
				</div>
			</section>

			{/* ─── FOOTER ─── */}
			<footer className="border-t border-gray-200 py-10 bg-white">
				<div className="container">
					<div className="flex flex-col md:flex-row items-start justify-between gap-8">
						<div>
							<div className="flex items-center gap-3 mb-3">
								<img src="/logo.png" alt="AI Staffing Agency" className="h-8 w-8" />
								<span className="font-bold text-gray-900">
									AI Staffing Agency
								</span>
							</div>
							<p className="text-sm text-gray-500 max-w-xs">
								The first staffing agency that deploys AI agents
								instead of human temps. Built for small service
								businesses.
							</p>
						</div>
						<div className="flex gap-12 text-sm">
							<div>
								<h4 className="font-semibold text-gray-900 mb-3">
									Company
								</h4>
								<ul className="space-y-2 text-gray-500">
									<li>
										<a
											href="#"
											className="hover:text-slate-800"
										>
											About
										</a>
									</li>
									<li>
										<a
											href="#"
											className="hover:text-slate-800"
										>
											Pricing
										</a>
									</li>
									<li>
										<a
											href="#"
											className="hover:text-slate-800"
										>
											Contact
										</a>
									</li>
								</ul>
							</div>
							<div>
								<h4 className="font-semibold text-gray-900 mb-3">
									Legal
								</h4>
								<ul className="space-y-2 text-gray-500">
									<li>
										<a
											href="#"
											className="hover:text-slate-800"
										>
											Privacy
										</a>
									</li>
									<li>
										<a
											href="#"
											className="hover:text-slate-800"
										>
											Terms
										</a>
									</li>
								</ul>
							</div>
						</div>
					</div>
					<div className="mt-8 pt-6 border-t border-gray-100 text-center text-sm text-gray-500">
						&copy; {new Date().getFullYear()} AI Staffing Agency
						&mdash; A TRG Tech Link Company. All rights reserved.
					</div>
				</div>
			</footer>
		</div>
	);
}
