import {
	Briefcase,
	Users,
	Headphones,
	DollarSign,
	Scale,
	GraduationCap,
	Code,
	Megaphone,
	Truck,
	Plus,
	Search,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const departments = [
	{
		name: "Executive Suite",
		icon: Briefcase,
		color: "text-orange-500",
		bg: "bg-orange-50",
		border: "border-orange-200",
		agents: [
			{
				name: "CEO Advisor",
				desc: "Strategic planning, business growth, market positioning, competitive analysis",
				tier: "Executive",
				price: "$3,000 – $5,000",
			},
			{
				name: "CFO Advisor",
				desc: "Financial forecasting, cash flow management, budgeting, profitability analysis",
				tier: "Executive",
				price: "$2,500 – $4,500",
			},
			{
				name: "CTO Advisor",
				desc: "Technology roadmapping, vendor evaluation, architecture decisions, security planning",
				tier: "Executive",
				price: "$2,500 – $4,500",
			},
			{
				name: "President / COO",
				desc: "Operational efficiency, team coordination, process optimization, KPI tracking",
				tier: "Executive",
				price: "$3,000 – $5,000",
			},
		],
	},
	{
		name: "Management",
		icon: Users,
		color: "text-blue-600",
		bg: "bg-blue-50",
		border: "border-blue-200",
		agents: [
			{
				name: "Project Manager",
				desc: "Timeline management, task tracking, team coordination, milestone reporting",
				tier: "Professional",
				price: "$800 – $1,200",
			},
			{
				name: "Account Manager",
				desc: "Client relationship management, upsell identification, satisfaction tracking",
				tier: "Professional",
				price: "$700 – $1,100",
			},
			{
				name: "HR Manager",
				desc: "Policy creation, onboarding workflows, compliance tracking, culture development",
				tier: "Professional",
				price: "$800 – $1,200",
			},
		],
	},
	{
		name: "Customer Service",
		icon: Headphones,
		color: "text-emerald-600",
		bg: "bg-emerald-50",
		border: "border-emerald-200",
		agents: [
			{
				name: "Phone Receptionist",
				desc: "24/7 call answering, appointment scheduling, FAQ handling, call routing",
				tier: "Basic",
				price: "$200 – $400",
			},
			{
				name: "Customer Service Rep",
				desc: "Multi-channel support, complaint resolution, order tracking, follow-ups",
				tier: "Basic",
				price: "$250 – $500",
			},
		],
	},
	{
		name: "Sales",
		icon: DollarSign,
		color: "text-amber-500",
		bg: "bg-amber-50",
		border: "border-amber-200",
		agents: [
			{
				name: "Sales Representative",
				desc: "Lead qualification, outbound calls, pipeline management, CRM updates",
				tier: "Professional",
				price: "$600 – $1,000",
			},
			{
				name: "Internet Sales Team",
				desc: "Online lead response, chat sales, email sequences, social selling",
				tier: "Professional",
				price: "$700 – $1,200",
			},
		],
	},
	{
		name: "Consulting",
		icon: Scale,
		color: "text-purple-600",
		bg: "bg-purple-50",
		border: "border-purple-200",
		agents: [
			{
				name: "Business Consultant",
				desc: "Process improvement, growth strategy, competitive analysis, market research",
				tier: "Executive",
				price: "$1,500 – $3,000",
			},
			{
				name: "Legal Advisor",
				desc: "Contract review, compliance guidance, risk assessment, policy creation",
				tier: "Executive",
				price: "$1,500 – $3,000",
			},
			{
				name: "Financial Advisor",
				desc: "Investment guidance, tax planning, retirement strategy, portfolio analysis",
				tier: "Executive",
				price: "$1,500 – $3,000",
			},
		],
	},
	{
		name: "Training",
		icon: GraduationCap,
		color: "text-cyan-600",
		bg: "bg-cyan-50",
		border: "border-cyan-200",
		agents: [
			{
				name: "Business Trainer",
				desc: "Employee training programs, onboarding materials, skills assessment, knowledge base",
				tier: "Professional",
				price: "$600 – $1,000",
			},
		],
	},
	{
		name: "Technology",
		icon: Code,
		color: "text-indigo-600",
		bg: "bg-indigo-50",
		border: "border-indigo-200",
		agents: [
			{
				name: "Software Engineer",
				desc: "Code development, bug fixes, feature builds, API integrations",
				tier: "Executive",
				price: "$2,000 – $4,000",
			},
			{
				name: "UI/UX Designer",
				desc: "Interface design, user research, wireframes, design systems",
				tier: "Professional",
				price: "$1,000 – $1,500",
			},
			{
				name: "Software Architect",
				desc: "System design, infrastructure planning, scalability strategy, tech stack selection",
				tier: "Executive",
				price: "$2,500 – $4,500",
			},
			{
				name: "IT Support Specialist",
				desc: "Troubleshooting, system maintenance, security monitoring, user support",
				tier: "Professional",
				price: "$500 – $900",
			},
			{
				name: "Data Analyst",
				desc: "Reporting, data visualization, trend analysis, business intelligence",
				tier: "Professional",
				price: "$800 – $1,200",
			},
		],
	},
	{
		name: "Marketing",
		icon: Megaphone,
		color: "text-pink-600",
		bg: "bg-pink-50",
		border: "border-pink-200",
		agents: [
			{
				name: "Marketing Specialist",
				desc: "Campaign management, social media, SEO, content calendar, analytics",
				tier: "Professional",
				price: "$700 – $1,200",
			},
			{
				name: "Copywriter",
				desc: "Ad copy, blog posts, email campaigns, landing pages, brand voice",
				tier: "Professional",
				price: "$500 – $900",
			},
		],
	},
	{
		name: "Operations",
		icon: Truck,
		color: "text-slate-600",
		bg: "bg-slate-50",
		border: "border-slate-200",
		agents: [
			{
				name: "Dispatcher",
				desc: "Route planning, scheduling, team coordination, real-time tracking, status updates",
				tier: "Basic",
				price: "$300 – $500",
			},
		],
	},
];

const tierColors: Record<string, { bg: string; text: string }> = {
	Basic: { bg: "bg-green-50", text: "text-green-700" },
	Professional: { bg: "bg-blue-50", text: "text-blue-700" },
	Executive: { bg: "bg-orange-50", text: "text-orange-700" },
};

export function AgentsPage() {
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedDept, setSelectedDept] = useState<string | null>(null);

	const filteredDepts = departments
		.map((dept) => ({
			...dept,
			agents: dept.agents.filter(
				(a) =>
					(!searchQuery ||
						a.name
							.toLowerCase()
							.includes(searchQuery.toLowerCase()) ||
						a.desc
							.toLowerCase()
							.includes(searchQuery.toLowerCase())) &&
					(!selectedDept || dept.name === selectedDept)
			),
		}))
		.filter((d) => d.agents.length > 0);

	const totalAgents = departments.reduce(
		(sum, d) => sum + d.agents.length,
		0
	);

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-2xl font-bold tracking-tight text-gray-900">
					Agent Roster
				</h1>
				<p className="text-gray-500">
					Browse {totalAgents} AI agents across{" "}
					{departments.length} departments. Deploy any agent to
					your business.
				</p>
			</div>

			{/* Search + Filter */}
			<div className="flex flex-col sm:flex-row gap-3">
				<div className="relative flex-1">
					<Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
					<input
						type="text"
						placeholder="Search agents by name or skill..."
						className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
					/>
				</div>
				<div className="flex flex-wrap gap-2">
					<button
						onClick={() => setSelectedDept(null)}
						className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
							!selectedDept
								? "bg-blue-600 text-white"
								: "bg-gray-100 text-gray-600 hover:bg-gray-200"
						}`}
					>
						All
					</button>
					{departments.map((d) => (
						<button
							key={d.name}
							onClick={() =>
								setSelectedDept(
									selectedDept === d.name ? null : d.name
								)
							}
							className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
								selectedDept === d.name
									? "bg-blue-600 text-white"
									: "bg-gray-100 text-gray-600 hover:bg-gray-200"
							}`}
						>
							{d.name}
						</button>
					))}
				</div>
			</div>

			{/* Agent Cards by Department */}
			{filteredDepts.map((dept) => (
				<div key={dept.name}>
					<div className="flex items-center gap-2 mb-4">
						<div
							className={`inline-flex size-8 items-center justify-center rounded-lg ${dept.bg}`}
						>
							<dept.icon
								className={`size-4 ${dept.color}`}
							/>
						</div>
						<h2 className="text-lg font-semibold text-gray-900">
							{dept.name}
						</h2>
						<span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
							{dept.agents.length} agent
							{dept.agents.length > 1 ? "s" : ""}
						</span>
					</div>

					<div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
						{dept.agents.map((agent) => {
							const tc = tierColors[agent.tier];
							return (
								<Card
									key={agent.name}
									className={`border-gray-200 hover:${dept.border} hover:shadow-sm transition-all`}
								>
									<CardHeader className="pb-2">
										<div className="flex items-start justify-between">
											<CardTitle className="text-base text-gray-900">
												{agent.name}
											</CardTitle>
											<span
												className={`text-xs font-medium px-2 py-0.5 rounded-full ${tc.bg} ${tc.text}`}
											>
												{agent.tier}
											</span>
										</div>
									</CardHeader>
									<CardContent className="space-y-3">
										<p className="text-sm text-gray-600 leading-relaxed">
											{agent.desc}
										</p>
										<div className="flex items-center justify-between">
											<span className="text-sm font-semibold text-gray-900">
												{agent.price}
												<span className="text-xs font-normal text-gray-500">
													/mo
												</span>
											</span>
											<Button
												size="sm"
												variant="outline"
												className="text-xs h-8 border-blue-200 text-blue-600 hover:bg-blue-50"
											>
												<Plus className="size-3 mr-1" />
												Deploy
											</Button>
										</div>
									</CardContent>
								</Card>
							);
						})}
					</div>
				</div>
			))}
		</div>
	);
}
