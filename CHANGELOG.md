# Changelog

All notable changes to Mimir will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.0.1] - 2026-02-12

Initial release. Mimir is a standalone Mission Control dashboard that provides
a unified view across all [Ullr](../ullr/) projects — Kanban board, agent
monitoring, and activity feed.

### Architecture

Monorepo with two services:

- **`api/`** — Python FastAPI backend. Discovers Ullr projects on disk, ingests
  their `taskboard.json`, `prd.json`, and `progress.jsonl` into SQLite, and
  serves a REST + SSE API. Ullr's Pydantic models are imported directly as a
  path dependency — no schema duplication.

- **`web/`** — Vite + React + TypeScript frontend. Dark-themed Kanban dashboard
  with project filtering, agent status indicators, and an activity timeline.
  Uses React Query for data fetching with 30-second polling, upgrading to
  Server-Sent Events when connected.

### Backend (`api/`)

**Tech stack**: Python 3.11, FastAPI, aiosqlite, watchdog, sse-starlette, PyYAML

**Data flow**: Ullr projects write JSON files as normal → Mimir's filesystem
watcher detects changes → ingestion reads files using Ullr's Pydantic models →
data is normalized into SQLite → API serves aggregated views → SSE pushes
change notifications to connected frontends.

#### Modules

- **`app.py`** — FastAPI application with async lifespan management. Connects
  database, runs initial project discovery, starts filesystem watcher, and
  serves all routes including the SSE endpoint.

- **`config.py`** — Loads `mimir.yaml` configuration with Pydantic validation.
  Supports watch paths, scan depth, polling interval, ports, and database path.
  Auto-discovers config by walking upward from CWD.

- **`db.py`** — Async SQLite wrapper with three tables:
  - `projects` — discovered Ullr projects with story count aggregation
  - `tasks` — unified task view across all projects (Kanban columns)
  - `activity` — append-only event log from progress files and change events

- **`ingestion.py`** — Project discovery and data sync. Recursively scans
  configured directories for `ullr.yaml` files, reads each project's taskboard
  and PRD, and upserts into SQLite. Deduplicates progress entries by timestamp.

- **`watcher.py`** — Watchdog-based filesystem monitor. Triggers re-ingestion
  when `taskboard.json`, `prd.json`, `progress.jsonl`, or `ullr.yaml` change
  within watched directories.

- **`sse.py`** — In-process event bus with pub/sub pattern. SSE subscribers
  receive events via async queues. Slow subscribers are automatically dropped.

- **`openapi.py`** — Generates `openapi.json` at the repo root from the
  FastAPI app definition. Run via `make openapi` or the `mimir-openapi` CLI
  entry point.

#### API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/projects` | GET | List all discovered projects with story counts |
| `/api/projects/{id}` | GET | Single project detail |
| `/api/board` | GET | Kanban board — tasks grouped by status column. Filterable by project. |
| `/api/agents` | GET | Active agents inferred from in-progress task assignments |
| `/api/activity` | GET | Recent events with pagination (limit + timestamp cursor) |
| `/api/sse` | GET | Server-Sent Events stream (`board_updated`, `agent_changed`, `activity_new`) |
| `/api/health` | GET | Health check |

#### Configuration (`mimir.yaml`)

```yaml
watch_paths:          # Directories to scan for ullr.yaml
  - /Users/trust/Dev
max_depth: 3          # Recursion depth for project discovery
poll_interval_seconds: 30
api_port: 8400
db_path: ./mimir.db
next_port: 3400
```

### Frontend (`web/`)

**Tech stack**: Vite 5, React 18, TypeScript 5.8, Tailwind CSS, shadcn/ui,
React Query, react-router-dom, Lucide icons

#### Pages

- **Projects** (`/`) — Kanban board with four columns: Backlog, Doing, Blocked,
  Done. Each column scrolls independently. Cards display a colored project
  badge, story ID, title, and (for blocked items) the blocking reason with a
  warning icon. Done cards show strikethrough text. Column headers include task
  counts. Header bar shows aggregate story completion and a project filter
  dropdown.

- **Agents** (`/agents`) — Grid view of active agents with name, current
  project, assigned story, and time since last activity.

- **Activity** (`/activity`) — Reverse-chronological event feed with project
  badges, event type icons, timestamps, and summaries. Supports pagination.

#### Components

- `KanbanColumn` — Scrollable column with header icon, title, and count badge.
  Variants: backlog (circle), in_progress (clock), blocked (warning), done (check).
- `TaskCard` — Card with project badge, story ID, title, and optional blocked
  reason.
- `ProjectBadge` — Colored pill badge. Color is deterministic per project name
  (hashed to a palette of 10 saturated-on-dark presets).
- `AppSidebar` — Fixed 240px sidebar with navigation links and agent status
  dots (green pulse for active agents).
- `Header` — Page title, subtitle with stats, project filter dropdown,
  auto-refresh indicator, and connection status.
- `DashboardLayout` — Sidebar + content outlet with SSE connection management.

#### Data Layer

- `lib/api.ts` — Typed fetch wrapper for all API endpoints.
- `lib/types.ts` — TypeScript interfaces matching the API response shapes
  (Project, Task, BoardData, Agent, ActivityEvent).
- `lib/colors.ts` — Deterministic project color assignment.
- `hooks/use-api.ts` — React Query hooks (`useProjects`, `useBoard`,
  `useAgents`, `useActivity`) with 30s polling. `useSSE` hook establishes an
  EventSource connection and invalidates relevant queries on each event.

### Tooling

| Command | Description |
|---------|-------------|
| `make setup` | Install API (uv) and frontend (npm) dependencies |
| `make api` | Start FastAPI server on :8400 |
| `make web` | Start Vite dev server on :8080 |
| `make openapi` | Regenerate `openapi.json` from code |
| `make lint` | Run ruff check + format on API source |

### Design Decisions

- **Mimir is read-only.** It observes Ullr projects but never modifies their
  files. Ullr has zero knowledge of Mimir.
- **SQLite as materialized view.** The source of truth remains Ullr's JSON
  files. SQLite is a query-optimized cache that rebuilds from those files.
- **SSE over WebSocket.** Dashboard is unidirectional (server → client). SSE is
  simpler, works through proxies, and doesn't need sticky sessions for
  deployment.
- **Agent tracking is inference-based.** An agent is presumed active when a task
  is assigned and in_progress. No heartbeat protocol required from Ullr.
- **Ullr as path dependency.** The API imports Ullr's Pydantic models directly
  via `uv` path source. No model duplication, no schema drift.

### Known Limitations

- No Ullr projects with `ullr.yaml` exist yet in the watched directories, so
  the dashboard renders empty columns. The first Ullr project to add an
  `ullr.yaml` will appear automatically.
- Agent tracking depends on `assigned_agent` being set on in-progress tasks.
  Tasks without agent assignment won't show in the Agents view.
- Filesystem watcher requires local disk access. Remote deployment (Railway)
  would need a push-based ingestion endpoint (not yet implemented).
- The `api_url` in the frontend is hardcoded to `http://localhost:8400`. For
  deployment, use the `NEXT_PUBLIC_API_URL` environment variable pattern (not
  yet wired).
