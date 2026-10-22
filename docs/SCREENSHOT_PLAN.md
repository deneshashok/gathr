# Screenshot capture plan

Status: **blocked by browser access**, not completed.

The screenshot request is authorised, including publication in this GitHub repository. The supported browser tool nevertheless rejected observation of `http://127.0.0.1:3000` because of a saved origin permission, including after the user confirmed that access was enabled. No alternate browser, headless browser or native-screen workaround has been used.

When that saved access restriction is resolved, capture the actual app using the supported browser tool and review each image before publication. No mockups, generated images or fabricated data should be labelled as screenshots.

| Frame | Intended composition | Suggested filename |
| --- | --- | --- |
| Hero | Clean desktop view showing branding and a useful product section | `01-gathr-overview.png` |
| Venue directory | Heading, filters and two or three complete venue cards | `02-venue-directory.png` |
| Prices and contacts | Alphabeta result with its recorded rates, unverified badge and contact route visible | `03-pricing-and-contact.png` |
| Venue map | Selected venue marker, popup and greyscale basemap; retain attribution | `04-venue-map.png` |
| Events | Community event list with actual source records and dates | `05-community-events.png` |

Prefer a consistent desktop width around 1440 pixels, readable text and actual populated results. Keep map attribution visible. Capture only the app content; exclude browser tabs, account details, `.env`, tokens and operator access fields. Current source rate notes must remain labelled as indicative.

After capture, save reviewed originals in `docs/screenshots/`, choose the best frame for the README, embed the remaining frames in WALKTHROUGH.md, and replace the pending screenshot notices with accurate captions. Suggested filenames above are a plan, not existing image assets.
