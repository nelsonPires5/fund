# Koyfin Overview tab

**Section:** Snapshots  
**Research use:** first-pass company dashboard: quote, key metrics, performance, valuation, capital structure, estimates, chart, news.  
**Observed exploration ticker:** MSFT. Treat values as examples; scripts must work for other tickers and missing-data states.

## Research guide

Use this tab when the company question needs first-pass company dashboard: quote, key metrics, performance, valuation, capital structure, estimates, chart, news. Start by confirming the active ticker and Koyfin internal security id in the URL. Then review the visible widgets/tables, switch period/toggle controls only when needed, and extract structured data with `@../scripts/overview/extract.js`.

## Extraction contract

- Run from the active Koyfin `Overview` page in an authenticated browser session.
- Save transient outputs and screenshots under `/tmp/<TICKER>/overview/`.
- Final structured rows must include `ticker`, `tab`, `extracted_at` and enough tab-specific context columns.
- Empty/no-coverage/no-data states must emit empty arrays or CSV headers plus an explicit status/error field.
- Prefer Koyfin network/API data when request and response bodies are captured safely; otherwise use DOM/SVG/table extraction documented here.

## Output schema observed

### CSV headers observed

`ticker`, `tab`, `extracted_at`, `section`, `metric`, `period`, `value`
### JSON shape observed

```json
{
  "ticker": "str",
  "tab": "str",
  "extracted_at": "str",
  "key_data": {
    "Dividend Yield": "str",
    "Avg Volume (10D)": "str",
    "Beta (5Y Monthly)": "str",
    "Volatility (1Y)": "str",
    "Shares Outstanding": "str",
    "Short Interest %": "str",
    "Industry": "str",
    "Competitors": "str"
  },
  "performance_returns": {
    "periods": [
      "str"
    ],
    "Price": [
      "str"
    ],
    "Total": [
      "str"
    ]
  },
  "valuation": {
    "columns": [
      "str"
    ],
    "data": [
      "dict"
    ]
  },
  "capital_structure": {
    "Market Cap": "str",
    "Total Debt": "str",
    "Cash & Inv.": "str",
    "Enterprise Value": "str"
  },
  "analyst_estimates": {
    "columns": [
      "str"
    ],
    "data": [
      "dict"
    ]
  },
  "chart_periods": [
    "str"
  ],
  "quote_box": {
    "Price": "str",
    "Change": "str",
    "After-Market": "str",
    "Next Earnings": "str",
    "Sector": "str",
    "Industry": "str",
    "Market Cap": "str",
    "Forward P/E": "str",
    "Volume": "str",
    "Total Return (3M)": "str",
    "Total Return (1Y)": "str"
  }
}
```

## MSFT page summary

# Koyfin Security Analysis — Overview Tab

## What This Tab Is

The **Overview** tab is the default landing page within Koyfin's Security Analysis section for any equity ticker. It serves as a **company research dashboard** that aggregates the most critical investment data into a single, scannable view. It is designed for rapid company due diligence — giving analysts a "first look" before diving deeper into financials, estimates, or transcripts.

### How It Supports Company Research

| Dimension | What It Provides |
|-----------|-----------------|
| **Price & Market** | Real-time quote, after-market price, volume, market cap, sector/industry classification |
| **Key Metrics** | Dividend yield, beta, volatility, shares outstanding, short interest, competitors |
| **Performance** | Price and total return across 1M/3M/YTD/1Y periods |
| **Valuation** | LTM and NTM multiples: P/E, EV/Sales, EV/EBITDA, Price/Book |
| **Capital Structure** | Market cap, total debt, cash & investments, enterprise value |
| **Forward Estimates** | Consensus analyst estimates for Sales and EPS for FY2026–FY2028, with YoY growth |
| **Price Chart** | Interactive snapshot chart with configurable periods (1d through All) |
| **News Feed** | Curated stream of recent news articles related to the company |

### Key Characteristics
- **Two-column layout**: Wide left (chart + news), narrow right (data panels)
- **All data visible above-the-fold** for the target ticker (scroll needed for news)
- **All panels use Koyfin's standard `koy-panel` component** with consistent label/value grid structure
- **Data cells** follow pattern: `stdDataCell` > `stdDataLabel` (label) + `stdCellValueResult` > `default-cell__label` (value) + optional prefix/postfix spans
- **Refresh/update**: Values show "As of [date]" tooltip; price updates in real-time

## URL Pattern

```
https://app.koyfin.com/snapshot/s/{securityId}
```

Where `{securityId}` is the internal Koyfin security identifier (e.g., `eq-kuqeq3` for MSFT on NasdaqGS). The ticker portion can also be used:
```
https://app.koyfin.com/snapshot/{TICKER}
```
This redirects to the snapshot default view; the Overview sub-tab is at `/snapshot/s/{securityId}`.

## Data Freshness

- Price data: Real-time or 15-min delayed (last updated timestamp shown)
- Fundamental data: As of most recent filing (e.g., "As of Mar 30, 2026")
- Estimates: "As of May 16, 2026" (consensus date)
- News: Continuously updating feed

---

