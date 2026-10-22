-- A read-only projection of the current normalised GATHR schema.
-- Uses the caller's permissions/RLS. No secret key or owner identifiers needed.
CREATE OR REPLACE FUNCTION public.gathr_public_catalogue()
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = ''
AS $function$
  SELECT jsonb_build_object(
    'venues', coalesce((
      SELECT jsonb_agg(row_to_json(v)) FROM (
        SELECT id, name, description, area, address, capacity, amenities, status,
          is_demo, source, source_url, verified_status,
          extensions.st_y(location::extensions.geometry) AS lat,
          extensions.st_x(location::extensions.geometry) AS lon,
          CASE WHEN jsonb_typeof(data->'priceGBP')='number'
            THEN (data->>'priceGBP')::numeric ELSE NULL END AS "priceGBP",
          CASE WHEN jsonb_typeof(data->'availability')='array'
            THEN data->'availability' ELSE '[]'::jsonb END AS availability,
          'Stored place location'::text AS coordinate_source
        FROM public.venues
        WHERE status IN ('approved', 'published')
          AND is_demo IS NOT TRUE
          AND upper(coalesce(source,'')) <> 'DEMO DATA'
          AND name NOT ILIKE '%(DEMO)%'
        ORDER BY name, id
      ) v
    ), '[]'::jsonb),
    'events', coalesce((
      SELECT jsonb_agg(row_to_json(e)) FROM (
        SELECT id, title, description, starts_at, ends_at, venue_name, address,
          status, is_demo, source, source_url, url, source_last_checked, updated_at,
          extensions.st_y(location::extensions.geometry) AS lat,
          extensions.st_x(location::extensions.geometry) AS lon,
          'Stored event location'::text AS coordinate_source
        FROM public.events
        WHERE status IN ('approved', 'published')
          AND is_demo IS NOT TRUE
          AND upper(coalesce(source,'')) <> 'DEMO DATA'
          AND title NOT ILIKE '%(DEMO)%'
        ORDER BY starts_at, id
      ) e
    ), '[]'::jsonb)
  );
$function$;
REVOKE ALL ON FUNCTION public.gathr_public_catalogue() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.gathr_public_catalogue() TO anon, authenticated, service_role;
COMMENT ON FUNCTION public.gathr_public_catalogue() IS
  'Public map projection with explicit publication/demo filters and invoker RLS; no private contacts or owner IDs.';
NOTIFY pgrst, 'reload schema';
