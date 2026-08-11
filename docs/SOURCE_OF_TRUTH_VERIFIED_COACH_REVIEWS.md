# Verified Coach Reviews — Source of Truth

## Identity and eligibility

A Coach Review is not a free-form public rating.

The authoritative relationship is:

`Coaching Booking ID → Coach Profile ID → Completed Session → One Review`

A review may be created only when:
1. the booking exists,
2. the booking type is `Coaching`,
3. its canonical status is `completed`,
4. it has a canonical `coachProfileId`,
5. no review already exists for that booking,
6. the submitted Coach Profile matches the booking,
7. when a canonical player ID is available, the reviewer identity matches it.

## Automatic completion

Confirmed coaching sessions are automatically checked while Admin is running.

Once the scheduled coaching end time has passed:
- status becomes `completed`,
- `completedAt` is stored,
- the event is audited,
- review eligibility becomes available.

The Admin **Complete Session** button remains an audited fallback/override. An early override is explicitly recorded with `completionOverride = true`.

## Rating model

Rating is an integer:
`1, 2, 3, 4, or 5`

The customer-facing labels are:
- 1 — Poor
- 2 — Fair
- 3 — Good
- 4 — Very Good
- 5 — Excellent

Written comments are optional and limited to 500 characters.

## Public Coach Profile

Only `published` verified reviews contribute to:
- average rating,
- review count,
- 1–5 distribution,
- public review list.

No review is seeded simply to make a Coach Profile look established.

## Moderation

Admin may:
- view verified reviews,
- remove a review with a required moderation reason,
- restore a removed review.

Admin may **not**:
- create a review on behalf of a player,
- edit the player's star rating,
- edit the player's written comment.

Removal excludes the review from the public average without altering the original rating/comment.

## Reviewer privacy

Public reviewer display names are reduced. Example:
`Carlos Deang → Carlos D.`

Email, mobile, payment information, HR data, and other private Admin fields are never included in the public Coach Review contract.

## Static build limitation

The current environment uses the existing Phase 5 browser-local contract and inbound queue.

This provides correct product behavior for the Git/demo build, but it is not production identity enforcement.

Production should move the same contract to:
- Supabase Auth for verified player identity,
- Row Level Security,
- server/database uniqueness on `booking_id`,
- server-side completion/review validation,
- persistent notifications,
- cross-device review eligibility,
- immutable moderation/audit history.
