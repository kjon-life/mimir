import type { BoardData, Project, Agent, ActivityEvent } from "./types";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8400";

async function fetchApi<T>(path: string, params?: Record<string, string>): Promise<T> {
  const url = new URL(path, API_BASE);
  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  }
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`API error: ${res.status} ${res.statusText}`);
  return res.json();
}

export const api = {
  getProjects: () => fetchApi<Project[]>("/api/projects"),
  getBoard: (project: string) =>
    fetchApi<BoardData>("/api/board", { project }),
  getAgents: () => fetchApi<Agent[]>("/api/agents"),
  getActivity: (limit: number) =>
    fetchApi<ActivityEvent[]>("/api/activity", { limit: String(limit) }),
};

export type SSEEventType = "board_updated" | "agent_changed" | "activity_new";

/** Create EventSource for SSE and call onEvent for each event. */
export function createSSE(onEvent: (type: SSEEventType) => void): EventSource {
  const es = new EventSource(`${API_BASE}/api/sse`);
  es.addEventListener("board_updated", () => onEvent("board_updated"));
  es.addEventListener("agent_changed", () => onEvent("agent_changed"));
  es.addEventListener("activity_new", () => onEvent("activity_new"));
  es.onmessage = (e) => {
    const type = (e.type || "board_updated") as SSEEventType;
    if (["board_updated", "agent_changed", "activity_new"].includes(type)) {
      onEvent(type);
    }
  };
  return es;
}
