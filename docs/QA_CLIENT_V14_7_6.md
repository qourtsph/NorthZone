# NorthZone Client v14.7.6 — Auto Reservation / Continue Flow

## Step 1
- `Add to Booking` button removed: PASS
- Bottom selection/commit bar removed: PASS
- Date + time + court automatically becomes the active reservation: PASS
- Changing time or courts automatically updates the reservation: PASS
- Invalid court selections are removed when the time range changes: PASS
- Continue to Booking Purpose is the only forward action: PASS
- Continue remains disabled until date, time, courts, and availability are valid: PASS

## Your Booking
- Full reservation-card interface appears immediately when selection is valid: PASS
- Date retained: PASS
- Time range + duration retained: PASS
- Court count + court names retained: PASS
- Court-hours retained: PASS
- Reservation subtotal retained: PASS
- Booking subtotal / total retained: PASS
- Duplicate lightweight live preview hides once full reservation exists: PASS

## Regression
- Time-first reservation builder retained: PASS
- Individual / Club access logic retained: PASS
- Club private pricing retained: PASS
- Coaching / coach matching retained: PASS
- Equipment / Ball Machine logic retained: PASS
- Review / policy / payment flows retained: PASS
- JavaScript syntax: PASS
- Local resource integrity: PASS

## Product behavior
Step 1 now represents one active reservation. If multi-reservation booking is added again later, it should use an explicit `Add another reservation` action rather than restoring a separate commit step.
