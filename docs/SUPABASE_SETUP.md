# Supabase setup for GATHR

Project: `ecyjyfxxsdzipfqllglh`  
URL: `https://ecyjyfxxsdzipfqllglh.supabase.co`

## Current result — schema applied and verified

The Supabase connector is authenticated to project GATHR. Migration `20261022200846_gathr_initial_schema` was applied on 22 October 2026. All four application tables exist with RLS enabled. PostGIS 3.3.7 is installed in `extensions`; the spatial and lookup indexes exist.

A rolled-back test verified that an anonymous reader sees an approved venue, cannot see a pending venue, and can query the generated location through PostGIS. No test records were retained. The Data API was checked separately using both supplied key types. See `SUPABASE_VERIFICATION.json` for the observed results.

Security advisors reported no warning/error-level findings. The two INFO notices about RLS with no policies are intentional: organiser profiles and source-run internals are private and server-only. The five unused-index INFO notices reflect the empty new database, so the search indexes were retained. References: [private-table RLS advisory](https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy), [unused-index advisory](https://supabase.com/docs/guides/database/database-linter?lint=0005_unused_index).

The URL/keys are saved in the ignored `.env` with owner-only file permissions. The secret is server-only. No keys appear in this document or the SQL. **The running app still uses its local data file until `DATABASE_URL` is configured.** The connector installs/administers the database; it is not the application's runtime database connection. No existing demo/imported data was uploaded.

## One-file installation

Already applied via the connector. For reference or a fresh dedicated project, the full schema is saved in:

`supabase/migrations/20261022200846_gathr_initial_schema.sql`

The file creates exactly the tables the current app reads/writes:

| Table | Purpose | Access |
| --- | --- | --- |
| `public.organiser_profiles` | Verified organiser IDs, review date/reviewer and evidence reference | Trusted server / operator only |
| `public.venues` | Place records, contributions, moderation status, booking facts and generated PostGIS point | Public approved reads; trusted server writes |
| `public.events` | Normalised imported events and source provenance | Public reads; trusted server writes |
| `public.source_runs` | Actual adapter success/failure, counts and timestamps | Trusted server only; app exposes sanitised status |

It enables PostGIS and RLS, adds spatial and lookup indexes, and restricts public roles to reads of approved venues/events. It checks existing table column types before making changes, uses a transaction, does not drop tables or insert fictional data, and can be rerun for this schema. It recreates only the two GATHR-owned read policies. Existing additional policies are not removed; review them if these tables already existed. Supabase manages `auth.users`; the app does not recreate or overwrite Auth tables. Organiser profile IDs are matched to Auth UUIDs by server verification.

Alternatively save a direct/pooler database connection as `DATABASE_URL` in `.env`, then:

```sh
npm run migrate
```

A management access token with SQL write permission also works: set `SUPABASE_ACCESS_TOKEN` and `SUPABASE_PROJECT_ID` in `.env` and run the same command. A management token can install schema but is not a runtime database connection. Store credentials locally rather than in chat. No password resets or new tokens are required if you already have suitable access.

## Verify in SQL editor

```sql
select c.relname as table_name, c.relrowsecurity as rls_enabled
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relname in ('organiser_profiles','venues','events','source_runs')
  and c.relkind = 'r'
order by c.relname;

select extname, extversion
from pg_extension where extname = 'postgis';
```

Expected: four tables, each with `rls_enabled=true`, and an installed PostGIS extension. The migration command runs the table/RLS verification automatically.

## Connect the app after installation

Set the project's real Postgres connection string as `DATABASE_URL`; do not use the app's locally generated Docker password as your Supabase password. Restart the app after changing environment variables. The current store uses `pg`, not the Supabase REST API, for transactional database writes. Configure Auth's allowed redirect URL to include `http://127.0.0.1:3000` if email sign-in is used. Venue verification remains operator-controlled; an email sign-in does not automatically verify organisers.

The remote database starts empty. Existing demo venues and imported event records remain in the local file until an explicit import/migration of content is performed. No external messages or account settings were changed during this setup.
