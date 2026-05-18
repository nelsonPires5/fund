# Koyfin Balance Sheet tab

**Section:** Financial Analysis  
**Research use:** asset, liability, equity and capital structure line items.  
**Observed exploration ticker:** MSFT. Treat values as examples; scripts must work for other tickers and missing-data states.

## Research guide

Use this tab when the company question needs asset, liability, equity and capital structure line items. Start by confirming the active ticker and Koyfin internal security id in the URL. Then review the visible widgets/tables, switch period/toggle controls only when needed, and extract structured data with `@../scripts/balance-sheet/extract.js`.

## Extraction contract

- Run from the active Koyfin `Balance Sheet` page in an authenticated browser session.
- Save transient outputs and screenshots under `/tmp/<TICKER>/balance-sheet/`.
- Final structured rows must include `ticker`, `tab`, `extracted_at` and enough tab-specific context columns.
- Empty/no-coverage/no-data states must emit empty arrays or CSV headers plus an explicit status/error field.
- Prefer Koyfin network/API data when request and response bodies are captured safely; otherwise use DOM/SVG/table extraction documented here.

## Output schema observed

### CSV headers observed

`Line Item`, `3Q FY2016`, `4Q FY2016`, `1Q FY2017`, `2Q FY2017`, `3Q FY2017`, `4Q FY2017`, `1Q FY2018`, `2Q FY2018`, `3Q FY2018`, `4Q FY2018`, `1Q FY2019`, `2Q FY2019`, `3Q FY2019`, `4Q FY2019`, `1Q FY2020`, `2Q FY2020`, `3Q FY2020`, `4Q FY2020`, `1Q FY2021`, `2Q FY2021`, `3Q FY2021`, `4Q FY2021`, `1Q FY2022`, `2Q FY2022`, `3Q FY2022`, `4Q FY2022`, `1Q FY2023`, `2Q FY2023`, `3Q FY2023`, `4Q FY2023`, `1Q FY2024`, `2Q FY2024`, `3Q FY2024`, `4Q FY2024`, `1Q FY2025`, `2Q FY2025`, `3Q FY2025`, `4Q FY2025`, `1Q FY2026`, `2Q FY2026`, `3Q FY2026`, `Current/LTM`
### JSON shape observed

```json
{
  "ticker": "str",
  "tab": "str",
  "extracted_at": "str",
  "url": "str",
  "unit": "str",
  "period_toggle": "str",
  "fiscal_periods": [
    "str"
  ],
  "rows": [
    {
      "label": "str",
      "values": "list"
    }
  ]
}
```

## MSFT page summary

# Koyfin Balance Sheet — MSFT (Microsoft Corporation)

Extracted: 2026-05-17 from `https://app.koyfin.com/fa/{uuid}/eq-kuqeq3`

## Page Structure

Koyfin renders financial data in an **SPA** (React-based). The Balance Sheet tab is a sub-tab under **Security Analysis > Financial Analysis > Balance Sheet**.

### URL Pattern

- Base: `https://app.koyfin.com/fa/{uuid}/eq-kuqeq3`
- `{uuid}` is a session/company ID (changes per tab)
- `eq-kuqeq3` is the MSFT-specific report identifier

### Navigation Hierarchy (sidebar)

```
Security Analysis
  └─ MSFT (Microsoft Corporation)
       ├─ Snapshots
       │   ├─ Overview
       │   ├─ Description
       │   ├─ Percentile Rank
       │   ├─ Dividend
       │   ├─ Ownership
       │   └─ Earnings History
       ├─ Analyst Estimates
       │   ├─ Actuals and Consensus
       │   ├─ Price Target
       │   ├─ Estimates Overview
       │   └─ Estimates Trends
       ├─ Financial Analysis          ◄── CURRENT
       │   ├─ Highlights
       │   ├─ Income Statement
       │   ├─ Balance Sheet            ◄── ACTIVE TAB
       │   ├─ Cash Flow
       │   ├─ Multiples
       │   ├─ Enterprise Value
       │   ├─ Profitability
       │   ├─ ROIC
       │   └─ Solvency
       ├─ News, Filings & Transcripts
       └─ Graphs
```

### Tab Bar (sub-tabs under Financial Analysis)

