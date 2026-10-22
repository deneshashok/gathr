'use client';
import dynamic from 'next/dynamic';
import { useMemo, useState } from 'react';
import { mapRecords, validCoordinates } from '@/lib/catalogue.mjs';
const LocationMap = dynamic(() => import('./location-map'), { ssr: false, loading: () => <div className="map-loading">Loading map…</div> });
export default function MapExplorer({ venues, events, loading, error }) {
  const [layer, setLayer] = useState('all'), [query, setQuery] = useState(''), [selected, setSelected] = useState(null);
  const [dateFilter, setDateFilter] = useState('all');
  const all = useMemo(() => mapRecords(venues, events), [venues, events]);
  const records = useMemo(() => all.filter(r => layer === 'all' || r.kind === layer)
    .filter(r => !query || `${r.label} ${r.area || ''} ${r.location || ''} ${r.source}`.toLowerCase().includes(query.toLowerCase()))
    .filter(r => dateFilter === 'all' || r.kind !== 'event' || (r.start && Date.parse(r.end || r.start) >= Date.now())), [all, layer, query, dateFilter]);
  const missing = [...venues, ...events].filter(r => !validCoordinates(r.lat, r.lon)).length;
  return <div className="map-explorer">
    <div className="map-toolbar"><div className="map-tabs" aria-label="Map layers">{[['all', 'All locations'], ['venue', 'Venues'], ['event', 'Events']].map(([value, label]) => <button key={value} aria-pressed={layer === value} onClick={() => { setLayer(value); setSelected(null); }}>{label}</button>)}</div>
      <label className="map-date-filter">Event dates<select value={dateFilter} onChange={e => setDateFilter(e.target.value)}><option value="all">All dates, including past events</option><option value="upcoming">Upcoming events</option></select></label>
    </div>
    <p className="muted map-summary" role="status">{loading ? 'Reading published records from Supabase…' : `${venues.length} published venues · ${events.length} published events · ${records.length} records on this map`}{missing > 0 && ` · ${missing} without coordinates remain in the event/list views`}</p>
    {error && <div className="feedback" role="alert">{error} The map will not substitute sample data.</div>}
    <div className="map-layout"><aside className="map-sidebar"><label>Find a location<input value={query} onChange={e => setQuery(e.target.value)} placeholder="Event, venue, area or source" type="search" /></label>
      <p className="map-legend"><span>● Venues</span><span>● Events</span></p>
      {!loading && !records.length && <p className="empty">No published locations match. Pending venues stay private until reviewed.</p>}
      <div className="map-records">{records.map(r => <button key={`${r.kind}:${r.id}`} className={'map-record ' + (selected?.id === r.id && selected?.kind === r.kind ? 'selected' : '')} onClick={() => setSelected(r)}>
        <span className="eyebrow">{r.kind} · {r.source}</span><strong>{r.label}</strong><span>{r.area || r.location}</span>
        {r.start && <small>{new Date(r.start).toLocaleDateString('en-GB', { timeZone: 'Europe/London' })}{Date.parse(r.end || r.start) < Date.now() ? ' · Past event' : ''}</small>}
      </button>)}</div>
    </aside><LocationMap records={records} selected={selected} onSelect={setSelected} /></div>
    <p className="muted">Pins use stored coordinates; they are not proof of availability or an exact entrance. Overlapping records share a pin. The basemap provider is labelled on the map.</p>
  </div>;
}
