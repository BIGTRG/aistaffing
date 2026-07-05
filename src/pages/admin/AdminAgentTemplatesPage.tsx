import { useApiQuery } from "@/lib/hooks";
import { api } from "@/lib/api";
import { Bot, Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export function AdminAgentTemplatesPage() {
	const templates = useApiQuery(() => api.agentTemplates.list(), []) ?? [];
	const [search, setSearch] = useState("");

	const filtered = templates.filter((t) =>
		t.name.toLowerCase().includes(search.toLowerCase()) ||
		t.department.toLowerCase().includes(search.toLowerCase())
	);

	const departments = [...new Set(filtered.map((t) => t.department))];

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold tracking-tight text-gray-900">Agent Templates</h1>
					<p className="text-gray-500">Manage all agent types available on the platform</p>
				</div>
				<div className="flex items-center gap-2 text-sm text-gray-500">
					<Bot className="size-4" />
					{templates.length} templates
				</div>
			</div>

			<div className="relative">
				<Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
				<Input
					placeholder="Search templates..."
					value={search}
					onChange={(e) => setSearch(e.target.value)}
					className="pl-10 h-11"
				/>
			</div>

			{departments.map((dept) => (
				<div key={dept} className="space-y-3">
					<h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
						{dept.replace(/_/g, " ")}
					</h2>
					<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
						{filtered
							.filter((t) => t.department === dept)
							.map((template) => (
								<Card key={template.id} className="border-gray-200">
									<CardContent className="py-4">
										<div className="flex items-start justify-between">
											<div className="flex items-start gap-3">
												<div className="size-10 rounded-lg bg-emerald-50 flex items-center justify-center mt-0.5">
													<Bot className="size-5 text-emerald-600" />
												</div>
												<div>
													<h3 className="font-medium text-sm text-gray-900">{template.name}</h3>
													<p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{template.description}</p>
												</div>
											</div>
										</div>
										<div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
											<span className="text-sm font-semibold text-gray-900">
												${(template.basePriceCents / 100).toLocaleString()}/mo
											</span>
											<span className={`text-xs px-2 py-0.5 rounded-full ${
												template.isActive
													? "bg-emerald-50 text-emerald-700"
													: "bg-gray-100 text-gray-500"
											}`}>
												{template.isActive ? "Active" : "Inactive"}
											</span>
										</div>
									</CardContent>
								</Card>
							))}
					</div>
				</div>
			))}
		</div>
	);
}
