# Koyfin Dividend tab

**Section:** Snapshots  
**Research use:** dividend policy, growth, yield, payout, payment history and no-dividend detection.  
**Observed exploration ticker:** MSFT. Treat values as examples; scripts must work for other tickers and missing-data states.

## Research guide

Use this tab when the company question needs dividend policy, growth, yield, payout, payment history and no-dividend detection. Start by confirming the active ticker and Koyfin internal security id in the URL. Then review the visible widgets/tables, switch period/toggle controls only when needed, and extract structured data with `@../scripts/dividend/extract.js`.

## Extraction contract

- Run from the active Koyfin `Dividend` page in an authenticated browser session.
- Save transient outputs and screenshots under `/tmp/<TICKER>/dividend/`.
- Final structured rows must include `ticker`, `tab`, `extracted_at` and enough tab-specific context columns.
- Empty/no-coverage/no-data states must emit empty arrays or CSV headers plus an explicit status/error field.
- Prefer Koyfin network/API data when request and response bodies are captured safely; otherwise use DOM/SVG/table extraction documented here.

## Output schema observed

### CSV headers observed

`Announced Date`, `Ex-Date`, `Record Date`, `Payable Date`, `Currency`, `Amount`, `Adj. Amount`, `Frequency`, `Type`, `Description`
### JSON shape observed

```json
{
  "ticker": "str",
  "tickerId": "str",
  "tab": "str",
  "url": "str",
  "extractedAt": "str",
  "summary": {
    "Dividend Yield & Frequency": {
      "Indicated Yield": "str",
      "Trailing LTM Yield": "str",
      "Forward NTM Yield": "str",
      "Payout Ratio (LTM)": "str",
      "Payment Frequency": "str"
    },
    "Dividend Growth": {
      "Consecutive Annual Increases": "str",
      "annualizedGrowthPeriods": "list",
      "annualizedGrowthValues": "list"
    },
    "Shareholder Yield": {
      "Shareholder Yield*": "str"
    }
  },
  "dividends": [
    {
      "Announced Date": "str",
      "Ex-Date": "str",
      "Record Date": "str",
      "Payable Date": "str",
      "Currency": "str",
      "Amount": "str",
      "Adj. Amount": "str",
      "Frequency": "str",
      "Type": "str",
      "Description": "str"
    }
  ],
  "hasDividendData": "bool",
  "totalDividendEntries": "int",
  "headers": [
    "str"
  ]
}
```

## MSFT page summary

# Koyfin Security Analysis — Dividend Tab (MSFT)

**Ticker:** MSFT  
**Koyfin ID:** eq-kuqeq3  
**Tab:** Dividend  
**URL:** https://app.koyfin.com/snapshot/dvd/eq-kuqeq3  
**Extracted at:** 2026-05-17 (during exploration)

---

## Summary Panels

### 1. Dividend Yield & Frequency
| Metric | Value |
|---|---|
| Indicated Yield | 0.86% |
| Trailing LTM Yield | 0.63% |
| Forward NTM Yield | 0.92% |
| Payout Ratio (LTM) | 20.65% |
| Payment Frequency | Quarterly |

### 2. Dividend Growth
| Metric | Value |
|---|---|
| Consecutive Annual Increases | 21 |
| Annualized Growth % (1Y) | 9.88% |
| Annualized Growth % (3Y) | 10.20% |
| Annualized Growth % (5Y) | 10.21% |
| Annualized Growth % (10Y) | 9.86% |

### 3. Shareholder Yield (as of last FQ)
| Metric | Value |
|---|---|
| Shareholder Yield* | 1.57% |
| + Dividend Yield | 0.63% |
| + Buyback Yield | 0.64% |
| + Debt Paydown Yield | 0.10% |

---

## Dividend Payment Schedule

**Total entries in table:** 81 rows

**Columns:** Announced Date, Ex-Date, Record Date, Payable Date, Currency, Amount, Adj. Amount, Frequency, Type, Description

