// Types for the Mimir dashboard

export interface Project {
  id: string;
  name: string;
  path: string;
  branch_name: string;
  description: string;
  total_stories: number;
  done_stories: number;
  last_synced: string;
}

export interface Task {
  id: string;
  project_id: string;
  project_name: string;
  story_id: string;
  title: string;
  description?: string;
  status: "backlog" | "in_progress" | "blocked" | "done";
  domain: string;
  complexity: string;
  blocked_reason: string | null;
  assigned_agent: string | null;
  priority: number;
  updated_at?: string;
}

export interface BoardData {
  columns: {
    backlog: Task[];
    in_progress: Task[];
    blocked: Task[];
    done: Task[];
  };
  total: number;
  done_count: number;
}

export interface Agent {
  name: string;
  project_id: string;
  project_name: string;
  story_id: string;
  current_task: string;
  since: string;
}

export interface ActivityEvent {
  id: number;
  project_id: string;
  project_name: string;
  event_type: "story_completed" | "gate_failed" | "agent_started" | "prd_updated";
  story_id: string;
  agent_name: string;
  summary: string;
  metadata: string;
  timestamp: string;
}