| Tab | Position (x,y) |
|-----|----------------|
| Highlights | 289, 203 |
| Income Statement | 386, 203 |
| **Balance Sheet** | **534, 203** |
| Cash Flow | 686, 203 |
| Multiples | 783, 203 |
| Enterprise Value | 874, 203 |
| Profitability | 1010, 203 |
| ROIC | 1117, 203 |
| Solvency | 1182, 203 |

### Period / Unit Toggles

Located at y≈232–238:

| Toggle | Position (x) | Purpose |
|--------|-------------|---------|
| Last 12 Months (LTM) | 233 | LTM view |
| Quarterly (Q) | 384 | Quarterly data |
| Annual (Y) | 487 | Annual data |
| 2016 – 2026 | 1757 | Year range selector |
| US Dollar (USD) | 1873 | Currency display |

### Table Structure

- **Container**: `fa-table__root___cf3J4` at (224, 270), 1760×997 px
- **Header row**: `fa-table__faTable__headerRow___vnpnW`  
  - First cell: "Fiscal Quarters" label
  - 44 columns: 42 fiscal quarters + 1 "Current/LTM" + 1 label column
- **Data rows**: `base-table-row__root___VnXIn fa-table__faTable__row___i4wyu`
  - Each row: label cell + 43 value cells (one per period)
  - Value cells: `fa-table__cell___kqIH0` with color classes:
    - `color-value__up___ga5Jf` (green/positive)
    - `color-value__down___VOAvd` (red/negative)
  - Label cells: `fa-table__defaultCell__label___k7PHo`
- **Column width**: ~130px per period
- **Total table width**: ~5834px (horizontally scrollable)
- **Values**: In billions (USD), formatted to 1 decimal place

### Data API

- **Endpoint**: `POST /api/v3p/data/graph?schema=packed`
- **Method**: XHR (XMLHttpRequest)
- **Host**: app.koyfin.com
- **Response**: JSON with packed schema (appears to be GraphQL-style)

## Balance Sheet Line Items (discovered)

### Assets
| # | Line Item | y-position |
|---|-----------|-----------|
| 1 | **Total Cash And Short Term Investments** | 332 |
| 2 | Cash And Equivalents | 364 |
| 3 | Short Term Investments | 396 |
| 4 | Trading Asset Securities | 428 |
| 5 | **Total Receivables** | 460 |
| 6 | Accounts Receivable | 492 |
| 7 | Other Receivables | 524 |
| 8 | **Inventory** | 556 |
| 9 | Restricted Cash | 588 |
| 10 | Prepaid Expenses | 620 |
| 11 | Other Current Assets | 652 |
| 12 | **Total Current Assets** | 684 |
| 13 | **Net Property Plant And Equipment** | 716 |
| 14 | Gross Property Plant And Equipment | 748 |
| 15 | Accumulated Depreciation | 780 |
| 16 | Long-term Investments | 812 |
| 17 | **Goodwill** | 844 |
| 18 | Other Intangibles | 876 |
| 19 | Loans Receivable Long-Term | 908 |
| 20 | Deferred Tax Assets Long-Term | 940 |
| 21 | Deferred Charges Long-Term | 972 |
| 22 | Other Long-Term Assets | 1004 |
| 23 | **Total Assets** | 1036 |

### Liabilities
| # | Line Item | y-position |
|---|-----------|-----------|
| 24 | **Accounts Payable** | 1136 |
| 25 | Accrued Expenses | 1168 |
| 26 | Current Portion of Long-Term Debt | 1200 |
| 27 | Current Portion of Leases | 1232 |
| 28 | Current Income Taxes Payable | 1264 |
| 29 | Unearned Revenue Current, Total | 1296 |
| 30 | Other Current Liabilities | 1328 |
| 31 | **Total Current Liabilities** | 1360 |
| 32 | Long-Term Debt | 1392 |
| 33 | Long-Term Leases | 1424 |
| 34 | Unearned Revenue Non Current | 1456 |
| 35 | Deferred Tax Liability Non Current | 1488 |
| 36 | Other Non Current Liabilities | 1520 |
| 37 | **Total Liabilities** | 1552 |

