# Koyfin Intraday tab

**Section:** Graphs  
**Research use:** intraday OHLCV series, visible data table and market-closed/no-data handling.  
**Observed exploration ticker:** MSFT. Treat values as examples; scripts must work for other tickers and missing-data states.

## Research guide

Use this tab when the company question needs intraday OHLCV series, visible data table and market-closed/no-data handling. Start by confirming the active ticker and Koyfin internal security id in the URL. Then review the visible widgets/tables, switch period/toggle controls only when needed, and extract structured data with `@../scripts/intraday/extract.js`.

## Extraction contract

- Run from the active Koyfin `Intraday` page in an authenticated browser session.
- Save transient outputs and screenshots under `/tmp/<TICKER>/intraday/`.
- Final structured rows must include `ticker`, `tab`, `extracted_at` and enough tab-specific context columns.
- Empty/no-coverage/no-data states must emit empty arrays or CSV headers plus an explicit status/error field.
- Prefer Koyfin network/API data when request and response bodies are captured safely; otherwise use DOM/SVG/table extraction documented here.

## Output schema observed

### CSV headers observed

`timestamp`, `open`, `high`, `low`, `close`, `volume`
### JSON shape observed

```json
{
  "ticker": "str",
  "tab": "str",
  "extracted_at": "str",
  "period": "str",
  "date_range": {
    "from": "str",
    "to": "str"
  },
  "total_bars": "int",
  "data": [
    {
      "timestamp": "str",
      "open": "float",
      "high": "float",
      "low": "float",
      "close": "float",
      "volume": "int"
    }
  ]
}
```

## MSFT page summary

# MSFT Intraday Chart — Koyfin Security Analysis

**Extracted at:** 2026-05-17  
**Ticker:** MSFT (Microsoft Corporation, NasdaqGS)  
**KID:** eq-kuqeq3  
**Tab:** Graphs > Intraday (gip)  
**URL:** https://app.koyfin.com/charts/gip/eq-kuqeq3

## Chart Type
OHLCV intraday candlestick/area chart rendered as SVG.

## Period Range Available
- **1d–10d** quick-select buttons at top toolbar.
- Default view: **1d** (shows ~3 weeks of intraday bars from 2026-04-29 to 2026-05-15).
- 5d, 10d etc. adjust the visible date window (may request different API date ranges).

## Controls Visible
| Control | Position (x, y) | Description |
|---------|----------------|-------------|
| Period selector | 512, 152 | 1d 2d 3d 4d 5d 6d 7d 8d 9d 10d |
| Show Table / Hide Table | 1734, 155 | Toggles a scrollable data table below the chart |
| Export | 1829, 155 | Export button (no visible dropdown) |
| Settings | 1897, 155 | Settings gear icon |
| Selections sidebar | 224, 148 | Left sidebar with ticker list + "Add Ticker" |
| Chart drawing tools | ~516, 1235 | Bottom toolbar with drawing tools (14+ icons) |

## Overlays / Indicators
No visible overlay/indicator controls found in the default Intraday chart view. The chart shows:
- Price line (likely close price)
- Volume bars at bottom
- No SMA, VWAP, Bollinger, RSI, MACD by default

## Data Extracted

### Primary: Graph API
- **Endpoint:** `POST https://app.koyfin.com/api/v3/data/graph?schema=packed`
- **Request body:** `{"id":"eq-kuqeq3","key":"p_live","dateFrom":"2026-04-15","dateTo":"2026-05-18","priceFormat":"standard"}`
- **Response structure:** `{KID, id, category, startDate, endDate, graph: {date, volume, open, high, low, close}, error}`
- **Bars captured:** 5,070 OHLCV bars (1-minute resolution)
- **Date range:** 2026-04-29T13:30:00Z to 2026-05-15T19:59:00Z
- **Price range:** $398.04 – $428.15 (high); $398.01 – $427.81 (low)

### Secondary: Data Table
- Toggleable price table with Date + MSFTPrice columns
- Visible via Show Table button (18 rows per viewport)
- Uses same data source as the chart

## Market State
- Last price: $421.92 (May 15, 2026 4:00PM EDT close)
- After-market: $419.71 (May 15, 2026 7:59PM EDT)
- Volume: 50,771,100
- Next earnings: Jul 30, 2026 (After-Market)
- Market appears to be **closed** (after-hours data only)

## Files
- `sample-output.csv` — Full OHLCV data (5,070 bars)
- `sample-output.json` — Data sample (first 100 + last 5 bars)
- `graph-api-response-27969.70.json` — Raw API response (299KB)
- `table-data.json` — Visible table rows (18 rows)

## Data inventory and extraction patterns

# Data Inventory — MSFT Intraday (Koyfin)

## Source: Graph API

**Endpoint:** `POST https://app.koyfin.com/api/v3/data/graph?schema=packed`

### Request Parameters
| Field | Value | Description |
|-------|-------|-------------|
| id | `eq-kuqeq3` | Koyfin internal security KID |
| key | `p_live` | Live price data key |
| dateFrom | `2026-04-15` | Start of requested range |
| dateTo | `2026-05-18` | End of requested range |
| priceFormat | `standard` | Price format (vs `adj` for adjusted) |

### Response Structure
```json
{
  "KID": "eq-kuqeq3",
  "id": "MSFT:US",
  "category": "eq",
  "startDate": "2026-04-29T13:30:00Z",
  "endDate": "2026-05-15T19:59:00Z",
  "graph": {
    "date": ["2026-04-29T13:30:00Z", "2026-04-29T13:31:00Z", ...],
    "volume": [690149, 225861, ...],
    "open": [424.519, 424.499, ...],
    "high": [424.519, 425.0, ...],
    "low": [421.79, 424.01, ...],
    "close": [423.75, 424.59, ...]
  },
  "error": null
}
```

