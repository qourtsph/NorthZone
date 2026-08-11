# NorthZone Membership — Source of Truth v35.4

## Governing rule

**NorthZone Admin is authoritative.** The Client does not define membership plans, prices, credits, wallet balances, or discount percentages.

The Client consumes the sanitized Phase 5 membership contract and submits requests back through the inbound integration queue. Admin revalidates every subscription and every booking benefit before it becomes canonical.

## Canonical membership entities

- `membershipPlans` — package name, type, billing cycle, price, booking discount, monthly credits, wallet bonus, privileges.
- `members` — active/inactive Player or Club subscription.
- `membershipSubscriptionRequests` — signed Client subscription checkout awaiting payment verification.
- `membershipInvoices` — membership charge/payment history.
- `memberWallets` — current wallet / booking-credit balance.
- `memberWalletTransactions` — wallet credit/debit ledger.
- `memberBenefitUsage` — consumed court, paddle, coaching, and membership-discount benefit ledger.

## Account types

### Player
A Player subscription is tied to a canonical `playerId` / Qourts identity.

Eligible plan types:
- Individual
- Family

### Club
A Club subscription is tied to a canonical **approved** `clubId`.

Eligible plan types:
- Club
- Corporate

Club membership does not grant NorthZone Admin access. Club Portal remains a separate customer-facing account.

## Subscription lifecycle

`Choose Plan → Signed Account Identified → Acknowledgement Accepted → Payment Submitted → Pending Payment Verification → Admin Verifies → Membership Active`

Before payment verification:
- no membership discount is active,
- no included credits are active,
- no wallet/member privilege is created from the subscription request.

Admin verification creates:
- active member record,
- renewal date,
- paid initial membership invoice,
- accounting posting for membership revenue,
- payment-clearing posting for the verified payment.

## Checkout benefit rule — exactly one

Booking checkout always starts from **standard gross pricing**. Account benefits are shown as selectable savings options.

A booking can select **one and only one** of the applicable options:

- Club Special Rate
- Membership Court Discount
- Free Court Hour Credit
- Free Paddle Rental Credit
- Free Coaching Session Credit
- Member Wallet / Credits
- No benefit

Selecting another option replaces the current option. Benefits never stack in one booking.

This invariant exists on both sides:
- Client uses one radio-group selection.
- Admin accepts one `savingsSelection.code` and independently recomputes its canonical savings amount.

## Benefit consumption timing

Credits and wallet are **not consumed when a booking request is submitted**.

They are consumed only when the canonical booking is confirmed:

- `court_hours_credit` → decrements monthly free court-hour balance.
- `paddle_credit` → decrements monthly free paddle-rental balance.
- `coaching_credit` → decrements monthly free coaching-session balance.
- `member_wallet` → creates a wallet debit.
- `membership_discount` → logs the monetary savings in benefit usage for member reporting.
- `club_rate` → uses a private rate but consumes no membership credit.

Confirmation is idempotent. Reconfirming the same booking does not consume the benefit again.

If a selected membership benefit is no longer valid or its available amount changes before confirmation, Admin returns `benefit_changed` rather than silently overdrawing the account.

## Zero-due bookings

If the selected single benefit covers the full booking total:

- Client displays **No External Payment Due**,
- no GCash/Maya reference or proof is required,
- Admin stores the booking payment method as `Membership Benefit / Credit`,
- Admin still validates and consumes the benefit only at confirmation.

## Member profile visibility

### My Qourts → Membership
Player can monitor:
- active plan,
- renewal date,
- membership discount,
- remaining court hours,
- remaining paddle credits,
- remaining coaching credits,
- used amount for the current cycle,
- wallet balance,
- wallet transaction history,
- benefit usage history,
- membership payment history.

### Club Portal → Membership
Approved Club account receives the equivalent Club-level membership/credit/wallet view.

## Private Club Special Rates

Special Club pricing remains private.

The public Admin contract does **not** publish:
- private club court pricing,
- rate-rule values,
- club payment details,
- club representative credentials.

A Club Special Rate can appear only from the signed-in Club Portal's private account context. Admin independently revalidates the canonical private rate rule when the booking request is imported.

Therefore, manipulating the Client price cannot change the Admin-calculated booking total.

## Public contract privacy

Published membership data contains only information needed by the customer experience.

Pending subscription projection excludes:
- typed signature name,
- payment reference,
- payment proof data,
- private Admin notes.

Public contract also excludes Finance/HR internals such as journals, payroll, compensation, and private Club pricing.

## Static build boundary

v35.4 / v14.24 still use the existing browser-local Phase 5 bridge.

This architecture is production-shaped but is **not production identity or payment enforcement**. Production migration should move the same contracts to Supabase with:

- Supabase Auth for Player and Club identities,
- RLS for private membership and Club pricing,
- server-side uniqueness for active subscriptions,
- server-side transaction/credit locking,
- authoritative payment/webhook verification,
- cross-device wallet/credit state,
- immutable subscription/benefit audit history.
