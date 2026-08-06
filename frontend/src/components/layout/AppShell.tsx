import { Outlet, useLocation } from "react-router-dom";

import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";

const TITLES_BY_PATH: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/workspace": "Agent Workspace",
  "/knowledge": "Enterprise Knowledge Search",
  "/analytics": "Analytics",
};

export function AppShell() {
  const location = useLocation();
  const title = TITLES_BY_PATH[location.pathname] ?? "EXLSmartAssist";

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar title={title} />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
