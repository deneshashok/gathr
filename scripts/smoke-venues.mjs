import assert from 'node:assert/strict';
const base=process.env.GATHR_BASE_URL||'http://127.0.0.1:3000';
const get=async path=>{const r=await fetch(base+path);assert.equal(r.status,200);return r.json();};
const all=await get('/api/venues');assert.equal(all.storage,'supabase');assert.ok(all.venues.length>0);
for(const v of all.venues){assert.ok(v.status==='approved'||v.isListingLead);assert.notEqual(v.source,'demo');assert.equal(v.created_by,undefined);assert.equal(v.data,undefined);assert.equal(v.private_contacts,undefined);assert.ok(v.priceNotes);}
const contacts=await get('/api/venues?contact=true');assert.ok(contacts.venues.length>0);assert.ok(contacts.venues.every(v=>v.contactUrl||v.websiteUrl||v.bookingUrl));
const paid=await get('/api/venues?costType=paid');assert.ok(paid.venues.length>0);assert.ok(paid.venues.every(v=>v.costType==='paid'));
const alpha=await get('/api/venues?q=Alphabeta');assert.ok(alpha.venues.some(v=>v.priceNotes.includes('£950')&&v.contactUrl));
const budget=await get('/api/venues?budget=1000');assert.ok(budget.venues.every(v=>v.priceGBP!==null&&v.priceGBP<=1000));
// Calling the restricted projection as a public client must fail.
const denied=await fetch(process.env.SUPABASE_URL+'/rest/v1/rpc/gathr_venue_directory',{method:'POST',headers:{apikey:process.env.SUPABASE_ANON_KEY,'Content-Type':'application/json'},body:'{}'});assert.ok([401,403].includes(denied.status));
console.log(JSON.stringify({result:'PASS: live venue directory, retained review status, pricing notes, contact/cost/search filters, private-field exclusion and public RPC denial',venues:all.venues.length,withPublicContactOrWebsite:contacts.venues.length,paidOptions:paid.venues.length,numericBudgetMatches:budget.venues.length},null,2));
