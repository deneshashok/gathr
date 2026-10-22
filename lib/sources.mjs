export const sources=[
{id:'luma-discover',name:'Luma Discover',kind:'event',mode:'jsonld',env:'LUMA_DISCOVER_URL',note:'Opt-in public JSON-LD only; no undocumented discovery API. May return no structured events.'},
{id:'luma-event',name:'Luma event',kind:'event',mode:'jsonld',env:'LUMA_EVENT_URL',note:'Public Event JSON-LD when present. No access to private events.'},
{id:'luma-ics',name:'Luma calendar / ICS',kind:'event',mode:'ics',env:'LUMA_ICS_URL',note:'Calendar owner supplies an authorised ICS feed.'},
...['devpost','builderbase','meetup','mlh','dev-events','hack-radar','hack-collective'].map(id=>({id,name:({'dev-events':'dev.events','hack-radar':'Hack Radar','hack-collective':'Hack Collective'})[id]||id,kind:'event',mode:'ics-or-jsonld',env:id.toUpperCase().replaceAll('-','_')+'_URL',note:'Requires an authorised public ICS feed or Event JSON-LD page; not a site-specific API crawler.'})),
{id:'osm',name:'OpenStreetMap',kind:'venue',mode:'overpass',env:'OSM_ENABLED',note:'London community centres, libraries and coworking spaces; ODbL attribution. No inferred capacity, price or availability.'},
{id:'overture',name:'Overture Maps',kind:'venue',mode:'geojson',env:'OVERTURE_GEOJSON_PATH',note:'Import a downloaded Places GeoJSON extract; preserve feature IDs, release and source licences.'},
{id:'tfl',name:'Transport for London',kind:'transit',env:'TFL_ENABLED',note:'Nearby StopPoints; no inferred walking times or live venue availability.'},
{id:'cognee',name:'Cognee',kind:'knowledge',env:'COGNEE_URL',note:'Explicit authenticated search via /api/v1/search; no automatic upload.'},
{id:'grok',name:'Grok / xAI',kind:'assistant',env:'XAI_API_KEY',note:'Grounded chat over approved GATHR records. Not a web crawler or venue booking bot.'},
{id:'discord',name:'Discord',kind:'community',env:'DISCORD_WEBHOOK_URL',note:'Admin-triggered event digest only; no messages sent during setup.'},
{id:'zero',name:'Zero CRM (optional)',kind:'optional',env:null,note:'Not implemented: no confirmed partner API or credentials supplied.'},
{id:'notion',name:'Notion (optional)',kind:'optional',env:null,note:'Not implemented: no workspace or database supplied.'}
];
export function configured(s){return !!(s.env&&process.env[s.env]&&(s.env!=='OSM_ENABLED'&&s.env!=='TFL_ENABLED'||process.env[s.env]==='true'));}
export function statuses(state){return sources.map(s=>({id:s.id,name:s.name,kind:s.kind,note:s.note,status:state.runs[s.id]?.ok?'live':state.runs[s.id]?'error':configured(s)?'configured / untested':'not configured',count:state.runs[s.id]?.count??0,lastRun:state.runs[s.id]?.at??null}));}
