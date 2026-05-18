# Koyfin Percentile Rank tab

**Section:** Snapshots  
**Research use:** relative valuation/quality/performance ranks vs own history and peer cohorts.  
**Observed exploration ticker:** MSFT. Treat values as examples; scripts must work for other tickers and missing-data states.

## Research guide

Use this tab when the company question needs relative valuation/quality/performance ranks vs own history and peer cohorts. Start by confirming the active ticker and Koyfin internal security id in the URL. Then review the visible widgets/tables, switch period/toggle controls only when needed, and extract structured data with `@../scripts/percentile-rank/extract.js`.

## Extraction contract

- Run from the active Koyfin `Percentile Rank` page in an authenticated browser session.
- Save transient outputs and screenshots under `/tmp/<TICKER>/percentile-rank/`.
- Final structured rows must include `ticker`, `tab`, `extracted_at` and enough tab-specific context columns.
- Empty/no-coverage/no-data states must emit empty arrays or CSV headers plus an explicit status/error field.
- Prefer Koyfin network/API data when request and response bodies are captured safely; otherwise use DOM/SVG/table extraction documented here.

## Output schema observed

### CSV headers observed

`section`, `metric`, `currentValue`, `vs5YHistory`, `vsUSTech`, `vsUS`
### JSON shape observed

```json
{
  "ticker": "str",
  "url": "str",
  "title": "str",
  "extractedAt": "str",
  "tabs": [
    {
      "label": "str",
      "active": "bool"
    }
  ],
  "activeSubButtons": [],
  "headerColumns": [
    "str"
  ],
  "columnGroups": "str",
  "dataRows": [
    {
      "section": "str",
      "metric": "str",
      "currentValue": "str",
      "percentileRanks": "list"
    }
  ]
}
```

## MSFT page summary

# Koyfin Security Analysis — Percentile Rank for MSFT

## Status: ✅ Complete

## Artifacts Created

| Artifact | Path | Description |
|----------|------|-------------|
| `summary.md` | This file | Status report |
| `data_inventory.md` | `/tmp/MSFT/percentile-rank/data_inventory.md` | Comprehensive data dictionary with all extracted values |
| `extract.js` | `/tmp/MSFT/percentile-rank/extract.js` | Standalone JS bookmarklet for re-extraction |
| `sample-output.json` | `/tmp/MSFT/percentile-rank/sample-output.json` | Full extraction as JSON (33 data rows) |
| `sample-output.csv` | `/tmp/MSFT/percentile-rank/sample-output.csv` | Flat CSV (section, metric, currentValue, ranks) |
| `network.md` | `/tmp/MSFT/percentile-rank/network.md` | API endpoint documentation with request/response structure |
| `network-sample.json` | `/tmp/MSFT/percentile-rank/tableSchema-response.json` | Raw tableSchema API response (~26KB) |
| `01-page-initial.png` | `/tmp/MSFT/percentile-rank/01-page-initial.png` | Screenshot: initial Fundamental tab |
| `02-before-performance-tab.png` | `/tmp/MSFT/percentile-rank/02-before-performance-tab.png` | Screenshot: before clicking Performance |
| `03-performance-tab.png` | `/tmp/MSFT/percentile-rank/03-performance-tab.png` | Screenshot: Performance tab |
| `04-back-to-fundamentals.png` | `/tmp/MSFT/percentile-rank/04-back-to-fundamentals.png` | Screenshot: back to Fundamentals |
| `05-3y-period.png` | `/tmp/MSFT/percentile-rank/05-3y-period.png` | Screenshot: 3Y period selected |
| `06-5y-period.png` | `/tmp/MSFT/percentile-rank/06-5y-period.png` | Screenshot: 5Y period selected |

## Extraction Method

Percentile rank values were extracted from the DOM `data-rank` attribute on
`high-low-band-mini-graphic__dot___jxgGY` elements inside each table cell.
This is more reliable than reading visual positions or API responses.

Key API discovered:
- `POST /api/v1/quant/query/tableSchema` with `{selfPeriodType, cohortType, ticker}`
  returns schema metadata (26KB for MSFT).
- `POST /api/v3p/data/keys` resolves data keys to actual values.

## Key Findings (MSFT)

- **Valuation:** MSFT's multiples are near their 5-year lows (rank 1–14),
  suggesting the stock is relatively cheap vs its own history, but mid-range vs peers.
- **Profitability:** Elite margins at 94–100th percentile vs broad US market.
  EBITDA, EBIT, and Net Income margins are at the 100th percentile of MSFT's own history.
- **Leverage:** Very low — net debt/EBITDA at 0.2x (3rd percentile = most conservative).
- **Performance:** Weak YTD/1Y (negative returns, ~30th percentile) but strong 5Y/10Y
  (70–94th percentile).

