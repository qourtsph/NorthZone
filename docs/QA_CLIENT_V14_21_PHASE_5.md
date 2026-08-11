# QA — NorthZone Client v14.21 Phase 5

## Release Gate
- External JavaScript syntax: PASS
- Inline JavaScript syntax: PASS
- Static resource integrity: PASS
- Private Admin-state dependency scan: PASS
- Cross-package Phase 5 smoke: 9/9 PASS
- Admin public contract detection: PASS
- Coach public contract source: PASS
- Equipment public contract source: PASS
- Club Registration → Admin inbound queue: PASS
- Booking Request → Admin inbound queue/import: PASS
- Admin recalculates booking total rather than trusting Client display total: PASS
- v14.20.1 navy-button readability baseline preserved.

## Integration Behavior
When an Admin public contract is available, the Client uses it for booking configuration, operating hours, court blocks, published policies, coach data/rates/availability, and rental equipment.

The old randomized facility-availability fallback is used only when no Admin contract exists.

Auth-sensitive actions such as Praise remain staged in the inbound queue in the static build rather than being falsely trusted.