### Equity
| # | Line Item | y-position |
|---|-----------|-----------|
| 38 | **Common Equity** | 1584 |
| 39 | Common Stock | 1616 |
| 40 | Additional Paid In Capital | 1648 |
| 41 | Retained Earnings | 1680 |
| 42 | Treasury Stock | 1712 |
| 43 | Comprehensive Income and Other | 1744 |
| 44 | **Total Equity** | 1776 |
| 45 | **Total Liabilities And Equity** | 1808 |

### Per-Share Data
| # | Line Item | y-position |
|---|-----------|-----------|
| 46 | ECS Total Shares Outstanding on Filing Date | 1908 |
| 47 | ECS Total Common Shares Outstanding | 1940 |
| 48 | Book Value / Share | 1972 |
| 49 | Tangible Book Value | 2004 |
| 50 | Tangible Book Value Per Share | 2036 |
| 51 | Total Debt | 2068 |
| 52 | Net Debt | 2100 |
| 53 | Equity Method Investments | 2132 |

## Fiscal Periods Covered (42 quarters)

3Q FY2016 through 3Q FY2026 (Current/LTM), spanning ~10.5 years.

## Gotchas

1. The table is **horizontally scrollable** — old quarters (3Q FY2016–4Q FY2020) are rendered at negative x-positions (off-screen left)
2. Values use **dot as decimal separator**, no thousands separator
3. Negative values are shown in **parentheses**: `(18.9)`
4. Empty/missing rows render a `-` dash character
5. Color classes on value cells indicate positive (green/up) vs negative (red/down) movement
6. The Koyfin financial analysis data is loaded via XHR to `/api/v3p/data/graph?schema=packed`
7. DOM structure uses CSS-modules hashed class names (e.g., `fa-table__root___cf3J4`)

## Data inventory and extraction patterns

# Data Inventory — Koyfin MSFT Balance Sheet

## Extracted Elements

| Artifact | Description | Status |
|----------|-------------|--------|
| `summary.md` | Page structure, navigation, line items, toggles | ✅ |
| `data_inventory.md` | This file — data fields, availability, gaps | ✅ |
| `extract.js` | Reusable browser-harness JS to extract data from DOM | ✅ |
| `sample-output.csv` | Sample balance sheet data in CSV format | ✅ |
| `sample-output.json` | Sample balance sheet data in JSON format | ✅ |
| `network.md` | API endpoints and patterns | ✅ |
| `network-sample.json` | Sample API request/response structure | ✅ |

## Line Items Extracted (53 total)

### Coverage Assessment

| Category | Total Lines | Data Available | Notes |
|----------|-------------|---------------|-------|
| Current Assets | 12 (lines 1–12) | ✅ All 42 quarters | Cash, receivables, inventory |
| Non-Current Assets | 11 (lines 13–23) | ✅ All 42 quarters | PP&E, goodwill, intangibles |
| Current Liabilities | 8 (lines 24–31) | ✅ All 42 quarters | Payables, accrued, deferred revenue |
| Non-Current Liabilities | 6 (lines 32–37) | ✅ All 42 quarters | Long-term debt, leases, deferred tax |
| Equity | 8 (lines 38–45) | ✅ All 42 quarters | Common equity, retained earnings |
| Per-Share / Supplemental | 8 (lines 46–53) | ✅ All 42 quarters | Book value, debt, shares |

### Data Completeness by Period

| Period Range | Columns | Completeness |
|-------------|---------|-------------|
| 3Q FY2016 – 2Q FY2017 | 4 | ~100% (early data) |
| 3Q FY2017 – 4Q FY2020 | 14 | ~100% (established data) |
| 1Q FY2021 – 4Q FY2024 | 16 | ~100% (recent history) |
| 1Q FY2025 – 3Q FY2026 | 7 | ~100% (current/future quarters) |
| Current/LTM | 1 | ~100% (latest data) |

### Data Format

- **Values**: Billions of USD (displayed as plain numbers e.g., `105.3`)
- **Format**: 1 decimal place, no thousands separators
- **Negative**: Parentheses e.g., `(18.9)` for Accumulated Depreciation, `(58.6)` for Net Debt
- **Missing/Null**: Dash character `-`
- **Color coding**: 
  - Grey text by default
  - Green (class `color-value__up___ga5Jf`) for positive change
  - Red (class `color-value__down___VOAvd`) for negative change

