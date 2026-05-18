# Koyfin Earnings History tab

**Section:** Snapshots  
**Research use:** reported revenue versus estimates, surprises, price reactions, valuation at report dates.  
**Observed exploration ticker:** MSFT. Treat values as examples; scripts must work for other tickers and missing-data states.

## Research guide

Use this tab when the company question needs reported revenue versus estimates, surprises, price reactions, valuation at report dates. Start by confirming the active ticker and Koyfin internal security id in the URL. Then review the visible widgets/tables, switch period/toggle controls only when needed, and extract structured data with `@../scripts/earnings-history/extract.js`.

## Extraction contract

- Run from the active Koyfin `Earnings History` page in an authenticated browser session.
- Save transient outputs and screenshots under `/tmp/<TICKER>/earnings-history/`.
- Final structured rows must include `ticker`, `tab`, `extracted_at` and enough tab-specific context columns.
- Empty/no-coverage/no-data states must emit empty arrays or CSV headers plus an explicit status/error field.
- Prefer Koyfin network/API data when request and response bodies are captured safely; otherwise use DOM/SVG/table extraction documented here.

## Output schema observed

### CSV headers observed

`Fiscal Period`, `Period Ending`, `Report Date`, `Est Low Sales`, `Est High Sales`, `Est Avg Sales`, `Actual Sales`, `Sales Surprise`, `Surprise (%)`, `1D Price Reaction(%)`, `TTM`, `EV/Sales`, `Year Group`
### JSON shape observed

```json
{
  "ticker": "str",
  "url": "str",
  "extractedAt": "str",
  "tab": "str",
  "headers": [
    "str"
  ],
  "rowCount": "int",
  "rows": [
    {
      "Fiscal Period": "str",
      "Period Ending": "str",
      "Report Date": "str",
      "Est Low Sales": "str",
      "Est High Sales": "str",
      "Est Avg Sales": "str",
      "Actual Sales": "str",
      "Sales Surprise": "str",
      "Surprise (%)": "str",
      "1D Price Reaction(%)": "str",
      "TTM": "str",
      "EV/Sales": "str"
    }
  ]
}
```

## MSFT page summary

# Koyfin Earnings History — MSFT

## Overview

Successfully navigated to Koyfin's Security Analysis > Earnings History tab for MSFT (Microsoft Corporation). The page displays quarterly earnings results vs analyst estimates in two panels:

1. **Earnings Results vs Analyst Estimates** — Chart (bar chart with actual vs estimate, plus surprise % line)
2. **Earnings History & Surprises** — Data table with 20 rows (18 quarters + 2 partial)

## Navigation Path

**Starting URL:** `https://app.koyfin.com/snapshot/own/insider-transactions/eq-kuqeq3`
(MSFT - Ownership tab, already logged into Koyfin)

**Clicked:** Sidebar navigation item "Earnings History" (under Security Analysis > Overviews section)

**Current URL:** `https://app.koyfin.com/snapshot/earn/eq-kuqeq3`

**Ticker slug:** `eq-kuqeq3` (Koyfin internal ID for MSFT)

## Data Schema

The table has 12 columns:

| Column | Description |
|--------|-------------|
| Fiscal Period | MSFT fiscal quarter label (e.g. "3Q 2026") |
| Period Ending | Quarter end date (MM-DD-YYYY) |
| Report Date | Earnings report date (MM-DD-YYYY) |
| Est Low Sales | Lowest analyst sales estimate |
| Est High Sales | Highest analyst sales estimate |
| Est Avg Sales | Consensus average sales estimate |
| Actual Sales | Reported actual sales |
| Sales Surprise | Beat/Miss amount with direction |
| Surprise (%) | Surprise percentage |
| 1D Price Reaction(%) | 1-day stock price change after report |
| TTM | Trailing Twelve Months revenue |
| EV/Sales | Enterprise Value / Sales multiple |

## Time Range

- **Earliest:** 4Q 2021 (period ending 06-30-2021, reported 07-27-2021) — Sales: $46.15B
- **Latest:** 3Q 2026 (period ending 03-31-2026, reported 04-29-2026) — Sales: $82.89B
- **Total:** 20 data rows across 6 calendar years (CY 2021–CY 2026)

## Key Observations

