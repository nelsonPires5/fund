# Koyfin Price Target tab

**Section:** Analyst Estimates  
**Research use:** sell-side price targets, ratings distribution, return potential and no-coverage detection.  
**Observed exploration ticker:** MSFT. Treat values as examples; scripts must work for other tickers and missing-data states.

## Research guide

Use this tab when the company question needs sell-side price targets, ratings distribution, return potential and no-coverage detection. Start by confirming the active ticker and Koyfin internal security id in the URL. Then review the visible widgets/tables, switch period/toggle controls only when needed, and extract structured data with `@../scripts/price-target/extract.js`.

## Extraction contract

- Run from the active Koyfin `Price Target` page in an authenticated browser session.
- Save transient outputs and screenshots under `/tmp/<TICKER>/price-target/`.
- Final structured rows must include `ticker`, `tab`, `extracted_at` and enough tab-specific context columns.
- Empty/no-coverage/no-data states must emit empty arrays or CSV headers plus an explicit status/error field.
- Prefer Koyfin network/API data when request and response bodies are captured safely; otherwise use DOM/SVG/table extraction documented here.

## Output schema observed

### JSON shape observed

```json
{
  "ticker": "str",
  "tab": "str",
  "url": "str",
  "extracted_at": "str",
  "price_target": {
    "avg_target": "float",
    "high_target": "float",
    "low_target": "float",
    "median_target": "float",
    "std_dev": "float",
    "num_estimates": "int",
    "prev_target": "float",
    "current_price": "float",
    "return_potential_pct": "float",
    "trailing_1y_return_pct": "float"
  },
  "ratings": {
    "summary": {
      "strong_buy": "int",
      "buy": "int",
      "hold": "int",
      "sell": "int",
      "strong_sell": "int",
      "covering_analysts": "int"
    },
    "avg_rating_1to5": "float",
    "historical": [
      "dict"
    ]
  },
  "historical_price_target_chart": {
    "date_range": "str",
    "frequency": "str",
    "available_time_presets": [
      "str"
    ],
    "current_view_period": "str",
    "low_target": "float",
    "avg_target": "float",
    "high_target": "float",
    "current_price": "float",
    "target_premium_pct": "float"
  },
  "metadata": {
    "source_page": "str",
    "data_freshness": {
      "price_target_data": "str",
      "stock_price": "str"
    },
    "api_endpoint": "str",
    "api_method": "str",
    "data_keys_prefix": "str",
    "no_coverage_handling": "str"
  }
}
```

## MSFT page summary

# Koyfin MSFT Price Target — Exploration Summary

**Date:** 2026-05-17  
**Ticker:** MSFT (Microsoft Corporation)  
**Page:** Security Analysis > Analyst Estimates > Price Target  
**URL:** `https://app.koyfin.com/estimates/pt/eq-kuqeq3`  
**Tab:** `MSFT - Price Target`

---

## Data Overview

### Price Target (12-Month Consensus)

| Metric | Value |
|---|---|
| **Low Target** | $400.00 |
| **Average Target** | $560.63 |
| **Median Target** | $557.50 |
| **High Target** | $870.00 |
| **Std Dev** | $74.07 |
| **Current Price** | $421.92 |
| **Return Potential** | +32.88% |
| **Trailing 1Y Price Return** | -6.89% |
| **Number of Estimates** | 54 |

### Analyst Ratings Breakdown

| Rating | Count |
|---|---|
| **Strong Buy** | 11 |
| **Buy** | 41 |
| **Hold** | 3 |
| **Sell** | 0 |
| **Strong Sell** | 0 |
| **Total Covering Analysts** | 55 |
| **Average Rating (1-5)** | 4.69 (Strong Buy) |

### Historical Average Ratings

| Year | Rating |
|---|---|
| 2022 | 4.69 |
| 2023 | 4.34 |
| 2024 | 4.42 |
| 2025 | 4.50 |
| 2026 | 4.58 |

### Historical Price Target Chart

