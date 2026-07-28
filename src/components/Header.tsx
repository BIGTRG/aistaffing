// @ts-nocheck
import { useConvexAuth } from "@/contexts/AuthContext";
import { ArrowRight } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "./ui/button";

export function Header() {
	const { isAuthenticated, isLoading } = useConvexAuth();
	const location = useLocation();

	const isAuthPage =
		location.pathname === "/login" || location.pathname === "/signup";

	return (
		<header className="sticky top-0 z-50 bg-slate-900">
			<div className="container flex h-20 items-center justify-between">
				<Link
					to="/"
					className="flex items-center gap-3 hover:opacity-80 transition-opacity"
				>
					<img
						src="/logo-white.png"
						alt="AI Staffing Agency"
						className="h-12 w-12 object-contain"
					/>
					<span className="text-lg font-bold text-white tracking-tight">
						AI Staffing Agency
					</span>
				</Link>

				<nav className="flex items-center gap-3">
					{isLoading ? null : isAuthenticated ? (
						<Button
							size="sm"
							className="bg-amber-600 hover:bg-amber-700 text-white font-semibold px-6 h-10"
							asChild
						>
							<Link to="/employer/dashboard">
								Open Dashboard
								<ArrowRight className="size-4 ml-1" />
							</Link>
						</Button>
					) : (
						!isAuthPage && (
							<>
								<Button
									variant="ghost"
									size="sm"
									className="text-slate-300 hover:text-white hover:bg-slate-800"
									asChild
								>
									<Link to="/login">Sign In</Link>
								</Button>
								<Button
									size="sm"
									className="bg-amber-600 hover:bg-amber-700 text-white font-semibold px-6 h-10"
									asChild
								>
									<Link to="/signup">Get Started</Link>
								</Button>
							</>
						)
					)}
				</nav>
			</div>
		</header>
	);
}
