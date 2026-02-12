"""Agent status API routes."""

from __future__ import annotations

from typing import Any

from fastapi import APIRouter

from mimir_api.dependencies import get_db

router = APIRouter(prefix="/api", tags=["agents"])


@router.get("/agents")
async def list_agents() -> list[dict[str, Any]]:
    """List active agents (inferred from in_progress tasks).

    MVP: An agent is considered active if it's assigned to an in_progress task.
    Future: heartbeat-based tracking via ~/.mimir/agents/ directory.
    """
    db = get_db()
    cursor = await db.conn.execute(
        """SELECT DISTINCT
             t.assigned_agent as name,
             t.project_id,
             p.name as project_name,
             t.story_id,
             t.title as current_task,
             t.updated_at as since
           FROM tasks t
           JOIN projects p ON t.project_id = p.id
           WHERE t.status = 'in_progress'
             AND t.assigned_agent IS NOT NULL
             AND t.assigned_agent != ''
           ORDER BY t.updated_at DESC"""
    )
    rows = await cursor.fetchall()
    return [dict(row) for row in rows]
