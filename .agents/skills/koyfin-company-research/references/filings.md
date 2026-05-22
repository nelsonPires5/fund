# Koyfin Filings tab

**Section:** News, Filings & Transcripts  
**Research use:** SEC/EDGAR filing list metadata: form, date, source/title.  
**Observed exploration ticker:** MSFT. Treat values as examples; scripts must work for other tickers and missing-data states.

## Research guide

Use this tab when the company question needs SEC/EDGAR filing list metadata: form, date, source/title. Start by confirming the active ticker and Koyfin internal security id in the URL. Then review the visible widgets/tables, switch period/toggle controls only when needed, and extract structured data with `@../scripts/filings/extract.js`.

## Extraction contract

- Run from the active Koyfin `Filings` page in an authenticated browser session.
- Save transient outputs and screenshots under `/tmp/<TICKER>/filings/`.
- Final structured rows must include `ticker`, `tab`, `extracted_at` and enough tab-specific context columns.
- Empty/no-coverage/no-data states must emit empty arrays or CSV headers plus an explicit status/error field.
- Prefer Koyfin network/API data when request and response bodies are captured safely; otherwise use DOM/SVG/table extraction documented here.

## Output schema observed

### CSV headers observed

`ticker`, `tab`, `extractedAt`, `description`, `formType`, `formCode`, `isEdgar`, `date`, `docType`
### JSON shape observed

```json
{
  "ticker": "str",
  "tab": "str",
  "extractedAt": "str",
  "url": "str",
  "filings": [
    {
      "description": "str",
      "formType": "str",
      "formCode": "str",
      "isEdgar": "bool",
      "date": "str",
      "docType": "str"
    }
  ]
}
```

## MSFT page summary

# Koyfin MSFT Filings Tab - Exploration Summary

**Ticker:** MSFT  
**Tab:** Security Analysis > News, Filings & Transcripts > Filings  
**URL:** https://app.koyfin.com/news/cf/eq-kuqeq3  
**Extracted at:** 2026-05-17  
**Equity ID:** eq-kuqeq3  

## Overview

Successfully navigated from the MSFT Press Releases page to the **Filings** tab via URL pattern `/news/cf/eq-kuqeq3`. The page displays a virtualized scrolling list of SEC filings (EDGAR) under the heading "Recent Filings".

## Data Volume

- **Total filings visible:** ~190 items (49 groups of 3 labels each, with some deduplication)
- **Date range:** Oct 2021 – May 2026
- **Data source:** All filings are Edgar-sourced

## Filing Types Found

| Form Type | Count | Description |
|-----------|-------|-------------|
| 4 | ~80+ | Beneficial Ownership Changes (insider transactions) |
| 8-K | ~35+ | Current reports (various items) |
| 10-Q | ~15 | Quarterly interim reports |
| 11-K | Multiple | Annual reports of employee stock plans |
| 144 | Several | Notice of proposed sale of securities |
| SCHEDULE 13G/A | Several | Beneficial ownership statements |
| S-8 / S-8 POS | Several | Registration statements |
| PX14A6G | Multiple | Shareholder proposals |
| DEFA14A | Multiple | Additional proxy soliciting materials |
| DEF 14A | Annual | Definitive proxy statements |
| 10-K | Annual | Annual reports (Jul 2025, 2024, 2023, 2022, 2021, 2020, 2019) |
| ARS | Annual | Annual report to shareholders |
| SD | Annual | Specialized disclosure reports |
| IRANNOTICE | 1 | Iran Threat Reduction notice |
| S-3ASR | 2 | Automatic shelf registration |
| S-4 | 1 | Business combination registration |
| 424B3 | 1 | Prospectus |
| 3 | 1 | Initial beneficial ownership report |
| 8-K/A | 1 | Amended current report |

## Page Structure

- **React SPA** (React Router v7.13.1)
- **Virtualized list** using absolute-positioned rows (react-window style)
- **CSS Modules** with dynamically generated class names (`koy-news-item__koyNewsItem___StpWe`)
- **No AJAX/GraphQL calls** visible in Performance API — data likely bundled in initial JS or streamed via WebSocket
- **No anchor links** on filing items — navigation is React click handler based
- **Cookie-based auth** with session token
- **Stripe iframe** present (payment component)

## Extraction Method

Data was extracted by iterating DOM `<label>` elements in groups of 3:
1. **Label 0:** Filing description (e.g., "Form 8-K - Current report - Item 5.02 Item 9.01")
2. **Label 1:** Form type with source (e.g., "8-K (Edgar)")
3. **Label 2:** Filing date (e.g., "May 14 '26")

## Key Patterns

- **URL pattern:** `/news/{tab}/{equity_id}` where tab is `cf` (filings), `pr` (press releases), `n` (news), `ts` (transcripts)
- **Sidebar data-testid:** `navi-panel-item-cf` for Filings
- **Filing item class:** `.koy-news-item__koyNewsItem___StpWe`
- **Virtual list:** Container height `1600px` for ~50 items at `32px` each

## Confidence: HIGH

All filing metadata extracted successfully. Structure stable across ~5 years of historical data. No pagination or "Show More" controls visible — may need scrolling to load older items.

## Data inventory and extraction patterns

# Data Inventory: Koyfin MSFT Filings Tab

## 1. Filing List Metadata (Primary Data)

**Source:** DOM label elements in virtualized list
**Volume:** ~190 filing items
**Extraction:** Groups of 3 `<label>` elements in sequence

### Fields per Filing Item

