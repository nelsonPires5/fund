# Koyfin Enterprise Value tab

**Section:** Financial Analysis  
**Research use:** market cap, debt, cash, EV and capital ratio bridge.  
**Observed exploration ticker:** MSFT. Treat values as examples; scripts must work for other tickers and missing-data states.

## Research guide

Use this tab when the company question needs market cap, debt, cash, EV and capital ratio bridge. Start by confirming the active ticker and Koyfin internal security id in the URL. Then review the visible widgets/tables, switch period/toggle controls only when needed, and extract structured data with `@../scripts/enterprise-value/extract.js`.

## Extraction contract

- Run from the active Koyfin `Enterprise Value` page in an authenticated browser session.
- Save transient outputs and screenshots under `/tmp/<TICKER>/enterprise-value/`.
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
  "period_info": {
    "column_headers": [
      "str"
    ]
  },
  "rows": [
    {
      "label": "str",
      "values": "list"
    }
  ],
  "_metadata": {
    "ticker": "str",
    "company": "str",
    "tab": "str",
    "url": "str",
    "extracted_at": "str",
    "period": "str",
    "currency": "str",
    "note": "str"
  }
}
```

## MSFT page summary

# Koyfin Enterprise Value Extraction Summary — MSFT

## Extraction Metadata

| Field | Value |
|---|---|
| **Ticker** | MSFT (Microsoft Corporation) |
| **Tab** | Security Analysis > Financial Analysis > Enterprise Value (FA.EV) |
| **URL** | `https://app.koyfin.com/fa/00000000-411f-4b3c-bca7-34398498da18/eq-kuqeq3` |
| **KID** | `eq-kuqeq3` |
| **Extracted At** | 2026-05-17 |
| **Period (default view)** | Annual (Y), FY 2016 – FY 2025 + Current/LTM |
| **Currency** | USD |
| **Data Source** | Koyfin API v3 (`api/v3p/data/graph?schema=packed`) |

## Page Structure

The Enterprise Value tab is organized into three template groups:

### 1. Capital Structure (Enterprise Value Components)
| Row Label | Data Key | Format |
|---|---|---|
| Market Capitalization | `f_mkt` | Dollars (B) |
| Cash & Short Term Investments | `f_cashst` | Dollars (B) |
| Total Debt | `f_debt` | Dollars (B) |
| Preferred Equity | `f_pref` | Dollars (B) — no data for MSFT |
| Minority Interest | `f_minorbs` | Dollars (B) — no data for MSFT |
| **Enterprise Value** | **`f_ev`** | **Dollars (B) — derived: mkt - cash + debt** |

### 2. Enterprise Value Multiples
| Row Label | Data Key | Format |
|---|---|---|
| EV / Sales | `f_evsltm` | Multiple (x) |
| EV / EBITDA | `f_evebitdaltm` | Multiple (x) |
| EV / EBIT | `f_evebit` | Multiple (x) |

### 3. Capitalization (Capital Structure Ratios)
| Row Label | Data Key | Format |
|---|---|---|
| Total Capital | `f_tcap` | Dollars (B) |
| Total Common Equity | `f_totceq` | Dollars (B) |
| Total Preferred Equity | `f_pref` | Dollars (B) — no data for MSFT |
| Total Debt | `f_debt` | Dollars (B) |
| Minority Interest | `f_minorbs` | Dollars (B) — no data for MSFT |
| Return on Total Capital | `f_roc` | Percentage (%) |
| Total Debt / Total Capital | `f_dc` | Percentage (%) |
| Total Debt / Equity | `f_de` | Percentage (%) |
| Total Debt / EBITDA | `f_debtebitda` | Multiple (x) |
| Long-Term Debt / Total Capital | `f_ltdc` | Percentage (%) |

## Artifacts

| File | Description |
|---|---|
| `summary.md` | This file — extraction summary |
| `data_inventory.md` | Detailed data inventory and structure |
| `extract.js` | Reusable JS extraction code for browser-harness |
| `sample-output.json` | Extracted data in structured JSON |
| `fa-template.json` | Koyfin FA template configuration for Enterprise Value |
| `fiscal-periods.json` | Fiscal period definitions |
| `network.md` | Network API patterns documentation |
| `network-sample.json` | Sample network API responses |
| `04-enterprise-value-annual.png` | Screenshot of the Enterprise Value tab |

## Key Findings

1. **Data Source**: All data fetched via `POST /api/v3p/data/graph?schema=packed` with key-based metric identification
2. **Period Toggle**: `financialPeriodType` parameter — `"annual"` for yearly, `"quarterly"` for quarterly
3. **Missing Data**: MSFT has no Preferred Equity (`f_pref`) or Minority Interest (`f_minorbs`) — returns `KOY_003` error
4. **Formatting**: Browser renders values with suffixes (B for billions, x for multiples, % for percentages); API returns raw numbers
5. **Enterprise Value**: Calculated internally by Koyfin as Market Cap - Cash + Total Debt (f_mkt - f_cashst + f_debt)
6. **No recalculation needed**: f_ev returned as its own metric from the API; no client-side formula

