.PHONY: dev api web setup lint openapi

# Run both API and frontend dev servers
dev: api

# API server only (frontend via Lovable or separate terminal)
api:
	cd api && uv run mimir-api

# Install dependencies
setup:
	cd api && uv sync --python 3.11

# Generate OpenAPI spec to mimir/openapi.json
openapi:
	cd api && uv run mimir-openapi

# Lint
lint:
	cd api && uv run ruff check src/
	cd api && uv run ruff format --check src/
