# Koyfin Solvency tab

**Section:** Financial Analysis  
**Research use:** leverage, interest coverage, debt coverage and bankruptcy-risk metrics.  
**Observed exploration ticker:** MSFT. Treat values as examples; scripts must work for other tickers and missing-data states.

## Research guide

Use this tab when the company question needs leverage, interest coverage, debt coverage and bankruptcy-risk metrics. Start by confirming the active ticker and Koyfin internal security id in the URL. Then review the visible widgets/tables, switch period/toggle controls only when needed, and extract structured data with `@../scripts/solvency/extract.js`.

## Extraction contract

- Run from the active Koyfin `Solvency` page in an authenticated browser session.
- Save transient outputs and screenshots under `/tmp/<TICKER>/solvency/`.
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
  "period_type": "str",
  "date_range": "str",
  "currency": "str",
  "headers": [
    "str"
  ],
  "groups": [
    {
      "name": "str",
      "metrics": "list"
    }
  ],
  "missing_data_handling": "str"
}
```

## MSFT page summary

# Koyfin MSFT Solvency Tab — Summary

## Task Completed
Successfully navigated to MSFT Security Analysis > Financial Analysis > Solvency
and extracted all 13 solvency metrics across 4 metric groups for fiscal years
2016–2025 plus Current/LTM.

## Navigation Path
1. Existing session at `https://app.koyfin.com/fa/{uuid}/eq-kuqeq3` (MSFT Financial Analysis)
2. Scrolled down to reveal the "Solvency" tab in the Financial Analysis sub-nav
3. Clicked "Solvency" → URL changed (new UUID), title changed to "MSFT - Solvency"

## Data Overview
- **Period:** Annual (Y), 2016–2026
- **Currency:** US Dollar (USD)
- **13 metrics** across **4 groups**:
  - **Debt Analysis** (5): Leverage ratios — all declining (improving) trend
  - **Interest Rate Coverage** (3): Coverage ratios — strong, improving
  - **Debt Coverage** (4): Debt-to-EBITDA — strong, Net Debt metrics show '-' for early years
  - **Bankruptcy Risk** (1): Altman Z-Score — 9.28 (very safe, well above 3.0 threshold)

## Key Observations
- Microsoft's solvency profile has *improved* significantly over the decade:
  - Total Debt/Equity: 75.8% (FY2016) → 30.3% (Current/LTM)
  - Total Debt/EBITDA: 1.6x → 0.7x
  - Altman Z-Score: 3.43 → 9.28
- Net Debt metrics are "-" for earlier years because MSFT held more cash than debt
- All metrics have Current/LTM values — no data gaps in the trailing period

## Artifacts Saved
| File | Description |
|------|-------------|
| `/tmp/MSFT/solvency/summary.md` | This file — task summary |
| `/tmp/MSFT/solvency/data_inventory.md` | Complete data inventory with selectors |
| `/tmp/MSFT/solvency/extract.js` | Console-pasteable extraction script |
| `/tmp/MSFT/solvency/sample-output.json` | Structured JSON with all metrics |
| `/tmp/MSFT/solvency/network.md` | Network architecture notes |
| `/tmp/MSFT/solvency/network-sample.json` | Network pattern documentation |
| `/tmp/MSFT/solvency/solvency_page.png` | Screenshot of the page |
| `/tmp/MSFT/solvency/initial.png` | Screenshot before clicking Solvency |

## Durable Patterns
- **Tab navigation**: Click text "Solvency" in the Financial Analysis sub-nav sidebar
- **URL pattern**: `/fa/{session-uuid}/{ticker-uid}` where ticker-uid is `eq-{base64}`
- **Table selector**: `[class*="fa-table__root"]` for the main table container
- **Row selector**: `[class*="base-table-row__root"]` for data rows
- **Data delivery**: WebSocket (`wss://app.koyfin.com/ws`), not REST
- **Missing data**: Represented as '-' in the DOM
- **Ticker extraction**: Regex `SECURITY ANALYSIS\s+([A-Z]+)` from body text

