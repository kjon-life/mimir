"""Project and board API routes."""

from __future__ import annotations

from typing import Any

from fastapi import APIRouter, Query

from mimir_api.dependencies import get_db

router = APIRouter(prefix="/api", tags=["projects"])


@router.get("/projects")
async def list_projects() -> list[dict[str, Any]]:
    """List all discovered Ullr projects with story counts."""
    db = get_db()
    cursor = await db.conn.execute(
        "SELECT id, name, path, branch_name, description, total_stories, done_stories, last_synced "
        "FROM projects ORDER BY name"
    )
    rows = await cursor.fetchall()
    return [dict(row) for row in rows]


@router.get("/projects/{project_id}")
async def get_project(project_id: str) -> dict[str, Any]:
    """Get a single project's details."""
    db = get_db()
    cursor = await db.conn.execute(
        "SELECT id, name, path, branch_name, description, total_stories, done_stories, last_synced "
        "FROM projects WHERE id = ?",
        (project_id,),
    )
    row = await cursor.fetchone()
    if row is None:
        from fastapi import HTTPException

        raise HTTPException(status_code=404, detail=f"Project {project_id} not found")
    return dict(row)


@router.get("/board")
async def get_board(
    project: str = Query("all", description="Project ID or 'all'"),
    status: str | None = Query(None, description="Filter by status"),
) -> dict[str, Any]:
    """Get the Kanban board: tasks grouped by status column.

    Returns:
        {
            "columns": {
                "backlog": [...tasks],
                "in_progress": [...tasks],
                "blocked": [...tasks],
                "done": [...tasks]
            },
            "total": int,
            "done_count": int
        }
    """
    db = get_db()

    conditions: list[str] = []
    params: list[str] = []

    if project != "all":
        conditions.append("t.project_id = ?")
        params.append(project)
    if status:
        conditions.append("t.status = ?")
        params.append(status)

    where = f"WHERE {' AND '.join(conditions)}" if conditions else ""

    cursor = await db.conn.execute(
        f"""SELECT t.*, p.name as project_name
            FROM tasks t
            JOIN projects p ON t.project_id = p.id
            {where}
            ORDER BY t.priority ASC, t.updated_at DESC""",
        params,
    )
    rows = await cursor.fetchall()

    columns: dict[str, list[dict[str, Any]]] = {
        "backlog": [],
        "in_progress": [],
        "blocked": [],
        "done": [],
    }

    for row in rows:
        task = dict(row)
        col = task.get("status", "backlog")
        if col in columns:
            columns[col].append(task)

    total = sum(len(tasks) for tasks in columns.values())
    done_count = len(columns["done"])

    return {"columns": columns, "total": total, "done_count": done_count}
