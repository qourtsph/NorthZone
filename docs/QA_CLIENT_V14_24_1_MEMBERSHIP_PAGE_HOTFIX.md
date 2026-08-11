# QA — NorthZone Client v14.24.1 Membership Page Hotfix

## Reported issue

The Membership page could be opened directly from the extracted Client package, but two failures were visible:

1. the page shell stopped at the old `1180px` main width, leaving a large blank area on wide displays;
2. the page showed `0 active plans` when no live same-origin Admin public contract existed in that browser context.

The hero title was also using dark text over the dark navy membership hero.

## Root cause

### Layout
The v14.24 Membership stylesheet applied:

- `membership-v2 { max-width: 1180px }`
- hero padding intended for an inner container rather than the page shell
- a dark heading color that overrode the shared white hero typography

This constrained the whole Membership page instead of only constraining its inner content.

### Membership data
`membership.js` refused to render plans unless `NorthZonePlatformBridge.contract()` was live in the current browser origin.

That is valid for a connected deployment, but it made a directly opened static Client package look empty even though Admin v35.4 contains active membership plans.

## Fix

- Membership main shell now uses the full viewport width.
- Hero spans the full viewport.
- Membership content remains centered at a maximum `1320px` content width.
- Hero title is white/readable on the navy gradient.
- Mobile retains a single-column plan layout with no horizontal overflow.
- Added `membership-public-snapshot.js`, generated from the current NorthZone Admin v35.4 public membership configuration at package-build time.
- Live Admin public contract always takes priority over the bundled snapshot.
- Only relatively stable plan configuration and membership payment-method availability are bundled.
- Dynamic membership account state, wallet balances, credit usage, and pending subscriptions are deliberately **not** bundled, preventing stale account balances from being treated as current.
- The snapshot is loaded on Membership, Booking, My Qourts, and Club Portal because those pages consume membership configuration.

## Standalone Membership smoke — 9/9 PASS

- 1728px Membership main shell equals viewport width: PASS
- 1728px hero equals viewport width: PASS
- four current Admin membership plans rendered: PASS
- hero heading readable/white: PASS
- bundled Admin membership source recognized: PASS
- GCash / Maya / Pay at Venue available from Admin snapshot: PASS
- signed-in local Player can open membership checkout: PASS
- signed Player subscription queues `membership_subscription`: PASS
- 390px mobile has no horizontal overflow and uses one plan column: PASS

Current plans verified from Admin v35.4:

- NorthZone Individual
- NorthZone Family
- NorthZone Club
- NorthZone Corporate

## Live-contract precedence

Tested with an injected valid live Admin public contract:

- live plan replaces bundled snapshot plan list: PASS
- `NorthZoneMembershipRegistry.source()` becomes `admin-public-contract`: PASS
- live payment-method configuration replaces snapshot payment methods: PASS

This confirms the snapshot is a fallback only, not a competing source of truth.

## Full Client regression

Same coverage as v14.24:

- Desktop pages: 9/9 PASS
- Mobile views: 5/5 PASS
- Total: **14/14 PASS**
- Browser/page errors: 0

Pages checked:

- index.html
- booking.html
- portal.html
- my-qourts.html
- club-register.html
- club-portal.html
- events.html
- membership.html
- open-play.html
- mobile index.html
- mobile booking.html
- mobile my-qourts.html
- mobile club-portal.html
- mobile membership.html

## Code / dependency gate

- all external JavaScript syntax: PASS
- inline JavaScript syntax: 8/8 PASS
- local resource integrity: PASS
- bundled membership plans match Admin v35.4 public plan contract exactly: PASS
- bundled payment methods match Admin v35.4: PASS
- dynamic membership accounts bundled: **0**
- stale “open alongside Admin or no plans” hard-block removed: PASS
- duplicate/conflicting v14.24.1 CSS override block: none
- authoritative v14.24 Membership CSS corrected directly: PASS

## Scope

This is a **Client-only hotfix**. NorthZone Admin v35.4 remains unchanged and remains the authoritative membership engine.

## Release decision

**PASS — v14.24.1 approved as the Client Membership page hotfix baseline.**
