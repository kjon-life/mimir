/** Project from /api/projects */
export interface Project {
  id: string;
  name: string;
  path: string;
  branch_name: string;
  description: string;
  total_stories: number | null;
  done_stories: number | null;
  last_synced: string | null;
}

/** Task from board columns */
export interface Task {
  id: string;
  project_id: string;
  project_name: string;
  story_id: string;
  title: string;
  description: string;
  status: string;
  domain: string;
  complexity: string;
  blocked_reason: string | null;
  assigned_agent: string | null;
  priority: number;
  updated_at: string;
}

/** Board response from /api/board */
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

/** Agent from /api/agents */
export interface Agent {
  name: string;
  project_id: string;
  project_name: string;
  story_id: string;
  current_task: string;
  since: string;
}

/** Activity event from /api/activity */
export interface ActivityEvent {
  id?: number;
  project_id: string;
  project_name: string;
  event_type: string;
  story_id: string;
  agent_name: string | null;
  summary: string;
  timestamp: string;
}
