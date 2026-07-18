// @ts-nocheck
import { useAuth } from "@/contexts/AuthContext";
import { useApiQuery } from "@/lib/hooks";
import { api } from "@/lib/api";
import {
	LayoutDashboard,
	LogOut,
	Moon,
	Settings,
	Sun,
	Bot,
	Handshake,
	CreditCard,
	Shield,
	MessageSquare,
	BarChart3,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useTheme } from "@/contexts/ThemeContext";
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
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	useSidebar,
} from "./ui/sidebar";

const navItems = [
	{ href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
	{ href: "/agents", label: "Agent Roster", icon: Bot },
	{ href: "/conversations", label: "Conversation Logs", icon: MessageSquare },
	{ href: "/analytics", label: "Analytics", icon: BarChart3 },
	{ href: "/billing", label: "Billing", icon: CreditCard },
	{ href: "/partners", label: "Partner Services", icon: Handshake },
	{ href: "/admin", label: "Admin Panel", icon: Shield },
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
				<SidebarGroupContent>
					<SidebarMenu>
						{navItems.map((item) => (
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
	const user = useApiQuery(() => api.auth.me(), []);
	const { logout } = useAuth();
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
									<AvatarFallback className="bg-primary text-primary-foreground text-sm font-medium">
										{user?.name?.charAt(0).toUpperCase() ||
											"U"}
									</AvatarFallback>
								</Avatar>
								<div className="flex flex-col items-start text-left">
									<span className="text-sm font-medium truncate">
										{user?.name || "User"}
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
									to="/settings"
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
								onClick={() => logout()}
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
				to="/"
				onClick={() => setOpenMobile(false)}
				className="flex items-center gap-2.5 px-2 py-1 font-semibold text-lg"
			>
				<img
					src="/logo.png"
					alt="AI Staffing Agency"
					className="size-8 rounded-lg"
				/>
				<span>AI Staffing Agency</span>
			</Link>
		</SidebarHeader>
	);
}

export function AppSidebar() {
	return (
		<Sidebar>
			<SidebarHeaderContent />
			<SidebarNav />
			<SidebarUserMenu />
		</Sidebar>
	);
}
