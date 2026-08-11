# QA — NorthZone Client v14.24.3 Google-Style Navigation & Profile Account

## Navigation
- desktop order `Home · Events · Membership · Book a Court`: PASS
- separator before Profile/account control: PASS
- legacy `Open Play` removed from primary desktop nav: PASS
- legacy `Explore` removed from primary desktop nav: PASS
- legacy `My Portal` top-nav pill removed: PASS
- legacy separate `Reserve a Court` CTA removed from primary header: PASS
- Home routes to `index.html`: PASS
- Events retains `events.html`: PASS
- Membership retains `membership.html`: PASS
- Book a Court retains `booking.html`: PASS

## Signed-out account state
- header displays `Sign In`: PASS
- Player Sign In option: PASS
- Club Sign In option: PASS
- Register as Player option: PASS
- Register a Club option: PASS

## Signed-in Player state
- Sign In replaced by circular profile badge: PASS
- account name appears below badge on desktop: PASS
- profile photo used when available: supported
- initials fallback when photo is absent: PASS
- account menu greets Player by first name: PASS
- primary account action opens My Qourts: PASS
- Membership / Switch Account / Sign Out actions retained: PASS

## Signed-in Club organizer state
- active Club organizer context takes priority over simultaneous Player profile: PASS
- organizer/representative name appears under badge: PASS
- representative photo used when available: supported
- initials fallback when photo is absent: PASS
- primary account action opens Club Portal: PASS
- Club name/role context appears in account panel: PASS

## Responsive
- mobile account badge remains visible: PASS
- mobile Sign In remains available when signed out: PASS
- mobile drawer uses Home / Events / Membership / Book a Court / Profile: PASS
- mobile page-level horizontal overflow: 0 in tested views

## Browser smoke
- targeted navigation/account checks: 21/21 PASS
- shared/public page smoke: 8/8 PASS
- full Client regression: 14/14 views PASS
  - 9 desktop
  - 5 mobile
- browser console/page errors: 0

## Code/resource gate
- external JavaScript syntax: PASS
- inline JavaScript syntax: PASS
- local resource integrity: PASS
- shared account header loaded on all full-header pages: PASS

## Release decision
**PASS — v14.24.3 approved as the stable Client navigation/account-header baseline.**
