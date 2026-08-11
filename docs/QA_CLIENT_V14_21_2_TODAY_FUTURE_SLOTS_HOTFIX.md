# QA — NorthZone Client v14.21.2 Today Future Slots Hotfix

## Reported Issue
When Today was selected in the afternoon, the booking page could present the entire day's time grid as unavailable. Expected behavior is slot-level eligibility: earlier times are unavailable because they are past, while future times remain selectable when at least one court is free.

## Fix
- Today is evaluated per individual time slot.
- Past slots are disabled individually and labeled `Past`.
- Future slots remain eligible if at least one court is free.
- Actual Admin public-contract booking blocks remain authoritative.
- Removed the old synthetic/random facility-unavailability fallback.
- When no Admin public contract exists, valid slots are no longer fabricated as occupied.
- No-date slots now communicate `Select date` instead of generic `Unavailable`.
- Added booking runtime cache-busting (`?v=14.21.2`) to avoid stale GitHub Pages/browser JavaScript.

## Exact Regression Scenario
Fixed clock: **2026-08-10 3:32 PM Asia/Manila**

With current Admin v35 booking blocks:
- 7:00 AM–3:00 PM: disabled as `Past` — PASS
- 4:00 PM: enabled — PASS
- 5:00 PM onward: evaluated against actual court occupancy — PASS
- 4:00 PM + available court: `Continue to Booking Setup` enabled — PASS
- 7:00 PM: Courts 1, 2, 4 and 5 unavailable; Court 3 available — PASS
- Browser/page errors in targeted logic smoke: 0 — PASS

## Static Regression
- All external JavaScript syntax: PASS
- Local resource integrity: PASS
- Phase 5 Admin public-contract integration retained: PASS
- v14.20.1 navy-button readability baseline retained: PASS

## Release Decision
**PASS — release as v14.21.2 targeted Client hotfix.**
