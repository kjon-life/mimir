"""Mimir configuration loader."""

from __future__ import annotations

from pathlib import Path

import yaml
from pydantic import BaseModel, Field


class MimirConfig(BaseModel):
    """Configuration loaded from mimir.yaml."""

    watch_paths: list[Path] = Field(default_factory=list)
    max_depth: int = 3
    poll_interval_seconds: int = 30
    api_port: int = 8400
    db_path: Path = Path("./mimir.db")
    next_port: int = 3400


def load_config(path: Path | None = None) -> MimirConfig:
    """Load configuration from mimir.yaml.

    Searches upward from CWD if no path is given.
    """
    if path is None:
        path = _find_config()
    if path is None:
        return MimirConfig()

    with open(path) as f:
        raw = yaml.safe_load(f) or {}

    return MimirConfig.model_validate(raw)


def _find_config() -> Path | None:
    """Walk upward from CWD looking for mimir.yaml."""
    current = Path.cwd()
    for parent in [current, *current.parents]:
        candidate = parent / "mimir.yaml"
        if candidate.exists():
            return candidate
    return None
