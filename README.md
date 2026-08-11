# NorthZone Client Site v14.24.3 — Google-Style Navigation & Profile Account

Targeted booking fix on top of v14.21.1.

- Today remains bookable for future time slots.
- Past slots are disabled individually; the rest of the day is not disabled.
- Actual Admin court booking blocks remain authoritative.
- Removed the legacy random/synthetic court-unavailability fallback.
- When no Admin contract is available, valid time slots are not fabricated as occupied.
- Added booking runtime cache-busting for deployment.

---

GitHub-ready NorthZone customer/player/club site wired to the Phase 5 public Admin contract.

**Phase 5 adds:** Admin-driven booking rules, court blocks, published policies, public coach rates/availability, rental-equipment data, public community posts, and staged Client → Admin submissions.

**Security boundary:** the Client no longer parses private Admin state. Browser submissions are untrusted until Admin validates/imports them. Auth-sensitive community mutations remain staged pending the production Supabase Auth/RLS layer.

---

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


## v8 — Mobile Local Preview Fix
The normal `index.html` is a multi-file website and requires:
- `styles.css`
- the `/assets` folder
- the rest of the repository structure

If you download only `index.html` to Android, the browser cannot resolve those files.

Use `NorthZone-Mobile-Preview.html` when you want to download and open a single file directly on a phone. Its stylesheet and visual assets are embedded into the HTML.

For GitHub deployment, continue using the normal repository files rather than replacing the project with the standalone preview.


## v10 — Seamless Reservation Builder

### New booking UX
The booking flow has been reduced to six major steps:

1. **Reservation Builder**
   - Full monthly calendar
   - Booking window runs dynamically from the day the page is opened through exactly two years later
   - Previous / next month navigation
   - Today shortcut
   - By Time / By Court toggle
   - Multiple hourly time-slot selection
   - Multiple court selection
   - Availability updates on the same page
   - Existing cart reservations are treated as unavailable to prevent duplicate selections
   - Reservation cart stays visible on the same page
2. Add-ons
3. Customer Details
4. Review
5. GCash / Maya Payment
6. Pending Confirmation

### Booking methods
**By Time**
Select one or multiple hours → see courts available for every selected hour → select one or multiple courts.

**By Court**
Select one or multiple courts → see hourly slots available across every selected court → select one or multiple hours.

### Production note
Availability in this static build is demo-generated. The production version must replace it with server-authoritative availability from the shared booking database.


## v11 — Larger Desktop Benefits Strip
- Enlarged the five-item benefits strip on desktop.
- Increased overall strip width and height.
- Increased icon, heading, and supporting-text sizes.
- Added more internal spacing between items.
- Preserved the existing tablet and mobile sizing.


## v12 — Static Map Card
- Removed the embedded Google Maps iframe.
- Added a local static NorthZone map illustration.
- Opening the site locally no longer triggers a network-access prompt just to render the location section.
- `Open in Google Maps` and `Get Directions` still open Google Maps when clicked.


## v13 — Mobile Benefits Layout
- Reworked the benefits strip for mobile into a single-column stacked list.
- Removed the awkward 2-column wrap and empty space.
- Standardized icon alignment.
- Tightened spacing while keeping text readable.
- Desktop/tablet layout remains unchanged.


## v14 — NorthZone Customer Experience Platform / Qourts Ecosystem

The client-facing site has been rebuilt around a clearer customer journey:

`Discover → Book → Play → Join Open Play → Compete → Track → Return`

### Brand architecture
NorthZone remains the venue/customer-facing brand.

Qourts is the technology and player ecosystem layer:

- **Qourts ID** — Who you are
- **Qourts Rating** — How you perform
- **Qourts Record** — What you've done
- **My Qourts** — the player-facing entry point to those systems

### New client pages
- `index.html` — redesigned NorthZone home/customer platform
- `booking.html` — existing v13 seamless booking flow, retained and lightly polished
- `open-play.html` — player-facing Open Play explainer + static phone queue demo
- `events.html` — tournaments/leagues/events landing page
- `membership.html` — membership landing page without invented pricing
- `my-qourts.html` — Qourts ID / Rating / Record player dashboard concept

### Homepage primary actions
- Reserve a Court
- Join Open Play
- Events & Tournaments
- My Qourts

### Qourts Rating boundary
No numeric Qourts Rating has been invented. Static demo profiles show **NR / Not Rated** until a legitimate production rating methodology, verified match requirements, opponent-strength model, recency logic, and anti-manipulation safeguards are defined.

### Static limitation
The site is still a static prototype. `My Qourts` demo identity and the Open Play queue demonstration are local to the browser.