## Limitations / Blockers
- ❌ No direct REST API for solvency data — data flows through WebSocket only
- ❌ CSS module classes (e.g., `___VnXIn`) have random suffixes that change per build
- ⚠️ CSS-module partial selectors (`[class*="base-table-row__root"]`) are stable
- ⚠️ Screenshot could not be directly viewed (model limitation) but was captured
- ✅ No authentication barriers encountered — session was pre-authenticated
- ✅ No iframes or shadow DOM involved in the Solvency table

## Data inventory and extraction patterns

# Data Inventory — Koyfin MSFT Solvency Tab

## Source
**Page:** Koyfin Security Analysis > Financial Analysis > Solvency (FA.SOLV)
**Ticker:** MSFT (Microsoft Corporation)
**URL:** `https://app.koyfin.com/fa/{session-uuid}/eq-kuqeq3`
**View:** Annual (Y) | 2016-2026 | USD

## Table Structure
- **Rows:** 13 individual metrics across 4 groups
- **Columns:** 12 (Fiscal Years + FY 2016–FY 2025 + Current/LTM)
- **Period toggle:** LTM · Q · Y (currently Annual)
- **Date range:** 2016–2026 (11 fiscal periods)

## Metric Groups & Data Types

### 1. Debt Analysis (5 metrics)
| Metric | Format | FY2016 Range | Current/LTM |
|--------|--------|------|------|
| Total Debt / Equity | % | 75.8% → 30.3% | Improving |
| Total Debt / Capital | % | 43.1% → 23.2% | Improving |
| Long-Term Debt / Equity | % | 57.4% → 25.8% | Improving |
| Long-Term Debt / Capital | % | 32.7% → 19.8% | Improving |
| Total Liabilities / Total Assets | % | 62.8% → 40.3% | Improving |

### 2. Interest Rate Coverage (3 metrics)
| Metric | Format | FY2016 Range | Current/LTM |
|--------|--------|------|------|
| EBIT / Interest Expense | x (ratio) | 21.9x → 52.1x | Stable/Strong |
| EBITDA / Interest Expense | x (ratio) | 26.6x → 66.9x | Strong |
| (EBITDA - Capex) / Interest Expense | x (ratio) | 19.9x → 32.9x | Strong |

### 3. Debt Coverage (4 metrics)
| Metric | Format | Notes |
|--------|--------|-------|
| Total Debt / EBITDA | x (ratio) | 1.6x → 0.7x (improving) |
| Net Debt / EBITDA | x (ratio) | '-' for FY2016-FY2023 (negative net debt = cash > debt). 0.2x in Current/LTM |
| Total Debt / (EBITDA - Capex) | x (ratio) | 2.2x → 1.3x (improving) |
| Net Debt / (EBITDA - Capex) | x (ratio) | '-' for FY2016-FY2023. 0.5x Current/LTM |

### 4. Bankruptcy Risk (1 metric)
| Metric | Format | Range |
|--------|--------|-------|
| Altman Z-Score | numeric score | 3.43 → 9.28 (well above 3.0 = safe zone) |

## Data Completeness
- **13/13 metrics populated** — no missing rows
- **Net Debt metrics**: Earlier years show '-' because Microsoft had negative net debt
  (cash and equivalents exceeded total debt). This is a data presentation choice — the
  metric is undefined for those periods, not missing.
- **Current/LTM column**: All 13 metrics have values for the trailing period.

## Format Conventions
- Percentages: `XX.X%` (e.g., `75.8%`)
- Ratios: `XX.Xx` (e.g., `21.9x`)
- Altman Z-Score: plain number (e.g., `3.43`)
- Missing/undefined: `-` (single hyphen)

