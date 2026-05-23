# Shopify Inc. (SHOP) — DCF Assumption Register

This file lists the assumptions required to build a full DCF model for Shopify. It is not the model itself; it is the assumption inventory and recommended starting values.

---

## 1. Core model setup

| Assumption | Base value | Range / sensitivity | Rationale / source |
|---|---:|---:|---|
| Model type | Unlevered DCF / FCFF | FCFE cross-check optional | Shopify has minimal debt and material net cash |
| Forecast period | 10 years | 5 / 10 / 15 years | High-growth asset needs longer fade period |
| Currency | USD | n/a | Shopify reports in USD |
| Shares outstanding | 1.30B | Update quarterly | Koyfin / company filings |
| Net cash | $5.56B | Update quarterly | $5.74B cash/investments less $179M debt per Koyfin |
| Current price | $103.00 | Update market close | Koyfin extraction |
| Terminal method | Perpetuity growth | Exit multiple cross-check | Standard DCF framework |

---

## 2. Revenue assumptions

| Driver | Base value | Bull | Bear | Notes |
|---|---:|---:|---:|---|
| FY2026 revenue | $14.80B | $15.2B | $14.3B | Koyfin consensus +28.1% |
| FY2027 revenue | $18.32B | $19.2B | $17.2B | Koyfin consensus +23.8% |
| FY2028 revenue | $22.93B | $24.5B | $20.5B | Koyfin consensus +25.2% |
| 2029 growth | 20.0% | 24.0% | 15.0% | Fade after consensus window |
| 2030 growth | 17.0% | 22.0% | 13.0% | AI/B2B/international optionality drives bull |
| 2031 growth | 14.0% | 19.0% | 10.0% | Growth fade |
| 2032 growth | 11.0% | 16.0% | 8.0% | Growth fade |
| 2033 growth | 9.0% | 13.0% | 6.5% | Growth fade |
| 2034 growth | 7.0% | 10.0% | 5.0% | Growth fade |
| 2035 growth | 5.0% | 8.0% | 4.0% | Approaches terminal |
| Terminal growth | 3.5% | 4.5% | 2.5% | Global ecommerce + inflation; sensitivity critical |

### Revenue build drivers needed in full model

1. **GMV growth:** Current Q1 2026 GMV $100.7B, +35% YoY; FY2025 GMV $378.4B, +29%.
2. **Total take rate:** Revenue / GMV was ~3.05% in FY2025. Model by segment to avoid overfitting.
3. **Subscription Solutions:** Driven by MRR, merchant count, plan mix, Plus adoption, pricing, app/theme/domain/platform fees.
4. **Merchant Solutions:** Driven by GMV, Shopify Payments penetration, Shop Pay, Capital, Shipping, Tax, Markets, POS, partner/referral fees.
5. **International growth:** International revenue +mid-30s; model as growth premium to North America initially.
6. **B2B growth:** High growth off smaller base; include explicit ramp if data available.
7. **POS/offline:** High-20s growth; model as incremental channel mix.
8. **AI/agentic commerce:** Keep outside base until Shopify discloses GMV/revenue; include bull-case uplift.

---

## 3. Gross margin assumptions

| Assumption | Base | Bull | Bear | Notes |
|---|---:|---:|---:|---|
| Subscription Solutions gross margin | 80–81% | 82% | 78% | Q1/FY2025 around 80% |
| Merchant Solutions gross margin | 38–39% | 41% | 35% | Payments/capital mix sensitive |
| Consolidated gross margin FY2026 | 48.5% | 49.5% | 47.0% | Q1 2026 48.8%; FY2025 48.1% |
| Long-term consolidated gross margin | 46.5–48.0% | 49% | 44–45% | Depends on Merchant mix and payments economics |

Key required sub-assumptions:

- Shopify Payments take rate and processor cost.
- Shop Pay / BNPL economics.
- Shopify Capital credit loss and funding economics.
- Mix between Subscription and Merchant Solutions.
- AI inference / infrastructure cost if bundled into gross margin.
- International payment/localization cost.

---

## 4. Operating expense assumptions

| Line item | FY2025 actual | Base long-term | Bull | Bear | Notes |
|---|---:|---:|---:|---:|---|
| Sales & marketing / revenue | 14.4% | 11–12% | 10% | 14% | Scale leverage, brand strength |
| R&D / revenue | 13.3% | 10–11% | 9% | 13% | AI investment may keep elevated |
| G&A / revenue | 4.1% | 3% | 2.5% | 4% | Scale leverage |
| Transaction & loan losses / revenue | 3.6% | 3.0–3.5% | 2.5% | 5% | Capital/payments loss risk |
| Total opex / revenue | 35.4% | 28–30% | 25–27% | 34–36% | Determines margin upside |