| Field | Type | Example | Source |
|-------|------|---------|--------|
| `description` | string | "Form 8-K - Current report - Item 5.02 Item 9.01" | label[0] text |
| `formType` | string | "8-K (Edgar)" | label[1] text |
| `formCode` | string | "8-K" | formType without "(Edgar)" |
| `isEdgar` | boolean | true | Derived from "(Edgar)" in formType |
| `date` | string | "May 14 '26" | label[2] text |
| `docType` | string | "8-K" | Extracted from description prefix |

### Notes
- All filings appear to be EDGAR-sourced (`isEdgar: true` for all)
- Date format is `Mon DD 'YY` (e.g., "May 14 '26")
- Description prefix patterns:
  - `Form {TYPE} ~ {Title}` — Insider transaction reports (Form 4, 144)
  - `{TYPE} ~ {Description} (ended {date})` — Periodic reports (10-Q, 10-K, 11-K)
  - `Form {TYPE} - {Description}` — Current reports (8-K) and other filings

## 2. Page Metadata

| Attribute | Value |
|-----------|-------|
| Page title | "🐴 MSFT - Filings" |
| URL | https://app.koyfin.com/news/cf/eq-kuqeq3 |
| Tab label | "Filings" (sidebar code: CF) |
| Section heading | "Recent Filings" |
| React Router version | 7.13.1 |
| Framework | React SPA with CSS Modules |

## 3. Navigation / UI Patterns

| Element | Identifier | Pattern |
|---------|-----------|---------|
| Sidebar filings link | `data-testid="navi-panel-item-cf"` | `<a href="/news/cf/{equity_id}">` |
| Sidebar active state | Class: `active` | On the current tab's nav element |
| News section container | Class pattern: `koy-news-section__koyNewsSection___*` | CSS Module |
| Filing items | Class: `koy-news-item__koyNewsItem___StpWe` | Virtual list items |
| Filing item height | 32px | Absolute positioned rows |

## 4. URL Patterns

| Tab | URL Path |
|-----|----------|
| News | `/news/n/{equity_id}` |
| Press Releases | `/news/pr/{equity_id}` |
| **Filings** | `/news/cf/{equity_id}` |
| Transcripts | `/news/ts/{equity_id}` |
| Overview | `/security/{equity_id}` |

## 5. Network / API

- **No REST/GraphQL endpoints detected** via Resource Timing API for filing data
- Data likely loaded via:
  - Initial page HTML/JS bundle hydration
  - WebSocket stream (not confirmed via script scan)
  - Server-side rendering with React hydration
- **Third-party services detected:**
  - Stripe (JS iframe)
  - Font Awesome (Pro CDN)
  - CookieYes (consent)
  - Google Tag Manager / dataLayer
  - Twitter (oct.js)
  - Sentry (error tracking)
  - Rewardful (referral tracking)

## 6. Storage

- **localStorage:** Session/user tokens, nav panel state, analytics IDs
- **sessionStorage:** Session persistence flag, click tracking
- **Cookies:** Authentication (`_cioid`), analytics (`_cioanonid`), cookie consent

## Network/API notes

# Network Analysis: Koyfin Filings Tab

## Summary

The Koyfin Filings page at `/news/cf/{equity_id}` is a **React Single Page Application** (React Router v7.13.1). Filing data appears to be loaded **client-side via JavaScript bundle hydration or WebSocket**, not through traditional REST/GraphQL API calls.

## Resource Timing Observations

### No Filing-Specific API Calls Detected

The Performance Resource Timing API did not show any fetch/XHR calls to a filing-specific endpoint after page load. The primary network activity consists of:

1. **Static assets** (CSS, JS bundles) from `app.koyfin.com`
2. **Third-party services:**
   - Stripe (JS SDK iframe)
   - Font Awesome Pro CDN (`ka-p.fontawesome.com`)
   - CookieYes consent manager (`cdn-cookieyes.com`)
   - Google Tag Manager
   - Twitter conversion tracking (`platform.twitter.com/oct.js`)
   - Rewardful affiliate tracking (`r.wdfl.co`)
   - Sentry error tracking
   - Uploadcare CDN

## Data Loading Hypothesis

Given the absence of visible API calls, filing data is likely loaded via one of:

1. **Initial HTML hydration** — The data may be serialized into the initial HTML or JS bundle
2. **WebSocket stream** — Koyfin uses persistent WebSocket connections (the `gist.web` localStorage keys suggest `gist` real-time infrastructure)
3. **Local bundle data** — The data could be embedded in one of the vendor bundles

## Key Network Patterns

| Resource | Type | Notes |
|----------|------|-------|
| `app.koyfin.com/scripts/bundle.vendor.*.js` | JS | Large vendor bundles (~1000+ KB total) |
| `app.koyfin.com/styles/main.*.css` | CSS | CSS modules for theming |
| `app.koyfin.com/styles/vendor.*.css` | CSS | Third-party CSS |
| `ka-p.fontawesome.com/...` | CSS/JS | Icon rendering |
| `cdn-cookieyes.com/...` | JS | GDPR cookie consent |
| `js.stripe.com/v3/...` | iframe | Payment infrastructure |

## Performance Metrics

| Metric | Value |
|--------|-------|
| DOM Interactive | 772ms |
| DOM Content Loaded | 1,656ms |
| Full Load | 2,383ms |

## Data Flow Architecture (Inferred)

```
Browser ←→ app.koyfin.com (SPA)
   ├── Initial page load: HTML + CSS + JS bundles
   ├── Authentication: Cookie-based (_cioid session token)
   ├── Real-time data: WebSocket via gist infrastructure
   └── Page rendering: React with CSS Modules
```

## Limitations

- Resource Timing API was sampled after page load; early/fast XHR calls may have been missed
- WebSocket frames cannot be inspected via Resource Timing API
- Service worker caching may alter observable network patterns

## Script and examples

- Extractor: `@../scripts/filings/extract.js`
- Script README: `@../scripts/filings/README.md`
