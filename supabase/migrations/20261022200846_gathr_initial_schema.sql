-- GATHR schema: compatible with the current Next.js repository store.
-- Safe to rerun on the GATHR schema; incompatible existing tables abort first.
BEGIN;
SET LOCAL search_path = public, extensions;

DO $preflight$
DECLARE
  expected record;
  actual_type text;
BEGIN
  FOR expected IN
    SELECT * FROM (VALUES
      ('organiser_profiles', 'id', 'uuid'),
      ('organiser_profiles', 'verified_at', 'timestamptz'),
      ('organiser_profiles', 'verified_by', 'text'),
      ('organiser_profiles', 'evidence', 'text'),
      ('venues', 'id', 'text'), ('venues', 'data', 'jsonb'),
      ('events', 'id', 'text'), ('events', 'data', 'jsonb'),
      ('source_runs', 'id', 'text'), ('source_runs', 'data', 'jsonb')
    ) AS required(table_name, column_name, type_name)
  LOOP
    IF to_regclass('public.' || expected.table_name) IS NOT NULL THEN
      SELECT udt_name INTO actual_type
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = expected.table_name
        AND column_name = expected.column_name;
      IF actual_type IS DISTINCT FROM expected.type_name THEN
        RAISE EXCEPTION 'Existing public.%.% is incompatible; inspect before migrating',
          expected.table_name, expected.column_name;
      END IF;
    END IF;
  END LOOP;
END
$preflight$;

CREATE SCHEMA IF NOT EXISTS extensions;
CREATE EXTENSION IF NOT EXISTS postgis WITH SCHEMA extensions;

CREATE TABLE IF NOT EXISTS public.organiser_profiles (
  id uuid PRIMARY KEY,
  verified_at timestamptz,
  verified_by text,
  evidence text
);
COMMENT ON TABLE public.organiser_profiles IS
  'Operator-verified Supabase Auth user IDs. Email sign-in alone does not grant contribution rights.';

CREATE TABLE IF NOT EXISTS public.venues (
  id text PRIMARY KEY,
  data jsonb NOT NULL,
  location geography(Point, 4326) GENERATED ALWAYS AS (
    ST_SetSRID(ST_MakePoint(
      (data->>'lon')::double precision,
      (data->>'lat')::double precision
    ), 4326)::geography
  ) STORED
);
COMMENT ON TABLE public.venues IS
  'Venue contributions and imported places. data.status gates publication; unknown booking facts stay null.';

CREATE INDEX IF NOT EXISTS venues_location_idx
  ON public.venues USING gist(location);
CREATE INDEX IF NOT EXISTS venues_status_idx
  ON public.venues ((data->>'status'));
CREATE INDEX IF NOT EXISTS venues_source_idx
  ON public.venues ((data->>'source'));

CREATE TABLE IF NOT EXISTS public.events (
  id text PRIMARY KEY,
  data jsonb NOT NULL
);
COMMENT ON TABLE public.events IS
  'Normalised imported events with source identity, source URL and import time; no fixture events inserted.';
CREATE INDEX IF NOT EXISTS events_source_idx
  ON public.events ((data->>'source'));
CREATE INDEX IF NOT EXISTS events_start_idx
  ON public.events ((data->>'start'));

CREATE TABLE IF NOT EXISTS public.source_runs (
  id text PRIMARY KEY,
  data jsonb NOT NULL
);
COMMENT ON TABLE public.source_runs IS
  'Most recent actual run per adapter: ok, count and at. Never store API credentials here.';

ALTER TABLE public.organiser_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.source_runs ENABLE ROW LEVEL SECURITY;

-- Recreate only the two GATHR-owned read policies. No table/data drops.
DROP POLICY IF EXISTS public_approved ON public.venues;
CREATE POLICY public_approved ON public.venues
  FOR SELECT USING (data->>'status' = 'approved');
DROP POLICY IF EXISTS public_events ON public.events;
CREATE POLICY public_events ON public.events
  FOR SELECT USING (true);

-- Supabase roles exist on hosted projects; keep local PostGIS Compose compatible.
-- No browser write grants or policies. Verified submissions/reviews use trusted server code.
DO $grants$
DECLARE role_name text;
BEGIN
  FOREACH role_name IN ARRAY ARRAY['anon', 'authenticated'] LOOP
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = role_name) THEN
      EXECUTE format(
        'REVOKE ALL ON public.organiser_profiles, public.venues, public.events, public.source_runs FROM %I',
        role_name
      );
      EXECUTE format('GRANT USAGE ON SCHEMA public TO %I', role_name);
      EXECUTE format('GRANT SELECT ON public.venues, public.events TO %I', role_name);
    END IF;
  END LOOP;
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'service_role') THEN
    GRANT USAGE ON SCHEMA public TO service_role;
    GRANT SELECT, INSERT, UPDATE, DELETE ON
      public.organiser_profiles, public.venues, public.events, public.source_runs
      TO service_role;
  END IF;
END
$grants$;

-- Request a PostgREST schema cache refresh after a committed installation.
NOTIFY pgrst, 'reload schema';
COMMIT;