Production deployment requires shared backend state so:
- player identity is authenticated
- bookings are server-authoritative
- Open Play queue state is shared with NorthZone Admin
- match results update Qourts Record
- eligible verified results feed Qourts Rating
- memberships and customer pricing are resolved from the database


## v14.1 — Logo & Hero CTA Hotfix

- Replaced the client-facing NorthZone logo asset with the official uploaded transparent logo.
- Removed forced monochrome/inversion styling from the header/footer logo.
- Fixed the hero `Reserve a Court` CTA text contrast so the label remains readable.
- Added explicit hover and visited-state colors for the primary CTA.


## v14.2 — Header Visibility Fix

- Increased the official NorthZone logo from a small header mark to a properly weighted brand element.
- Kept the navbar height controlled while allowing the full NorthZone wordmark to read clearly.
- Changed `My Qourts` into a high-contrast teal account/player destination with a subtle pill treatment.
- Added responsive logo scaling and My Qourts visibility rules for desktop, tablet, and mobile.


## v14.3 — Logo Height Refinement

The official NorthZone logo now uses more of the available navbar height while preserving its native aspect ratio. The logo is constrained by `max-height` / `max-width` instead of forcing both width and height, preventing distortion. Responsive rules are included for desktop, tablet, and mobile.


## v14.4 — New Official NorthZone Logo

- Replaced the shared NorthZone logo runtime asset with the newly supplied official logo.
- Existing v14.3 header sizing and proportional scaling rules were retained.
- My Qourts visibility, booking workflow, Open Play, Events, Membership, and My Qourts pages were left unchanged.


## v14.4.1 — Explore Open Play CTA Color Hotfix

Changed the homepage `Explore Open Play` button text color to `#6ed6cf` while retaining the existing button background and all other client-site functionality.


## v14.4.2 — Equipment / Add-ons Copy Update

Updated the homepage Equipment card:

- `Gear up. Train smarter.`
- `Need a paddle to play or a ball machine to train? Add either to your court booking and make every session count.`
- CTA changed to `View Add-ons →`


## v14.4.3 — Equipment Visual Update

The homepage Equipment card now visually represents both available equipment paths:
- Paddle
- Ball machine

A combined `assets/equipment-addons.png` visual was created using the existing paddle artwork and the supplied ball-machine icon. The original paddle asset remains available for the booking flow.


## v14.4.4 — Equipment Photo + Ball Machine Vector

- Homepage Equipment card now uses the approved real ball-machine training photo, matching the photography treatment of Coaching and Groups & Events.
- Booking Add-ons now displays the supplied ball-machine vector instead of the old placeholder square/dot icon.
- Existing copy, pricing/demo logic, toggle behavior, and all other client pages remain unchanged.


## v14.4.5 — Visit CTA Visibility

- `Check Availability` now uses `#6ed6cf` text on the existing dark navy button.
- `Get Directions ↗` is now a clearly visible secondary pill with a soft teal background, teal border, and NorthZone navy text.
- Both CTAs receive responsive full-width treatment on mobile.


## v14.4.6 — Single Ball Machine Availability

NorthZone's ball machine is now modeled as a single constrained resource. The Add-ons step checks all unique date/time slots in the customer's cart. If any overlap an existing ball-machine reservation, the card is grayed out, the toggle is disabled, and the UI shows the soonest next available window.

Ball-machine pricing now follows unique machine clock-hours rather than court-hours. Reserving five courts from 9:00–10:00 AM therefore uses one ball machine for one hour, not five ball-machine hours.


## v14.4.7 — Equipment Registry Aware

Ball Machine quantity is no longer hardcoded.

The client now counts serviceable `Ball Machine` records from the NorthZone Equipment registry. The runtime adapter is compatible with the Admin portal's existing `equipmentAssets` model.

Automatic UI:
- `0 available` → disabled / gray
- `1 available` → toggle
- `2+ available` → quantity selector

Availability is calculated per physical asset across the entire selected schedule. Pricing is `selected quantity × unique machine hours × rate`.

The static fallback currently mirrors the Admin Equipment list with one Good Condition Spinshot Ball Machine. If a second Good Condition Ball Machine asset becomes available through the registry, the booking UI automatically changes to a quantity selector.


## v14.6 — Coaching Goals & Coach Matching

The coached-training path is now:

`Booking Purpose → Training → Train with a Coach → Select 1–3 Priorities → Recommended Coaches → Select Coach → Add-ons → Details → Review → Payment → Confirmation`

Players may select up to three coaching priorities. `Other` reveals a custom focus field, and Coaching Notes / Special Requests remain optional. Coach recommendations are ranked using the player's priorities against public coach specialties while preserving schedule availability as a hard requirement.

Coach cards provide View Profile and Select Coach actions. The public profile supports name, public title, bio, specialties, skill levels, coaching experience, active certifications, session rate, and availability. The registry uses a strict public-field whitelist: direct contact details, emergency contacts, payroll data, and internal HR notes are never returned to the client coach renderer.

