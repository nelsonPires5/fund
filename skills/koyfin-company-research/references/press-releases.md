# Koyfin Press Releases tab

**Section:** News, Filings & Transcripts  
**Research use:** company press release metadata and dates.  
**Observed exploration ticker:** MSFT. Treat values as examples; scripts must work for other tickers and missing-data states.

## Research guide

Use this tab when the company question needs company press release metadata and dates. Start by confirming the active ticker and Koyfin internal security id in the URL. Then review the visible widgets/tables, switch period/toggle controls only when needed, and extract structured data with `@../scripts/press-releases/extract.js`.

## Extraction contract

- Run from the active Koyfin `Press Releases` page in an authenticated browser session.
- Save transient outputs and screenshots under `/tmp/<TICKER>/press-releases/`.
- Final structured rows must include `ticker`, `tab`, `extracted_at` and enough tab-specific context columns.
- Empty/no-coverage/no-data states must emit empty arrays or CSV headers plus an explicit status/error field.
- Prefer Koyfin network/API data when request and response bodies are captured safely; otherwise use DOM/SVG/table extraction documented here.

## Output schema observed

### JSON shape observed

```json
{
  "url": "str",
  "ticker": "str",
  "company": "str",
  "tab": "str",
  "extractedAt": "str",
  "totalItems": "int",
  "hasLoadMore": "NoneType",
  "items": [
    {
      "index": "int",
      "title": "str",
      "date": "str"
    }
  ]
}
```

## MSFT page summary

# Koyfin MSFT Press Releases — Exploration Summary

**Date**: 2026-05-17  
**Ticker**: MSFT (Microsoft Corporation)  
**Page**: Security Analysis > News, Filings & Transcripts > Press Releases  
**URL**: https://app.koyfin.com/news/pr/eq-kuqeq3  
**Navigated from**: Existing logged-in Koyfin session (already on MSFT News tab)

## What was done

1. **Connected** to existing Chrome session — Koyfin was already open on MSFT News (`/news/n/eq-kuqeq3`).
2. **Navigated** to Press Releases via direct URL `https://app.koyfin.com/news/pr/eq-kuqeq3` (sidebar link href was `/news/pr/eq-kuqeq3`).
3. **Captured** page state: screenshot, DOM structure, visible text, performance/resource entries.
4. **Extracted** all 44 visible press release items with title and date.

## Page structure

