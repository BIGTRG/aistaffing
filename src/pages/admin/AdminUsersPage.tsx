import { useApiQuery } from "@/lib/hooks";
import { api } from "@/lib/api";
import { Users, Shield, Building2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function AdminUsersPage() {
	const platformUsers = useApiQuery(() => api.platformUsers.listAll(), []) ?? [];

	const admins = platformUsers.filter((u) => u.role === "admin");
	const employers = platformUsers.filter((u) => u.role === "employer");

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-2xl font-bold tracking-tight text-gray-900">Users</h1>
				<p className="text-gray-500">Platform user management</p>
			</div>

			<div className="grid gap-4 sm:grid-cols-2">
				<Card className="border-gray-200">
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
							<Shield className="size-4 text-red-500" />
							Admin Users
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold text-gray-900">{admins.length}</div>
					</CardContent>
				</Card>
				<Card className="border-gray-200">
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
							<Building2 className="size-4 text-amber-600" />
							Employer Users
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold text-gray-900">{employers.length}</div>
					</CardContent>
				</Card>
			</div>

			<Card className="border-gray-200">
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Users className="size-5 text-slate-600" />
						All Platform Users
					</CardTitle>
				</CardHeader>
				<CardContent>
					{platformUsers.length > 0 ? (
						<div className="divide-y divide-gray-100">
							{platformUsers.map((pu) => (
								<div key={pu.id} className="flex items-center justify-between py-3">
									<div className="flex items-center gap-3">
										<div className={`size-9 rounded-full flex items-center justify-center text-white text-sm font-medium ${
											pu.role === "admin" ? "bg-red-600" : "bg-amber-600"
										}`}>
											{pu.user?.name?.charAt(0).toUpperCase() || "U"}
										</div>
										<div>
											<p className="font-medium text-sm text-gray-900">{pu.user?.name || "Unknown"}</p>
											<p className="text-xs text-gray-500">{pu.user?.email || "No email"}</p>
										</div>
									</div>
									<span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
										pu.role === "admin"
											? "bg-red-50 text-red-700"
											: "bg-amber-50 text-amber-700"
									}`}>
										{pu.role}
									</span>
								</div>
							))}
						</div>
					) : (
						<div className="text-center py-8">
							<p className="text-sm text-gray-500">No platform users registered yet.</p>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
