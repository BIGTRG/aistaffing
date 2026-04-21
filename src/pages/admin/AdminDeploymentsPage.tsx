import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Activity, Bot, Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export function AdminDeploymentsPage() {
	const allDeployments = useQuery(api.deployments.listAll) ?? [];
	const [search, setSearch] = useState("");

	const filtered = allDeployments.filter((d) =>
		d.displayName.toLowerCase().includes(search.toLowerCase()) ||
		(d.org?.name ?? "").toLowerCase().includes(search.toLowerCase())
	);

	const active = filtered.filter((d) => d.status === "active");
	const paused = filtered.filter((d) => d.status === "paused");

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold tracking-tight text-gray-900">Deployments</h1>
					<p className="text-gray-500">All agent deployments across clients</p>
				</div>
				<div className="flex items-center gap-4 text-sm">
					<span className="text-emerald-600 font-medium">{active.length} active</span>
					<span className="text-amber-600 font-medium">{paused.length} paused</span>
				</div>
			</div>

			<div className="relative">
				<Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
				<Input
					placeholder="Search deployments..."
					value={search}
					onChange={(e) => setSearch(e.target.value)}
					className="pl-10 h-11"
				/>
			</div>

			<div className="space-y-3">
				{filtered.map((d) => (
					<Card key={d._id} className="border-gray-200">
						<CardContent className="py-4">
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-4">
									<div className={`size-10 rounded-lg flex items-center justify-center ${
										d.status === "active" ? "bg-emerald-50" : "bg-gray-100"
									}`}>
										<Bot className={`size-5 ${
											d.status === "active" ? "text-emerald-600" : "text-gray-400"
										}`} />
									</div>
									<div>
										<h3 className="font-medium text-sm text-gray-900">{d.displayName}</h3>
										<div className="flex items-center gap-2 mt-0.5">
											<span className="text-xs text-gray-500">{d.org?.name ?? "Unknown"}</span>
											<span className="text-xs text-gray-400">•</span>
											<span className="text-xs text-gray-500">{d.template?.department?.replace(/_/g, " ") ?? ""}</span>
											<span className="text-xs text-gray-400">•</span>
											<span className="text-xs text-gray-500">{d.template?.name ?? ""}</span>
										</div>
									</div>
								</div>
								<div className="flex items-center gap-3">
									{d.deployedAt && (
										<span className="text-xs text-gray-400">
											Deployed {new Date(d.deployedAt).toLocaleDateString()}
										</span>
									)}
									<span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
										d.status === "active"
											? "bg-emerald-50 text-emerald-700"
											: d.status === "paused"
												? "bg-amber-50 text-amber-700"
												: "bg-gray-100 text-gray-500"
									}`}>
										{d.status}
									</span>
								</div>
							</div>
						</CardContent>
					</Card>
				))}
				{filtered.length === 0 && (
					<div className="text-center py-12">
						<Activity className="size-10 text-gray-300 mx-auto mb-3" />
						<p className="text-sm text-gray-500">No deployments found.</p>
					</div>
				)}
			</div>
		</div>
	);
}
