# Koyfin Profitability tab

**Section:** Financial Analysis  
**Research use:** returns, margins, turnover and liquidity metrics.  
**Observed exploration ticker:** MSFT. Treat values as examples; scripts must work for other tickers and missing-data states.

## Research guide

Use this tab when the company question needs returns, margins, turnover and liquidity metrics. Start by confirming the active ticker and Koyfin internal security id in the URL. Then review the visible widgets/tables, switch period/toggle controls only when needed, and extract structured data with `@../scripts/profitability/extract.js`.

## Extraction contract

- Run from the active Koyfin `Profitability` page in an authenticated browser session.
- Save transient outputs and screenshots under `/tmp/<TICKER>/profitability/`.
- Final structured rows must include `ticker`, `tab`, `extracted_at` and enough tab-specific context columns.
- Empty/no-coverage/no-data states must emit empty arrays or CSV headers plus an explicit status/error field.
- Prefer Koyfin network/API data when request and response bodies are captured safely; otherwise use DOM/SVG/table extraction documented here.

## Output schema observed

### CSV headers observed

`Section`, `Metric`, `FY 2016`, `FY 2017`, `FY 2018`, `FY 2019`, `FY 2020`, `FY 2021`, `FY 2022`, `FY 2023`, `FY 2024`, `FY 2025`, `Current/LTM`
### JSON shape observed

```json
{
  "ticker": "str",
  "tab": "str",
  "extracted_at": "str",
  "page_url": "str",
  "page_title": "str",
  "periods": [
    "str"
  ],
  "sections": [
    "str"
  ],
  "metrics": {
    "Returns": {
      "Return on Assets": "list",
      "Return On Equity": "list",
      "Return on Total Capital": "list",
      "Return on Common Equity": "list"
    },
    "Margins": {
      "EBITDA Margin": "list",
      "EBITA Margin": "list",
      "EBIT Margin": "list",
      "EBT Margin": "list",
      "EBT Excl. Non-Recurring Items Margin": "list",
      "Gross Profit Margin": "list",
      "SG&A Margin": "list",
      "Net Income Margin": "list",
      "Net Avail. For Common Margin": "list",
      "Normalized Net Income Margin": "list"
    },
    "Asset Turnovers": {
      "Receivables Turnover (Average Receivables)": "list",
      "Fixed Assets Turnover (Average Fixed Assets)": "list",
      "Inventory Turnover (Average Inventory)": "list",
      "Asset Turnover": "list",
      "Days Outstanding Inventory (Avg)": "list"
    },
    "Short-term Liquidity": {
      "Current Ratio": "list",
      "Quick Ratio": "list",
      "Days Sales Outstanding (Average Receivables)": "list",
      "Days Payable Outstanding (Avg)": "list",
      "Cash Conversion Cycle (Average Days)": "list",
      "Operating Cash Flow to Current Liabilities": "list"
    }
  },
  "raw_values": [
    {
      "section": "str",
      "metric": "str",
      "values": "list"
    }
  ]
}
```

## MSFT page summary

# Koyfin Profitability Tab — MSFT

## Task Summary

**Goal:** Explore Koyfin Security Analysis > Financial Analysis > Profitability tab for ticker MSFT and save extraction artifacts.

**Navigated from:** Enterprise Values (FA.EV) → clicked "Profitability" in the left sidebar  
**Page URL:** `https://app.koyfin.com/fa/00000000-5e32-4dbc-a064-6b856f86cc2e/eq-kuqeq3`  
**Ticker:** MSFT (Microsoft Corporation)  
**Exchange:** NasdaqGS  
**Sector:** Information Technology  
**Industry:** Software  

## Page Structure

The Koyfin Financial Analysis page uses a custom React-based virtualized table (`fa-table`). The DOM structure follows this pattern:

