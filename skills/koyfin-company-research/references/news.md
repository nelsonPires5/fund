# Koyfin News tab

**Section:** News, Filings & Transcripts  
**Research use:** recent company news feed metadata and source/time/title extraction.  
**Observed exploration ticker:** MSFT. Treat values as examples; scripts must work for other tickers and missing-data states.

## Research guide

Use this tab when the company question needs recent company news feed metadata and source/time/title extraction. Start by confirming the active ticker and Koyfin internal security id in the URL. Then review the visible widgets/tables, switch period/toggle controls only when needed, and extract structured data with `@../scripts/news/extract.js`.

## Extraction contract

- Run from the active Koyfin `News` page in an authenticated browser session.
- Save transient outputs and screenshots under `/tmp/<TICKER>/news/`.
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
  "total_items": "int",
  "items": [
    {
      "title": "str",
      "source": "str",
      "date": "str"
    }
  ]
}
```

## MSFT page summary

# Koyfin Security Analysis: MSFT News Tab — Exploration Summary

## Task
Navigate to MSFT Security Analysis > News, Filings & Transcripts > News on Koyfin and extract available data/metadata.

## Status: ✅ Complete

## Navigation Path
1. **Starting URL**: `https://app.koyfin.com/s/msft` (MSFT Overview page)
2. **Sidebar nav**: `Security Analysis > News, Filings & Transcripts > News`
3. **Active URL**: `https://app.koyfin.com/news/n/eq-kuqeq3`
4. **Article detail pattern**: `/news/n/{eq-id}/cn/{article-id}?sourceType=default`

## Page Structure
- **Title**: `MSFT - News`
- **Section header**: "Company News"
- **Filter**: "Customize Sources" button (top right of content area)
- **Sources visible**: Benzinga, MT Newswires, Sherwood News
- **News list**: Virtual scrollable list (`news-virtual-list`), items in `koy-news-item` divs
- **News sub-tabs in sidebar**: News (active), Press Releases, Filings, Transcripts

## Data Extracted
- **54 news items** (after scrolling to load all)
- Date range: ~May 4 '26 to May 17 '26 (most recent ~2 weeks)
- Each item has: **Title**, **Source**, **Date**
- Items are reverse-chronological (newest first)
- Today's items show time (e.g., "9:20 AM"); older items show date (e.g., "May 16 '26")

## Artifacts Saved
| Artifact | Path | Description |
|----------|------|-------------|
| Summary | `/tmp/MSFT/news/summary.md` | This file |
| Data Inventory | `/tmp/MSFT/news/data_inventory.md` | Detailed data structure & patterns |
| Extract Script | `/tmp/MSFT/news/extract.js` | Reusable extraction JavaScript |
| Sample Data | `/tmp/MSFT/news/sample-output.json` | Complete extracted news data (54 items) |
| Network Patterns | `/tmp/MSFT/news/network.md` | Network request analysis |
| Network Sample | `/tmp/MSFT/news/network-sample.json` | Sample capture of API requests |
| Screenshots | `/tmp/MSFT/news/01-*.png` through `07-*.png` | Page state at key steps |

## Key Findings
- News is loaded as a virtual list with lazy loading (items render on scroll)
- 54 items loaded; may be more with scrolling-to-bottom triggering API calls
- No external links in DOM — articles open in Koyfin's internal reader view
- Article detail URL pattern: `/news/n/{eq-id}/cn/{article-id}?sourceType=default`
- Koyfin uses React with CSS-modules class naming (no stable selectors)
- Sidebar nav items have stable `href` attributes
- No pagination controls visible; infinite scroll pattern

## Confidence: High
Data extraction worked reliably. DOM inspection, click interaction, and navigation all confirmed.

## Data inventory and extraction patterns

# Data Inventory: MSFT News (Koyfin Security Analysis)

## Page Metadata
| Field | Value |
|-------|-------|
| URL | `https://app.koyfin.com/news/n/eq-kuqeq3` |
| Title | MSFT - News |
| Section | Security Analysis > News, Filings & Transcripts > News |
| Ticker | MSFT |
| EQ ID | `eq-kuqeq3` (internal Koyfin security ID) |

## News List — Per-Item Fields
| Field | Type | Example | Position |
|-------|------|---------|----------|
| `title` | string | "Consumer Tech News (May 11-15): Trump–Xi Talk Fails..." | First text label (x: ~239) |
| `source` | string | "Benzinga", "MT Newswires", "Sherwood News" | Right-aligned label (x: ~1789-1818) |
| `date` | string | "9:20 AM", "May 16 '26" | Far-right label (x: ~1894-1908) |
| `href` | string (empty in DOM) | — | No `<a>` tag; click handled by JS |

## Sources Observed
- **Benzinga** (financial news wire)
- **MT Newswires** (financial news wire)
- **Sherwood News** (financial news)