- **Revenue trend:** Steady growth from ~$46B (Q4 2021) to ~$83B (Q3 2026)
- **Beat rate:** 18 out of 20 quarters beat estimates (90% beat rate)
- **Misses:** 2 quarters missed (2Q 2023 by -0.77%, 4Q 2022 by -0.94%)
- **Largest beat:** 4Q 2021 at $1.85B (4.18%)
- **Largest miss:** 4Q 2022 at $-493.37M (-0.94%)
- **Average surprise:** ~2.1%
- **TTM revenue:** $318.27B (as of Q3 2026)
- **EV/Sales range:** 8.7x–13.8x

## Artifacts

| Artifact | Description |
|----------|-------------|
| `summary.md` | This file |
| `data_inventory.md` | Detailed data inventory |
| `extract.js` | Reusable JS extraction script |
| `sample-output.json` | Full extracted data (20 rows) |
| `sample-output.csv` | CSV version of extracted data |
| `network.md` | Network request analysis |
| `network-sample.json` | Sample API request payload |
| `01-initial-state.png` | Screenshot of initial Ownership page |
| `02-page-layout.png` | Screenshot of full page layout |
| `03-earnings-history.png` | Screenshot of Earnings History page |

## Data inventory and extraction patterns

# Data Inventory — MSFT Earnings History

## Source

- **Site:** Koyfin (app.koyfin.com)
- **Tab:** Security Analysis > Earnings History (earn)
- **URL:** `https://app.koyfin.com/snapshot/earn/eq-kuqeq3`
- **Ticker:** MSFT (Microsoft Corporation)
- **Extraction Date:** 2026-05-17

## Data Sets

### 1. Earnings Results vs Analyst Estimates Chart (Top Panel)

Interactive bar chart with two metrics:
- Sales Actual vs Estimate bars (grouped per quarter)
- Surprise (%) line overlay

**Timeframe options:** 1y, 3y, 5y, 10y, 20y, All (currently showing "All" = ~5 years)

**Metric selector:** Sales (dropdown with other metrics available)

**Currency:** USD

**x-axis labels:** Jul 2021 through Apr 2026 (quarterly)

**Legend:**
- "Sales Actual vs Estimate" — current quarter tooltip: `$82.89B vs $81.43B beat by $1.46B (1.8%)`
- "Sales Actual vs Estimate Surprise (%)" — current tooltip: `1.79%`

### 2. Earnings History & Surprises Table (Bottom Panel)

Full quarterly earnings data table.

**Visible rows (viewable without scrolling):** First 8 rows (CY 2026 Q3 through CY 2024 Q1)

**Total rows (scrollable):** 20 rows across 6 years

**Columns (12 total):**

| # | Column | Example | Data Type | Notes |
|---|--------|---------|-----------|-------|
| 1 | Fiscal Period | "3Q 2026" | string | MSFT fiscal quarter label |
| 2 | Period Ending | "03-31-2026" | date (MM-DD-YYYY) | Quarter end date |
| 3 | Report Date | "04-29-2026" | date (MM-DD-YYYY) | Earnings announcement date |
| 4 | Est Low Sales | "$81.00B" | currency string | Lowest analyst estimate |
| 5 | Est High Sales | "$82.47B" | currency string | Highest analyst estimate |
| 6 | Est Avg Sales | "$81.43B" | currency string | Consensus estimate |
| 7 | Actual Sales | "$82.89B" | currency string | Reported actual |
| 8 | Sales Surprise | "Beat by $1.46B" | string | Direction + amount |
| 9 | Surprise (%) | "1.79%" | percentage string | Surprise as percentage |
| 10 | 1D Price Reaction(%) | "-3.93%" | percentage string | Stock price reaction |
| 11 | TTM | "$318.27B" | currency string | Trailing 12 months revenue |
| 12 | EV/Sales | "10.1x" | multiple string | Enterprise value / sales |

**Grouping:** By calendar year (CY 2026, CY 2025, ..., CY 2021)

**Row count by year:**
| Year | Rows |
|------|------|
| CY 2026 | 2 (Q2, Q3) |
| CY 2025 | 4 (Q1–Q4) |
| CY 2024 | 4 (Q1–Q4) |
| CY 2023 | 4 (Q1–Q4) |
| CY 2022 | 4 (Q1–Q4) |
| CY 2021 | 2 (Q4 only, 1Q starts CY 2021 but is labeled...) |

