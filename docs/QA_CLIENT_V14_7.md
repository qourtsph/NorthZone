# NorthZone Client v14.7 — Club Accounts & Club Portal

## Booking Context
- Individual / Club selector appears before reservation building: PASS
- Individual remains default: PASS
- Unauthenticated Club mode locks reservation builder: PASS
- Approved Club sign-in unlocks booking: PASS
- Switching booking context clears incompatible cart data with confirmation: PASS
- Club pricing is not rendered before Club authentication: PASS

## Club Pricing
- Court rate is derived from authenticated Club pricing profile: PASS
- Paddle rate can be Club-specific: PASS
- Ball Machine rate can be Club-specific: PASS
- Coaching rate can be Club-specific: PASS
- Cart stores the rate applied at time of reservation: PASS
- Individual booking continues to use public rates: PASS
- Bundled Club pricing is explicitly DEMO-only: PASS

## Club Booking Purpose
- Individual purpose list retained for Individual mode: PASS
- Club receives its own reduced purpose list: PASS
- Club Open Play: PASS
- Club Training / Drills: PASS
- Internal Matches: PASS
- League / Ladder: PASS
- Tournament / Competition: PASS
- Club Social / Gathering: PASS
- Other Club Activity: PASS
- Club Training / Drills can use existing coaching-goal and coach-selection engine: PASS
- Estimated players required for Club booking: PASS

## Registration & Approval Boundary
- Unregistered Club has Register a Club path: PASS
- Registration creates application reference only: PASS
- New application status is Pending: PASS
- Registration does not create an approved Club session: PASS
- Registration does not unlock Club pricing: PASS
- Copy states NorthZone Admin approval is required: PASS

## Club Portal
- Separate Club Portal page: PASS
- Overview: PASS
- Reservation history: PASS
- Payment history: PASS
- Club Profile: PASS
- Safe profile updates: PASS
- Pricing & Privileges visible only after Club sign-in: PASS
- Authorized Representatives: PASS
- No Admin page link from Club Portal: PASS
- Club bookings submitted through booking flow persist into Club Portal history: PASS
- Club payment submissions persist as Pending Verification: PASS

## Existing Systems
- Booking Purpose / coaching priorities retained: PASS
- Coach profile privacy retained: PASS
- Registry-aware Ball Machine logic retained: PASS
- Booking / Cancellation policy modals retained: PASS
- Review redesign retained: PASS
- Payment / confirmation flow retained: PASS

## Production Security Boundary
The static package can only simulate Club authentication and private pricing. Any pricing shipped in browser JavaScript can be discovered by a determined user. Production Club authentication, authorization, approval state, and negotiated pricing must be enforced server-side, with row-level access controls so Club accounts cannot read other clubs or any NorthZone Admin resources.
