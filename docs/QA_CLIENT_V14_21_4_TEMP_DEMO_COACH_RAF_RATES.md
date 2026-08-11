# QA — Client v14.21.4 Temporary Demo Coach Raf Rates

## Purpose
Allow the standalone Client demo to complete coached-training setup even when an Admin public contract is not present.

## Coverage
- Coach Raf: 1–4 players
- Exact durations: 30 / 60 / 90 / 120 / 150 / 180 minutes
- 24 exact demo rate rows
- Temporary 7-day 07:00–23:00 fallback availability
- Max demo session size: 4 players

## Booking-flow smoke
A 4-player, 180-minute coached session was tested:
- exact rate found: ₱5,200
- `RATE NOT SET`: not shown
- Coach Raf available: PASS
- Select Coach control enabled: PASS
- Coach selection succeeds: PASS
- Step 2 becomes valid: PASS
- coaching subtotal: ₱5,200
- Browser errors: 0

## Source-of-truth behavior
When the Admin Phase 5 public contract is available, its Coach Raf rates and availability remain authoritative. The temporary Client matrix is only the standalone fallback.

## Regression
- `coach-registry.js` syntax: PASS
- `booking.js` syntax: PASS
- local resource integrity: PASS
- v14.21.3 default-Today booking behavior retained

## Production warning
These values are temporary demo prices and must not be treated as approved NorthZone coaching rates.
