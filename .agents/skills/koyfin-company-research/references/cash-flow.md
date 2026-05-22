# Koyfin Cash Flow tab

**Section:** Financial Analysis  
**Research use:** operating/investing/financing cash flow, FCF and per-share cash metrics.  
**Observed exploration ticker:** MSFT. Treat values as examples; scripts must work for other tickers and missing-data states.

## Research guide

Use this tab when the company question needs operating/investing/financing cash flow, FCF and per-share cash metrics. Start by confirming the active ticker and Koyfin internal security id in the URL. Then review the visible widgets/tables, switch period/toggle controls only when needed, and extract structured data with `@../scripts/cash-flow/extract.js`.

## Extraction contract

- Run from the active Koyfin `Cash Flow` page in an authenticated browser session.
- Save transient outputs and screenshots under `/tmp/<TICKER>/cash-flow/`.
- Final structured rows must include `ticker`, `tab`, `extracted_at` and enough tab-specific context columns.
- Empty/no-coverage/no-data states must emit empty arrays or CSV headers plus an explicit status/error field.
- Prefer Koyfin network/API data when request and response bodies are captured safely; otherwise use DOM/SVG/table extraction documented here.

## Output schema observed

### JSON shape observed

```json
{
  "meta": {
    "ticker": "str",
    "tab": "str",
    "view": "str",
    "extractedAt": "str",
    "url": "str",
    "title": "str",
    "kid": "str",
    "currency": "str",
    "fiscalYears": [
      "str"
    ]
  },
  "cashFromOperations": {
    "Net Income": [
      "float"
    ],
    "Depreciation & Amortization, Total": [
      "float"
    ],
    "  Depreciation & Amortization": [
      "float"
    ],
    "  Amortization of Goodwill and Intangible Assets": [
      "float"
    ],
    "(Gain) Loss From Sale Of Asset": [
      "NoneType"
    ],
    "(Gain) Loss on Sale of Investments": [
      "float"
    ],
    "Amortization of Deferred Charges, Total": [
      "float"
    ],
    "Asset Writedown & Restructuring Costs": [
      "float"
    ],
    "Stock-Based Compensation": [
      "float"
    ],
    "Other Operating Activities, Total": [
      "float"
    ],
    "Change In Accounts Receivable": [
      "float"
    ],
    "Change In Inventories": [
      "float"
    ]
  },
  "cashFromInvesting": {
    "Capital Expenditure": [
      "float"
    ],
    "Sale of Property, Plant, and Equipment": [
      "NoneType"
    ],
    "Cash Acquisitions": [
      "float"
    ],
    "Divestitures": [
      "NoneType"
    ],
    "Investment in Mkt and Equity Securities, Total": [
      "float"
    ],
    "Net (Increase) Decrease in Loans Orig / Sold": [
      "NoneType"
    ],
    "Other Investing Activities, Total": [
      "float"
    ],
    "\u25ba Cash from Investing": [
      "float"
    ]
  },
  "cashFromFinancing": {
    "Total Debt Issued": [
      "float"
    ],
    "  Short Term Debt Issued, Total": [
      "float"
    ],
    "  Long-Term Debt Issued, Total": [
      "float"
    ],
    "Total Debt Repaid": [
      "float"
    ],
    "  Short Term Debt Repaid, Total": [
      "NoneType"
    ],
    "  Long-Term Debt Repaid, Total": [
      "float"
    ],
    "Issuance of Common Stock": [
      "float"
    ],
    "Repurchase of Common Stock": [
      "float"
    ],
    "Common & Preferred Stock Dividends Paid": [
      "float"
    ],
    "  Common Dividends Paid": [
      "float"
    ],
    "  Preferred Dividends Paid": [
      "NoneType"
    ],
    "  Special Dividends Paid": [
      "NoneType"
    ]
  },
  "netChangeInCash": {
    "Foreign Exchange Rate Adjustments": [
      "float"
    ],
    "Miscellaneous Cash Flow Adjustments": [
      "NoneType"
    ],
    "\u25ba Net Change in Cash": [
      "float"
    ]
  },
  "supplementalItems": {
    "Free Cash Flow": [
      "float"
    ],
    "Free Cash Flow per Share": [
      "float"
    ],
    "Cash Interest Paid": [
      "float"
    ],
    "Cash Income Tax Paid (Refund)": [
      "float"
    ],
    "Change In Net Working Capital": [
      "float"
    ],
    "Net Debt Issued / Repaid": [
      "float"
    ]
  },
  "notes": {
    "unit": "str",
    "null": "str",
    "parenthesesIndicateNegative": "bool",
    "columns": [
      "str"
    ],
    "columnCount": "int",
    "source": "str",
    "extractionMethod": "str"
  },
  "inventory": {
    "totalDataRows": "int",
    "totalSectionHeaders": "int",
    "totalSupplementalRows": "int",
    "metricsWithCompleteData": "int",
    "metricsWithMissingData": "int",
    "fiscalYearsCovered": "str",
    "periodView": "str"
  }
}
```

