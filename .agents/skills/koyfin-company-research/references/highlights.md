# Koyfin Highlights tab

**Section:** Financial Analysis  
**Research use:** high-level financial, capital structure and cash-flow metrics across periods.  
**Observed exploration ticker:** MSFT. Treat values as examples; scripts must work for other tickers and missing-data states.

## Research guide

Use this tab when the company question needs high-level financial, capital structure and cash-flow metrics across periods. Start by confirming the active ticker and Koyfin internal security id in the URL. Then review the visible widgets/tables, switch period/toggle controls only when needed, and extract structured data with `@../scripts/highlights/extract.js`.

## Extraction contract

- Run from the active Koyfin `Highlights` page in an authenticated browser session.
- Save transient outputs and screenshots under `/tmp/<TICKER>/highlights/`.
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
  "title": "str",
  "controls": {
    "active_period": "str",
    "date_range": "str",
    "currency": "str",
    "active_sub_tab": "str"
  },
  "fiscal_periods": [
    "str"
  ],
  "rows": [
    {
      "label": "str",
      "section": "str",
      "unit": "str",
      "values": "list"
    }
  ],
  "row_count": "int",
  "period_count": "int"
}
```

## MSFT page summary

# Koyfin MSFT Highlights Page — Extraction Summary

**Extracted at**: 2026-05-17  
**Ticker**: MSFT  
**Page**: Security Analysis → Financial Analysis → Highlights  
**URL**: `https://app.koyfin.com/fa/00000000-bc2f-4395-abce-161f8023d0c9/eq-kuqeq3`  
**Title**: MSFT - Highlights  
**Resolution**: 2044×1289  

---

## Page Structure

The Highlights page consists of:

1. **Left navigation sidebar** — hierarchical nav tree with SECURITY ANALYSIS section for MSFT, including sub-sections: Snapshots, Overview, Description, Percentile Rank, Dividend, Ownership, Earnings History, Analyst Estimates, Financial Analysis (Highlights, Income Statement, Balance Sheet, Cash Flow, Multiples, Enterprise Value, Profitability, ROIC, Solvency), News/Filings/Transcripts, Graphs.

2. **Top header bar** — Search box, ticker info bar with price data, company name, sector/industry, market cap, etc.

3. **Tab bar** — Financial Analysis sub-tabs: Highlights (active), Income Statement, Balance Sheet, Cash Flow, Multiples, Enterprise Value, Profitability, ROIC, Solvency.

4. **Time/period controls** — `Last 12 Months (LTM)`, `Quarterly (Q)` (active), `Annual (Y)`. Range: `2016 - 2026`. Currency: `US Dollar (USD)`.

5. **Fiscal period column headers** — 42 periods from `3Q FY2016` through `Current/LTM`.

6. **Data rows** organized in three sections:
   - **Key Financials** (11 metrics)
   - **Capital Structure** (6 metrics)
   - **Cash Flow Analysis** (3 metrics)

---

## Data Overview

| Section | Metrics | Periods | Values |
|---------|---------|---------|--------|
| Key Financials | 11 | 42 | 462 |
| Capital Structure | 6 | 42 | 252 |
| Cash Flow Analysis | 3 | 42 | 126 |
| **Total** | **20** | **42** | **840** |

### Key Financials rows
1. Total Revenues ($B)
2. YoY Growth % (Revenue)
3. Gross Profit ($B)
4. Gross Profit Margin (%)
5. EBITDA ($B)
6. EBITDA Margin (%)
7. Net Income ($B)
8. Net Income Margin (%)
9. Diluted EPS ($)
10. YoY Growth % (Diluted EPS)
11. Price / Earnings - P/E (x)

### Capital Structure rows
12. Market Capitalization ($B)
13. Cash & Equivalents ($B)
14. Total Debt ($B)
15. Preferred Equity ($B) — all zeros/dashes
16. Minority Interest ($B) — all zeros/dashes
17. Enterprise Value - EV ($B)

### Cash Flow Analysis rows
18. Cash from Operations ($B)
19. YoY Growth % (CFO)
20. Capital Expenditure ($B)
21. YoY Growth % (CapEx)

---

## Format Notes

- Values are in Billions ($B) except Diluted EPS (dollars), P/E (ratio), and margins/ratios (%).
- Values shown in `Quarterly (Q)` view; toggle to `Annual (Y)` or `LTM` to get different period aggregations.
- Fiscal year-end for MSFT is June 30. FY2026 ends Jun 30, 2026. Current period shown is 3Q FY2026 (Jan-Mar 2026) with LTM trailing twelve months as the last column.
- Zero/empty rows (Preferred Equity, Minority Interest) consistently show `-`.
- Some earlier periods show negative YoY values in parentheses: e.g., `(8.33)%`.