```
div.fa-table__root
  div[style*="height"] (scroll area)
    div.fa-table__headerRow (period column headers)
    div (section — Returns)
      div.lde-data-table-group__groupHeader → "Returns"
      div > div.base-table-row__root (data row — Return on Assets)
      div > div.base-table-row__root (data row — Return On Equity)
      ...
    div (section — Margins)
    div (section — Asset Turnovers)
    div (section — Short-term Liquidity)
```

## Period Toggles

- **Fiscal Periods:** Annual (Y) — currently active. Also available: Last 12 Months (LTM), Quarterly (Q)
- **Date Range:** 2016–2026
- **Currency:** US Dollar (USD)
- **Header columns:** FY 2016, FY 2017, FY 2018, FY 2019, FY 2020, FY 2021, FY 2022, FY 2023, FY 2024, FY 2025, Current/LTM

## Extracted Data

| Section | Metrics | Values |
|---------|---------|--------|
| Returns | 4 | Return on Assets, Return On Equity, Return on Total Capital, Return on Common Equity |
| Margins | 10 | EBITDA Margin, EBITA Margin, EBIT Margin, EBT Margin (dashes), EBT Excl. Non-Recurring (dashes), Gross Profit Margin, SG&A Margin, Net Income Margin, Net Avail. For Common Margin, Normalized Net Income Margin |
| Asset Turnovers | 5 | Receivables Turnover, Fixed Assets Turnover, Inventory Turnover, Asset Turnover, Days Outstanding Inventory |
| Short-term Liquidity | 6 | Current Ratio, Quick Ratio, Days Sales Outstanding, Days Payable Outstanding, Cash Conversion Cycle, Operating CF to Current Liabilities |

**Total:** 25 metrics × 11 periods = 275 data points (plus 2 empty dash rows handled gracefully).

## API Pattern

- **Fiscal periods:** `GET /api/v3p/data/fiscal-periods?financialPeriodType=annual&fromYear=2016&kid=eq-kuqeq3&toYear=2026`
- **Graph data:** `POST /api/v3p/data/graph?schema=packed` (per-individual-metric; key-based)
- **Auth:** Bearer token from `auth_token` cookie via `Authorization: Bearer <token>` header

## Artifacts

| File | Description |
|------|-------------|
| `01-initial-state.png` | Screenshot before navigation (Enterprise Values page) |
| `02-after-profitability-click.png` | Screenshot after navigating to Profitability |
| `03-profitability-page.png` | Screenshot of the full Profitability page |
| `summary.md` | This file |
| `data_inventory.md` | Full inventory of all extracted data fields |
| `extract.js` | Reusable DOM extraction script |
| `sample-output.json` | Full extracted data in JSON format |
| `sample-output.csv` | Flattened data in CSV format |
| `network.md` | API endpoint documentation |
| `network-sample.json` | Fiscal periods API response sample |
| `page.html` | Full page HTML for offline analysis |

## Confidence

**High** — All 25 metrics extracted successfully across 11 periods. EBT rows correctly identified as empty (dashes). The DOM extraction pattern is robust for the Profitability tab and reusable for other Financial Analysis sub-tabs (Highlights, Income Statement, Balance Sheet, Cash Flow, Multiples, Enterprise Value, ROIC, Solvency).

## Blockers

None. The Profitability page loaded fully and data extraction completed without issues.

## Data inventory and extraction patterns

# Data Inventory — Koyfin Profitability (MSFT)

## Metadata

| Field | Value |
|-------|-------|
| ticker | MSFT |
| tab | Profitability |
| extracted_at | 2026-05-17T17:46:55.828Z |
| periods | FY 2016, FY 2017, FY 2018, FY 2019, FY 2020, FY 2021, FY 2022, FY 2023, FY 2024, FY 2025, Current/LTM |
| sections | Returns, Margins, Asset Turnovers, Short-term Liquidity |

## Section: Returns

