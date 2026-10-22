'use client';
import {useMemo,useState} from 'react';
import {Button} from '@/components/ui/button';
import {hasVenueContact,searchVenueDirectory,venueCostLabel,venuePricing} from '@/lib/venue-directory.mjs';
import {validCoordinates} from '@/lib/catalogue.mjs';
export default function VenueDirectory({venues,loading,error,onShowMap}) {
  const [query,setQuery]=useState(''),[costType,setCostType]=useState(''),[contact,setContact]=useState(false),[capacity,setCapacity]=useState(''),[budget,setBudget]=useState('');
  const filtered=useMemo(()=>searchVenueDirectory(venues,{q:query,costType,contact:String(contact),capacity,budget}),[venues,query,costType,contact,capacity,budget]);
  const availableContacts=venues.filter(hasVenueContact).length;
  return <div className="venue-directory">
    <p className="directory-intro">Explore spaces used by real communities. Imported leads are not verified hire offers. Check the price, booking terms and availability directly with the venue.</p>
    <div className="directory-stats"><span><b>{venues.length}</b> venue options</span><span><b>{availableContacts}</b> with a public contact, website or booking link</span></div>
    <form className="search directory-search" onSubmit={e=>e.preventDefault()}>
      <label>Venue or neighbourhood<input value={query} onChange={e=>setQuery(e.target.value)} type="search" placeholder="Name, area, address or postcode"/></label>
      <label>Cost type<select value={costType} onChange={e=>setCostType(e.target.value)}><option value="">All cost types</option><option value="paid">Paid hire</option><option value="free">Listed as free</option><option value="sponsored">Sponsor / host arrangement</option><option value="discounted">Discount available</option><option value="unknown">Price unknown</option></select></label>
      <label>Minimum capacity<input type="number" min="1" value={capacity} onChange={e=>setCapacity(e.target.value)} placeholder="Any size"/></label>
      <label className="directory-checkbox"><input type="checkbox" checked={contact} onChange={e=>setContact(e.target.checked)}/>Has a public contact or website</label>
      <details><summary>Exact numeric budget filter</summary><label>Maximum recorded price (£)<input type="number" min="0" value={budget} onChange={e=>setBudget(e.target.value)} placeholder="Any budget"/></label><p className="muted">This filter uses numeric price records only. Textual rate cards, minimum spend and quote-only options are excluded because they cannot be compared as a single booking price.</p></details>
    </form>
    {error&&<div className="feedback" role="alert">{error}</div>}
    <p className="muted" role="status">{loading?'Loading venue details…':`${filtered.length} matching venue options · prices are indicative and may be out of date`}</p>
    <div className="cards directory-cards">{filtered.map(v=><article className="venue directory-card" key={v.id}>
      <div className="directory-card-heading"><span className="status">{v.verified?'Reviewed venue':v.isListingLead?'Imported lead · unverified':'Details unverified'}</span><small>{v.source}</small></div>
      <div className="venue-body"><h3>{v.name}</h3><p className="venue-address">{[v.area,v.address,v.postcode].filter((x,i,a)=>x&&a.indexOf(x)===i).join(' · ')||'Address not recorded'}</p>
        <div className="directory-price"><strong>{venueCostLabel(v)}</strong><p>{venuePricing(v)}</p></div>
        <div className="directory-facts"><span>Capacity: <b>{v.capacity??'Not confirmed'}</b></span><span>Availability: ask venue</span></div>
        <div className="directory-contact"><h4>Contact & booking</h4>
          {v.contactUrl&&<p className="public-contact-detail">Public contact: {v.contactUrl.replace(/^https?:\/\//,'').replace(/^mailto:/,'').replace(/^tel:/,'')}</p>}{v.contactUrl&&<Button asChild><a href={v.contactUrl} target="_blank" rel="noopener noreferrer">Contact venue ↗</a></Button>}
          {v.bookingUrl&&v.bookingUrl!==v.contactUrl&&<Button variant="outline" asChild><a href={v.bookingUrl} target="_blank" rel="noopener noreferrer">Booking / hire details ↗</a></Button>}
          {v.websiteUrl&&v.websiteUrl!==v.bookingUrl&&v.websiteUrl!==v.contactUrl&&<a className="directory-link" href={v.websiteUrl} target="_blank" rel="noopener noreferrer">Venue website ↗</a>}
          {!hasVenueContact(v)&&<p>No public venue contact found. This may be an office or event address rather than a space available for hire.</p>}
          {v.sourceUrl&&<a className="directory-link" href={v.sourceUrl} target="_blank" rel="noopener noreferrer">{hasVenueContact(v)?'Event / source record':'Ask the organiser via the source event'} ↗</a>}
        </div>
        <div className="directory-footer">{validCoordinates(v.lat,v.lon)&&<button onClick={()=>onShowMap(v)}>View on map ↗</button>}<small>{v.lastChecked?'Source checked '+new Date(v.lastChecked).toLocaleDateString('en-GB'):'Source check date not recorded'}</small></div>
      </div>
    </article>)}</div>
    {!loading&&!filtered.length&&<div className="empty"><h3>No venues match these filters.</h3><p>Try removing the capacity or numeric budget filter. Missing details are never filled with guessed numbers.</p><Button variant="outline" onClick={()=>{setQuery('');setCostType('');setContact(false);setCapacity('');setBudget('');}}>Clear filters</Button></div>}
  </div>;
}