**Data quality:**
- All 20 rows have complete data (no nulls/missing)
- Sales values consistently formatted with $ sign and B/M suffix
- All surprises present (18 beats, 2 misses)
- All price reactions present (both positive and negative)
- All TTM values present
- All EV/Sales multiples present

### 3. Key Metrics (Quote Box Header)

Visible above the chart:
- Current Price: $421.92 (+3.05%)
- After Market: $419.71 (-0.52%)
- Next Earnings Date: Thu Jul 30th 2026 (After-Market)
- Sector: Information Technology
- Industry: Software
- Market Cap: $3,134.21B
- Forward P/E: 22.8x
- Volume: 50,771,100
- Total Return (3M): 5.37%
- Total Return (1Y): -6.35%

### 4. Page Structure (DOM)

**Key CSS classes (durable patterns):**
- `koy__scrollContainer` — Table scrollable container
- `headerCell` — Column header cells
- `table_cell` — Data cells
- `lde-data-table-group__groupHeader` — Year group headers
- `base-table-row__root` — Data rows
- `quote-box__securityName` — Ticker/company name
- `earnings-surprise-chart-table` — Table panel wrapper

## Missing / Not Extracted

- EPS (Earnings Per Share) data — the metric dropdown may offer EPS values but we captured only Sales
- Pre-2021 data — may be available with "All" timeframe or by scrolling
- Raw API JSON — Koyfin uses `api/v3p/data/graph?schema=packed` endpoint with packed binary format
- Chart SVG/pixel data — not extracted, only table data captured

## Network/API notes

# Network Analysis — MSFT Earnings History

## Data Loading Mechanism

Koyfin is a Single Page Application (React-based). The Earnings History tab data is loaded dynamically via XHR/fetch requests to Koyfin's internal API.

## Key API Endpoints

### Primary Data Endpoint

**`POST https://app.koyfin.com/api/v3p/data/graph?schema=packed`**

This is the main data API that serves chart and table data. Multiple calls are made for different data slices:
- Response sizes: ~4.6KB to ~65KB
- Request/response uses a packed binary schema format (not standard JSON)
- Sent multiple times as the page loads different widgets

### Other Relevant Endpoints

| Endpoint | Purpose | Response Size |
|----------|---------|---------------|
| `/api/v3/data/keys` | Data key definitions (field metadata) | ~18.9KB |
| `/api/v3p/data/vocabularies/holidays` | Trading calendar data | ~0.6KB |
| `/api/v1/table-views-service/view?featureType=tab-*` | Table view settings per tab | ~0.9KB |
| `/api/v1/table-views-service/settings?featureType=tab-*` | Table view user preferences | ~0.4KB |
| `/api/v3p/data/keys` | Additional data key lookups | multiple calls ~0.5-1KB |
| `/api/v3/users/settings` | User preferences | ~2.8KB |
| `/api/v3/users/watchlists` | Watchlist data | ~1.2KB |

### Authentication / Session

- Session appears to be cookie-based (no visible auth tokens in URL params)
- All `/api/*` calls include session cookies

## Data Format

The `/api/v3p/data/graph?schema=packed` endpoint uses Koyfin's proprietary packed binary format. This is:
- Not human-readable as-is
- Parsed client-side by Koyfin's JavaScript bundle
- Likely uses protocol buffers or a custom binary encoding

For data extraction purposes, **DOM scraping is more practical** than API reverse-engineering.

## Caching

- Performance API shows no Service Worker caching
- Browser HTTP cache is used for static assets (CSS, JS bundles)
- Data API responses appear uncached (unique per page load)

## Tracking / Analytics

Various analytics and tracking services are loaded:
- Google Analytics / Google Tag Manager
- Sentry (error tracking)
- CookieYes (consent management)
- Bing Ads
- Customer.io
- ProfitWell

## API Payload Structure (from observed patterns)

The `/api/v3p/data/graph` endpoint accepts a request body with:
- `schema: "packed"` — binary encoding format
- The request likely includes ticker ID and metric identifiers

Without deeper reverse-engineering of the packed format, the DOM extraction approach in `extract.js` is the recommended data collection method.

## Notes

- No public REST API documentation is available
- The packed schema format changes between versions (as seen in JS bundle version suffixes)
- DOM-based extraction is more maintainable than API reverse-engineering

## Script and examples

- Extractor: `@../scripts/earnings-history/extract.js`
- Script README: `@../scripts/earnings-history/README.md`
