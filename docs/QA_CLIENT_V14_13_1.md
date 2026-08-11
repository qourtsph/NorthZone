# NorthZone Client v14.13.1 — Demo Club Portal Access

## Preview access
- My Portal contains Preview Club Portal CTA: PASS
- Preview CTA opens `club-portal.html?demo=1`: PASS
- Demo session starts without registration: PASS
- Demo session starts without approval workflow: PASS
- Demo session starts without email/password: PASS
- Existing real Club Sign In remains: PASS
- Existing Register a Club remains: PASS

## Demo session isolation
- Demo session is marked `demoPreview`: PASS
- Demo club resolves even if Admin localStorage contains a different club registry: PASS
- Normal club sign-in remains Admin/bundled-registry driven: PASS
- Club → NorthZone Admin access is not added: PASS

## Preview workspace
- Demo club profile available: PASS
- Sample reservation history seeded: PASS
- Sample payment history seeded: PASS
- Pricing and privileges visible: PASS
- Authorized representative visible: PASS
- Demo Preview badge visible: PASS
- Reset Demo Data available: PASS
- Book Courts from demo portal retains demo club session: PASS

## Regression
- club-registry.js syntax: PASS
- club-portal.js syntax: PASS
- portal.js syntax: PASS
- booking.js syntax: PASS
- My Portal player path retained: PASS
- Local resource integrity: PASS
