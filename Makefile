.PHONY: dev api web setup lint

# Run both API and frontend dev servers
dev: api

# API server only (frontend via Lovable or separate terminal)
api:
	cd api && uv run mimir-api

# Install dependencies
setup:
	cd api && uv sync --python 3.11

# Lint
lint:
	cd api && uv run ruff check src/
	cd api && uv run ruff format --check src/
