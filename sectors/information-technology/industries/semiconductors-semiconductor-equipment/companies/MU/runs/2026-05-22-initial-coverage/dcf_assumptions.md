# Micron Technology (MU) DCF Assumptions

**Run:** 2026-05-22-initial-coverage  
**Model Source:** Koyfin consensus and historical statements  
**Reporting Currency:** USD millions  

This document outlines the key inputs, formulas, and growth drivers underpinning our 5-year Discounted Cash Flow (DCF) model for Micron Technology (MU).

---

## 1. Cost of Capital (WACC) Parameters

Micron’s Weighted Average Cost of Capital (WACC) is calculated using the Capital Asset Pricing Model (CAPM) for the Cost of Equity. Due to Micron’s minimal net debt profile, the cost of capital is heavily equity-weighted.

| Parameter | Value | Source / Methodology |
|---|---|---|
| Risk-Free Rate ($R_f$) | 4.25% | US 10-Year Treasury Yield (as of mid-2026) |
| Beta ($\beta$) | 1.92 | Koyfin 5-Year Monthly Beta (reflecting high cyclical volatility) |
| Equity Risk Premium (ERP) | 5.50% | Institutional consensus risk premium |
| **Cost of Equity ($K_e$)** | **14.81%** | CAPM: $R_f + \beta \times ERP = 4.25\% + 1.92 \times 5.50\%$ |
| Pre-Tax Cost of Debt | 6.00% | Blended yield on outstanding long-term corporate bonds |
| Effective Tax Rate | 20.0% | Normalized corporate tax rate |
| **After-Tax Cost of Debt** | **4.80%** | Pre-tax Cost of Debt $\times (1 - t)$ |
| Market Value of Equity | $846,930M | Current price ($751.00) $\times$ Shares Outstanding (1,130M) |
| Total Debt Outstanding | $10,800M | Balance Sheet actuals (Koyfin) |
| Equity Weight ($W_e$) | 98.74% | $E / (D + E)$ |
| Debt Weight ($W_d$) | 1.26% | $D / (D + E)$ |
| **Blended WACC (Base)** | **12.00%** | Rounded down slightly to reflect a blended target capital structure |

---

## 2. 5-Year Projection Inputs (Base Case)

Our projections are anchored on Koyfin sell-side consensus for the peak years of the current AI-driven memory cycle (FY2026–FY2027) and assume a cyclical normalization in the outer years (FY2028–FY2030).

| Line Item | FY 2026E | FY 2027E | FY 2028E | FY 2029E | FY 2030E |
|---|---|---|---|---|---|
| **Revenue ($M)** | **109,700** | **172,760** | **165,260** | **107,600** | **107,970** |
| *YoY Revenue Growth* | *193.5%* | *57.5%* | *-4.3%* | *-34.9%* | *0.3%* |
| **EBITDA ($M)** | **89,410** | **149,340** | **139,780** | **53,230** | **52,860** |
| *EBITDA Margin* | *81.5%* | *86.4%* | *84.6%* | *49.5%* | *49.0%* |
| **EBIT ($M)** | **77,340** | **137,740** | **126,540** | **41,230** | **40,860** |
| *EBIT Margin* | *70.5%* | *79.7%* | *76.6%* | *38.3%* | *37.8%* |
| **Taxes ($M)** | **(15,468)** | **(27,548)** | **(25,308)** | **(8,246)** | **(8,172)** |
| **NOPAT ($M)** | **61,872** | **110,192** | **101,232** | **32,984** | **32,688** |
| **Depreciation & Amortization ($M)** | **12,070** | **11,600** | **13,240** | **12,000** | **12,000** |
| **Capital Expenditures ($M)** | **(25,000)** | **(28,000)** | **(22,000)** | **(15,000)** | **(15,000)** |
| *CapEx as % of Revenue* | *22.8%* | *16.2%* | *13.3%* | *13.9%* | *13.9%* |
| **Change in Working Capital ($M)** | **(3,000)** | **(4,000)** | **2,000** | **3,000** | **0** |
| **Unlevered FCF (UFCF) ($M)** | **45,942** | **89,792** | **94,472** | **32,984** | **29,688** |

---

## 3. Projection Rationale & Key Drivers

### **A. Revenue Projections**
*   **FY 2026E–FY 2027E (Peak Cycle):** Driven by severe undersupply in High-Bandwidth Memory (HBM3E and HBM4) and strong commodity DRAM/NAND pricing. Micron has guided that its entire HBM output is 100% sold out through calendar 2025/2026.
*   **FY 2028E–FY 2030E (Normalization):** Reflects historical memory cycles where supply additions (Samsung and SK Hynix capacity expansion) eventually catch up to demand, leading to pricing consolidation. Outer years assume a higher pricing floor than previous cycles due to the structurally lower wafer yield of HBM production (which requires 3x the wafer starts of standard DRAM).

### **B. Operating Leverage (EBITDA / EBIT Margins)**
*   Micron exhibits extreme operating leverage. Consensuses assume EBITDA margins peaking at **86.4%** in FY2027. We model normalized trough EBIT margins of **37.8%** in FY2030, which is significantly higher than historical troughs (which were negative) due to the higher mix of premium enterprise and AI products.

### **C. Capital Expenditures**
*   CapEx remains high in FY2026/FY2027 to expand cleanroom spaces and HBM assembly lines. We forecast CapEx peaking at **$28.0bn** in FY2027 before declining to a maintenance level of **$15.0bn** by FY2029.

---

## 4. Terminal Value Assumptions

*   **Terminal Growth Rate (g):** 2.50% (base case), reflecting long-term GDP growth and steady semiconductor demand.
*   **Normalized FCF Growth:** Standard perpetuity growth model applied to the FY2030 normalized free cash flow of $29,688M.