### Return on Assets (%)
| FY2016 | FY2017 | FY2018 | FY2019 | FY2020 | FY2021 | FY2022 | FY2023 | FY2024 | FY2025 | C/LTM |
|--------|--------|--------|--------|--------|--------|--------|--------|--------|--------|-------|
| 9.24 | 8.26 | 8.61 | 9.85 | 11.26 | 13.76 | 14.92 | 14.24 | 14.80 | 14.20 | 14.81 |

### Return On Equity (%)
| FY2016 | FY2017 | FY2018 | FY2019 | FY2020 | FY2021 | FY2022 | FY2023 | FY2024 | FY2025 | C/LTM |
|--------|--------|--------|--------|--------|--------|--------|--------|--------|--------|-------|
| 27.01 | 31.92 | 19.45 | 42.41 | 40.14 | 47.08 | 47.15 | 38.82 | 37.13 | 33.28 | 34.01 |

### Return on Total Capital (%)
| FY2016 | FY2017 | FY2018 | FY2019 | FY2020 | FY2021 | FY2022 | FY2023 | FY2024 | FY2025 | C/LTM |
|--------|--------|--------|--------|--------|--------|--------|--------|--------|--------|-------|
| 14.04 | 11.84 | 12.40 | 14.96 | 17.01 | 20.58 | 22.21 | 20.85 | 20.98 | 19.55 | 19.26 |

### Return on Common Equity (%)
| FY2016 | FY2017 | FY2018 | FY2019 | FY2020 | FY2021 | FY2022 | FY2023 | FY2024 | FY2025 | C/LTM |
|--------|--------|--------|--------|--------|--------|--------|--------|--------|--------|-------|
| 27.01 | 31.92 | 19.45 | 42.41 | 40.14 | 47.08 | 47.15 | 38.82 | 37.13 | 33.28 | 34.01 |

## Section: Margins

### EBITDA Margin (%)
| FY2016 | FY2017 | FY2018 | FY2019 | FY2020 | FY2021 | FY2022 | FY2023 | FY2024 | FY2025 | C/LTM |
|--------|--------|--------|--------|--------|--------|--------|--------|--------|--------|-------|
| 36.27 | 38.45 | 40.74 | 43.35 | 45.63 | 48.08 | 49.42 | 48.14 | 52.80 | 55.56 | 57.96 |

### EBITA Margin (%)
| FY2016 | FY2017 | FY2018 | FY2019 | FY2020 | FY2021 | FY2022 | FY2023 | FY2024 | FY2025 | C/LTM |
|--------|--------|--------|--------|--------|--------|--------|--------|--------|--------|-------|
| 30.90 | 32.13 | 33.76 | 35.65 | 38.15 | 42.55 | 43.06 | 42.95 | 46.60 | 47.75 | 48.44 |

### EBIT Margin (%)
| FY2016 | FY2017 | FY2018 | FY2019 | FY2020 | FY2021 | FY2022 | FY2023 | FY2024 | FY2025 | C/LTM |
|--------|--------|--------|--------|--------|--------|--------|--------|--------|--------|-------|
| 29.83 | 30.37 | 31.77 | 34.14 | 37.03 | 41.59 | 42.06 | 41.77 | 44.64 | 45.62 | 46.80 |

### EBT Margin (%)
All periods: — (not available / dashes)

### EBT Excl. Non-Recurring Items Margin (%)
All periods: — (not available / dashes)

### Gross Profit Margin (%)
| FY2016 | FY2017 | FY2018 | FY2019 | FY2020 | FY2021 | FY2022 | FY2023 | FY2024 | FY2025 | C/LTM |
|--------|--------|--------|--------|--------|--------|--------|--------|--------|--------|-------|
| 64.04 | 64.52 | 65.25 | 65.90 | 67.78 | 68.93 | 68.40 | 68.92 | 69.76 | 68.82 | 68.31 |

