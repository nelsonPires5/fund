# ServiceNow (NOW) — Assumptions Required for DCF Model

## Required Koyfin inputs

The DCF model should not be finalized until these Koyfin fields are captured:

1. Current share price
2. Market capitalization
3. Enterprise value
4. Diluted shares outstanding
5. Total debt
6. Cash and equivalents / marketable securities
7. Net debt / net cash
8. Beta
9. Historical and forward revenue consensus
10. Historical and forward EBITDA / EBIT consensus
11. Historical and forward EPS consensus
12. Historical and forward FCF consensus
13. Forward EV/Sales, EV/EBITDA, EV/FCF, P/E multiples
14. Consensus price target distribution
15. Estimates revision trends
16. Peer comparable multiples
17. Historical stock performance and volatility

## Historical financial inputs

Use actuals from FY2023-FY2025 and Q1 2026:

| Item | Required detail |
|---|---|
| Subscription revenue | 2023-2025 actual, 2026E-2030E forecast |
| Professional services revenue | 2023-2025 actual, forecast as % total revenue |
| Gross profit | Subscription and total gross margin |
| Sales & marketing | GAAP and non-GAAP if available; % revenue |
| R&D | GAAP and non-GAAP if available; % revenue |
| G&A | GAAP and non-GAAP if available; % revenue |
| Operating income | GAAP and non-GAAP bridge |
| SBC | $ and % revenue |
| D&A/amortization | Historical and projected |
| CapEx | Historical and projected |
| Operating cash flow | Historical |
| Free cash flow | Historical |
| Deferred revenue / RPO | Revenue visibility and working-capital support |
| Tax rate | GAAP and cash tax assumptions |

## Base-case operating assumptions

| Assumption | Preliminary value / approach | Source / rationale |
|---|---|---|
| FY2026 subscription revenue | $15.735bn-$15.775bn | Company guidance |
| FY2026 subscription growth | 22.0%-22.5% reported; 20.5%-21.0% constant currency | Company guidance |
| Professional services mix | ~3% of total revenue | FY2025 actual |
| Subscription gross margin | 81.5% non-GAAP | FY2026 guide |
| Non-GAAP operating margin | 31.5% | FY2026 guide |
| FCF margin | 35% | FY2026 guide |
| Renewal rate | 98% | FY2025 10-K |
| Forecast period | 2026E-2030E | Matches management long-term target window |
| Terminal growth | 2.5%-3.0% base | Long-term GDP / mature software |
| Cash tax rate | 21%-23% | FY2025 effective tax 22.7%; non-GAAP tax ~21% |
| CapEx | ~5%-6% of revenue near term, fade as appropriate | FY2025 capex $868m / revenue $13.278bn; FY2026 FCF guide implies ~5% capex |
| SBC treatment | Model separately; include dilution/share count or subtract economic cost in alternative case | Material at ~15% revenue |

## Scenario assumptions

### Bear case

- FY2026 at low end of guide.
- Subscription growth decelerates faster after 2026 due to AI competition, suite bundling and large-deal scrutiny.
- 2030 subscription revenue below management ambition.
- Non-GAAP operating margin flat around 30%-31% due to gross margin pressure and M&A integration.
- FCF margin low-to-mid 30s.
- Higher WACC and lower terminal growth.

### Base case

- FY2026 at midpoint of guide.
- Subscription revenue grows high-teens in 2027 and fades toward low teens by 2030.
- 2030 subscription revenue approximates management’s $30bn ambition.
- Non-GAAP operating margin expands to 32%-34% after FY2026 acquisition headwinds.
- FCF margin mid/high 30s.
- WACC around market-implied large-cap software cost of capital.

### Bull case

- FY2026 at high end of guide.
- AI, security, CRM and industry workflows keep subscription growth near 20% longer.
- 2030 subscription revenue exceeds $30bn.
- Non-GAAP operating margin reaches 35%+.
- FCF margin approaches high-30s/40%.
- Premium terminal multiple supported by durable growth and high returns.

## Model mechanics required

- Build formulas, not hardcoded derived values.
- Use separate Bear/Base/Bull assumption blocks.
- Include a case selector.
- Use 5-year explicit forecast plus terminal value.
- Include WACC sheet with CAPM.
- Include DCF sensitivity tables:
  - WACC vs terminal growth
  - Revenue CAGR vs terminal operating margin
  - FCF margin vs terminal growth
- Add source comments for every hardcoded input.
- Reconcile DCF FCF to reported FCF and explain differences.
- Treat stock-based compensation explicitly through diluted share count and/or economic cost sensitivity.

## Open items before final DCF

- Koyfin current price and market cap.
- Koyfin consensus estimates and revisions.
- Koyfin forward multiple table.
- Koyfin peer comps.
- Current 10Y Treasury and beta.
- Post-Armis/Veza net debt and share count adjustment if Koyfin reflects latest close.
