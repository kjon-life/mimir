"""Mimir API — FastAPI application."""

from __future__ import annotations

import asyncio
import logging
from contextlib import asynccontextmanager
from typing import TYPE_CHECKING

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sse_starlette.sse import EventSourceResponse

from mimir_api.config import load_config
from mimir_api.db import Database
from mimir_api.dependencies import set_db
from mimir_api.ingestion import ingest_all, ingest_project
from mimir_api.routes import activity, agents, projects
from mimir_api.sse import EventBus
from mimir_api.watcher import ProjectWatcher

if TYPE_CHECKING:
    from collections.abc import AsyncGenerator
    from pathlib import Path

logger = logging.getLogger(__name__)

event_bus = EventBus()


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Startup: connect DB, run initial ingestion, start watcher."""
    config = load_config()

    # Database
    db = Database(config.db_path)
    await db.connect()
    set_db(db)

    # Initial ingestion
    count = await ingest_all(db, config.watch_paths, config.max_depth)
    logger.info("Initial ingestion complete: %d projects discovered", count)

    # File watcher
    def on_file_change(path: Path) -> None:
        """Handle filesystem change — re-ingest the affected project."""
        project_dir = path.parent
        # Walk up to find ullr.yaml
        while project_dir != project_dir.parent:
            if (project_dir / "ullr.yaml").exists():
                break
            project_dir = project_dir.parent
        else:
            return

        asyncio.get_event_loop().create_task(_reingest(db, project_dir))

    watcher = ProjectWatcher(config.watch_paths, on_file_change)
    watcher.start()

    yield

    # Shutdown
    watcher.stop()
    await db.close()


async def _reingest(db: Database, project_path: Path) -> None:
    """Re-ingest a single project and notify SSE subscribers."""
    try:
        await ingest_project(db, project_path)
        await event_bus.publish("board_updated", {"project_path": str(project_path)})
        logger.info("Re-ingested project at %s", project_path)
    except Exception:
        logger.exception("Failed to re-ingest %s", project_path)


def create_app() -> FastAPI:
    """Build the FastAPI application."""
    app = FastAPI(
        title="Mimir — Mission Control",
        description="Dashboard API for Ullr autonomous builder projects",
        version="0.0.1",
        lifespan=lifespan,
    )

    # CORS for frontend dev server (Vite default: 8080)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:3400", "http://localhost:3000", "http://localhost:8080", "http://[::]:8080"],
        allow_methods=["GET"],
        allow_headers=["*"],
    )

    # Routes
    app.include_router(projects.router)
    app.include_router(agents.router)
    app.include_router(activity.router)

    @app.get("/api/sse")
    async def sse_endpoint() -> EventSourceResponse:
        """Server-Sent Events stream for live updates."""
        queue = event_bus.subscribe()

        async def generate() -> AsyncGenerator[dict[str, str], None]:
            try:
                while True:
                    event = await queue.get()
                    yield {"event": event["event"], "data": str(event.get("data", "{}"))}
            except asyncio.CancelledError:
                event_bus.unsubscribe(queue)

        return EventSourceResponse(generate())

    @app.get("/api/health")
    async def health() -> dict[str, str]:
        return {"status": "ok"}

    return app


def main() -> None:
    """Entry point for `mimir-api` CLI command."""
    logging.basicConfig(level=logging.INFO, format="%(asctime)s %(name)s %(levelname)s %(message)s")
    config = load_config()
    uvicorn.run(
        "mimir_api.app:create_app",
        factory=True,
        host="0.0.0.0",
        port=config.api_port,
        reload=True,
    )


if __name__ == "__main__":
    main()
