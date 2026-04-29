import { useAuthActions } from "@convex-dev/auth/react";
import { useQuery } from "convex/react";
import {
	LayoutDashboard,
	LogOut,
	Moon,
	Settings,
	Sun,
	Bot,
	CreditCard,
	MessageSquare,
	BarChart3,
	Headphones,
	Activity,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useTheme } from "@/contexts/ThemeContext";
import { api } from "../../convex/_generated/api";
import { Avatar, AvatarFallback } from "./ui/avatar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	useSidebar,
} from "./ui/sidebar";

const mainNavItems = [
	{ href: "/employer/dashboard", label: "Dashboard", icon: LayoutDashboard },
	{ href: "/employer/agents", label: "My Agents", icon: Bot },
	{ href: "/employer/activity", label: "Agent Activity", icon: Activity },
];

const insightNavItems = [
	{ href: "/employer/conversations", label: "Conversation Logs", icon: MessageSquare },
	{ href: "/employer/analytics", label: "Analytics", icon: BarChart3 },
];

const accountNavItems = [
	{ href: "/employer/billing", label: "Billing", icon: CreditCard },
	{ href: "/employer/support", label: "Support", icon: Headphones },
];

function NavLink({
	href,
	label,
	icon: Icon,
	isActive,
}: {
	href: string;
	label: string;
	icon: React.ComponentType<{ className?: string }>;
	isActive: boolean;
}) {
	const { setOpenMobile } = useSidebar();

	return (
		<SidebarMenuItem>
			<SidebarMenuButton asChild isActive={isActive}>
				<Link to={href} onClick={() => setOpenMobile(false)}>
					<Icon />
					<span>{label}</span>
				</Link>
			</SidebarMenuButton>
		</SidebarMenuItem>
	);
}

function SidebarNav() {
	const location = useLocation();

	return (
		<SidebarContent>
			<SidebarGroup>
				<SidebarGroupLabel className="text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider">Main</SidebarGroupLabel>
				<SidebarGroupContent>
					<SidebarMenu>
						{mainNavItems.map((item) => (
							<NavLink
								key={item.href}
								href={item.href}
								label={item.label}
								icon={item.icon}
								isActive={location.pathname === item.href}
							/>
						))}
					</SidebarMenu>
				</SidebarGroupContent>
			</SidebarGroup>
			<SidebarGroup>
				<SidebarGroupLabel className="text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider">Insights</SidebarGroupLabel>
				<SidebarGroupContent>
					<SidebarMenu>
						{insightNavItems.map((item) => (
							<NavLink
								key={item.href}
								href={item.href}
								label={item.label}
								icon={item.icon}
								isActive={location.pathname === item.href}
							/>
						))}
					</SidebarMenu>
				</SidebarGroupContent>
			</SidebarGroup>
			<SidebarGroup>
				<SidebarGroupLabel className="text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider">Account</SidebarGroupLabel>
				<SidebarGroupContent>
					<SidebarMenu>
						{accountNavItems.map((item) => (
							<NavLink
								key={item.href}
								href={item.href}
								label={item.label}
								icon={item.icon}
								isActive={location.pathname === item.href}
							/>
						))}
					</SidebarMenu>
				</SidebarGroupContent>
			</SidebarGroup>
		</SidebarContent>
	);
}

function SidebarUserMenu() {
	const user = useQuery(api.auth.currentUser);
	const org = useQuery(api.organizations.getMine);
	const { signOut } = useAuthActions();
	const { theme, toggleTheme, switchable } = useTheme();
	const { setOpenMobile } = useSidebar();

	return (
		<SidebarFooter className="border-t border-sidebar-border">
			<SidebarMenu>
				<SidebarMenuItem>
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<SidebarMenuButton size="lg">
								<Avatar className="size-8">
									<AvatarFallback className="bg-amber-600 text-white text-sm font-medium">
										{org?.name?.charAt(0).toUpperCase() || user?.name?.charAt(0).toUpperCase() || "U"}
									</AvatarFallback>
								</Avatar>
								<div className="flex flex-col items-start text-left">
									<span className="text-sm font-medium truncate">
										{org?.name || user?.name || "My Company"}
									</span>
									<span className="text-xs text-muted-foreground truncate">
										{user?.email}
									</span>
								</div>
							</SidebarMenuButton>
						</DropdownMenuTrigger>
						<DropdownMenuContent
							side="top"
							align="start"
							className="w-[--radix-dropdown-menu-trigger-width]"
						>
							<DropdownMenuItem asChild>
								<Link
									to="/employer/settings"
									onClick={() => setOpenMobile(false)}
								>
									<Settings className="size-4" />
									Settings
								</Link>
							</DropdownMenuItem>
							{switchable && (
								<DropdownMenuItem onClick={toggleTheme}>
									{theme === "light" ? (
										<Moon className="size-4" />
									) : (
										<Sun className="size-4" />
									)}
									{theme === "light"
										? "Dark mode"
										: "Light mode"}
								</DropdownMenuItem>
							)}
							<DropdownMenuSeparator />
							<DropdownMenuItem
								onClick={() => signOut()}
								className="text-destructive focus:text-destructive focus:bg-destructive/10"
							>
								<LogOut className="size-4" />
								Sign out
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</SidebarMenuItem>
			</SidebarMenu>
		</SidebarFooter>
	);
}

function SidebarHeaderContent() {
	const { setOpenMobile } = useSidebar();

	return (
		<SidebarHeader className="border-b border-sidebar-border">
			<Link
				to="/employer/dashboard"
				onClick={() => setOpenMobile(false)}
				className="flex items-center gap-2.5 px-2 py-1 font-semibold text-lg"
			>
				<img
					src="/logo.png"
					alt="AI Staffing Agency"
					className="size-8 rounded-lg"
				/>
				<span>My Portal</span>
			</Link>
		</SidebarHeader>
	);
}

export function EmployerSidebar() {
	return (
		<Sidebar>
			<SidebarHeaderContent />
			<SidebarNav />
			<SidebarUserMenu />
		</Sidebar>
	);
}
