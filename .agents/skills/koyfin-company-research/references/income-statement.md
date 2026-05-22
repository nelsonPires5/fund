# Koyfin Income Statement tab

**Section:** Financial Analysis  
**Research use:** revenue, profit, expense, EPS and supplemental income statement line items.  
**Observed exploration ticker:** MSFT. Treat values as examples; scripts must work for other tickers and missing-data states.

## Research guide

Use this tab when the company question needs revenue, profit, expense, EPS and supplemental income statement line items. Start by confirming the active ticker and Koyfin internal security id in the URL. Then review the visible widgets/tables, switch period/toggle controls only when needed, and extract structured data with `@../scripts/income-statement/extract.js`.

## Extraction contract

- Run from the active Koyfin `Income Statement` page in an authenticated browser session.
- Save transient outputs and screenshots under `/tmp/<TICKER>/income-statement/`.
- Final structured rows must include `ticker`, `tab`, `extracted_at` and enough tab-specific context columns.
- Empty/no-coverage/no-data states must emit empty arrays or CSV headers plus an explicit status/error field.
- Prefer Koyfin network/API data when request and response bodies are captured safely; otherwise use DOM/SVG/table extraction documented here.

## Output schema observed

### CSV headers observed

`section`, `label`, `3Q FY2016`, `4Q FY2016`, `1Q FY2017`, `2Q FY2017`, `3Q FY2017`, `4Q FY2017`, `1Q FY2018`, `2Q FY2018`, `3Q FY2018`, `4Q FY2018`, `1Q FY2019`, `2Q FY2019`, `3Q FY2019`, `4Q FY2019`, `1Q FY2020`, `2Q FY2020`, `3Q FY2020`, `4Q FY2020`, `1Q FY2021`, `2Q FY2021`, `3Q FY2021`, `4Q FY2021`, `1Q FY2022`, `2Q FY2022`, `3Q FY2022`, `4Q FY2022`, `1Q FY2023`, `2Q FY2023`, `3Q FY2023`, `4Q FY2023`, `1Q FY2024`, `2Q FY2024`, `3Q FY2024`, `4Q FY2024`, `1Q FY2025`, `2Q FY2025`, `3Q FY2025`, `4Q FY2025`, `1Q FY2026`, `2Q FY2026`, `3Q FY2026`, `Current/LTM`
### JSON shape observed

```json
{
  "ticker": "str",
  "tab": "str",
  "extracted_at": "str",
  "url": "str",
  "columns": [
    "str"
  ],
  "sections": [
    {
      "section": "str",
      "rows": "list"
    }
  ]
}
```

## MSFT page summary

# MSFT Income Statement - Extraction Summary

## Status: ✅ Complete

## Artifacts
| File | Path | Description |
|------|------|-------------|
| raw-text.txt | /tmp/MSFT/income-statement/raw-text.txt | Full page innerText dump |
| sample-output.json | /tmp/MSFT/income-statement/sample-output.json | Structured JSON (9 sections, 55 rows, 42 columns) |
| sample-output.csv | /tmp/MSFT/income-statement/sample-output.csv | CSV export (same data) |
| extract.js | /tmp/MSFT/income-statement/extract.js | Reusable extraction script |
| extract_table.py | /tmp/MSFT/income-statement/extract_table.py | Python text parser (alternative) |
| data_inventory.md | /tmp/MSFT/income-statement/data_inventory.md | Data structure reference |
| network.md | /tmp/MSFT/income-statement/network.md | DOM selectors and navigation patterns |
| summary.md | /tmp/MSFT/income-statement/summary.md | This file |

## Extraction Method
- **Tool**: browser-harness (CDP via existing Chrome session)
- **Technique**: Direct DOM extraction from React-based div grid
- **Data path**: `.fa-table__root___cf3J4 > children[0] > children[1..9]` (sections)
- **Each row**: 1 sticky label cell + 42 data value cells

