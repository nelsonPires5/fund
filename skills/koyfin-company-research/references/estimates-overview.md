# Koyfin Estimates Overview tab

**Section:** Analyst Estimates  
**Research use:** forward sales/EBITDA/EBIT/EPS estimate matrix and next-quarter summary.  
**Observed exploration ticker:** MSFT. Treat values as examples; scripts must work for other tickers and missing-data states.

## Research guide

Use this tab when the company question needs forward sales/EBITDA/EBIT/EPS estimate matrix and next-quarter summary. Start by confirming the active ticker and Koyfin internal security id in the URL. Then review the visible widgets/tables, switch period/toggle controls only when needed, and extract structured data with `@../scripts/estimates-overview/extract.js`.

## Extraction contract

- Run from the active Koyfin `Estimates Overview` page in an authenticated browser session.
- Save transient outputs and screenshots under `/tmp/<TICKER>/estimates-overview/`.
- Final structured rows must include `ticker`, `tab`, `extracted_at` and enough tab-specific context columns.
- Empty/no-coverage/no-data states must emit empty arrays or CSV headers plus an explicit status/error field.
- Prefer Koyfin network/API data when request and response bodies are captured safely; otherwise use DOM/SVG/table extraction documented here.

## Output schema observed

### JSON shape observed

```json
{
  "ticker": "str",
  "tab": "str",
  "extracted_at": "str",
  "url": "str",
  "entity_id": "str",
  "summary": {
    "nextEarningsDate": "str",
    "nextQuarter": "str",
    "metrics": {
      "Revenues": "dict",
      "EBITDA": "dict",
      "EBIT": "dict",
      "EPS GAAP": "dict",
      "EPS": "dict"
    }
  },
  "matrix": {
    "fiscalYears": [
      "str"
    ],
    "periods": [
      "str"
    ],
    "metrics": {
      "Sales": "dict",
      "EBITDA": "dict",
      "EBIT": "dict",
      "EPS": "dict",
      "EPS GAAP": "dict"
    },
    "estimateStatus": {
      "FY 2025": "str",
      "FY 2026": "str",
      "FY 2027": "str",
      "FY 2028": "str"
    }
  },
  "metadata": {
    "pageTitle": "str",
    "fiscalYearEnd": "str",
    "quarterLabels": [
      "str"
    ],
    "domain": "str",
    "dataSource": "str",
    "apiEndpoint": "str"
  }
}
```

## MSFT page summary

# Koyfin Security Analysis — Estimates Overview

**Ticker:** MSFT (Microsoft Corporation)  
**Tab:** Security Analysis > Analyst Estimates > Estimates Overview  
**URL:** `https://app.koyfin.com/estimates/est/eq-kuqeq3`  
**Extracted at:** 2026-05-17  
**Page Title:** MSFT - Estimates  
**Entity ID:** eq-kuqeq3

---

## Page Structure

The Estimates Overview page consists of two main panels:

### 1. Next Upcoming Reporting Quarter (Summary Table)

Shows actual vs. estimated data for the next reporting quarter (4Q Jun 2026):

| Metric   | Last (A)   | Next (E)   | Growth  |
|----------|------------|------------|---------|
| Revenues | $82.89B    | $87.66B    | 5.76%   |
| EBITDA   | $48.56B    | $51.67B    | 6.40%   |
| EBIT     | $38.40B    | $39.02B    | 1.62%   |
| EPS GAAP | 4.27       | 4.21       | -1.50%  |
| EPS      | 4.27       | 4.24       | -0.60%  |

- **Last (A):** As of Mar 31, 2026 (3Q FY2026 actual)
- **Next (E):** As of May 16, 2026 (4Q FY2026 estimate)
- **Next Earnings Date:** Thu Jul 30th 2026 (After-Market)

### 2. Earnings Matrix — Reported & Estimates

A quarterly matrix covering FY 2025 through FY 2028 with 5 metric tabs:

- **Sales** — Quarterly revenue projections ($B)
- **EBITDA** — Quarterly EBITDA projections ($B)
- **EBIT** — Quarterly EBIT projections ($B)
- **EPS** — Quarterly EPS projections
- **EPS GAAP** — Quarterly GAAP EPS projections

Matrix structure (per metric):
- Rows: 1Q Sep, 2Q Dec, 3Q Mar, 4Q Jun, Year, Growth
- Columns: FY 2025 (actual), FY 2026 (partial actual/estimated), FY 2027 (estimated), FY 2028 (estimated)

---

## Key Observations

