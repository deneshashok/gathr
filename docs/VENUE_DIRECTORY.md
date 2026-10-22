# Venue discovery with costs and public contacts

`Find a venue` now shows imported venue leads instead of hiding every pending imported record behind the approval filter. This is an explicit directory of research leads, not a declaration that a venue is verified or bookable.

At verification on 22 October 2026, Supabase returned 104 eligible leads, including 78 with a public contact, booking or website link. Every record had a price note; some notes state that the price, hire route or venue identity is unknown. The source data was being refined separately during this session, so these counts differ from the earlier map snapshot of 116 venues.

Cards display name, address/area, indicative pricing notes, cost type, capacity when known, public contact/booking links, source link and source check date. Missing information is stated explicitly. Private organiser contacts are not read or exposed. The app does not generate missing phone numbers or email addresses. If no public venue contact exists, the card offers the source event for contacting the organiser, without implying that this is a venue-hire contact.

Filters cover name/area/postcode, cost category, capacity and availability of a public contact/website. The advanced numeric budget filter only compares actual numeric `priceGBP` values. It does not turn textual morning/evening rates, hourly costs, minimum spends or quote-only notes into a fabricated total booking price.

The separate server-only `gathr_venue_directory()` function is SECURITY INVOKER and executable only by service_role. The server calls it with its existing server key; the browser receives only selected public fields, never that key. Pending leads must be from supported public Luma/Devpost/Meetup source URLs and have no user owner. Private contributions, rejected/draft listings, demo records and unsupported sources are excluded. Approval status and existing RLS policies are not changed. Ordinary public clients cannot call the restricted function directly.

This intentionally supersedes the earlier behaviour in MAP_SETUP.md where all pending imported venues were hidden. Published event data continues to use the original anonymous/RLS-protected public catalogue. Venue leads now also appear on the map and link back to the directory's public contact details.

Verification:

- 27 unit tests passed, including private contribution/source-domain exclusions, price handling, contact URLs and directory filters.
- Production build passed.
- `scripts/smoke-venues.mjs` checks real API records, pricing/contact filters, a stored indicative rate and restricted-function denial for the publishable key.
- Existing map smoke checks continue to accept explicitly labelled imported leads without considering them approved.
- No new advisor finding on this projection; the two previously recorded warnings on existing auth helper functions remain unrelated.
- Browser visual inspection remains blocked by the saved localhost browser permission; no workaround was attempted.
