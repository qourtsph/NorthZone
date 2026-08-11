# NorthZone Client v14.4.6 — Single Ball Machine Availability

- Ball machine inventory fixed at exactly 1: PASS
- Add-on disabled when selected schedule overlaps an existing machine booking: PASS
- Unavailable card gray treatment: PASS
- `Ball machine is booked for this schedule.` message: PASS
- Soonest next availability calculation: PASS
- Disabled toggle cannot be selected: PASS
- Existing machine selection auto-clears if cart changes into a conflict: PASS
- Ball machine pricing changed from court-hours to unique machine clock-hours: PASS
- Five courts for one hour = one ball-machine hour: PASS
- Demo Aug 10, 2026 9:00 AM conflict → next availability 11:00 AM: PASS
- booking.js syntax: PASS
- Local resource integrity: PASS

Production note: static demo machine reservations stand in for server-authoritative equipment bookings. When Supabase is connected, `DEMO_MACHINE_RESERVATIONS` should be replaced by live ball-machine reservations from the shared booking database.
