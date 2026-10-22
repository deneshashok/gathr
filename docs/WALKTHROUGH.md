# GATHR product walkthrough

This guide follows the current interface. Its data counts were checked through the running app's APIs on 22 October 2026. Screenshots remain pending because the browser capture permission is still blocked; the steps below are not presented as visually verified captures.

## 1. Start with the venue directory

Open the app and choose **Find a venue** in the navigation, or use **Find your space** in the introduction.

The section is headed **Find your people a place.** It shows the number of venue options and how many have a public contact, booking or website link. The current API snapshot has 104 leads and 78 with one of those contact routes.

An **Imported lead · unverified** badge means the space was discovered from an event source. It does not confirm that it is available for hire, that a price is current, or that its owner has verified the listing.

## 2. Narrow the options

Use **Venue or neighbourhood** for a name, area, address or postcode. Try **Alphabeta** to find a record with a detailed session-rate note.

The **Cost type** filter distinguishes paid hire, listed-as-free spaces, sponsor/host arrangements, discounts and unknown prices. **Minimum capacity** includes only records with enough known capacity. Check **Has a public contact or website** to focus on leads with a direct next step.

Avoid the **Exact numeric budget filter** unless comparable numeric prices have been supplied. The current dataset has rates in text notes, including hourly rates and minimum spends; it does not have populated numeric total-booking prices. A zero-result numeric filter does not mean every venue is over budget.

## 3. Read the cost information

The grey pricing box appears beneath the venue name and address. The heading indicates the cost category; the paragraph gives the recorded pricing notes.

For example, the current saved Alphabeta note lists £950 for morning/afternoon, £1,450 for an evening and £1,925 for a full day. These are stored indicative source figures, not newly verified quotes. Other venues say pricing is available on enquiry or that no public hire route was found.

Check units and conditions: a rate per hour, a minimum spend, a day-delegate package and a full-day room hire are different offers. GATHR does not turn them into one guessed total.

## 4. Contact the venue

Look below the pricing and capacity information for **Contact & booking**.

- **Contact venue** opens the recorded public enquiry route.
- **Booking / hire details** opens the recorded hire or booking page when separate.
- **Venue website** opens the official website recorded in the lead.
- **Event / source record** shows where the venue lead originated.

If there is no public venue contact, the card states that clearly and can offer the source event as a route to its organiser. An organiser's event page is not presented as a confirmed venue-hire contact. Private contact records are not published.

Confirm the actual room, event type, capacity, date, duration, minimum spend, VAT and cancellation terms with the venue before making a commitment.

## 5. Locate it on the map

Choose **View on map** at the bottom of a venue card. This switches to the map and selects the stored location. The marker popup lists the record and its public contact route.

The map uses greyscale OpenStreetMap tiles by default. The basemap provider and attribution stay visible. Use the **Venues**, **Events** or **All locations** controls to choose layers, and search the sidebar for a venue, event, area or source.

Multiple records at identical coordinates share a pin. Stored coordinates may identify a building or approximate place rather than a specific entrance. Records with no coordinates remain in the lists instead of receiving invented map pins.

## 6. Explore community events

Choose **Community events** to browse published event records. Source links open original event pages.

The map includes past dates by default so that the imported history remains visible. Select **Upcoming events** when looking for future gatherings; an event occurring at a venue in the past does not establish future venue availability.

Use **Subscribe / download calendar** to export the calendar feed. Records without a valid start and end interval are omitted rather than assigned invented times. A remote calendar service cannot subscribe to a Mac's localhost URL; public hosting is separate work.

## 7. Check the provenance

The **Data sources** view counts published records stored in Supabase. It does not claim that an import worker is running continuously. Venue cards show source links and a source-check date when recorded. A source-check date is not a current venue availability check.

## Screenshot status

No screenshots have been added to this guide yet. The browser tool reports a saved permission block for `http://127.0.0.1:3000`, including after the user confirmed that access was enabled. See the [capture plan](SCREENSHOT_PLAN.md) for the frames to capture when access becomes available.