## Durable Selectors (CSS Module Pattern)
```
Table container:    .fa-table__root___cf3J4 / [class*="fa-table__root"]
Header row:         .fa-table__faTable__headerRow___vnpnW
Header cells:       .fa-table__faTable__headerCell___fOCXJ
Group headers:      .lde-data-table-group__groupHeader___FCgs3
Data rows:          .base-table-row__root___VnXIn / [class*="base-table-row__root"]
Row labels:         .default-cell__label___x4_Ck / [class*="default-cell__label"]
Data cells:         .fa-table__defaultCell___pMeHy / [class*="fa-table__defaultCell"]
Sticky left column: .base-table-row__leftStickyCells___FC74g
```

## Toggle Locations
- Period toggle: Top-right of the content area (LTM · Q · Y buttons)
- Date range: Below period toggle, above the table
- Currency: Next to date range
- Settings gear icon: Below the tabs on the right side

## Notes for Automation
1. **Click target**: "Solvency" text in the Financial Analysis sub-nav sidebar
2. **State change**: URL UUID changes, document title becomes "MSFT - Solvency"
3. **Render wait**: ~1-2 seconds after click for table to fully render
4. **Negative net debt**: When checking for missing data, distinguish '-' values
   in Net Debt metrics (which are expected) from truly missing rows

## Network/API notes

# Koyfin Solvency Tab — Network Analysis

## Overview
Koyfin is a React SPA that loads financial data via backend API calls. The Solvency
tab (FA.SOLV) under Financial Analysis fetches data dynamically when selected.

## Key URLs

### WebSocket (main data channel)
- URL: `wss://app.koyfin.com/ws` — Persistent WebSocket connection for real-time data.
  Koyfin uses a custom protocol over WebSocket for most data delivery.

### REST-like patterns (observed)
- Base API: `https://app.koyfin.com/api/` (inferred from network activity)
- Tab routing pattern: `/fa/{uuid}/{ticker-uid}` where:
  - `fa` = Financial Analysis section
  - `{uuid}` = session-specific route UUID (changes on tab switch)
  - `{ticker-uid}` = `eq-{ticker-uid}` format (stable per ticker)

### Tab Activation Pattern
- The Solvency tab is activated by clicking the navigation item labeled "Solvency"
  in the sidebar/sub-nav under Financial Analysis.
- Tab click triggers a client-side route change: the UUID in the URL path changes.
- No full page reload — React handles routing.
- Title changes to "MSFT - Solvency" from "MSFT - Financial Analysis".

## Data Fetching
The actual financial data (Debt Analysis, Interest Rate Coverage, Debt Coverage,
Bankruptcy Risk) is delivered via the WebSocket connection. The React app:
1. Opens WebSocket on initial page load
2. Sends subscription messages for specific data series when a tab is selected
3. Receives JSON payloads with the financial data
4. Renders into the custom table component

## Data Structure (from DOM observation)
- Header row: 12 columns (Fiscal Years + FY 2016 through FY 2025 + Current/LTM)
- 4 metric groups: Debt Analysis, Interest Rate Coverage, Debt Coverage, Bankruptcy Risk
- 13 individual metrics total
- Values are formatted with % or x suffixes (no raw numbers in the DOM)

## Toggle/Filter Controls
- Period: Last 12 Months (LTM), Quarterly (Q), Annual (Y) — toggle buttons at top
- Date range: 2016 - 2026 (shown above the table)
- Currency: US Dollar (USD) — display currency selector
- Fiscal Years view selected (not quarters or LTM)

## Relevant CDP Approach
For programmatic access without a browser:
1. Navigate to `https://app.koyfin.com/fa/{UUID}/{ticker-id}` where ticker-id = `eq-{base64-id}`
2. Click the "Solvency" navigation item (text match)
3. Wait for React rendering
4. Extract from DOM using the selectors documented in extract.js

## Cross-origin Considerations
No cross-origin iframes — the data table is rendered in the main document.
No shadow DOM involved.

## API Authentication
Cookie-based auth (HttpOnly cookies observed). Direct API access would require
session cookies from the browser.

## Script and examples

- Extractor: `@../scripts/solvency/extract.js`
- Script README: `@../scripts/solvency/README.md`