## Date Format
- **Today**: "9:20 AM", "9:45 AM" (time only)
- **Past days**: "May 16 '26", "May 15 '26", etc. (Mon DD 'YY)
- Items are reverse-chronological

## DOM Structure
```
div.news-panel__newsPanel___qUnIA
  div.news-virtual-list__newsVirtualList__container___a0EHh
    div.news-virtual-list__newsVirtualList__items___M4noe (virtual, absolute-positioned items)
      div.koy-news-item__koyNewsItem___StpWe (each news item)
        label (title)
        div (spacer)
        div (right side)
          label (source name)
          span (bullet icon)
          div (date container)
            label (date text)
```

## Article Detail Page
When clicking a news item, the page navigates to:
`/news/n/{eq-id}/cn/{article-id}?sourceType=default`

The article detail view shows the full article inline within Koyfin.

## Network Loading Pattern
- News items are loaded via virtual list (react-window style)
- Scrolling triggers lazy loading of more items
- Batch size appears to be ~10-15 items per scroll

## Customize Sources
- Button at `x: ~1912, y: ~172` (top-right of content area)
- Likely opens a source filter/menu

## Sidebar Navigation (Sub-tabs under News, Filings & Transcripts)
| Sub-tab | Sidebar Label | Active? |
|---------|--------------|---------|
| News | "News" | ✅ Active (highlighted) |
| Press Releases | "Press Releases" | |
| Filings | "Filings" | |
| Transcripts | "Transcripts" | |

Note: Sidebar anchor elements have stable `href` attributes:
- `/news/n/eq-kuqeq3` (News)
- `/news/pr/eq-kuqeq3` (Press Releases) — inferred from `N`/`PR` shortcodes
- `/news/cf/eq-kuqeq3` (Filings)
- `/news/ts/eq-kuqeq3` (Transcripts)

## Limitations
1. **No external links**: News articles open in Koyfin's own reader; no direct URL to original source in DOM
2. **No pagination**: Infinite scroll — total count may vary
3. **CSS class names are hashed**: Classes like `koy-news-item__StpWe` use CSS modules and may change with app updates
4. **No article body preview**: Only title, source, and date are visible in list view
5. **Virtual list**: Not all items are in DOM at once; must scroll to load

## Network/API notes

# Network Request Analysis: Koyfin MSFT News Tab

## Overview
Koyfin is a single-page application (SPA) built with React. The news data appears to be embedded in the initial page bundle or loaded via internal API calls that aren't observable through standard resource timing. This document captures the known patterns.

## Observed URL Patterns

### News List
```
https://app.koyfin.com/news/n/eq-kuqeq3
```
Where `eq-kuqeq3` is the Koyfin internal security ID for MSFT.

### Article Detail
```
https://app.koyfin.com/news/n/eq-kuqeq3/cn/{article-id}?sourceType=default
https://app.koyfin.com/news/n/eq-kuqeq3/cn/{article-id}?sourceType=rssNews
```
The `sourceType` parameter varies (`default`, `rssNews`).

### Sub-tab URLs (inferred from sidebar hrefs)
| Sub-tab | URL Pattern |
|---------|------------|
| News | `/news/n/{eq-id}` |
| Press Releases | `/news/pr/{eq-id}` |
| Filings | `/news/cf/{eq-id}` |
| Transcripts | `/news/ts/{eq-id}` |

## Page Load Architecture
- **Base URL**: `https://app.koyfin.com/`
- **Static assets**: Hosted at `https://app.koyfin.com/scripts/` and `https://app.koyfin.com/styles/`
- **Font assets**: `https://assets.koyfin.com/font_blueprint/` and `https://fonts.googleapis.com/`
- **App type**: Single-page React app (React root container detected: `__reactContainer$0v7ensgovykr`)

## Data Loading Mechanism
- News items are rendered in a virtual list (react-window style)
- Data is likely pre-loaded in the page bundle or fetched via an internal API (GraphQL or REST)
- Virtual list lazily renders DOM nodes as the user scrolls (not data-loaded)
- No pagination controls — infinite scroll pattern
- Clicking a news item navigates via React Router to the article detail view (no server request)

## CSS Module Pattern
All CSS classes use CSS Modules with hashed suffixes:
```
koy-news-item__koyNewsItem___StpWe
news-panel__newsPanel___qUnIA
news-virtual-list__newsVirtualList__items___M4noe
```

## Static Assets Loaded
- Multiple vendor bundles (`bundle.vendor.*.js`)
- Multiple CSS bundles (`styles/main.*.css`)
- Trackers: Google Analytics, Bing Ads, Twitter Ads, Clarity, Customer.io, ProfitWell

## Limitations
1. **API endpoints not directly observable**: No REST/GraphQL endpoints visible in performance entries; data is likely embedded in JS bundles or fetched via WebSocket
2. **No headers/cookies visible**: API auth tokens available via browser context but not directly extractable
3. **SPA navigation**: News detail pages use client-side routing, making it hard to capture request-response pairs
4. **No batch/pagination requests observed**: Virtual list loads data from already-fetched store

## Script and examples

- Extractor: `@../scripts/news/extract.js`
- Script README: `@../scripts/news/README.md`
