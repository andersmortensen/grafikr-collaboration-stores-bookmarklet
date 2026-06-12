# Grafikr Collaboration Stores

Bookmarklet der åbner en Grafikr-branded søgemodal til vores collaboration stores på Shopify Dev Dashboard – fra en hvilken som helst side i browseren.

Shopify flyttede partner-butikkerne fra partners.shopify.com til dev.shopify.com, hvor de nu ligger bag en Collaborations-fane med drilsk søgning. Bookmarkletten skærer det ned til ét klik.

## Installation

Åbn `index.html` i browseren og træk knappen op i bogmærkelinjen. Animeret guide på siden.

## Sådan virker den

| Mode | Destination |
|------|-------------|
| Dashboard-søgning | `dev.shopify.com/dashboard/…/stores?store_type=collaborations&search_term=…` – server-side filtreret liste |
| Direkte til admin | `admin.shopify.com/store/<handle>` – når du kender butikkens handle |

Enter åbner i ny fane · Esc lukker · valget af mode huskes pr. site.

## Filer

- `index.html` – distributionsside: drag-knap, animeret installation, dokumentation. 100 % selvindeholdt (inline wordmark, globe-favicon som data-URL) og kan deles som løs fil.
- `bookmarklet.js` – læsbar, kommenteret kilde.

**Sync-regel:** One-lineren i `index.html` skal holdes identisk med `bookmarklet.js` – eneste forskel er at `&` skrives som JS-escapen `\u0026`, så strengen kan ligge råt i HTML-attributter.

## Teknik

Shadow DOM + constructed stylesheet (CSP-sikker), localStorage til mode-persistens, popup-fallback til samme fane. Butikslisten kan ikke vises i selve modalen – CORS blokerer cross-origin opslag mod dev.shopify.com; det ville kræve en Safari Web Extension.
