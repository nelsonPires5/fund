# Koyfin Performance tab

**Section:** Graphs  
**Research use:** performance/total-return time series and high/low markers.  
**Observed exploration ticker:** MSFT. Treat values as examples; scripts must work for other tickers and missing-data states.

## Research guide

Use this tab when the company question needs performance/total-return time series and high/low markers. Start by confirming the active ticker and Koyfin internal security id in the URL. Then review the visible widgets/tables, switch period/toggle controls only when needed, and extract structured data with `@../scripts/performance/extract.js`.

## Extraction contract

- Run from the active Koyfin `Performance` page in an authenticated browser session.
- Save transient outputs and screenshots under `/tmp/<TICKER>/performance/`.
- Final structured rows must include `ticker`, `tab`, `extracted_at` and enough tab-specific context columns.
- Empty/no-coverage/no-data states must emit empty arrays or CSV headers plus an explicit status/error field.
- Prefer Koyfin network/API data when request and response bodies are captured safely; otherwise use DOM/SVG/table extraction documented here.

## Output schema observed

### CSV headers observed

`Date`, `Ticker`, `Return%`, `Marker`
### JSON shape observed

```json
{
  "ticker": "str",
  "tab": "str",
  "url": "str",
  "extracted_at": "str",
  "period": {
    "label": "str",
    "start": "str",
    "end": "str",
    "frequency": "str"
  },
  "summary": {
    "total_return": "str",
    "cagr_1y": "str",
    "high": "str",
    "low": "str"
  },
  "data_points": [
    {
      "date": "str",
      "return_pct": "float"
    }
  ],
  "controls": {
    "period_buttons": [
      "str"
    ],
    "active_period": "str",
    "frequency": "str",
    "compare_securities": [
      "str"
    ],
    "show_table": "bool",
    "export": "str",
    "settings": "bool",
    "add_to_my_graphs": "bool"
  }
}
```

## MSFT page summary

# MSFT Performance Graph — Exploration Summary

**Ticker:** MSFT (Microsoft Corporation)
**Tab:** Security Analysis > Graphs > Performance
**URL:** https://app.koyfin.com/charts/gm/eq-kuqeq3
**Security ID:** eq-kuqeq3
**Extracted At:** 2026-05-17

## Page Overview

The Koyfin Performance Graph page shows cumulative total return for MSFT over a selected period. The page uses:
- **Left sidebar:** Security selections and comparison management
- **Top toolbar:** Period selector, frequency, Show Table, Export, Settings, Add to My Graphs
- **Main chart area:** Recharts SVG line chart (1530×1041px)
- **Bottom toolbar:** Same period/controls

## Chart Data Summary

| Metric | Value |
|--------|-------|
| **Period** | 1Y (May 15, 2025 – May 15, 2026) |
| **Frequency** | Daily |
| **Total Return** | -6.35% |
| **CAGR (1Y)** | -6.35% |
| **High** | +19.82% (Oct 28, 2025) |
| **Low** | -20.81% (Mar 27, 2026) |
| **Data Points** | 252 trading days |
| **Ticker/Compare** | MSFT only (single security) |

## Chart Characteristics

- **SVG Renderer:** Recharts (React-based charting library)
- **Y-Axis Range:** -22% to +24% (2% increments, default view without table)
- **X-Axis Labels:** Monthly (Jun 2, Jul 1, ... May 1)
- **Line Color:** Blue (primary color, CSS variable `--primary-color`)
- **Annotations:** High/Low markers on series
- **Chart SVG dimensions:** 1530×1041px (layout: x=504, y=188)

## Controls Documented

- **Period Buttons:** 1D, 5D, 10D, MTD, 1M, QTD, 3M, 6M, YTD, 1Y (active), 3Y, 5Y, 10Y, 20Y, ALL
- **Frequency Selector:** Daily (dropdown with Weekly/Monthly options)
- **Show Table:** Toggle data table overlay (virtualized scrollable table)
- **Export:** PNG image export only (no CSV/data export available)
- **Settings:** Opens sidebar with security selections
- **Add to My Graphs:** Save to user's graph library
- **Compare:** Add Ticker button in sidebar for comparison series

## Data Extraction Method

All 252 data points were extracted from the virtualized data table by:
1. Clicking "Show Table" button to reveal the table
2. Scrolling the virtualized container (`scrollContainer` class) in 200px increments
3. Collecting text content from each row: format `DayMM-DD-YYYYReturn%` 
4. Deduplicating and parsing into structured data

### Data Format (raw table)
```
Fri05-15-2026-6.35%
Thu05-14-2026-9.12%
...
Fri03-27-2026Low-20.81%   ← annotated Low marker
Tue10-28-2025High19.82%   ← annotated High marker
```

