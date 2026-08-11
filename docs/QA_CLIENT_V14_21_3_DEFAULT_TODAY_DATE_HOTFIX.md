# QA — NorthZone Client v14.21.3 Default Today Date Hotfix

## UX correction
The Booking page now selects the player's browser-local **Today** automatically on initial load.

A player is no longer required to choose a date before the system reveals availability.

## Exact browser scenario
Fixed test clock: **August 10, 2026 · 3:30 PM · Asia/Manila**

- Today auto-selected: PASS
- Today visibly highlighted in calendar: PASS
- Selected-date chip shows Aug 10: PASS
- 7:00 AM, 12:00 PM, 3:00 PM disabled as Past: PASS
- 4:00 PM remains selectable: PASS
- Available court selectable at 4:00 PM: PASS
- Continue to Booking Setup activates: PASS
- 7:00 PM remains selectable when at least one court is free: PASS
- Admin court blocks respected (C1/C2/C4/C5 occupied; C3 free): PASS
- Choosing Aug 11 overrides the default Today selection: PASS
- Browser console/page errors: 0

## Regression
- External JavaScript syntax: PASS
- Static local resource references: PASS
- Phase 5 integration contract retained
- v14.21.2 future-slot behavior retained
- No Admin package change required

## Rule
Default date is dynamically generated from the player's local browser date on each Booking page load. It is not hard-coded.