---

## Artifact Files

| File | Description |
|------|-------------|
| `summary.md` | This file — extraction overview |
| `data_inventory.md` | Detailed inventory of every data field and period |
| `extract.js` | Programmatic extractor for re-use |
| `sample-output.json` | Extracted data in JSON format |
| `network.md` | Network request patterns |
| `screenshots/` | Screenshots of the page: initial state, after search click, highlights page |

## Data inventory and extraction patterns

# Data Inventory — MSFT Highlights

## Page Identity

| Field | Value |
|-------|-------|
| URL pattern | `/fa/{dashboard-uuid}/{security-id}` |
| Security ID | `eq-kuqeq3` |
| Dashboard UUID | `00000000-bc2f-4395-abce-161f8023d0c9` |
| Route | Financial Analysis Highlights |
| Active view | Quarterly (Q) |
| Date range | 2016 – 2026 |
| Currency | USD |

---

## Fiscal Periods (42 columns)

```
3Q FY2016, 4Q FY2016, 1Q FY2017, 2Q FY2017, 3Q FY2017, 4Q FY2017,
1Q FY2018, 2Q FY2018, 3Q FY2018, 4Q FY2018, 1Q FY2019, 2Q FY2019,
3Q FY2019, 4Q FY2019, 1Q FY2020, 2Q FY2020, 3Q FY2020, 4Q FY2020,
1Q FY2021, 2Q FY2021, 3Q FY2021, 4Q FY2021, 1Q FY2022, 2Q FY2022,
3Q FY2022, 4Q FY2022, 1Q FY2023, 2Q FY2023, 3Q FY2023, 4Q FY2023,
1Q FY2024, 2Q FY2024, 3Q FY2024, 4Q FY2024, 1Q FY2025, 2Q FY2025,
3Q FY2025, 4Q FY2025, 1Q FY2026, 2Q FY2026, 3Q FY2026, Current/LTM
```

Note: MSFT fiscal year ends June 30. Current date: May 2026. 3Q FY2026 = Jan–Mar 2026.

---

## Data Rows

### Section: Key Financials

| # | Row Label | Unit | Type | Notes |
|---|-----------|------|------|-------|
| 1 | Total Revenues | $B | currency | Top-line revenue |
| 2 | YoY Growth % | % | percent | Year-over-year revenue growth |
| 3 | Gross Profit | $B | currency | Revenue – COGS |
| 4 | Gross Profit Margin | % | percent | Gross Profit / Revenue |
| 5 | EBITDA | $B | currency | Earnings before interest, tax, depreciation, amortization |
| 6 | EBITDA Margin | % | percent | EBITDA / Revenue |
| 7 | Net Income | $B | currency | Bottom-line profit |
| 8 | Net Income Margin | % | percent | Net Income / Revenue |
| 9 | Diluted EPS | $ | currency | Earnings per share (diluted) |
| 10 | YoY Growth % (EPS) | % | percent | Year-over-year EPS growth |
| 11 | Price / Earnings - P/E | x | ratio | Stock price / Diluted EPS |

### Section: Capital Structure

| # | Row Label | Unit | Type | Notes |
|---|-----------|------|------|-------|
| 12 | Market Capitalization | $B | currency | Shares × price |
| 13 | Cash & Equivalents | $B | currency | Cash + short-term investments |
| 14 | Total Debt | $B | currency | All interest-bearing debt |
| 15 | Preferred Equity | $B | currency | All zeros for MSFT |
| 16 | Minority Interest | $B | currency | All zeros for MSFT |
| 17 | Enterprise Value - EV | $B | currency | Mkt Cap + Debt – Cash – Pref – Minority |

### Section: Cash Flow Analysis

| # | Row Label | Unit | Type | Notes |
|---|-----------|------|------|-------|
| 18 | Cash from Operations | $B | currency | Operating cash flow |
| 19 | YoY Growth % (CFO) | % | percent | Year-over-year CFO growth |
| 20 | Capital Expenditure | $B | currency | CapEx (shown negative) |
| 21 | YoY Growth % (CapEx) | % | percent | Year-over-year CapEx growth |

---

## UI Controls

| Control | Options | Description |
|---------|---------|-------------|
| Period toggle | LTM, Quarterly, Annual | Selects data aggregation |
| Date range | 2016 – 2026 | Year slider |
| Currency | USD | Display currency |
| Sub-tab | Highlights, Income Statement, Balance Sheet, Cash Flow, Multiples, Enterprise Value, Profitability, ROIC, Solvency | Financial Analysis sub-sections |

---

## DOM Structure Notes