The fallback Coach Raf profile deliberately does not invent specialties or certifications. Those appear only when verified public profile/certification data exists in the connected Admin data source.


## v14.6.1 — Booking / Cancellation Policy Modals

The consent row now includes separate clickable `Booking Policy` and `Cancellation Policy` controls. Each opens an in-flow modal with its corresponding policy preview and does not navigate the customer away from the booking process.

The consent checkbox remains required.

The bundled policy copy is deliberately marked as preview content and should be replaced with NorthZone's approved final terms before production.


## v14.6.2 — Review Step Redesign

Step 5 has been rebuilt around scannable information groups instead of the previous compressed horizontal layout.

The Review screen now separates:
- Court Reservation
- Booking / Training Session
- Customer Details
- Equipment & Coaching
- Price Summary

Only selected add-ons are displayed. Coaching priorities, notes, selected coach, and pricing remain part of the review. Each group has an Edit action that returns the customer to the relevant booking step.


## v14.6.3 — Review Add-ons Refinement

The Step 5 `Equipment & coaching` card now renders every selected item as its own full-width row. Equipment and Coaching use distinct category pills, quantity/duration and rate are presented as supporting information, and prices remain consistently right-aligned.

No pricing or booking calculations were changed.


## v14.7.1 — Booking Typography Refinement

Booking-step titles are now smaller and more balanced, while supporting subtitles are larger, darker, and easier to scan. This is a visual-only change across the booking flow; no booking, coaching, equipment, or club logic was modified.


## v14.7.2 — Booking UI Font Readability

The reservation builder no longer relies on 6–10px micro-text for core controls. Section headings, helper copy, booking methods, calendar labels, hourly slots, court labels, legends, and the sticky reservation summary have all been increased while preserving the existing compact layout and booking logic.


## v14.7.3 — Your Booking Running Tab

The duplicate inline `Reservation cart` has been removed from Step 1. The persistent `Your Booking` panel is now the single booking ledger throughout the flow.

Each added reservation displays its date, time, number of courts, court names, court-hours, and reservation subtotal. The panel also maintains the booking subtotal, optional Add-ons / Coaching subtotal, and running total. Reservations can be removed individually or cleared as a group directly from the persistent summary.


## v14.7.4 — Time-First Booking + Live Duration

Step 1 no longer asks customers to choose between `By Time` and `By Court`. Booking is now intentionally time-first: select one or more hourly slots, then select from courts that are available throughout those selected hours.

`Your Booking` now shows the live selected duration before the reservation is added. Selecting `8:00 AM` and `9:00 AM` displays `8:00 AM–10:00 AM · 2 hours`. Added reservations retain the same duration information.


## v14.7.5 — Live Time + Courts Summary

The `Your Booking` live-selection panel now displays selected courts directly beneath the selected time before the reservation is added.

Example:

`7:00 AM–10:00 AM · 3 hours`

`Court 2, Court 3, Court 4 · 3 courts`

Court names are sorted naturally by court number both in the live selection and in saved running-tab reservations.


## v14.7.6 — Auto Reservation / Continue Flow

The `Add to Booking` button and its bottom commit bar have been removed.

A valid date, time, and court selection now automatically becomes the active reservation and immediately appears in the complete `Your Booking` reservation-card interface. Changing the selected time or courts updates the reservation automatically.

`Continue to Booking Purpose` is now the only forward action on Step 1. The current flow intentionally represents one active reservation.


## v14.7.7 — Simplified Booking Purpose

Individual bookings now have only three Booking Purpose choices:

- Casual Play
- Training
- Event / Tournament

The former Corporate / Group, Clinic / Event, and Other individual choices were removed. The associated individual-only Company / Organization and Other-purpose fields were also removed to keep the flow clean.

Club-specific booking purposes remain separate and unchanged.


## v14.8 — Consolidated Booking Setup

The separate `Booking Purpose` and `Add-ons` pages have been consolidated into one `Booking Setup` step.

The booking journey is now:

`Reserve → Booking Setup → Details → Review → Payment → Confirmation`

Step 2 is titled `Customize your booking.` Customers select the purpose, complete any training/coach configuration, and manage optional paddle / ball-machine add-ons without leaving the page.

The Review page routes both Session and Add-ons edits back to Booking Setup.


## v14.9 — Coaching Session Time Selector

Coaching is now scheduled as a child session inside the court reservation.

A player booking a court from `9:00 AM–12:00 PM` may choose the coach only for the exact booked hours they need, for example `10:00–11:00 AM`. No separate coaching-duration field is required; duration is derived automatically from the selected consecutive coaching hours.