## Confidence: HIGH
All API endpoints captured and verified against visible page data. The template configuration exactly matches the rendered rows.

## Data inventory and extraction patterns

# Data Inventory — MSFT Enterprise Value (Koyfin FA.EV)

## API Endpoint

```
POST https://app.koyfin.com/api/v3p/data/graph?schema=packed
```

## Request Format

```json
{
  "id": "MSFT:US",
  "key": "f_mkt",
  "currency": "USD",
  "financialPeriodType": "annual",
  "priceFormat": "adj"
}
```

**Parameters:**
- `id`: Ticker identifier (`MSFT:US`)
- `key`: Metric data key (see table below)
- `currency`: Display currency (`USD`)
- `financialPeriodType`: `"annual"` or `"quarterly"`
- `priceFormat`: `"adj"` for adjusted prices

## Response Format

### Success (with data)
```json
{
  "id": "MSFT:US",
  "KID": "eq-kuqeq3",
  "category": "eq",
  "graph": {
    "date": ["2016-06-30", "2017-06-30", ...],
    "value": [414.5, 572.1, ...],
    "_meta": [{"period": "FY 2016"}, {"period": "FY 2017"}, ...]
  },
  "startDate": "1991-06-30",
  "endDate": "2025-06-30",
  "error": null
}
```

### No Data
```json
{
  "id": "MSFT:US",
  "KID": "eq-kuqeq3",
  "category": "eq",
  "graph": {},
  "startDate": null,
  "endDate": null,
  "error": {
    "code": "KOY_003",
    "message": "No data in selected time range"
  }
}
```

## Metric Keys Inventory

### Capital Structure (Enterprise Value Components)
| Key | Label | Unit | Annual Values (FY16→FY25)* | Quarterly Values |
|---|---|---|---|---|
| `f_mkt` | Market Capitalization | USD (raw) | 10 values | 523 values (daily) |
| `f_cashst` | Cash & Short Term Investments | USD (raw) | 10 values | 8 values |
| `f_debt` | Total Debt | USD (raw) | 10 values | 8 values |
| `f_pref` | Preferred Equity | USD (raw) | No data for MSFT | No data for MSFT |
| `f_minorbs` | Minority Interest | USD (raw) | No data for MSFT | No data for MSFT |
| `f_ev` | Enterprise Value | USD (raw) | 10 values | 523 values (daily) |

*Annual values: FY 2016 through FY 2025 (10 fiscal years)*

### Enterprise Value Multiples
| Key | Label | Unit | Annual Values | Quarterly Values |
|---|---|---|---|---|
| `f_evsltm` | EV / Sales | Ratio (x) | 2607 values (daily) | 523 values (daily) |
| `f_evebitdaltm` | EV / EBITDA | Ratio (x) | 2607 values (daily) | 523 values (daily) |
| `f_evebit` | EV / EBIT | Ratio (x) | 2607 values (daily) | 523 values (daily) |

### Capitalization (Capital Structure Ratios)
| Key | Label | Unit | Annual Values | Quarterly Values |
|---|---|---|---|---|
| `f_tcap` | Total Capital | USD (raw) | 10 values | 8 values |
| `f_totceq` | Total Common Equity | USD (raw) | 10 values | 8 values |
| `f_roc` | Return on Total Capital | % | 10 values | 8 values |
| `f_dc` | Total Debt / Total Capital | % | 10 values | 8 values |
| `f_de` | Total Debt / Equity | % | 10 values | 8 values |
| `f_debtebitda` | Total Debt / EBITDA | Ratio (x) | 10 values | 8 values |
| `f_ltdc` | Long-Term Debt / Total Capital | % | 10 values | 8 values |

## Value Notes

- **f_ev (Enterprise Value)**: Returns a daily time series with many values. For annual view, filter by fiscal year-end dates.
- **f_mkt (Market Capitalization)**: Also returns daily values. In the table view, shows fiscal year-end values.
- **Multiples (f_evsltm, f_evebitdaltm, f_evebit)**: These use LTM (Last Twelve Months) data, hence the "ltm" suffix. They return daily time series.
- **Preferred Equity & Minority Interest**: MSFT has zero/none for both, API returns KOY_003 error.
- **Sorting**: Annual values from the API may be in reverse chronological order (newest first) or chronological depending on the metric. The browser renders them consistently left-to-right oldest-to-newest.
- **EV Calculation**: Enterprise Value = Market Capitalization - Cash & Short Term Investments + Total Debt + Preferred Equity + Minority Interest

## Fiscal Periods Endpoint

```
GET /api/v3p/data/fiscal-periods?financialPeriodType=annual&fromYear=2016&kid=eq-kuqeq3&toYear=2026
```

Returns period metadata including `fy`, `fq`, `date`, `reportdate`, `latestperiodflag`.

## Data Keys Endpoint

```
POST /api/v3/data/keys
POST /api/v3p/data/keys
```