## MSFT page summary

# Koyfin Security Analysis — Cash Flow Tab (MSFT)

## Overview

- **Ticker:** MSFT (Microsoft Corporation)
- **Tab:** Security Analysis > Financial Analysis > Cash Flow
- **URL:** `https://app.koyfin.com/fa/{uuid}/eq-kuqeq3` (UUID varies per session)
- **Page title:** "MSFT - Cash Flow Statement"
- **Access date:** 2026-05-17
- **Koyfin entity KID:** `eq-kuqeq3`

## Page Layout

The Cash Flow page is a single-page React application divided into:

1. **Left sidebar** — Navigation tree with sections: Snapshots, Security Analysis (Overview, Description, Percentile Rank, Dividend, Ownership, Earnings History, Analyst Estimates, Price Target, Estimates Overview, Estimates Trends), Financial Analysis (Highlights, Income Statement, Balance Sheet, **Cash Flow**, Multiples, Enterprise Value, Profitability, ROIC, Solvency), News/Filings/Transcripts, Graphs.

2. **Top sub-navigation bar** — Within Financial Analysis: Highlights, Income Statement, Balance Sheet, **Cash Flow**, Multiples, Enterprise Value, Profitability, ROIC, Solvency.

3. **Period/Unit toggles** (top of data area):
   - **Period type:** Last 12 Months (LTM), Quarterly (Q), Annual (Y)
   - **Date range:** 2016 - 2026
   - **Currency:** US Dollar (USD)
   - **Unit:** Billions (B), Millions (M), or raw numbers depending on row

4. **Data table** — Horizontally scrollable grid with row labels on the left and fiscal period columns. Sub-totals (Cash from Operations, Cash from Investing, Cash from Financing) are highlighted as section headers.

5. **Quotebox** — Top-right panel showing current price, market data.

## Cash Flow Data Structure

The cash flow statement is organized into three main sections:

### 1. Cash from Operations
- Net Income
- Depreciation & Amortization, Total
  - Depreciation & Amortization
  - Amortization of Goodwill and Intangible Assets
- (Gain) Loss From Sale Of Asset
- (Gain) Loss on Sale of Investments
- Amortization of Deferred Charges, Total
- Asset Writedown & Restructuring Costs
- Stock-Based Compensation
- Other Operating Activities, Total
- Change In Accounts Receivable
- Change In Inventories
- Change In Accounts Payable
- Change in Unearned Revenues
- Change In Income Taxes
- Change in Other Net Operating Assets
- **Cash from Operations** (sub-total)

### 2. Cash from Investing
- Capital Expenditure
- Sale of Property, Plant, and Equipment
- Cash Acquisitions
- Divestitures
- Investment in Mkt and Equity Securities, Total
- Net (Increase) Decrease in Loans Orig / Sold
- Other Investing Activities, Total
- **Cash from Investing** (sub-total)

### 3. Cash from Financing
- Total Debt Issued
  - Short Term Debt Issued, Total
  - Long-Term Debt Issued, Total
- Total Debt Repaid
  - Short Term Debt Repaid, Total
  - Long-Term Debt Repaid, Total
- Issuance of Common Stock
- Repurchase of Common Stock
- Common & Preferred Stock Dividends Paid
  - Common Dividends Paid
  - Preferred Dividends Paid
- Special Dividends Paid
- Other Financing Activities
- **Cash from Financing** (sub-total)

### Net Change in Cash
- Foreign Exchange Rate Adjustments
- Miscellaneous Cash Flow Adjustments
- **Net Change in Cash** (total)

### Supplemental Items
- Free Cash Flow
- Free Cash Flow per Share
- Cash Interest Paid
- Cash Income Tax Paid (Refund)
- Change In Net Working Capital
- Net Debt Issued / Repaid

## Data Periods

- **Quarterly view:** ~40 quarters (3Q FY2016 through 3Q FY2026 + Current/LTM)
- **Annual view:** 11 fiscal years (FY2016 through FY2026)
- **LTM view:** Last 12 months of trailing data

