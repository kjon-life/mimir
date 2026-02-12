import { Task } from "@/lib/types";
import { ProjectBadge } from "./ProjectBadge";
import { AlertTriangle } from "lucide-react";

interface TaskCardProps {
  task: Task;
}

export function TaskCard({ task }: TaskCardProps) {
  const isDone = task.status === "done";

  return (
    <div className="task-card bg-surface rounded-lg border border-border p-3.5 space-y-2.5">
      <div className="flex items-start justify-between gap-2">
        <ProjectBadge name={task.project_name} />
        <span className="text-xs font-mono text-muted-foreground shrink-0">{task.story_id}</span>
      </div>

      <p className={`text-sm leading-snug text-foreground ${isDone ? "line-through opacity-60" : ""}`}>
        {task.title}
      </p>

      {task.blocked_reason && (
        <div className="flex items-start gap-1.5 text-status-warning">
          <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
          <span className="text-xs leading-snug">{task.blocked_reason}</span>
        </div>
      )}
    </div>
  );
}
