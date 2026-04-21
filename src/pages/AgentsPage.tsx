import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import {
	Bot,
	Briefcase,
	CheckCircle2,
	Code,
	DollarSign,
	GraduationCap,
	Headphones,
	Megaphone,
	Scale,
	Search,
	Users,
	Database,
	Zap,
	Heart,
	Cog,
	Banknote,
	Monitor,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";

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

export function AgentsPage() {
	const [search, setSearch] = useState("");
	const [filterDept, setFilterDept] = useState<string>("All");
	const [deploying, setDeploying] = useState<string | null>(null);

	const templates = useQuery(api.agentTemplates.list) ?? [];
	const org = useQuery(api.organizations.getMine);
	const deployments = useQuery(
		api.deployments.listByOrg,
		org ? { orgId: org._id } : "skip"
	) ?? [];
	const deploy = useMutation(api.deployments.deploy);

	// Deployed template IDs
	const deployedTemplateIds = new Set(
		deployments
			.filter((d) => d.status === "active" || d.status === "paused")
			.map((d) => d.templateId)
	);

	// Departments for filter
	const allDepts = Array.from(new Set(templates.map((t) => t.department)));

	// Filtered list
	const filtered = templates.filter((t) => {
		const matchesSearch =
			t.name.toLowerCase().includes(search.toLowerCase()) ||
			t.description.toLowerCase().includes(search.toLowerCase());
		const matchesDept = filterDept === "All" || t.department === filterDept;
		return matchesSearch && matchesDept;
	});

	// Group by department
	const grouped = filtered.reduce(
		(acc, t) => {
			if (!acc[t.department]) acc[t.department] = [];
			acc[t.department].push(t);
			return acc;
		},
		{} as Record<string, typeof templates>
	);

	const handleDeploy = async (templateId: string, name: string) => {
		if (!org) {
			toast.error("Please complete onboarding first.");
			return;
		}
		setDeploying(templateId);
		try {
			await deploy({
				orgId: org._id,
				templateId: templateId as any,
				displayName: name,
			});
			toast.success(`${name} deployed successfully.`);
		} catch (err) {
			toast.error("Failed to deploy agent.");
		} finally {
			setDeploying(null);
		}
	};

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-2xl font-bold tracking-tight text-gray-900">
					Agent Roster
				</h1>
				<p className="text-gray-500">
					100 AI agents across 10 departments. Deploy any agent to your
					business.
				</p>
			</div>

			{/* Search & Filter */}
			<div className="flex flex-col sm:flex-row gap-3">
				<div className="relative flex-1">
					<Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
					<input
						type="text"
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						placeholder="Search agents..."
						className="w-full rounded-lg border border-gray-300 pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent"
					/>
				</div>
				<div className="flex gap-2 flex-wrap">
					<button
						onClick={() => setFilterDept("All")}
						className={`px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
							filterDept === "All"
								? "bg-slate-800 text-white"
								: "bg-gray-100 text-gray-600 hover:bg-gray-200"
						}`}
					>
						All
					</button>
					{allDepts.map((dept) => (
						<button
							key={dept}
							onClick={() => setFilterDept(dept)}
							className={`px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
								filterDept === dept
									? "bg-slate-800 text-white"
									: "bg-gray-100 text-gray-600 hover:bg-gray-200"
							}`}
						>
							{dept}
						</button>
					))}
				</div>
			</div>

			{/* Agent Grid */}
			{Object.entries(grouped).map(([dept, agents]) => {
				const Icon = departmentIcons[dept] ?? Bot;
				return (
					<div key={dept}>
						<div className="flex items-center gap-2 mb-3">
							<Icon className="size-5 text-slate-700" />
							<h2 className="font-semibold text-gray-900">
								{dept}
							</h2>
							<span className="text-xs text-gray-400 ml-1">
								{agents.length} agent
								{agents.length !== 1 ? "s" : ""}
							</span>
						</div>
						<div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
							{agents.map((agent) => {
								const isDeployed = deployedTemplateIds.has(
									agent._id
								);
								const isLoading = deploying === agent._id;
								return (
									<Card
										key={agent._id}
										className={`border-gray-200 transition-shadow hover:shadow-md ${
											isDeployed
												? "ring-1 ring-emerald-300 bg-emerald-50/30"
												: ""
										}`}
									>
										<CardContent className="p-5">
											<div className="flex items-start justify-between mb-3">
												<div>
													<h3 className="font-semibold text-gray-900 text-sm">
														{agent.name}
													</h3>
													<span className="text-xs text-gray-500">
														{agent.department}
													</span>
												</div>
												{isDeployed && (
													<span className="flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
														<CheckCircle2 className="size-3" />
														Active
													</span>
												)}
											</div>
											<p className="text-xs text-gray-600 mb-4 line-clamp-3">
												{agent.description}
											</p>
											<div className="flex items-center justify-between">
												<span className="text-sm font-bold text-slate-800">
													$
													{(
														agent.basePriceCents /
														100
													).toLocaleString()}
													/mo
												</span>
												{isDeployed ? (
													<span className="text-xs text-emerald-600 font-medium">
														Deployed
													</span>
												) : (
													<Button
														size="sm"
														className="bg-slate-800 hover:bg-slate-900 text-white text-xs h-8"
														disabled={isLoading || !org}
														onClick={() =>
															handleDeploy(
																agent._id,
																agent.name
															)
														}
													>
														{isLoading ? (
															"Deploying..."
														) : (
															<>
																<Zap className="size-3 mr-1" />
																Deploy
															</>
														)}
													</Button>
												)}
											</div>
										</CardContent>
									</Card>
								);
							})}
						</div>
					</div>
				);
			})}

			{filtered.length === 0 && (
				<div className="text-center py-12">
					<Bot className="size-12 text-gray-300 mx-auto mb-3" />
					<p className="text-sm text-gray-500">
						No agents match your search.
					</p>
				</div>
			)}
		</div>
	);
}