**Recent dividends (first 5):**
| Announced | Ex-Date | Record | Payable | Amount | Freq |
|---|---|---|---|---|---|
| 03-10-2026 | 05-21-2026 | 05-21-2026 | 06-11-2026 | $0.910 | Quarterly |
| 12-02-2025 | 02-19-2026 | 02-19-2026 | 03-12-2026 | $0.910 | Quarterly |
| 09-15-2025 | 11-20-2025 | 11-20-2025 | 12-11-2025 | $0.910 | Quarterly |
| 06-10-2025 | 08-21-2025 | 08-21-2025 | 09-11-2025 | $0.830 | Quarterly |
| 03-11-2025 | 05-15-2025 | 05-15-2025 | 06-12-2025 | $0.830 | Quarterly |

All dividends are Regular cash dividend, USD, with no special code.

**Amount trend:** $0.75 → $0.83 → $0.91 (increasing, quarterly)

---

## Chart Area

The "Dividend Yield & Payments" chart (top-right) renders historical yield data in SVG/Canvas. Data is not directly readable from the DOM. The chart supports time periods: 1y, 3y, 5y, 10y, 20y, All, and shows the Indicated Yield (0.86%) as a horizontal reference line alongside the historical dividend yield series.

---

## Network Data

Primary data APIs observed:
- `POST /api/v3p/data/graph?schema=packed` — main data graph query (requires `id`, `key`, `dateFrom`, `dateTo` params)
- `GET /api/v3/data/keys` — data key definitions
- `GET /api/v3p/data/keys` — additional data key definitions

These are the main data-fetching endpoints behind the dividend page. The graph endpoint accepts a payload with ticker ID and requested metrics, returning structured timeseries and snapshot data.

---

## Artifacts

| File | Description |
|---|---|
| `summary.md` | This file |
| `data_inventory.md` | Data schema and field inventory |
| `extract.js` | Reusable DOM extraction script |
| `sample-output.json` | Full extracted dividend data (JSON) |
| `sample-output.csv` | Dividend payment schedule as CSV |
| `network-sample.json` | Network resource timing data |
| `network-graph-response2.json` | Graph API POST sample (requires proper params) |
| `01-dividend-page.png` | Page screenshot |
| `02-dividend-fullpage.png` | Full-page screenshot |

---

## Notes

- The page uses a React SPA with CSS-module hashed class names. The `snapshot-dividend__*` prefix is stable across loads but the hash suffix (`___EdfcT`) may change across Koyfin deployments. Selector strategies in `extract.js` use partial class-name matching to be resilient.
- No-dividend companies: the grid container still renders (with empty/zero values), and the table shows 0 rows. `hasDividendData` will be `false` and `totalDividendEntries` will be `0`.
- The chart contains rendered SVG/Canvas — extracting actual data points would require replaying the underlying Graph API call rather than reading the DOM.

## Data inventory and extraction patterns

# Data Inventory — Koyfin Dividend Tab

## Extracted Data Schema

### Top-Level Object (extract.js output)

| Field | Type | Description |
|---|---|---|
| `ticker` | string | Ticker symbol from page title |
| `tickerId` | string | Koyfin internal ID (e.g. `eq-kuqeq3`) |
| `tab` | string | Always `"Dividend"` |
| `url` | string | Full page URL |
| `extractedAt` | string (ISO 8601) | Timestamp of extraction |
| `hasDividendData` | boolean | Whether dividend rows exist |
| `totalDividendEntries` | number | Count of dividend payment rows |
| `headers` | string[] | Column headers from the table |
| `summary` | object | 3 summary panels (see below) |
| `dividends` | object[] | Array of dividend payment records |
| `error` | string | Present only if grid container not found |

### Summary Panels (`result.summary`)

