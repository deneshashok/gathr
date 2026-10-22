# Build history and earlier verification notes

This is the previous README, retained as a historical implementation record. For current behaviour, start with the repository README and WALKTHROUGH.md. Some earlier snapshots describe local sample data and approval filters superseded by the venue directory.

# GATHR · Open venues and community events

**Venue directory:** [Costs and contact details](VENUE_DIRECTORY.md). Imported venue leads are now visible with explicit unverified labels, source pricing notes and public booking/contact links.

**Map update:** [Supabase map setup](MAP_SETUP.md). The local app now shows published Supabase event locations on an interactive greyscale map, with an optional CARTO Positron key. Pending venues remain private. The earlier setup/verification sections below describe the initial prototype.

A working local Track 4 slice: Next.js App Router, a shadcn-style Radix/CVA button and component registry, Tailwind 4, responsive venue discovery, reviewed organiser contributions, event adapters, an iCalendar feed, and explicit source provenance. MIT licensed application code. Third-party datasets retain their own licences.

## Run on this Mac

Dependencies are installed and a production build has passed. The app runs at **http://127.0.0.1:3000** when its local server is active.

```sh
npm ci
npm test
npm run build
node --env-file=.env node_modules/next/dist/bin/next start --hostname 127.0.0.1
```

Node 22+ is recommended. The verified host has Node 26.7.0. The build uses webpack because Turbopack's worker port was blocked by this environment's sandbox. `npm run dev` is available on a normal local terminal.

For a fresh checkout, copy `.env.example` to `.env`. Create long random `ADMIN_TOKEN` and URL-safe `POSTGRES_PASSWORD` values locally; never paste them into chat or commit `.env`. This workspace already has an ignored `.env` containing newly generated local credentials and public source settings. No existing credentials were read. Empty `DATABASE_URL` uses a persistent JSON demo file with three **fictional** venues. The file store supports a single application process, not multiple workers or production deployment.

## What actually worked on 22 October 2026

| Source / feature | Observed status | Evidence / implementation |
| --- | --- | --- |
| Luma Discover | Live import | 20 public Event JSON-LD records from `https://luma.com/london` |
| Luma event | Live import | 1 public Event JSON-LD record from `https://luma.com/gkmdzbk9` |
| dev.events | Live import | 15 valid dated Event/EducationEvent records from `https://dev.events/` (global events, not London-only) |
| TfL | Live request | 2 nearby stations returned for 51.525, -0.078; venue endpoint supports every published venue |
| OpenStreetMap | Error, no imported venues | Overpass main returned HTTP 406; alternative returned HTTP 429 |
| Luma ICS | Not configured | ICS adapter tested with fixture roundtrip; no owner's feed supplied |
| Devpost | Not configured | Public listing fetched; no supported Event JSON-LD found. Configure an authorised event page/feed |
| MLH | Not configured | Public listing fetched; no supported Event JSON-LD found. Configure an authorised event page/feed |
| BuilderBase, Meetup | Not configured | Registry entries route an authorised URL through ICS / Event JSON-LD parsers |
| Hack Radar, Hack Collective | Not configured | Same documented format adapters; no verified feed or partner access supplied |
| Overture | Not configured | Local Places GeoJSON importer tested using a synthetic fixture; no actual extract supplied |
| Cognee | Not configured / untested remotely | Authenticated `/api/v1/search` client; no graph uploaded or cognified |
| Grok / xAI | Not configured / untested remotely | Grounded Chat Completions client; requires API key and accessible model |
| Discord | Not configured / untested remotely | Explicit operator-only webhook digest; no messages sent |
| Zero CRM, Notion | Optional, not implemented | No confirmed Zero partner API or Notion workspace/database supplied |
| Venue samples | Seeded / fictional | 3 sample venues with illustrative price/capacity/dates; not sourced from OSM or Overture |
| Supabase Auth | Implemented, not configured or exercised remotely | Email magic-link UI, server verifies JWT via Auth user endpoint and checks independently verified profile |
| Postgres / PostGIS | Hosted schema applied and verified | Four protected tables, PostGIS 3.3.7, spatial index and RLS tested via Supabase connector; app runtime still uses local storage |
| Docker | Blocked on host | CLI exists; engine socket missing; `/Applications/Docker.app` lacks its executable |

