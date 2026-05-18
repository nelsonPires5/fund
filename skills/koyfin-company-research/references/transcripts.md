# Koyfin Transcripts tab

**Section:** News, Filings & Transcripts  
**Research use:** earnings calls, conferences and special-call transcript metadata.  
**Observed exploration ticker:** MSFT. Treat values as examples; scripts must work for other tickers and missing-data states.

## Research guide

Use this tab when the company question needs earnings calls, conferences and special-call transcript metadata. Start by confirming the active ticker and Koyfin internal security id in the URL. Then review the visible widgets/tables, switch period/toggle controls only when needed, and extract structured data with `@../scripts/transcripts/extract.js`.

## Extraction contract

- Run from the active Koyfin `Transcripts` page in an authenticated browser session.
- Save transient outputs and screenshots under `/tmp/<TICKER>/transcripts/`.
- Final structured rows must include `ticker`, `tab`, `extracted_at` and enough tab-specific context columns.
- Empty/no-coverage/no-data states must emit empty arrays or CSV headers plus an explicit status/error field.
- Prefer Koyfin network/API data when request and response bodies are captured safely; otherwise use DOM/SVG/table extraction documented here.

## Output schema observed

### CSV headers observed

`ticker`, `tab`, `extracted_at`, `index`, `title`, `category`, `date`
### JSON shape observed

```json
{
  "ticker": "str",
  "tab": "str",
  "extracted_at": "str",
  "url": "str",
  "state": "str",
  "count": "int",
  "transcripts": [
    {
      "index": "int",
      "title": "str",
      "category": "str",
      "date": "str"
    }
  ]
}
```

## MSFT page summary

# Koyfin Security Analysis — MSFT Transcripts Tab

**Extracted at:** 2026-05-17T21:00:00-04:00 (approx)
**Source page:** https://app.koyfin.com/news/ts/eq-kuqeq3  
**Ticker:** MSFT  
**Tab:** News, Filings & Transcripts > Transcripts

## Overview

The Transcripts tab lists historical earnings calls, conference presentations, and special calls for Microsoft Corporation. Data is rendered via a React virtual list (`news-virtual-list`) inside an SPA. 44 transcript items were found spanning May 2023 to April 2026.

## Content summary

| Attribute | Value |
|-----------|-------|
| Total transcript items | 44 |
| Date range | May 31, 2023 – Apr 29, 2026 |
| Categories | Earnings Calls (13), Company Conference Presentations (27), Special Calls (4) |
| Ticker/security | MSFT — Microsoft Corporation (NasdaqGS) |
| UI pattern | Virtual scrolling list, 3-row items (title label, empty spacer, category+date row) |

## Categories breakdown