## API Endpoint

The chart data is fetched via XHR POST to:
```
/app.koyfin.com/api/v3/data/graph?schema=packed
```
The exact payload structure was not determined (400 on guessing), but the endpoint is authenticated (cookies) and returns JSON with series data used to render the Recharts SVG.

## Artifacts Saved

| File | Description |
|------|-------------|
| `summary.md` | This file |
| `data_inventory.md` | Detailed data inventory and structure |
| `extract.js` | Reusable extraction script |
| `sample-output.csv` | All 252 data points in CSV format |
| `sample-output.json` | All data points in JSON format |
| `network.md` | Network request patterns and analysis |
| `network-sample.json` | Network request/API metadata |
| `00_initial.png` | Initial page load screenshot |
| `01_performance_page.png` | Performance page after accepting cookies |
| `02_after_accept_cookies.png` | Page with cookies accepted |
| `03_show_table.png` | Data table visible |
| `04_after_reload.png` | Page after reload for network capture |
| `05_settings.png` | Settings sidebar visible |

## Limitations / Blockers

1. **No CSV export from UI:** The Export button only offers PNG image export, not data download
2. **API payload unknown:** Could not reverse-engineer the `POST /api/v3/data/graph` request body to access raw JSON series data
3. **Virtualized table:** Table data must be extracted by scrolling (252 rows across 7620px scrollHeight)
4. **Cookie consent banner:** Appears on reload; must be dismissed to access full chart
5. **Auth-dependent:** Requires existing Koyfin login session (cookies from previously logged-in Chrome)

## Data inventory and extraction patterns

# Data Inventory — MSFT Performance Graph

## 1. Chart Data (SVG-based)

| Field | Source | Access Method | Format | Coverage |
|-------|--------|---------------|--------|----------|
| Daily cumulative total return | Recharts SVG `path` data | `document.querySelectorAll('svg')[7]` | SVG path `d` attribute (M/L commands in SVG coords) | Full period |
| Y-axis % labels | SVG `text` elements in Y-axis `g` | via `getChartMetadata()` | Text: "-22.00%" through "+24.00%" (2% steps) | Visible range |
| X-axis date labels | SVG `text` elements in X-axis `g` | via `getChartMetadata()` | Text: "Jun 2", "Jul 1", ... "May 1" | Monthly ticks |
| Chart legend | `[class*="legend"]` div | DOM query | Text: "MSFT Microsoft Corporation -6.35% (-6.35% CAGR 1 years)" | Single series |
| High/Low annotations | Inline in SVG paths | DOM query | Markers on series line | Oct 28 High, Mar 27 Low |

## 2. Data Table (Virtualized)

| Field | Source | Access Method | Format | Rows |
|-------|--------|---------------|--------|------|
| Date (trading day) | Table row in scrollContainer | Scroll + extract text | `DayMM-DD-YYYY` (e.g. "Fri05-15-2026") | 252 |
| Security Return % | Same row | Parse from text | `-6.35%` (embedded in contiguous string) | 252 |
| Annotations | Same row | Text contains "Low" or "High" | e.g. "Fri03-27-2026Low-20.81%" | 2 markers |

Table DOM structure:
```
div.scrollContainer (overflow-y: auto, 500px vis height, 7620px scroll)
  > div (padding spacer, 7620px total)
    > div.table__head (header: "Date MSFT Return")
    > div.table__row × ~18 (visible rows, 30px each)
    > div.table__row × ~18 (next batch on scroll)
    ...
```

Row string parsing: `(\w{3})(\d{2}-\d{2}-\d{4})(Low|High)?([+-]?\d+\.?\d*)%`

## 3. Page Metadata

| Field | Source | Example Value |
|-------|--------|---------------|
| Title | `document.title` | "MSFT - Performance" |
| URL | `location.href` | `https://app.koyfin.com/charts/gm/eq-kuqeq3` |
| Security ID | URL path | `eq-kuqeq3` |
| Sector | Sidebar block | "Information Technology" |
| Industry | Sidebar block | "Software" |
| Market Cap | Sidebar block | "$3,134.21B" |
| Forward P/E | Sidebar block | "22.8x" |
| Volume | Sidebar block | "50,771,100" |
| Total Return (3M) | Sidebar block | "5.37%" |
| Total Return (1Y) | Sidebar block | "-6.35%" |
| Current Price | Top bar | "$421.92" |
| Price Change | Top bar | "+12.49 (+3.05%)" |
| After Market | Top bar | "$419.71 (-0.52%)" |
| Next Earnings | Sidebar block | "Thu Jul 30th 2026 (After-Market)" |

