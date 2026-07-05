import { useApiQuery } from "@/lib/hooks";
import { api } from "@/lib/api";
import { Building2, Search, Bot } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export function AdminClientsPage() {
	const orgs = useApiQuery(() => api.organizations.listAll(), []) ?? [];
	const allDeployments = useApiQuery(() => api.deployments.listAll(), []) ?? [];
	const [search, setSearch] = useState("");

	const filtered = orgs.filter((o) =>
		o.name.toLowerCase().includes(search.toLowerCase()) ||
		o.industry.toLowerCase().includes(search.toLowerCase())
	);

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold tracking-tight text-gray-900">Clients</h1>
					<p className="text-gray-500">All employer accounts on the platform</p>
				</div>
				<div className="flex items-center gap-2 text-sm text-gray-500">
					<Building2 className="size-4" />
					{orgs.length} total
				</div>
			</div>

			<div className="relative">
				<Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
				<Input
					placeholder="Search clients..."
					value={search}
					onChange={(e) => setSearch(e.target.value)}
					className="pl-10 h-11"
				/>
			</div>

			<div className="space-y-3">
				{filtered.map((org) => {
					const orgDeps = allDeployments.filter((d) => d.orgId === org.id);
					const activeDeps = orgDeps.filter((d) => d.status === "active");

					return (
						<Card key={org.id} className="border-gray-200">
							<CardContent className="py-4">
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-4">
										<div className="size-12 rounded-xl bg-slate-100 flex items-center justify-center">
											<Building2 className="size-6 text-slate-600" />
										</div>
										<div>
											<h3 className="font-semibold text-gray-900">{org.name}</h3>
											<div className="flex items-center gap-3 mt-0.5">
												<span className="text-sm text-gray-500">{org.industry}</span>
												<span className="text-xs text-gray-400">•</span>
												<span className="text-sm text-gray-500 flex items-center gap-1">
													<Bot className="size-3" />
													{activeDeps.length} active agent{activeDeps.length !== 1 ? "s" : ""}
												</span>
											</div>
										</div>
									</div>
									<div className="flex items-center gap-3">
										<span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
											org.onboardingStatus === "active"
												? "bg-emerald-50 text-emerald-700"
												: org.onboardingStatus === "onboarding"
													? "bg-amber-50 text-amber-700"
													: "bg-gray-100 text-gray-500"
										}`}>
											{org.onboardingStatus}
										</span>
										{org.website && (
											<a
												href={org.website}
												target="_blank"
												rel="noopener noreferrer"
												className="text-xs text-amber-600 hover:underline"
											>
												Website →
											</a>
										)}
									</div>
								</div>
								{orgDeps.length > 0 && (
									<div className="mt-3 pt-3 border-t border-gray-100">
										<div className="flex flex-wrap gap-2">
											{orgDeps.map((d) => (
												<span
													key={d.id}
													className={`text-xs px-2 py-0.5 rounded-full ${
														d.status === "active"
															? "bg-emerald-50 text-emerald-700"
															: "bg-gray-100 text-gray-500"
													}`}
												>
													{d.displayName}
												</span>
											))}
										</div>
									</div>
								)}
							</CardContent>
						</Card>
					);
				})}
				{filtered.length === 0 && (
					<div className="text-center py-12">
						<Building2 className="size-10 text-gray-300 mx-auto mb-3" />
						<p className="text-sm text-gray-500">
							{search ? "No clients match your search." : "No clients yet."}
						</p>
					</div>
				)}
			</div>
		</div>
	);
}
