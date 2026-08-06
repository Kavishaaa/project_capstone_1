import { NavLink } from "react-router-dom";
import { LayoutDashboard, MessageSquareText, Search, BarChart3, Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/workspace", label: "Agent Workspace", icon: MessageSquareText },
  { to: "/knowledge", label: "Knowledge Search", icon: Search },
  { to: "/analytics", label: "Analytics", icon: BarChart3, roles: ["Supervisor", "Admin"] },
];

export function Sidebar() {
  const { user } = useAuth();

  return (
    <aside className="hidden w-60 flex-col border-r bg-card md:flex">
      <div className="flex items-center gap-2 px-5 py-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Sparkles className="h-4 w-4" />
        </div>
        <div>
          <p className="text-sm font-bold leading-tight">EXLSmartAssist</p>
          <p className="text-[11px] leading-tight text-muted-foreground">Enterprise Copilot</p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-3">
        {NAV_ITEMS.filter((item) => !item.roles || item.roles.includes(user?.role ?? "")).map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground",
                isActive && "bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary",
              )
            }
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="px-4 py-4 text-[11px] text-muted-foreground">
        <p>EXLSmartAssist v1.0</p>
        <p>© 2026 EXL Service Holdings</p>
      </div>
    </aside>
  );
}