- **Period:** Jul 2023 – Apr 2026 (quarterly data points)
- **Chart type:** Three-line series (High / Average / Low) + current price marker
- **Time range presets:** MTD, 1M, QTD, 3M, 6M, YTD, 1Y, 3Y, 5Y, 10Y
- **Current relation:** Target avg premium of 32.88% over current price

---

## Key Findings

1. **Strong bullish consensus** — 52 of 55 analysts rate MSFT as Buy/Strong Buy (95%).
2. **Significant upside** — Average 12-month target ($560.63) implies 32.88% return potential from current price ($421.92).
3. **Wide dispersion** — Range spans $400 (low) to $870 (high), std dev $74.07, indicating meaningful disagreement among analysts.
4. **Rating trend** — Ratings dipped in 2023 (4.34) but have been steadily improving since, back to ~4.69 by 2026.
5. **Data source** — All price target and rating data served via Koyfin's internal `/api/v3p/data/keys` POST endpoint.

---

## Artifacts

| Artifact | Path | Description |
|---|---|---|
| Summary | `summary.md` | This file |
| Data Inventory | `data_inventory.md` | Detailed inventory of all discovered data points, DOM elements, and API fields |
| Extraction Script | `extract.js` | Reusable JavaScript for extracting price target data from the page |
| Sample Output | `sample-output.json` | Structured JSON output of all extracted data |
| Network Patterns | `network.md` | Documentation of network API patterns, endpoints, and request/response shapes |
| Network Samples | `network-sample-*.json` | Raw API responses captured via CDP script injection |
| Screenshots | `screenshot-*.png` | Page state screenshots at various stages |
| Raw Page Text | `raw-page-text.txt` | Full `document.body.innerText` dump |

## Data inventory and extraction patterns

# Koyfin MSFT Price Target — Data Inventory

## 1. Page Structure

### URL Pattern
```
https://app.koyfin.com/estimates/pt/{kid}
```
Where `{kid}` is the Koyfin ID (e.g., `eq-kuqeq3` for MSFT).

### Navigation Hierarchy
```
Security Analysis > MSFT > Analyst Estimates > Price Target (PT)
```

### Sidebar Navigation (static links)
| Section | Shortcut | Path |
|---|---|---|
| Actuals and Consensus | EAC | `/estimates/eac/{kid}` |
| **Price Target** | **PT** | **`/estimates/pt/{kid}`** |
| Estimates Overview | EST | `/estimates/est/{kid}` |
| Estimates Trends | ERT | `/estimates/ert/{kid}` |

### Page Sections (top to bottom)
1. **Quotebox** — Ticker header with current price, daily change, market data
2. **Price Target Summary Cards** — Low (400.00), High (870.00), Average (560.63), Current Price (421.92), Return Potential (32.88%), Trailing 1Y Return (-6.89%)
3. **Ratings Bar Chart** — Historical analyst ratings (2022–2026) + current breakdown (Strong Buy/Buy/Hold/Sell/Strong Sell counts)
4. **Historical Price Target Chart** — Time series of High/Average/Low targets with price overlay; time range selectors (MTD, 1M, QTD, 3M, 6M, YTD, 1Y, 3Y, 5Y, 10Y)

---

## 2. API Endpoints

### Primary: `/api/v3p/data/keys` (POST)

**Purpose:** Returns metadata and current values for all data keys for a ticker.

**Request:** POST with `Content-Type: application/json`, includes auth cookies.

**Request body:**
```json
{
  "ids": ["{tickerKID}"],
  "keys": ["fest_estpt", "fest_estpt_high", "fest_estpt_low", ...]
}
```
Where the ticker KID can be extracted from the current URL path (e.g., `eq-kuqeq3` from `/estimates/pt/eq-kuqeq3`).

