import { NavLink, useLocation } from "react-router-dom";
import { LayoutGrid, Bot, Activity, Eye } from "lucide-react";
import { useAgents } from "@/hooks/use-api";

const navItems = [
  { label: "Projects", path: "/", icon: LayoutGrid, badge: 0 },
  { label: "Agents", path: "/agents", icon: Bot, badge: 0 },
  { label: "Activity", path: "/activity", icon: Activity, badge: 0 },
];

export function AppSidebar() {
  const location = useLocation();
  const { data: agents } = useAgents();

  const activeAgents = agents?.filter(() => true) ?? [];

  return (
    <aside className="w-60 h-screen flex-shrink-0 bg-sidebar border-r border-border flex flex-col">
      {/* Logo */}
      <div className="h-14 flex items-center gap-2.5 px-5 border-b border-border">
        <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center">
          <Eye className="w-4 h-4 text-primary-foreground" />
        </div>
        <span className="text-base font-semibold tracking-tight text-foreground">Mimir</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                isActive
                  ? "bg-accent text-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
              }`}
            >
              <item.icon className="w-4 h-4" />
              <span className="flex-1">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Agent Status */}
      <div className="px-4 pb-4">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
          Agent Status
        </p>
        <div className="space-y-2">
          {activeAgents.length === 0 ? (
            <p className="text-xs text-muted-foreground">No active agents</p>
          ) : (
            activeAgents.map((agent) => (
              <div key={agent.name} className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-status-active status-pulse" />
                <span className="text-xs text-foreground truncate">{agent.name}</span>
                <span className="text-xs text-muted-foreground ml-auto truncate max-w-[80px]">
                  {agent.project_name}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </aside>
  );
}
