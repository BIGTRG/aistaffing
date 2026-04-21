import { Settings } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function AdminSettingsPage() {
	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-2xl font-bold tracking-tight text-gray-900">Platform Settings</h1>
				<p className="text-gray-500">Configure platform-wide settings</p>
			</div>

			<Card className="border-gray-200">
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Settings className="size-5 text-slate-600" />
						General Settings
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="text-center py-12">
						<Settings className="size-10 text-gray-300 mx-auto mb-3" />
						<p className="text-sm text-gray-500">
							Platform settings panel coming soon.
						</p>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
