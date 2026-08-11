# Phase 5 — Client ↔ Admin Integration Contracts

## Canonical direction
- Admin remains authoritative for operational rules and imported production-shaped records.
- Client consumes only a sanitized public projection.
- Client submissions are staged as untrusted inbound entries.
- Admin validates supported submissions before creating canonical records.
- Unsupported/auth-sensitive mutations remain staged.

## Public projection
- Public player identity: Qourts ID, display name, photo, status
- Approved clubs and active member affiliation
- Public coach profiles, exact rates, availability, exceptions
- Booking configuration, hours, active court blocks, payment-method flags
- Bookable rental equipment
- Published Booking/Cancellation policies
- Published community posts, announcements and Praise
- Published club community rules/settings

## Inbound supported now
- Club application
- Player registration
- Single-reservation court booking request

## Intentionally not promoted automatically
- Praise submission
- Club announcement submission
- Other authenticated community mutations
- Multi-reservation/coaching requests requiring manual review

Production transport remains Supabase/backend work for the next implementation phase.
