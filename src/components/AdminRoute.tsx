import { useConvexAuth } from "@/contexts/AuthContext";
import { useApiQuery } from "@/lib/hooks";
import { api } from "@/lib/api";
import { Navigate, Outlet } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarProvider,
} from "./ui/sidebar";
import { Skeleton } from "./ui/skeleton";

function AdminSkeleton() {
  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="border-b border-sidebar-border bg-slate-950">
          <div className="flex items-center gap-2.5 px-2 py-1">
            <Skeleton className="size-8 rounded-lg bg-slate-800" />
            <Skeleton className="h-5 w-24 bg-slate-800" />
          </div>
        </SidebarHeader>
        <SidebarContent>
          <div className="p-2 space-y-1">
            <SidebarMenu>
              {[1, 2, 3, 4, 5].map((i) => (
                <SidebarMenuItem key={i}>
                  <SidebarMenuSkeleton showIcon />
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </div>
        </SidebarContent>
        <SidebarFooter className="border-t border-sidebar-border">
          <div className="flex items-center gap-3 p-2">
            <Skeleton className="size-8 rounded-full" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-3.5 w-24" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <main className="flex-1 p-4 lg:p-6 space-y-6">
          <Skeleton className="h-8 w-48" />
          <div className="grid gap-4 md:grid-cols-4">
            <Skeleton className="h-32 rounded-lg" />
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

export function AdminRoute() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const role = useApiQuery(
    isAuthenticated ? () => api.auth.role().then((r: any) => r.role) : null, [isAuthenticated]);
  if (isLoading || (isAuthenticated && role === undefined)) {
    return <AdminSkeleton />;
  }
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }
  if (role !== "admin") {
    return <Navigate to="/employer/dashboard" replace />;
  }
  return <Outlet />;
}
