// @ts-nocheck

import { useApiQuery } from "@/lib/hooks";
import { api } from "@/lib/api";
import {
	LayoutDashboard,
	LogOut,
	Moon,
	Settings,
	Sun,
	Bot,
	Building2,
	DollarSign,
	Shield,
	Users,
	Activity,
	FileText,
	Globe,
	Layers,
	Zap,
	Brain,
	Gauge,
	Eye,
	Radio,
	Package,
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
	SidebarGroupLabel,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	useSidebar,
} from "./ui/sidebar";

const overviewItems = [
	{ href: "/admin/dashboard", label: "Platform Overview", icon: LayoutDashboard },
	{ href: "/admin/clients", label: "Clients", icon: Building2 },
	{ href: "/admin/agents", label: "Agent Templates", icon: Bot },
];

const platformItems = [
	{ href: "/admin/onboarding-agent", label: "AI Workflow Builder", icon: Brain },
	{ href: "/admin/industries", label: "Industry Verticals", icon: Globe },
	{ href: "/admin/platforms", label: "Core Platforms", icon: Layers },
	{ href: "/admin/workflows", label: "Workflow Templates", icon: Zap },
];

const operationsItems = [
	{ href: "/admin/operations", label: "Command Center", icon: Gauge },
	{ href: "/admin/workforce", label: "Agent Workforce", icon: Users },
	{ href: "/admin/gateway", label: "AI Gateway", icon: Radio },
	{ href: "/admin/add-on-services", label: "Add-On Services", icon: Package },
	{ href: "/admin/client-portal", label: "Client Portal", icon: Eye },
	{ href: "/admin/deployments", label: "Deployments", icon: Activity },
	{ href: "/admin/revenue", label: "Revenue", icon: DollarSign },
	{ href: "/admin/invoices", label: "Invoices", icon: FileText },
];

const systemItems = [
	{ href: "/admin/users", label: "Users", icon: Users },
	{ href: "/admin/settings", label: "Settings", icon: Settings },
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
				<SidebarGroupLabel className="text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider">Overview</SidebarGroupLabel>
				<SidebarGroupContent>
					<SidebarMenu>
						{overviewItems.map((item) => (
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
				<SidebarGroupLabel className="text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider">Enterprise Platform</SidebarGroupLabel>
				<SidebarGroupContent>
					<SidebarMenu>
						{platformItems.map((item) => (
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
				<SidebarGroupLabel className="text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider">Operations</SidebarGroupLabel>
				<SidebarGroupContent>
					<SidebarMenu>
						{operationsItems.map((item) => (
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
				<SidebarGroupLabel className="text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider">System</SidebarGroupLabel>
				<SidebarGroupContent>
					<SidebarMenu>
						{systemItems.map((item) => (
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
	const { theme, toggleTheme, switchable } = useTheme();

	return (
		<SidebarFooter className="border-t border-sidebar-border">
			<SidebarMenu>
				<SidebarMenuItem>
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<SidebarMenuButton size="lg">
								<Avatar className="size-8">
									<AvatarFallback className="bg-red-600 text-white text-sm font-medium">
										{user?.name?.charAt(0).toUpperCase() || "A"}
									</AvatarFallback>
								</Avatar>
								<div className="flex flex-col items-start text-left">
									<span className="text-sm font-medium truncate">
										{user?.name || "Admin"}
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
							{switchable && (
								<DropdownMenuItem onClick={toggleTheme}>
									{theme === "light" ? (
										<Moon className="size-4" />
									) : (
										<Sun className="size-4" />
									)}
									{theme === "light" ? "Dark mode" : "Light mode"}
								</DropdownMenuItem>
							)}
							<DropdownMenuSeparator />
							<DropdownMenuItem
								onClick={() => window.location.href = "/admin/dashboard"}
								className="text-muted-foreground"
							>
								<LogOut className="size-4" />
								Back to Dashboard
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
		<SidebarHeader className="border-b border-sidebar-border bg-slate-950">
			<Link
				to="/admin/dashboard"
				onClick={() => setOpenMobile(false)}
				className="flex items-center gap-3 px-2 py-2 font-semibold text-white group"
			>
				<img
					src="/logo.png"
					alt="AI Staffing Agency"
					className="size-9 rounded-lg object-contain transition-transform group-hover:scale-105"
				/>
				<div className="flex flex-col">
					<span className="text-[15px] font-bold leading-tight tracking-tight">AI Staffing Agency</span>
					<span className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">Command Center</span>
				</div>
			</Link>
		</SidebarHeader>
	);
}

export function AdminSidebar() {
	return (
		<Sidebar>
			<SidebarHeaderContent />
			<SidebarNav />
			<SidebarUserMenu />
		</Sidebar>
	);
}