**Response shape:**
```json
{
  "KID": {
    "{tickerKID}": {
      "fest_estpt": { "date": "...", "value": 560.63, "currency": "USD" },
      "fest_estpt_high": { "date": "...", "value": 870, "currency": "USD" },
      "fest_estpt_low": { "date": "...", "value": 400, "currency": "USD" },
      "fest_estpt_median": { "date": "...", "value": 557.5, "currency": "USD" },
      "fest_estpt_stddev": { "date": "...", "value": 74.0744, "currency": "USD" },
      "fest_estpt_num": { "date": "...", "value": 54 },
      "pfest_estpt": { "date": "...", "value": 560.63, "currency": "USD" },
      "fest_est_ar_strongbuy": { "date": "...", "value": 11 },
      "fest_est_ar_outperform": { "date": "...", "value": 41 },
      "fest_est_ar_hold": { "date": "...", "value": 3 },
      "fest_est_ar_underperform": { "date": "...", "value": 0 },
      "fest_est_ar_sell": { "date": "...", "value": 0 },
      "fest_est_ar_avg_no": { "date": "...", "value": 4.69091 },
      "p_l": { "date": "...", "value": 421.92 }
    }
  }
}
```

**Key fields for Price Target:**

| Key | Type | Description |
|---|---|---|
| `fest_estpt` | `{date, value, currency}` | Current average price target (12-month consensus) |
| `fest_estpt_high` | `{date, value, currency}` | Highest analyst price target |
| `fest_estpt_low` | `{date, value, currency}` | Lowest analyst price target |
| `fest_estpt_median` | `{date, value, currency}` | Median price target |
| `fest_estpt_stddev` | `{date, value, currency}` | Standard deviation of price targets |
| `fest_estpt_num` | `{date, value}` | Number of analyst estimates |
| `pfest_estpt` | `{date, value, currency}` | Previous period price target (may match current) |
| `fest_est_ar_strongbuy` | `{date, value}` | Count of Strong Buy ratings |
| `fest_est_ar_outperform` | `{date, value}` | Count of Buy/Outperform ratings |
| `fest_est_ar_hold` | `{date, value}` | Count of Hold ratings |
| `fest_est_ar_underperform` | `{date, value}` | Count of Underperform/Sell ratings |
| `fest_est_ar_sell` | `{date, value}` | Count of Sell ratings |
| `fest_est_ar_avg_no` | `{date, value}` | Weighted average analyst rating (1–5 scale, higher = better) |
| `p_l` | `{date, value}` | Last/current stock price |
| `fest_est_eps_growth_5y` | `{date, value}` | Expected 5-year EPS growth |
| `fest_estsales_ntm` | `{date, value, currency}` | Next 12-month sales estimate |
| `fest_estebitda_ntm` | `{date, value, currency}` | Next 12-month EBITDA estimate |
| `fest_esteps_ntm` | `{date, value, currency}` | Next 12-month EPS estimate |

### Secondary: `/api/v3p/data/graph?schema=packed` (POST)

**Purpose:** Returns time-series chart data (stock prices, volumes, OHLCV).

**Request:** POST with JSON body containing `id`, `key`, `dateFrom`, `dateTo`.

**Response shape:**
```json
{
  "id": "MSFT:US",
  "KID": "eq-kuqeq3",
  "category": "eq",
  "graph": {
    "date": ["2023-01-01", ...],
    "value": [123.45, ...]
  },
  "startDate": "...",
  "endDate": "...",
  "error": null
}
```

For OHLCV data, graph includes: `date`, `open`, `high`, `low`, `close`, `adjOpen`, `adjHigh`, `adjLow`, `adjClose`, `volume`, `vwap`.

---

## 3. DOM Extraction Patterns

### Key Data Elements (visible on page)

The page renders data in React components with class names like:
- `base-container__root___AIjuc` — Root app container
- `top-header__topHeader__root___asiki` — Top bar
- Various `navi-panel-list-item__*` classes — Sidebar navigation

### Data values found as text nodes:
```
"Price Target" section:
  400.00           ← Low target
  870.00           ← High target
  12-Month Average Target / 560.63
  Current Price / 421.92
  Return Potential / 32.88%
  Trailing 1Y Price Return / -6.89%

Ratings section:
  Average Analyst Ratings (1-5) / 4.69 (and historical yearly values)
  Strong Buy / 11
  Buy / 41
  Hold / 3
  Sell / 0
  Strong Sell / 0
  Number of Covering Analysts / 55

Historical Price Target Chart:
  SVG elements with text labels for dates, prices, and legend
```

