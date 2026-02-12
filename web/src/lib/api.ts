const API_URL = "http://localhost:8400";

async function fetchAPI<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
  const url = new URL(`${API_URL}${endpoint}`);
  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  }
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export const api = {
  getProjects: () => fetchAPI<import("./types").Project[]>("/api/projects"),
  getBoard: (project = "all") =>
    fetchAPI<import("./types").BoardData>("/api/board", { project }),
  getAgents: () => fetchAPI<import("./types").Agent[]>("/api/agents"),
  getActivity: (limit = 50, after?: string) => {
    const params: Record<string, string> = { limit: String(limit) };
    if (after) params.after = after;
    return fetchAPI<import("./types").ActivityEvent[]>("/api/activity", params);
  },
};

export function createSSE(onEvent: (type: string) => void): EventSource | null {
  try {
    const es = new EventSource(`${API_URL}/api/sse`);
    es.addEventListener("board_updated", () => onEvent("board_updated"));
    es.addEventListener("agent_changed", () => onEvent("agent_changed"));
    es.addEventListener("activity_new", () => onEvent("activity_new"));
    return es;
  } catch {
    return null;
  }
}
