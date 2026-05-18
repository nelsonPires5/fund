---
name: koyfin-company-research
description: Navigate the Koyfin app for company/ticker research and extract structured data from Koyfin Security Analysis tabs. Use when the user asks to analyze a company in Koyfin, explore security analysis pages, compare tabs, or export Koyfin tables/charts/news/financials/estimates as CSV or JSON using browser-harness.
---

# Koyfin Company Research

Use this skill to research one company ticker in `https://app.koyfin.com` and extract structured tab data.

## Before navigating

1. Load the browser-harness skill: `/Users/nelson/.agents/skills/browser-harness/SKILL.md`.
2. Use the user's authenticated Chrome session. Do not enter credentials or change account settings.
3. Put all transient screenshots, raw captures, debug logs, and scratch outputs under `/tmp/<TICKER>/<tab-slug>/`.
4. Keep only final skill/docs/scripts in the repo.

## Company research workflow

1. **Open the ticker.** In Koyfin, search the ticker, select the equity security, and confirm the Security Analysis sidebar is active.
2. **Start with Snapshots.** Use Overview and Description for business context, then Percentile Rank, Dividend, Ownership, and Earnings History for quick quality/valuation/shareholder checks.
3. **Read sell-side expectations.** Use Analyst Estimates tabs to compare current fundamentals against consensus, ratings, price targets, estimate level, and estimate revisions.
4. **Build the financial model view.** Use Financial Analysis tabs to extract statements, multiples, enterprise value, profitability, ROIC, and solvency across annual/quarterly/LTM periods.
5. **Check narrative and disclosures.** Use News, Press Releases, Filings, and Transcripts for recent events, management commentary, and SEC filing cadence.
6. **Use graphs for time series.** Use Historical, Comparison, Intraday, and Performance for price/return/peer visualizations. Prefer network data; fall back to SVG/table extraction when necessary.
7. **Handle missing data explicitly.** Some tickers lack sell-side coverage, dividends, filings, transcripts, or chart series. Emit empty data with `status="unavailable"` or clear `errors`; never invent rows.

## Extraction pattern

Use the reference for the active tab, run preflight, then run the matching script.

```bash
browser-harness <<'PY'
# Navigate to the active Koyfin tab first.
preflight = open('skills/koyfin-company-research/scripts/common/preflight.js').read()
print(js(preflight + '; koyfinBaseResult("<tab-slug>")'))
code = open('skills/koyfin-company-research/scripts/<tab-slug>/extract.js').read()
result = js(code)
print(result)
PY
```

If preflight returns `status: "auth_required"`, stop normal extraction, save that status, and ask the user to log in to Koyfin in the Chrome session before retrying. Do not treat it as a genuine empty table. Required fields for every output: `ticker`, `tab`, `extracted_at`. Add tab-specific fields such as `section`, `metric`, `period`, `value`, `unit`, `date`, `source`, `title`, `url`, `series`, or `status`.

## Security Analysis tab map

