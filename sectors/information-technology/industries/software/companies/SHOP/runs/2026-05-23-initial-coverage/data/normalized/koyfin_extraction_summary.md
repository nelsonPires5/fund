# Koyfin extraction summary — Shopify Inc. (SHOP US)

Run: `sectors/software/companies/SHOP/runs/2026-05-23-initial-coverage`  
Raw Koyfin directory: `data/raw/koyfin/`  
Extraction timestamp: 2026-05-23 via authenticated Koyfin/Chrome session.

## File inventory

- Unified pipeline completed: **27 / 27 tabs succeeded**, 0 failed (`meta.json`). Koyfin KID: `eq-q6lsgw`.
- Raw files produced: **58 files** = **31 JSON** + **27 screenshots**.
- Each tab has `data.json` and `screenshot.png`: overview, description, percentile-rank, dividend, ownership, earnings-history, actuals-and-consensus, price-target, estimates-overview, estimates-trends, highlights, income-statement, balance-sheet, cash-flow, multiples, enterprise-value, profitability, roic, solvency, news, press-releases, filings, transcripts, historical, comparison, intraday, performance.
- Extra manual fallback files created after pipeline gaps:
  - `data/raw/koyfin/multiples/manual_visible_structured.json`
  - `data/raw/koyfin/roic/manual_visible_structured.json`
- Aggregates: `data/raw/koyfin/meta.json`, `data/raw/koyfin/outputs.json`.

## Missing / gated / caveats

- No auth gate encountered.
- `overview` preflight flagged `premium_or_upgrade_limited`, but the overview extractor still captured core fields; no obvious overview data block was unusable.
- `multiples/data.json` pipeline extractor returned zero metrics; manual visible-DOM fallback captured the table.
- `roic/data.json` pipeline extractor returned `status: no_data`; manual visible-DOM fallback captured ROIC/NOPAT/invested capital rows.
- `price-target` API sub-extract had an identifier error, but DOM extraction captured price targets and ratings.
- Dividend tab: no dividend history (`hasDividendData=false`); treat as **no dividend**.

## Company/profile snapshot

- Company: **Shopify Inc.**, NasdaqGS, Information Technology / IT Services.
- HQ: Ottawa, Ontario, Canada. Founded 2004. Employees: **7,600**.
- Business: commerce platform for merchants to manage products/inventory, orders/payments, fulfillment/shipping, customer relationships, analytics, financing, web/mobile storefronts, POS, social channels and marketplaces; includes Shopify Payments, apps/themes, shipping labels, hardware, domain registration and Shop Campaigns.
- Next earnings: **Tue Aug 4, 2026 (pre-market)**.

## Market data / capital structure

- Last price: **$103.00**; 52-week low/high: **$94.00** / **$182.19**.
- Market cap: **$134.0B**; Enterprise value: **$127.7B**.
- Cash & investments: **$5.74B**; total debt: **$179M**; shares out: **1.30B**.
- Beta (5Y monthly): **2.64**; 1Y volatility: **56.17**.
- Total return: **1M -21.95%, 3M -18.38%, YTD -36.01%, 1Y -0.28%**.

## Financial history highlights

- Revenue: **$8.9B FY2024**, **$11.6B FY2025**, **$12.4B current/LTM**; growth **25.78% / 30.14% / 31.85%** respectively.
- Gross profit: **$4.5B FY2024**, **$5.6B FY2025**, **$5.9B LTM**; gross margin **50.36% / 48.07% / 47.97%**.
- EBITDA: **$1.3B FY2024**, **$1.9B FY2025**, **$2.1B LTM**; EBITDA margin **14.45% / 16.69% / 17.37%**.
- EBIT: **$1.2B FY2024**, **$1.9B FY2025**, **$2.1B LTM**; EBIT margin **14.04% / 16.42% / 17.13%**.
- Net income: **$2.0B FY2024**, **$1.2B FY2025**, **$1.3B LTM**; net margin **22.74% / 10.65% / 10.77%**. Normalized net margin LTM: **9.36%**.
- Free cash flow: **$1.6B FY2024**, **$2.0B FY2025**, **$2.1B LTM**. Stock-based compensation LTM: **$0.5B**.
- Balance sheet current/LTM: cash/ST investments **$5.7B**, total assets **$14.1B**, total equity **$12.5B**.
- ROIC manual fallback: **9.07% FY2024**, **12.30% FY2025**, **13.70% LTM**; NOPAT **$1.0B / $1.6B / $1.8B**, avg invested capital **$11.4B / $13.2B / $13.2B**.

