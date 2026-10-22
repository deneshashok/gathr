import {readPublicCatalogue,usesSupabaseCatalogue} from '@/lib/catalogue.mjs';
import {readState} from '@/lib/store.mjs';import {statuses} from '@/lib/sources.mjs';
export const dynamic='force-dynamic';
export async function GET(){try{
 if(usesSupabaseCatalogue()){
  const catalogue=await readPublicCatalogue();const counts=new Map();
  for(const record of [...catalogue.venues,...catalogue.events])counts.set(record.source,(counts.get(record.source)||0)+1);
  return Response.json({sources:[...counts].map(([source,count])=>({id:source,name:source,status:'stored records',count,note:'Published records stored in Supabase. This does not verify a currently running import job.',lastRun:null}))});
 }
 return Response.json({sources:statuses(await readState())});
}catch{return Response.json({error:'Storage unavailable'},{status:503});}}
