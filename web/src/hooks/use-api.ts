import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api, createSSE } from "@/lib/api";
import { useEffect, useRef } from "react";

export function useProjects() {
  return useQuery({
    queryKey: ["projects"],
    queryFn: api.getProjects,
    refetchInterval: 30000,
    retry: 2,
  });
}

export function useBoard(project = "all") {
  return useQuery({
    queryKey: ["board", project],
    queryFn: () => api.getBoard(project),
    refetchInterval: 30000,
    retry: 2,
  });
}

export function useAgents() {
  return useQuery({
    queryKey: ["agents"],
    queryFn: api.getAgents,
    refetchInterval: 30000,
    retry: 2,
  });
}

export function useActivity(limit = 50) {
  return useQuery({
    queryKey: ["activity", limit],
    queryFn: () => api.getActivity(limit),
    refetchInterval: 30000,
    retry: 2,
  });
}

export function useSSE() {
  const queryClient = useQueryClient();
  const esRef = useRef<EventSource | null>(null);

  useEffect(() => {
    esRef.current = createSSE((type) => {
      if (type === "board_updated") queryClient.invalidateQueries({ queryKey: ["board"] });
      if (type === "agent_changed") queryClient.invalidateQueries({ queryKey: ["agents"] });
      if (type === "activity_new") queryClient.invalidateQueries({ queryKey: ["activity"] });
    });

    return () => {
      esRef.current?.close();
    };
  }, [queryClient]);

  return esRef;
}