- **Left sidebar**: Full Koyfin navigation tree (Today's Markets, SECURITY ANALYSIS > Snapshots > News, Filings & Transcripts > Press Releases [active], etc.).
- **Top bar**: Ticker quote box (MSFT $421.92 +3.05%).
- **Main content**: Simple two-layer layout:
  - `koy-section-header` → "Press Releases" title
  - `news-panel` → `news-virtual-list` container with 44 items
- **Each item**: `koy-news-item` component with a `text-label` (title) and a flex row containing the date.
- **No** visible filter/sort/source controls on the Press Releases sub-page (unlike the News tab which has "Customize Sources").
- **No** visible "Load More" or pagination button — data appears to be a fixed set loaded via the React SPA's initial data fetch.

## Extracted data

- **44 press releases** spanning Jul 30 '25 → May 14 '26 (~9.5 months).
- Each entry has a **title** (string) and **date** (formatted like "May 14 '26").
- No direct external links in the DOM (href attributes were null on the list items themselves).
- Items are rendered as `<div class="koy-news-item__koyNewsItem___StpWe">` with a child `<label>` for title and a flex div for date.

## Network observations

- Koyfin is a React SPA. Page load triggers numerous API calls to `app.koyfin.com/api/v3/` endpoints.
- Press releases data is likely loaded as part of the initial page hydration/bundle rather than a separate XHR call (no network entry specifically for press releases was observed in the Performance API).
- Relevant API endpoints observed: `/api/v3/data/keys`, `/api/v3/users/settings`, `/api/v3/tickers/filters`.

## Artifacts saved

| Artifact | Path |
|---|---|
| `summary.md` | /tmp/MSFT/press-releases/summary.md |
| `data_inventory.md` | /tmp/MSFT/press-releases/data_inventory.md |
| `extract.js` | /tmp/MSFT/press-releases/extract.js |
| `sample-output.json` | /tmp/MSFT/press-releases/sample-output.json |
| `network.md` | /tmp/MSFT/press-releases/network.md |
| `network-sample.json` | /tmp/MSFT/press-releases/network-sample.json |
| `screenshot_01_press_releases.png` | /tmp/MSFT/press-releases/screenshot_01_press_releases.png |

## Confidence & blockers

- **Confidence: High** — 44 items extracted cleanly from DOM; page loaded without auth walls.
- **No blockers** — the target page was accessible without additional login, the data was rendered in plain DOM accessible via JS.
- **Limitation**: No external/article links were visible in the DOM for individual press releases (they may be rendered dynamically on click or via React Router).
- **Limitation**: Only the first page (44 items) was visible. No infinite scroll or pagination control was detected, which may limit the total data scope.
- **No filter/source controls** on the Press Releases page itself — the News tab ("N") has a "Customize Sources" button, but Press Releases ("PR") does not expose one in the current viewport.

## Data inventory and extraction patterns

# Data Inventory — Koyfin MSFT Press Releases

## Page metadata

| Field | Value |
|---|---|
| URL | https://app.koyfin.com/news/pr/eq-kuqeq3 |
| Page title | MSFT - Press Releases |
| Ticker | MSFT |
| Company | Microsoft Corporation |
| Security ID | eq-kuqeq3 |
| Tab | Press Releases (under News, Filings & Transcripts) |
| Total visible items | 44 |
| Date range | Jul 30 '25 – May 14 '26 |

## Extracted fields per item

| Field | Type | Description | Example |
|---|---|---|---|
| `index` | integer | Zero-based position in the list | 0 |
| `title` | string | Press release headline | "Microsoft announces appointment of Carmine Di Sibio to board of directors" |
| `date` | string | Publication date (MMM DD 'YY format) | "May 14 '26" |

## DOM patterns

### Main container
```css
.news-virtual-list__newsVirtualList__items___M4noe
```
- Tag: `<div>`
- Contains all 44 items as direct children (`<div>` elements with no specific class).

### Individual item
```css
.koy-news-item__koyNewsItem___StpWe
```
- **Title element**: `<label class="text-label__textLabelContainer___kNkG9">` contains the headline text.
- **Date element**: A child `<div class="flex-row-column__flexRow___KMDJ8">` containing the date string.
- Date format: `MMM DD 'YY` (e.g., "May 14 '26", "Apr 29 '26").

### Page header
```css
.koy-section-header__koySectionHeader___bPg99
```
- Contains `<span>` with "Press Releases" title text.

### Navigation (sidebar)
- Active item has `aria-current="page"` and `active` class on the `<a>` tag.
- Press Releases link pattern: `/news/pr/{tickerId}`
- Other tabs: News (`/news/n/{tickerId}`), Filings (`/news/cf/{tickerId}`), Transcripts (`/news/ts/{tickerId}`)

## See also
- Left sidebar class pattern: `navi-panel-list-item__naviPanelListItem___ckQEj`
- Section header pattern: `koy-section-header__koySectionHeader___bPg99`
- News panel pattern: `news-panel__newsPanel___qUnIA`
- Virtual list pattern: `news-virtual-list__newsVirtualList__container___a0EHh`

## Notes
- No links (href) were present on individual press release items in the DOM. Interaction likely triggers React Router navigation or a modal.
- No source attribution (e.g., Benzinga, PR Newswire) was visible on the Press Releases tab (unlike the News tab which shows sources).
- The data is rendered server-side / statically via the React SPA bundle, not loaded via a separate XHR/fetch call specifically for the press releases endpoint.

## Network/API notes

# Network Analysis — Koyfin MSFT Press Releases

## Overview

Koyfin is a React single-page application. Data for the Press Releases tab is likely
embedded in the JavaScript bundle or hydrated from an initial API response, rather than
loaded via a dedicated XHR/fetch call at page render time.

## Observed API Endpoints (from Performance API)

All requests observed during a page reload to `https://app.koyfin.com/news/pr/eq-kuqeq3`:

| Endpoint | Type | Purpose |
|---|---|---|
| `auth.koyfin.com/users/profile` | XHR | User authentication profile |
| `auth.koyfin.com/authorization/grants` | XHR | Authorization grants |
| `auth.koyfin.com/authorization/entitlements/me` | XHR | User entitlements |
| `app.koyfin.com/api/v3/billing/subscriptions` | XHR | Billing/subscription status |
| `app.koyfin.com/api/v3/billing/stripe/config` | XHR | Stripe payment config |
| `app.koyfin.com/api/v3/billing/stripe/customer` | XHR | Stripe customer info |
| `app.koyfin.com/api/v1/bfc/tickers/top?categories=...` | XHR | Ticker search top results (94413 bytes — large) |
| `app.koyfin.com/api/v3/tickers/filters` | XHR | Ticker filter definitions |
| `app.koyfin.com/api/v3/data/keys` | XHR | Data keys for the platform |
| `app.koyfin.com/api/v3/users/settings` | XHR | User settings/preferences |
| `app.koyfin.com/api/v3/users/watchlists/*` | XHR | Watchlist data (shared, owned, structure) |

## Press Releases data loading

**No dedicated API call** was observed specifically for press releases content.
The data is likely one of:
1. Bundled in the main JS chunk at build time for the ticker
2. Loaded via WebSocket (not visible in Performance API resource entries)
3. Included in one of the larger XHR responses as embedded data

The DOM confirms 44 items are rendered client-side via React virtual list
(`news-virtual-list`) using Koyfin's custom `koy-news-item` component.

## Recommendations for network-based extraction

If DOM-based extraction is insufficient:
1. **Monitor WebSocket frames** — Koyfin may push data updates via WebSocket.
2. **Intercept XHR** via `Network.responseReceived` CDP event to capture the specific
   response payload containing press releases data.
3. **Check the React store** — The data may be available in the React component state
   or Redux store under a key like `news.pressReleases` or similar.
4. **Scroll/paginate** — If more than 44 items exist, scrolling may trigger an API call
   to fetch the next page. Monitor `Network.requestWillBeSent` events during scroll.

## Static assets loaded

The page loads ~2.5MB of JS/CSS across 40+ bundle files (vendor chunks + main chunks).
Notable: bundle.main.605c04ad.js (~1.1MB) is the primary application bundle.

## Script and examples

- Extractor: `@../scripts/press-releases/extract.js`
- Script README: `@../scripts/press-releases/README.md`
