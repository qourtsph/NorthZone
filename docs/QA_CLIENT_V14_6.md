# NorthZone Client v14.6 — Coaching Goals & Coach Matching

## Booking Purpose / Training
- Booking Purpose terminology retained: PASS
- Training reveals Self-Guided Practice / Train with a Coach: PASS
- Non-coached bookings do not require coaching-goal or coach-selection data: PASS

## Coaching Priorities
- Structured coaching-focus checklist: PASS
- Minimum priorities for coached session: 1: PASS
- Maximum priorities: 3: PASS
- Remaining unchecked priorities disable after 3 are selected: PASS
- Other option: PASS
- Other reveals required custom focus field: PASS
- Coaching Notes / Special Requests: PASS
- Coaching priorities and notes carried into Review: PASS

## Coach Recommendation
- Goal-to-specialty match engine: PASS
- Schedule availability is a hard booking constraint: PASS
- Available coaches rank before unavailable coaches: PASS
- Higher specialty match ranks first among equivalent availability: PASS
- Transparent `x of y priorities matched` language: PASS
- No artificial percentage recommendation: PASS
- View Profile: PASS
- Select Coach: PASS
- Coach must be selected before continuing with coached training: PASS

## Public Coach Profile
- Coach photo / name / public title: PASS
- Bio when listed: PASS
- Specialties when listed: PASS
- Skill levels coached when listed: PASS
- Coaching experience when listed: PASS
- Active certifications when listed: PASS
- Certification issuer / expiry when listed: PASS
- Session rate: PASS
- Schedule-aware availability: PASS
- Fallback profile does not invent specialties or certifications: PASS

## Privacy / Commercial Control
- Public coach registry is whitelist-based: PASS
- Employee email excluded: PASS
- Mobile excluded: PASS
- Address excluded: PASS
- Emergency contact excluded: PASS
- Payroll fields excluded: PASS
- Internal employee notes excluded: PASS
- No direct coach contact CTA: PASS
- Coaching is selected and paid through the NorthZone reservation flow: PASS
- Automated privacy test with intentionally private employee data: PASS

## Existing Systems
- 7-step primary booking flow: PASS
- Registry-aware Ball Machine availability retained: PASS
- Ball Machine 0 / 1 / 2+ adaptive controls retained: PASS
- Coaching fee included in Add-ons / booking total: PASS
- Payment / confirmation flow retained: PASS
- JavaScript syntax: PASS
- Duplicate-function scan: PASS
- Local resource integrity: PASS
- Mobile viewport coverage: PASS

## Production Boundary
Admin and Client localStorage can only share data when both are served from the same browser origin. `coach-registry.js` deliberately defines a public-safe data contract so Supabase can later become the authoritative People, Certification, Coach Schedule, and Coaching Booking source without exposing private employee information.