### CSS Class Patterns (stable):
- `base-container__*` — App layout containers
- `navi-panel-list-item__*` — Sidebar navigation items
- Data rendered inside React root with no stable data-testid attributes

---

## 4. Data Freshness

- All price target data timestamped `2026-05-16` (day before exploration)
- Stock price timestamped `2026-05-15T16:00:00.000-0400`
- Values update daily when market data refreshes

---

## 5. Known Variability

- **No sell-side coverage:** If `fest_estpt_num` is 0 or absent, show "no sell-side coverage" message
- **Data expiry:** `expAtS` field contains Unix timestamp of data expiry (3453854400 ≈ 2029-06-01, suggesting a fixed far-future expiry)
- **URL KID parameter:** KID (`eq-kuqeq3`) is unique per ticker/session; needs dynamic extraction from URL or API calls

## Network/API notes

# Koyfin Price Target — Network API Patterns

## Overview

Koyfin's Price Target page fetches data via POST requests to internal APIs. The SPA
(React-based) loads data asynchronously after page mount. All API calls require
authentication cookies (set after login).

---

## Endpoints

### 1. `/api/v3p/data/keys` — Ticker Data Keys (PRIMARY for Price Target)

| Aspect | Detail |
|---|---|
| **Method** | POST |
| **Content-Type** | `application/json` |
| **Auth** | Session cookies (HttpOnly) |
| **Purpose** | Returns all metadata and current values for a ticker |
| **Response size** | ~750–3,500 bytes per call |
| **Frequency** | Multiple calls per page load (different key sets) |

**Request body:**
```json
{
  "ids": ["{tickerKID}"],
  "keys": ["fest_estpt", "fest_estpt_high", "fest_estpt_low", ...]
}
```
Where the KID can be extracted from the URL path (e.g., `eq-kuqeq3` from `/estimates/pt/eq-kuqeq3`).

**Response structure:**
```json
{
  "KID": {
    "{tickerKID}": {
      "fest_estpt": { "date": "...", "value": 560.63, "currency": "USD", "expAtS": 3453854400 },
      "p_l": { "date": "...", "value": 421.92 },
      "t": "MSFT",
      "t_n": "Microsoft Corporation",
      ...
    }
  }
}
```

**Price-target-specific keys:**
| Key | Type | Description |
|---|---|---|
| `fest_estpt` | object | Average 12-month price target |
| `fest_estpt_high` | object | Highest analyst price target |
| `fest_estpt_low` | object | Lowest analyst price target |
| `fest_estpt_median` | object | Median price target |
| `fest_estpt_stddev` | object | Standard deviation of targets |
| `fest_estpt_num` | object | Number of analyst estimates |
| `pfest_estpt` | object | Previous price target value |
| `fest_est_ar_strongbuy` | object | Strong Buy rating count |
| `fest_est_ar_outperform` | object | Buy/Outperform count |
| `fest_est_ar_hold` | object | Hold count |
| `fest_est_ar_underperform` | object | Underperform count |
| `fest_est_ar_sell` | object | Sell count |
| `fest_est_ar_avg_no` | object | Average rating (1–5 scale) |
| `fest_est_eps_growth_5y` | object | Expected 5-year EPS growth |
| `fest_estsales_ntm` | object | Next-12M sales estimate |
| `fest_estebitda_ntm` | object | Next-12M EBITDA estimate |
| `fest_esteps_ntm` | object | Next-12M EPS estimate |

### 2. `/api/v3p/data/graph?schema=packed` — Chart Time Series

| Aspect | Detail |
|---|---|
| **Method** | POST |
| **Content-Type** | `application/json` |
| **Auth** | Session cookies (HttpOnly) |
| **Purpose** | Returns OHLCV price data for chart rendering |
| **Response size** | ~15KB–170KB per call (depends on date range) |
| **Frequency** | 8+ calls per page load (different timeframes/metrics) |

