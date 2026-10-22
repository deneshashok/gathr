# Adapter contract

`lib/sources.mjs` is the registry: stable ID, display name, kind, configuration variable, supported mode and limitation. `lib/adapters.mjs` implements fetch/normalisation. `scripts/ingest.mjs` is the operator-triggered runner. `lib/store.mjs` is the persistence boundary. `GET /api/sources` is the public audit view.

## Input → normalised records

| Input | Parser | Output |
| --- | --- | --- |
| Luma public Discover or individual event page | Event JSON-LD + nested ItemList | Event records with original URL, dates, source and fetched time |
| Any authorised provider ICS | node-ical | Non-recurring, non-cancelled dated VEVENTs |
| Devpost / BuilderBase / Meetup / MLH / dev.events / Hack Radar / Hack Collective page | Supported Event JSON-LD | Valid events only; unsupported HTML is an explicit error |
| OSM Overpass JSON | elements + centre | Unverified place candidates, OSM ID/link/attribution |
| Downloaded Overture Places GeoJSON | Point features, names.primary | Unverified candidates with source IDs/metadata and release |
| TfL StopPoint JSON | stopPoints | Station name, modes, straight-line distance |

No registered provider has a mocked “success” client. Synthetic fixtures exercise the parser contract and never set a provider's runtime status to live. Seed venues are fictional demo content and are labelled separately.

## Add or improve a provider

1. Confirm its official access route, terms, auth and actual payload. Do not substitute an invented endpoint.
2. Add configuration names to `.env.example` and the registry.
3. Implement a provider-specific fetch/normaliser returning `{events}` or `{venues}`. Existing shared format adapters need no provider API assumptions.
4. Add representative fixture tests, including unsupported/error responses, deduplication and dates.
5. Run the real authorised request before recording successful status. Preserve data provenance and unknown fields.

## Failure model

Timeout, HTTP error, unsupported/empty event parsing and invalid records do not generate a sample fallback. Runner failures record an error and exit nonzero. Prior valid imported records remain stored. Current source status represents the most recent recorded run; it is not a freshness guarantee. Unset secrets report not configured; present secrets report configured / untested until a successful request is recorded.

## Trust boundary

Open-map names and event descriptions are untrusted third-party content. They render as React text, not raw HTML. Event links permit HTTP/HTTPS only. AI calls describe their dataset as untrusted; AI output is informational and does not write or approve venue data. Server routes require Supabase-verified organiser identity or the local operator token. Only operator review publishes a contribution. Availability is an explicit list of venue-supplied dates, never an inference from an event at that location.

## Known gaps

Shared adapters do not supply provider OAuth, paginated APIs, partner-only data, recurrence expansion, deletion sync or continuously scheduled imports. Cognee search does not ingest venue knowledge; no claims of a populated graph are made. Grok is an xAI API client, not a supported Discord/Telegram bot or an autonomous availability crawler. Optional CRM/Notion remain unimplemented. Docker/Supabase/PostGIS execution needs a working engine or remote database and has not been verified here.
