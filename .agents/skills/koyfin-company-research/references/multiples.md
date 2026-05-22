# Koyfin Multiples tab

**Section:** Financial Analysis  
**Research use:** historical valuation multiples across sales, earnings and book-value families.  
**Observed exploration ticker:** MSFT. Treat values as examples; scripts must work for other tickers and missing-data states.

## Research guide

Use this tab when the company question needs historical valuation multiples across sales, earnings and book-value families. Start by confirming the active ticker and Koyfin internal security id in the URL. Then review the visible widgets/tables, switch period/toggle controls only when needed, and extract structured data with `@../scripts/multiples/extract.js`.

## Extraction contract

- Run from the active Koyfin `Multiples` page in an authenticated browser session.
- Save transient outputs and screenshots under `/tmp/<TICKER>/multiples/`.
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
  "fiscal_period_type": "str",
  "columns": [
    "str"
  ],
  "sections": [
    {
      "name": "str",
      "metrics": "list"
    }
  ],
  "metrics": [
    {
      "metric": "str",
      "unit": "str",
      "values": "list"
    }
  ],
  "_metadata": {
    "fiscal_periods_annual": [
      "str"
    ],
    "fiscal_periods_quarterly": [
      "str"
    ],
    "extraction_method": "str",
    "notes": [
      "str"
    ]
  }
}
```

## MSFT page summary

# Koyfin MSFT Multiples - Exploration Summary

**Date:** 2026-05-17  
**Ticker:** MSFT (Microsoft Corporation)  
**Tab:** Security Analysis > Financial Analysis > Multiples  
**URL:** https://app.koyfin.com/fa/00000000-2cfe-4f65-a319-b024e5955d01/eq-kuqeq3  

## Navigation

1. Started on MSFT Cash Flow Statement tab
2. Clicked "Multiples" in the left sidebar at position (28, 1097)
3. Page URL changed to the Multiples view (new UUID in path)
4. Verified: title = "MSFT - Multiples"
5. Toggled between Quarterly (Q), Annual (Y), and Last 12 Months (LTM) views

## Page Layout

The Multiples page has a consistent Koyfin FA (Financial Analysis) layout:

- **Header bar**: Ticker info (MSFT, $421.92, +12.49), market data (Sector: Information Technology, Industry: Software, Market Cap: $3T+, Forward P/E: 22.8x)
- **Sub-tab bar**: Financial Analysis > [Highlights | Income Statement | Balance Sheet | Cash Flow | **Multiples** | Enterprise Value | Profitability | ROIC | Solvency]
- **Fiscal period selector**: Last 12 Months (LTM) | Quarterly (Q) | Annual (Y)
- **Controls**: Date range button (2016-2026), Currency selector (US Dollar USD)
- **Table**: Scrollable table with section groupings

## Multiples Table Structure

The multiples table is organized into 3 collapsible sections:

### 1. Sales | Revenues (4 metrics)
| Metric | Quarterly Columns | Annual Columns |
|--------|------------------|----------------|
| EV / Sales (LTM) | 14 columns (3Q FY2023 - Current/LTM) | 11 columns (FY 2016 - Current/LTM) |
| EV / Sales (NTM) | 13 columns (4Q FY2023 - Current/LTM) | 11 columns (FY 2016 - Current/LTM) |
| Price / Sales (LTM) | 14 columns | 11 columns |
| Price / Sales (NTM) | 13 columns | 11 columns |

### 2. Earnings (6 metrics)
| Metric | Quarterly | Annual |
|--------|-----------|--------|
| EV / EBITDA (LTM) | 14 cols | 11 cols |
| EV / EBITDA (NTM) | 13 cols | 11 cols |
| EV / EBIT (LTM) | 14 cols | 11 cols |
| EV / EBIT (NTM) | 13 cols | 11 cols |
| Price / Earnings (LTM) | 14 cols | 11 cols |
| Price / Earnings (NTM) | 13 cols | 11 cols |

### 3. Book Value (2 metrics)
| Metric | Quarterly | Annual |
|--------|-----------|--------|
| Price / Book (LTM) | 14 cols | 11 cols |
| Price / Tangible Book Value (LTM) | 14 cols | 11 cols |

**Total: 12 metrics visible in Quarterly view, 12 in Annual view**

## API Architecture

All data is fetched via:
- `POST /api/v3p/data/graph?schema=packed` — individual requests per metric
- `GET /api/v3p/data/fiscal-periods?financialPeriodType=<type>&fromYear=2016&kid=<kid>&toYear=2026` — fiscal period headers

Each metric uses a unique key like `f_evsltm`, `f_pe`, `f_pb`, etc.

## Key Observations

- NTM (Next Twelve Months) rows have one fewer column (no trailing projection column)
- Units displayed as "x" (multiplier) for all multiples
- Data available from FY 2016 through current (2026)
- The `/api/v3p/data/graph` responses contain both daily time series (`graph.date` / `graph.value`) and periodic fiscal data (`periodic_fiscal_data[]`)
- Toggling fiscal period type re-fetches all metric data
- Table sections (Sales|Revenues, Earnings, Book Value) appear to be collapsible but are expanded by default

## Data inventory and extraction patterns

# Data Inventory — Koyfin MSFT Multiples

## 1. Table Data (DOM, rendered)

### Quarterly View (Q)
- **Columns:** 3Q FY2023, 4Q FY2023, 1Q FY2024, 2Q FY2024, 3Q FY2024, 4Q FY2024, 1Q FY2025, 2Q FY2025, 3Q FY2025, 4Q FY2025, 1Q FY2026, 2Q FY2026, 3Q FY2026, Current/LTM
- **NTM columns:** same but ends at 3Q FY2026 (no Current/LTM for NTM forward estimate)
- **Rows (12 metrics):** EV/Sales LTM, EV/Sales NTM, Price/Sales LTM, Price/Sales NTM, EV/EBITDA LTM, EV/EBITDA NTM, EV/EBIT LTM, EV/EBIT NTM, P/E LTM, P/E NTM, P/B LTM, P/TBV LTM
- **Source file:** `quarterly_data.json` (raw DOM extraction)
- **Rendered via:** React components in root div, no iframes/shadow DOM

### Annual View (Y)
- **Columns:** Fiscal Years, FY 2016, FY 2017, FY 2018, FY 2019, FY 2020, FY 2021, FY 2022, FY 2023, FY 2024, FY 2025, Current/LTM
- **Same 12 metrics** as quarterly
- **Source file:** `05_quarterly_final.png` (screenshot of quarterly; annual extracted via text dump)

## 2. Network API Data

### Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/v3p/data/graph?schema=packed` | POST | Fetch individual metric time series & periodic values |
| `/api/v3p/data/fiscal-periods` | GET | Fetch column header labels for the selected fiscal period type |

