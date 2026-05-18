# Koyfin Estimates Trends tab

**Section:** Analyst Estimates  
**Research use:** estimate revisions and analyst-count trend by fiscal year and metric.  
**Observed exploration ticker:** MSFT. Treat values as examples; scripts must work for other tickers and missing-data states.

## Research guide

Use this tab when the company question needs estimate revisions and analyst-count trend by fiscal year and metric. Start by confirming the active ticker and Koyfin internal security id in the URL. Then review the visible widgets/tables, switch period/toggle controls only when needed, and extract structured data with `@../scripts/estimates-trends/extract.js`.

## Extraction contract

- Run from the active Koyfin `Estimates Trends` page in an authenticated browser session.
- Save transient outputs and screenshots under `/tmp/<TICKER>/estimates-trends/`.
- Final structured rows must include `ticker`, `tab`, `extracted_at` and enough tab-specific context columns.
- Empty/no-coverage/no-data states must emit empty arrays or CSV headers plus an explicit status/error field.
- Prefer Koyfin network/API data when request and response bodies are captured safely; otherwise use DOM/SVG/table extraction documented here.

## Output schema observed

### CSV headers observed

`ticker`, `metric`, `fiscal_period`, `analyst_count`, `estimate_low`, `estimate_high`, `average`, `yoy_chg_pct`, `ev_multiple`, `price_multiple`
### JSON shape observed

```json
{
  "ticker": "str",
  "tab": "str",
  "url": "str",
  "extractedAt": "str",
  "headers": [
    "str"
  ],
  "groups": [
    {
      "metric": "str",
      "rows": "list"
    }
  ]
}
```

## MSFT page summary

# Koyfin Security Analysis — MSFT Estimates Trends (ERT)

## Navigation

- **Page**: Security Analysis > Analyst Estimates > Estimates Trends
- **URL pattern**: `https://app.koyfin.com/estimates/ert/{ticker-id}`
- **Ticker ID for MSFT**: `eq-kuqeq3`
- **Full URL**: https://app.koyfin.com/estimates/ert/eq-kuqeq3
- **Title**: "MSFT - Estimate Trends"

## Sections on Page

### 1. Analyst Estimates Trend (Chart)
- Top section showing a time-series chart of consensus estimates
- Metric selector: Sales (default), with dropdown for other metrics
- Time period buttons: 1M, 3M, 6M, 1Y, 3Y
- EXPORT button
- Shows NTM (Next Twelve Months) estimate trend over time with stock price overlay
- Data points are plotted along month axis (Jun, Jul, Aug, Sep, Oct, Nov, Dec, Jan, Feb, Mar, Apr, May)
- For current view: FY 2026 ($329.50B) through FY 2029 ($528.13B)

### 2. Analyst Estimates Breakdown (Table)
- Scrollable data grid with virtualized rows
- **Column headers**: Fiscal Period, Analyst #, Estimate Low to High Range, Average, YoY Chg %, EV Multiple, Price Multiple
- **Groups** (by financial metric):
  - **Sales** — 48 analysts for FY2026, up to 5 analysts for FY2035
  - **EBITDA** — 24 analysts for FY2026, dropping to 1 analyst for FY2035
  - **EBIT** — 46 analysts for FY2026, dropping to 2 analysts for FY2035
  - **EPS** — 25 analysts for FY2026, dropping to 1 analyst for FY2035
  - **EPS GAAP** — 33 analysts for FY2026, dropping to 1 analyst for FY2035
- Years covered: FY 2026 through FY 2035
- "FULL VIEW" button (likely expands hidden columns)
- "Years" filter button (default: shows all years)

### 3. Quotebox (top of page)
- Ticker: MSFT
- Price: $421.92 (as of May 15, 2026)
- Market Cap: $3,134.21B
- Sector: Information Technology
- Industry: Software

## Data Quality
- Data fully loaded and visible
- No cookie consent blockers interfering with data rendering
- All 5 metric groups present with complete row data
- Coverage decreases for outer years (FY2030+), gracefully showing fewer analysts

