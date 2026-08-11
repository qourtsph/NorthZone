# NorthZone Client v14.10.1 — Admin-Driven Coach Group Rates

## Pricing authority
- Multi-student coaching rates come from the selected coach's Admin rate table: PASS
- No hard-coded 2-player rate: PASS
- No hard-coded 3-player rate: PASS
- No hard-coded 4-player rate: PASS
- Generic additional-student surcharge removed from client pricing: PASS
- Generic club group-coaching override removed from client pricing: PASS

## Rate resolution
- 1 player may use explicit 1-player rate when configured: PASS
- 1 player may fall back to the coach's existing base rate for backward compatibility: PASS
- 2+ players require an exact per-coach participant-count rate: PASS
- Missing group rate does not fall back to the 1-player/base rate: PASS
- Missing group rate does not create an inferred price: PASS
- Coach is non-selectable when the requested group-size rate is missing: PASS
- UI displays `RATE NOT SET` / `Group rate not configured`: PASS

## Capacity / schedule
- Coach max-student capacity remains Admin-driven: PASS
- Schedule availability remains time-specific: PASS
- Capacity + rate + schedule must all pass before coach can be selected: PASS

## Privacy / regression
- Public coach pricing contract remains whitelist-based: PASS
- Private HR/contact fields remain excluded: PASS
- Coaching participant count retained: PASS
- Coaching time selector retained: PASS
- Your Booking / Review / Confirmation retained: PASS
- JavaScript syntax: PASS
- Local resource integrity: PASS
