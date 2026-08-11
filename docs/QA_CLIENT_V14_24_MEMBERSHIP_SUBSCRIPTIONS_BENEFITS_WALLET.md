# QA — NorthZone Client v14.24 Membership Subscriptions, Benefits & Wallet

## Membership discovery and purchase

- Admin-published membership plans displayed on Client: PASS
- Client membership plan prices are not hardcoded: PASS
- Player account identification: PASS
- approved Club account identification: PASS
- account-specific plan eligibility: PASS
- full checkout: Review → Sign → Payment → Submitted: PASS
- typed signature exact-match validation: PASS
- acknowledgement required: PASS
- GCash / Maya / Pay at Venue contract support: PASS
- payment proof support: PASS
- pending payment-verification state: PASS
- benefits remain inactive until Admin verifies: PASS
- Client detects active subscription after verification: PASS

## Shopee/Lazada-style booking benefit selector

- savings/credit selector shown at Review checkout: PASS
- single radio group: PASS
- **one benefit maximum per booking:** PASS
- selecting another option replaces previous selection: PASS
- No Benefit / Standard Price option: PASS
- Membership Court Discount: PASS
- Free Court Hour: PASS
- Free Paddle Rental: PASS
- Free Coaching Session contract: PASS
- Member Wallet / Credits: PASS
- private Club Special Rate when available to signed-in Club: PASS
- Club Special Rate does not stack with Membership Discount: PASS
- gross / savings / amount due shown separately: PASS
- zero-due booking removes external payment requirement: PASS

## Member profile

### My Qourts
- Membership tab: PASS
- active plan / renewal: PASS
- court credits remaining and consumed: PASS
- paddle credits remaining and consumed: PASS
- coaching credits remaining and consumed: PASS
- wallet balance: PASS
- wallet transaction history: PASS
- benefit usage ledger: PASS
- membership discount savings usage: PASS
- membership payment history: PASS

### Club Portal
- Membership tab: PASS
- active Club plan: PASS
- Club credits remaining and consumed: PASS
- Club wallet / transaction history: PASS
- Club membership payment history: PASS

## End-to-end smoke

**54/54 membership checks PASS** across Player subscription, Club subscription, Player checkout, Club checkout, Player profile, Club profile, and Admin activation.

Report: `docs/MEMBERSHIP_E2E_V35_4_V14_24.json`

## Full Client regression

- Desktop pages: 9/9 PASS
- Mobile views: 5/5 PASS
- Total views: **14/14 PASS**
- Browser/page errors: 0
- JavaScript syntax: PASS
- local resource integrity: PASS

Report: `docs/BROWSER_SMOKE_V14_24_FULL_CLIENT.json`

## Privacy boundary

- private Admin Club pricing is not exposed by the public contract: PASS
- Club Special Rate comes only from signed-in private Club account context: PASS
- Admin independently revalidates the private Club rate: PASS
- pending subscription signature/payment proof/reference are not public: PASS
- no Client membership file contains hardcoded Admin plan prices: PASS

## Existing booking regressions retained

- default selected date = Today: retained
- only past Today slots disabled: retained
- exact Coach rates: retained
- Coach availability source of truth: retained
- certifications/specialties: retained
- verified Coach Reviews: retained

## Static boundary

The current account/payment transport remains browser-local. Production must use Supabase Auth/RLS/private account queries/payment verification for secure cross-device membership, wallet, credits, and Club pricing.

## Release decision

**PASS — v14.24 approved as the stable Client membership baseline.**