| Section | Tab | Main research use | Guide | Script |
|---|---|---|---|---|
| Snapshots | Overview | first-pass company dashboard: quote, key metrics, performance, valuation, capital structure, estimates, chart, news | `@references/overview.md` | `@scripts/overview/extract.js` |
| Snapshots | Description | business description, profile fields, key data, dividends, related securities | `@references/description.md` | `@scripts/description/extract.js` |
| Snapshots | Percentile Rank | relative valuation/quality/performance ranks vs own history and peer cohorts | `@references/percentile-rank.md` | `@scripts/percentile-rank/extract.js` |
| Snapshots | Dividend | dividend policy, growth, yield, payout, payment history and no-dividend detection | `@references/dividend.md` | `@scripts/dividend/extract.js` |
| Snapshots | Ownership | insider/institutional ownership, transactions, holders, mutual funds and ETFs | `@references/ownership.md` | `@scripts/ownership/extract.js` |
| Snapshots | Earnings History | reported revenue versus estimates, surprises, price reactions, valuation at report dates | `@references/earnings-history.md` | `@scripts/earnings-history/extract.js` |
| Analyst Estimates | Actuals and Consensus | historical actuals and forward consensus by annual/quarterly period | `@references/actuals-and-consensus.md` | `@scripts/actuals-and-consensus/extract.js` |
| Analyst Estimates | Price Target | sell-side price targets, ratings distribution, return potential and no-coverage detection | `@references/price-target.md` | `@scripts/price-target/extract.js` |
| Analyst Estimates | Estimates Overview | forward sales/EBITDA/EBIT/EPS estimate matrix and next-quarter summary | `@references/estimates-overview.md` | `@scripts/estimates-overview/extract.js` |
| Analyst Estimates | Estimates Trends | estimate revisions and analyst-count trend by fiscal year and metric | `@references/estimates-trends.md` | `@scripts/estimates-trends/extract.js` |
| Financial Analysis | Highlights | high-level financial, capital structure and cash-flow metrics across periods | `@references/highlights.md` | `@scripts/highlights/extract.js` |
| Financial Analysis | Income Statement | revenue, profit, expense, EPS and supplemental income statement line items | `@references/income-statement.md` | `@scripts/income-statement/extract.js` |
| Financial Analysis | Balance Sheet | asset, liability, equity and capital structure line items | `@references/balance-sheet.md` | `@scripts/balance-sheet/extract.js` |
| Financial Analysis | Cash Flow | operating/investing/financing cash flow, FCF and per-share cash metrics | `@references/cash-flow.md` | `@scripts/cash-flow/extract.js` |
| Financial Analysis | Multiples | historical valuation multiples across sales, earnings and book-value families | `@references/multiples.md` | `@scripts/multiples/extract.js` |
| Financial Analysis | Enterprise Value | market cap, debt, cash, EV and capital ratio bridge | `@references/enterprise-value.md` | `@scripts/enterprise-value/extract.js` |
| Financial Analysis | Profitability | returns, margins, turnover and liquidity metrics | `@references/profitability.md` | `@scripts/profitability/extract.js` |
| Financial Analysis | ROIC | ROIC formula, NOPAT, invested capital and component breakdown | `@references/roic.md` | `@scripts/roic/extract.js` |
| Financial Analysis | Solvency | leverage, interest coverage, debt coverage and bankruptcy-risk metrics | `@references/solvency.md` | `@scripts/solvency/extract.js` |
| News, Filings & Transcripts | News | recent company news feed metadata and source/time/title extraction | `@references/news.md` | `@scripts/news/extract.js` |
| News, Filings & Transcripts | Press Releases | company press release metadata and dates | `@references/press-releases.md` | `@scripts/press-releases/extract.js` |
| News, Filings & Transcripts | Filings | SEC/EDGAR filing list metadata: form, date, source/title | `@references/filings.md` | `@scripts/filings/extract.js` |
| News, Filings & Transcripts | Transcripts | earnings calls, conferences and special-call transcript metadata | `@references/transcripts.md` | `@scripts/transcripts/extract.js` |
| Graphs | Historical | historical price chart, overlays, technical indicators and chart data extraction | `@references/historical.md` | `@scripts/historical/extract.js` |
| Graphs | Comparison | peer comparison charts across price/performance and valuation metrics | `@references/comparison.md` | `@scripts/comparison/extract.js` |
| Graphs | Intraday | intraday OHLCV series, visible data table and market-closed/no-data handling | `@references/intraday.md` | `@scripts/intraday/extract.js` |
| Graphs | Performance | performance/total-return time series and high/low markers | `@references/performance.md` | `@scripts/performance/extract.js` |

## Common Koyfin extraction notes

- Koyfin is a React SPA. Many tables are div-based grids, not HTML `<table>` elements.
- CSS module hashes change. Prefer structural selectors, text labels, URL patterns, and stable attributes over full generated class names.
- Financial Analysis pages often use `/api/v3p/data/graph?schema=packed` with per-metric requests and period toggles (`LTM`, `Q`, `Y`).
- Analyst/graph pages may expose `/api/v3/data/graph`, `/api/v3p/data/keys`, `/api/v3/fa/estimate-data`, or only rendered DOM/SVG.
- News/filings/transcripts often render as virtual lists; scroll to load more items before extraction.
- Graph export buttons may export images only. Use network capture or SVG/table parsing for structured data.
- Network calls require the authenticated browser session. Do not copy cookies/tokens into saved artifacts.
- Run `@scripts/common/preflight.js` before tab extractors to distinguish `auth_required`, `premium_or_upgrade_limited`, genuine empty data, and selector failures.
- Read `@references/now-validation.md` for cross-ticker edge cases observed on ServiceNow (`NOW`).

## Missing-data policy

Use this policy for every ticker, especially outside large covered names like MSFT:

- Auth gate / registered-user paywall: stop extraction, output `status: "auth_required"` with URL/tab, and tell the user: “Please log in to Koyfin in the Chrome session, then I can retry this tab.”
- Premium/Upgrade placeholder: output `status: "premium_or_upgrade_limited"` or `null` values for gated fields; tell the user the field may require a higher Koyfin plan if it blocks the requested analysis.
- No sell-side coverage: output price-target/estimate headers plus `status: "no_coverage"`.
- No dividends: output empty dividend history plus `status: "no_dividend"`.
- No filings/transcripts/news: output empty item list plus `status: "empty"`.
- Graph no-data response (`KOY_003` or empty series): output empty series plus request context.
- Selector/network mismatch: output an error object with `ticker`, `tab`, `url`, `message`, and `extracted_at`.

## Validation pattern

After creating or changing an extractor, test it on a second ticker with different coverage (for example `NOW`) and record whether optional sections are absent, renamed, gated, or delayed. Update the tab reference when behavior differs from MSFT. See `@references/now-validation.md` for the first validation pass.
