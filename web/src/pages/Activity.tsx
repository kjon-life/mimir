import { Header } from "@/components/layout/Header";
import { useActivity } from "@/hooks/use-api";
import { ProjectBadge } from "@/components/board/ProjectBadge";
import { formatRelativeTime } from "@/lib/colors";
import { CheckCircle2, XCircle, PlayCircle, Edit3, Loader2, Activity } from "lucide-react";
import { useState } from "react";

const eventConfig = {
  story_completed: { icon: CheckCircle2, color: "text-status-active" },
  gate_failed: { icon: XCircle, color: "text-status-blocked" },
  agent_started: { icon: PlayCircle, color: "text-primary" },
  prd_updated: { icon: Edit3, color: "text-status-warning" },
} as const;

const ActivityPage = () => {
  const [limit, setLimit] = useState(50);
  const { data: events, isLoading } = useActivity(limit);

  return (
    <>
      <Header title="Activity" subtitle={`${events?.length ?? 0} recent events`} />

      <main className="flex-1 p-6 max-w-3xl">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : !events || events.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-muted-foreground gap-3">
            <Activity className="w-10 h-10 opacity-30" />
            <p className="text-sm">No activity yet</p>
          </div>
        ) : (
          <div className="space-y-1 animate-fade-in">
            {events.map((event) => {
              const config = eventConfig[event.event_type] ?? eventConfig.story_completed;
              const Icon = config.icon;

              return (
                <div key={event.id} className="flex items-start gap-3 py-3 px-3 rounded-md hover:bg-accent/30 transition-colors">
                  <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${config.color}`} />
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <ProjectBadge name={event.project_name} />
                      <span className="text-xs font-mono text-muted-foreground">{event.story_id}</span>
                      {event.agent_name && (
                        <span className="text-xs text-muted-foreground">by {event.agent_name}</span>
                      )}
                    </div>
                    <p className="text-sm text-foreground">{event.summary}</p>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0">
                    {formatRelativeTime(event.timestamp)}
                  </span>
                </div>
              );
            })}

            <div className="pt-4 text-center">
              <button
                onClick={() => setLimit((l) => l + 50)}
                className="text-xs text-primary hover:underline"
              >
                Load more
              </button>
            </div>
          </div>
        )}
      </main>
    </>
  );
};

export default ActivityPage;