- The data table is rendered as nested rows under a `Key Financials` header.
- Each data row has a label span followed by value spans.
- Negative values are wrapped in parentheses in text (e.g., `(8.33)%`).
- Zero/empty values display as `-`.
- The sidebar URL pattern: `/fa/{dashboard-uuid}/{security-id}` where `dashboard-uuid` changes per user and `security-id` is the ticker's unique identifier.
- Active nav item has class `active` appended to `navi-panel-list-item__naviPanelListItem___ckQEj`.
- Column headers are under "Fiscal Quarters" section.
- The "NEW" badge appears next to the "Settings" button in the Financial Analysis tab bar.

## Network Patterns

- Data is likely loaded via GraphQL or REST API calls to Koyfin's backend.
- The page uses React-based rendering with dynamic data loading.
- Financial data is fetched per-period and cached client-side.
- Changes to period/date/currency triggers new data fetch without full page reload.

## Network/API notes

# Network Request Patterns — MSFT Highlights

## Observed API Endpoints

### 1. Fiscal Periods
```
GET /api/v3p/data/fiscal-periods
    ?financialPeriodType={LTM|Q|annual|quarterly}
    &fromYear={year}
    &kid={security-id}
    &toYear={year}
```
- **Method**: GET (XHR/fetch)
- **Base URL**: `https://app.koyfin.com`
- **Security ID**: `eq-kuqeq3` (for MSFT)
- **Parameters**:
  - `financialPeriodType`: `LTM`, `Q`, `annual`, `quarterly`
  - `fromYear`/`toYear`: Date range (e.g., `2016` to `2026`)
  - `kid`: Security identifier
- **Response size**: ~1.1KB (810B encoded)
- **Response type**: JSON with list of fiscal periods

### 2. Graph Data (Primary Data)
```
POST /api/v3p/data/graph?schema=packed
```
- **Method**: POST (XHR/fetch)
- **Base URL**: `https://app.koyfin.com`
- **Query param**: `schema=packed` (implies compressed/protobuf schema)
- **Request**: Likely sends a payload specifying what metrics to fetch
- **Response size**: ~25KB (24.6KB encoded) → decodes to ~82KB or ~139KB
- **Response type**: Packed/binary data (protobuf or similar binary encoding)
- **Frequency**: Multiple calls (up to 10-12 per page load, one per chart/metric)

### 3. User Settings
```
GET /api/v3/users/fa/user-settings
```
- **Method**: GET (XHR/fetch)
- **Response size**: ~559B

## Request Patterns

1. On page load, first fetches user settings, then fiscal periods, then multiple graph calls.
2. Each period toggle (LTM/Quarterly/Annual) triggers new fiscal-periods and graph requests.
3. Each sub-tab change (Highlights → Income Statement etc.) triggers new graph requests.
4. Requests include auth cookies (session-based authentication).
5. The `schema=packed` parameter suggests protobuf or MessagePack binary encoding for efficient data transfer.

## Data Flow

```
Page Load
    → GET /api/v3/users/fa/user-settings
    → GET /api/v3p/data/fiscal-periods (LTM)
    → POST /api/v3p/data/graph?schema=packed (× many, once per chart/section)
    
Toggle Period (e.g., LTM → Q)
    → GET /api/v3p/data/fiscal-periods (Q)
    → POST /api/v3p/data/graph?schema=packed (× many)

Toggle Sub-tab (e.g., Highlights → Income Statement)
    → POST /api/v3p/data/graph?schema=packed (× many)
```

## Authentication

- Session-based via cookies
- Direct API calls without auth headers fail with `401 Not authenticated`
- The browser's existing session cookies authenticate all requests

## Key URLs (MSFT)

| Resource | URL |
|----------|-----|
| Highlights page | `https://app.koyfin.com/fa/{dashboard-uuid}/{security-id}` |
| Fiscal periods API | `https://app.koyfin.com/api/v3p/data/fiscal-periods?financialPeriodType={type}&fromYear={y}&kid={sid}&toYear={y}` |
| Graph data API | `https://app.koyfin.com/api/v3p/data/graph?schema=packed` |
| User settings | `https://app.koyfin.com/api/v3/users/fa/user-settings` |

## Observations

- The financial data is NOT embedded in the HTML — it's loaded dynamically via API calls.
- The graph API uses a binary "packed" schema (likely protobuf) for efficiency.
- Response sizes are consistent across reloads (~25KB for the main payload).
- Multiple graph calls suggest each section/chart fetches data independently.
- No WebSocket or SSE connections observed — all data via XHR.

## Script and examples

- Extractor: `@../scripts/highlights/extract.js`
- Script README: `@../scripts/highlights/README.md`
