# Koyfin Ownership tab

**Section:** Snapshots  
**Research use:** insider/institutional ownership, transactions, holders, mutual funds and ETFs.  
**Observed exploration ticker:** MSFT. Treat values as examples; scripts must work for other tickers and missing-data states.

## Research guide

Use this tab when the company question needs insider/institutional ownership, transactions, holders, mutual funds and ETFs. Start by confirming the active ticker and Koyfin internal security id in the URL. Then review the visible widgets/tables, switch period/toggle controls only when needed, and extract structured data with `@../scripts/ownership/extract.js`.

## Extraction contract

- Run from the active Koyfin `Ownership` page in an authenticated browser session.
- Save transient outputs and screenshots under `/tmp/<TICKER>/ownership/`.
- Final structured rows must include `ticker`, `tab`, `extracted_at` and enough tab-specific context columns.
- Empty/no-coverage/no-data states must emit empty arrays or CSV headers plus an explicit status/error field.
- Prefer Koyfin network/API data when request and response bodies are captured safely; otherwise use DOM/SVG/table extraction documented here.

## Output schema observed

### CSV headers observed

`ticker`, `tab`, `subTab`, `extractedAt`, `name_or_holder`, `title_or_type`, `marketValue_or_shares`, `pctMarketcap_or_pctOut`, `sharesHeld_or_reported`, `detail_or_change`
### JSON shape observed

```json
{
  "ticker": "str",
  "koyfinId": "str",
  "tab": "str",
  "extractedAt": "str",
  "subTabs": {
    "insiderOwnership": {
      "url": "str",
      "status": "str",
      "rowCount": "int",
      "columns": "list",
      "sample": "list"
    },
    "insiderTransactions": {
      "url": "str",
      "status": "str",
      "columns": "list",
      "sample": "list"
    },
    "institutions": {
      "url": "str",
      "status": "str",
      "rowCount": "int",
      "columns": "list",
      "sample": "list",
      "top15TotalPctOut": "str"
    },
    "mutualFunds": {
      "url": "str",
      "status": "str",
      "rowCount": "int",
      "columns": "list"
    },
    "etfs": {
      "url": "str",
      "status": "str",
      "rowCount": "int",
      "columns": "list"
    }
  }
}
```

## MSFT page summary

# Koyfin MSFT Ownership Tab — Exploration Summary

**Ticker:** MSFT  
**Koyfin internal ID:** eq-kuqeq3  
**Tab:** Security Analysis > Ownership  
**Date:** 2026-05-17  
**Tool:** browser-harness (CDP, coordinate clicks, DOM extraction)

---

## Navigation Path

1. Started at `https://app.koyfin.com/snapshot/dvd/eq-kuqeq3` (Dividend tab)
2. Navigated to `https://app.koyfin.com/s/eq-kuqeq3` (Security Analysis > Overview)
3. Left sidebar: "Snapshots" > "Ownership (own)" → redirected to `/snapshot/own/insider-ownership/eq-kuqeq3`
   - Note: Coordinate click did not activate the SPA link; direct URL navigation (`goto_url`) worked reliably.
4. Sub-tabs explored:
   - **Insider Ownership** — Active by default
   - **Insider Transactions** — URL: `/snapshot/own/insider-transactions/eq-kuqeq3`
   - **Institutional Ownership** > Institutions — URL: `/snapshot/own/institutional-ownership/institutions/eq-kuqeq3`
   - **Institutional Ownership** > Mutual Funds — URL: `/snapshot/own/institutional-ownership/mutual-funds/eq-kuqeq3`
   - **Institutional Ownership** > ETFs — URL: `/snapshot/own/institutional-ownership/etfs/eq-kuqeq3`

---

## Data Inventory

| Sub-tab | Rows | Columns |
|---------|------|---------|
| Insider Ownership | 19 | name, title, marketValue, pctMarketcap, sharesHeld, positionDate |
| Insider Transactions | 15+ | name, transactionType, category, date, sharesTransacted, change%, transactionValue |
| Institutional > Institutions | 33 | holder, value, pctOut, shares, pctPortfolio, reported |
| Institutional > Mutual Funds | 33 | fundName, category |
| Institutional > ETFs | 27 | fundName, category |

## Key Findings

### Insider Ownership
- **Total insider holdings:** $1.04B (0.03% of market cap), 2,453,538 shares
- **Top insider:** Satya Nadella (Chairman & CEO) — $378.29M, 896,595 shares
- **Most recent filing:** Amy Coleman — Apr 15, 2026

### Institutional Ownership (Top 3)
1. **Vanguard Group** — $347.21B (9.66% of shares outstanding), reported Dec 31, 2025
2. **BlackRock** — $219.63B (7.99%), reported Mar 31, 2026
3. **State Street** — $113.53B (4.13%), reported Mar 31, 2026

### Insider Transactions (recent notable)
- Kathleen Hogan: Open Market Sale — $5.05M (Mar 06, 2026)
- John Stanton: Open Market Buy — $1.99M (Feb 18, 2026)

---

## Durable Patterns

### URL Structure
```
/snapshot/own/{insider-ownership|insider-transactions|institutional-ownership}/{sub-view?}/eq-kuqeq3
```
Where `eq-kuqeq3` is the security UUID.

### Column Positions (stable across page loads)
- **Insider table:** name=234, title=534, marketValue=834, pctMarketcap=1014, sharesHeld=1194, positionDate=1374
- **Institution table:** holder=234, value=534, pctOut=714, shares=894, pctPortfolio=1074, reported=1254
- **Transaction table:** name=235, type=775, category=955, date=1135, shares=1295, change=1475, value=1655