## Confidence: High

The `data-rank` attribute extraction is direct and reliable. CSS class names may
change between Koyfin deployments, but the structural pattern
(`.table-styles__table__scrollContainer___*` > `div` > rows > cells with `[data-rank]`)
is stable and the extract.js script is designed to be reusable.

## Blockers

None. The user's existing Koyfin session was already on the target page.
No credentials needed. No site mutation beyond reading the DOM and toggling
tabs for exploration.

## Data inventory and extraction patterns

# Koyfin Percentile Rank — Data Inventory

## Data Source

**Page:** `https://app.koyfin.com/snapshot/rank/eq-kuqeq3`
**Title:** MSFT - Percentile Rank
**Extracted At:** 2026-05-17T16:18:01Z (and later captures)
**Ticker:** MSFT (Microsoft Corporation)
**Exchange:** NasdaqGS

## Tab Structure

### Primary Tabs (top of panel)
| Tab | Active |
|-----|--------|
| **Fundamentals** | ✅ (default) |
| Performance | ❌ |

### Period Buttons (within each tab)
3Y, 5Y, 10Y, 20Y — affect the self-history lookback window.

### Cohort Buttons
Country, Region, **Global** (default active) — affect comparison universe.

## Fundamentals Tab — Data Sections

### 1. Valuation Multiples (15 metrics)
Metrics comparing MSFT's valuation ratios to its history and peers.

| Metric | Current | vs 5Y-History | vs US Info Tech | vs US |
|--------|---------|:----------:|:-------------:|:---:|
| Price / Earnings - P/E (NTM) | 22.8x | **2** | 50 | 72 |
| Price / Earnings - P/E (LTM) | 25.1x | **3** | 37 | 63 |
| Price / Sales - P/S (NTM) | 8.5x | **7** | 78 | 88 |
| Price / Sales - P/S (LTM) | 9.8x | **12** | 73 | 87 |
| Price / Book - P/B (LTM) | 7.6x | **2** | 72 | 86 |
| Price / Tangible Book Value - P/TBV (LTM) | 11.4x | **1** | 67 | 83 |
| Price / Free Cash Flow (LTM) | 43.0x | 54 | 73 | 85 |
| Price / Gross Profit (LTM) | 14.4x | **12** | 68 | 86 |
| EV / Sales (NTM) | 8.6x | **10** | 79 | 85 |
| EV / Sales (LTM) | 10.0x | **13** | 74 | 84 |
| EV / EBITDA (NTM) | 13.8x | **1** | 48 | 68 |
| EV / EBITDA (LTM) | 16.1x | **2** | 43 | 69 |
| EV / EBIT (NTM) | 18.7x | **2** | 52 | 63 |
| EV / EBIT (LTM) | 21.4x | **5** | 40 | 59 |
| EV / Gross Profit (LTM) | 14.6x | **14** | 69 | 80 |

**Key insight:** MSFT's valuation multiples are in the **low percentile vs its own history** (expensive vs its own past) but **mid-to-high vs US peers** (still reasonable for the quality).

### 2. Valuation Yields (7 metrics)

| Metric | Current | vs 5Y-History | vs US Info Tech | vs US |
|--------|---------|:----------:|:-------------:|:---:|
| Free Cash Flow / EV Yield (LTM) | 2.29% | 41 | 29 | 22 |
| Free Cash Flow / Market Cap Yield (LTM) | 2.33% | 46 | 29 | 17 |
| Dividend Yield (Ind) | 0.86% | 67 | 42 | 17 |
| Buyback Yield (LTM) | 0.64% | 42 | 58 | 59 |
| Debt Payback Yield (LTM) | 0.10% | 31 | 56 | 57 |
| Shareholder Yield (LTM) | 1.57% | 31 | 40 | 36 |
| Shareholder Yield excluding Debt (LTM) | 1.47% | 47 | 61 | 51 |

**Key insight:** MSFT yields are mostly in the **mid range** — decent shareholder returns but not exceptional.

### 3. Margins & Profitability (7 metrics)

| Metric | Current | vs 5Y-History | vs US Info Tech | vs US |
|--------|---------|:----------:|:-------------:|:---:|
| Gross Profit Margin % (LTM) | 68.31% | 11 | 70 | 76 |
| EBITDA Margin % (LTM) | 57.96% | **100** | **98** | **96** |
| EBIT Margin % (LTM) | 46.80% | **100** | **99** | **95** |
| Net Income Margin % (LTM) | 39.34% | **100** | **96** | **94** |
| Return on Assets (ROA) % (LTM) | 14.81% | 63 | **96** | **97** |
| Return on Total Capital (ROTC) % (LTM) | 19.26% | 58 | **94** | **94** |
| Return On Equity % (LTM) | 34.01% | 16 | **90** | **93** |