### SG&A Margin (%)
| FY2016 | FY2017 | FY2018 | FY2019 | FY2020 | FY2021 | FY2022 | FY2023 | FY2024 | FY2025 | C/LTM |
|--------|--------|--------|--------|--------|--------|--------|--------|--------|--------|-------|
| 21.06 | 20.65 | 20.14 | 18.35 | 17.28 | 15.01 | 13.98 | 14.31 | 13.08 | 11.67 | 10.70 |

### Net Income Margin (%)
| FY2016 | FY2017 | FY2018 | FY2019 | FY2020 | FY2021 | FY2022 | FY2023 | FY2024 | FY2025 | C/LTM |
|--------|--------|--------|--------|--------|--------|--------|--------|--------|--------|-------|
| 22.53 | 26.39 | 15.02 | 31.18 | 30.96 | 36.45 | 36.69 | 34.15 | 35.96 | 36.15 | 39.34 |

### Net Avail. For Common Margin (%)
| FY2016 | FY2017 | FY2018 | FY2019 | FY2020 | FY2021 | FY2022 | FY2023 | FY2024 | FY2025 | C/LTM |
|--------|--------|--------|--------|--------|--------|--------|--------|--------|--------|-------|
| 22.53 | 26.39 | 15.02 | 31.18 | 30.96 | 36.45 | 36.69 | 34.15 | 35.96 | 36.15 | 39.34 |

### Normalized Net Income Margin (%)
| FY2016 | FY2017 | FY2018 | FY2019 | FY2020 | FY2021 | FY2022 | FY2023 | FY2024 | FY2025 | C/LTM |
|--------|--------|--------|--------|--------|--------|--------|--------|--------|--------|-------|
| 17.90 | 18.00 | 19.25 | 21.38 | 23.16 | 25.98 | 26.24 | 26.45 | 27.89 | 28.61 | 31.05 |

## Section: Asset Turnovers

### Receivables Turnover (Average Receivables) (x)
| FY2016 | FY2017 | FY2018 | FY2019 | FY2020 | FY2021 | FY2022 | FY2023 | FY2024 | FY2025 | C/LTM |
|--------|--------|--------|--------|--------|--------|--------|--------|--------|--------|-------|
| 5.0 | 4.7 | 4.5 | 4.5 | 4.6 | 4.8 | 4.8 | 4.6 | 4.6 | 4.4 | 5.7 |

### Fixed Assets Turnover (Average Fixed Assets) (x)
| FY2016 | FY2017 | FY2018 | FY2019 | FY2020 | FY2021 | FY2022 | FY2023 | FY2024 | FY2025 | C/LTM |
|--------|--------|--------|--------|--------|--------|--------|--------|--------|--------|-------|
| 5.5 | 4.0 | 3.3 | 3.1 | 3.0 | 2.7 | 2.5 | 2.1 | 1.9 | 1.5 | 1.2 |

### Inventory Turnover (Average Inventory) (x)
| FY2016 | FY2017 | FY2018 | FY2019 | FY2020 | FY2021 | FY2022 | FY2023 | FY2024 | FY2025 | C/LTM |
|--------|--------|--------|--------|--------|--------|--------|--------|--------|--------|-------|
| 12.7 | 15.5 | 15.8 | 18.2 | 23.3 | 23.1 | 19.6 | 21.1 | 39.6 | 80.4 | 97.6 |

### Asset Turnover (x)
| FY2016 | FY2017 | FY2018 | FY2019 | FY2020 | FY2021 | FY2022 | FY2023 | FY2024 | FY2025 | C/LTM |
|--------|--------|--------|--------|--------|--------|--------|--------|--------|--------|-------|
| 0.5 | 0.4 | 0.4 | 0.5 | 0.5 | 0.5 | 0.6 | 0.5 | 0.5 | 0.5 | 0.5 |

### Days Outstanding Inventory (Avg)
| FY2016 | FY2017 | FY2018 | FY2019 | FY2020 | FY2021 | FY2022 | FY2023 | FY2024 | FY2025 | C/LTM |
|--------|--------|--------|--------|--------|--------|--------|--------|--------|--------|-------|
| 28.8 | 23.6 | 23.0 | 20.1 | 15.7 | 15.8 | 18.6 | 17.3 | 9.2 | 4.5 | 3.7 |