#### `Dividend Yield & Frequency`
| Field | Example | Description |
|---|---|---|
| `Indicated Yield` | `"0.86%"` | Latest indicated annual dividend yield |
| `Trailing LTM Yield` | `"0.63%"` | Trailing 12-month dividend yield |
| `Forward NTM Yield` | `"0.92%"` | Forward next-12-month dividend yield |
| `Payout Ratio (LTM)` | `"20.65%"` | LTM payout ratio |
| `Payment Frequency` | `"Quarterly"` | Dividend payment cadence |

#### `Dividend Growth`
| Field | Example | Description |
|---|---|---|
| `Consecutive Annual Increases` | `"21"` | Years of consecutive dividend increases |
| `annualizedGrowthPeriods` | `["1Y","3Y","5Y","10Y"]` | Period labels |
| `annualizedGrowthValues` | `["9.88%","10.20%","10.21%","9.86%"]` | CAGR values per period |

#### `Shareholder Yield`
| Field | Example | Description |
|---|---|---|
| `Shareholder Yield*` | `"1.57%"` | Total shareholder yield |
| `+ Dividend Yield` | `"0.63%"` | Dividend yield component |
| `+ Buyback Yield` | `"0.64%"` | Buyback yield component |
| `+ Debt Paydown Yield` | `"0.10%"` | Debt paydown yield component |

### Dividend Payment Records (`result.dividends[]`)

| Field | Example | Type | Description |
|---|---|---|---|
| `Announced Date` | `"03-10-2026"` | string (DD-MM-YYYY) | Date dividend was announced |
| `Ex-Date` | `"05-21-2026"` | string (DD-MM-YYYY) | Ex-dividend date |
| `Record Date` | `"05-21-2026"` | string (DD-MM-YYYY) | Record date |
| `Payable Date` | `"06-11-2026"` | string (DD-MM-YYYY) | Payment date |
| `Currency` | `"USD"` | string | Currency code |
| `Amount` | `"0.910"` | string | Dividend per share |
| `Adj. Amount` | `"0.910"` | string | Adjusted amount (for stock splits) |
| `Frequency` | `"Quarterly"` | string | Payment frequency |
| `Type` | `"Regular cash dividend"` | string | Dividend classification |
| `Description` | `"No special code applies"` | string | Additional notes |

---

## CSS Selector Inventory

| Selector | Purpose | Stability |
|---|---|---|
| `.snapshot-dividend__dividendGrid___EdfcT` | Main grid container | Hash suffix may change |
| `.koy-panel__stdDataCell___hb9cr` | Data cell in summary panels | Stable pattern |
| `.koy-panel__stdDataLabel___z8upW` | Label within data cell | Stable pattern |
| `.koy-panel__stdCellValueResult___Py9IQ` | Value within data cell | Stable pattern |
| `.koy-panel__stdSubHeaderCell___jMJ4O` | Sub-header cell (growth periods) | Stable pattern |
| `.koy-panel__labelBody___IApZT` | Panel title | Stable pattern |
| `.dividend-table__root___Wo5Ew` | Dividend payment table container | Hash suffix may change |
| `.base-table-row__root___VnXIn.dividend-table__row___Dr5oL` | Data rows in table | Reliable compound |
| `.table-styles__table__headerCell___gC361` | Header cells | Hash suffix may change |
| `.color-value__primary___BjrFP` | Colored value indicators | Stable pattern |

**Note:** Class names use CSS Modules with `[name]__[local]___[hash]` format. The `[local]` part (e.g. `dividendGrid`) is stable. The `[hash]` suffix may change across Koyfin builds. The extract.js uses `querySelectorAll` with full class paths; these should be verified if Koyfin updates their deployment.

---

## No-Dividend Handling

When a ticker has no dividend data:
- `hasDividendData` → `false`
- `totalDividendEntries` → `0`
- `dividends` → `[]` (empty array)
- Summary panels may show zero/`N/A` values
- The grid container still exists, so no `error` field is set

---