**Key insight:** MSFT has **elite profit margins** (near 100th percentile vs history and peers).
However, margins vs its own 5-year history show room for improvement (Gross Margin at 11th percentile).

### 4. Leverage (4 metrics)

| Metric | Current | vs 5Y-History | vs US Info Tech | vs US |
|--------|---------|:----------:|:-------------:|:---:|
| Long Term Debt / Equity (LTM) | 25.8% | **0** | 58 | 41 |
| Net Debt / (EBITDA - Capex) (LTM) | 0.5x | **100** | **6** | **7** |
| Net Debt / EBITDA (LTM) | 0.2x | 89 | **3** | **4** |
| Total Debt / EBITDA (LTM) | 0.7x | **0** | 27 | 17 |

**Key insight:** MSFT has **very low leverage** (rank 0 = lowest debt/equity vs its own history).
The net debt metrics show it's effectively unlevered, in the top decile of conservatism.

## Performance Tab — Data Sections

### Price Change % (9 metrics)
| Period | Current | Percentile Rank | vs US Info Tech | vs US |
|--------|---------|:-------------:|:--------------:|:----:|
| 1W | 1.64% | 71 | 78 | — |
| 1M | 2.60% | 46 | 66 | — |
| 3M | 5.13% | 49 | 67 | — |
| 6M | -17.30% | 34 | 22 | — |
| YTD | -12.76% | 37 | 27 | — |
| 1Y | -6.89% | 39 | 31 | — |
| 3Y | 36.34% | 55 | 58 | — |
| 5Y | 70.03% | 71 | 77 | — |
| 10Y | 726.00% | 81 | 94 | — |

### Total Return % (9 metrics)
| Period | Current | Percentile Rank | vs US Info Tech | vs US |
|--------|---------|:-------------:|:--------------:|:----:|
| 1W | 1.64% | 70 | 77 | — |
| 1M | 2.60% | 46 | 66 | — |
| 3M | 5.37% | 49 | 66 | — |
| 6M | -16.96% | 34 | 21 | — |
| YTD | -12.56% | 36 | 26 | — |
| 1Y | -6.35% | 39 | 30 | — |
| 3Y | 39.57% | 54 | 55 | — |
| 5Y | 77.19% | 72 | 74 | — |
| 10Y | 838.75% | 81 | 94 | — |

## DOM Extraction Method

Percentile ranks are extracted from `data-rank` attributes on:
```css
.high-low-band-mini-graphic__dot___jxgGY[data-rank]
```

The dot's `left` CSS position (`calc(X%)`) also reflects the percentile rank
but is a visual position, not a clean integer. The `data-rank` integer is the
authoritative value.

### CSS Class Names (subject to change with bundle rebuilds)
| Component | Class Pattern |
|-----------|---------------|
| Panel root | `percentile-ranks-snapshot__root___h5awZ` |
| Top bar | `percentile-ranks-snapshot__topBar___qfkX6` |
| Tab wrapper | `percentile-ranks-snapshot__tabWrapper___SvXob` |
| Content | `percentile-ranks-snapshot__panelContent___KnZl3` |
| Table | `table-styles__table___fNvz7` |
| Scroll container | `table-styles__table__scrollContainer___WBAWY` |
| Row | `table-styles__table__row___K6TSS` |
| Header cell | `table-styles__table__headerCell___gC361` |
| Data cell | `table-styles__table__dataCell___nRZp0` |
| Metric name cell (sticky) | `table-styles__table__dataCell___nRZp0 table-styles__sticky___B0Ah9` |
| Rank dot | `high-low-band-mini-graphic__dot___jxgGY` |
| Upper band indicator | `high-low-band-mini-graphic__upper___hOCMW` |
| Tab items | `koy-tab-item__koyTabItem____PH0o` |
| Active tab | `koy-tab-item__active___QCxcp` |

## Edge Cases / Gotchas