Fiscal year end for MSFT: June 30 (Microsoft's fiscal year ends June 30).

## Key API Endpoints

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/v3p/data/graph?schema=packed` | POST | Fetch individual metric time series |
| `/api/v3p/data/fiscal-periods` | GET | Fetch fiscal period metadata |

See `network.md` and `network-sample.json` for details.

## Data inventory and extraction patterns

# Data Inventory — MSFT Cash Flow

## Page Metadata

| Field | Value |
|---|---|
| Ticker | MSFT |
| Company | Microsoft Corporation |
| Exchange | NasdaqGS |
| Sector | Information Technology |
| Industry | Software |
| Market Cap | $3,134.21B |
| Forward P/E | 22.8x |
| KID (Koyfin ID) | eq-kuqeq3 |
| Currency | USD |
| Fiscal Year End | June 30 |
| Page URL (Cash Flow) | `/fa/{uuid}/eq-kuqeq3` |
| Tab Router State | `FA.CF` (from sidebar) |

## Row Labels (Data Rows)

Each row is a financial metric. Rows with `[section]` are sub-total section headers that close a group.

### Cash from Operations section

| Row Label | API Key | Unit | Notes |
|---|---|---|---|
| Net Income | `f_nicf` | Billions (B) | Starting point for cash flow |
| Depreciation & Amortization, Total | `f_dacf` | B | Sum of D&A below |
| ├ Depreciation & Amortization | `f_amo` | B | Tangible asset depreciation |
| └ Amortization of Goodwill and Intangible Assets | `f_defamo` | B | Intangible amortization |
| (Gain) Loss From Sale Of Asset | `f_gaiasscf` | B | Usually zero for MSFT |
| (Gain) Loss on Sale of Investments | `f_gaiinvcf` | B | Securities gains/losses |
| Amortization of Deferred Charges, Total | `f_dasupplcf` | B | Deferred charges |
| Asset Writedown & Restructuring Costs | `f_asswricf` | B | Write-downs |
| Stock-Based Compensation | `f_stkcomp` | B | SBC added back |
| Other Operating Activities, Total | `f_ooa` | B | Non-standard adjustments |
| Change In Accounts Receivable | `f_chgar` | B | Working capital |
| Change In Inventories | `f_chginv` | B | Working capital |
| Change In Accounts Payable | `f_chgap` | B | Working capital |
| Change in Unearned Revenues | `f_chgurev` | B | Deferred revenue |
| Change In Income Taxes | `f_chginctax` | B | Tax timing differences |
| Change in Other Net Operating Assets | `f_chgotherassets` | B | Other WC items |
| **[Cash from Operations]** | `f_cashops` | B | **Section total** |

### Cash from Investing section

| Row Label | API Key | Unit | Notes |
|---|---|---|---|
| Capital Expenditure | `f_capex` | B | PP&E purchases (always negative) |
| Sale of Property, Plant, and Equipment | `f_chgppe` | B | Disposals (usually zero) |
| Cash Acquisitions | `f_acqui` | B | M&A spend |
| Divestitures | `f_divest` | B | Asset sales |
| Investment in Mkt and Equity Securities, Total | `f_invsec` | B | Securities transactions |
| Net (Increase) Decrease in Loans Orig / Sold | `f_invloan` | B | Loan activity |
| Other Investing Activities, Total | `f_invother` | B | Non-standard |
| **[Cash from Investing]** | `f_cashinv` | B | **Section total** |

### Cash from Financing section

| Row Label | API Key | Unit | Notes |
|---|---|---|---|
| Total Debt Issued | `f_debtiss` | B | Sum of ST and LT debt issuance |
| ├ Short Term Debt Issued, Total | `f_stdiss` | B | ST borrowings |
| └ Long-Term Debt Issued, Total | `f_ltdiss` | B | LT borrowings |
| Total Debt Repaid | `f_debtrep` | B | Sum of ST and LT repayments |
| ├ Short Term Debt Repaid, Total | `f_stdpaid` | B | ST repayments |
| └ Long-Term Debt Repaid, Total | `f_ltdpaid` | B | LT repayments |
| Issuance of Common Stock | `f_comiss` | B | Equity issuance |
| Repurchase of Common Stock | `f_comrep` | B | Buybacks (always negative) |
| Common & Preferred Stock Dividends Paid | `f_divpaid` | B | Sum of common + preferred dividends |
| ├ Common Dividends Paid | `f_comdivcf` | B | Common dividends |
| ├ Preferred Dividends Paid | `f_prefdivpaid` | B | Preferred dividends |
| └ Special Dividends Paid | `f_specdiv` | B | Special dividends |
| Other Financing Activities | `f_otherfin` | B | Non-standard |
| **[Cash from Financing]** | `f_cashfin` | B | **Section total** |

### Net Change in Cash section

| Row Label | API Key | Unit | Notes |
|---|---|---|---|
| Foreign Exchange Rate Adjustments | `f_fxcost` | B | FX impact |
| Miscellaneous Cash Flow Adjustments | `f_micfadj` | B | Adjustments |
| **[Net Change in Cash]** | `f_netchgcash` | B | **Grand total** |

### Supplemental Items section

| Row Label | API Key | Unit | Notes |
|---|---|---|---|
| Free Cash Flow | `pf_fcf` | B | Cash from Ops - Capex |
| Free Cash Flow per Share | `pf_fcf_shr` | USD/share | Per-share FCF |
| Cash Interest Paid | `f_cashint` | B | Interest paid in cash |
| Cash Income Tax Paid (Refund) | `f_castax` | B | Taxes paid in cash |
| Change In Net Working Capital | `f_chgnwc` | B | Sum of AR + Inv + AP + Unearned + Taxes + Other |
| Net Debt Issued / Repaid | `f_netdebtchg` | B | Debt Issued - Debt Repaid |

## Data Characteristics

- **Unit notation:** Values are displayed in Billions (B) with "B" suffix. Parentheses `( )` denote negative values.
- **Missing values:** Represented by `-` (dash) in the display, empty array in API.
- **Per-share rows** (`pf_fcf_shr`) are raw USD, not in Billions.
- **The "Current/LTM" column** shows trailing 12-month aggregate for the latest period.
- **Quarterly columns** align to fiscal quarters (e.g., 2Q FY2023 = quarter ending Dec 31, 2022 for MSFT).
- **Annual columns** align to fiscal years ending June 30.

## UI Controls

| Control | Location | Effect |
|---|---|---|
| Period toggle | Top bar, x≈233-528, y=238 | LTM / Quarterly (Q) / Annual (Y) |
| Date range | Top bar (2016 - 2026) | Controls fiscal year range shown |
| Currency | USD (fixed) | Currently only USD |
| Settings gear | Top-right of data area | Additional display settings |

## Network/API notes

# Network API Patterns — Koyfin Cash Flow

## Overview

Koyfin's Cash Flow page fetches data via two key API patterns. Data is loaded individually per metric — each row in the cash flow table corresponds to a single API call, making 35-50 separate requests when loading a page.

## API Endpoints

### 1. Fiscal Periods Metadata

**Endpoint:** `GET /api/v3p/data/fiscal-periods`

**Parameters:**
| Param | Value | Description |
|---|---|---|
| `financialPeriodType` | `annual` / `LTM` / `quarterly` | Period granularity |
| `fromYear` | `2016` | Start year |
| `toYear` | `2026` | End year |
| `kid` | `eq-kuqeq3` | Koyfin entity ID |

**Response shape:**
```json
{
  "periods": [
    {
      "ltmPeriod": -1893299039,
      "periodtypeid": 4,
      "date": "2026-03-31",
      "fy": 2026,
      "fq": 3,
      "cy": 2025,
      "cq": 1,
      "reportdate": "2026-04-29",
      "currencyid": 160,
      "latestperiodflag": 1,
      "statementtype": "Original"
    },
    ...
  ]
}
```

### 2. Graph Data (Metric Time Series)

**Endpoint:** `POST /api/v3p/data/graph?schema=packed`

**Request body:**
```json
{
  "id": "eq-kuqeq3",
  "key": "f_nicf",
  "currency": "USD",
  "financialPeriodType": "LTM",
  "priceFormat": "standard",
  "dateFrom": "2016-01-01",
  "dateTo": "2026-12-31"
}
```

**Parameters:**
- `id` — Koyfin entity KID (e.g., `eq-kuqeq3`)
- `key` — Metric key (see table below)
- `currency` — `USD`
- `financialPeriodType` — `LTM`, `quarterly`, or `annual`
- `priceFormat` — `standard`
- `dateFrom` / `dateTo` — ISO date range

**Response shape:**
```json
{
  "id": "MSFT:US",
  "KID": "eq-kuqeq3",
  "category": "eq",
  "graph": {
    "date": ["2026-03-31", "2025-12-31", ..., "2016-03-31"],
    "value": [35500, 32700, ..., 1700]
  },
  "startDate": "1990-06-30",
  "endDate": "2026-03-31",
  "error": null
}
```

**Error response (no data):**
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

## Cash Flow Metric Keys

| API Key | Row Label | Typical Data |
|---|---|---|
| `f_nicf` | Net Income | ✓ Always populated |
| `f_dacf` | Depreciation & Amortization, Total | ✓ |
| `f_amo` | Depreciation & Amortization | ✓ |
| `f_defamo` | Amortization of Goodwill and Intangible Assets | ✓ |
| `f_gaiasscf` | (Gain) Loss From Sale Of Asset | Often empty (`-`) |
| `f_gaiinvcf` | (Gain) Loss on Sale of Investments | ✓ |
| `f_dasupplcf` | Amortization of Deferred Charges, Total | Sparse |
| `f_asswricf` | Asset Writedown & Restructuring Costs | Sparse |
| `f_stkcomp` | Stock-Based Compensation | ✓ |
| `f_ooa` | Other Operating Activities, Total | ✓ |
| `f_chgar` | Change In Accounts Receivable | ✓ |
| `f_chginv` | Change In Inventories | ✓ |
| `f_chgap` | Change In Accounts Payable | ✓ |
| `f_chgurev` | Change in Unearned Revenues | ✓ |
| `f_chginctax` | Change In Income Taxes | ✓ |
| `f_chgotherassets` | Change in Other Net Operating Assets | ✓ |
| `f_cashops` | **Cash from Operations** | ✓ Sub-total |
| `f_capex` | Capital Expenditure | ✓ (always negative) |
| `f_chgppe` | Sale of Property, Plant, and Equipment | Often empty |
| `f_acqui` | Cash Acquisitions | ✓ |
| `f_divest` | Divestitures | Sparse |
| `f_invsec` | Investment in Mkt and Equity Securities, Total | ✓ |
| `f_invloan` | Net (Increase) Decrease in Loans Orig / Sold | Often empty |
| `f_invother` | Other Investing Activities, Total | ✓ |
| `f_cashinv` | **Cash from Investing** | ✓ Sub-total |
| `f_debtiss` | Total Debt Issued | Sparse (only active periods) |
| `f_stdiss` | Short Term Debt Issued, Total | Sparse |
| `f_ltdiss` | Long-Term Debt Issued, Total | Sparse |
| `f_debtrep` | Total Debt Repaid | ✓ |
| `f_stdpaid` | Short Term Debt Repaid, Total | Sparse |
| `f_ltdpaid` | Long-Term Debt Repaid, Total | ✓ |
| `f_comiss` | Issuance of Common Stock | ✓ (small values) |
| `f_comrep` | Repurchase of Common Stock | ✓ (always negative) |
| `f_divpaid` | Common & Preferred Stock Dividends Paid | ✓ |
| `f_comdivcf` | Common Dividends Paid | ✓ |
| `f_prefdivpaid` | Preferred Dividends Paid | Often empty |
| `f_specdiv` | Special Dividends Paid | Sparse |
| `f_otherfin` | Other Financing Activities | ✓ |
| `f_cashfin` | **Cash from Financing** | ✓ Sub-total |
| `f_fxcost` | Foreign Exchange Rate Adjustments | ✓ (small values) |
| `f_micfadj` | Miscellaneous Cash Flow Adjustments | Often empty |
| `f_netchgcash` | **Net Change in Cash** | ✓ Grand total |
| `pf_fcf` | Free Cash Flow | ✓ Supplemental |
| `pf_fcf_shr` | Free Cash Flow per Share | ✓ Supplemental |
| `f_cashint` | Cash Interest Paid | ✓ Supplemental |
| `f_castax` | Cash Income Tax Paid (Refund) | ✓ Supplemental |
| `f_chgnwc` | Change In Net Working Capital | ✓ Supplemental |
| `f_netdebtchg` | Net Debt Issued / Repaid | ✓ Supplemental |

## Important Notes

- **Authentication:** All API calls require cookies (`connect.sid` or similar session cookie). Direct API calls without browser context return `401 Not authenticated`.
- **CORS:** Requests originate from `app.koyfin.com` to same origin.
- **Concurrent loading:** The page fires ~35-50 parallel POST requests on load. This is observable via Network panel as many `graph?schema=packed` requests.
- **Caching:** Graph responses include `startDate`/`endDate` fields; identical requests with the same parameters return cached results (HTTP 304 or application-level cache).
- **Period switching:** Changing the period toggle (LTM/Quarterly/Annual) triggers a fresh batch of graph requests with updated `financialPeriodType`.
- **Empty data patterns:** Metrics with no data return `graph: {}` with `error.code: "KOY_003"`. These are rendered as `-` in the UI.
- **Value format:** All values in the API response are raw numbers (not strings). The UI divides by 1e9 and appends "B" for display. Per-share metrics (`pf_fcf_shr`) are raw USD values.

## Script and examples

- Extractor: `@../scripts/cash-flow/extract.js`
- Script README: `@../scripts/cash-flow/README.md`
