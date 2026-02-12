"""Project discovery and data ingestion from Ullr project files."""

from __future__ import annotations

import json
import re
from datetime import UTC, datetime
from pathlib import Path
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from mimir_api.db import Database


async def discover_projects(watch_paths: list[Path], max_depth: int = 3) -> list[dict[str, str]]:
    """Find all directories containing ullr.yaml.

    Returns a list of dicts with 'name', 'path', and config data.
    """
    projects: list[dict[str, str]] = []
    seen: set[Path] = set()

    for watch_path in watch_paths:
        if not watch_path.exists():
            continue
        _scan_directory(watch_path, max_depth, 0, projects, seen)

    return projects


def _scan_directory(
    directory: Path,
    max_depth: int,
    current_depth: int,
    results: list[dict[str, str]],
    seen: set[Path],
) -> None:
    """Recursively scan for ullr.yaml files."""
    if current_depth > max_depth:
        return

    resolved = directory.resolve()
    if resolved in seen:
        return
    seen.add(resolved)

    config_file = directory / "ullr.yaml"
    if config_file.exists():
        results.append(
            {
                "path": str(directory),
                "config_path": str(config_file),
            }
        )
        return  # Don't recurse into Ullr projects

    try:
        for child in sorted(directory.iterdir()):
            if child.is_dir() and not child.name.startswith("."):
                _scan_directory(child, max_depth, current_depth + 1, results, seen)
    except PermissionError:
        pass


def _slugify(name: str) -> str:
    """Convert project name to a URL-safe slug."""
    slug = name.lower().strip()
    slug = re.sub(r"[^a-z0-9]+", "-", slug)
    return slug.strip("-")


async def ingest_project(db: Database, project_path: Path) -> None:
    """Read a single Ullr project's files and upsert into the database."""
    config_path = project_path / "ullr.yaml"
    if not config_path.exists():
        return

    # Read project config for name/description
    import yaml

    with open(config_path) as f:
        config = yaml.safe_load(f) or {}

    project_name = config.get("project", project_path.name)
    project_id = _slugify(project_name)
    branch_name = config.get("branch_prefix", "")
    description = config.get("description", "")

    # Upsert project
    await db.conn.execute(
        """INSERT INTO projects (id, name, path, branch_name, description, last_synced)
           VALUES (?, ?, ?, ?, ?, ?)
           ON CONFLICT(id) DO UPDATE SET
             name=excluded.name, path=excluded.path, branch_name=excluded.branch_name,
             description=excluded.description, last_synced=excluded.last_synced""",
        (project_id, project_name, str(project_path), branch_name, description, _now()),
    )

    # Ingest taskboard
    await _ingest_taskboard(db, project_id, project_path)

    # Ingest PRD for story counts
    await _ingest_prd_counts(db, project_id, project_path)

    # Ingest progress as activity
    await _ingest_progress(db, project_id, project_path)

    await db.conn.commit()


async def _ingest_taskboard(db: Database, project_id: str, project_path: Path) -> None:
    """Read taskboard.json and upsert tasks."""
    taskboard_path = project_path / "taskboard.json"
    if not taskboard_path.exists():
        return

    with open(taskboard_path) as f:
        board = json.load(f)

    # Clear existing tasks for this project, then re-insert
    await db.conn.execute("DELETE FROM tasks WHERE project_id = ?", (project_id,))

    for status, column_key in [
        ("backlog", "backlog"),
        ("in_progress", "in_progress"),
        ("done", "done"),
        ("blocked", "blocked"),
    ]:
        tasks = board.get(column_key, [])
        for task in tasks:
            await db.conn.execute(
                """INSERT INTO tasks (id, project_id, story_id, title, description,
                   status, domain, complexity, blocked_reason, assigned_agent, priority, updated_at)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                (
                    task.get("id", ""),
                    project_id,
                    task.get("story_id", ""),
                    task.get("title", ""),
                    task.get("description", ""),
                    status,
                    task.get("domain", ""),
                    task.get("complexity", ""),
                    task.get("blocked_reason", ""),
                    task.get("assigned_agent", ""),
                    task.get("priority", 2),
                    _now(),
                ),
            )


async def _ingest_prd_counts(db: Database, project_id: str, project_path: Path) -> None:
    """Read prd.json and update story counts on the project."""
    prd_path = project_path / "prd.json"
    if not prd_path.exists():
        return

    with open(prd_path) as f:
        prd = json.load(f)

    stories = prd.get("userStories", [])
    total = len(stories)
    done = sum(1 for s in stories if s.get("passes") is True)

    await db.conn.execute(
        "UPDATE projects SET total_stories = ?, done_stories = ? WHERE id = ?",
        (total, done, project_id),
    )


async def _ingest_progress(db: Database, project_id: str, project_path: Path) -> None:
    """Read progress.jsonl and append new activity entries."""
    progress_path = project_path / "progress.jsonl"
    if not progress_path.exists():
        return

    # Get latest known timestamp for this project to avoid duplicates
    cursor = await db.conn.execute(
        "SELECT MAX(timestamp) FROM activity WHERE project_id = ?",
        (project_id,),
    )
    row = await cursor.fetchone()
    last_ts = row[0] if row and row[0] else ""

    with open(progress_path) as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            try:
                entry = json.loads(line)
            except json.JSONDecodeError:
                continue

            ts = entry.get("timestamp", "")
            if ts <= last_ts:
                continue

            await db.conn.execute(
                """INSERT INTO activity (project_id, event_type, story_id, agent_name, summary, metadata, timestamp)
                   VALUES (?, ?, ?, ?, ?, ?, ?)""",
                (
                    project_id,
                    entry.get("event_type", "progress"),
                    entry.get("story_id", ""),
                    entry.get("agent", ""),
                    entry.get("summary", ""),
                    json.dumps(entry.get("metadata", {})),
                    ts,
                ),
            )


async def ingest_all(db: Database, watch_paths: list[Path], max_depth: int = 3) -> int:
    """Discover and ingest all Ullr projects. Returns count of projects found."""
    projects = await discover_projects(watch_paths, max_depth)
    for project_info in projects:
        await ingest_project(db, Path(project_info["path"]))
    return len(projects)


def _now() -> str:
    return datetime.now(UTC).isoformat()
