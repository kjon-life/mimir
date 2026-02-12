"""Activity feed API routes."""

from __future__ import annotations

from typing import Any

from fastapi import APIRouter, Query

from mimir_api.dependencies import get_db

router = APIRouter(prefix="/api", tags=["activity"])


@router.get("/activity")
async def list_activity(
    project: str = Query("all", description="Project ID or 'all'"),
    limit: int = Query(50, ge=1, le=200),
    after: str | None = Query(None, description="ISO timestamp cursor for pagination"),
) -> list[dict[str, Any]]:
    """Get recent activity events, newest first."""
    db = get_db()

    conditions: list[str] = []
    params: list[str | int] = []

    if project != "all":
        conditions.append("a.project_id = ?")
        params.append(project)
    if after:
        conditions.append("a.timestamp > ?")
        params.append(after)

    where = f"WHERE {' AND '.join(conditions)}" if conditions else ""

    params.append(limit)

    cursor = await db.conn.execute(
        f"""SELECT a.*, p.name as project_name
            FROM activity a
            JOIN projects p ON a.project_id = p.id
            {where}
            ORDER BY a.timestamp DESC
            LIMIT ?""",
        params,
    )
    rows = await cursor.fetchall()
    return [dict(row) for row in rows]
