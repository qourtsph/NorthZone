# NorthZone Client v14.4.7 — Equipment Registry Aware

## Equipment source
- Hardcoded `MACHINE_COUNT=1` removed: PASS
- Client includes Admin-compatible Equipment Registry adapter: PASS
- Adapter reads `northzone_admin_v11.equipmentAssets` when available on the same origin: PASS
- Bundled fallback mirrors the current Admin Equipment list: PASS
- Current fallback contains one Good Condition Ball Machine: PASS
- Under Maintenance / For Replacement / Discarded machines are not counted as available inventory: PASS

## Automatic control behavior
- 0 machines available for selected schedule → gray/disabled: PASS
- 1 machine available → toggle: PASS
- 2+ machines available → paddle-style quantity selector: PASS
- Quantity selector maximum = schedule-aware available quantity: PASS
- Same physical machine must be free across every selected time slot: PASS
- Existing quantity is clamped if schedule availability decreases: PASS

## Schedule / availability
- Existing equipment reservations are asset-specific: PASS
- Overlapping reservations subtract only the booked machine asset(s): PASS
- Fully booked message retained: PASS
- Soonest availability retained and now reports available quantity: PASS

## Pricing
- Ball Machine cost = selected quantity × unique machine clock-hours × rate: PASS
- Number of courts does not multiply Ball Machine hours: PASS

## Regression
- booking.js syntax: PASS
- equipment-registry.js syntax: PASS
- Existing booking flow retained: PASS
- Equipment photo/vector retained: PASS
- Official NorthZone logo retained: PASS
- My Qourts retained: PASS
- Local resource integrity: PASS

## Production boundary
Admin and Client localStorage are only shared when both are served from the same browser origin. The adapter is intentionally isolated so Supabase can become the authoritative Equipment + Equipment Reservation source without changing the booking control rules.
