# NorthZone Client Deployment

## Admin Portal link
The public site's **Staff Login** currently points to:

https://qourtsph.github.io/NorthZone-Admin-Portal-v1/admin-login.html

This assumes the separate admin repository is published through GitHub Pages as:

Repository: `NorthZone-Admin-Portal-v1`

If the admin repository has a different GitHub repository name, update the two Staff Login links in `index.html`.

## Google Maps
The site uses Google's no-API-key iframe-compatible Maps endpoint:

`maps.google.com/maps?...&output=embed`

Location:
- Latitude: 15.2427734
- Longitude: 120.6290658

The map section also includes direct Google Maps and Directions links as a fallback.
