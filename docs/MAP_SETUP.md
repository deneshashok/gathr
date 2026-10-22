# Supabase locations on a greyscale map

## Current running app

Open `http://127.0.0.1:3000/`, choose **Explore the map**, and scroll to the map below the introduction. The app now reads published records directly from Supabase rather than the local sample file. Reload an already open page after restarting the server.

- 447 published events were returned in the final API check.
- 437 had stored coordinates and can appear on the map; overlapping coordinates share a pin with a list of records.
- 10 had no coordinates. They remain in Community events and are not placed at an invented default location.
- The database has 116 venues, all pending review. They remain private, so the public venue layer currently has zero pins. This change does not approve or publish them.
- Dates include past events by default. Choose Upcoming events to narrow the display. Three events have missing/invalid calendar intervals; they remain in the catalogue but are omitted from calendar export. The export currently contains 444 events.

Counts describe the verification snapshot on 22 October 2026 and may change with imports. Stored coordinates may identify a building or place rather than a precise entrance. Publication/non-demo flags do not establish booking availability or independently verified accuracy.

## Basemap

The user selected an **OpenStreetMap greyscale fallback** for now. The client uses Leaflet 1.9.4 and normal browser-loaded OpenStreetMap tiles with a CSS greyscale filter. The provider and mandatory OpenStreetMap attribution remain visible. Map navigation loads only the visible map tiles; there is no bulk download or offline prefetch.

To switch to CARTO Positron, obtain a key through the [official CARTO basemap page](https://www.carto.com/basemaps/), set `CARTO_BASEMAP_KEY` in `.env`, and restart the local server. The map uses CARTO's documented `rastertiles/light_all` endpoint with attribution to CARTO and OpenStreetMap. CARTO currently documents a key requirement. Do not substitute the Supabase secret key. Basemap keys are browser-visible; restrict the key to the domains where you serve this site.

## Data connection

Set these in `.env`:

```dotenv
SUPABASE_CATALOGUE_ENABLED=true
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-publishable-key
CARTO_BASEMAP_KEY=
```

This workspace already has the correct Supabase configuration saved locally. No server secret or database password is needed for map reads.

The read-only `public.gathr_public_catalogue()` function is installed on the connected project. It uses **SECURITY INVOKER**, the caller's RLS, an empty search path and explicit approved/published/non-demo predicates. It exposes selected public fields and converts stored PostGIS geography to latitude/longitude. It does not return private contacts, owner IDs, raw JSON payloads, or pending records. Function execution is granted to anon, authenticated and service_role, with PUBLIC execution revoked.

`lib/catalogue.mjs` calls this function using the publishable key and caches the result for 15 seconds. Public venue search, Community events and calendar export use that catalogue when enabled. Sources reports published stored-record counts instead of reading stale local source-run success flags. Supabase failure returns an error; it does not restore fictional sample records.

The live schema was expanded outside the original bootstrap migration and now uses normalised UUID tables. The map migration targets that current schema. The original bootstrap migration alone does not recreate all of its columns on a fresh project. Do not run the old JSON-store writer against the normalised live tables. Contribution/review routes in this app are explicitly read-only while the remote catalogue mode is enabled; connect the organiser write workflow separately. Existing remote RLS and review status were preserved.

## Verification

- `npm test`: 21 tests passed.
- `npm run build`: production webpack build passed.
- `node --env-file=.env scripts/smoke-map.mjs`: real Supabase-backed API, coordinate counts, publication filtering, provider selection, source counts and calendar parsing passed.
- The Supabase function was called as anonymous role: 0 public venues, 447 public events, 437 mapped events.
- Secret scan: server-only credentials absent from static client bundles.
- Browser visual testing was blocked by a saved origin permission. No browser workaround was attempted.
- Supabase security advisors reported no finding on the new invoker function. Two existing authenticated SECURITY DEFINER notices concern `is_admin()` and `is_approved_organiser()` from the separately expanded schema; these were not modified. [Advisor reference](https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable).

Local migration file `20261022205254_public_map_catalogue.sql` matches the recorded remote migration version.
