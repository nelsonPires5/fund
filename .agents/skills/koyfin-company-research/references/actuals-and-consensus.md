# Koyfin Actuals and Consensus tab

**Section:** Analyst Estimates  
**Research use:** historical actuals and forward consensus by annual/quarterly period.  
**Observed exploration ticker:** MSFT. Treat values as examples; scripts must work for other tickers and missing-data states.

## Research guide

Use this tab when the company question needs historical actuals and forward consensus by annual/quarterly period. Start by confirming the active ticker and Koyfin internal security id in the URL. Then review the visible widgets/tables, switch period/toggle controls only when needed, and extract structured data with `@../scripts/actuals-and-consensus/extract.js`.

## Extraction contract

- Run from the active Koyfin `Actuals and Consensus` page in an authenticated browser session.
- Save transient outputs and screenshots under `/tmp/<TICKER>/actuals-and-consensus/`.
- Final structured rows must include `ticker`, `tab`, `extracted_at` and enough tab-specific context columns.
- Empty/no-coverage/no-data states must emit empty arrays or CSV headers plus an explicit status/error field.
- Prefer Koyfin network/API data when request and response bodies are captured safely; otherwise use DOM/SVG/table extraction documented here.

## Output schema observed

### CSV headers observed

`Calendar Years Period Ending Report Date`, `CY 2023A Jun-30-2023 Jul-25-2023`, `CY 2024A Jun-30-2024 Jul-30-2024`, `CY 2025A Jun-30-2025 Jul-30-2025`, `CY 2026E Jun-30-2026 -`, `CY 2027E Jun-30-2027 -`, `CY 2028E Jun-30-2028 -`
### JSON shape observed

```json
{
  "ticker": "str",
  "tab": "str",
  "url": "str",
  "extracted_at": "str",
  "view": "str",
  "columns_metadata": {
    "periods": [
      "dict"
    ]
  },
  "data": [
    {
      "idx": "int",
      "type": "str",
      "cells": "list"
    }
  ],
  "quarterly_view": {
    "extracted_at": "str",
    "rows": [
      "dict"
    ]
  }
}
```

## MSFT page summary

# MSFT Actuals and Consensus — Koyfin Security Analysis

## Task Summary
Extracted Actuals and Consensus data for **MSFT (Microsoft Corporation)** from Koyfin's Security Analysis > Analyst Estimates > Actuals and Consensus tab.

## Page Accessed
- **URL**: `https://app.koyfin.com/estimates/eac/eq-kuqeq3`
- **Ticker**: MSFT (`eq-kuqeq3`)
- **Views extracted**: Annual (Y) and Quarterly (Q)
- **Currency**: USD
- **Date range**: CY 2023–CY 2028 (Annual), 1Q CY2023–4Q CY2027 (Quarterly)

## Key Findings

### Annual View — Columns
| Column | Fiscal Year | Period End | Report Date | Status |
|--------|-------------|------------|-------------|--------|
| 1 | CY 2023A | Jun-30-2023 | Jul-25-2023 | Actual |
| 2 | CY 2024A | Jun-30-2024 | Jul-30-2024 | Actual |
| 3 | CY 2025A | Jun-30-2025 | Jul-30-2025 | Actual |
| 4 | CY 2026E | Jun-30-2026 | — | Estimate |
| 5 | CY 2027E | Jun-30-2027 | — | Estimate |
| 6 | CY 2028E | Jun-30-2028 | — | Estimate |

