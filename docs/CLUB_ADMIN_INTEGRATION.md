# Club Admin Integration Contract

This client release does not grant Clubs access to the NorthZone Admin portal. Production Admin needs a private Club Registry / Approval module that owns:

- Club application approval / rejection
- Club ID generation
- Club status (Pending / Approved / Suspended / Inactive)
- Authorized representatives and roles
- Club pricing profile
- Booking privileges
- Admin-only notes

The client expects a public-safe Club contract containing only the approved club identity, the signed-in representative's permitted role, applicable pricing/privileges, and that club's own reservation/payment records. Admin-only notes, other clubs, accounting internals, staff data, and ERP navigation must never be returned to a Club session.
