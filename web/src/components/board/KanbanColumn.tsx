import { Task } from "@/lib/types";
import { TaskCard } from "./TaskCard";
import { Circle, Clock, AlertTriangle, CheckCircle2 } from "lucide-react";

interface KanbanColumnProps {
  title: string;
  tasks: Task[];
  variant: "backlog" | "in_progress" | "blocked" | "done";
}

const columnConfig = {
  backlog: { icon: Circle, color: "text-muted-foreground" },
  in_progress: { icon: Clock, color: "text-primary" },
  blocked: { icon: AlertTriangle, color: "text-status-blocked" },
  done: { icon: CheckCircle2, color: "text-status-active" },
} as const;

export function KanbanColumn({ title, tasks, variant }: KanbanColumnProps) {
  const config = columnConfig[variant];
  const Icon = config.icon;

  return (
    <div className="flex flex-col min-w-[280px] w-[280px]">
      {/* Column Header */}
      <div className="flex items-center gap-2 px-1 pb-3">
        <Icon className={`w-4 h-4 ${config.color}`} />
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
        </span>
        <span className="ml-auto text-xs font-mono bg-secondary px-1.5 py-0.5 rounded text-muted-foreground">
          {tasks.length}
        </span>
      </div>

      {/* Cards */}
      <div className="flex-1 overflow-y-auto kanban-column space-y-2 pr-1" style={{ maxHeight: "calc(100vh - 160px)" }}>
        {tasks.length === 0 ? (
          <div className="text-xs text-muted-foreground text-center py-8 opacity-50">
            No tasks
          </div>
        ) : (
          tasks.map((task) => <TaskCard key={task.id} task={task} />)
        )}
      </div>
    </div>
  );
}
