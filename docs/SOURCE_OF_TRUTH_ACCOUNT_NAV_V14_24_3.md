# Account Header & Primary Navigation — Source of Truth v14.24.3

## Primary navigation
The public NorthZone header has four primary navigation destinations:

1. Home → `index.html`
2. Events → `events.html`
3. Membership → `membership.html`
4. Book a Court → `booking.html`

The account control is visually separated from navigation by a divider.

## Active account context
The shared `account-header.js` resolves account context in this priority order:

1. Active approved/demo Club Portal session + current representative
2. Player / My Qourts local profile
3. Signed out

This means a player who is also currently acting as a Club organizer sees the organizer identity in the header until the Club session is signed out.

## Profile badge
For signed-in accounts:
- use representative/player image data when available
- otherwise display generated initials
- show account/organizer name beneath the badge on desktop/tablet
- on very narrow mobile widths, retain the badge while hiding the small name label to protect layout

## Signed-out state
The profile area becomes a `Sign In` control. The account menu provides:
- Player Sign In
- Club Sign In
- Register as Player
- Register a Club

## Portal destinations
- Player → `my-qourts.html`
- Club organizer → `club-portal.html`
- Switch Account → `portal.html`

## Scope
This is a Client navigation/account UI change only. It does not alter Admin membership, booking, finance, or authentication data contracts.
