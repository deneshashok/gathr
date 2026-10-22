import assert from 'node:assert/strict';import fs from 'node:fs/promises';import {calendar} from '../lib/domain.mjs';import ical from 'node-ical';
const base=process.env.GATHR_BASE_URL||'http://127.0.0.1:3000';
async function call(path,options){const r=await fetch(base+path,options);return {status:r.status,data:await r.json()};}
const backup=await fs.readFile('data/state.json','utf8');
try{
assert.equal((await call('/api/venues')).status,200);
assert.equal((await call('/api/review')).status,401);
assert.equal((await call('/api/contributions',{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'})).status,401);
assert.equal((await call('/api/venues?budget=bad')).status,400);
const headers={'Content-Type':'application/json',Authorization:'Bearer '+process.env.ADMIN_TOKEN};
const venue={name:'TEST FIXTURE — not a real venue',area:'Test',description:'Temporary automated test',lat:51.5,lon:-.1,capacity:25,priceGBP:0,availability:['2026-11-12']};
const submitted=await call('/api/contributions',{method:'POST',headers,body:JSON.stringify(venue)});assert.equal(submitted.status,201);const id=submitted.data.id;
assert.ok(!(await call('/api/venues')).data.venues.some(v=>v.id===id));
assert.ok((await call('/api/review',{headers})).data.venues.some(v=>v.id===id));
assert.equal((await call('/api/review',{method:'POST',headers,body:JSON.stringify({id,action:'approve'})})).status,200);
assert.ok((await call('/api/venues?budget=0')).data.venues.some(v=>v.id===id&&v.verified));
const feed=await fetch(base+'/api/calendar');assert.equal(feed.headers.get('content-type'),'text/calendar; charset=utf-8');const entries=Object.values(ical.sync.parseICS(await feed.text())).filter(e=>e.type==='VEVENT');assert.ok(entries.length>0);
const statuses=(await call('/api/sources')).data.sources;assert.ok(statuses.some(s=>s.id==='luma-discover'&&s.status==='live'));
console.log('PASS: HTTP search, invalid filters, authentication, pending isolation, operator approval, free venue filter, real-event calendar parsing, source reporting.');console.log('Calendar entries: '+entries.length);
}finally{await fs.writeFile('data/state.json',backup);console.log('Temporary test contribution removed; original data restored.');}