## Section: Short-term Liquidity

### Current Ratio (x)
| FY2016 | FY2017 | FY2018 | FY2019 | FY2020 | FY2021 | FY2022 | FY2023 | FY2024 | FY2025 | C/LTM |
|--------|--------|--------|--------|--------|--------|--------|--------|--------|--------|-------|
| 2.4 | 2.9 | 2.9 | 2.5 | 2.5 | 2.1 | 1.8 | 1.8 | 1.3 | 1.4 | 1.3 |

### Quick Ratio (x)
| FY2016 | FY2017 | FY2018 | FY2019 | FY2020 | FY2021 | FY2022 | FY2023 | FY2024 | FY2025 | C/LTM |
|--------|--------|--------|--------|--------|--------|--------|--------|--------|--------|-------|
| 2.2 | 2.8 | 2.7 | 2.4 | 2.3 | 1.9 | 1.6 | 1.6 | 1.1 | 1.2 | 1.1 |

### Days Sales Outstanding (Average Receivables)
| FY2016 | FY2017 | FY2018 | FY2019 | FY2020 | FY2021 | FY2022 | FY2023 | FY2024 | FY2025 | C/LTM |
|--------|--------|--------|--------|--------|--------|--------|--------|--------|--------|-------|
| 72.6 | 76.9 | 80.9 | 81.2 | 78.7 | 76.1 | 75.8 | 80.0 | 78.8 | 82.2 | 64.1 |

### Days Payable Outstanding (Avg)
| FY2016 | FY2017 | FY2018 | FY2019 | FY2020 | FY2021 | FY2022 | FY2023 | FY2024 | FY2025 | C/LTM |
|--------|--------|--------|--------|--------|--------|--------|--------|--------|--------|-------|
| 76.8 | 76.3 | 75.2 | 77.6 | 87.3 | 95.4 | 97.8 | 104.8 | 100.7 | 103.7 | 114.9 |

### Cash Conversion Cycle (Average Days)
| FY2016 | FY2017 | FY2018 | FY2019 | FY2020 | FY2021 | FY2022 | FY2023 | FY2024 | FY2025 | C/LTM |
|--------|--------|--------|--------|--------|--------|--------|--------|--------|--------|-------|
| 24.6 | 24.3 | 28.7 | 23.7 | 7.1 | -3.5 | -3.5 | -7.4 | -12.6 | -17.0 | -47.1 |

### Operating Cash Flow to Current Liabilities (x)
| FY2016 | FY2017 | FY2018 | FY2019 | FY2020 | FY2021 | FY2022 | FY2023 | FY2024 | FY2025 | C/LTM |
|--------|--------|--------|--------|--------|--------|--------|--------|--------|--------|-------|
| 0.6 | 0.7 | 0.8 | 0.8 | 0.8 | 0.9 | 0.9 | 0.8 | 0.9 | 1.0 | 1.2 |

## Notes

- **Empty rows:** EBT Margin and EBT Excl. Non-Recurring Items Margin show dashes (`—`) for all periods — these metrics are not available for MSFT.
- **Units:** Returns/Margins are percentages. Turnovers are ratios (x). Days measures are calendar days. Cash Conversion Cycle can be negative (positive working capital position).
- **Current/LTM column:** Represents the Last Twelve Months as of the most recent reporting period.
- **Negative values:** Cash Conversion Cycle goes negative starting FY2021, indicating Microsoft operates with negative working capital (collects cash before paying suppliers).

## Network/API notes

# Koyfin Financial Analysis API Patterns

## Overview

Koyfin's Financial Analysis tab loads data through a REST API at `app.koyfin.com`. The page uses React with a custom virtualized table component. Data is fetched per-session via authenticated API calls, not pre-rendered on the server.

