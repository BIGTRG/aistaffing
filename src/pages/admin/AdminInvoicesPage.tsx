import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function AdminInvoicesPage() {
	const orgs = useQuery(api.organizations.listAll) ?? [];

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-2xl font-bold tracking-tight text-gray-900">Invoices</h1>
				<p className="text-gray-500">Platform-wide invoice management</p>
			</div>

			<Card className="border-gray-200">
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<FileText className="size-5 text-slate-600" />
						All Invoices
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="text-center py-12">
						<FileText className="size-10 text-gray-300 mx-auto mb-3" />
						<p className="text-sm text-gray-500">
							Invoice management coming soon. Currently tracking {orgs.length} client accounts.
						</p>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
