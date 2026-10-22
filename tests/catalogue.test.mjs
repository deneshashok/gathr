import test from 'node:test';
import assert from 'node:assert/strict';
import { normaliseCatalogue, validCoordinates, mapRecords, groupMapRecords, safeLink } from '../lib/catalogue.mjs';

test('catalogue excludes demo and unpublished records without treating null coordinates as zero', () => {
  const c = normaliseCatalogue({
    venues: [{id:'pending',name:'Private',status:'pending',lat:51,lon:0}, {id:'demo',name:'Demo',status:'approved',is_demo:true}],
    events: [
      {id:'a',title:'Visible',status:'published',lat:51.5,lon:-.1,source:'luma'},
      {id:'b',title:'Unknown location',status:'published',lat:null,lon:null},
      {id:'c',title:'Draft',status:'draft',lat:51.5,lon:-.1},
    ],
  });
  assert.equal(c.venues.length, 0); assert.equal(c.events.length, 2);
  assert.equal(mapRecords(c.venues,c.events).length, 1);
  assert.equal(c.events[1].lat, null);
  for (const pair of [[null,null],['51','0'],[91,0],[0,181],[NaN,0]]) assert.equal(validCoordinates(...pair),false);
  assert.equal(validCoordinates(0,0),true);
});
test('approved venues keep unknown commercial facts and only verified status gives verification', () => {
  const [v] = normaliseCatalogue({venues:[{id:'a',name:'Place',status:'approved',verified_status:'unverified',lat:51.5,lon:0,amenities:null}]}).venues;
  assert.equal(v.priceGBP,null); assert.equal(v.capacity,null); assert.equal(v.verified,false);
  assert.deepEqual(v.availability,[]); assert.deepEqual(v.amenities,[]);
});
test('co-located records are grouped without moving or losing their coordinates', () => {
  const records=[{id:'1',lat:51.5,lon:-.1},{id:'2',lat:51.5,lon:-.1},{id:'3',lat:51.51,lon:-.1}];
  const grouped=groupMapRecords(records);assert.equal(grouped.length,2);assert.equal(grouped[0].records.length,2);
  assert.equal(grouped[0].lat,51.5);assert.equal(grouped[0].lon,-.1);
});
test('catalogue strips private fields and unsafe browser links', () => {
  const [e]=normaliseCatalogue({events:[{id:'a',title:'Test',status:'published',created_by:'private-user-id',data:{secret:'private'},url:'javascript:alert(1)'}]}).events;
  assert.equal(e.url,null);assert.equal(e.created_by,undefined);assert.equal(e.data,undefined);
  assert.equal(safeLink('https://example.com/event'),'https://example.com/event');
});
test('remote reads use publishable key, coalesce concurrent requests and cache briefly', async () => {
  const oldFetch=globalThis.fetch,oldUrl=process.env.SUPABASE_URL,oldKey=process.env.SUPABASE_ANON_KEY;
  process.env.SUPABASE_URL='https://example.supabase.co';process.env.SUPABASE_ANON_KEY='publishable-test-key';let calls=0;
  globalThis.fetch=async (url,options)=>{calls++;assert.ok(url.endsWith('/rpc/gathr_public_catalogue'));assert.equal(options.headers.apikey,'publishable-test-key');assert.equal(options.headers.Authorization,undefined);return Response.json({events:[],venues:[]});};
  try {const {readPublicCatalogue}=await import('../lib/catalogue.mjs?cache-test');await Promise.all([readPublicCatalogue(),readPublicCatalogue()]);await readPublicCatalogue();assert.equal(calls,1);}
  finally {globalThis.fetch=oldFetch;for(const [k,v] of [['SUPABASE_URL',oldUrl],['SUPABASE_ANON_KEY',oldKey]]){if(v===undefined)delete process.env[k];else process.env[k]=v;}}
});
test('remote failure never substitutes local fixtures', async () => {
  const old=globalThis.fetch,oldUrl=process.env.SUPABASE_URL,oldKey=process.env.SUPABASE_ANON_KEY;
  process.env.SUPABASE_URL='https://example.supabase.co';process.env.SUPABASE_ANON_KEY='publishable-test-key';globalThis.fetch=async()=>new Response('',{status:503});
  try {const {readPublicCatalogue}=await import('../lib/catalogue.mjs?failure-test');await assert.rejects(readPublicCatalogue(),/unavailable/);}
  finally {globalThis.fetch=old;for(const [k,v] of [['SUPABASE_URL',oldUrl],['SUPABASE_ANON_KEY',oldKey]]){if(v===undefined)delete process.env[k];else process.env[k]=v;}}
});