## 4. UI Controls

| Control | Type | Values |
|---------|------|--------|
| Period selector | Button group | 1D, 5D, 10D, MTD, 1M, QTD, 3M, 6M, YTD, **1Y**, 3Y, 5Y, 10Y, 20Y, ALL |
| Frequency | Dropdown | **Daily**, Weekly, Monthly |
| Security list | Sidebar input | MSFT (Microsoft Corporation) + Add Ticker |
| Show Table | Toggle button | Show/Hide |
| Export | Button | Opens dialog; PNG only |
| Settings | Button | Opens sidebar |
| Add to My Graphs | Button | Saves to user library |

## 5. Network API (Identified but not fully captured)

| Endpoint | Method | Purpose | Status |
|----------|--------|---------|--------|
| `/api/v3/data/graph?schema=packed` | POST | Fetches chart series data | ❌ Payload unknown, 400 on guess |
| `/api/v3/data/keys` | GET | Data key lookups | Observed |
| `/api/v3/tickers/filters` | GET | Ticker search/filter | Observed |
| `/api/v3/data/vocabularies/holidays` | GET | Holiday calendar | Observed |
| `/api/v1/user-graphs/myg/graphs/count` | GET | My Graphs count | Observed |

## 6. Missing / Not Captured

- Raw JSON from API (`POST /api/v3/data/graph`) — could not determine request payload
- Weekly/Monthly frequency data (only Daily captured)
- Other period views (3Y, 5Y, etc.)
- Comparison series data (only single MSFT series)

## Network/API notes

# Network Request Analysis — MSFT Performance Graph

## Overview

The Performance Graph page makes ~50 network requests on load. Below is an analysis of the API and analytics traffic observed via Resource Timing API.

## Critical API Endpoints

### Primary: Graph Data
```
POST /api/v3/data/graph?schema=packed
Type: xmlhttprequest
Duration: ~500ms
Purpose: Fetches chart series data for rendering
Status: ❌ Payload unknown (could not reverse-engineer)
```
This is the primary data endpoint for all chart/performance series. The `schema=packed` query parameter suggests a compressed schema format. The response likely contains JSON with time series arrays.

### Supporting APIs
| Endpoint | Method | Duration | Purpose |
|----------|--------|----------|---------|
| `/api/v3/data/keys` | GET | ~400ms | Data key lookup/definitions |
| `/api/v3/tickers/filters` | GET | ~400ms | Ticker search/filter config |
| `/api/v3/data/vocabularies/holidays` | GET | ~370ms | Market holiday calendar |
| `/api/v1/bfc/tickers/top?categories=...` | GET | ~660ms | Top tickers by category |
| `/api/v1/user-graphs/myg/graphs/count` | GET | ~400ms | User's saved graphs count |

### Analytics & Third-party
| Endpoint | Type | Purpose |
|----------|------|---------|
| `https://sentry.io/api/230784/envelope/` | fetch | Error tracking (Sentry) |
| `https://log.cookieyes.com/api/v1/log` | beacon | Cookie consent logging |
| `https://mix.koyfin.com/track/` | XHR | Analytics (Mixpanel?) |
| `https://analytics.google.com/g/collect` | fetch | Google Analytics 4 |
| `https://bat.bing.com/action/0` | img | Bing Ads tracking |
| `https://connect.facebook.net/signals/config/` | script | Facebook Pixel |
| `https://px.ads.linkedin.com/` | XHR/img | LinkedIn Ads |
| `https://js.stripe.com/v3/m-outer-...` | iframe | Stripe (likely for subscription) |

## Request Pattern

1. Page loads CSS/JS bundles from `/scripts/` and `/styles/`
2. Authentication check via cookies (no visible auth API)
3. Data layer initialization: `/api/v3/data/keys` (multiple calls)
4. Ticker/top data: `/api/v1/bfc/tickers/top`
5. **Chart data:** `/api/v3/data/graph?schema=packed` (the key call)
6. User data: `/api/v1/user-graphs/myg/graphs/count`
7. Analytics & tracking fires in parallel

## Authentication

- No auth API calls visible — session is maintained via cookies
- Cookie consent is managed via CookieYes (cookieyes.com)
- Existing Chrome session with Koyfin login is required

## Observations

- The graph data response is NOT cached in Service Worker or localStorage
- No WebSocket connections observed for this page
- The page uses chunked JS bundles (Webpack code splitting)
- Sentry error tracking is active (sentry key: `7bee77d82a8f4f77858bac1a4290c033`)

## Script and examples

- Extractor: `@../scripts/performance/extract.js`
- Script README: `@../scripts/performance/README.md`
