# QA — NorthZone Client v14.24.2 Account Header Sign-In & Registration

## Account header behavior
- Signed out displays `Sign in`: PASS
- Signed-out dropdown offers Player Sign In: PASS
- Signed-out dropdown offers Club Sign In: PASS
- Signed-out dropdown offers Register Player: PASS
- Signed-out dropdown offers Register a Club: PASS
- Player context displays `Hi, [Player Name]`: PASS
- Player primary destination is My Qourts: PASS
- Club organizer context displays `Hi, [Representative Name]`: PASS
- Club primary destination is Club Portal: PASS
- Club context takes priority when Player + Club both exist: PASS
- Signing out of Club reveals remaining Player context: PASS
- Shared account control also appears in Booking topbar: PASS
- Mobile signed-out nav displays Sign in + Register: PASS

## Player registration
- Register Player entry points to My Qourts registration mode: PASS
- registration modal opens: PASS
- full name required: PASS
- email required: PASS
- Qourts ID generated automatically: PASS
- local Player profile stored: PASS
- header updates immediately after registration: PASS
- production-auth limitation disclosed: PASS

## Full Client regression
- desktop pages: 9/9 PASS
- mobile views: 5/5 PASS
- total views: 14/14 PASS
- browser console/page errors: 0
- page-level horizontal overflow in tested views: 0
- six-step mobile Booking progress is now contained in its own horizontal scroller: PASS

## Code / dependency gate
- external JavaScript syntax: PASS
- inline JavaScript syntax: PASS
- local resource integrity: PASS
- shared `account-header.js` loaded once per applicable page: PASS
- `club-registry.js` loaded once per applicable page: PASS
- stray root test file removed: PASS

## Static-build boundary
Player and Club account state remains browser-local in this build. Secure authentication, cross-device sessions, account recovery, and provider login remain part of the Supabase Auth production phase.

## Release decision
**PASS — v14.24.2 approved as the stable Client baseline.**
