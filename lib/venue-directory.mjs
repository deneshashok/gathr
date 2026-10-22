import {safeLink, validCoordinates} from './catalogue.mjs';
import {distanceKm} from './domain.mjs';
export function publicContactLink(value) {
  const web=safeLink(value); if(web)return web;
  if(typeof value!=='string')return null;
  if(/^mailto:[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9.-]+\.[a-z]{2,}$/i.test(value))return value;
  if(/^tel:\+?[0-9 ()-]{5,25}$/i.test(value))return value;
  return null;
}
export function publicImportedLead(row) {
  if(row.status!=='pending'||row.listing_kind!=='imported_lead'||row.created_by!=null)return false;
  try {
    const url=new URL(row.source_url);
    const domains={luma:['luma.com','lu.ma'],devpost:['devpost.com'],meetup:['meetup.com']}[row.source]||[];
    return url.protocol==='https:'&&domains.some(d=>url.hostname===d||url.hostname.endsWith('.'+d));
  }catch{return false;}
}
export function normaliseVenueDirectory(rows) {
  return rows.filter(v=>!v.is_demo&&!/\(demo\)/i.test(v.name||'')&&!/^demo data$/i.test(v.source||''))
    .filter(v=>['approved','published'].includes(v.status)||publicImportedLead(v))
    .map(v=>({
      id:v.id,name:v.name,description:v.description||'',area:v.area||v.borough||'',address:v.address||'',postcode:v.postcode||'',
      lat:validCoordinates(v.lat,v.lon)?v.lat:null,lon:validCoordinates(v.lat,v.lon)?v.lon:null,
      status:v.status,isListingLead:v.status==='pending',verified:v.verified_status==='verified'&&v.status!=='pending',
      capacity:Number.isFinite(v.capacity)?v.capacity:null,priceGBP:Number.isFinite(v.priceGBP)&&v.priceGBP>=0?v.priceGBP:null,
      priceNotes:v.price_notes||'',costType:v.cost_type||'unknown',
      availability:Array.isArray(v.availability)?v.availability:[],amenities:Array.isArray(v.amenities)?v.amenities:[],
      source:v.source||'Unspecified',sourceUrl:safeLink(v.source_url),websiteUrl:safeLink(v.website_url),
      bookingUrl:safeLink(v.booking_url),contactUrl:publicContactLink(v.public_contact_url),lastChecked:v.source_last_checked||null,
      coordinateSource:'Imported venue lead · stored location',
    }));
}
export function hasVenueContact(v){return Boolean(v.contactUrl||v.bookingUrl||v.websiteUrl);}
export function searchVenueDirectory(venues,q={}) {
  return venues.filter(v=>!q.q||`${v.name} ${v.area} ${v.address} ${v.postcode}`.toLowerCase().includes(q.q.toLowerCase()))
    .filter(v=>!q.costType||v.costType===q.costType)
    .filter(v=>q.contact!=='true'||hasVenueContact(v))
    .filter(v=>q.budget===undefined||q.budget===''||(v.priceGBP!==null&&v.priceGBP<=Number(q.budget)))
    .filter(v=>!q.capacity||(v.capacity!==null&&v.capacity>=Number(q.capacity)))
    .filter(v=>!q.date||v.availability.includes(q.date))
    .filter(v=>q.lat===undefined||q.lon===undefined||validCoordinates(v.lat,v.lon)&&distanceKm(Number(q.lat),Number(q.lon),v.lat,v.lon)<=Number(q.radius||10))
    .sort((a,b)=>Number(hasVenueContact(b))-Number(hasVenueContact(a))||a.name.localeCompare(b.name));
}
export function venueCostLabel(v) {
  if(v.priceGBP!==null)return `Recorded price: £${v.priceGBP.toLocaleString('en-GB')}`;
  return ({paid:'Paid hire · see pricing notes',free:'Listed as free · confirm terms',sponsored:'Sponsor or host arrangement',discounted:'Discount may be available'})[v.costType]||'Price not confirmed';
}
export function venuePricing(v){return (v.priceNotes||'No rate published in this record. Request a quote before planning your budget.').split(/\bSources?:\s*/i)[0].trim();}
