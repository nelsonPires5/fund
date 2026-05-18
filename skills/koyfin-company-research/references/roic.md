# Koyfin ROIC tab

**Section:** Financial Analysis  
**Research use:** ROIC formula, NOPAT, invested capital and component breakdown.  
**Observed exploration ticker:** MSFT. Treat values as examples; scripts must work for other tickers and missing-data states.

## Research guide

Use this tab when the company question needs ROIC formula, NOPAT, invested capital and component breakdown. Start by confirming the active ticker and Koyfin internal security id in the URL. Then review the visible widgets/tables, switch period/toggle controls only when needed, and extract structured data with `@../scripts/roic/extract.js`.

## Extraction contract

- Run from the active Koyfin `ROIC` page in an authenticated browser session.
- Save transient outputs and screenshots under `/tmp/<TICKER>/roic/`.
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
  "period_config": {
    "active_frequency": "str",
    "available_frequencies": [
      "str"
    ],
    "year_range": "str",
    "currency": "str",
    "column_headers": [
      "str"
    ]
  },
  "sections": [
    "str"
  ],
  "rows": [
    {
      "metric": "str",
      "values": "list"
    }
  ],
  "total_rows": "int",
  "status": "str"
}
```

## MSFT page summary

# MSFT ROIC - Koyfin Security Analysis Extraction

**Date:** 2026-05-17  
**Ticker:** MSFT (Microsoft Corporation)  
**Tab:** Security Analysis > Financial Analysis > ROIC  
**URL:** `https://app.koyfin.com/fa/00000000-bb48-4dd4-8e0a-d2a5aadf83e6/eq-kuqeq3`  

## Navigation Path

1. Started on existing Koyfin session at MSFT Profitability page
2. Clicked `ROIC` sub-tab in the Financial Analysis tab bar
3. URL updated to ROIC-specific UUID template ID
4. Page title changed from "MSFT - Profitability" to "MSFT - Financial Analysis"

## Extracted Data

The ROIC tab displays three collapsible sections:

### 1. Return on Invested Capital (ROIC) = NOPAT / Average Invested Capital
- **Net Operating Profit After Tax (NOPAT):** 22.1B → 119.7B (FY 2016 → Current/LTM)
- **Invested Capital, Average:** 121.0B → 527.0B (FY 2016 → Current/LTM)
- **Return on Invested Capital (ROIC):** 18.25% → 22.71% (FY 2016 → Current/LTM)

### 2. Net Operating Profit After Tax (NOPAT) breakdown
- **EBIT:** 27.2B → 149.0B
- **Income Tax Expense:** 5.1B → 29.3B
- **Net Operating Profit After Tax (NOPAT):** 22.1B → 119.7B

### 3. Average Invested Capital breakdown
- **Long Term Debt:** 40.6B → 31.4B
- **Short Term Debt:** 13.2B → 8.8B
- **Total Equity:** 72.0B → 414.4B
- **Current Portion of Leases:** 0.0B → 9.6B
- **Long Term Leases:** 0.8B → 75.6B
- **Invested Capital:** 126.5B → 539.8B
- **Invested Capital, Average:** 121.0B → 527.0B

## Period Configuration (at extraction time)
- Frequency: **Annual (Y)** (active)
- Date range: **2016 - 2026**
- Currency: **US Dollar (USD)**
- Last column: **Current/LTM**
- Also available: Last 12 Months (LTM), Quarterly (Q)

## Confidence Level
- **High** — Data extracted directly from rendered DOM via JS selectors
- Values verified against raw page text content
- All three ROIC sub-sections captured completely (11 periods + Current/LTM)
- No missing rows or partial data

## Blocker Notes
- Koyfin API endpoints (graph?schema=packed) require auth cookies; cannot fetch directly
- Auth-protected API responses not captured (401 without browser session cookies)
- All data obtained from rendered page DOM, which is more reliable for archival

## Data inventory and extraction patterns

# Data Inventory — MSFT ROIC (Koyfin)

## Page Metadata
| Field | Value |
|-------|-------|
| Source | Koyfin Security Analysis |
| Ticker | MSFT |
| Tab | ROIC (Financial Analysis > ROIC) |
| URL | `https://app.koyfin.com/fa/00000000-bb48-4dd4-8e0a-d2a5aadf83e6/eq-kuqeq3` |
| Page Title | MSFT - Financial Analysis |
| Extraction Timestamp | 2026-05-17T17:51:14Z |