| Category | Count | Example |
|----------|-------|---------|
| Earnings Calls | 13 | "Q3 2026 Earnings Call" (Apr 29 '26) |
| Company Conference Presentations | 27 | "Morgan Stanley Technology" (Mar 04 '26) |
| Special Calls | 4 | "Special Call - Microsoft Corporation" (Jun 12 '23) |

## Transcripts extracted

| # | Title | Category | Date |
|---|-------|----------|------|
| 1 | Q3 2026 Earnings Call | Earnings Calls | Apr 29 '26 |
| 2 | Morgan Stanley Technology | Company Conference Presentations | Mar 04 '26 |
| 3 | Q2 2026 Earnings Call | Earnings Calls | Jan 28 '26 |
| 4 | Barclays 23rd Annual Global Technology Conference | Company Conference Presentations | Dec 11 '25 |
| 5 | UBS Global Technology and AI Conference 2025 | Company Conference Presentations | Dec 02 '25 |
| 6 | Q1 2026 Earnings Call | Earnings Calls | Oct 29 '25 |
| 7 | Goldman Sachs Communacopia + Technology Conference 2025 | Company Conference Presentations | Sep 10 '25 |
| 8 | Deutsche Bank's 2025 Technology Conference | Company Conference Presentations | Aug 28 '25 |
| 9 | Q4 2025 Earnings Call | Earnings Calls | Jul 30 '25 |
| 10 | Bank of America Global Technology Conference 2025 | Company Conference Presentations | Jun 03 '25 |
| 11 | Jefferies 2025 Software & Internet Conference | Company Conference Presentations | May 28 '25 |
| 12 | 53rd Annual JPMorgan Global Technology | Company Conference Presentations | May 13 '25 |
| 13 | Q3 2025 Earnings Call | Earnings Calls | Apr 30 '25 |
| 14 | Morgan Stanley Technology | Company Conference Presentations | Mar 04 '25 |
| 15 | Q2 2025 Earnings Call | Earnings Calls | Jan 29 '25 |
| 16 | Barclays 22nd Annual Global Technology Conference 2024 | Company Conference Presentations | Dec 12 '24 |
| 17 | Wells Fargo 8th Annual TMT Summit | Company Conference Presentations | Dec 03 '24 |
| 18 | UBS Global Technology and AI Conference | Company Conference Presentations | Dec 03 '24 |
| 19 | Q1 2025 Earnings Call | Earnings Calls | Oct 30 '24 |
| 20 | Goldman Sachs Communacopia + Technology Conference 2024 | Company Conference Presentations | Sep 10 '24 |
| 21 | Citi's 2024 Global TMT Conference | Company Conference Presentations | Sep 05 '24 |
| 22 | Deutsche Bank Technology Conference 2024 | Company Conference Presentations | Aug 28 '24 |
| 23 | Special Call - Microsoft Corporation | Special Calls | Aug 05 '24 |
| 24 | Q4 2024 Earnings Call | Earnings Calls | Jul 30 '24 |
| 25 | BofA Securities 2024 Global Technology Conference | Company Conference Presentations | Jun 06 '24 |
| 26 | Jefferies Software Conference 2024 | Company Conference Presentations | May 29 '24 |
| 27 | The 52nd J.P. Morgan Annual Global Technology | Company Conference Presentations | May 21 '24 |
| 28 | Special Call - Microsoft Corporation | Special Calls | May 02 '24 |
| 29 | Q3 2024 Earnings Call | Earnings Calls | Apr 25 '24 |
| 30 | Morgan Stanley's Technology | Company Conference Presentations | Mar 06 '24 |
| 31 | Q2 2024 Earnings Call | Earnings Calls | Jan 30 '24 |
| 32 | NRF 2024: Retail's Big Show | Company Conference Presentations | Jan 15 '24 |
| 33 | 2023 Barclays Global Technology Conference | Company Conference Presentations | Dec 07 '23 |
| 34 | 2023 UBS Global Technology Conference | Company Conference Presentations | Nov 29 '23 |
| 35 | Wells Fargo 7th Annual TMT Summit 2023 | Company Conference Presentations | Nov 28 '23 |
| 36 | Q1 2024 Earnings Call | Earnings Calls | Oct 24 '23 |
| 37 | Goldman Sachs Communacopia & Technology Conference | Company Conference Presentations | Sep 07 '23 |
| 38 | Citi's 2023 Global Technology Conference | Company Conference Presentations | Sep 07 '23 |
| 39 | Deutsche Bank's 2023 Technology Conference | Company Conference Presentations | Aug 30 '23 |
| 40 | Q4 2023 Earnings Call | Earnings Calls | Jul 25 '23 |
| 41 | Special Call - Microsoft Corporation | Special Calls | Jun 13 '23 |
| 42 | Special Call - Microsoft Corporation | Special Calls | Jun 12 '23 |
| 43 | Bank of America 2023 Global Technology Conference | Company Conference Presentations | Jun 07 '23 |
| 44 | Jefferies Software Conference 2023 | Company Conference Presentations | May 31 '23 |

## Data inventory and extraction patterns

# Data Inventory — Koyfin MSFT Transcripts Tab

**Extracted at:** 2026-05-17  
**Ticker:** MSFT  
**Tab URL:** https://app.koyfin.com/news/ts/eq-kuqeq3

## 1. Transcript List Metadata

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| title | string | Event/transcript name | "Q3 2026 Earnings Call" |
| category | string | Transcript category | "Earnings Calls" |
| date | string | Event date (Mon DD 'YY) | "Apr 29 '26" |

### Categories observed
- **Earnings Calls** — Quarterly earnings conference calls (13 items)
- **Company Conference Presentations** — Bank/conference presentations (27 items)
- **Special Calls** — Special investor calls (4 items)

### Date range
- **Earliest:** May 31, 2023 (Jefferies Software Conference 2023)
- **Latest:** Apr 29, 2026 (Q3 2026 Earnings Call)

## 2. DOM Structure

### Container hierarchy
```
#root
  .base-container__root___AIjuc (SECTION)
    .base-container__main___eLLNG (DIV)
      .navi-panel-layout (left sidebar)
      .base-container__content___amfQJ (main content)
        .base-container__contentWrap___DY7P1
          .base-container__mainContentWrap___l7NWf
            .base-container__quoteBoxContainer___stefU (quote header)
            .base-container__container___cKBPe (transcript list)
              .box__box___QniKz (scroll container)
                .koy-section-header (title bar with Search button)
                .news-panel__newsPanel___qUnIA
                  .news-virtual-list__newsVirtualList__container___a0EHh
                    .news-virtual-list__newsVirtualList__items___M4noe
                      .koy-news-item__koyNewsItem___StpWe (×44 items)
```

### Item structure (`.koy-news-item__koyNewsItem___StpWe`)
Each item has 3 children:
1. **LABEL** `.text-label__textLabelContainer___kNkG9` — Transcript title (e.g. "Q3 2026 Earnings Call")
2. **DIV** `.flex-row-column__flexRow___KMDJ8` — Empty spacer
3. **DIV** `.flex-row-column__flexRow___KMDJ8` — Category + Date concatenated (e.g. "Earnings CallsApr 29 '26")

### CSS selectors for extraction
- Container: `.news-virtual-list__newsVirtualList__items___M4noe`
- Items: `.koy-news-item__koyNewsItem___StpWe`
- Title: `.koy-news-item__koyNewsItem___StpWe > label`
- Category+Date: `.koy-news-item__koyNewsItem___StpWe > div:nth-child(3)`

## 3. Filters & Controls

| Control | Type | Behavior |
|---------|------|----------|
| Search Transcripts | Button (magnifying glass icon) | Opens search input overlay; no in-page filter UI visible |
| Virtual scroll | Automatic | Items load via React virtual list, only visible items rendered |

**No category filter dropdowns, type tabs, or date range selectors are visible on the page.** The only filtering option is the search button.

## 4. URL patterns

| Pattern | Description |
|---------|-------------|
| `/news/ts/eq-{tickerId}` | Transcript tab for a security (eq = equity) |
| `https://app.koyfin.com/news/ts/eq-kuqeq3` | Current MSFT transcript tab |

## 5. Network / API patterns

The Koyfin SPA loads data dynamically. Observed endpoints:
- `https://auth.koyfin.com/users/profile` — Session/user auth check (XHR)
- `https://sentry.io/api/230784/envelope/` — Error monitoring
- Bundle JS files loaded from `https://app.koyfin.com/scripts/bundle.*.js`

The transcript data is likely loaded via an internal API (GraphQL or REST) through the SPA's data layer, but the exact endpoint was not captured in this extraction. Data is rendered client-side into the React virtual list component.

## 6. Data quality notes

- Full transcript text content is **not available** from the list view; only metadata (title, category, date) is shown
- Clicking a transcript item likely opens a detail view or a PDF/document
- No transcript IDs or clickable URLs are visible in the DOM (items use SPA navigation)
- Date format is compact: "Mon DD 'YY" (no 4-digit year)

## Network/API notes

# Network Analysis — Koyfin MSFT Transcripts Tab

**Extracted at:** 2026-05-17  
**URL:** https://app.koyfin.com/news/ts/eq-kuqeq3

## Architecture

Koyfin is a React single-page application (SPA). Data is loaded dynamically via API calls after the initial page load. The app uses:
- **React** with React Router (client-side routing)
- **Webpack** bundled JS (multiple vendor + main bundles)
- **Sentry** for error monitoring
- **CookieYes** for consent management

## Observed network requests

| URL | Type | Purpose |
|-----|------|---------|
| `https://app.koyfin.com/news/ts/eq-kuqeq3` | Document | SPA entry (app shell) |
| `https://app.koyfin.com/scripts/bundle.*.js` | Script (×20+) | Webpack bundles |
| `https://app.koyfin.com/styles/main.*.css` | Stylesheet (×4) | CSS bundles |
| `https://auth.koyfin.com/users/profile` | XHR | Auth/profile check |
| `https://sentry.io/api/230784/envelope/` | Fetch | Error monitoring |
| `https://log.cookieyes.com/api/v1/log` | Beacon | Cookie consent logging |
| `https://fonts.googleapis.com/css2` | Stylesheet | Google Fonts |
| `https://assets.koyfin.com/font_blueprint/blueprint-icons.min.css` | Stylesheet | Icon font |

## Data loading pattern

The transcript data is loaded **dynamically** — not in the initial HTML or via visible network requests at the time of inspection. Likely mechanisms:

1. **GraphQL API** — Koyfin likely uses a GraphQL endpoint (common for React SPAs) to fetch transcript data. The endpoint may be internal/proxied.
2. **REST API** — Could be a REST endpoint under `app.koyfin.com/api/` or similar.
3. **WebSocket** — Possible but less likely for list data.

The data was already loaded when we arrived at the page (session persistence), so the initial fetch network request was not captured.

## URL structure

- Base: `https://app.koyfin.com/`
- Transcripts page: `/news/ts/eq-{tickerId}`
- Example: `/news/ts/eq-kuqeq3` (MSFT)
- `eq-` prefix likely indicates equity security type
- `kuqeq3` appears to be an internal security ID (not the ticker)

## For future extraction

To capture the API call, you would need to:
1. Use CDP Network domain to enable request interception before navigation
2. Navigate to the transcript tab while network recording is active
3. Look for XHR/Fetch requests to endpoints containing `graphql`, `api`, or `news` after page load
4. The response data is likely JSON with transcript items containing fields like:
   - `title` / `eventName` / `headline`
   - `category` / `type` / `eventType`
   - `date` / `eventDate` / `publishDate`
   - Some kind of ID or URL for the full transcript document

Alternatively, you could trigger the search functionality and observe the resulting network request.

## Request patterns for search

The "Search Transcripts" button likely triggers a search API call when activated. To capture this pattern:
1. Enable CDP network tracking
2. Click the search button
3. Type a query
4. Observe the API request/response

## Script and examples

- Extractor: `@../scripts/transcripts/extract.js`
- Script README: `@../scripts/transcripts/README.md`
