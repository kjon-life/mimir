import { RefreshCw } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

interface HeaderProps {
  title: string;
  subtitle?: string;
  projectFilter?: string;
  onProjectFilterChange?: (value: string) => void;
  projects?: { id: string; name: string }[];
}

export function Header({ title, subtitle, projectFilter, onProjectFilterChange, projects }: HeaderProps) {
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await queryClient.invalidateQueries();
    setTimeout(() => setIsRefreshing(false), 600);
  };

  return (
    <header className="h-14 flex items-center justify-between px-6 border-b border-border bg-background/80 backdrop-blur-sm">
      <div className="flex items-center gap-6">
        <div>
          <h1 className="text-base font-semibold text-foreground">{title}</h1>
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
        </div>

        {projects && onProjectFilterChange && (
          <select
            value={projectFilter}
            onChange={(e) => onProjectFilterChange(e.target.value)}
            className="text-xs bg-secondary border border-border rounded-md px-2.5 py-1.5 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="all">All projects</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        )}
      </div>

      <div className="flex items-center gap-4">
        <span className="text-xs text-muted-foreground">Auto-refreshes every 30s</span>
        <button
          onClick={handleRefresh}
          className="p-1.5 rounded-md hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
        </button>
        <span className="w-2 h-2 rounded-full bg-status-active" title="Connected" />
      </div>
    </header>
  );
}
