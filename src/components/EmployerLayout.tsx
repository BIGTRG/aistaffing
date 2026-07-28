// @ts-nocheck
import { Outlet } from "react-router-dom";
import { EmployerSidebar } from "./EmployerSidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "./ui/sidebar";

export function EmployerLayout() {
  return (
    <SidebarProvider>
      <EmployerSidebar />
      <SidebarInset>
        <header className="flex h-12 items-center px-4 md:hidden">
          <SidebarTrigger />
        </header>
        <main className="flex-1 p-4 lg:p-6">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
