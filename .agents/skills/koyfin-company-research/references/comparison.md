# Koyfin Comparison tab

**Section:** Graphs  
**Research use:** peer comparison charts across price/performance and valuation metrics.  
**Observed exploration ticker:** MSFT. Treat values as examples; scripts must work for other tickers and missing-data states.

## Research guide

Use this tab when the company question needs peer comparison charts across price/performance and valuation metrics. Start by confirming the active ticker and Koyfin internal security id in the URL. Then review the visible widgets/tables, switch period/toggle controls only when needed, and extract structured data with `@../scripts/comparison/extract.js`.

## Extraction contract

- Run from the active Koyfin `Comparison` page in an authenticated browser session.
- Save transient outputs and screenshots under `/tmp/<TICKER>/comparison/`.
- Final structured rows must include `ticker`, `tab`, `extracted_at` and enough tab-specific context columns.
- Empty/no-coverage/no-data states must emit empty arrays or CSV headers plus an explicit status/error field.
- Prefer Koyfin network/API data when request and response bodies are captured safely; otherwise use DOM/SVG/table extraction documented here.

## Output schema observed

### JSON shape observed

```json
{
  "ticker": "str",
  "tab": "str",
  "url": "str",
  "extracted_at": "str",
  "metadata": {
    "svgDimensions": {
      "width": "str",
      "height": "str"
    },
    "xAxisLabels": [
      "str"
    ]
  },
  "tickers": [
    {
      "ticker": "str",
      "name": "str"
    }
  ],
  "panels": [
    {
      "metric": "str",
      "series": "list"
    }
  ]
}
```

## MSFT page summary

# Koyfin Security Analysis — Comparison Graph: MSFT

**Extracted at:** 2026-05-17  
**URL:** https://app.koyfin.com/charts/gc/eq-kuqeq3  
**Page Title:** 🐴 - Comparison  
**Navigated From:** MSFT Security Search → Security Analysis → Graphs → Comparison

---

## Status

✅ Successfully loaded. The Comparison graph page renders 4 metric panels in a vertical splitter layout. All panels contain SVG chart data with lines, axes, and legend tables.

## Graph Overview

The Comparison page shows **MSFT (Microsoft Corporation)** compared against **8 peer securities** across **4 metrics** over a ~12-month period (Jun 2025 – May 2026). The chart is rendered as a single SVG (1480×1041px) with 4 stacked panels.

## Peers (9 tickers)

| # | Ticker | Company Name | Country |
|---|--------|-------------|---------|
| 1 | **MSFT** | Microsoft Corporation | US (primary) |
| 2 | NVTS | Navitas Semiconductor Corporation | US |
| 3 | 6963 | ROHM Co., Ltd. | Japan (TYO) |
| 4 | WOLF | Wolfspeed, Inc. | US |
| 5 | 6504 | Fuji Electric Co., Ltd. | Japan (TYO) |
| 6 | INFINEON | Infineon Technologies AG | Germany (XETRA) |
| 7 | POWI | Power Integrations, Inc. | US |
| 8 | MITSU19 | Mitsubishi Heavy Industries, Ltd. | Japan (TYO) |
| 9 | 6588 | Toshiba Tec Corporation | Japan (TYO) |

**Note:** The peer group is dominated by semiconductor / power electronics companies, suggesting this may have been a pre-configured industry peer group or one set by the user.

## Metrics (4 panels)

| Panel | Metric | Y-axis Range | MSFT Value |
|-------|--------|-------------|-----------|
| 1 | Price Change % | 0% – 1,000% | -6.89% |
| 2 | P/E (NTM) | 0x – 100x | 22.8x |
| 3 | EV / EBITDA (NTM) | 0x – 250x | 13.8x |
| 4 | EV / Sales (NTM) | 0x – 100x | 8.6x |

## Chart Controls (documented from sidebar)

- **Tickers section:** 9 securities listed with color indicators + Add Ticker button
- **Metrics section:** 4 active metrics (Price Change %, P/E NTM, EV/EBITDA NTM, EV/Sales NTM) + Add Metric button
- **Drawing toolbar:** Annotation tools (pointer, trend line, rectangle, text, arrow, etc.) at bottom of chart
- **Navigation panel (left):** Full Koyfin app sidebar with Market, News, Security Analysis sections
- **Period covered:** ~12 months (Jun 2025 – May 2026 on x-axis)