## Consensus / estimates

- FY consensus sales: **$14.80B FY2026 (+28.05%)**, **$18.32B FY2027 (+23.80%)**, **$22.93B FY2028 (+25.20%)**.
- FY consensus EPS: **$1.84 FY2026 (+28.48%)**, **$2.33 FY2027 (+26.95%)**, **$3.27 FY2028 (+40.20%)**.
- FY consensus EBITDA: **$2.74B FY2026 (+36.16%)**, **$3.60B FY2027 (+31.52%)**, **$4.89B FY2028 (+35.80%)**.
- FY consensus EBIT: **$2.65B FY2026 (+33.88%)**, **$3.51B FY2027 (+32.39%)**, **$4.65B FY2028 (+32.77%)**.
- Near-quarter overview: revenues **$3.17B actual Q1** and **$3.44B next quarter estimate** (+8.58% seq); EPS **$0.36 actual Q1** and **$0.40 next quarter estimate** (+10.14% seq).

## Valuation / multiples

Manual fallback current/LTM multiples:

- **EV/Sales LTM 10.3x**, **EV/Sales NTM 8.3x**.
- **Price/Sales LTM 10.8x**, **Price/Sales NTM 8.7x**.
- **EV/EBITDA LTM 59.5x**, **EV/EBITDA NTM 44.4x**.
- **EV/EBIT LTM 60.3x**, **EV/EBIT NTM 45.6x**.
- **P/E LTM 101.5x**, **P/E NTM 54.5x**.
- **Price/Book LTM 10.7x**, **Price/Tangible Book LTM 11.2x**.

## Price target / ratings

- Current price in tab: **$103.00**.
- Price target: low **$105**, average **$151.11**, high **$200**.
- Implied return potential to average target: **46.71%**.
- Ratings distribution: **10 Strong Buy, 28 Buy, 12 Hold, 1 Sell, 0 Strong Sell**; covering analysts **51**.

## Ownership / shareholder notes

- Insider ownership extracted from ownership tab. Insider total: **79,616,697 shares**, **$8.20B**, **6.14% of market cap**.
- Tobias Lütke: **79,136,132 shares**, **$8.15B**, **6.10% of market cap**; Founder, Chairman, CEO and Head of R&D.
- Other listed insider holdings are small (<0.02% each).

## Recent earnings / news / filings / transcripts

- Earnings history: latest **1Q 2026** reported May 5, 2026; actual sales **$3.17B** vs avg estimate **$3.09B**; beat **$83.32M / 2.70%**; 1-day price reaction **-15.62%**; TTM sales **$12.37B**, EV/Sales **12.9x**.
- Recent quarters show consistent sales beats; examples: 4Q25 beat **2.25%** with -6.70% reaction; 3Q25 beat **3.05%** with -6.94% reaction; 2Q25 beat **5.21%** with +21.97% reaction.
- Recent news headlines include Q1 revenue / EPS flash items and “Shopify Highlights Merchants Cleared US$100 Billion in Q1 GMV” (May 5, 2026).
- Press releases: latest “Shopify Delivers Again as Merchants Clear $100 Billion in Q1 GMV” (May 5, 2026); Q1 2026 results announcement (Apr 14, 2026); automatic securities disposition plans adopted by CEO (Mar 6, 2026).
- Filings: latest include 8-K (May 8, 2026), 10-Q for quarter ended Mar 31, 2026 (May 5, 2026), 8-K results filing (May 5, 2026), 10-K/A (Apr 29, 2026), Form 4s/144s.
- Transcripts: latest **Q1 2026 Earnings Call** (May 5, 2026), Morgan Stanley Technology presentation (Mar 3, 2026), **Q4 2025 Earnings Call** (Feb 11, 2026), investor conferences.
