# Temporary Demo Coaching Rates — Coach Raf

These values are **sample/demo data only**. They are not approved NorthZone production prices.

| Players | 30 min | 60 min | 90 min | 120 min | 150 min | 180 min |
|---:|---:|---:|---:|---:|---:|---:|
| 1 | ₱500 | ₱900 | ₱1,300 | ₱1,700 | ₱2,100 | ₱2,500 |
| 2 | ₱650 | ₱1,200 | ₱1,750 | ₱2,300 | ₱2,850 | ₱3,400 |
| 3 | ₱800 | ₱1,500 | ₱2,200 | ₱2,900 | ₱3,600 | ₱4,300 |
| 4 | ₱950 | ₱1,800 | ₱2,650 | ₱3,500 | ₱4,350 | ₱5,200 |

## Behavior
- Exact session pricing is configured for 1–4 players.
- Exact durations: 30, 60, 90, 120, 150, and 180 minutes.
- No formula is used by the booking engine; every cell is stored as its own exact rate.
- Existing real rates are never overwritten by the Admin migration.
- Temporary demo rows only fill missing rate combinations.
- Coach Raf receives temporary 07:00–23:00 daily availability only when no real recurring availability exists.
- Replace/remove `demo_temporary` rates before production launch.
