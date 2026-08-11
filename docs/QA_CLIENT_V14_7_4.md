# NorthZone Client v14.7.4 — Time-First Booking + Live Duration

## Reservation Builder
- Availability-method Step 2 removed: PASS
- By Time / By Court selector removed: PASS
- By Court runtime branch removed: PASS
- Time-first flow is now the only reservation path: PASS
- Date remains section 01: PASS
- Hour / court availability section renumbered to 02: PASS
- Existing time-slot selection retained: PASS
- Courts still filter against all selected hours: PASS

## Your Booking
- Live selected-time block added: PASS
- Selecting 8:00 AM + 9:00 AM shows `8:00 AM–10:00 AM · 2 hours`: PASS
- Single hour uses singular `1 hour`: PASS
- Non-contiguous hours show separate ranges plus total selected duration: PASS
- Added reservations show their saved duration: PASS
- Existing running tab, subtotals, add-ons, and total retained: PASS

## Regression
- Individual / Club logic unchanged: PASS
- Coaching / coach matching unchanged: PASS
- Equipment / Ball Machine logic unchanged: PASS
- Review / policy / payment flows unchanged: PASS
- JavaScript syntax: PASS
- Local resource integrity: PASS