Coach availability and pricing now use the coaching session hours rather than the full court reservation. The booking flow remains six steps and the time selection lives inside `Customize your booking`.


## v14.9.1 — Summary Readability Refinement

Improved the readability of the right-side **Your Booking** panel.

### Updated
- Increased typography size for reservation date, time, courts, and court-hours
- Increased typography size for add-ons / coaching entries
- Improved legibility of subtotal and total rows
- Improved spacing and hierarchy in the summary card
- Kept the existing booking logic and flow unchanged


## v14.10 — Group Coaching Participants

`Train with a Coach` now supports coaching sessions with multiple players.

The booking setup captures the total number of players training using a compact quantity control. This participant count is used for coach-capacity eligibility, optional group-pricing rules, the running booking summary, Review, Confirmation, and stored booking records.

Coach public profiles may optionally provide:
- `maxStudents`
- exact `groupRates` by participant count
- `additionalStudentFee`

If no group-pricing rule is configured, the existing coaching session rate is preserved; the client does not invent a surcharge. If no maximum capacity is configured, the client does not fabricate one.


## v14.10.1 — Admin-Driven Coach Group Rates

Multi-player coaching prices are never hard-coded or inferred by the client.

Each coach's pricing table in NorthZone Admin is the authoritative source. For example, a coach may have separate configured hourly rates for 1 player, 2 players, 3 players, and 4 players.

For sessions with 2 or more players, the exact participant-count rate must exist for that coach. If the Admin has not configured the requested group size, the coach cannot be selected for that booking and the client displays `Rate not set`.

The client no longer applies a generic additional-student surcharge or a generic club group-coaching rate.


## v14.10.2 — Cleaner Reservation Summary Layout

Refined the **Your reservation** sidebar card so each reservation is easier to scan without changing the type scale.

### Updated layout
- Time range now sits in a dedicated highlight block
- Courts and court-hours are grouped in a compact KPI block
- Selected court names move into their own full-width row for cleaner wrapping
- Subtotal remains separated at the bottom for a stronger pricing hierarchy

### Intent
Improve readability through spacing, grouping, and visual hierarchy rather than larger font sizes.


## v14.10.3 — Homepage Card Color Unification

Updated the homepage action cards under **“Your next game starts here.”** to use a consistent card treatment.

### Changes
- Removed mixed dark / white / teal card fills
- Standardized all four cards to one clean white card style
- Kept icon treatment, spacing, and hover behavior visually consistent
- Preserved all links and homepage action destinations

### Result
A cleaner, more cohesive homepage section with less visual confusion and stronger brand consistency.


## v14.10.4 — Qourts Section Moved Below Map

Updated the homepage content order so the **Qourts ecosystem section** now appears **below the NorthZone map section and immediately above the footer**.

### Why
- Keeps visitor focus on **NorthZone first**
- Positions Qourts as supporting technology, not the main headline too early on the page
- Improves content hierarchy for local venue visitors

### Change made
- Moved the entire **“One player identity. Every game adds to your story.”** section to the very bottom of the homepage content, directly before the footer.


## v14.10.5 — Open Play Section Moved to Second-to-Last

### Change made
- Moved the **NorthZone Open Play** feature section (`No crowding around the desk. Know when you’re next.`) to the **second-to-last section** on the homepage.
- New position: **after the map / visit section** and **right before the Qourts section**.

### Why
- Keeps the homepage focused on NorthZone’s core offering first
- Prevents Open Play from interrupting the main venue and booking narrative too early
- Makes the page flow feel more intentional and easier to scan


## v14.11 — NorthZone Story Homepage

The homepage now introduces **NorthZone itself** more clearly instead of behaving primarily like a service portal.

### Homepage story changes
- Added a new `This is NorthZone` section directly after the primary action cards
- Uses real NorthZone facility/player photography already in the site assets
- Added concise positioning copy explaining what visitors can experience at NorthZone
- Added three facility/experience pillars:
  - 5 Indoor Courts
  - Training & Equipment
  - Open Play & Competition
- Added direct links to Reserve a Court and See the Courts

### Hero refinement
- Hero supporting copy now describes NorthZone instead of leading with Qourts
- Hero stats now emphasize Facility, Training, and Open Play
- Qourts remains positioned later in the homepage as supporting technology
- Explore navigation now points to the new NorthZone introduction section

No booking, coaching, equipment, club, payment, or Open Play application logic was changed.


## v14.11.1 — About CTA Teal Text

Updated the **Reserve a Court** button inside the `This is NorthZone` section so its text uses the same approved teal as the **Check Availability** button: `#6ed6cf`.

Button background, dimensions, spacing, and behavior remain unchanged.


