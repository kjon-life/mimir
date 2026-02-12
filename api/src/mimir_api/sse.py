"""Server-Sent Events for live dashboard updates."""

from __future__ import annotations

import asyncio
import json
import logging
from typing import Any, AsyncGenerator

logger = logging.getLogger(__name__)


class EventBus:
    """Simple in-process pub/sub for SSE events.

    The watcher publishes events here; SSE endpoint subscribers receive them.
    """

    def __init__(self) -> None:
        self._subscribers: list[asyncio.Queue[dict[str, Any]]] = []

    def subscribe(self) -> asyncio.Queue[dict[str, Any]]:
        """Create a new subscriber queue."""
        queue: asyncio.Queue[dict[str, Any]] = asyncio.Queue(maxsize=100)
        self._subscribers.append(queue)
        return queue

    def unsubscribe(self, queue: asyncio.Queue[dict[str, Any]]) -> None:
        """Remove a subscriber queue."""
        self._subscribers = [q for q in self._subscribers if q is not queue]

    async def publish(self, event_type: str, data: dict[str, Any] | None = None) -> None:
        """Push an event to all subscribers."""
        event = {"event": event_type, "data": data or {}}
        dead: list[asyncio.Queue[dict[str, Any]]] = []

        for queue in self._subscribers:
            try:
                queue.put_nowait(event)
            except asyncio.QueueFull:
                dead.append(queue)
                logger.warning("Dropping slow SSE subscriber")

        for queue in dead:
            self.unsubscribe(queue)

    async def stream(self, queue: asyncio.Queue[dict[str, Any]]) -> AsyncGenerator[str, None]:
        """Yield SSE-formatted strings from a subscriber queue."""
        try:
            while True:
                event = await queue.get()
                event_type = event.get("event", "message")
                data = json.dumps(event.get("data", {}))
                yield f"event: {event_type}\ndata: {data}\n\n"
        except asyncio.CancelledError:
            return
