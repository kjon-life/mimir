"""Filesystem watcher for Ullr project changes."""

from __future__ import annotations

import asyncio
import logging
from pathlib import Path
from typing import Callable

from watchdog.events import FileSystemEventHandler, FileSystemEvent
from watchdog.observers import Observer

logger = logging.getLogger(__name__)

# Files that trigger re-ingestion when modified
WATCHED_FILES = {"taskboard.json", "prd.json", "progress.jsonl", "ullr.yaml"}


class UllrFileHandler(FileSystemEventHandler):
    """Watchdog handler that fires a callback when Ullr files change."""

    def __init__(self, callback: Callable[[Path], None]) -> None:
        self._callback = callback
        self._debounce_tasks: dict[str, asyncio.TimerHandle] = {}

    def on_modified(self, event: FileSystemEvent) -> None:
        if event.is_directory:
            return
        path = Path(str(event.src_path))
        if path.name in WATCHED_FILES:
            self._callback(path)

    def on_created(self, event: FileSystemEvent) -> None:
        self.on_modified(event)


class ProjectWatcher:
    """Watches configured directories for Ullr project file changes."""

    def __init__(self, watch_paths: list[Path], on_change: Callable[[Path], None]) -> None:
        self._watch_paths = watch_paths
        self._on_change = on_change
        self._observer: Observer | None = None

    def start(self) -> None:
        """Start watching directories for changes."""
        self._observer = Observer()
        handler = UllrFileHandler(self._on_change)

        for watch_path in self._watch_paths:
            if watch_path.exists():
                self._observer.schedule(handler, str(watch_path), recursive=True)
                logger.info("Watching %s for Ullr project changes", watch_path)

        self._observer.start()

    def stop(self) -> None:
        """Stop the filesystem watcher."""
        if self._observer:
            self._observer.stop()
            self._observer.join(timeout=5)
            self._observer = None