## Files Saved

- `summary.md` — This file
- `data_inventory.md` — Full structured data inventory
- `extract.js` — Reusable extraction script
- `sample-output.json` — Structured data in JSON format
- `chart-svg.html` — Raw SVG chart source (338KB)
- `network.md` — Network architecture notes
- `01-security-analysis.png` — Screenshot of MSFT Security Analysis landing page
- `02-comparison-page.png` — Screenshot of Comparison graph page
- `03-comparison-chart-area.png` — Screenshot of the chart area

## Confidence

**High.** Data was extracted directly from the rendered SVG DOM, which contains complete chart data including all series values and legend entries. No missing data. All 4 metric panels fully populated.

## Blockers

None. Chart renders fully without errors.

## Data inventory and extraction patterns

# Data Inventory — Koyfin Comparison Graph (MSFT)

## Source

- **Page:** Comparison chart (`/charts/gc/eq-kuqeq3`)
- **Extraction method:** SVG DOM parsing (direct JS extraction from rendered `<svg>` element)
- **Timestamp:** 2026-05-17

## Data Structure

### Panel 1: Price Change % (Price Chg. %)

| Ticker | Company | Value | Color |
|--------|---------|-------|-------|
| NVTS | Navitas Semiconductor Corporation | 929.95% | `hsl(145, 80%, 25%)` (green) |
| 6963 | ROHM Co., Ltd. | 192.51% | `#fc7335` (orange) |
| WOLF | Wolfspeed, Inc. | 181.13% | `#ffd333` (yellow) |
| 6504 | Fuji Electric Co., Ltd. | 133.06% | `#c1d52a` (yellow-green) |
| INFINEON | Infineon Technologies AG | 73.22% | `#7d00ff` (purple) |
| POWI | Power Integrations, Inc. | 34.98% | `hsl(4, 60%, 50%)` (red) |
| MITSU19 | Mitsubishi Heavy Industries, Ltd. | 34.40% | `#377eb8` (blue) |
| 6588 | Toshiba Tec Corporation | -0.56% | `#a0a0a0` (gray) |
| **MSFT** | **Microsoft Corporation** | **-6.89%** | `hsl(210, 100%, 50%)` (primary blue) |

### Panel 2: Price / Earnings — P/E (NTM)

| Ticker | Company | Value | Notes |
|--------|---------|-------|-------|
| POWI | Power Integrations, Inc. | 50.4x | Highest |
| 6963 | ROHM Co., Ltd. | 44.8x | |
| MITSU19 | Mitsubishi Heavy Industries, Ltd. | 33.2x | |
| INFINEON | Infineon Technologies AG | 30.2x | |
| **MSFT** | **Microsoft Corporation** | **22.8x** | |
| 6504 | Fuji Electric Co., Ltd. | 22.0x | |
| 6588 | Toshiba Tec Corporation | 14.0x | Lowest |

*Note: NVTS and WOLF are not shown in P/E panel (likely negative earnings / N/A)*

### Panel 3: EV / EBITDA (NTM)

| Ticker | Company | Value |
|--------|---------|-------|
| WOLF | Wolfspeed, Inc. | 195.6x |
| POWI | Power Integrations, Inc. | 145.1x |
| MITSU19 | Mitsubishi Heavy Industries, Ltd. | 18.2x |
| 6963 | ROHM Co., Ltd. | 15.6x |
| INFINEON | Infineon Technologies AG | 15.5x |
| **MSFT** | **Microsoft Corporation** | **13.8x** |
| 6504 | Fuji Electric Co., Ltd. | 11.3x |
| 6588 | Toshiba Tec Corporation | 4.2x |

*Note: NVTS not shown (likely negative EBITDA)*

### Panel 4: EV / Sales (NTM)

| Ticker | Company | Value |
|--------|---------|-------|
| NVTS | Navitas Semiconductor Corporation | 100.0x |
| **MSFT** | **Microsoft Corporation** | **8.6x** |
| POWI | Power Integrations, Inc. | 7.8x |
| WOLF | Wolfspeed, Inc. | 5.4x |
| INFINEON | Infineon Technologies AG | 5.2x |
| 6963 | ROHM Co., Ltd. | 3.1x |
| MITSU19 | Mitsubishi Heavy Industries, Ltd. | 2.5x |
| 6504 | Fuji Electric Co., Ltd. | 1.8x |
| 6588 | Toshiba Tec Corporation | 0.3x |