### Fields
| Field | Type | Count | Description |
|-------|------|-------|-------------|
| date | string[] | 5,070 | ISO 8601 timestamps (UTC), 1-minute resolution |
| volume | number[] | 5,070 | Share volume for each minute bar |
| open | number[] | 5,070 | Opening price for the minute |
| high | number[] | 5,070 | High price for the minute |
| low | number[] | 5,070 | Low price for the minute |
| close | number[] | 5,070 | Closing price for the minute |

### Summary Statistics
- **Total bars:** 5,070
- **Date range:** 2026-04-29T13:30:00Z to 2026-05-15T19:59:00Z
- **Trading days covered:** ~13 trading days
- **Bar interval:** 1 minute
- **Open range:** 398.04 – 428.04
- **High range:** 398.83 – 428.15
- **Low range:** 398.01 – 427.81
- **Close range:** 398.23 – 428.01
- **Volume range:** 6,423 – 2,197,202
- **Avg volume per bar:** ~51,987

## Error States
When a time range has no data (e.g., weekend dates), the API returns:
```json
{
  "error": {
    "code": "KOY_003",
    "message": "No data in selected time range"
  }
}
```
The `graph` object will be empty `{}`.

## API Authentication
- No visible API key in requests
- Session-based auth via cookies
- `x-tab-id` header appears to be a session/tab identifier
- CORS: `access-control-allow-origin: *`

## Cache
- Responses include `cache-control: private, no-cache, no-store, must-revalidate`
- CloudFront CDN with `x-cache: Miss from cloudfront`

## Source: Data Table (DOM)
When Show Table is toggled, visible rows contain Date and MSFTPrice columns.
- **Column 1:** Date string (e.g., "05-15-202603:59pm") — combines date + time
- **Column 2:** Price string (e.g., "421.92") — last trade price

## Source: SVG Chart
The chart is rendered as an inline SVG with:
- Y-axis price labels: 414.00 to 429.00 (current visible range)
- X-axis time labels: 10:00, 10:30, ..., 3:30
- Date labels: 5/15, 5/18 (shifting dates)
- A price line series
- Volume bars at bottom

## Network/API notes

# Network Analysis — MSFT Intraday (Koyfin)

## Key API Endpoint

### Graph Data
```
POST https://app.koyfin.com/api/v3/data/graph?schema=packed
```

**Request headers:**
```
Content-Type: application/json
Accept: application/json, text/plain, */*
Referer: https://app.koyfin.com/charts/gip/eq-kuqeq3
x-tab-id: <session-tab-id>
User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36
sec-ch-ua: "Chromium";v="148", "Google Chrome";v="148", "Not/A)Brand";v="99"
sec-ch-ua-platform: "macOS"
sec-ch-ua-mobile: ?0
```

**Request body (1d view):**
```json
{"id":"eq-kuqeq3","key":"p_live","dateFrom":"2026-04-15","dateTo":"2026-05-18","priceFormat":"standard"}
```

**Response headers:**
```
content-type: application/json; charset=utf-8
cache-control: private, no-cache, no-store, must-revalidate
access-control-allow-origin: *
x-cache: Miss from cloudfront
x-amz-cf-pop: GRU3-P11
x-frame-options: SAMEORIGIN
strict-transport-security: max-age=600
```

**Response status:** 200 OK

**Response size:** ~300 KB (5,070 OHLCV bars)

## Other API Calls

### Data Keys (multiple calls)
```
POST https://app.koyfin.com/api/v3/data/keys
```
Fetches ticker metadata, price history, financial data keys.

### Ticker Filters
```
POST https://app.koyfin.com/api/v3/tickers/filters
```

### Holidays Calendar
```
POST https://app.koyfin.com/api/v3/data/vocabularies/holidays
```

### Top Tickers
```
GET /api/v1/bfc/tickers/top?categories=Economic&categories=Forex&...
```

## Request Flow
1. Page loads → `data/keys` requests fire first (ticker metadata)
2. `tickers/filters` loads
3. `data/vocabularies/holidays` loads
4. `data/graph?schema=packed` loads the actual OHLCV intraday data
5. Additional `data/keys` calls for price history data

## API Patterns
- All data endpoints use `POST` with JSON bodies
- No API key in request headers (session-based auth)
- `x-tab-id` header appears to be a session identifier
- Responses include CloudFront CDN headers
- CORS allows all origins (`access-control-allow-origin: *`)
- Error response (no data): `{"error": {"code": "KOY_003", "message": "No data in selected time range"}}`

## Sample Request/Response

**Request:**
```json
POST /api/v3/data/graph?schema=packed
Host: app.koyfin.com
Content-Type: application/json

{
  "id": "eq-kuqeq3",
  "key": "p_live",
  "dateFrom": "2026-04-15",
  "dateTo": "2026-05-18",
  "priceFormat": "standard"
}
```

**Response (abbreviated):**
```json
{
  "KID": "eq-kuqeq3",
  "id": "MSFT:US",
  "category": "eq",
  "startDate": "2026-04-29T13:30:00Z",
  "endDate": "2026-05-15T19:59:00Z",
  "graph": {
    "date": ["2026-04-29T13:30:00Z", ...],
    "volume": [690149, ...],
    "open": [424.519, ...],
    "high": [424.519, ...],
    "low": [421.79, ...],
    "close": [423.75, ...]
  },
  "error": null
}
```

## Script and examples

- Extractor: `@../scripts/intraday/extract.js`
- Script README: `@../scripts/intraday/README.md`