### Extraction Method
Use `document.querySelectorAll('div')` with `getBoundingClientRect()` filtering by y-position and height=32px. The Koyfin grid uses flat divs, not semantic tables. Cell text is clean (no HTML wrappers).

### React SPA Behavior
- Sidebar link clicks via CDP `Input.dispatchMouseEvent` did not trigger React Router navigation. Use `goto_url()` for tab switches.
- Sub-tab clicks (Insider Ownership, Insider Transactions, Institutional Ownership) work with coordinate clicks.
- Within Institutional Ownership, "Institutions", "Mutual Funds", and "ETFs" are toggles at y~190 that change the URL path segment.

---

## Blockers & Gotchas
- No login wall encountered (session already authenticated)
- Insider Transactions table has a chart above it — data rows start at y=855, not y=299
- Mutual Funds and ETFs sub-views show different columns (fund category instead of financial values)
- JavaScript `js()` helper wraps arrow functions in IIFE incorrectly; use anonymous `function()` syntax
- No DOM IDs or data attributes found — all selectors must be position-based

## Data inventory and extraction patterns

# Data Inventory — Koyfin MSFT Ownership

## Files

| File | Description |
|------|-------------|
| `summary.md` | Full exploration summary, findings, navigation path |
| `data_inventory.md` | This file |
| `extract.js` | Reusable extraction helper with column definitions |
| `sample-output.json` | JSON summary with samples from all sub-tabs |
| `sample-output.csv` | Insider Ownership data as CSV |
| `institutional-institutions.csv` | Top 15 institutional holders as CSV |
| `network.md` | Network request patterns |
| `network-sample.json` | Sample network payloads (if captured) |
| `01-initial-state.png` → `12-insider-tx-scrolled.png` | Screenshot series |

## Ownership Data Overview

### Insider Ownership (19 insiders)
- **Columns:** Name, Title, Market Value, % of Market Cap, Shares Held, Position Date
- **Total:** $1.04B / 0.03% / 2,453,538 shares
- **Most recent:** Apr 15, 2026 (Amy Coleman)
- **CEO stake:** Satya Nadella — $378.29M (0.01%)

### Insider Transactions (15+ records)
- **Columns:** Name, Transaction Type, Category, Date, Shares, Change %, Value
- **Categories:** Acquisition (option exercises, employee stock), Disposal (open market sales)
- **Notable:** Kathleen Hogan sold $5.05M on Mar 06, 2026; John Stanton bought $1.99M on Feb 18, 2026

### Institutional Ownership — Institutions (33 holders)
- **Columns:** Holder, Value, % Outstanding, Shares, % Portfolio, Reported
- **Top 3:** Vanguard (9.66%), BlackRock (7.99%), State Street (4.13%) = 21.78% of shares
- **Top 15 total:** ~40.26% of shares outstanding
- **Reporting period:** Q4 2025 / Q1 2026

### Institutional Ownership — Mutual Funds (33 funds)
- **Columns:** Fund Name, Category (e.g. "US Fund Large Blend", "US Fund Technology")
- **Largest funds:** BlackRock Exchange, Fidelity Select Software & IT Svcs

### Institutional Ownership — ETFs (27 ETFs)
- **Columns:** Fund Name, Category (e.g. "Information Technology", "Large Cap", "Single Stock")
- **Notable:** Roundhill MSFT WeeklyPay ETF, Direxion Daily MSFT Bull/Bear ETFs

## Coverage Notes
- All 5 sub-views successfully extracted
- Insider Transactions may have more rows below the visible 15 (scroll needed)
- Mutual Funds and ETFs show categorical data rather than financial metrics
- No "Top 20 insiders" table header — it's just the first 19 data rows

## Missing / Not Captured
- Full insider transactions table (scrolled beyond first 20 rows)
- Insider ownership chart visualization (not parseable via DOM)
- Historical trend data (only current snapshot available)

## Network/API notes

# Network Request Patterns — Koyfin Ownership

## API Endpoints
Koyfin uses a GraphQL-like API. During the Ownership page load, the following patterns were observed:

### Data API
- `https://app.koyfin.com/api/data` — Main data query endpoint (POST, JSON)
  - Request body includes query selector like `{snapshot_ownership{...}}`
  - Returns JSON with insider holdings, institutional holdings
- `https://app.koyfin.com/api/symbols` — Symbol search/lookup (POST)

### Assets
- `https://cdn.koyfin.com/` — Static assets (JS bundles, CSS, fonts, SVGs)
- `https://app.koyfin.com/static/` — Application static files

### WebSocket
- `wss://app.koyfin.com/ws` — Real-time data streaming (price updates)

## Request Flow (Ownership tab)
1. `GET https://app.koyfin.com/snapshot/own/insider-ownership/eq-kuqeq3` (HTML shell)
2. Multiple JS bundle loads from CDN
3. `POST https://app.koyfin.com/api/data` — fetches ownership snapshot
4. GraphQL response with insider holders, institutional holders
5. WebSocket connection for live updates

## Key Observations
- Data is fetched via a single POST to `/api/data` with a complex GraphQL body
- No REST endpoint for ownership specifically
- The response includes both insider and institutional data in one payload
- CSS class names are hashed (e.g. `navi-panel-list-item__naviPanelListItem___ckQEj`)
- No authentication headers visible (cookie-based auth)

## Column-to-Attribute Mapping
From the grid rendering:
- Column positions are hardcoded in the component, not dynamic
- Data values are formatted client-side (e.g. `$347.21B`, `9.66%`)
- Sorting is client-side via column header clicks

## Script and examples

- Extractor: `@../scripts/ownership/extract.js`
- Script README: `@../scripts/ownership/README.md`
