// Public map reads use the publishable key and preserve database RLS.
export function usesSupabaseCatalogue() {
  return process.env.SUPABASE_CATALOGUE_ENABLED === 'true';
}
export function validCoordinates(lat, lon) {
  return typeof lat === 'number' && typeof lon === 'number' &&
    Number.isFinite(lat) && Number.isFinite(lon) && Math.abs(lat) <= 90 && Math.abs(lon) <= 180;
}
export function safeLink(value) {
  try { const u = new URL(value); return ['https:', 'http:'].includes(u.protocol) ? u.href : null; }
  catch { return null; }
}
export function normaliseCatalogue(payload) {
  const venues = (payload.venues || []).filter(v => !v.is_demo && ['approved', 'published'].includes(v.status)).map(v => ({
    id: v.id, name: v.name, description: v.description || '', area: v.area || v.address || '',
    lat: validCoordinates(v.lat, v.lon) ? v.lat : null,
    lon: validCoordinates(v.lat, v.lon) ? v.lon : null,
    capacity: Number.isFinite(v.capacity) ? v.capacity : null,
    priceGBP: Number.isFinite(v.priceGBP) ? v.priceGBP : null,
    availability: Array.isArray(v.availability) ? v.availability : [],
    amenities: Array.isArray(v.amenities) ? v.amenities : [],
    source: v.source || 'Unspecified', sourceUrl: safeLink(v.source_url),
    status: 'approved', verified: v.verified_status === 'verified',
    coordinateSource: v.coordinate_source || 'Stored place location',
  }));
  const events = (payload.events || []).filter(e => !e.is_demo && ['approved', 'published'].includes(e.status)).map(e => ({
    id: e.id, title: e.title, description: e.description || '', start: e.starts_at,
    end: e.ends_at, location: e.venue_name || e.address || 'Location unspecified',
    source: e.source || 'Unspecified', importedAt: e.source_last_checked || e.updated_at || e.starts_at,
    lat: validCoordinates(e.lat, e.lon) ? e.lat : null,
    lon: validCoordinates(e.lat, e.lon) ? e.lon : null,
    coordinateSource: e.coordinate_source || 'Stored event location',
    url: safeLink(e.url || e.source_url),
  }));
  return { venues, events, storage: 'supabase', fetchedAt: new Date().toISOString() };
}
let cached, expiresAt = 0, inFlight;
export async function readPublicCatalogue() {
  if (cached && Date.now() < expiresAt) return cached;
  if (inFlight) return inFlight;
  inFlight = (async () => {
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) throw Error('Public Supabase configuration missing');
    const response = await fetch(process.env.SUPABASE_URL.replace(/\/$/, '') + '/rest/v1/rpc/gathr_public_catalogue', {
      method: 'POST', headers: { apikey: process.env.SUPABASE_ANON_KEY, 'Content-Type': 'application/json' },
      body: '{}', cache: 'no-store', signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) throw Error('Public Supabase catalogue unavailable');
    const value = normaliseCatalogue(await response.json());
    cached = value; expiresAt = Date.now() + 15000;
    return value;
  })();
  try { return await inFlight; } finally { inFlight = null; }
}
export function mapRecords(venues, events) {
  return [
    ...venues.map(v => ({ ...v, kind: 'venue', label: v.name })),
    ...events.map(e => ({ ...e, kind: 'event', label: e.title })),
  ].filter(r => validCoordinates(r.lat, r.lon));
}
export function groupMapRecords(records) {
  const grouped = new Map();
  for (const record of records) {
    const key = `${record.lat},${record.lon}`;
    if (!grouped.has(key)) grouped.set(key, { lat: record.lat, lon: record.lon, records: [] });
    grouped.get(key).records.push(record);
  }
  return [...grouped.values()];
}