### Graph API POST Body
```json
{
  "id": "eq-kuqeq3",
  "key": "f_evsltm",
  "currency": "USD",
  "financialPeriodType": "annual",
  "priceFormat": "standard",
  "dateFrom": "2016-01-01",
  "dateTo": "2026-12-31"
}
```

### Metric Key Mappings (durable)

| Key | Display Label | Section |
|-----|---------------|---------|
| `f_evsltm` | EV / Sales (LTM) | Sales \| Revenues |
| `f_evs` | EV / Sales (NTM) | Sales \| Revenues |
| `f_psltm` | Price / Sales (LTM) | Sales \| Revenues |
| `f_ps` | Price / Sales (NTM) | Sales \| Revenues |
| `f_evebitdaltm` | EV / EBITDA (LTM) | Earnings |
| `f_evebitda` | EV / EBITDA (NTM) | Earnings |
| `f_evebit` | EV / EBIT (LTM) | Earnings |
| `f_evebitfwd` | EV / EBIT (NTM) | Earnings |
| `f_peltm` | Price / Earnings (LTM) | Earnings |
| `f_pe` | Price / Earnings (NTM) | Earnings |
| `f_pb` | Price / Book (LTM) | Book Value |
| `f_ptb` | Price / Tangible Book Value (LTM) | Book Value |

