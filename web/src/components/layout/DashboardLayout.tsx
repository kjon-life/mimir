import { AppSidebar } from "./AppSidebar";
import { Outlet } from "react-router-dom";
import { useSSE } from "@/hooks/use-api";

export function DashboardLayout() {
  useSSE();

  return (
    <div className="flex min-h-screen w-full bg-background">
      <AppSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Outlet />
      </div>
    </div>
  );
}