36 imported source records may describe overlapping events. API/calendar views deduplicate matching event URL + start time and retain the source list. Source counts describe successful import records, not distinct events. “Live” means a recorded successful request/import at its shown timestamp; it does **not** mean a background synchroniser is running. No source is counted as live merely because a key is configured. See `docs/VERIFICATION.md` and `docs/source-status.json`.

## Venue discovery and trust

- Search by neighbourhood/name, total booking budget in GBP, minimum capacity, an exact listed date, or coordinates/radius. Dates mean organiser-supplied available dates, not a connected booking system. Unknown price/capacity/date never passes a confirmed constraint.
- Imported map places start with unknown commercial facts, no availability and `verified: false`. A place record does not imply that the operator rents event space.
- Organisers sign in through Supabase email links. An operator must verify their identity/ownership evidence independently and create a row in `organiser_profiles` before their JWT can submit anything. Email verification alone grants no contribution rights.
- Contributions enter `pending`. Only the configured operator token can review and approve them. Public search excludes pending/rejected records. `reviewedBy`, `reviewedAt` and owner are recorded. Approval is an operator attestation, not a booking guarantee.
- Local operator tokens provide a development shortcut for submission/review, without pretending to be Supabase users. Enter one in **Contribute → Advanced operator access**. Normal organisers use email sign-in.
- There is no Stripe checkout, live venue inventory, payment confirmation or reservation locking. Those need actual venue agreements and availability APIs. An AI response cannot establish either.

## Docker Compose: application + PostGIS

After repairing / starting Docker Desktop, first inspect existing containers (`docker ps`) and check ports 3000 / 55432. This project uses its own `gathr` Compose namespace and named volume.

```sh
docker compose config --quiet
docker compose up --build -d
```

Compose starts PostGIS and the web app. It does **not** pretend that PostGIS alone is the full Supabase platform. `db` uses amd64 emulation for the published PostGIS image on Apple Silicon. New database volumes apply the migration automatically and start with no fictional venue records. Host ingestion/migration commands need `DATABASE_URL=postgresql://gathr:<password>@127.0.0.1:55432/gathr` in `.env`; Compose overrides it internally with the `db` hostname. Existing volumes need `npm run migrate`; initialization files do not rerun automatically. Do not delete volumes to apply schema changes.

For container ingestion, run the importer from a host terminal against the Compose database. The final web image includes the standalone server only, not development scripts.

## Supabase + PostGIS option

For the supplied hosted project and current setup status, see [Supabase setup](SUPABASE_SETUP.md).

Use a hosted Supabase project with its direct Postgres connection, or a dedicated local CLI stack:

```sh
npx supabase start
npx supabase db reset
```

Run `db reset` only on this dedicated disposable local development stack; it destroys that stack's existing data. Do not run it against another project. Supabase CLI manages its own Docker services; Compose is an alternative, not a second Supabase installation. For hosted Supabase, apply `supabase/migrations/20261022200846_gathr_initial_schema.sql` with the SQL editor or `npm run migrate` using the project's database connection. Never assume the Compose database and Supabase Auth database are the same.

Set `SUPABASE_URL`, public `SUPABASE_ANON_KEY`, and server-only `DATABASE_URL`. The database must contain the verified profile rows matching the Supabase Auth UUIDs. Add the app origin to allowed Auth redirects and configure email delivery. The public anon key is intentionally returned by `/api/auth/config`; operator, database, AI and webhook secrets never reach that endpoint.

After checking an organiser's evidence, an operator can run parameterised SQL through their trusted database tooling:

```sql
insert into organiser_profiles (id, verified_at, verified_by, evidence)
values ('<supabase-user-uuid>', now(), '<reviewer>', '<evidence reference>');
```

RLS permits public reads of approved venue rows and events and contains no client write policies. Server writes require a trusted database connection. Supabase JWTs are checked by the Auth service; contributions additionally require the verified profile row. The current operator desk uses a single local operator token; team roles, token revocation controls, append-only moderation audit history and deployment rate limits remain production work.

## Ingest sources

Set the appropriate URL/flag in `.env`, then run:

```sh
npm run ingest -- luma-discover luma-event dev-events
npm run ingest -- luma-ics devpost builderbase meetup mlh hack-radar hack-collective
npm run ingest -- osm overture
npm run audit:sources
```

No arguments attempts configured venue/event adapters only. Each source's stable ID, original link, import timestamp and run result are stored. Upserts are idempotent per source. Reads use HTTPS, reject redirects, time out after 20 seconds and cap downloaded bodies at 5 MB. URLs are server/operator configuration, never arbitrary public request inputs. Do not configure untrusted internal URLs.