## Period / Unit Configuration
- **Frequency selector:** Annual (Y) — active; also available: Last 12 Months (LTM), Quarterly (Q)
- **Date range display:** "2016 - 2026"
- **Currency:** US Dollar (USD)
- **Fiscal years shown:** FY 2016, FY 2017, FY 2018, FY 2019, FY 2020, FY 2021, FY 2022, FY 2023, FY 2024, FY 2025, Current/LTM

## Data Tables Extracted

### Section 1: Return on Invested Capital (ROIC) = NOPAT / Average Invested Capital
| Metric | FY 2016 | FY 2017 | FY 2018 | FY 2019 | FY 2020 | FY 2021 | FY 2022 | FY 2023 | FY 2024 | FY 2025 | Current/LTM |
|--------|---------|---------|---------|---------|---------|---------|---------|---------|---------|---------|-------------|
| Net Operating Profit After Tax (NOPAT) | 22.1B | 24.9B | 15.2B | 38.5B | 44.2B | 60.1B | 72.4B | 71.6B | 89.8B | 106.7B | 119.7B |
| Invested Capital, Average | 121.0B | 154.9B | 176.7B | 179.5B | 194.6B | 212.3B | 234.6B | 265.3B | 326.0B | 411.0B | 527.0B |
| Return on Invested Capital (ROIC) | 18.25% | 16.09% | 8.58% | 21.45% | 22.72% | 28.30% | 30.86% | 26.98% | 27.54% | 25.97% | 22.71% |

### Section 2: Net Operating Profit After Tax (NOPAT) — Breakdown
| Metric | FY 2016 | FY 2017 | FY 2018 | FY 2019 | FY 2020 | FY 2021 | FY 2022 | FY 2023 | FY 2024 | FY 2025 | Current/LTM |
|--------|---------|---------|---------|---------|---------|---------|---------|---------|---------|---------|-------------|
| EBIT | 27.2B | 29.3B | 35.1B | 43.0B | 53.0B | 69.9B | 83.4B | 88.5B | 109.4B | 128.5B | 149.0B |
| Income Tax Expense | 5.1B | 4.4B | 19.9B | 4.4B | 8.8B | 9.8B | 11.0B | 16.9B | 19.7B | 21.8B | 29.3B |
| Net Operating Profit After Tax (NOPAT) | 22.1B | 24.9B | 15.2B | 38.5B | 44.2B | 60.1B | 72.4B | 71.6B | 89.8B | 106.7B | 119.7B |

### Section 3: Average Invested Capital — Breakdown
| Metric | FY 2016 | FY 2017 | FY 2018 | FY 2019 | FY 2020 | FY 2021 | FY 2022 | FY 2023 | FY 2024 | FY 2025 | Current/LTM |
|--------|---------|---------|---------|---------|---------|---------|---------|---------|---------|---------|-------------|
| Long Term Debt | 40.6B | 76.1B | 72.2B | 66.7B | 59.6B | 50.1B | 47.0B | 42.0B | 42.7B | 40.2B | 31.4B |
| Short Term Debt | 13.2B | 10.1B | 4.0B | 5.5B | 3.7B | 8.1B | 2.7B | 5.2B | 8.9B | 3.0B | 8.8B |
| Total Equity | 72.0B | 87.7B | 82.7B | 102.3B | 118.3B | 142.0B | 166.5B | 206.2B | 268.5B | 343.5B | 414.4B |
| Current Portion of Leases | 0.0B | 1.5B | 1.6B | 1.8B | 2.2B | 2.8B | 3.3B | 3.6B | 5.9B | 8.6B | 9.6B |
| Long Term Leases | 0.8B | 7.8B | 9.7B | 12.4B | 16.6B | 21.4B | 25.3B | 28.6B | 40.3B | 60.4B | 75.6B |
| Invested Capital | 126.5B | 183.2B | 170.2B | 188.8B | 200.4B | 224.3B | 244.9B | 285.7B | 366.3B | 455.7B | 539.8B |
| Invested Capital, Average | 121.0B | 154.9B | 176.7B | 179.5B | 194.6B | 212.3B | 234.6B | 265.3B | 326.0B | 411.0B | 527.0B |

