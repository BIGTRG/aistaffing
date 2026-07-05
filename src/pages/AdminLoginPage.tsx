import { useAuth } from "@/contexts/AuthContext";
import { useConvexAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { Loader2, Shield } from "lucide-react";
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function isTestEmail(email: string): boolean {
	return email.endsWith("@test.local");
}

export function AdminLoginPage() {
	const { isAuthenticated, isLoading: authLoading } = useConvexAuth();
	const { login, register } = useAuth();
	const setRole = async (...args: any[]) => api.platformUsers.setRole(...args);
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);
	const [settingRole, setSettingRole] = useState(false);

	// If already authenticated, set role to admin and redirect
	useEffect(() => {
		if (isAuthenticated && !settingRole) {
			setSettingRole(true);
			setRole({ role: "admin" }).then(() => {
				window.location.href = "/admin/dashboard";
			});
		}
	}, [isAuthenticated, settingRole, setRole]);

	if (authLoading || settingRole) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-slate-950">
				<Loader2 className="size-8 animate-spin text-slate-400" />
			</div>
		);
	}

	if (isAuthenticated) {
		return <Navigate to="/admin/dashboard" replace />;
	}

	return (
		<div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
			<div className="w-full max-w-sm space-y-6">
				<div className="text-center space-y-3">
					<div className="mx-auto size-16 rounded-2xl bg-red-600 flex items-center justify-center">
						<Shield className="size-8 text-white" />
					</div>
					<h1 className="text-2xl font-bold tracking-tight text-white">
						Admin Access
					</h1>
					<p className="text-slate-400 text-sm">
						AI Staffing Agency internal management
					</p>
				</div>

				{/* Preview test login */}
				{import.meta.env.VITE_IS_PREVIEW === "true" && (
					<Card className="border-red-900/50 bg-red-950/30">
						<CardContent className="pt-5 pb-4">
							<div className="flex items-start gap-3 mb-3">
								<div className="size-9 rounded-lg bg-red-600 flex items-center justify-center shrink-0">
									<Shield className="size-4 text-white" />
								</div>
								<div>
									<p className="font-medium text-sm text-white">Admin Preview</p>
									<p className="text-xs text-slate-400 mt-0.5">Sign in as admin to manage the platform</p>
								</div>
							</div>
							<Button
								onClick={async () => {
									setLoading(true);
									const formData = new FormData();
									formData.set("email", "admin-58b75145@test.local");
									formData.set("password", "ygFZ5siXKTnlTStDZs_sRMm11n2-Glca");
									formData.set("flow", "signIn");
									try {
										await signIn("test", formData);
									} catch {
										formData.set("flow", "signUp");
										formData.set("name", "Admin User");
										try {
											await signIn("test", formData);
										} catch {
											setError("Failed to sign in");
										}
									}
									setLoading(false);
								}}
								disabled={loading}
								className="w-full bg-red-600 hover:bg-red-700 text-white"
							>
								{loading && <Loader2 className="size-4 animate-spin" />}
								{loading ? "Signing in..." : "Continue as Admin"}
							</Button>
						</CardContent>
					</Card>
				)}

				<Card className="border-slate-800 bg-slate-900">
					<CardContent className="pt-6">
						<form
							onSubmit={async (e) => {
								e.preventDefault();
								setError("");
								setLoading(true);

								const formData = new FormData(e.currentTarget);
								const email = formData.get("email") as string;
								const provider = isTestEmail(email) ? "test" : "password";

								try {
									await signIn(provider, formData);
								} catch {
									setError("Invalid credentials");
								} finally {
									setLoading(false);
								}
							}}
							className="space-y-4"
						>
							<div className="space-y-2">
								<Label htmlFor="email" className="text-slate-300">Email</Label>
								<Input
									id="email"
									name="email"
									type="email"
									placeholder="admin@aistaffingagency.com"
									autoComplete="email"
									className="h-11 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
									required
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="password" className="text-slate-300">Password</Label>
								<Input
									id="password"
									name="password"
									type="password"
									placeholder="••••••••"
									autoComplete="current-password"
									className="h-11 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
									required
								/>
							</div>
							<input name="flow" value="signIn" type="hidden" />
							{error && (
								<p className="text-sm text-red-400 bg-red-950/50 rounded-lg px-3 py-2">
									{error}
								</p>
							)}
							<Button type="submit" className="w-full h-11 bg-slate-700 hover:bg-slate-600 text-white" disabled={loading}>
								{loading && <Loader2 className="size-4 animate-spin" />}
								{loading ? "Signing in..." : "Sign In"}
							</Button>
						</form>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
