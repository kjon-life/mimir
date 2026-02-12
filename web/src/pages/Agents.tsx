import { Header } from "@/components/layout/Header";
import { useAgents } from "@/hooks/use-api";
import { ProjectBadge } from "@/components/board/ProjectBadge";
import { formatRelativeTime } from "@/lib/colors";
import { Bot, Loader2 } from "lucide-react";

const AgentsPage = () => {
  const { data: agents, isLoading } = useAgents();

  return (
    <>
      <Header title="Agents" subtitle={`${agents?.length ?? 0} agents registered`} />

      <main className="flex-1 p-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : !agents || agents.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-muted-foreground gap-3">
            <Bot className="w-10 h-10 opacity-30" />
            <p className="text-sm">No active agents</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in">
            {agents.map((agent) => (
              <div key={agent.name} className="bg-surface rounded-lg border border-border p-5 space-y-3 task-card">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-status-active status-pulse" />
                    <span className="text-sm font-semibold text-foreground">{agent.name}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{formatRelativeTime(agent.since)}</span>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <ProjectBadge name={agent.project_name} />
                    <span className="text-xs font-mono text-muted-foreground">{agent.story_id}</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{agent.current_task}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  );
};

export default AgentsPage;