---

## 5. Profitability / FCF assumptions

| Assumption | Base | Bull | Bear | Rationale |
|---|---:|---:|---:|---|
| FY2026 FCF margin | 16.5% | 18.0% | 14.0% | Management guides mid-teens near-term |
| FY2027 FCF margin | 17.5% | 19.5% | 14.5% | Operating leverage |
| FY2028 FCF margin | 18.5% | 21.0% | 15.0% | Scale + mix |
| Terminal FCF margin | 22.0% | 25–27% | 16–18% | Main DCF sensitivity |
| SBC / revenue | 4.0% near-term | 2.5–3.0% LT | 5% | Treat as economic cost via dilution or cash expense |
| Capex / revenue | 0.2–0.5% | 0.2% | 1.0% | Asset-light software model |
| Working capital | Slight source/neutral | Neutral | Use of cash | Merchant capital/loan receivables can distort |
| Cash tax rate | 10–15% near term | 15% | 20%+ | NOL/structure; normalize over time |

Full model should reconcile FCF from NOPAT + D&A - capex - change in NWC, then separately decide SBC treatment. Recommended conservative approach: **do not add back SBC as free value**; either deduct SBC from FCF or model diluted shares/buyback explicitly.

---

## 6. WACC assumptions

| Input | Base | Low | High | Notes |
|---|---:|---:|---:|---|
| Risk-free rate | 4.2% | 3.9% | 4.4% | 10Y UST context in May 2026 |
| Equity risk premium | 5.0% | 4.2% | 5.6% | Damodaran / market range |
| Beta | 1.10 adjusted | 0.96 | 1.25 | Adjusted beta sources; raw 5Y Koyfin beta 2.64 too volatile for base |
| Cost of equity | 9.7% | 7.9% | 11.4% | CAPM |
| Cost of debt pre-tax | 4.25% | 4.0% | 4.5% | Minimal debt; low impact |
| Tax rate for debt shield | 15% | 10% | 25% | Minimal debt; low impact |
| Debt / total capital | ~0% | 0% | 1% | Net cash balance sheet |
| WACC | 9.5–9.7% | 8.0–8.5% | 10.5–11.5% | Nearly equal to cost of equity |

Recommended sensitivity grid: WACC **8.5% / 9.5% / 10.5%** and terminal growth **2.5% / 3.5% / 4.5%**.

---

## 7. Scenario assumptions

### Bear case

- Revenue growth decelerates from high-20s to below 15% by 2029.
- GMV growth slows with consumer weakness and merchant formation pressure.
- Gross margin falls to 44–45% as Merchant Solutions mix and payment costs pressure economics.
- FCF margin remains 15–17% due to AI, international and regulatory investment.
- WACC 10.5%, terminal growth 2.5–3.0%.
- Implied value: **$60–85/share**.

### Base case

- Consensus revenue through FY2028; growth fades to 5% by FY2035.
- Gross margin stable around 47–48%.
- FCF margin expands from mid-teens to 22% terminal.
- WACC 9.5%, terminal growth 3.5%.
- Implied value: **~$92/share**.

### Bull case

- AI, B2B, international and enterprise keep revenue CAGR above 20% for longer.
- Payments penetration rises toward 75%+ without severe take-rate compression.
- FCF margin reaches 25%+.
- WACC 8.5–9.0%, terminal growth 4.0–4.5%.
- Implied value: **$150–200+/share** depending on duration and margin.

---

## 8. Model outputs required

A full DCF model should produce:

1. Revenue by segment: Subscription Solutions, Merchant Solutions.
2. GMV, take rate, GPV penetration and Merchant Solutions take-rate bridge.
3. Gross profit by segment and consolidated gross margin.
4. Operating expenses by line item.
5. EBIT, NOPAT and operating margin.
6. D&A, capex, working capital, SBC treatment.
7. Unlevered FCF and FCF margin.
8. WACC schedule.
9. Terminal value by perpetuity and exit multiple.
10. Equity bridge: EV + cash/investments - debt +/- other investments if separately valued.
11. Share count / dilution / buyback schedule.
12. Sensitivity tables: WACC vs g; revenue CAGR vs terminal FCF margin; payments penetration vs gross margin.
13. Scenario table: Bear/Base/Bull price per share and upside/downside.
