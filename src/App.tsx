import { Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "./components/AppLayout";
import ErrorBoundary from "./components/ErrorBoundary";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { PublicLayout } from "./components/PublicLayout";
import { PublicOnlyRoute } from "./components/PublicOnlyRoute";
import { Toaster } from "./components/ui/sonner";
import { ThemeProvider } from "./contexts/ThemeContext";
import {
	AgentsPage,
	AdminPage,
	BillingPage,
	DashboardPage,
	LandingPage,
	LoginPage,
	OnboardingPage,
	PartnersPage,
	SettingsPage,
	SignupPage,
} from "./pages";

function App() {
	return (
		<ErrorBoundary>
			<ThemeProvider defaultTheme="light" switchable={false}>
				<Toaster />
				<Routes>
					{/* Landing page has its own nav — no PublicLayout wrapper */}
					<Route path="/" element={<LandingPage />} />

					<Route element={<PublicLayout />}>
						<Route element={<PublicOnlyRoute />}>
							<Route path="/login" element={<LoginPage />} />
							<Route path="/signup" element={<SignupPage />} />
						</Route>
					</Route>

					<Route element={<ProtectedRoute />}>
						<Route path="/onboarding" element={<OnboardingPage />} />
						<Route element={<AppLayout />}>
							<Route path="/dashboard" element={<DashboardPage />} />
							<Route path="/agents" element={<AgentsPage />} />
							<Route path="/partners" element={<PartnersPage />} />
							<Route path="/billing" element={<BillingPage />} />
							<Route path="/admin" element={<AdminPage />} />
							<Route path="/settings" element={<SettingsPage />} />
						</Route>
					</Route>

					<Route path="*" element={<Navigate to="/" replace />} />
				</Routes>
			</ThemeProvider>
		</ErrorBoundary>
	);
}

export default App;