### Response Structure
```json
{
  "id": "MSFT:US",
  "KID": "eq-kuqeq3",
  "category": "eq",
  "graph": {
    "date": ["2016-01-04", ...daily dates...],
    "value": [10.5, ...daily multiples...],
    "series_type": "multiplier"
  },
  "periodic_fiscal_data": [
    {"label": "FY 2016", "value": 3.9, "date": "2016-06-30"},
    {"label": "FY 2017", "value": 5.5, "date": "2017-06-30"},
    ...
  ],
  "_meta": {
    "metric_name": "EV / Sales (LTM)",
    "unit": "x",
    "frequency": "annual"
  }
}
```

### Column Header API
- `GET /api/v3p/data/fiscal-periods?financialPeriodType=annual&fromYear=2016&kid=eq-kuqeq3&toYear=2026`
- `GET /api/v3p/data/fiscal-periods?financialPeriodType=quarterly&fromYear=2016&kid=eq-kuqeq3&toYear=2026`

## 3. UI Controls

| Control | Position (x,y) | Action |
|---------|---------------|--------|
| Last 12 Months (LTM) | (245, 246) | Toggle LTM view |
| Quarterly (Q) | (396, 246) | Toggle quarterly periods |
| Annual (Y) | (499, 246) | Toggle annual periods |
| Date Range | (1725, 233) | Configure date range |
| Currency | (1839, 233) | Change display currency |

## 4. Screenshots

| File | Description |
|------|-------------|
| `01_initial_state.png` | Initial page (Cash Flow Statement) |
| `02_multiples_page.png` | First view of Multiples tab |
| `03_multiples_full.png` | Multiples - full viewport (Annual) |
| `04_quarterly_view.png` | Multiples - quarterly view |
| `05_quarterly_final.png` | Clean quarterly view screenshot |

## 5. Artifact Files

| File | Content |
|------|---------|
| `summary.md` | This summary |
| `data_inventory.md` | This data inventory |
| `extract.js` | Reusable DOM/data extraction script |
| `sample-output.json` | All extracted data in JSON format |
| `network-sample.json` | API request/response samples |
| `network-response-sample.json` | Response structure documentation |
| `quarterly_data.json` | Raw DOM extraction of quarterly view |
| `table_html_snippet.txt` | Raw HTML snippet of table container |
| `all_text_raw.txt` | Raw text dump of all visible elements |

## 6. Missing Data / Caveats

- NTM rows have 1 fewer column than LTM rows (no Current/LTM estimate for NTM)
- The "Last 12 Months (LTM)" view shows only the Current/LTM column
- Data beyond what's visible (below Book Value section) was not found — only 12 metrics appear
- No raw API JSON responses saved (80K+ per response); response structure documented in `network-response-sample.json`

## Network/API notes

# Koyfin Multiples — Network API Patterns

## Base URL

```
https://app.koyfin.com/api/v3p/data/
```

## Authentication

Cookie-based (confirmed via browser session). Fetch calls from `js()` context fail with 401 unless `credentials: 'include'` is set. All cookies are set by the main Koyfin app authentication flow.

## Core API Endpoints

### 1. Graph Data (per metric)

**`POST /api/v3p/data/graph?schema=packed`**

Fetches daily time series AND periodic fiscal data for a single valuation multiple metric.

**Request Body:**
```json
{
  "id": "eq-kuqeq3",         // Koyfin ID for the security
  "key": "f_evsltm",         // Metric key (see mapping below)
  "currency": "USD",
  "financialPeriodType": "annual",  // "annual" | "quarterly" | "ltm" for Last 12 Months
  "priceFormat": "standard",
  "dateFrom": "2016-01-01",
  "dateTo": "2026-12-31"
}
```

**Response:**
```json
{
  "id": "MSFT:US",
  "KID": "eq-kuqeq3",
  "category": "eq",
  "graph": {
    "date": ["2016-01-04", "2016-01-05", ...],  // daily trading dates
    "value": [10.5, 10.3, ...],                   // daily multiple values
    "series_type": "multiplier"
  },
  "periodic_fiscal_data": [
    {"label": "FY 2016", "value": 3.9, "date": "2016-06-30"},
    {"label": "FY 2017", "value": 5.5, "date": "2017-06-30"},
    ...
  ],
  "_meta": {
    "metric_name": "EV / Sales (LTM)",
    "unit": "x",
    "frequency": "annual"
  }
}
```