## Data Quality
- **Ticker**: MSFT (Microsoft Corporation)
- **Columns**: 44 headers, 42 data columns (41 quarters + Current/LTM)
- **Sections**: 9 financial groupings
- **Rows**: ~55 line items extracted
- **Missing values**: Handled via "-" placeholder
- **Negative values**: Preserved in parenthetical notation

## Observations
- Koyfin uses a custom React-based div grid, not HTML <table>
- CSS module class names change per build (hashed suffixes like ___VnXIn)
- The sticky left column contains row labels; data columns are right-scrollable
- Unit suffixes (B, M, %) are baked into cell textContent
- The page is SPA-based; URL changes reflect sub-tab navigation via UUIDs
- Session was already authenticated (MSFT loaded successfully)

## Confidence: High
Data verified against DOM cell textContent and raw innerText.
All sections accounted for. No data parsing errors detected.

## Blockers: None

## Data inventory and extraction patterns

# Data Inventory: Koyfin MSFT Income Statement

## Page
- **Ticker**: MSFT (Microsoft Corporation)
- **Tab**: Financial Analysis > Income Statement
- **URL**: https://app.koyfin.com/fa/00000000-3c6b-403d-8336-0c36676ca980/eq-kuqeq3
- **Title**: MSFT - Income Statement

## Table Structure
- **Format**: Custom div-based grid (no HTML <table>)
- **Columns**: 44 header cells (1 label + 1 group label + 42 data columns)
- **Data columns**: 42 (41 fiscal quarters from 3Q FY2016 to 3Q FY2026 + Current/LTM)
- **Sections**: 9 financial statement groupings
- **Rows**: ~55 line items across all sections

## Sections Detail

### 1. Revenues (6 rows)
- Total Revenues, Revenues (by segment), Finance Div. Revenues,
  Insurance Division Revenues, Other Revenues
- Units: Billions (B)

### 2. Gross Profit (3 rows)
- Cost Of Revenues, Gross Profit (Loss), YoY Growth %

### 3. Operating Income & Expenses (5 rows)
- Selling General & Admin Expenses, Research & Development,
  Depreciation & Amortization, Other Operating Expense,
  Operating Income (Loss)

### 4. Net Interest Expense (3 rows)
- Net Interest Expenses, Interest Income, Interest Expense

### 5. Earnings Before Taxes (EBT) (9 rows)
- Income (Loss) On Equity Affiliates, EBT Excl/Incl Unusual Items,
  various unusual charges (Restructuring, M&A, Impairment, etc.),
  total adjustments

### 6. Earnings from Operations | Net Income (7 rows)
- Income Tax Expense, Earnings From Continuing Operations,
  Minority Interest, Net Income (various presentations),
  Preferred Dividend Adjustments

### 7. Per Share Items (10 rows)
- Net EPS (Basic/Diluted), Weighted Avg Shares (Basic/Diluted),
  Normalized EPS (Basic/Diluted), Dividend Per Share, Payout Ratio

### 8. Supplemental Items (6 rows)
- Total Revenues (As Reported), EBITDA, EBITA, EBIT,
  Effective Tax Rate, Normalized Net Income

### 9. Supplemental Operating Expenses Items (6 rows)
- R&D Expense From Footnotes, D&A for EBITDA,
  Selling and Marketing Expenses, G&A Expenses,
  Stock-Based Compensation (2 rows)

## Data Characteristics
- **Values format**: Number + unit suffix (e.g., "20.5B", "3.05%", "0.48")
- **Negative values**: Wrapped in parentheses (e.g., "(0.1)B", "(6.3)B")
- **Missing data**: Shown as "-"
- **Scale**: B = billions, M = millions, % = percentage, x = multiplier
- **Currency**: USD
- **Fiscal period**: Quarterly (default view)
- **Date range**: 2016-2026 (10 years of data)