## CSS Selectors Used (durable patterns)
- Tab bar: `.koy-tab-item__koyTabItem` — all sub-tabs in Financial Analysis
- Active tab: `.koy-tab-item__koyTabItem.koy-tab-item__active`
- Table header row: `.fa-table__faTable__headerRow`
- Table header cells: `.fa-table__faTable__headerCell`
- Data rows: `.base-table-row__root.fa-table__faTable__row`
- Group headers (collapsible sections): `.lde-group-header-row__title`
- Sidebar nav items: `.navi-panel-list-item__naviPanelListItem`
- Main content region: `.base-container__main`

## Network API Endpoints Observed
| Endpoint | Type | Purpose |
|----------|------|---------|
| `/api/v3/users/fa/templates/{templateId}` | XHR | Page template/layout config (auth-protected) |
| `/api/v3p/data/fiscal-periods?financialPeriodType=annual&fromYear=2016&kid={kid}&toYear=2026` | XHR | Fiscal period list |
| `/api/v3p/data/graph?schema=packed` | XHR/Fetch | Actual financial data (multiple parallel calls, auth-protected) |
| `/api/v3/users/fa/user-settings` | XHR | User preferences |

## Network/API notes

# Network Patterns — Koyfin ROIC

## Observed API Endpoints

### 1. Template Configuration
```
GET /api/v3/users/fa/templates/{templateId}
```
- **templateId:** UUID (e.g., `00000000-bb48-4dd4-8e0a-d2a5aadf83e6` for ROIC)
- **Purpose:** Page layout, metric definitions, and section configuration
- **Auth:** Required (cookies)
- **Response size:** ~1.3KB

### 2. Fiscal Periods
```
GET /api/v3p/data/fiscal-periods?
    financialPeriodType=annual&fromYear=2016&kid={kid}&toYear=2026
```
- **kid:** Equity key ID (e.g., `eq-kuqeq3` for MSFT)
- **Purpose:** Defines the fiscal years available for display
- **Auth:** Required (cookies)
- **Response size:** ~600B

### 3. Graph Data (main data payload)
```
POST/GET /api/v3p/data/graph?schema=packed
```
- **Purpose:** The actual financial metric values. Multiple parallel calls are made for different metric groups.
- **Auth:** Required (cookies)
- **Response size:** ~450-520B each
- **Count:** ~10-20 parallel calls when loading the ROIC page
- **Schema:** `packed` (compressed format)

### 4. User Settings
```
GET /api/v3/users/fa/user-settings
```
- **Purpose:** User preferences (period, currency, theme)
- **Auth:** Required (cookies)
- **Response size:** ~550B

## Authentication
- All data APIs require session cookies (auth wall)
- Direct HTTP requests (without browser cookies) return 401
- Standard Koyfin session cookies include `__cf_bm`, `_session`, `_csrf`, etc.

## URL Structure for ROIC
```
https://app.koyfin.com/fa/{templateId}/eq-{equityKey}
```
- `{templateId}` changes per Financial Analysis sub-tab
- `{equityKey}` is the security identifier (e.g., `eq-kuqeq3` for MSFT)

## Tab Navigation Pattern (SPA)
- Koyfin uses React with client-side routing (`data-discover="true"` on links)
- Tab clicks update the URL without full page reload
- Each Financial Analysis sub-tab has a unique UUID template ID
- Template IDs map:
  - Profitability: `00000000-5e32-4dbc-a064-6b856f86cc2e`
  - ROIC: `00000000-bb48-4dd4-8e0a-d2a5aadf83e6`

## CSS Class Patterns (React CSS Modules)
- Tab bar: `.koy-tab-item__koyTabItem` with modifier classes for size, theme, active state
- Table: `.fa-table__faTable` with `.fa-table__faTable__headerCell` and `.fa-table__faTable__row`
- Collapsible sections: `.lde-group-header-row__title` with `.lde-group-header-row__chevron`
- Sidebar: `.navi-panel-list-item__naviPanelListItem` (active state has `.active` class)
- Main content: `.base-container__main`

## Script and examples

- Extractor: `@../scripts/roic/extract.js`
- Script README: `@../scripts/roic/README.md`