1. **Data is server-rendered into DOM** — No additional XHR/fetch calls when switching metric tabs. All data is embedded in the page HTML.
2. **Tab switching is instant** — The matrix re-renders client-side with no network traffic.
3. **Estimate status** is indicated by CSS class `common-estimates-styles__estimated___jkPY1` on cells that contain forward-looking estimates (vs. reported actuals).
4. **API endpoint** `https://app.koyfin.com/api/v3p/data/graph?schema=packed` appears to be the generic data graph API used by Koyfin, but this page pre-bakes data into the DOM.
5. **Ticker entity ID** (`eq-kuqeq3`) is a Koyfin internal identifier for MSFT equity.
6. **FY reporting** is Jul-Jun (Microsoft's fiscal year: Q1 Sep, Q2 Dec, Q3 Mar, Q4 Jun).

---

## File Listing

```
/tmp/MSFT/estimates-overview/
├── summary.md               ← This file
├── data_inventory.md        ← Structured inventory of all extracted data
├── extract.js               ← Reusable JS snippet for DOM extraction
├── sample-output.json       ← Full extracted data as JSON
├── network.md               ← Network request patterns
├── network-sample.json      ← Sample API call observations
├── 01-initial-state.png     ← Initial page state (Price Target tab)
├── 02-estimates-overview.png ← Estimates Overview page (Sales tab)
├── 03-sales-tab.png         ← Pre-EBITDA-click state
└── 04-sales-tab-final.png   ← Final state back on Sales tab
```

## Data inventory and extraction patterns

# Data Inventory — Estimates Overview (MSFT)

## 1. Summary Panel — Next Upcoming Reporting Quarter

**CSS Container:** `[class*="summaryGridStyle"]`  
**Tab:** "Next Upcoming Reporting Quarter"  
**Period:** 4Q Jun 2026 (next quarter)

| Row | Metric   | Last (Actual) | Value  | Next (Estimate) | Value  | Growth | Value   |
|-----|----------|---------------|--------|-----------------|--------|--------|---------|
| 1   | Revenues | 3Q Mar 2026   | $82.89B| 4Q Jun 2026     | $87.66B| 5.76%  | (green) |
| 2   | EBITDA   | 3Q Mar 2026   | $48.56B| 4Q Jun 2026     | $51.67B| 6.40%  | (green) |
| 3   | EBIT     | 3Q Mar 2026   | $38.40B| 4Q Jun 2026     | $39.02B| 1.62%  | (green) |
| 4   | EPS GAAP | 3Q Mar 2026   | 4.27   | 4Q Jun 2026     | 4.21   | -1.50% | (red)   |
| 5   | EPS      | 3Q Mar 2026   | 4.27   | 4Q Jun 2026     | 4.24   | -0.60% | (red)   |

**Next Earnings Date:** Thu Jul 30th 2026 (After-Market)

---

## 2. Earnings Matrix — Sales (Revenue)

**CSS Container:** `[class*="estimatesPeriodMatrix"]`  
**Tab:** Sales (default)

| Period   | FY 2025   | FY 2026   | FY 2027   | FY 2028   |
|----------|-----------|-----------|-----------|-----------|
| 1Q Sep   | $65.59B   | $77.67B   | $89.67B   | $105.18B  |
| 2Q Dec   | $69.63B   | $81.27B   | $94.26B   | $110.52B  |
| 3Q Mar   | $70.07B   | $82.89B   | $96.66B   | $111.95B  |
| 4Q Jun   | $76.44B   | $87.66B   | $102.52B  | $119.31B  |
| **Year** | $281.72B  | $329.50B  | $384.00B  | $452.94B  |
| Growth   | 14.93%    | 16.96%    | 16.54%    | 17.96%    |

---

## 3. Earnings Matrix — EBITDA

**Tab:** EBITDA

| Period   | FY 2025   | FY 2026   | FY 2027   | FY 2028   |
|----------|-----------|-----------|-----------|-----------|
| 1Q Sep   | $37.94B   | $51.02B   | $57.36B   | $69.05B   |
| 2Q Dec   | $38.48B   | $47.47B   | $59.47B   | $71.86B   |
| 3Q Mar   | $40.74B   | $48.56B   | $61.27B   | $74.98B   |
| 4Q Jun   | $45.53B   | $51.67B   | $63.92B   | $78.71B   |
| **Year** | $162.68B  | $198.22B  | $239.21B  | $291.17B  |
| Growth   | 23.51%    | 21.85%    | 20.68%    | 21.72%    |

---

## 4. Earnings Matrix — EBIT

**Tab:** EBIT

| Period   | FY 2025   | FY 2026   | FY 2027   | FY 2028   |
|----------|-----------|-----------|-----------|-----------|
| 1Q Sep   | $30.55B   | $37.96B   | $42.48B   | $49.50B   |
| 2Q Dec   | $31.65B   | $38.27B   | $43.95B   | $51.30B   |
| 3Q Mar   | $32.00B   | $38.40B   | $44.75B   | $53.04B   |
| 4Q Jun   | $34.32B   | $39.02B   | $46.89B   | $56.08B   |
| **Year** | $128.53B  | $153.66B  | $178.64B  | $209.72B  |
| Growth   | 17.45%    | 19.55%    | 16.25%    | 17.40%    |

---

## 5. Earnings Matrix — EPS

**Tab:** EPS

| Period   | FY 2025 | FY 2026 | FY 2027 | FY 2028 |
|----------|---------|---------|---------|---------|
| 1Q Sep   | 3.30    | 4.13    | 4.63    | 5.43    |
| 2Q Dec   | 3.23    | 4.14    | 4.78    | 5.59    |
| 3Q Mar   | 3.46    | 4.27    | 4.87    | 5.78    |
| 4Q Jun   | 3.65    | 4.24    | 5.09    | 6.05    |
| **Year** | 13.64   | 16.85   | 19.37   | 22.53   |
| Growth   | 15.59%  | 23.50%  | 14.99%  | 16.30%  |

---

## 6. Earnings Matrix — EPS GAAP

**Tab:** EPS GAAP

| Period   | FY 2025 | FY 2026 | FY 2027 | FY 2028 |
|----------|---------|---------|---------|---------|
| 1Q Sep   | 3.30    | 3.72    | 4.64    | 5.49    |
| 2Q Dec   | 3.23    | 5.16    | 4.82    | 5.68    |
| 3Q Mar   | 3.46    | 4.27    | 4.91    | 5.91    |
| 4Q Jun   | 3.65    | 4.21    | 5.14    | 6.21    |
| **Year** | 13.64   | 17.32   | 19.50   | 22.99   |
| Growth   | 15.59%  | 27.00%  | 12.56%  | 17.88%  |

---

## Data Quality Notes

- All data extracted directly from rendered DOM elements.
- Cell values include prefix ($), postfix (B, %), and raw numeric label.
- Estimated cells (future periods) have CSS class `common-estimates-styles__estimated___jkPY1`.
- Actual cells (past periods) lack the estimated class.
- Growth values use `color-value__up___ga5Jf` (green) for positive, `color-value__down___VOAvd` (red) for negative.
- Dollar values are in billions (B suffix).
- EPS values are per-share dollar amounts (no suffix).
- Growth values are percentages.

## Network/API notes

# Network Patterns — Koyfin Estimates Overview

## API Endpoint Architecture

Koyfin uses a REST + Graph-style API under `app.koyfin.com`.

### Key Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `https://app.koyfin.com/api/v3p/data/graph?schema=packed` | GET | Generic data graph — loads dashboard/security data |
| `https://app.koyfin.com/api/v3p/data/keys` | GET | Data key definitions |
| `https://app.koyfin.com/api/v3p/data/vocabularies/holidays` | GET | Holiday calendar (trading calendar) |
| `https://app.koyfin.com/api/v3/billing/subscriptions` | GET | User subscription info |
| `https://app.koyfin.com/api/v3/users/settings` | GET/POST | User settings |
| `https://app.koyfin.com/api/v3/users/watchlists` | GET | Watchlists |
| `https://app.koyfin.com/api/v3/users/dashboards/structure` | GET | Dashboard layout |
| `https://auth.koyfin.com/users/profile` | GET | User profile |
| `https://auth.koyfin.com/authorization/grants` | GET | Auth grants |
| `https://auth.koyfin.com/authorization/entitlements/me` | GET | User entitlements |
| `https://mix.koyfin.com/track/` | POST | Mixpanel analytics |
| `https://mix.koyfin.com/engage/` | POST | Mixpanel engagement |

### Data Flow Pattern

1. **Page load**: Multiple `api/v3p/data/graph?schema=packed` calls fire in parallel.
2. **Tab switching**: No additional network requests — data is already hydrated in the DOM.
3. **The `graph?schema=packed` endpoint** appears to return a packed schema of data points keyed by some internal ID system.

## Estimates Overview Specifics

For the Estimates Overview tab specifically:
- **No lazy loading** — All estimate data (Sales, EBITDA, EBIT, EPS, EPS GAAP for FY2025-FY2028) is embedded in the initial page HTML.
- **No XHR on tab switch** — Switching between Sales/EBITDA/EBIT/EPS/EPS GAAP tabs triggers zero network requests.
- **The data is server-side rendered** into the React component tree during page hydration.

## Auth Headers (observed)

Requests to `app.koyfin.com` carry standard auth cookies and headers. The `auth.koyfin.com` subdomain handles OAuth/SSO.

## Tracking/Analytics

- **Mixpanel**: `mix.koyfin.com/track/` and `mix.koyfin.com/engage/`
- **Google Analytics**: `www.google-analytics.com/g/collect`
- **Clarity**: `s.clarity.ms/collect`
- **Sentry**: Error tracking via `sentry.io`
- **ProfitWell**: Subscription analytics via `www2.profitwell.com`
- **LinkedIn Insight**: `px.ads.linkedin.com`
- **Twitter Pixel**: `static.ads-twitter.com`
- **Reddit Pixel**: `alb.reddit.com`

## Caching

- Static assets (CSS, JS bundles) use hashed filenames (e.g., `main.e96e9bea.4850ac63aae3bbf071dc.css`) for long-term caching.
- API responses appear uncached (no `Cache-Control` observed).

## Data Key Vocabulary

The `api/v3p/data/vocabularies/holidays` endpoint suggests Koyfin uses a vocabulary system for data keys. The `data/keys` endpoint returns available data fields. This is likely the mechanism for programmatic data access.

## Script and examples

- Extractor: `@../scripts/estimates-overview/extract.js`
- Script README: `@../scripts/estimates-overview/README.md`
