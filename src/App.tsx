import { Navigate, Route, Routes } from "react-router-dom";
import { AdminLayout } from "./components/AdminLayout";
import { AdminRoute } from "./components/AdminRoute";
import { EmployerLayout } from "./components/EmployerLayout";
import { EmployerRoute } from "./components/EmployerRoute";
import ErrorBoundary from "./components/ErrorBoundary";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { PublicLayout } from "./components/PublicLayout";
import { PublicOnlyRoute } from "./components/PublicOnlyRoute";
import { Toaster } from "./components/ui/sonner";
import { ThemeProvider } from "./contexts/ThemeContext";
import {
	AdminAgentTemplatesPage,
	AdminClientsPage,
	AdminDashboardPage,
	AdminDeploymentsPage,
	AdminInvoicesPage,
	AdminLoginPage,
	AdminRevenuePage,
	AdminSettingsPage,
	AdminUsersPage,
	AgentsPage,
	AnalyticsPage,
	BillingPage,
	ConversationsPage,
	DashboardPage,
	IndustryPage,
	LandingPage,
	LoginPage,
	OnboardingPage,
	PartnersPage,
	SettingsPage,
	SignupPage,
	SupportPage,
	PricingPage,
} from "./pages";

function App() {
	return (
		<ErrorBoundary>
			<ThemeProvider defaultTheme="light" switchable={false}>
				<Toaster />
				<Routes>
					{/* ── Public Pages ── */}
					<Route path="/" element={<LandingPage />} />
					<Route path="/pricing" element={<PricingPage />} />
					<Route path="/industries/:slug" element={<IndustryPage />} />

					{/* ── Public-Only Auth Pages ── */}
					<Route element={<PublicLayout />}>
						<Route element={<PublicOnlyRoute />}>
							<Route path="/login" element={<LoginPage />} />
							<Route path="/signup" element={<SignupPage />} />
						</Route>
					</Route>

					{/* ── Admin Login (separate from employer login) ── */}
					<Route path="/admin/login" element={<AdminLoginPage />} />

					{/* ── Employer Portal ── */}
					<Route element={<EmployerRoute />}>
						<Route element={<ProtectedRoute />}>
							<Route path="/onboarding" element={<OnboardingPage />} />
							<Route element={<EmployerLayout />}>
								<Route path="/employer/dashboard" element={<DashboardPage />} />
								<Route path="/employer/agents" element={<AgentsPage />} />
								<Route path="/employer/conversations" element={<ConversationsPage />} />
								<Route path="/employer/analytics" element={<AnalyticsPage />} />
								<Route path="/employer/billing" element={<BillingPage />} />
								<Route path="/employer/partners" element={<PartnersPage />} />
								<Route path="/employer/settings" element={<SettingsPage />} />
								<Route path="/employer/support" element={<SupportPage />} />
							</Route>
						</Route>
					</Route>

					{/* ── Admin Portal ── */}
					<Route element={<AdminRoute />}>
						<Route element={<AdminLayout />}>
							<Route path="/admin/dashboard" element={<AdminDashboardPage />} />
							<Route path="/admin/clients" element={<AdminClientsPage />} />
							<Route path="/admin/agents" element={<AdminAgentTemplatesPage />} />
							<Route path="/admin/deployments" element={<AdminDeploymentsPage />} />
							<Route path="/admin/revenue" element={<AdminRevenuePage />} />
							<Route path="/admin/invoices" element={<AdminInvoicesPage />} />
							<Route path="/admin/users" element={<AdminUsersPage />} />
							<Route path="/admin/settings" element={<AdminSettingsPage />} />
						</Route>
					</Route>

					{/* ── Legacy redirects ── */}
					<Route path="/dashboard" element={<Navigate to="/employer/dashboard" replace />} />
					<Route path="/agents" element={<Navigate to="/employer/agents" replace />} />
					<Route path="/conversations" element={<Navigate to="/employer/conversations" replace />} />
					<Route path="/analytics" element={<Navigate to="/employer/analytics" replace />} />
					<Route path="/billing" element={<Navigate to="/employer/billing" replace />} />
					<Route path="/settings" element={<Navigate to="/employer/settings" replace />} />
					<Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />

					<Route path="*" element={<Navigate to="/" replace />} />
				</Routes>
			</ThemeProvider>
		</ErrorBoundary>
	);
}

export default App;
