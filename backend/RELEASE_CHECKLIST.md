# Backend Release Checklist

## Pre-merge quality gates

- Run static checks (if configured):
  - `ruff check .`
  - `mypy .`
- Run API contract tests:
  - `python -m unittest -v tests/test_api_contracts.py`
- Verify app boots without import/runtime errors:
  - `python -c "from main import app; print('ok')"`

## Pre-deploy verification

- Confirm required environment variables are set:
  - `DATABASE_URL`
  - `REDIS_URL`
  - `SECRET_KEY`
  - `GROQ_API_KEY`
- Confirm `/health` returns 200.
- Confirm `/health/ready` returns 200 in target environment.
- Confirm authenticated chat endpoints are available:
  - `GET /chat/status`
  - `POST /chat/stream`
  - `POST /chat/ingest-document`

## Post-deploy smoke test

- Login from frontend and open Chat page.
- Validate that streaming response renders and completes with `[DONE]`.
- Validate document ingestion from UI and updated chunk count in `/chat/status`.

## Rollback plan

1. Revert to previous known-good image/tag.
2. Restart backend workers and API service.
3. Verify `/health` and `/health/ready` status.
4. Run quick smoke test for `/chat/stream` and login flow.
5. Open incident log with request IDs from failed release logs.