Returns ticker metadata including name, sector, currency, exchange, current price, market state, etc.

## Network/API notes

# Network API Patterns — Koyfin Enterprise Value

## Overview

Koyfin's Financial Analysis pages use a REST API under `app.koyfin.com/api/v3p/`. 
Data is fetched row-by-row — each metric key generates one HTTP request.

## Endpoints

### 1. Data Graph (Primary Data Source)

```
POST /api/v3p/data/graph?schema=packed
```

**Request Body:**
```json
{
  "id": "MSFT:US",
  "key": "f_mkt",
  "currency": "USD",
  "financialPeriodType": "annual",
  "priceFormat": "adj"
}
```

**Parameters:**
| Field | Values | Description |
|---|---|---|
| `id` | `"{TICKER}:{COUNTRY}"` e.g. `MSFT:US` | Ticker identifier |
| `key` | `f_mkt`, `f_ev`, `f_debt`, etc. | Metric data key |
| `currency` | `USD` | Reporting currency |
| `financialPeriodType` | `annual`, `quarterly`, `ltm` | Period toggle |
| `priceFormat` | `adj` | Price adjustment type |

**Response Body (success):**
```json
{
  "id": "MSFT:US",
  "KID": "eq-kuqeq3",
  "category": "eq",
  "graph": {
    "date": ["2016-06-30", "2017-06-30", ...],
    "value": [414.5, 572.1, ...],
    "_meta": [{"period": "FY 2016"}, {"period": "FY 2017"}, ...]
  },
  "startDate": "1991-06-30",
  "endDate": "2025-06-30",
  "error": null
}
```

**Response Body (no data — MSFT has no preferred equity):**
```json
{
  "id": "MSFT:US",
  "KID": "eq-kuqeq3",
  "category": "eq",
  "graph": {},
  "startDate": null,
  "endDate": null,
  "error": {"code": "KOY_003", "message": "No data in selected time range"}
}
```

### 2. Fiscal Periods

```
GET /api/v3p/data/fiscal-periods?financialPeriodType=annual&fromYear=2016&kid=eq-kuqeq3&toYear=2026
```

Returns period metadata: `fy` (fiscal year), `fq` (fiscal quarter), `date`, `reportdate`, `currencyid`, `latestperiodflag`.

### 3. Data Keys

```
POST /api/v3/data/keys
```

Returns ticker metadata (name, sector, exchange, currency, current price, volume, etc.)

### 4. FA Templates

```
GET /api/v3/users/fa/templates/{template-uuid}
```

Returns the Financial Analysis template configuration including groups, rows, labels, and data key mappings.

## Metric Key Catalog (Enterprise Value Tab)

| Data Key | Label | Section | Format |
|---|---|---|---|
| `f_mkt` | Market Capitalization | Capital Structure | Raw USD |
| `f_cashst` | Cash & Short Term Investments | Capital Structure | Raw USD |
| `f_debt` | Total Debt | Capital Structure | Raw USD |
| `f_pref` | Preferred Equity | Capital Structure | Raw USD (empty for MSFT) |
| `f_minorbs` | Minority Interest | Capital Structure | Raw USD (empty for MSFT) |
| `f_ev` | Enterprise Value | Capital Structure | Raw USD |
| `f_evsltm` | EV / Sales | Enterprise Value Multiples | Ratio (x) |
| `f_evebitdaltm` | EV / EBITDA | Enterprise Value Multiples | Ratio (x) |
| `f_evebit` | EV / EBIT | Enterprise Value Multiples | Ratio (x) |
| `f_tcap` | Total Capital | Capitalization | Raw USD |
| `f_totceq` | Total Common Equity | Capitalization | Raw USD |
| `f_roc` | Return on Total Capital | Capitalization | % |
| `f_dc` | Total Debt / Total Capital | Capitalization | % |
| `f_de` | Total Debt / Equity | Capitalization | % |
| `f_debtebitda` | Total Debt / EBITDA | Capitalization | Ratio (x) |
| `f_ltdc` | Long-Term Debt / Total Capital | Capitalization | % |

## Period Toggle Behavior

When switching between Annual, Quarterly, and LTM views, the same metric keys are re-requested 
with a different `financialPeriodType` parameter. The browser does NOT cache results — each 
toggle triggers fresh requests for all visible rows.

The year range selector (`2016 - 2026`) modifies the `fromYear` and `toYear` query parameters 
on the fiscal-periods endpoint and may also affect `financialPeriodType` behavior.

## Rate Limiting & Caching

- Responses include standard HTTP caching headers
- Multiple requests for the same metric in rapid succession still hit the server
- No client-side caching was observed between period toggles

## Trailing Data

Some metrics that return daily data (f_ev, f_mkt, f_evsltm, f_evebitdaltm, f_evebit) return 
hundreds to thousands of daily values. The browser table only shows fiscal period-end values 
but the API returns the full time series.

## Script and examples

- Extractor: `@../scripts/enterprise-value/extract.js`
- Script README: `@../scripts/enterprise-value/README.md`
