import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { KanbanColumn } from "@/components/board/KanbanColumn";
import { useBoard, useProjects } from "@/hooks/use-api";
import { Loader2 } from "lucide-react";

const ProjectsPage = () => {
  const [projectFilter, setProjectFilter] = useState("all");
  const { data: board, isLoading: boardLoading } = useBoard(projectFilter);
  const { data: projects } = useProjects();

  const totalDone = board?.done_count ?? 0;
  const total = board?.total ?? 0;

  const projectList = projects?.map((p) => ({ id: p.id, name: p.name })) ?? [];
  const projectCount = projects?.length ?? 0;

  const subtitle = `${totalDone}/${total} stories complete across ${projectCount} projects`;

  return (
    <>
      <Header
        title="Projects"
        subtitle={subtitle}
        projectFilter={projectFilter}
        onProjectFilterChange={setProjectFilter}
        projects={projectList}
      />

      <main className="flex-1 p-6 overflow-x-auto">
        {boardLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : board ? (
          <div className="flex gap-5 animate-fade-in">
            <KanbanColumn title="Backlog" tasks={board.columns.backlog} variant="backlog" />
            <KanbanColumn title="Doing" tasks={board.columns.in_progress} variant="in_progress" />
            <KanbanColumn title="Blocked" tasks={board.columns.blocked} variant="blocked" />
            <KanbanColumn title="Done" tasks={board.columns.done} variant="done" />
          </div>
        ) : (
          <div className="flex items-center justify-center h-64 text-muted-foreground text-sm">
            Unable to connect to backend. Ensure the API is running at localhost:8400.
          </div>
        )}
      </main>
    </>
  );
};

export default ProjectsPage;