## Navigation
- **Sidebar**: Left nav panel with categorized links
- **Sub-tab switching**: Click tabs in `.fa-dashboard__faTabsWrapper___hDjs9`
- **Period toggle**: Buttons in `.fa-dashboard__faSettings___kNX77`

## Selected Filters
- Period: Quarterly (Q)
- Years: 2016-2026
- Unit: USD

## Network/API notes

# Network Analysis for Koyfin MSFT Income Statement

## Tab URL
https://app.koyfin.com/fa/00000000-3c6b-403d-8336-0c36676ca980/eq-kuqeq3

## Navigation Pattern
The Income Statement page is a single-page application (React) at Koyfin.
The URL pattern follows: `/fa/{dashboard-uuid}/eq-{ticker-id}`

## Sub-tab routing
Each Financial Analysis sub-tab has a unique dashboard UUID:
- Highlights: /fa/00000000-bc2f-4395-abce-161f8023d0c9/eq-kuqeq3
- Income Statement: /fa/00000000-3c6b-403d-8336-0c36676ca980/eq-kuqeq3
- Balance Sheet: /fa/00000000-6917-48b7-95f0-0d8b144e0f23/eq-kuqeq3
- Cash Flow: /fa/00000000-1c82-4912-88c6-8689b285ac75/eq-kuqeq3
- Multiples: /fa/00000000-2cfe-4f65-a319-b024e5955d01/eq-kuqeq3
- Enterprise Value: /fa/00000000-411f-4b3c-bca7-34398498da18/eq-kuqeq3
- Profitability: /fa/00000000-5e32-4dbc-a064-6b856f86cc2e/eq-kuqeq3
- ROIC: /fa/00000000-bb48-4dd4-8e0a-d2a5aadf83e6/eq-kuqeq3
- Solvency: /fa/00000000-ca5e-4441-95c7-9905b201c7af/eq-kuqeq3

## Data Source
The table is rendered client-side as React divs (no <table> element).
Data is loaded via XHR/fetch from Koyfin backend APIs and rendered into a
custom div-based table grid (fa-table component).

## Key Selectors
- Table container: `.fa-dashboard__faDashboard_tableContainer___TG3p9`
- Table root: `.fa-table__root___cf3J4`
- Navigation sidebar: `.navi-panel-layout__naviPanelLayout___mwQZ7`
- Tab bar: `.fa-dashboard__faTabsWrapper___hDjs9`
- Settings bar (period/unit): `.fa-dashboard__faSettings___kNX77`
- Sub-tab links under "Financial Analysis": `a[href*="/fa/"]`

## Settings / Controls
- Period toggle: "Last 12 Months (LTM)", "Quarterly (Q)", "Annual (Y)"
- Date range: shown as "2016 - 2026"
- Currency: "US Dollar (USD)"
- These controls are in `.fa-dashboard__settingButtons___LeXec` divs

## Data Structure
- Column headers (44): ['', 'Fiscal Quarters', '3Q FY2016', ..., 'Current/LTM']
  - header[0] = empty (row label column)
  - header[1] = 'Fiscal Quarters' (group header)
  - header[2..43] = 42 data columns (41 quarterly + Current/LTM)
- Sections (9): Revenues, Gross Profit, Operating Income & Expenses,
  Net Interest Expense, Earnings Before Taxes (EBT),
  Earnings from Operations | Net Income, Per Share Items,
  Supplemental Items, Supplemental Operating Expenses Items
- Total rows: ~55 financial line items

## Row Cell Structure
Each data row has 1 sticky label cell + 42 data value cells.
Cells use CSS class `fa-table__boldText___uLGCk fa-table__cellGrid___Tw8zP`
Data values include unit suffixes: B (billions), M (millions), % (ratios)
Empty cells show "-"

## Script and examples

- Extractor: `@../scripts/income-statement/extract.js`
- Script README: `@../scripts/income-statement/README.md`