## v14.11.2 — Modern NorthZone Section
- Upgraded the “This is NorthZone” homepage section with a more premium layout.
- Added layered visual showcase, highlight stat cards, elevated feature cards, and subtle scroll-reveal transitions.
- Preserved existing content and CTA intent while making the section feel more modern and dynamic.


## v14.12 — Homepage Modernized Layout + Transitions
- Applied the modern layout direction across the main homepage, not just the NorthZone story section.
- Added homepage-wide reveal animations, richer section shells, elevated cards, improved hover states, and more premium spacing.
- Upgraded the hero, action cards, courts, experience, membership, visit, Open Play, and Qourts sections for a more modern overall feel.


## v14.12.1 — Three-Tier Typography

The homepage now uses one consistent three-tier typography hierarchy:

1. **Tier 1 — Major headlines:** hero and section headlines
2. **Tier 2 — Subheads:** card titles and supporting headings
3. **Tier 3 — Body copy:** descriptions and supporting paragraphs

Small uppercase eyebrow labels remain metadata/utility text and intentionally sit outside the main reading hierarchy. The v14.12 modern layout and transition system is retained.


## v14.13 — My Portal Gateway

Added a universal **My Portal** account entry point across the NorthZone customer website.

### Header
- `My Qourts` header button renamed to `My Portal`
- Main homepage, Open Play, Events, Membership, My Qourts, and Club Portal headers now route to `portal.html`
- Booking topbar now also includes `My Portal`

### My Portal gateway
`portal.html` provides two clear account paths:

1. **Individual / Player → My Qourts**
   - Qourts ID
   - bookings
   - Open Play
   - Qourts Record
   - future Qourts Rating

2. **Approved Club → Club Portal**
   - reservations
   - payment history
   - club profile
   - booking privileges
   - approved club rates

The gateway recognizes the existing browser-local player demo profile and Club Portal session and changes the action to `Continue` when applicable.

Club access remains completely separate from NorthZone Admin.


## v14.13.1 — Demo Club Portal Access

Added a temporary **one-click Club Portal preview** so the Club workspace can be reviewed and configured before real club registration/approval is ready.

### Preview access
From `My Portal`:
- Click **Preview Club Portal**
- No registration required
- No approval required
- No email/password required

Direct URL:
`club-portal.html?demo=1`

### Demo workspace
The preview session uses the bundled Demo Pickleball Club and includes seeded sample:
- club profile
- approved-club status
- special pricing / privileges
- reservations
- payments
- authorized representative
- profile editing

The demo workspace has a visible `DEMO PREVIEW` badge and a `Reset Demo Data` control.

### Safety / production boundary
This does not bypass real club approval. Demo access is isolated through a `demoPreview` local browser session and does not grant NorthZone Admin access. Real club registration and authorized-representative sign-in remain in the package for later production use.


## v14.13.2 — Subtle Club Portal Background

Added a restrained visual treatment to the **Club Portal only**.

### Background treatment
- soft NorthZone teal/navy radial glows
- very low-opacity geometric grid
- abstract pickleball-court line motif
- subtle glass treatment on portal cards
- soft ambient highlight behind the club workspace heading

The effect is intentionally understated so the portal remains professional, readable, and operational rather than decorative.


## v14.13.3 — Sticky Club Portal Header

Fixed the Club Portal header so it remains visible while scrolling.

### Fix
- Restored `position: sticky` on the Club Portal header
- Header stays pinned to `top: 0`
- Content remains in normal flow directly below the header
- Added appropriate stacking so portal cards/background never cover the header
- Added scroll padding for anchor/tab navigation
- Adjusted decorative background start position for desktop and mobile header heights

No Club Portal business logic or demo data behavior was changed.


## v14.13.4 — Club Portal Readability

Raised Club Portal typography to remove the previous 7–10px operational text.

### Readability changes
- Larger tabs
- Larger card labels and descriptions
- Larger reservation / payment history text
- Larger profile form labels and inputs
- Larger status pills and utility labels
- Larger representative details
- Larger workspace actions
- Larger footer text
- Increased card padding where needed to preserve whitespace

The Club Portal keeps its three-tier visual hierarchy while becoming significantly easier to read on both desktop and mobile.


## v14.14 — Club Profile Personalization

Expanded **Club Profile** with a dedicated personalization area.

### New
- Upload / replace / remove Club Logo
- Upload / replace / remove current Representative Profile Picture
- Live image preview before saving
- Initials fallback when no image is set
- Automatic image resizing and WebP compression
- File-type validation: PNG, JPG, WebP
- Source file limit: 8 MB
- Processed-image size protection for browser localStorage
- Separate `Save Personalization` action

### Where images appear
- Club Logo appears beside the club name in the Club Portal workspace
- Representative profile picture appears in the Access / Authorized Representatives list
- Both remain visible after refresh through the existing browser-local Club Portal profile storage