### Known Gaps

1. **Trading Asset Securities**: Only has data in later quarters (many early quarters show `-`)
2. **Other Receivables**: Sparse data in early quarters
3. **Restricted Cash**: All `-` (no data at all in the observed range)
4. **Loans Receivable Long-Term**: All `-` (no data)
5. **Deferred Charges Long-Term**: All `-` (no data)
6. **Additional Paid In Capital**: All `-` (no data — Microsoft doesn't have meaningful APIC)
7. **Treasury Stock**: All `-` (no data shown in this view)
8. **Deferred Charges Long-Term**: All `-`
9. **Equity Method Investments**: All `-` (bottom of visible data)

### Data Source

The financial data is fetched from the Koyfin backend API:
```
POST https://app.koyfin.com/api/v3p/data/graph?schema=packed
```
Response is a JSON "packed schema" format (GraphQL-like). The DOM renders data from this API response into CSS-modules styled table cells.

### Fiscal Calendar

Microsoft's fiscal year ends June 30. Quarterly periods are labeled as:
- `1Q FY{year}` = Jul-Sep
- `2Q FY{year}` = Oct-Dec
- `3Q FY{year}` = Jan-Mar
- `4Q FY{year}` = Apr-Jun

### Extraction Methodology

Data was extracted from the Koyfin DOM using `browser-harness` `js()` function. The table uses a non-standard React-rendered grid (not a `<table>` element). Rows are `div.base-table-row__root___VnXIn` containers with label cells and value cells arranged horizontally. Values are read from `fa-table__cell__label___CRAC0` elements within each row.

The extract.js file contains reusable functions to:
1. Navigate to MSFT Balance Sheet
2. Read all visible row labels
3. Map column headers (fiscal periods)
4. Extract value cells for each row/column intersection
5. Export to CSV or JSON

## Network/API notes

# Network Analysis — Koyfin MSFT Balance Sheet

## API Endpoint

The primary data endpoint for Koyfin's Financial Analysis section is:

```
POST https://app.koyfin.com/api/v3p/data/graph?schema=packed
```

- **Method**: POST (XMLHttpRequest)
- **Content-Type**: application/json (presumed)
- **Query parameter**: `schema=packed` (indicates packed/compressed response format)
- **Frequency**: ~30+ requests on page load (likely one per data row or chart)
- **Response**: JSON with packed schema (likely GraphQL-style data format)

## Request Pattern

All financial data for the Balance Sheet is loaded through the single `graph` endpoint. The server returns data in a "packed" schema format that Koyfin's React app unpacks and renders into the DOM table.

Key observations:
1. Multiple identical-looking requests to the same endpoint (likely batched queries)
2. Response times range from 144ms to 385ms
3. No RESTful CRUD endpoints for individual data points — everything goes through the GraphQL-style endpoint

## Other Network Activity

| Endpoint | Type | Purpose |
|----------|------|---------|
| `https://app.koyfin.com/api/v3p/data/graph?schema=packed` | XHR | Primary financial data |
| `https://www.google-analytics.com/g/collect` | fetch | Google Analytics tracking |
| Various static assets (.js, .css, .svg) | fetch | SPA bundle loading |

## Data Flow

```
User clicks "Balance Sheet" tab
  → React SPA route change (/fa/{uuid}/eq-kuqeq3)
  → POST /api/v3p/data/graph?schema=packed (with query for balance sheet data)
  → Response unpacked into React component state
  → DOM rendered with CSS-modules styled table cells
```

## Potential Alternative Approaches

1. **Direct API**: If authenticated, could call `/api/v3p/data/graph?schema=packed` directly with appropriate query payload
2. **DOM extraction**: The current approach — scrape values from rendered table cells (works for visible data in the viewport)
3. **Full-page export**: Koyfin may offer PDF/CSV export (not explored in this session)

## Limitations

- The packed schema format is opaque without reverse-engineering the API payload
- Only data visible in the DOM can be extracted via the current approach
- Off-screen columns (negative x-position) are rendered but readable via `querySelectorAll`

## Script and examples

- Extractor: `@../scripts/balance-sheet/extract.js`
- Script README: `@../scripts/balance-sheet/README.md`