**Response fields:**
- `graph.date[]`: Daily date strings (YYYY-MM-DD) from `dateFrom` to `dateTo`
- `graph.value[]`: Daily multiple values (can include nulls for non-trading days)
- `periodic_fiscal_data[]`: Array of `{label, value, date}` for each fiscal period
- `_meta.metric_name`: Human-readable label (may differ slightly from display label)
- `_meta.unit`: Always `"x"` for multiples

> **Note:** Response bodies are ~80KB+ each because they contain ~2600 daily data points spanning 2016–2026.

### 2. Fiscal Period Headers

**`GET /api/v3p/data/fiscal-periods`**

**Parameters:**
| Param | Example |
|-------|---------|
| `financialPeriodType` | `annual`, `quarterly`, `ltm` |
| `fromYear` | `2016` |
| `kid` | `eq-kuqeq3` |
| `toYear` | `2026` |

Returns the column header labels used to render the table.

### 3. User Settings

**`GET /api/v3/users/fa/user-settings`**

Returns the user's Financial Analysis settings (fiscal period preference, currency, etc.).

## Metric Key → Display Label Mapping

| Key | Display Label | Tab Section |
|-----|--------------|-------------|
| `f_evsltm` | EV / Sales (LTM) | Sales \| Revenues |
| `f_evs` | EV / Sales (NTM) | Sales \| Revenues |
| `f_psltm` | Price / Sales (LTM) | Sales \| Revenues |
| `f_ps` | Price / Sales (NTM) | Sales \| Revenues |
| `f_evebitdaltm` | EV / EBITDA (LTM) | Earnings |
| `f_evebitda` | EV / EBITDA (NTM) | Earnings |
| `f_evebit` | EV / EBIT (LTM) | Earnings |
| `f_evebitfwd` | EV / EBIT (NTM) | Earnings |
| `f_peltm` | Price / Earnings (LTM) | Earnings |
| `f_pe` | Price / Earnings (NTM) | Earnings |
| `f_pb` | Price / Book (LTM) | Book Value |
| `f_ptb` | Price / Tangible Book Value (LTM) | Book Value |

**Naming convention:**
- `f_` prefix = financial metric
- Base key without suffix = LTM (e.g., `f_pb` = Price/Book LTM)
- `_ltm` suffix = LTM variant (mainly on Sales/EV metrics: `f_evsltm`, `f_psltm`)
- `_fwd` suffix = NTM variant (only on `f_evebitfwd`)
- Base key = NTM for some metrics (e.g., `f_evs`, `f_ps`, `f_evebitda`, `f_pe`)

## Data Flow

```
User clicks tab/toggles period
  ↓
GET /api/v3p/data/fiscal-periods (fetch column headers)
  ↓  (parallel)
POST /api/v3p/data/graph?schema=packed (× N metrics, all parallel)
  ↓
React renders table from response data
```

Each metric is fetched independently. All 12 metric requests fire in parallel when the tab loads or period changes.

## Key IDs

- `kid = eq-kuqeq3` — Koyfin Identifier for MSFT (stable per ticker)
- The Security Analysis UUID in the URL (`/fa/<uuid>/eq-kuqeq3`) may change between tabs but the KID remains constant

## Important Notes for Scripting

1. **Rate limiting:** Not observed during testing (12 parallel requests completed fine)
2. **CORS:** Not an issue when running in-browser
3. **Response size:** ~80KB each × 12 = ~1MB total for full multi-year daily data
4. **Frequency:** `financialPeriodType` controls what `periodic_fiscal_data` returns
5. **LTM view:** When `financialPeriodType=ltm`, only a single column ("Current/LTM") is returned
6. **NTM rows:** The graph API returns the NTM forward estimate; the UI shows one fewer column for NTM (no separate Current/LTM value)

## Script and examples

- Extractor: `@../scripts/multiples/extract.js`
- Script README: `@../scripts/multiples/README.md`