## Authentication

All API calls require a Bearer token found in the `auth_token` cookie:

```
Authorization: Bearer <token>
```

The token is a JWT (`auth_token` cookie, httpOnly). Include `credentials: 'same-origin'` or pass the token explicitly.

## API Endpoints

### 1. Fiscal Periods

**GET** `/api/v3p/data/fiscal-periods`

Used to determine which fiscal periods are available and their metadata.

**Parameters:**

| Parameter | Type | Example | Description |
|-----------|------|---------|-------------|
| `financialPeriodType` | string | `annual` | Period type: `annual`, `quarterly`, `ltm` |
| `fromYear` | int | `2016` | Start year |
| `toYear` | int | `2026` | End year |
| `kid` | string | `eq-kuqeq3` | Ticker key ID |

**Sample Response:**

```json
{
  "periods": [
    {
      "ltmPeriod": -1934254297,
      "periodtypeid": 1,
      "date": "2025-06-30",
      "fy": 2025,
      "fq": 4,
      "cy": 2025,
      "cq": 2,
      "reportdate": "2025-07-30",
      "currencyid": 160,
      "latestperiodflag": 1,
      "statementtype": "Original"
    }
  ]
}
```

Each period entry includes:
- `fy` / `fq`: Fiscal year and quarter
- `date`: Period end date (balance sheet date)
- `reportdate`: Earnings report date
- `ltmPeriod`: Internal LTM period identifier
- `latestperiodflag`: 1 for most recent period
- `currencyid`: 160 = USD

### 2. Graph Data

**POST** `/api/v3p/data/graph?schema=packed`

Fetches individual metric data points. Called many times per page load (one request per metric).

**Request body structure (to be determined):**

The exact key format and payload structure wasn't fully reverse-engineered. From observing network traffic, the page makes ~40+ individual `graph?schema=packed` requests. Each request fetches data for one metric key.

Known constraints:
- `dateFrom` / `dateTo` format: `YYYY-MM-DD`
- `key` must be a valid enum value (exact key names unknown — e.g., `fa_roa` not valid)
- `id` appears to be the ticker key ID (e.g., `eq-kuqeq3`)

### 3. FA Templates

**GET** `/api/v3/users/fa/templates/{uuid}`

Returns the Financial Analysis tab configuration for the user — which metrics are displayed, in what order, grouped by section.

**URL pattern:** `https://app.koyfin.com/api/v3/users/fa/templates/00000000-5e32-4dbc-a064-6b856f86cc2e`

The UUID in the URL corresponds to the FA template ID visible in the page URL: `/fa/{template-uuid}/eq-kuqeq3`.

### 4. FA User Settings

**GET** `/api/v3/users/fa/user-settings`

Returns user preferences for the Financial Analysis tool (visible columns, period type, currency).

### 5. Data Keys

**GET** `/api/v3/data/keys` (returned 404 in testing — may require different path or parameters)

The page also calls `/api/v3p/data/keys` (multiple times) — these may be key lookups for the graph endpoint.

## Page Load Sequence

1. Page navigated → User settings + FA template fetched
2. FA template configures which metrics/sections/periods to display
3. Fiscal periods fetched to build column headers
4. Individual `graph?schema=packed` requests fire for each metric
5. React renders the table from the aggregated data

## Network Observations

- ~40+ graph requests fire per page load (one per metric visible in the table)
- Each graph request returns data for one metric across all periods
- Additional requests are made on period/currency/fiscal-year toggle changes
- The `schema=packed` parameter suggests the response schema can vary
- No WebSocket or streaming — all REST

## Artifacts

- `network-sample.json`: Full response from `fiscal-periods` endpoint for MSFT, annual, 2016–2026
- `page.html`: Full page DOM as captured during extraction (267KB)

## Script and examples

- Extractor: `@../scripts/profitability/extract.js`
- Script README: `@../scripts/profitability/README.md`
