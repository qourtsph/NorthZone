# NorthZone Client Site v1

Public website and customer booking experience for NorthZone Pickleball Courts.

## Included
- Premium NorthZone marketing website
- 5-court showcase
- Google Maps location
- Court booking
- Multiple-court booking
- Shared or individual schedules per court
- Coaching-session booking
- Paddle rentals
- Ball-machine rental
- Customer details
- GCash / Maya / Pay-at-Venue mock checkout
- Static confirmation flow

## Entry Points
- `index.html` — public website
- `booking.html` — booking flow

## Intended Production Domain
`https://northzonepickleball.com`

The **Staff Login** link points to:
`https://admin.northzonepickleball.com`

## Static Prototype Limitation
This package does not yet store bookings, hold real availability, process payments, authenticate customers, send real emails, or connect to Supabase.

## Recommended Live Architecture
- GitHub — source control
- Cloudflare Pages or Vercel — frontend hosting
- Supabase/PostgreSQL — database + authentication
- Secure server functions — booking/payment/email actions
- PayMongo / Maya / supported gateway — payments

## GitHub Pages
This package can be published directly as a static preview.


## v2 — Premium Navy Header
- Replaced the light navigation bar with the approved premium dark-navy NorthZone header.
- Uses the official NorthZone logo.
- Added restrained mint/blue accents and active-state underline.
- Refined the Reserve a Court CTA without changing booking logic.


## v3 — Date-First Availability Flow
- Booking now starts with **Date & Time**.
- Customer selects duration before choosing courts.
- The system then shows all 5 courts for the requested schedule.
- Unavailable courts are visibly grayed out and disabled.
- Customer may select one or multiple available courts.
- Booking Type comes after court availability:
  - Court Booking
  - Coaching with Coach Raf
  - Event / Group Booking
- Coach Raf uses the supplied real photo.
- Paddle rental uses the supplied paddle graphic with its white background removed.
- Event / group and 3+ court reservations demonstrate a Pending Approval workflow.
- Homepage court cards have consistent dimensions.
- White site background now includes a subtle premium grid/glow treatment.


## v4 — Approved Premium Court Layout
- Court showcase changed to the approved **3 cards on top / 2 centered below** layout.
- All five court cards now use the **same exact dimensions**.
- Background pattern is visibly stronger but still premium/subtle.
- Added premium court-line and dot styling.
- Added a 5-item benefits strip beneath the court showcase.
- Retains the dark-blue NorthZone header.
- Retains date-first booking flow.
- Retains multi-court availability selection.
- Retains Coach Raf and the transparent paddle-rental asset.


## v6 — Google Maps Fix
- Replaced the old map placeholder with a real Google Maps embed.
- Map centers on NorthZone at coordinates `15.2427734, 120.6290658`.
- Added **Open in Google Maps**.
- Added **Get Directions**.
- Works when hosted on GitHub Pages over HTTPS.