Event feeds accept ICS or public schema.org Event JSON-LD, including nested ItemList/@graph structures and supported event subtypes. These are shared **format adapters**, not fabricated official APIs for every provider. Supply an authorised feed/page that actually exposes the supported format. Invalid / cancelled entries are omitted, recurring ICS entries are skipped rather than shown as one misleading occurrence, and a missing/end-before-start time is not invented. Empty parses fail without sample fallback. Imports are incremental: upstream removals/cancellations do not currently delete already persisted events. Recurrence expansion, pagination, full cancellation sync, retries, scheduled jobs, and OAuth provider APIs are future work.

Luma Discover here uses observed public JSON-LD, not an undocumented discovery API. The subscription-controlled Luma API is separate and is not implemented. Grok does not fetch Luma data on behalf of the importer.

For Overture, download a modest London Places GeoJSON using the official Overture CLI/Explorer, set `OVERTURE_GEOJSON_PATH` and `OVERTURE_RELEASE`, and retain its source metadata/licences. The importer handles Point features and preserves original source records. For OSM, enable `OSM_ENABLED=true`. Imported map data has no booking facts. OSM attribution and source links are displayed; redistribution is subject to ODbL. Overture extracts can combine sources with different licences: inspect the release metadata before redistribution.

## Calendar and integrations

`GET /api/calendar` returns RFC 5545 text/calendar with UTC timestamps, escaping and UTF-8 line folding. Import that URL into your calendar when reachable from your calendar service. A remote calendar cannot reach a Mac's localhost; no public deployment has been made.

`GET /api/transit?venue=<approved-venue-id>` queries real TfL StopPoints within 700 m. Distances are straight-line metres, not walking duration. Requires `TFL_ENABLED=true`; optional `TFL_APP_KEY` is server-only. Attribution: Powered by TfL Open Data.

`POST /api/integrations` requires `Authorization: Bearer <operator token>` and a JSON body:

```json
{"service":"grok","query":"Which listed venues fit 50 people under £300?"}
```

Other services: `cognee` with a `query`, or `discord` with no query to send the imported event digest. These actions are explicit and never run during ingestion/setup. No Discord message was sent during this build. Use only after authorising the relevant destination/data sharing. Grok receives approved venue records only; Cognee searches an already configured knowledge graph. Cognee add/cognify pipelines, generic Grok Bot chat-platform connectors, Zero CRM and Notion sync are not claimed to work.

## Tests and verification

```sh
npm test
npm run build
node --env-file=.env scripts/smoke.mjs
```

The smoke script requires a running server, an operator token, local-file mode and the already imported Luma data. It backs up/restores `data/state.json`; do not use it against a shared server or while imports are writing. Tests cover filters/unknown values, distance, source statuses, calendar roundtrip/escaping/folding, shared adapters, bad input, unsafe links, bearer authorization, source deduplication and concurrent file writes. The HTTP smoke verifies pending isolation, review, authentication, search and the real-data calendar. Supabase/PostGIS and credentialed provider calls remain unverified on this host.

The browser permission request was declined, so browser interaction and visual QA were not performed. The implementation was compiled and checked through API-only tests, with separate authorization.

## Architecture and current limits

See `docs/ADAPTERS.md`. API handlers call domain validation and the repository store. The same store writes local JSON or transactional Postgres. Postgres uses an advisory transaction lock for read-modify-write operations; radius discovery uses PostGIS `ST_DWithin` and its GiST index. Source credentials stay in server environment variables. Data-status endpoints expose source IDs/status/count/timestamps, never feed URLs or credentials.

This is a local operational prototype, not a deployed booking marketplace. No existing repository was overwritten, no public GitHub repository was created, and no partner starter repository was forked because the referenced build attachments/stack list were unavailable. The bounded prior conversation contained no usable attached files. The implementation is based on the explicit current request.

Provider references: [Next.js](https://nextjs.org/docs/app/getting-started/installation), [Supabase Docker](https://supabase.com/docs/guides/self-hosting/docker), [Overture Places](https://docs.overturemaps.org/guides/places/), [TfL API](https://api.tfl.gov.uk/), [Luma API access](https://help.lu.ma/p/luma-api), [Cognee API](https://docs.cognee.ai/api-reference/introduction), [xAI Chat Completions](https://api.x.ai/docs/).
