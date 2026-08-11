# NorthZone Client v14.21.1 — Today Time-Slot Hotfix QA

## Issue
When the booking date was Today, a past time slot could remain selected while a later slot was added. Step 1 correctly rejected the reservation because the earliest selected slot was already in the past, but the UI did not explain the cause and `Continue to Booking Setup` remained disabled.

## Fix
- Past slots on Today are disabled.
- Past slots display `Past` instead of looking like ordinary availability.
- Admin-configured minimum lead-time slots display `Lead time` when not yet bookable.
- Slots outside configured bookable operating hours remain disabled.
- Any selected slot that expires while the booking page is open is automatically removed on re-render.
- Step 1 validation now uses the same slot-eligibility function as the visual availability grid.
- Future slots Today remain valid when they satisfy the configured minimum lead time.

## Targeted browser smoke
Fixed clock: 2026-08-10 1:49 PM Asia/Manila.

- 1:00 PM disabled: PASS
- 1:00 PM displays `Past`: PASS
- 2:00 PM future slot selectable: PASS
- Available courts for future slot: PASS
- Continue to Booking Setup enabled after date + future time + court: PASS
- Footer shows reservation ready state: PASS
- Selected slot automatically cleared after simulated expiry: PASS
- Continue disabled after simulated expiry: PASS
- Browser console/page errors: 0

## Regression boundary
This is a targeted Client hotfix only. The Phase 5 Admin v35.0 integration contract and data model are unchanged.
