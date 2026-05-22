# Koyfin Description tab

**Section:** Snapshots  
**Research use:** business description, profile fields, key data, dividends, related securities.  
**Observed exploration ticker:** MSFT. Treat values as examples; scripts must work for other tickers and missing-data states.

## Research guide

Use this tab when the company question needs business description, profile fields, key data, dividends, related securities. Start by confirming the active ticker and Koyfin internal security id in the URL. Then review the visible widgets/tables, switch period/toggle controls only when needed, and extract structured data with `@../scripts/description/extract.js`.

## Extraction contract

- Run from the active Koyfin `Description` page in an authenticated browser session.
- Save transient outputs and screenshots under `/tmp/<TICKER>/description/`.
- Final structured rows must include `ticker`, `tab`, `extracted_at` and enough tab-specific context columns.
- Empty/no-coverage/no-data states must emit empty arrays or CSV headers plus an explicit status/error field.
- Prefer Koyfin network/API data when request and response bodies are captured safely; otherwise use DOM/SVG/table extraction documented here.

## Output schema observed

### CSV headers observed

`ticker`, `tab`, `extracted_at`, `url`, `security_id`, `section`, `name`, `year_founded`, `headquarters`, `employees`, `total_return_inception`, `website`, `country`, `isin`, `equity_type`, `exchange`, `equity_sector`, `industry`, `fiscal_year_end`, `next_earnings_release`, `last_price`, `52_week_low`, `52_week_low_date`, `52_week_high`, `52_week_high_date`, `1y_total_return`, `market_cap`, `enterprise_value`, `shares_out`, `avg_10d_volume`, `sales`, `sales_5y_cagr`, `ebitda`, `ebitda_5y_cagr`, `net_income`, `ni_5y_cagr`, `div_yield`, `payout_ratio`, `dps`, `dps_5y_cagr`, `related_ticker`, `related_exchange`
### JSON shape observed

```json
{
  "ticker": "str",
  "tab": "str",
  "extracted_at": "str",
  "url": "str",
  "security_id": "str",
  "business_description": "str",
  "company_profile": {
    "name": "str",
    "year_founded": "str",
    "headquarters": "str",
    "employees": "str",
    "total_return_since_inception": "str",
    "website": "str",
    "country": "str",
    "isin": "str",
    "equity_type": "str",
    "exchange": "str",
    "equity_sector": "str",
    "industry": "str"
  },
  "price_data": {
    "last_price": "str",
    "52_week_low": {
      "date": "str",
      "value": "str"
    },
    "52_week_high": {
      "date": "str",
      "value": "str"
    },
    "1y_total_return": "str"
  },
  "key_data": {
    "market_cap": "str",
    "enterprise_value": "str",
    "shares_out": "str",
    "average_10d_volume": "str",
    "sales": "str",
    "sales_5y_cagr": "str",
    "ebitda": "str",
    "ebitda_5y_cagr": "str",
    "net_income": "str",
    "ni_5y_cagr": "str"
  },
  "dividend_info": {
    "div_yield": "str",
    "payout_ratio": "str",
    "dps": "str",
    "dps_5y_cagr": "str"
  },
  "related_securities": [
    {
      "ticker": "str",
      "exchange": "str"
    }
  ],
  "sections_found": [
    "str"
  ]
}
```

## MSFT page summary

# Koyfin Security Analysis — Description Tab
## Ticker: MSFT (Microsoft Corporation)

**Extracted:** 2026-05-17T15:48:40Z  
**URL:** `https://app.koyfin.com/snapshot/des/eq-kuqeq3`  
**Security ID:** `eq-kuqeq3`

---

## Business Description

Microsoft Corporation develops and supports software, services, devices, and solutions worldwide. The company operates through three segments:

- **Productivity and Business Processes:** Microsoft 365 commercial (Office, Exchange, SharePoint, Teams, Copilot), LinkedIn, Dynamics 365
- **Intelligent Cloud:** Azure, GitHub, Nuance Healthcare, SQL Server, Windows Server, Visual Studio
- **Personal Computing:** Windows OEM, Surface devices, Xbox/gaming, Bing/Copilot/Edge search & advertising

Founded in 1975, headquartered in Redmond, Washington.

---

## Company Profile