### Production note
This static package stores uploaded images as sanitized canvas-generated data URLs in localStorage for setup/testing. Production should move these files to secure object storage such as Supabase Storage and save only their URLs in the database.


## v14.15 — Club + Player Leaderboards

Added club-member leaderboards inspired by modern community sports apps while preserving Qourts' existing integrity rules.

### Club Portal
New `Leaderboard` tab:
- eligibility = active registered club members only
- verified club matches only
- time windows:
  - This Month
  - This Year
  - All Time
- rank by:
  - Wins
  - Win %
  - Matches
  - Points Earned (PE)
  - Point Quotient (PQ)
- W–L, Win %, Matches, PE, PC, PQ table
- Top 3 podium
- Leaderboard preview on Overview
- Overview member metric now uses registered-member count rather than approximate profile size

### My Qourts / Player Portal
New `Club Leaderboards` section:
- detects every club where the current Qourts identity is a registered member
- club switcher supports multiple affiliations
- same time-window and ranking controls
- highlights the current player row with `YOU`
- no club affiliation = clear empty state

### Demo data
The static preview seeds:
- 8 demo registered members
- verified club match records across multiple time periods
- Demo Player identity `QRT-DEMO-PLAYER`, which is affiliated with the Demo Pickleball Club

### Ranking integrity
This feature does **not** invent a Qourts Rating or proprietary Power score. It ranks directly from verified match outcomes and transparent statistics. Production will replace browser-local member/match data with database-authoritative records.


## v14.16 — Club Announcements

Added a dedicated **Announcements** workspace to the Club Portal.

### Club representatives can
- Create announcements
- Edit existing announcements
- Save as Draft
- Publish / Unpublish
- Pin important announcements
- Set Normal or High priority
- Categorize as General, Event, Schedule, or Reminder
- Set an optional expiration date
- Delete announcements
- Filter by All, Published, Drafts, or Pinned

### Overview
The Club Portal Overview now shows the latest active published announcement, with pinned items prioritized.

### Audience
Current static build uses one clear audience:
**Registered Club Members**

Audience groups can expand later after backend member roles/groups are authoritative.

### Demo / production boundary
Demo Club Portal includes sample announcements clearly marked as demo content. Announcement data is browser-local for now. Production should move announcements to Supabase/database records and surface published announcements to affiliated members in My Qourts.


## v14.16.1 — Announcement Photo Attachments

Added an optional **Attach Photo** control inside the Club Portal Announcements composer.

### What changed
- Club representatives can attach **one photo** to an announcement
- Attached image is previewed before saving
- Existing attached photo can be removed during edit
- Attached image displays in:
  - the announcement feed
  - the latest announcement preview on Overview

### Technical behavior
- Supported file types: PNG, JPG, WebP
- Images are resized client-side for a lighter static demo payload
- Attachment is stored with the announcement in browser-local demo data
- Draft/published, pinning, priority, and other announcement behaviors remain unchanged


## v14.17 — Player Portal Club Announcements

Published announcements from a player's affiliated clubs now appear directly on the **My Qourts main profile page**, above Club Leaderboards.

### Visibility rules
- Player must be a registered member of the club
- Published announcements only
- Drafts are never exposed to the player portal
- Expired announcements are excluded

### Experience
- Combined `All Clubs` feed
- Per-affiliated-club filtering
- Pinned announcements surface first
- High-priority announcements are emphasized
- Club logo/name, category, date, author, and optional expiration are shown
- Announcement photo attachments are displayed

### Static / production boundary
This preview uses browser-local club membership and announcement data. Production should enforce membership and announcement visibility in the backend, with read/unread state added later if desired.


## v14.18 — Qourts Praise

Added **Praise**, Qourts' peer-recognition system for pickleball community reputation.

### Core rule
Praise is grounded in verified play:
- no self-Praise
- giver and recipient must both be registered members
- both players must have participated in the same verified activity
- maximum 3 Praise categories per recipient per activity
- same category cannot be repeatedly farmed from the same player/activity
- Praise does not affect Qourts Rating

### Praise categories
Sportsmanship, Serve, Return, Dink, Drop, Drive, Reset, Lob, ATP, Erne, Overhead, Defense, Hands, Speedup, Counter, Strategy, Court Coverage, Great Partner, Great Opponent, Improvement, Communication, Hosting, Club Spirit, Helpful, and Other.

### My Qourts
- Praise Profile
- total Praise received
- unique players who gave Praise
- `Known For` categories
- recent Praise with visible giver and optional note
- `Praise a Player` workflow unlocked from verified matches
- match/activity selector
- partner/opponent recognition
- up to 3 categories
- optional short message
- existing categories shown as already given
- verified Qourts Record now derives from the same match ledger used for Praise eligibility

