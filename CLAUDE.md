# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

Mimir is a read-only Mission Control dashboard for [Ullr](../../ullr) (autonomous builder). It discovers Ullr projects by scanning directories for `ullr.yaml` files, ingests their taskboard/PRD/progress data into SQLite, and presents a live Kanban dashboard via a FastAPI API + React frontend. Mimir never modifies Ullr project files.

## Commands

```bash
make setup          # Install both api (uv sync) and web (npm install) deps
make api            # Start API server on :8400 (with hot reload)
make web            # Start Vite frontend on :8080
make openapi        # Regenerate openapi.json from running app
make lint           # ruff check + format on api/src/

# Run from api/ directory:
cd api && uv run ruff check src/           # Lint
cd api && uv run ruff format --check src/  # Format check
cd api && uv run mypy .                    # Type check (strict mode)

# Run from web/ directory:
cd web && npm run test                     # Vitest (single run)
cd web && npm run test:watch               # Vitest (watch mode)
cd web && npm run lint                     # ESLint
cd web && npm run build                    # Production build
```

## Architecture

**Monorepo with two apps sharing no code:**

- `api/` — Python 3.11 FastAPI backend (managed by `uv`)
- `web/` — Vite + React 18 + TypeScript frontend (managed by `npm`)

**Data flow:** Ullr projects write JSON files → `watcher.py` (watchdog) detects changes to `ullr.yaml`, `taskboard.json`, `prd.json`, `progress.jsonl` → `ingestion.py` upserts into SQLite → REST API serves data → frontend polls (30s) + SSE invalidates React Query caches for live updates.

### API (`api/src/mimir_api/`)

| Module | Role |
|--------|------|
| `app.py` | FastAPI app factory, lifespan (DB init → ingestion → watcher start), CORS, SSE endpoint at `/api/sse` |
| `config.py` | Loads `mimir.yaml` via Pydantic; walks upward from CWD to find it |
| `db.py` | `Database` class wrapping aiosqlite; schema: `projects`, `tasks`, `activity` tables |
| `dependencies.py` | Module-level `get_db()`/`set_db()` singleton (not FastAPI Depends) |
| `ingestion.py` | Discovers `ullr.yaml` dirs, reads taskboard/PRD/progress, upserts to SQLite |
| `watcher.py` | Watchdog observer; triggers `ingest_project` + SSE `board_updated` on file changes |
| `sse.py` | `EventBus` pub/sub with asyncio.Queue per subscriber |
| `routes/` | `projects.py`, `agents.py`, `activity.py` — all prefixed `/api`, return raw dicts |

**Ullr is a path dependency** (`api/pyproject.toml` → `../../ullr`). Must be a sibling directory or the path must be updated.

### Frontend (`web/src/`)

| Layer | Location | Notes |
|-------|----------|-------|
| API client | `lib/api.ts` | `fetchApi<T>()` helper; base URL from `VITE_API_URL` or `http://localhost:8400` |
| Types | `lib/types.ts` | `Project`, `Task`, `BoardData`, `Agent`, `ActivityEvent` |
| Data hooks | `hooks/use-api.ts` | React Query hooks + `useSSE()` for live invalidation |
| Pages | `pages/` | `Index` (Kanban board), `Agents`, `Activity`, `NotFound` |
| Layout | `components/layout/` | `DashboardLayout` (sidebar + Outlet), `AppSidebar`, `Header` |
| Board | `components/board/` | `KanbanColumn`, `TaskCard`, `ProjectBadge` |
| UI primitives | `components/ui/` | shadcn/ui — avoid editing unless necessary |

Path alias: `@/` → `src/`.

### Routes (3 pages)

- `/` — Kanban board with project filter
- `/agents` — Active agents (inferred from in_progress tasks)
- `/activity` — Recent events across all projects

## Conventions

- **No AI tool advertising** in commits, docs, or attribution
- API routes return `dict[str, Any]` / `list[dict]` — no Pydantic response models
- DB access pattern: `db = get_db()` → `cursor = await db.conn.execute(...)` → `await cursor.fetchall()`
- Config discovery walks upward from CWD; defaults apply if no `mimir.yaml` found
- Styling: Tailwind + CSS custom properties in `index.css`; use `cn()` from `lib/utils` for class merging
- SSE events: `board_updated`, `agent_changed`, `activity_new`
- New API routes: add router file in `routes/`, include in `app.py`, keep `/api` prefix
- New pages: add route in `App.tsx` inside `DashboardLayout`, add NavLink in `AppSidebar`
