"""Generate OpenAPI specification from the FastAPI app."""

from __future__ import annotations

import json
from pathlib import Path

from mimir_api.app import create_app

SPEC_PATH = Path(__file__).resolve().parent.parent.parent.parent / "openapi.json"


def generate() -> None:
    """Write the OpenAPI spec to mimir/openapi.json."""
    app = create_app()
    spec = app.openapi()
    SPEC_PATH.write_text(json.dumps(spec, indent=2) + "\n")
    print(f"Wrote {SPEC_PATH}")


if __name__ == "__main__":
    generate()