## Observations
- Koyfin uses React with CSS modules (class names like `base-table-row__root___HASH`)
- Data tables use div-based virtualized grids, not standard `<table>` elements
- Chart rendered as SVG
- API endpoint: `/api/v3p/data/graph?schema=packed` (POST/GET with auth)
- Page uses client-side routing; navigation to ERT tab is a SPA transition
- No Apollo/Redux/Next.js client state stores detected

## Data inventory and extraction patterns

# Data Inventory — MSFT Estimates Trends

## Extracted Data Elements

### 1. Detailed Table Data — "Analyst Estimates Breakdown"

#### Column mappings (7 data columns):
| # | Header | Description | Format |
|---|--------|-------------|--------|
| 1 | Fiscal Period | Reporting fiscal year | `FY YYYY` |
| 2 | Analyst # | Number of analysts covering | Integer |
| 3 | Estimate Low to High Range | Low and high estimate values | Two values separated by newline; `$X.XXB` or `X.XX` |
| 4 | Average | Consensus average estimate | `$X.XX B` or `X.XX` |
| 5 | YoY Chg % | Year-over-year change percentage | `X.XX %` |
| 6 | EV Multiple | Enterprise Value multiple | `X.X x` or `-` |
| 7 | Price Multiple | Price / earnings or similar multiple | `X.X x` or `-` |

#### Groups (5 metrics):
| Group | Symbol | Has $ values | Has EV Multiple | Has Price Multiple |
|-------|--------|-------------|----------------|-------------------|
| Sales | Revenue | Yes | Yes | `-` |
| EBITDA | Earnings before interest, taxes, depreciation, amortization | Yes | Yes | `-` |
| EBIT | Earnings before interest and taxes | Yes | Yes | `-` |
| EPS | Earnings Per Share | No | `-` | Yes |
| EPS GAAP | EPS under GAAP | No | `-` | `-` |

#### Year coverage for each metric:
- **Sales**: FY2026 (48 analysts) → FY2035 (5 analysts) — 10 years
- **EBITDA**: FY2026 (24 analysts) → FY2035 (1 analyst) — 10 years
- **EBIT**: FY2026 (46 analysts) → FY2035 (2 analysts) — 10 years
- **EPS**: FY2026 (25 analysts) → FY2035 (1 analyst) — 10 years
- **EPS GAAP**: FY2026 (33 analysts) → FY2035 (1 analyst) — 10 years

### 2. Chart Data — "Analyst Estimates Trend"
- Interactive SVG chart showing NTM estimate consensus trend
- Default metric: Sales
- Time range buttons: 1M, 3M, 6M, 1Y, 3Y
- Shows FY estimate lines for FY2026–FY2029
- Stock price overlay (MSFT $421.92)

### 3. Ticker Metadata (from quotebox)
- Current price, market cap, sector, industry
- Forward P/E, volume
- Next earnings date: Thu Jul 30th 2026 (After-Market)

## DOM Extraction Strategy

### XPath/CSS patterns for the data table:
```
// Estimates Trends container
div[class*="estimates-trends__koy__page_container"]

// Chart section
div[class*="estimates-trends-chart__estimateTrends__chartContainer"]

// Table section
div[class*="estimates-trends-table__estimateTrends__table"]

// Scrollable data container
div[class*="scrollContainer"] > div > div[class*="groupHeader"]  // group header
div[class*="scrollContainer"] > div > div[class*="base-table-row__root"]  // data rows

// Each group (Sales, EBITDA, EBIT, EPS, EPS GAAP) is a child div containing:
//   - A groupHeader div with the metric name
//   - N base-table-row__root divs (one per fiscal year)
```

### Cell extraction within a row:
```
Each row contains 7 child divs (estimates-trends-table__koy__table_cell):
[0] Fiscal Period — textContent
[1] Analyst # — textContent
[2] Estimate Low to High Range — textContent (low\\nhigh)
[3] Average — textContent
[4] YoY Chg % — textContent
[5] EV Multiple — textContent
[6] Price Multiple — textContent
```