| Field | Value |
|-------|-------|
| Name | Microsoft Corporation |
| Year Founded | 1975 |
| Headquarters | Redmond, Washington, US |
| Employees | 228,000 |
| Total Return since Inception | 711,962.47% |
| Website | www.microsoft.com |
| Country | US |
| ISIN | US5949181045 |
| Equity Type | Common Equity |
| Exchange | NasdaqGS |
| Sector | Information Technology |
| Industry | Software |
| Fiscal Year End | Jun 2025 |
| Next Earnings Release | Thu Jul 30th 2026 (After-Market) |

---

## Price Data

| Metric | Value |
|--------|-------|
| Last Price | $421.92 |
| 52-Week Low | $356.28 (Mar 30 2026) |
| 52-Week High | $555.45 (Jul 31 2025) |
| 1Y Total Return | -6.35% |

---

## Key Data

| Metric | Value |
|--------|-------|
| Market Cap | $3,134.21 B |
| Enterprise Value | $3,181.41 B |
| Shares Outstanding | 7.43 B |
| Avg 10D Volume | 33.37 M |
| Sales | $318.27 B |
| Sales 5Y CAGR | 14.75% |
| EBITDA | $184.46 B |
| EBITDA 5Y CAGR | 19.48% |
| Net Income | $125.22 B |
| NI 5Y CAGR | 17.45% |

---

## Dividend Information

| Metric | Value |
|--------|-------|
| Div Yield | 0.86% |
| Payout Ratio | 20.65% |
| DPS | $3.56 |
| DPS 5Y CAGR | 10.21% |

---

## Related Securities

32 securities across global exchanges including Warsaw, Mexico, SIX Swiss, Santiago, Lima, XETRA, Borsa Italiana, London, Deutsche Boerse, Colombia, Vienna, Bulgaria, Kazakhstan, BATS Chi-X Europe, Thailand, Aequitas Neo, Buenos Aires, Toronto, Sao Paulo, Hong Kong, Ukraine, and Euronext Brussels.

---

## Extraction Method

- **Approach:** DOM extraction via CDP (browser-harness) from `div.snapshot-description__gridRoot___Ec9uM`
- **Data source:** Client-side rendered React SPA — no discoverable REST API endpoint for description data
- **Network:** No dedicated description API call detected; data likely fetched via internal GraphQL/WebSocket data layer
- **All sections present:** business_description, company_profile, price_data, key_data, dividend_info, related_securities

## Data inventory and extraction patterns

# Data Inventory — Koyfin Description Tab

**Ticker:** MSFT | **Tab:** Description | **Extracted:** 2026-05-17

## Sections Present (6/6)

| # | Section | Field Count | Description |
|---|---------|-------------|-------------|
| 1 | business_description | 1 (text) | Multi-paragraph company business summary |
| 2 | company_profile | 14 fields | Company metadata (name, founded, HQ, employees, exchange, sector, etc.) |
| 3 | price_data | 4 metrics | Last price, 52-week range, 1Y total return |
| 4 | key_data | 10 metrics | Market cap, EV, shares, volume, sales, EBITDA, net income + CAGRs |
| 5 | dividend_info | 4 metrics | Yield, payout ratio, DPS, DPS 5Y CAGR |
| 6 | related_securities | 32 entries | Ticker-exchange pairs for global listings |

## Sections Missing (0/6)

None.

## Field Details

### company_profile (14 fields)
`name`, `year_founded`, `headquarters`, `employees`, `total_return_since_inception`, `website`, `country`, `isin`, `equity_type`, `exchange`, `equity_sector`, `industry`, `fiscal_year_end`, `next_earnings_release`

### price_data (4 metrics)
`last_price` (string), `52_week_low` ({date, value}), `52_week_high` ({date, value}), `1y_total_return` (string with %)

### key_data (10 metrics)
`market_cap`, `enterprise_value`, `shares_out`, `average_10d_volume`, `sales`, `sales_5y_cagr`, `ebitda`, `ebitda_5y_cagr`, `net_income`, `ni_5y_cagr`
All values include currency/unit suffix ($/B/M/%).

### dividend_info (4 metrics)
`div_yield`, `payout_ratio`, `dps`, `dps_5y_cagr`

### related_securities (32 entries)
Array of `{ticker, exchange}` objects.

## Data Quality Notes