1. **Empty rank cells:** Some metrics may not have all rank columns populated
   (e.g., Performance tab only has 4 columns vs Fundamentals' 6). The extraction
   handles missing `data-rank` by returning `null`.

2. **Section headers:** Are `<div>` elements with just text, not `table__row` class.
   They separate metric groups and are tracked via `currentSection` state.

3. **Tab state:** The active tab is identified by `koy-tab-item__active___QCxcp`
   class. However, the 3Y/5Y/10Y/20Y buttons use `base-button__dataActive___mh9m2`.

4. **Lazy rendering:** The scroll container may not render all DOM nodes at once.
   Scrolling down triggers lazy rendering of additional rows. The Performance tab
   scrolls down to reveal sections after "Total Return".

5. **Cross-origin iframes:** The page has iframes from Stripe, Bing, Twitter etc.
   These don't affect the percentile rank extraction.

6. **React class names:** All CSS class names are hashed and may change between
   deployments. The semantic structure (descendant selectors) is more stable.

## Network/API notes

# Koyfin Percentile Rank — Network API Analysis

## Page URL Pattern

```
https://app.koyfin.com/snapshot/rank/<ticker-id>
```

The ticker `MSFT` resolves to `eq-kuqeq3` in this case. Ticker IDs are opaque
(not simple ticker symbols).

## Key API Endpoints

### 1. tableSchema — Schema/Metadata

**Endpoint:**
```
POST https://app.koyfin.com/api/v1/quant/query/tableSchema
```

**Request body:**
```json
{
  "selfPeriodType": "5y",
  "cohortType": "g",
  "ticker": "MSFT"
}
```

| Parameter | Values | Description |
|-----------|--------|-------------|
| `selfPeriodType` | `"3y"`, `"5y"`, `"10y"`, `"20y"` | Lookback period for self-history percentile |
| `cohortType` | `"g"` (Global), `"r"` (Region), `"c"` (Country) | Comparison cohort |
| `ticker` | e.g. `"MSFT"` | Ticker symbol |

**Response:** Array of section arrays. Each section has:
- `name`: Display name (e.g. "Valuation Multiples")
- `reverseHighlights`: boolean, whether lower values are better
- `rows[]`: Array of metric definitions, each with:
  - `current`: Data key for current value (e.g. `"pe"`, `"peltm"`)
  - `recordKey`: Unique identifier
  - `selfHistory`: Object with keys `pr`, `min`, `25p`, `50p`, `75p`, `max` for the period-based percentile (e.g. `"pe_5y_pr"`)
  - `general`: Same keys for Global cohort (e.g. `"pe_g_pr"`)
  - `sector`: Same keys for Sector/US cohort (e.g. `"pe_gs_pr"`)

Data key naming convention:
- `{metric}_{period}_{bucket}` — e.g. `pe_5y_pr`, `pe_5y_min`, `pe_5y_max`
- `{metric}_g_{bucket}` — Global cohort
- `{metric}_gs_{bucket}` — US Sector cohort (Information Technology)
- Bucket suffixes: `pr` (percentile rank), `min`, `25p`, `50p`, `75p`, `max`

**Response size:** ~26–27 KB for MSFT (both Fundamentals + Performance sections).

### 2. data/keys — Actual Data Values (inferred)

**Endpoint:**
```
POST https://app.koyfin.com/api/v3p/data/keys
```

**Request format (inferred from page behavior):**
```json
{
  "ids": ["pe_5y_pr", "pe_g_pr", "pe_gs_pr"]
}
```

This endpoint returns key-value data for the requested data keys. The `tableSchema`
gives you the key names, then this endpoint resolves them to actual numeric values.
(Note: exact parameter name may be `keys` or `ids` — the page uses both.)

### 3. Supporting Endpoints

| Endpoint | Purpose |
|----------|---------|
| `GET /api/v3/tickers/filters` | Ticker metadata |
| `POST /api/v3p/data/keys` | Resolve multiple data keys to values |
| `GET /api/v1/bfc/tickers/top?categories=...` | Top tickers by category (bootstrap) |

## Data Flow

1. Page loads with ticker ID in URL
2. `GET /api/v3/tickers/filters` resolves ticker metadata
3. `POST /api/v1/quant/query/tableSchema` fetches schema (which metrics, which data keys)
4. `POST /api/v3p/data/keys` (called multiple times) fetches actual values for the data keys
5. React renders percentile rank bars using `data-rank` attribute positions

## Key Observation for Extraction

The **percentile rank values are NOT in the API response as plain integers**.
Instead, the API returns bucket definitions (min, 25p, 50p, 75p, max) and the
actual value. The percentile rank is computed client-side as the position of the
value within the bucket range.

**However**, the rendered DOM contains the percentile rank in the `data-rank`
attribute of the dot element:
```html
<div class="high-low-band-mini-graphic__dot___jxgGY"
     data-rank="72"
     style="left: calc(72.22222222222221% - var(--hlbmg_half-dot-size));">
</div>
```

The `data-rank` value is the 0–100 percentile rank. This is the most reliable
extraction point.

## Script and examples

- Extractor: `@../scripts/percentile-rank/extract.js`
- Script README: `@../scripts/percentile-rank/README.md`