## API Endpoints (Network)

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/v3p/data/graph?schema=packed` | POST | Main data graph query (timeseries + metrics) |
| `/api/v3/data/keys` | GET | Available data key definitions |
| `/api/v3p/data/keys` | GET | Additional data key definitions |

The graph endpoint accepts a JSON body with `{id, key, dateFrom, dateTo}`. The `id` field takes the ticker ID (`eq-kuqeq3`), and `key` specifies which metric to fetch. This endpoint returns the structured data that populates both the summary panels and the chart.

## Network/API notes

# Network Analysis — Koyfin Dividend Tab

## Overview

The Koyfin Dividend page at `/snapshot/dvd/{tickerId}` is a React SPA. Data is fetched via XHR (XMLHttpRequest) once the page JS boots. The initial page load fetches CSS/JS bundles; the data layer fires afterward.

## Primary Data Endpoints

### 1. Data Graph API
```
POST /api/v3p/data/graph?schema=packed
```
- **Content-Type:** `application/json`
- **Credentials:** cookies (session auth)
- **Params:** `id` (ticker ID, e.g. `eq-kuqeq3`), `key` (metric key), `dateFrom`, `dateTo` (YYYY-MM-DD)
- **Purpose:** Returns structured timeseries and snapshot data for chart rendering and summary panels
- **Observed response sizes:** ~2KB (single metric) to ~22KB (multiple metrics)

### 2. Data Keys API
```
GET /api/v3/data/keys
GET /api/v3p/data/keys
```
- **Purpose:** Returns available metric key definitions (vocabulary)

### 3. Supporting APIs
| Endpoint | Method | Size | Purpose |
|---|---|---|---|
| `/api/v3/tickers/filters` | GET | ~2KB | Ticker metadata and filters |
| `/api/v3/users/settings` | GET | ~3KB | User preferences |
| `/api/v3/billing/subscriptions` | GET | ~0.5KB | Subscription status |
| `/api/v3/users/watchlists` | GET | ~1KB | Watchlist data |

## Request Flow (page load)

1. HTML shell loads → JS bundle executes
2. Auth check: `GET /auth.koyfin.com/users/profile`
3. Data keys fetched: `GET /api/v3/data/keys` (multiple calls, ~19KB total)
4. User settings/watchlists loaded
5. **Data graph calls:** `POST /api/v3p/data/graph?schema=packed` (2-3 calls, varying payloads)
6. Chart renders from graph response data
7. Dividend table renders from graph response data (same payload, different key)

## Key Observations

- All data APIs use the same base: `app.koyfin.com/api/v3/` or `api/v3p/`
- The `schema=packed` parameter suggests a compressed/protobuf-like response format (the 22KB response likely contains the full dividend payment schedule + yield timeseries)
- The actual dividend data is fetched as part of the graph query, not a separate endpoint
- Caching: Resources have content-hash filenames for long-lived cache; API responses may be cached by the browser for the session duration
- No WebSocket or Server-Sent Events for real-time updates on this page

## Network Timing (MSFT)

| Phase | Approx Duration |
|---|---|
| Initial HTML | ~200ms |
| JS bundle loading | ~800ms |
| Auth + config APIs | ~500ms |
| Data graph queries | ~500-600ms |
| **Total page load** | **~2-3 seconds** |

## Replaying the Data Graph Call

To reproduce the graph API call programmatically:

```javascript
const response = await fetch(
  'https://app.koyfin.com/api/v3p/data/graph?schema=packed',
  {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id: 'eq-kuqeq3',     // ticker ID
      key: 'dividend',     // metric key
      dateFrom: '2005-01-01',
      dateTo: '2026-12-31'
    })
  }
);
```

**Note:** The exact `key` parameter value and `schema` format are determined by the JS bundle. The above is approximate — the actual key names may differ.

## Script and examples

- Extractor: `@../scripts/dividend/extract.js`
- Script README: `@../scripts/dividend/README.md`