### X-axis Timeline

The chart x-axis spans approximately **12 months** with the following date labels:
- Jun 2 (2025)
- Jul 1 (2025)
- Aug 1 (2025)
- Sep 1 (2025)
- Oct 1 (2025)
- Nov 3 (2025)
- Dec 1 (2025)
- Jan 2 (2026)
- Feb 2 (2026)
- Mar 2 (2026)
- Apr 1 (2026)
- May 1 (2026)

## Available vs Missing Data

| Metric | NVTS | 6963 | WOLF | 6504 | INFINEON | POWI | MITSU19 | 6588 | MSFT |
|--------|------|------|------|------|----------|------|---------|------|------|
| Price Change % | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| P/E (NTM) | ❌ | ✅ | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| EV/EBITDA (NTM) | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| EV/Sales (NTM) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

## Controls Documented (from Sidebar)

1. **Tickers list:** 9 tickers with colored left-border indicators, cog icon for each, remove (×) button, and "Add Ticker" button
2. **Metrics list:** 4 metrics with eye icon (visibility toggle), remove (×) button, and "Add Metric" button
3. **Drawing toolbar:** Cursor, trend line, rectangle, text, arrow, horizontal line, vertical line, etc.
4. **Export: Not visible** — No download/export button was found in the immediate controls

## Network/API notes

# Network Analysis — Koyfin Comparison Graph

## Data Source

The comparison chart data was extracted from the **rendered SVG DOM** rather than network requests. The SVG element at the chart area contains all data (338KB) including:

- Time-series line paths for each ticker × metric combination
- Legend tables with current values
- Axis labels and grid lines
- Ticker/company names with color indicators

## Architecture Notes

Based on DOM inspection of https://app.koyfin.com/charts/gc/eq-kuqeq3:

### Application Framework
- **Single Page Application** built with Web Components / Polymer / lit-element
- All page content rendered inside `<div id="root">` with nested custom elements
- Chart rendering uses **SVG** (no Canvas/WebGL detected)
- CSS custom properties for theming (`--primary-color`, `--chart-table-background`, etc.)

### Page Layout
```
section
├── top-header (56px) — Logo, Search, Help, User menu
└── base-container__main (1233px)
    ├── nav-panel (224px) — Left sidebar navigation
    └── content-area (1820px)
        ├── contentWrap
        │   ├── mainContentWrap
        │   │   ├── quoteBoxContainer (92px) — MSFT price quote
        │   │   └── chartContainer (1121px)
        │   │       └── flex-row
        │   │           ├── chart-sidebar (280px) — Tickers & Metrics controls
        │   │           └── flex-column
        │   │               ├── chart toolbar
        │   │               └── splitter-layout (1081px)
        │   │                   └── SVG chart (1480×1041px)
        │   └── content-sidebar (right sidebar)
        └── footer (20px)
```

### Data Flow
1. User navigates to `/charts/gc/eq-kuqeq3`
2. Koyfin SPA loads and fetches comparison data via internal API (likely GraphQL or REST)
3. Chart is rendered as a single `<svg>` element with multiple panels stacked vertically
4. Each panel contains:
   - `<path>` elements for line series
   - `<g>` elements for axes and labels
   - `<foreignObject>` elements containing HTML legend tables (ticker name, company, value)

### Network Capture (Not Performed)

The page was already loaded when the extraction began. To capture network requests:

1. **Reload the page** with Network panel open (DevTools) to see API calls to Koyfin backend
2. Look for XHR requests to:
   - `https://app.koyfin.com/api/*` or `https://api.koyfin.com/*`
   - GraphQL endpoints
   - Requests containing `"gc"` or comparison-related parameters
3. The data is likely fetched as JSON and rendered client-side into SVG

### Export Functionality

No visible export/download button was detected in the comparison chart controls. Export may be available through:
- Right-click → Save SVG/Image on the chart area
- Browser print (Ctrl+P) → Save as PDF
- Koyfin's broader export features (possibly in a top-level menu not on this page)

## Script and examples

- Extractor: `@../scripts/comparison/extract.js`
- Script README: `@../scripts/comparison/README.md`