**Required request body parameters:**
```json
{
  "id": "MSFT:US",
  "key": "<metric_key>",
  "dateFrom": "2020-01-01",
  "dateTo": "2026-12-31"
}
```

**Response structure (OHLCV):**
```json
{
  "id": "MSFT:US",
  "KID": "eq-kuqeq3",
  "category": "eq",
  "graph": {
    "date": ["2023-01-03", ...],
    "open": [239.5, ...],
    "high": [242.3, ...],
    "low": [237.8, ...],
    "close": [241.0, ...],
    "volume": [24500000, ...],
    "adjOpen": [...],
    "adjHigh": [...],
    "adjLow": [...],
    "adjClose": [...],
    "vwap": [...]
  },
  "startDate": "2023-01-01",
  "endDate": "2026-05-15",
  "error": null
}
```

**Response structure (single-value metric):**
```json
{
  "KID": "eq-kuqeq3",
  "id": "MSFT:US",
  "category": "eq",
  "currency": "USD",
  "graph": {
    "date": ["2023-01-03", ...],
    "value": [123.45, ...]
  },
  "startDate": "...",
  "endDate": "...",
  "error": null
}
```

### 3. `/api/v3p/data/vocabularies/holidays` — Market Holidays
- Method: POST
- Purpose: Returns market holiday calendar (for trading day alignment)

### 4. Other `/api/v3/` endpoints (ancillary)
- `/api/v3/users/settings` — User preferences
- `/api/v3/users/watchlists` — User watchlist data
- `/api/v3/users/dashboards/structure` — Dashboard layout
- `/api/v3/users/chart-hub` — User chart configurations
- `/api/v3/users/fa/templates` — Financial analysis templates
- `/api/v3/alerts-service/me/notifications` — User notifications
- `/api/v3/alerts-service/me/alerts` — User alerts
- `/api/v3/billing/*` — Billing/subscription data

---

## Authentication

All `/api/v3p/` and `/api/v3/` endpoints require session cookies. The session is
established when the user authenticates at `auth.koyfin.com`. Calls from outside
the page context (e.g., curl) will fail with 401 unless cookies are forwarded.

---

## Data Caching & Freshness

- Price target data (`fest_estpt_*`) uses `expAtS` (Unix timestamp) as a cache/expiry hint
- Stock price data (`p_l`) is timestamped with market close timestamp
- Graph data uses `startDate`/`endDate` range parameters
- The SPA caches API responses in memory; navigating between tabs does not re-fetch
- Page reload triggers fresh API calls

---

## Capturing Network Data

### Via CDP Script Injection (browser-harness)

```python
# Inject interceptor before page scripts run
cdp("Page.addScriptToEvaluateOnNewDocument", source="""
window.__capturedData = [];
var origFetch = window.fetch;
window.fetch = function(url, options) {
    var urlStr = typeof url === 'string' ? url : (url.url || '');
    return origFetch.apply(this, arguments).then(function(response) {
        if (urlStr.includes('/api/v3p/data/graph') || urlStr.includes('/api/v3p/data/keys')) {
            var clone = response.clone();
            clone.text().then(function(text) {
                window.__capturedData.push({ url: urlStr, responseText: text, status: response.status });
            });
        }
        return response;
    });
};
""")

# Then navigate
goto_url("https://app.koyfin.com/estimates/pt/{kid}")
wait_for_load()
```

### Via Direct API Call from Page Context

```javascript
const resp = await fetch('/api/v3p/data/keys', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' }
});
const data = await resp.json();
```

---

## Error Handling

- **401 Unauthorized:** Session expired; redirect to login
- **404 on GET:** `/api/v3p/data/graph?schema=packed` requires POST
- **400 Bad Request:** Missing required parameters (dateFrom, dateTo, id, key)
- **Empty data:** If `fest_estpt_num` is 0 or the key is absent, there is no sell-side coverage

## Script and examples

- Extractor: `@../scripts/price-target/extract.js`
- Script README: `@../scripts/price-target/README.md`