## API Endpoints Observed

| Endpoint | Method | Content | Size |
|----------|--------|---------|------|
| `/api/v3p/data/graph?schema=packed` | XHR/Fetch | Graph data payloads | 1.1KB–17KB |
| `/api/v3p/data/keys` | XHR | Data key lookups | 500B–19KB |
| `/api/v3/data/keys` | XHR | Data key lookups (v3) | 500B–19KB |
| `/api/v3/billing/subscriptions` | XHR | User subscription | 546B |
| `/api/v3/tickers/filters` | XHR | Ticker filter data | 2.1KB |

## Cookie/Consent
- CookieYes consent banner is present but does not block data rendering
- Consent banner uses class prefix `cky-`
- No cookie consent acceptance was needed for data access

## Network/API notes

# Network Analysis — Koyfin Estimates Trends

## Key Data API Endpoints

All requests go through `app.koyfin.com` with auth cookies from the running Chrome session.

### Primary data endpoint
```
GET/POST https://app.koyfin.com/api/v3p/data/graph?schema=packed
```
- **Initiator**: XMLHttpRequest (mostly) and fetch
- **Response size**: 1.1KB–17KB (larger responses contain full estimates data)
- **Frequency**: Multiple calls on page load (5–13 calls observed)
- **Content**: Packed graph data containing estimates time series and breakdown values
- **Auth**: Cookie-based session authentication

### Supporting endpoints

| Endpoint | Method | Size | Purpose |
|----------|--------|------|---------|
| `/api/v3p/data/keys` | XHR | 500B–19KB | Data key resolution for graph queries |
| `/api/v3/data/keys` | XHR | 500B–19KB | Legacy data key resolution |
| `/api/v3/tickers/filters` | XHR | 2.1KB | Ticker filter metadata |
| `/api/v3p/data/vocabularies/holidays` | XHR | 609B | Holiday calendar data |
| `/api/v3/billing/subscriptions` | XHR | 546B | User subscription info |
| `/api/v3/users/settings` | XHR | 315B–2.7KB | User preferences |
| `/auth.koyfin.com/users/profile` | XHR | small | User profile |
| `/auth.koyfin.com/authorization/entitlements/me` | XHR | small | Auth entitlements |

### Tracking/Analytics endpoints (not data-relevant)
- `log.cookieyes.com` — consent logging
- `sentry.io` — error tracking
- `google-analytics.com` — analytics
- `bat.bing.com` — Microsoft Ads
- `mix.koyfin.com` — Mixpanel

## Data Flow
1. Page loads → auth/profile/billing requests
2. `/api/v3p/data/keys` resolves data keys for the ticker
3. `/api/v3p/data/graph?schema=packed` fetches the actual graph/table data
4. Client renders data into SVG chart and div-based grid

## URL Patterns

### Security Analysis pages (URL routing):
```
/estimates/est/{ticker-id}   → Analyst Estimates Overview
/estimates/ert/{ticker-id}   → Estimates Trends (this page)
/estimates/eac/{ticker-id}   → Actuals and Consensus
/estimates/pt/{ticker-id}    → Price Target
```

### Static assets pattern:
```
/styles/main.{hash}.css
/scripts/bundle.{type}.{hash}.js
/images/{name}.svg
```

## Authentication
- Session-based auth via cookies (no visible tokens in URLs)
- Auth domain: `auth.koyfin.com`
- Cookie domain: `app.koyfin.com` with session cookies
- Direct API calls from outside the page context return 404

## Caching Strategy
- All `/api/v3p/data/graph` calls use `schema=packed` query parameter
- Multiple calls made with potentially different request bodies/headers for different data slices
- Chart metric selector (Sales/EBITDA/EBIT/EPS/EPS GAAP) likely triggers new graph calls
- Time period buttons (1M/3M/6M/1Y/3Y) may refetch or just re-render existing data

## Script and examples

- Extractor: `@../scripts/estimates-trends/extract.js`
- Script README: `@../scripts/estimates-trends/README.md`
