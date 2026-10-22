# Verification record · 22 October 2026

- Dependencies installed: Next.js 16.4.2 / React 19, lockfile present; npm install reported zero known vulnerabilities at installation time.
- Production webpack build: passed. Turbopack failed under the sandbox's worker port restriction; unrestricted build request was declined. A standard webpack build succeeded within the sandbox.
- Automated tests: 15 passed, zero failures.
- HTTP smoke test: passed against the running Next.js server. Authentication rejection, malformed filters, pending submission isolation, operator review, publication, zero-budget search, real-event calendar parse and source reporting verified. Temporary test venue removed; original state restored.
- Compose manifest: syntax validated with `docker compose config --no-interpolate --quiet`.
- Docker execution: blocked. CLI installed, daemon socket missing, installed Docker.app missing executable. No existing Docker services changed.
- Luma Discover: imported 20 real source records.
- Luma event: imported 1 real source record.
- dev.events: imported 15 real source records. Records lacking a valid start/end interval were omitted.
- TfL: public API returned 2 stations for the tested Shoreditch coordinates.
- OSM: primary endpoint HTTP 406; fallback HTTP 429. No OSM venues imported.
- Overture: fixture-tested Point GeoJSON normaliser; no real extract downloaded.
- Supabase/Auth/PostGIS: code/schema present; no credentials or running database available, so no database/auth execution claimed.
- Credentialed Cognee, xAI and Discord: not configured; not called. Zero CRM and Notion not implemented.
- Browser visual verification: not performed. Browser origin permission was declined. No workaround browser access attempted.
- Attachments: `/mnt/data/GATHR_CODEX_BUILD_SPEC.md` and `/mnt/data/Pasted markdown(3).md` inaccessible; no attachments returned by referenced chat retrieval.

`source-status.json` is an exported snapshot of observed runs, without secrets. The app's Data sources tab and `npm run audit:sources` read current stored runs. “Live” records may age; inspect their timestamps.

## Supabase follow-up — 22 October 2026

Connector authenticated and migration `20261022200846_gathr_initial_schema` applied. Four tables/RLS, nine indexes (including primary keys), PostGIS 3.3.7 and public/server grants verified. Anonymous RLS and spatial queries passed using transaction-scoped fixture rows which were rolled back. Security/performance advisors returned INFO findings only: intentionally private tables without client policies and new unused indexes. This supersedes the earlier "schema not run" result. Runtime app storage remains local until DATABASE_URL is provided.