*Extracted from MSFT (Microsoft Corporation, NasdaqGS) on 2026-05-17*

## Data inventory and extraction patterns

# Koyfin Overview Tab — Data Inventory

## Page Layout

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ TOP BAR: Ticker | Price | Change | Volume | Sector | Industry | Mkt Cap ... │
├───────────────────────────────────────────────┬─────────────────────────────┤
│                                               │ KEY DATA                    │
│         SNAPSHOT CHART                        │  Dividend Yield, Avg Volume │
│         (Period selectors: 1d..All)           │  Beta, Volatility, Shares.. │
│                                               │  Short Interest, Industry,  │
│                                               │  Competitors                │
│                                               ├─────────────────────────────┤
│                                               │ PERFORMANCE RETURNS         │
│                                               │  Price / Total 1M-1Y       │
│                                               ├──────────────┬──────────────┤
│                                               │ VALUATION    │ CAPITAL STR. │
│                                               │  P/E, EV/S,  │ Mkt Cap,Debt │
│                                               │  EV/EBITDA,  │ Cash, EV     │
│                                               │  Price/Book  │              │
│                                               ├──────────────┴──────────────┤
│                                               │ ANALYST ESTIMATES           │
│                                               │  Sales/EPS FY26-28 + YoY%   │
├───────────────────────────────────────────────┴─────────────────────────────┤
│ NEWS FEED (scrollable list)                                                  │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Visible Cards / Panels

### 1. Top Bar (Quote Box)
| Field | Example (MSFT) | Type |
|-------|---------------|------|
| Ticker + Exchange | MSFT / NasdaqGS | text |
| Price | 421.92 USD | number |
| Change | +12.49 (+3.05%) | number/percent |
| After-Market Price | 419.71 USD (-0.52%) | number/percent |
| Next Earnings Date | Thu Jul 30th 2026 (After-Market) | date |
| Sector | Information Technology | text |
| Industry | Software | text |
| Market Cap | $3,134.21B | currency |
| Forward P/E | 22.8 | multiple |
| Volume | 50,771,100 | integer |
| Total Return (3M) | 5.37% | percent |
| Total Return (1Y) | -6.35% | percent |

### 2. Snapshot Chart
- **Type**: Interactive OHLC/Candlestick chart with volume bars
- **Period toggles**: `1d`, `5d`, `MTD`, `1m`, `QTD`, `3m`, `6m`, `YTD`, `1y`, `3y`, `5y`, `10y`, `20y`, `All`
- **Data**: Price series + volume histogram
- **Footer toolbar**: Additional chart controls (crosshair, zoom, etc.)

### 3. Key Data
| Label | Example | Unit |
|-------|---------|------|
| Dividend Yield | 0.86 | % |
| Avg Volume (10D) | 33.37 | M shares |
| Beta (5Y Monthly) | 1.09 | ratio |
| Volatility (1Y) | 23.71 | % |
| Shares Outstanding | 7.43 | B shares |
| Short Interest % | 1.10 | % |
| Industry | Software | text |
| Competitors | ORCL, GOOGL, CRM, NVDA, AMZN | tickers (concatenated) |

### 4. Performance Returns
| Metric | 1M | 3M | YTD | 1Y |
|--------|----|----|-----|-----|
| Price | 2.60% | 5.13% | -12.76% | -6.89% |
| Total | 2.60% | 5.37% | -12.56% | -6.35% |

### 5. Valuation
| Metric | LTM | NTM |
|--------|-----|-----|
| P/E | 25.1x | 22.8x |
| EV/Sales | 10.0x | 8.6x |
| EV/EBITDA | 16.1x | 13.8x |
| Price/Book | 7.6x | — |

### 6. Capital Structure
| Label | Value |
|-------|-------|
| Market Cap | $3,134.21B |
| Total Debt | $125.43B |
| Cash & Inv. | $78.23B |
| Enterprise Value | $3,181.41B |

### 7. Analyst Estimates
| Metric | FY 2026 | FY 2027 | FY 2028 |
|--------|---------|---------|---------|
| Sales | $329.50B | $384.00B | $452.94B |
| YoY Chg | 16.96% | 16.54% | 17.96% |
| EPS | $16.85 | $19.37 | $22.53 |
| YoY Chg | 23.50% | 14.99% | 16.30% |

### 8. News Feed
- Scrollable list of recent articles
- Each item shows: headline, source, timestamp
- Source examples: Benzinga, MT Newswires, Zacks, Sherwood News

---

## Filters / Toggles / Controls

| Control | Location | Options |
|---------|----------|---------|
| Chart period selector | Below chart header | 1d, 5d, MTD, 1m, QTD, 3m, 6m, YTD, 1y, 3y, 5y, 10y, 20y, All |
| Chart type toggle | Chart toolbar (implicit) | OHLC/candlestick (default) |
| Watchlist button | Top bar | Add/Remove from watchlists |
| Alert button | Top bar | Create price alert |
| Notes button | Top bar | Add/Edit notes |
| Content sidebar tabs | Right edge (collapsed) | Additional info panels |

## Units / Formatting Conventions

