export function distanceKm(a,b,c,d){const r=Math.PI/180;const x=Math.sin((c-a)*r/2)**2+Math.cos(a*r)*Math.cos(c*r)*Math.sin((d-b)*r/2)**2;return 6371*2*Math.atan2(Math.sqrt(x),Math.sqrt(1-x));}
export function searchVenues(venues,query={}) {
 const {q='',budget,capacity,date,lat,lon,radius=10}=query;
 return venues.filter(v=>v.status==='approved').filter(v=>!q||`${v.name} ${v.area}`.toLowerCase().includes(q.toLowerCase()))
 .filter(v=>budget===undefined||budget===''||(v.priceGBP!==null&&v.priceGBP<=Number(budget)))
 .filter(v=>!capacity||(v.capacity!==null&&v.capacity>=Number(capacity)))
 .filter(v=>!date||(v.availability||[]).includes(date))
 .filter(v=>lat==null||lon==null||distanceKm(Number(lat),Number(lon),v.lat,v.lon)<=Number(radius));
}
export function escapeICS(s){return String(s).replace(/\\/g,'\\\\').replace(/\r?\n/g,'\\n').replace(/;/g,'\\;').replace(/,/g,'\\,');}
function fold(s){let lines=[],line=''; for(const c of s){if(Buffer.byteLength(line+c)>74){lines.push(line);line=' '+c;}else line+=c;}return [...lines,line].join('\r\n');}
export function calendar(events){const dt=s=>new Date(s).toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,'');return ['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//GATHR//Community Calendar//EN',...events.flatMap(e=>['BEGIN:VEVENT',`UID:${escapeICS(e.id)}@gathr.local`,`DTSTAMP:${dt(e.importedAt||e.start)}`,`DTSTART:${dt(e.start)}`,`DTEND:${dt(e.end)}`,`SUMMARY:${escapeICS(e.title)}`,`LOCATION:${escapeICS(e.location||'Unspecified')}`,`DESCRIPTION:${escapeICS('Source: '+e.source+'; '+(e.url||''))}`,'END:VEVENT']),'END:VCALENDAR'].map(fold).join('\r\n')+'\r\n';}
export function publicStatus(config,run){if(run?.ok)return 'live';if(run&&!run.ok)return 'error';return config?'configured / untested':'not configured';}
export function eventCatalog(events){const seen=new Map();for(const e of events){const key=(e.url||e.id)+'|'+e.start;const existing=seen.get(key);if(existing){existing.sources=[...new Set([...existing.sources,e.source])];}else seen.set(key,{...e,sources:[e.source]});}return [...seen.values()].sort((a,b)=>Date.parse(a.start)-Date.parse(b.start));}