- All values are string-typed (as rendered in DOM); numeric parsing left to consumer
- Price chart axis labels (dates "Jul 2023" through "Jan 2026" + values) are present in raw lines but not parsed into structured data — they represent the mini price chart
- "Total Return since Inception" = 711,962.47% (since 1986 IPO)
- Next earnings: Thu Jul 30th 2026 (After-Market) — may be estimated

## DOM Selector

Primary container: `div.snapshot-description__gridRoot___Ec9uM` (CSS module hash may vary)

## API Discovery

No REST endpoint found for description data. The Koyfin SPA appears to fetch data via an internal data layer (likely GraphQL/WebSocket). Performance API showed no dedicated `/api/*/snapshot/*` or `/api/*/description/*` calls. All data is embedded in the React-rendered DOM.

## Network/API notes

# Network Analysis — Koyfin Description Tab

**Page:** `https://app.koyfin.com/snapshot/des/eq-kuqeq3`  
**Total Resources:** 169  
**Analyzed:** 2026-05-17

## Key Finding

**No dedicated REST API endpoint for description data was discovered.** All attempts to find a `/api/*/snapshot/*`, `/api/*/description/*`, or `/api/*/security/*` endpoint returned 404. The description data is rendered client-side by the React SPA, likely fetched through an internal data layer (GraphQL or WebSocket) not surfaced via the Performance API.

## API Calls Observed (authenticated)

| Endpoint | Method | Size | Notes |
|----------|--------|------|-------|
| `/api/v1/bfc/tickers/top` | GET | 94 KB | Top tickers by category |
| `/api/v3/data/keys` | GET | 19 KB | Data dictionary/metadata keys |
| `/api/v3/users/watchlists` | GET | 1.2 KB | User watchlists |
| `/api/v3/users/watchlists/structure` | GET | ~1 KB | Watchlist organization |
| `/api/v3/users/settings` | GET | 2.8 KB | User preferences |
| `/api/v3/users/dashboards/structure` | GET | 454 B | Dashboard layout |
| `/api/v3/users/fa/templates` | GET | 794 B | Financial analysis templates |
| `/api/v3/users/chart-hub` | GET | 1.3 KB | Chart configurations |
| `/api/v3/alerts-service/me/alerts` | GET | ~500 B | User price alerts |
| `/api/v3/alerts-service/me/notifications` | GET | 302 B | Alert notifications |
| `/api/v3/billing/subscriptions` | GET | 546 B | Subscription status |
| `/api/v3/billing/stripe/config` | GET | 1.6 KB | Stripe billing config |
| `/api/v3/tickers/filters` | GET | 2.2 KB | Ticker filter metadata |
| `/api/v1/pubhub/custom-screens` | GET | 330 B | Public custom screens |
| `/api/v3/data/vocabularies/holidays` | GET | ~1 KB | Holiday calendar |
| `/api/v3p/data/graph?schema=packed` | POST? | - | Possible GraphQL data endpoint (404 on GET) |
| `auth.koyfin.com/users/profile` | GET | - | User profile |
| `auth.koyfin.com/authorization/grants` | GET | - | Auth grants |
| `auth.koyfin.com/authorization/entitlements/me` | GET | - | Feature entitlements |

## Third-Party / Analytics

Heavy analytics footprint: Google Analytics (GA4 + UA), Google Ads, Facebook Pixel, LinkedIn Insight Tag, Bing Ads, Sentry (error tracking), CookieYes (consent), Customer.io, Stripe.

## Data Fetching Hypothesis

The description data likely comes from Koyfin's internal data graph. The `/api/v3p/data/graph?schema=packed` endpoint (POST) is the most likely candidate — it returns HTTP 404 on GET but may accept POST with a query body containing the security ID and requested fields. This would explain why no REST GET was observed: the data layer uses a GraphQL-like query-over-POST pattern.

## Architecture

```
Browser
  ├── React SPA (app.koyfin.com)
  ├── Auth service (auth.koyfin.com)
  └── Data APIs
       ├── REST: /api/v3/* (watchlists, settings, billing, alerts)
       └── Graph: /api/v3p/data/graph (speculative — schema-based data fetching)
```

## Script and examples

- Extractor: `@../scripts/description/extract.js`
- Script README: `@../scripts/description/README.md`
