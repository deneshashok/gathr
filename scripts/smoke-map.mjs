import assert from 'node:assert/strict';
import ical from 'node-ical';
import { mapRecords } from '../lib/catalogue.mjs';
const base = process.env.GATHR_BASE_URL || 'http://127.0.0.1:3000';
async function json(path) {
  const response = await fetch(base + path);
  assert.equal(response.status, 200, path + ' should be available');
  return response.json();
}
const [venues, events, config, sources] = await Promise.all([
  json('/api/venues'), json('/api/events'), json('/api/map-config'), json('/api/sources'),
]);
assert.equal(venues.storage, 'supabase'); assert.equal(events.storage, 'supabase');
assert.ok(events.events.length > 0, 'Requires existing published remote events');
assert.ok(venues.venues.every(v => (v.status === 'approved' || v.isListingLead) && v.source !== 'demo'));
for (const record of [...venues.venues, ...events.events]) {
  assert.equal(record.created_by, undefined); assert.equal(record.data, undefined);
}
assert.equal(config.greyscale, !process.env.CARTO_BASEMAP_KEY);
assert.ok(config.attribution.includes('OpenStreetMap'));
if (!process.env.CARTO_BASEMAP_KEY) assert.equal(config.tileUrl, 'https://tile.openstreetmap.org/{z}/{x}/{y}.png');
assert.ok(sources.sources.every(s => s.status === 'stored records'));
const badQuery = await fetch(base + '/api/venues?lat=99&lon=0'); assert.equal(badQuery.status, 400);
const response = await fetch(base + '/api/calendar'); assert.equal(response.status, 200);
const calendarEntries = Object.values(ical.sync.parseICS(await response.text())).filter(e => e.type === 'VEVENT');
assert.ok(calendarEntries.length > 0);
console.log(JSON.stringify({
  result: 'PASS: live Supabase API, labelled venue leads and publication filters, public field projection, coordinate filtering, basemap config, source reporting, calendar parse',
  venueOptions: venues.venues.length, publishedEvents: events.events.length,
  recordsWithCoordinates: mapRecords(venues.venues, events.events).length,
  calendarEntries: calendarEntries.length, provider: config.provider,
}, null, 2));
