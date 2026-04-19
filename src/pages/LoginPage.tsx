import { Link } from "react-router-dom";
import { SignIn } from "@/components/SignIn";
import { TestUserLoginSection } from "@/components/TestUserLoginSection";
import { Button } from "@/components/ui/button";

export function LoginPage() {
	return (
		<div className="flex-1 flex items-center justify-center p-4 relative">
			<div className="absolute inset-0 -z-10 overflow-hidden">
				<div className="absolute top-0 left-1/4 size-96 rounded-full bg-slate-900/5 blur-3xl" />
				<div className="absolute bottom-0 right-1/4 size-96 rounded-full bg-amber-600/5 blur-3xl" />
			</div>

			<div className="w-full max-w-sm space-y-6">
				<div className="text-center space-y-2">
					<img
						src="/logo.png"
						alt="AI Staffing Agency"
						className="mx-auto h-16 w-16 object-contain mb-4"
					/>
					<h1 className="text-2xl font-bold tracking-tight text-slate-900">
						Welcome back
					</h1>
					<p className="text-slate-500 text-sm">
						Sign in to manage your AI workforce
					</p>
				</div>

				<TestUserLoginSection />
				<SignIn />

				<p className="text-center text-sm text-slate-500">
					Don't have an account?{" "}
					<Button variant="link" className="p-0 h-auto font-medium text-amber-700 hover:text-amber-800" asChild>
						<Link to="/signup">Sign up</Link>
					</Button>
				</p>
			</div>
		</div>
	);
}