- **Currency**: `$` prefix, B/M suffix (billions/millions)
- **Percentages**: number + `%` suffix
- **Multiples**: number + `x` suffix
- **Volume**: integer or M suffix
- **Shares**: B/M suffix
- **Color coding**: Green for positive values, red for negative (CSS classes: `color-value__up`, `color-value__down`)

## DOM Selectors (Stable Patterns)

### Card sections (by semantic CSS class prefix):
- `snapshot-overview__chart___*` — Chart container
- `snapshot-overview__equityOverview___*` — Key Data
- `snapshot-overview__equityPerformance___*` — Performance Returns
- `snapshot-overview__valuation___*` — Valuation
- `snapshot-overview__capstr___*` — Capital Structure
- `snapshot-overview__estimates___*` — Analyst Estimates
- `snapshot-overview__news___*` — News feed

### Cell data pattern (consistent across all panels):
- **Label**: `.koy-panel__stdDataLabel___*`
- **Value**: `.koy-panel__stdCellValueResult___*` > `.default-cell__label___*`
- **Prefix**: `.default-cell__prefix___*` (e.g., `$`)
- **Postfix**: `.default-cell__postfix___*` (e.g., `B`, `M`, `%`, `x`)
- **Headers**: `.koy-panel__stdSubHeaderCell___*` or `.koy-panel__stdSubHeaderRow___*`

---

*Inventory based on MSFT (Microsoft Corp, NasdaqGS) as rendered on 2026-05-17*

## Network/API notes

# Koyfin Overview Tab — Network / API Analysis

## Summary

Koyfin uses a **React SPA** with an internal `/api/` backend. The Overview page data appears to be served through the `/api/v3p/data/keys` endpoint, which returns pre-computed key-value pairs for the active ticker. The exact request/response payloads are not readable due to binary/compressed transfer (likely protobuf or msgpack). No easily interceptable JSON REST API was observed for snapshot data.

## Discovered API Endpoints

### Application Bootstrap (shared across all pages)

| Endpoint | Purpose |
|----------|---------|
| `GET /api/v3/billing/subscriptions` | User subscription tier |
| `GET /api/v3/billing/stripe/config` | Stripe billing config |
| `GET /api/v3/billing/stripe/customer` | Stripe customer data |
| `GET /api/v3/tickers/filters` | Ticker filter metadata |
| `GET /api/v3/data/keys` | Data key definitions |
| `GET /api/v3/users/settings` | User preferences |
| `GET /api/v3/users/watchlists` | User watchlists |
| `GET /api/v3/users/chart-hub` | Saved chart templates |
| `GET /api/v3/users/dashboards/structure` | Dashboard layout |
| `GET /api/v3/users/fa/templates` | Financial analysis templates |
| `GET /api/v3/alerts-service/me/notifications` | Alert notifications |
| `GET /api/v3/alerts-service/me/alerts` | Price alerts |
| `GET /api/v1/bfc/tickers/top` | Top tickers by category |
| `GET /api/v1/pubhub/custom-screens` | Custom screen definitions |
| `GET /api/v1/pubhub/news` | News feed data |

### Overview-Specific (observed)

| Endpoint | Notes |
|----------|-------|
| `GET /api/v3p/data/keys` | Called **multiple times** with varying response sizes (544B–1283B). Likely serves the actual Overview panel data in a compressed binary format. Response is not human-readable JSON. |
| `GET /api/v3p/data/vocabularies/holidays` | Holiday calendar data |

## Observations

1. **v3 vs v3p**: The `/api/v3p/` prefix appears for "public" or "premium" data endpoints. The `/api/v3/` prefix is used for user-account-level data.

2. **No direct JSON data endpoint for Overview**: Unlike many financial data platforms, Koyfin does not expose a clean JSON API with ticker data for the Overview tab. The data is fetched via the `data/keys` endpoint with binary payloads likely using Protocol Buffers.

3. **News endpoint**: `/api/v1/pubhub/news` returns ~15KB of JSON with news headlines, sources, and timestamps. This could be intercepted for news extraction.

4. **Authentication**: All `/api/v3/` endpoints require an authenticated session (cookie-based). The `/api/v3p/` endpoints may also require auth.

5. **Cross-origin**: API calls are same-origin (`app.koyfin.com`), no CORS issues for in-browser extraction.

## Recommendation for Durable Data Extraction

Given that the API uses binary payloads, the most reliable approach for automated extraction is **DOM-based scraping** using the stable CSS class patterns documented in `extract.js`:

- All data panels use consistent `koy-panel__std*` class prefixes
- Cell data pattern: `stdDataCell` > `stdDataLabel` + `stdCellValueResult` > `default-cell__label` (+ prefix/postfix)
- Section identifiers: `snapshot-overview__{name}Grid*`

The JS extractor in `extract.js` handles this reliably without depending on brittle API interception.

## Not Found

- No GraphQL endpoint observed
- No WebSocket/streaming connection for real-time price (likely handled by a separate service)
- No public/unauthenticated data API

---

*Analysis based on browser performance API inspection on 2026-05-17*

## Script and examples

- Extractor: `@../scripts/overview/extract.js`
- Script README: `@../scripts/overview/README.md`
