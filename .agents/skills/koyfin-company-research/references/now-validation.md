# NOW validation notes

Validation ticker: NOW / ServiceNow (`eq-v767nn`). Use these notes to avoid MSFT-specific assumptions.

| Tab | Validation result | Cross-ticker / missing-data lesson |
|---|---|---|
| Overview | Partial pass | Ticker selector can match sidebar text (`S`); top quote/valuation grid can use different DOM. Use `koyfinTicker()` and fallback label/value parsing. |
| Description | Pass with issues | Placeholder `Upgrade` values should become `null` plus `status: premium_or_upgrade_limited`; no-dividend companies need explicit no-dividend status. |
| Percentile Rank | Pass with fixes | Performance rank tab may have fewer rank columns than Fundamentals. Use `data-rank` attributes and tab-aware columns. Strip emoji from document title. |
| Dividend | Pass | No-dividend state renders empty schedule and "Sorry, there are no dividends". Emit empty history plus `status: no_dividend`. |
| Ownership | Auth required | Current session gated this tab. Detect registered-user paywall and return `status: auth_required` instead of empty tables. |
| Earnings History | Auth required | Detect auth gate before searching for scroll/table containers. |
| Actuals and Consensus | Auth required | The estimates table may be gated; return `auth_required` when no table renders and paywall text exists. |
| Price Target | Partial pass | NOW has sell-side coverage but API `/data/keys` failed for `eq-v767nn`; DOM extraction still captured targets/ratings. Treat API as optional. |
| Estimates Overview | Partial pass | Fiscal year-end differs (Dec vs Jun). EBIT data can be premium-gated with `Upgrade` / `FY -1` placeholders. |
| Estimates Trends | Partial pass | Multi-line cells can be value/unit, not low/high ranges. Empty estimate-range cells should emit `null`. |
| Highlights | Auth required | Financial Analysis page can be fully gated. Ticker selectors may return `NOW\nServiceNow, Inc.`; use first clean token. |
| Income Statement | Auth required | Return auth status when FA table root is absent and paywall text exists. |
| Balance Sheet | Auth required | Same FA paywall; post-auth validation needed for fiscal-calendar differences. |
| Cash Flow | Auth required | Same FA paywall; no `/data/graph` calls fire when gated. |
| Multiples | Auth required | Same FA paywall; direct URL with `eq-v767nn` reaches shell but no table. |
| Enterprise Value | Auth required | Same FA paywall. Remove hardcoded ticker values before re-test. |
| Profitability | Auth required | Same FA paywall. |
| ROIC | Auth required / navigation issue | Use known NOW id `eq-v767nn`; post-auth validation still needed. |
| Solvency | Auth required | Same FA paywall; direct URL pattern confirmed. |
| News | Auth required | News can show an auth wall. Distinguish auth wall from genuine empty feed. |
| Press Releases | Auth required | Same auth-wall handling needed; don't treat 0 items as empty feed if paywall text exists. |
| Filings | Pass | DOM triple structure works. Multi-word form codes (`DEF 14A`, `SCHEDULE 13G`) must not be truncated. |
| Transcripts | Pass with fixes | Virtual list needs scroll-to-load; categories can include Analyst/Investor Day and Shareholder/Analyst Calls. |
| Historical | Pass with adapted extractor | NOW default chart is OHLC candlestick, unlike MSFT line chart. Prefer XHR interception/API data over SVG calibration. |
| Comparison | Pass with adapted extractor | NOW has one metric and no peers. Detect largest SVG by area; don't hardcode 1480px or MSFT metric whitelist. |
| Intraday | Pass | API tier works for NOW. Parameterize ticker/KID; period controls may be spans, not buttons. |
| Performance | Pass | Table extraction works; chart annotations may be absent, so compute high/low from table/API. |

## Global fixes applied after NOW validation

- Added `scripts/common/preflight.js` with `koyfinTicker()`, `koyfinSecurityId()`, `koyfinGateStatus()`, and base-result helpers.
- Prepended copy-safe helper functions to every `scripts/<tab>/extract.js`.
- Removed hardcoded `ticker: 'MSFT'`, `const TICKER = 'MSFT'`, and default `eq-kuqeq3` values from extractors that used them.
- Updated the skill workflow to run preflight and treat auth/premium gates separately from genuine empty data.
- For `auth_required`, stop the tab extraction and ask the user to log in to Koyfin in Chrome before retrying; keep a structured artifact with `action_required` and `user_message`.
