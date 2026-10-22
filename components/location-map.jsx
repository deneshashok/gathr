'use client';
import { useEffect, useRef, useState } from 'react';
import {venueCostLabel,publicContactLink} from '@/lib/venue-directory.mjs';
import { groupMapRecords, safeLink } from '@/lib/catalogue.mjs';

export default function LocationMap({ records, selected, onSelect }) {
  const element = useRef(null), map = useRef(null), group = useRef(null), markers = useRef(new Map());
  const leaflet = useRef(null), fitted = useRef(false), onSelectRef = useRef(onSelect);
  const [ready, setReady] = useState(false), [provider, setProvider] = useState('Loading map…');
  const [error, setError] = useState('');
  onSelectRef.current = onSelect;
  useEffect(() => {
    let cancelled = false, observer;
    async function init() {
      try {
        const [module, config] = await Promise.all([import('leaflet'), fetch('/api/map-config').then(r => {
          if (!r.ok) throw Error(); return r.json();
        })]);
        if (cancelled) return;
        const L = module.default || module;
        leaflet.current = L;
        const instance = L.map(element.current, { scrollWheelZoom: false }).setView([51.5074, -0.1278], 11);
        map.current = instance;
        L.tileLayer(config.tileUrl, {
          attribution: config.attribution, maxNativeZoom: config.maxNativeZoom, maxZoom: 20,
          className: config.greyscale ? 'greyscale-tiles' : '',
        }).on('tileerror', () => { if (!cancelled) setError('Map tiles could not load. The location list is still available.'); }).addTo(instance);
        group.current = L.featureGroup().addTo(instance);
        observer = new ResizeObserver(() => instance.invalidateSize());
        observer.observe(element.current);
        setProvider(config.provider); setReady(true);
      } catch { if (!cancelled) setError('The map could not load. You can still browse the location list.'); }
    }
    init();
    return () => {
      cancelled = true; observer?.disconnect(); map.current?.remove(); map.current = null;
      group.current = null; markers.current.clear(); fitted.current = false;
    };
  }, []);
  useEffect(() => {
    if (!ready || !group.current) return;
    const L = leaflet.current;
    group.current.clearLayers(); markers.current.clear();
    for (const place of groupMapRecords(records)) {
      const hasVenue = place.records.some(r => r.kind === 'venue');
      const marker = L.circleMarker([place.lat, place.lon], {
        radius: place.records.length > 1 ? 10 : 7, color: '#fff', weight: 2,
        fillColor: hasVenue ? '#303f50' : '#477448', fillOpacity: .92,
      });
      // Untrusted record text is added through textContent, never interpolated as HTML.
      const popup = document.createElement('div'); popup.className = 'map-popup';
      const heading = document.createElement('strong');
      heading.textContent = place.records.length > 1 ? `${place.records.length} records at this location` : place.records[0].label;
      popup.append(heading);
      const list = document.createElement('div'); list.className = 'map-popup-list';
      for (const record of place.records) {
        const item = document.createElement('div'); item.className = 'map-popup-record';
        const button = document.createElement('button'); button.type = 'button'; button.textContent = record.label;
        button.addEventListener('click', () => onSelectRef.current?.(record)); item.append(button);
        const detail = document.createElement('p');
        detail.textContent = (record.isListingLead ? 'Unverified venue lead · ' : '') + `${record.kind === 'event' ? 'Event' : 'Venue'} · ${record.source}` +
          (record.start ? ' · ' + new Date(record.start).toLocaleDateString('en-GB', { timeZone: 'Europe/London' }) : '');
        item.append(detail);
        if (record.kind === 'venue') {
          const price = document.createElement('p'); price.textContent = venueCostLabel(record); item.append(price);
          const contactUrl = publicContactLink(record.contactUrl || record.bookingUrl || record.websiteUrl);
          if (contactUrl) { const contact = document.createElement('a'); contact.href = contactUrl; contact.target = '_blank'; contact.rel = 'noopener noreferrer'; contact.textContent = 'Contact / venue details ↗'; item.append(contact); }
        }
        const coordinateNote = document.createElement('small'); coordinateNote.textContent = record.coordinateSource; item.append(coordinateNote);
        const link = safeLink(record.url || record.sourceUrl);
        if (link) { const a = document.createElement('a'); a.href = link; a.target = '_blank'; a.rel = 'noopener noreferrer'; a.textContent = 'Original record ↗'; item.append(a); }
        list.append(item); markers.current.set(`${record.kind}:${record.id}`, marker);
      }
      popup.append(list); marker.bindPopup(popup, { maxWidth: 330 });
      marker.on('click', () => onSelectRef.current?.(place.records[0])); marker.addTo(group.current);
    }
    if (records.length && !fitted.current) {
      map.current.fitBounds(group.current.getBounds(), { padding: [35, 35], maxZoom: 13 }); fitted.current = true;
    }
  }, [records, ready]);
  useEffect(() => {
    if (!ready || !selected) return;
    const marker = markers.current.get(`${selected.kind}:${selected.id}`);
    if (marker) { map.current.setView([selected.lat, selected.lon], 15); marker.openPopup(); }
  }, [selected, ready]);
  return <div className="location-map-shell">
    <div ref={element} className="location-map" aria-label="Map of venue leads and published community events" />
    <span className="map-provider">{provider}</span>
    {error && <div role="status" className="map-error">{error}</div>}
  </div>;
}
