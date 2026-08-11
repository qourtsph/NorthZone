# Account Header Source of Truth — v14.24.2

## Context priority
1. Active Club session + valid current representative
2. Local Player profile
3. Signed out

This means a person who has both a Player profile and an active Club organizer session is presented as the Club organizer until that Club session is signed out.

## Signed-out destinations
- Player Sign In → `my-qourts.html`
- Club Sign In → `club-portal.html`
- Register Player → `my-qourts.html?register=player`
- Register a Club → `club-register.html`

## Signed-in destinations
### Player
- Open My Qourts → `my-qourts.html`
- Membership → `my-qourts.html#membership`

### Club
- Open Club Portal → `club-portal.html`
- Membership → `club-portal.html#membership`

## Session keys
- Player profile: `qourts_demo_profile_v1`
- Club session: `northzone_club_session_v1`

## Production boundary
These browser-local keys are temporary static-build session adapters. Production should derive the same header context from authenticated Supabase identity/session claims and authorized account memberships.
