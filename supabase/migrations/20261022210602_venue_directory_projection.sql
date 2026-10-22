-- Server-only projection for imported public venue leads. Does not approve records.
CREATE OR REPLACE FUNCTION public.gathr_venue_directory()
RETURNS jsonb
LANGUAGE sql STABLE SECURITY INVOKER SET search_path = ''
AS $function$
  SELECT coalesce(jsonb_agg(row_to_json(v)), '[]'::jsonb)
  FROM (
    SELECT id,name,description,area,borough,address,postcode,capacity,amenities,status,
      verified_status,is_demo,source,source_url,website_url,booking_url,public_contact_url,
      cost_type,price_notes,source_last_checked,
      extensions.st_y(location::extensions.geometry) AS lat,
      extensions.st_x(location::extensions.geometry) AS lon,
      CASE WHEN status IN ('approved','published') THEN 'approved' ELSE 'imported_lead' END AS listing_kind,
      CASE WHEN jsonb_typeof(data->'priceGBP')='number' THEN (data->>'priceGBP')::numeric ELSE NULL END AS "priceGBP",
      CASE WHEN jsonb_typeof(data->'availability')='array' THEN data->'availability' ELSE '[]'::jsonb END AS availability
    FROM public.venues
    WHERE is_demo IS NOT TRUE
      AND upper(coalesce(source,'')) <> 'DEMO DATA'
      AND name NOT ILIKE '%(DEMO)%'
      AND (
        status IN ('approved','published') OR (
          status='pending' AND created_by IS NULL AND (
            (source='luma' AND source_url ~* '^https://([a-z0-9-]+\.)?(luma\.com|lu\.ma)(/|$)') OR
            (source='devpost' AND source_url ~* '^https://([a-z0-9-]+\.)?devpost\.com(/|$)') OR
            (source='meetup' AND source_url ~* '^https://([a-z0-9-]+\.)?meetup\.com(/|$)')
          )
        )
      )
    ORDER BY name,id
  ) v;
$function$;
REVOKE ALL ON FUNCTION public.gathr_venue_directory() FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.gathr_venue_directory() TO service_role;
COMMENT ON FUNCTION public.gathr_venue_directory() IS
  'Trusted server projection of public imported venue leads plus approved venues. No private contacts/owner IDs, no approval mutations.';
NOTIFY pgrst,'reload schema';
