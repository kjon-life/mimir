.PHONY: dev api web setup lint openapi

# Run both API and frontend dev servers
dev: api

# API server
api:
	cd api && uv run mimir-api

# Frontend dev server
web:
	cd web && npm run dev

# Install dependencies
setup:
	cd api && uv sync --python 3.11
	cd web && npm install

# Generate OpenAPI spec to mimir/openapi.json
openapi:
	cd api && uv run mimir-openapi

# Lint
lint:
	cd api && uv run ruff check src/
	cd api && uv run ruff format --check src/