### Annual View — Data Sections
1. **Income Statement** (rows 2–32):
   - Sales, Adjusted + Consensus Estimates (Avg, Median, High, Low, # Analysts, YoY%)
   - Gross Profit, Adjusted + Consensus Estimates (same breakdown) + Gross Margin %
   - EBITDA, Adjusted + Consensus Estimates (same breakdown) + EBITDA Adj. Margin %
   - EBIT, Adjusted
   - Valuation multiples: Price/Sales, EV/Sales, EV/Gross Profit, EV/EBITDA

2. **Balance Sheet** (rows 33–37):
   - Net Debt + Consensus Estimates (Avg, Median)

### Quarterly View — 16 Quarterly Periods from 1Q CY2023A to 4Q CY2027E
Same metric structure as Annual but with quarterly granularity.

### Key API Endpoints
- `POST /api/v3/fa/estimate-data` — Main data provider (133KB decoded response, ~3.6s load)
- `POST /api/v3/users/estimates-and-actuals-snapshot/settings` — User settings/preferences
- `POST /api/v3p/data/keys` — Data key resolution

### DOM Structure
- Custom div-based table (not `<table>` element)
- Container: `div[class*="table-styles__table__scrollContainer___"]`
- Rows: `div[class*="table-styles__table__row___"]` with 7 cells each
- Section separators denote metric groupings

## Data inventory and extraction patterns

# Data Inventory — MSFT Actuals and Consensus

## Files

| File | Description | Size |
|------|-------------|------|
| `sample-output.json` | Full extracted data — annual and quarterly views | ~15 KB |
| `sample-output.csv` | Annual view table in CSV format | ~2 KB |
| `extract.js` | Reusable extractor script for Koyfin EAC table | ~3 KB |
| `summary.md` | Summary of findings | ~2 KB |
| `network.md` | Network API patterns | ~1 KB |
| `network-sample.json` | Sample network API request/response metadata | ~2 KB |
| `01-initial-state.png` | Screenshot of initial page state (Earnings History) | — |
| `02-before-click.png` | Screenshot before navigation | — |
| `03-actuals-consensus-page.png` | Screenshot of Actuals and Consensus page | — |
| `04-annual-final.png` | Final screenshot of Annual view | — |

## Data Dimensions

### Annual View
- **6 columns**: CY 2023A → CY 2028E
- **38 rows**: 1 header + section headers + 33 data rows
- **Metrics extracted**:
  - Sales, Adjusted (Actual + Consensus Avg/Med/High/Low/#Analysts/YoY%)
  - Gross Profit, Adjusted (same + Gross Margin%)
  - EBITDA, Adjusted (same + EBITDA Margin%)
  - EBIT, Adjusted
  - Net Debt (Actual + Consensus Avg/Med)
  - Valuation multiples: P/S, EV/Sales, EV/Gross Profit, EV/EBITDA

### Quarterly View
- **16 columns**: 1Q CY2023A → 4Q CY2027E
- **38 rows**: same structure as annual

## Data Completeness
- ✅ Annual actuals available: CY 2023A, 2024A, 2025A
- ⚠️ Annual estimates: CY 2026E, 2027E, 2028E (report dates not yet available)
- ✅ Quarterly actuals: 1Q2023–2Q2025
- ✅ Quarterly estimates: 3Q2025–4Q2027
- ✅ Consensus analyst count available for all major metrics
- ✅ High/Low/Average/Median estimates all populated
- ❌ Balance Sheet section limited (only Net Debt)

## Column Mapping
Each data row has 7 cells: `[label, cy2023, cy2024, cy2025, cy2026, cy2027, cy2028]`
For quarterly: `[label, 1Q23, 2Q23, 3Q23, 4Q23, 1Q24, ..., 4Q27]`

## Network/API notes

# Network Patterns — Koyfin Actuals and Consensus

## Key API Endpoints

| Endpoint | Method | Type | Description |
|----------|--------|------|-------------|
| `/api/v3/fa/estimate-data` | POST | XHR | **Main data provider** — 133KB decoded, ~3.6s |
| `/api/v3/users/estimates-and-actuals-snapshot/settings` | POST | XHR | User settings/preferences |
| `/api/v3/users/fa/templates` | GET | XHR | Financial Analysis templates |
| `/api/v3/data/keys` | POST | XHR | Data key metadata resolution |
| `/api/v3/users/settings` | GET | XHR | User settings |
| `/api/v3/users/watchlists/structure` | GET | XHR | Watchlist structure |
| `/api/v3/users/dashboards/structure` | GET | XHR | Dashboard structure |

## Observations

1. **Authentication**: Bearer token in `auth_token` cookie (JWT)
2. **Request patterns**: JSON POST bodies with `keys` array, `periodType`, `showActuals`, `showConsensus`, `tickerId`, `fiscalPeriods`
3. **Data key format**: Keys like `REV_GAAP_ADJ_1`, `GROSS_PROFIT_ADJ_1`, `EBITDA_ADJ_1`, `EBIT_ADJ_1`, `NET_DEBT`, `GROSS_MARGIN_ADJ_1`, `EBITDA_MARGIN_ADJ_1`, `PE_ADJ_1`, `EV_SALES_1`, `EV_EBITDA_1`, `PS_1`
4. **Response size**: ~133KB decoded for annual estimate-data, indicating rich data structure
5. **Ticker ID format**: `eq-<random-id>` (e.g., `eq-kuqeq3` for MSFT)
6. **Versioned API**: Both `/api/v3/` and `/api/v3p/` paths observed (v3p returns small 19-byte responses, likely validation or preflight)
7. **Caching**: Browser caches resources; CDP `Network.clearBrowserCache` may be needed for fresh captures

## TODO for Full API Capture
- The actual request/response bodies couldn't be captured retroactively
- To capture: enable `Network.enable` via CDP before page load, then use `Network.getResponseBody` with the request ID
- Response body likely contains the full timeseries data in structured JSON format

## Script and examples

- Extractor: `@../scripts/actuals-and-consensus/extract.js`
- Script README: `@../scripts/actuals-and-consensus/README.md`
