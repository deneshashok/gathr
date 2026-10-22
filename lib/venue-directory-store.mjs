// Import only in server routes. The service key is never sent to the browser.
import {normaliseVenueDirectory} from './venue-directory.mjs';
let cached,expiresAt=0,inFlight;
export async function readVenueDirectory() {
  if(cached&&Date.now()<expiresAt)return cached;
  if(inFlight)return inFlight;
  inFlight=(async()=>{
    if(!process.env.SUPABASE_URL||!process.env.SUPABASE_SECRET_KEY)throw Error('Venue directory server configuration missing');
    const r=await fetch(process.env.SUPABASE_URL.replace(/\/$/,'')+'/rest/v1/rpc/gathr_venue_directory',{
      method:'POST',headers:{apikey:process.env.SUPABASE_SECRET_KEY,'Content-Type':'application/json'},body:'{}',
      cache:'no-store',signal:AbortSignal.timeout(15000),
    });
    if(!r.ok)throw Error('Venue directory unavailable');
    const venues=normaliseVenueDirectory(await r.json());cached=venues;expiresAt=Date.now()+15000;return venues;
  })();
  try{return await inFlight;}finally{inFlight=null;}
}
