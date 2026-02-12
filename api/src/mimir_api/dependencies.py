"""Shared dependencies for route handlers."""

from __future__ import annotations

from mimir_api.db import Database

# Module-level singleton, set during app lifespan
_db: Database | None = None


def set_db(db: Database) -> None:
    """Set the global database instance (called during app startup)."""
    global _db  # noqa: PLW0603
    _db = db


def get_db() -> Database:
    """Get the global database instance."""
    if _db is None:
        msg = "Database not initialized. App not started?"
        raise RuntimeError(msg)
    return _db
