# QA — NorthZone Client v14.22 Coach Credentials, Specialties & Availability

## Coach selection
- Lobs added to player coaching goals: PASS
- fixed booking goals exactly match Admin specialty options: PASS
- Admin specialties reach Client public Coach Registry: PASS
- specialty matching uses structured Coach Profile specialties: PASS
- certification count/name shown in coach recommendation card: PASS
- Coach Profile displays certification issuer/credential metadata: PASS
- PDF certificate attachment can be opened: PASS
- image certificate contract supported: PASS

## Availability source of truth
- dated Coach Profile availability reaches Client: PASS
- requested coaching session must fit completely inside configured window: PASS
- outside configured date coach cannot be selected: PASS
- existing coaching conflicts still block availability: PASS
- partial-day unavailable exceptions respected: PASS
- alternative-time recommendation respects availability: PASS

## Cross-package
- Admin v35.2 → Client v14.22 coach projection: 8/8 PASS
- Client continues to consume only public Admin contract: PASS
- private Admin/HR state reads: 0

## Full Client smoke
- desktop pages: 9
- mobile views: 4
- total views: 13
- failed views: 0
- browser console/page errors: 0

## Code / resource gate
- external JavaScript syntax: PASS
- inline JavaScript syntax: PASS
- local resource integrity: PASS
- v14.21.3 default-Today booking behavior retained
- v14.21.4 exact demo Coach Raf rates retained

## Release decision
**PASS — v14.22 approved as the stable Client baseline.**