### Club Portal
New **Praise Board**:
- This Month / This Year / All Time
- All Praise or a specific Praise category
- Top 3 recognition podium
- rank by transparent Praise count
- unique praiser count
- Known For categories
- recent Praise moderation
- club representative can remove Praise that violates community rules

### Demo data
The demo club includes verified match history and seeded Praise from multiple unique players. The Demo Player can still give new Praise from eligible recent matches.

### Production boundary
The current build persists Praise in browser-local static data. Production should move verified activities, memberships, Praise records, moderation history, and anti-abuse enforcement to the authoritative backend/database.


## v14.19 — Portal Secondary Navigation + Feed

Added a consistent secondary navigation layer inside both the Player and Club portals.

### Club Portal navigation
`Dashboard · Feed · Announcements · Leaderboard · Praise · Reservations · Payments · Club Profile · Access`

The existing Club Portal tab system now acts as the sticky secondary navigation. `Overview` was renamed to `Dashboard`.

### Player Portal navigation
`Dashboard · Feed · My Clubs · Praise · Record · Bookings · Profile`

The player secondary navigation is sticky, horizontally scrollable on mobile, and jumps directly to the relevant portal section.

### Feed
`Feed` is functional in both portals.

Current feed sources:
- published, active club announcements
- community Praise from verified play

Player Feed:
- combines updates from every affiliated club
- All / Announcements / Praise filters
- club identity shown on announcement updates
- Praise activity shown as community recognition

Club Feed:
- combines the club's own published announcements and recent Praise
- All / Announcements / Praise filters
- quick actions route back to Announcements or Praise

### Community architecture
The Feed is intentionally structured as the future home for moderated member posts. Player-created social posts are not fabricated in this version; they can be added next with:
`Submit → Pending Review → Club Admin Approves → Published to Feed`.


## v14.20 — App-Style Portal Views

The Player and Club portals now follow a true application-style navigation model:

**One tab = one dedicated view.**

### Player Portal
Secondary navigation:
`Dashboard · Feed · My Clubs · Praise · Record · Bookings · Profile`

- **Dashboard** — Qourts ID/rating/record summary, latest club update, recent Praise, recent verified match, affiliated-club snapshot, and play-next actions only.
- **Feed** — community feed only.
- **My Clubs** — club affiliations and club competitive leaderboard only.
- **Praise** — Praise Profile, Give Praise, and player-accessible Club Praise Board.
- **Record** — verified record metrics, match history, and Qourts Rating status only.
- **Bookings** — booking-related actions and booking-history boundary only.
- **Profile** — player identity, affiliations, and privacy context only.

Tabs no longer scroll through one long page. Selecting a tab hides every other portal view.

### Club Portal
The existing tab engine already used one visible panel at a time. v14.20 cleans the Dashboard so it contains only:
- core club metrics
- next booking
- latest announcement
- leaderboard snapshot
- Praise snapshot

Pricing & booking privileges were moved from Dashboard to **Club Profile**, where account-management information belongs.

Club tabs now support clean hash/deep-link state such as `#feed`, `#praise`, and `#reservations`.

### Praise navigation improvement
Players can now access a **Club Praise Board directly inside the Player Portal → Praise tab**, with:
- affiliated-club selector
- This Month / This Year / All Time
- All Praise or individual Praise category
- Praise count
- unique praiser count
- Known For categories

This removes the need to enter the Club Admin Portal just to view a club's Praise leaderboard.


## v14.20.1 — Navy Button Text Hotfix

Standardized dark-navy interactive buttons across the NorthZone/Qourts client package.

### Visual rule
- Dark navy button background: `#0b315f`
- Button label color: `#6ed6cf`

The teal value was matched to the supplied **Check Availability** reference (`RGB 110, 214, 207`).

### Scope
The override covers dark-navy CTAs/buttons across:
- homepage / marketing pages
- booking flow
- Player Portal / My Qourts
- Club Portal
- club registration
- coaching selection
- Praise controls
- portal primary actions

Non-button dark-navy elements such as avatars, badges, icons, and cards are intentionally not globally recolored.


## v14.21.1 — Today Time-Slot Hotfix

- Past time slots are disabled when Today is selected.
- Future slots Today remain bookable when they meet the Admin-configured lead time.
- Expired selected slots are automatically cleared.
- Step 1 validation and the visual time grid now share one eligibility rule.
- Phase 5 integration behavior remains unchanged.


## v14.21.3 — Default Today Date Hotfix

Booking Step 1 now selects the player's **local Today** automatically on first load.

