# NorthZone Client v14.9 — Coaching Session Time Selector

## Coached Training Flow
- No additional progress-bar step added: PASS
- Coaching time is selected inside `Customize your booking`: PASS
- Player only sees hours already included in the court reservation: PASS
- No manual time-entry field: PASS
- No separate duration question: PASS
- Duration is derived from selected coaching hours: PASS
- One or more coaching hours may be selected: PASS
- Selected coaching hours must be consecutive: PASS
- Non-consecutive coaching selection is prevented: PASS

## Example
Court booking:
`9:00 AM–12:00 PM · 3 hours`

Available coaching choices:
- `9:00–10:00 AM`
- `10:00–11:00 AM`
- `11:00 AM–12:00 PM`

Selecting `10:00–11:00 AM`:
- Coaching duration = 1 hour: PASS
- Coach charge = 1 × hourly coaching rate: PASS

Selecting `9:00–10:00 AM` + `10:00–11:00 AM`:
- Coaching session = `9:00–11:00 AM`: PASS
- Coaching duration = 2 hours: PASS
- Coach charge = 2 × hourly coaching rate: PASS

## Coach Availability
- Coach availability checks selected coaching hours only: PASS
- Coach availability no longer requires the coach to be free for the entire court reservation: PASS
- Recommendations wait until coaching time is selected: PASS
- Unavailable coaches may show an alternative same-duration window within the booked court hours: PASS
- Goal-to-specialty ranking retained: PASS

## Court Assignment
- No additional coaching-court question added: PASS
- One of the selected reservation courts is assigned automatically: PASS
- Coaching court is shown in summaries/review when available: PASS

## Booking Records
- Your Booking shows coach + exact coaching time + duration: PASS
- Review shows Coaching Time: PASS
- Review shows Coaching Court: PASS
- Coaching add-on price uses coaching duration: PASS
- Confirmation includes Coaching Time / Court: PASS
- Club booking payload stores coaching times, duration, and court: PASS

## Regression
- Six-step booking flow retained: PASS
- Booking Purpose / Add-ons consolidation retained: PASS
- 1–3 coaching priorities retained: PASS
- Coach profiles / privacy protections retained: PASS
- Ball Machine registry behavior retained: PASS
- Policy / Review / Payment flows retained: PASS
- JavaScript syntax: PASS
- Local resource integrity: PASS