- The booking page never opens in an ambiguous "no date selected" state.
- Today's remaining eligible future slots are evaluated immediately.
- Past slots today remain disabled.
- A player may still choose any other allowed date from the calendar.
- Clearing a booking-context reservation resets the date to Today instead of blanking it.
- No date is hard-coded; the value is generated from the browser's local calendar date on each page load.


## v14.21.4 — Temporary Demo Coach Raf Rates

For booking demonstrations, Coach Raf has a temporary exact-rate matrix covering 1–4 players and 30–180 minute sessions. These rows are tagged `demo_temporary` and must be replaced with approved NorthZone pricing before production.

See `docs/TEMPORARY_DEMO_COACH_RAF_RATES.md`.


## v14.22 — Coach Credentials, Specialties & Availability

The coach-selection experience now consumes the expanded Coach Profile public contract.

- player coaching goals include **Lobs**
- Admin specialty options and player coaching goals use the same fixed list
- coach recommendation cards show public certification count/names
- View Profile shows certification issuer, credential ID, issue/expiry information
- attached certificate images/PDFs can be opened by players
- Coach Profile availability date ranges and time windows are authoritative
- selecting a coach is disabled outside the configured availability schedule
- partial-day unavailable exceptions are respected
- alternative coach-time recommendations also respect configured availability

The Client still does not read private Admin/HR state.


## v14.23 — Verified Coach Reviews

The player experience now supports automatic post-session Coach Reviews.

- completed owned coaching sessions become eligible for one review
- review prompt automatically appears on a NorthZone Client page when eligible
- 1–5 star rating
- optional comment up to 500 characters
- **Maybe Later** defers the prompt for the current browser session
- duplicate reviews for the same session are blocked
- Coach selection cards show verified average rating and review count
- View Coach Profile shows verified reviews and written comments
- reviews are labeled as tied to a verified NorthZone coaching session
- no fake/sample coach ratings are seeded

The Client submits reviews through the Phase 5 inbound contract; Admin validates the completed session and publishes the review.


## v14.24 — Membership Subscriptions, Benefits & Wallet

The Client membership experience now uses Admin as its source of truth.

- Player and approved Club membership packages are displayed from Admin.
- Full subscription checkout: Review → Sign → Payment → Pending Verification.
- Benefits activate only after Admin payment verification.
- Booking Review includes a Shopee/Lazada-style **single-choice** benefit selector. Only one discount, credit, wallet, or private Club rate may be applied per booking.
- My Qourts → Membership and Club Portal → Membership show plan, renewal, remaining/consumed credits, wallet activity, benefit usage, and membership payments.
- Fully covered bookings show **No External Payment Due**.
- Client never hardcodes Admin membership plan prices and never stacks savings.

See `docs/SOURCE_OF_TRUTH_MEMBERSHIP_V14_24.md` and `docs/QA_CLIENT_V14_24_MEMBERSHIP_SUBSCRIPTIONS_BENEFITS_WALLET.md`.


## v14.24.1 — Membership Page Hotfix

Fixes the standalone Membership page reported from a direct local `file://` launch.

- Membership page now spans the full browser viewport instead of stopping at the old 1180px main width.
- Hero heading is white/readable against the navy gradient.
- Membership content remains centered at the established 1320px content width.
- A generated `membership-public-snapshot.js` is bundled from NorthZone Admin v35.4 at package build time.
- The Client uses the live Admin public contract first; the bundled Admin snapshot is only a fallback when the static Client is opened by itself.
- The snapshot contains the current 4 active Admin membership plans and enabled membership payment methods.
- Dynamic membership account state, wallet balances, usage, and pending subscriptions are intentionally **not** bundled; those still require the live Admin public contract so stale account balances are never treated as current.
- No membership price or benefit is manually hardcoded in `membership.js`.

### QA

See `docs/QA_CLIENT_V14_24_1_MEMBERSHIP_PAGE_HOTFIX.md` and `docs/BROWSER_SMOKE_V14_24_1_MEMBERSHIP_PAGE.json`.


## v14.24.3 — Google-Style Navigation & Profile Account

The public primary navigation is simplified to:

`Home · Events · Membership · Book a Court · | · Profile`

### Account behavior
- signed out: **Sign In**
- Player signed in: circular profile photo/initial badge with account name below
- Club organizer signed in: organizer/representative photo/initial badge with organizer name below
- active Club organizer session takes priority over a Player profile when both exist
- profile badge opens a Google-inspired account panel
- Player panel routes to **My Qourts**
- Club panel routes to **Club Portal**
- Membership, Switch Account, and Sign Out remain available from the account panel
- signed-out menu exposes Player Sign In, Club Sign In, Register as Player, and Register a Club

The old primary-nav items `Open Play`, `Explore`, `My Portal`, and the separate `Reserve a Court` pill were removed from the top navigation. Open Play remains accessible from the NorthZone homepage/content experience.
