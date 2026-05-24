---
name: dcf-model
description: Real DCF (Discounted Cash Flow) model creation for equity valuation. Retrieves financial data from SEC filings and analyst reports, builds comprehensive cash flow projections with proper WACC calculations, performs sensitivity analysis, and outputs professional Excel models with executive summaries. Use when users need to value a company using DCF methodology, request intrinsic value analysis, or ask for detailed financial modeling with growth projections and terminal value calculations.
---

# DCF Model Builder

## Overview

This skill creates institutional-quality single-company DCF / valuation models following investment banking standards and the repo's hybrid workbook architecture. Each analysis produces a detailed Excel model with sector-native operating drivers, intrinsic valuation, sensitivity tables, and a dedicated scenario/return framework. Peer/comps analysis is external by default and should not be embedded as a company-model worksheet.

## Tools

- Default to using all of the information provided by the user and MCP servers available for data sourcing.

## Critical Constraints - Read These First

These constraints apply throughout all DCF model building. Review before starting:

**Environment: Office JS vs Python/openpyxl:**
- **If running inside Excel (Office Add-in / Office JS environment):** Use Office JS directly — do NOT use Python/openpyxl. Write formulas via `range.formulas = [["=D19*(1+$B$8)"]]`. No separate recalc step needed; Excel calculates natively. Use `range.format.*` for styling. The same formulas-over-hardcodes rule applies: set `.formulas`, never `.values` for derived cells.
- **If generating a standalone .xlsx file (no live Excel session):** Use Python/openpyxl as described below, then run `recalc.py` before delivery.
- The rest of this skill uses openpyxl examples — translate to Office JS API calls when in that environment, but all principles (formula strings, cell comments, section checkpoints, sensitivity table loops) apply identically.

**⚠️ Office JS merged cell pitfall:** When building section headers with merged cells, do NOT call `.merge()` then set `.values` on the merged range — Office JS still reports the range's original dimensions and will throw `InvalidArgument: The number of rows or columns in the input array doesn't match the size or dimensions of the range`. Instead, write the value to the top-left cell alone, then merge and format the full range:

```js
// WRONG — throws InvalidArgument:
const hdr = ws.getRange("A7:H7");
hdr.merge();
hdr.values = [["MARKET DATA & KEY INPUTS"]];  // 1×1 array vs 1×8 range → fails

// CORRECT — value first on single cell, then merge + format the range:
ws.getRange("A7").values = [["MARKET DATA & KEY INPUTS"]];
const hdr = ws.getRange("A7:H7");
hdr.merge();
hdr.format.fill.color = "#1F4E79";
hdr.format.font.bold = true;
hdr.format.font.color = "#FFFFFF";
```

This applies to every merged section header in the DCF (market data, scenario blocks, cash flow projection, terminal value, valuation summary, sensitivity tables).

**Formulas Over Hardcodes (NON-NEGOTIABLE):**
- Every projection, margin, discount factor, PV, and sensitivity cell MUST be a live Excel formula — never a value computed in Python and written as a number
- When using openpyxl: `ws["D20"] = "=D19*(1+$B$8)"` is correct; `ws["D20"] = calculated_revenue` is WRONG
- The only hardcoded numbers permitted are: (1) raw historical inputs, (2) assumption drivers (growth rates, WACC inputs, terminal g), (3) current market data (share price, debt balance)
- If you catch yourself computing something in Python and writing the result — STOP. The model must flex when the user changes an assumption.

**Verify Step-by-Step With the User (DO NOT build end-to-end):**
- After data retrieval → show the user the raw inputs block (revenue, margins, shares, net debt) and confirm before projecting
- After revenue projections → show the projected top line and growth rates, confirm before building margin build
- After FCF build → show the full FCF schedule, confirm logic before computing WACC
- After WACC → show the calculation and inputs, confirm before discounting
- After terminal value + PV → show the equity bridge (EV → equity value → per share), confirm before sensitivity tables
- Catch errors at each stage — a wrong margin assumption discovered after sensitivity tables are built means rebuilding everything downstream

**Sensitivity Tables:**
- **Use an ODD number of rows and columns** (standard: 5×5, sometimes 7×7) — this guarantees a true center cell
- **Center cell = base case.** Build the axis values so the middle row header and middle column header exactly equal the model's actual assumptions (e.g., if base WACC = 9.0%, the middle row is 9.0%; if terminal g = 3.0%, the middle column is 3.0%). The center cell's output must therefore equal the model's actual implied share price — this is the sanity check that the table is built correctly.
- **Highlight the center cell** with the medium-blue fill (`#BDD7EE`) + bold font so it's immediately visible which cell is the base case.
- Populate ALL cells (typically 3 tables × 25 cells = 75) with full DCF recalculation formulas
- Use openpyxl loops (or Office JS loops) to write formulas programmatically
- NO placeholder text, NO linear/scalar approximations, NO manual steps required
- Each cell must recalculate full DCF for that assumption combination
- Center cell must validate against base DCF output; any scalar approximation must be explicitly labeled
- Stricter number formats: per-share values at 2 decimals in sensitivity grids

**Cell Comments:**
- Add cell comments AS each hardcoded value is created
- Format: "Source: [System/Document], [Date], [Reference], [URL if applicable] | Rationale: [specific reason for this line+quarter+scenario value]"
- Every bright blue editable input must have a comment with both source and rationale before moving to next section
- Do not defer to end or write "TODO: add source"
- Do not use wide note columns for per-cell assumption rationale; rationale goes in the cell comment

**Model Layout Planning:**
- Define ALL section row positions BEFORE writing any formulas
- Write ALL headers and labels first
- Write ALL section dividers and blank rows second
- THEN write formulas using the locked row positions
- Test formulas immediately after creation

**Formula Recalculation and Validation:**
- Run `python recalc.py model.xlsx 30` before delivery. Use the bundled script at `scripts/recalc.py` from this skill, or copy it into `<run>/data/scripts/validation/recalc.py` for auditability.
- `recalc.py` must use **LibreOffice headless** (or native Excel calculation when operating inside live Excel) to open/recalculate/save the workbook first, then inspect recalculated cell values for errors. Do not rely only on openpyxl formula-text scanning for final validation.
- Fix ALL errors until status is "success".
- Zero formula errors required (#REF!, #DIV/0!, #VALUE!, etc.).
- After every fix, rerun LibreOffice headless recalculation and re-scan the recalculated workbook. Validate that prior errors are gone before proceeding.
- After recalc succeeds, run `validate_model.py` before generating `outputs.json`.
- After `outputs.json` is generated from recalculated workbook cells, run `validate_outputs.py`.
- If report/deck artifacts already exist or are being delivered, run `validate_artifacts.py` after they are built.

**Scenario Architecture:**
- Three separate scenario model sheets: `Model - Bear`, `Model - Base`, `Model - Bull`, all generated from the same template and all read-only from `Drivers & Assumptions`. User never edits model sheets directly.
- `Drivers & Assumptions` holds common + company-specific driver assumptions with quarterly, line-item-specific Bear/Base/Bull values.
- No in-sheet scenario rows or case selectors; each sheet is a self-contained full quarterly P&L/BS/CF for one scenario.
- The `DCF` sheet references the three model sheets to compute Bear/Base/Bull price targets — one set of DCF calculations that reads from `Model - Bear`, `Model - Base`, `Model - Bull`.
- Build a dedicated `Scenarios` sheet for forward-return analysis. It MUST include 1-year return and 3-year return/IRR for Bear/Base/Bull cases, plus exit-multiple scenarios across holding periods. Sources DCF values from `DCF`.
- Surface the same 1-year and 3-year return/IRR outputs at the top of `Summary` so the user sees the return setup before detailed financials.

## DCF Process Workflow

### Step 1: Data Retrieval and Validation

Fetch data from MCP servers, user provided data, and the web.

**Data Sources Priority:**
1. **MCP Servers** (if configured) - Structured financial data from providers like Daloopa
2. **User-Provided Data** - Historical financials from their research
3. **Web Search/Fetch** - Current prices, beta, debt and cash when needed

**Validation Checklist:**
- Verify net debt vs net cash (critical for valuation)
- Confirm diluted shares outstanding (check for recent buybacks/issuances)
- Validate historical margins are consistent with business model
- Cross-check revenue growth rates with industry benchmarks
- Verify tax rate is reasonable (typically 21-28%)

### Step 2: Historical Analysis (3-5 years)

Analyze and document:
- **Revenue growth trends**: Calculate CAGR, identify drivers
- **Margin progression**: Track gross margin, EBIT margin, FCF margin
- **Capital intensity**: D&A and CapEx as % of revenue
- **Working capital efficiency**: NWC changes as % of revenue growth
- **Return metrics**: ROIC, ROE trends

Create summary tables showing:
```
Historical Metrics (LTM):
Revenue: $X million
Revenue growth: X% CAGR
Gross margin: X%
EBIT margin: X%
D&A % of revenue: X%
CapEx % of revenue: X%
FCF margin: X%
```

### Step 3: Build Sector-Native Drivers and Revenue Projections

**Primitive-first methodology (required):**
1. Identify the company's revenue primitive before projecting revenue. Do not default to generic CAGR unless data is unavailable.
2. Build the primitive on the `Drivers & Assumptions` sheet, then link the resulting revenue lines into `Model - Bear`, `Model - Base`, and `Model - Bull`.
3. Show both operating drivers and dollar amounts: volumes, pricing, mix, unit count, ARPU/ASP, take rate, churn, utilization, tariff, commodity deck, or sector-equivalent.
4. If only top-down data is available, use revenue CAGR as a fallback and clearly label the hidden primitive it approximates.

**Common revenue primitives:**
- SaaS/software: beginning ARR + new ARR + expansion/price - churn = ending ARR; subscription + services; billings/RPO where relevant.
- Marketplace/ecommerce: GMV/TPV × take rate; orders × AOV; merchant/customer count × ARPU.
- Semiconductors/hardware: units/bits/wafers × ASP; node/product mix; utilization/capacity.
- Banks/fintech: earning assets/loans × NIM + fees; customers × ARPAC; cost of risk.
- Healthcare insurers: average members × PMPM/ticket; MLR/MCR; reserves.
- Hospitals: beds × occupancy × patient-days × ticket; surgeries/complexity mix.
- Consumer/retail: stores × revenue/store; SSS; ticket × traffic; membership fees.
- Real estate/malls: GLA × occupancy × rent/m² + services/media; NOI.
- Utilities/infrastructure: RAB × allowed return or tariff × volume; regulated capex.
- Commodities/energy: production volume × realized price × FX; cash cost and sustaining capex.

**Growth framework:**
- Year 1-2: Tie to visible drivers, backlog, guidance, consensus, capacity, pricing, or macro deck.
- Year 3-5: Fade drivers toward normalized industry economics.
- Terminal year: Converge to mature growth, mature margin, and mature reinvestment.

**Formula structure examples:**
- Driver-based revenue: `=Units * ASP`, `=GMV * TakeRate`, `=AvgMembers * Ticket * 12`, `=Stores * RevenuePerStore`.
- Fallback revenue: `=PriorYearRevenue * (1 + GrowthRate)` only when operating drivers are unavailable.
- Growth %: `=CurrentRevenue / PriorRevenue - 1`.

**Three-scenario approach:**
```
Bear Case: weaker units/pricing/margins or worse macro
Base Case: most likely driver path
Bull Case: stronger units/pricing/margins or better macro
```

### Step 4: Operating Expense Modeling

**Fixed/Variable Cost Analysis:**

Operating expenses should model realistic operating leverage:
- **Sales & Marketing**: Typically 15-40% of revenue depending on business model
- **Research & Development**: Typically 10-30% for technology companies
- **General & Administrative**: Typically 8-15% of revenue, shows leverage as company scales

**Key principles:**
- ALL percentages based on REVENUE, not gross profit, unless the sector specifically requires another denominator.
- Model operating leverage: % should decline as revenue scales when justified.
- Maintain separate line items for S&M, R&D, G&A or sector equivalents.
- Calculate EBIT = Gross Profit - Total OpEx.
- Put complex cost logic in `Drivers & Assumptions`; model sheets present the clean quarterly P&L for each scenario.
  - Example: store-level SG&A, utilization-driven labor, data center cost/MW, claims cost/member, vehicle depreciation/fleet, fuel cost/MWh, cash cost/ton, or R&D capitalization logic belongs in `Drivers & Assumptions`.
  - Each model sheet then links to these calculated outputs and presents COGS, SG&A, R&D, EBITDA, D&A, EBIT, interest, tax, NI, and EPS — one scenario per sheet.

**Margin expansion framework:**
```
Current State → Target State (Year 5)
Gross Margin: X% → Y% (justify based on scale, efficiency)
EBIT Margin: X% → Y% (result of revenue growth + opex leverage)
```

### Step 5: Free Cash Flow Calculation

**Source of truth:** build the operating forecast in `Model - Bear`, `Model - Base`, `Model - Bull` (quarterly, each covering P&L, balance sheet, and cash flow). The `DCF` sheet should reference these model sheets; it should not duplicate revenue, SG&A, capex, D&A, or working-capital logic.

**Build FCF in proper sequence:**

```
EBIT                    ← linked from Model - Bear/Base/Bull
(-) Taxes               ← linked from Drivers & Assumptions / model sheets
= NOPAT
(+) D&A                 ← linked from model sheets
(-) CapEx               ← linked from model sheets
(-) Δ NWC               ← linked from model sheets
= Unlevered Free Cash Flow
```

**Working Capital Modeling:**
- Calculate as % of revenue change (delta revenue)
- Typical range: -2% to +2% of revenue change
- Negative number = source of cash (working capital release)
- Positive number = use of cash (working capital build)

**Maintenance vs Growth CapEx:**
- Maintenance CapEx: Sustains current operations (~2-3% revenue)
- Growth CapEx: Supports expansion (additional 2-5% revenue)
- Total CapEx should align with company's growth strategy

### Step 6: Cost of Capital (WACC) Research

**CAPM Methodology for Cost of Equity:**

```
Cost of Equity = Risk-Free Rate + Beta × Equity Risk Premium

Where:
- Risk-Free Rate = Current 10-Year Treasury Yield
- Beta = 5-year monthly stock beta vs market index
- Equity Risk Premium = 5.0-6.0% (market standard)
```

**Cost of Debt Calculation:**

```
After-Tax Cost of Debt = Pre-Tax Cost of Debt × (1 - Tax Rate)

Determine Pre-Tax Cost of Debt from:
- Credit rating (if available)
- Current yield on company bonds
- Interest expense / Total Debt from financials
```

**Capital Structure Weights:**

```
Market Value Equity = Current Stock Price × Shares Outstanding
Net Debt = Total Debt - Cash & Equivalents
Enterprise Value = Market Cap + Net Debt

Equity Weight = Market Cap / Enterprise Value
Debt Weight = Net Debt / Enterprise Value

WACC = (Cost of Equity × Equity Weight) + (After-Tax Cost of Debt × Debt Weight)
```

**Special Cases:**
- **Net Cash Position**: If Cash > Debt, Net Debt is NEGATIVE
  - Debt Weight may be negative
  - WACC calculation adjusts accordingly
- **No Debt**: WACC = Cost of Equity

**Typical WACC Ranges:**
- Large Cap, Stable: 7-9%
- Growth Companies: 9-12%
- High Growth/Risk: 12-15%

### Step 7: Discount Rate Application (5-10 Year Forecast)

**Mid-Year Convention:**
- Cash flows assumed to occur mid-year
- Discount Period: 0.5, 1.5, 2.5, 3.5, 4.5, etc.
- Discount Factor = 1 / (1 + WACC)^Period

**Present Value Calculation:**
```
For each projection year:
PV of FCF = Unlevered FCF × Discount Factor

Example (Year 1):
FCF = $1,000
WACC = 10%
Period = 0.5
Discount Factor = 1 / (1.10)^0.5 = 0.9535
PV = $1,000 × 0.9535 = $954
```

**Projection Period Selection:**
- **5 years**: Standard for most analyses
- **7-10 years**: High growth companies with longer runway
- **3 years**: Mature, stable businesses

### Step 8: Terminal Value Calculation

**Perpetuity Growth Method (Preferred):**

```
Terminal FCF = Final Year FCF × (1 + Terminal Growth Rate)
Terminal Value = Terminal FCF / (WACC - Terminal Growth Rate)

Critical Constraint: Terminal Growth < WACC (otherwise infinite value)
```

**Terminal Growth Rate Selection:**
- Conservative: 2.0-2.5% (GDP growth rate)
- Moderate: 2.5-3.5%
- Aggressive: 3.5-5.0% (only for market leaders)

**Do not exceed**: Risk-free rate or long-term GDP growth

**Exit Multiple Method (Alternative):**
```
Terminal Value = Final Year EBITDA × Exit Multiple

Where Exit Multiple comes from:
- Industry comparable trading multiples
- Precedent transaction multiples
- Typical range: 8-15x EBITDA
```

**Present Value of Terminal Value:**
```
PV of Terminal Value = Terminal Value / (1 + WACC)^Final Period

Where Final Period accounts for timing:
5-year model with mid-year convention: Period = 4.5
```

**Terminal Value Sanity Check:**
- Should represent 50-70% of Enterprise Value
- If >75%, model may be over-reliant on terminal assumptions
- If <40%, check if terminal assumptions are too conservative

### Step 9: Enterprise to Equity Value Bridge

**Valuation Summary Structure:**

```
(+) Sum of PV of Projected FCFs = $X million
(+) PV of Terminal Value = $Y million
= Enterprise Value = $Z million

(-) Net Debt [or + Net Cash if negative] = $A million
= Equity Value = $B million

÷ Diluted Shares Outstanding = C million shares
= Implied Price per Share = $XX.XX

Current Stock Price = $YY.YY
Implied Return = (Implied Price / Current Price) - 1 = XX%
```

**Critical Adjustments:**
- **Net Debt = Total Debt - Cash & Equivalents**
  - If positive: Subtract from EV (reduces equity value)
  - If negative (Net Cash): Add to EV (increases equity value)
- **Use Diluted Shares**: Includes options, RSUs, convertible securities. Format shares as a number (e.g., shares in millions), never as a percentage.
- **Other adjustments** (if applicable):
  - Minority interests
  - Pension liabilities
  - Operating lease obligations

**Valuation Output Format:**
```csv
Valuation Component,Amount ($M)
PV Explicit FCFs,X.X
PV Terminal Value,Y.Y
Enterprise Value,Z.Z
(-) Net Debt,A.A
Equity Value,B.B
,,
Shares Outstanding (M),C.C
Implied Price per Share,$XX.XX
Current Share Price,$YY.YY
Implied Upside/(Downside),+XX%
```

### Step 10: Sensitivity Analysis

Build sensitivity tables on the dedicated `Sensitivity` sheet for repo workbooks (or at the bottom of `DCF` only in compact mode). Show how valuation changes with different assumptions:

1. **WACC vs Terminal Growth** or sector-equivalent discount-rate/terminal-value table.
2. **Growth vs Margin / Reinvestment** - Shows impact of top-line growth, operating leverage, and FCF conversion.
3. **Sector-native sensitivity** - Pick the variables that actually drive the business: churn × FCF margin, ASP × utilization, NIM × cost of risk, MLR × ticket growth, commodity price × FX, cap rate × NOI, tariff × RAB, etc.

**Implementation**: These are simple 2D grids (NOT Excel's "Data Table" feature) with formulas in each cell. Each cell must contain a full DCF recalculation for that specific assumption combination. See Critical Constraints section for detailed requirements on populating all cells programmatically using openpyxl.

<correct_patterns>

This section contains all the CORRECT patterns to follow when building DCF models.

### Scenario Row Pattern — Follow This Approach

**Three separate scenario model sheets, one per case:**

Structure the workbook with `Model - Bear`, `Model - Base`, and `Model - Bull` as separate sheets, all generated from the same template and all reading exclusively from `Drivers & Assumptions`:

```csv
MODEL - BASE (section header, quarterly columns Q1 FFY ... Q4 LFY)
, Q1 FY2025A, Q2 FY2025A, Q3 FY2025A, Q4 FY2025A, Q1 FY2026E, ...
Revenue - Stream A ($M), 1,200, 1,250, 1,300, 1,350, 1,420, ...
  Growth % QoQ,    —   ,  4.2%,  4.0%,  3.8%,  5.2%, ...
  Growth % YoY,    —   ,    — ,    — ,    — , 18.3%, ...
Revenue - Stream B ($M),   900,   900,   920,   950, 1,000, ...
  Growth % QoQ,    —   ,  0.0%,  2.2%,  3.3%,  5.3%, ...
Total Revenue ($M),    2,100,  2,150,  2,220,  2,300,  2,420, ...
  Growth % QoQ,    —   ,  2.4%,  3.3%,  3.6%,  5.2%, ...
  Growth % YoY,    —   ,    — ,    — ,    — , 15.2%, ...
Cost of Revenue - Stream A ($M),   480,   500,   520,   540,   568, ...
  Margin %,     40.0%, 40.0%, 40.0%, 40.0%, 40.0%, ...
Gross Profit - Stream A ($M),   720,   750,   780,   810,   852, ...
  Margin %,     60.0%, 60.0%, 60.0%, 60.0%, 60.0%, ...
...
Total Gross Profit ($M), 1,260, 1,290, 1,332, 1,380, 1,452, ...
  Margin %,     60.0%, 60.0%, 60.0%, 60.0%, 60.0%, ...
S&M ($M),        315,   323,   333,   345,   363, ...
  % Revenue,    15.0%, 15.0%, 15.0%, 15.0%, 15.0%, ...
R&D ($M),        252,   258,   266,   276,   290, ...
G&A ($M),        168,   172,   178,   184,   194, ...
EBITDA ($M),     525,   538,   555,   575,   605, ...
  Margin %,     25.0%, 25.0%, 25.0%, 25.0%, 25.0%, ...
...
```

**Key rules:**
- Actual/historical quarters are identical across all three model sheets (same hardcoded black-font numbers).
- Projected quarters diverge based on Bear/Base/Bull assumptions from `Drivers & Assumptions`.
- Revenue is broken out by each reported stream; cost of revenue/gross margin by stream where disclosed.
- QoQ and YoY growth percentages are visible inline for every material line item.
- The `DCF` sheet references the three model sheets directly — one set of DCF calculations produces Bear/Base/Bull target prices by reading from `Model - Bear`, `Model - Base`, `Model - Bull`.
- No consolidation column, no case selector, no INDEX/IF formulas switching between sheets. Each model sheet IS the scenario.

### Correct Revenue Projection Pattern

**Revenue projections reference `Drivers & Assumptions` for forward estimates:**

- Actual quarters: hardcoded black-font numbers (identical across all three model sheets).
- Projected quarters: formula referencing `Drivers & Assumptions` scenario column.

Examples:
- `='Drivers & Assumptions'!C10 * (1 + 'Drivers & Assumptions'!D10)` — driver-based projection for stream A.
- `='Drivers & Assumptions'!C14 * 'Drivers & Assumptions'!D14` — volume × ASP.
- `=D29*(1+$E$10)` — fallback growth-rate projection (only when detailed drivers are unavailable).

The `Drivers & Assumptions` sheet contains separate Bear/Base/Bull scenario columns for each assumption. Each model sheet (`Model - Bear`, `Model - Base`, `Model - Bull`) references only its corresponding Bear, Base, or Bull column.

### Correct FCF Formula Pattern

**Each model sheet (`Model - Bear`, `Model - Base`, `Model - Bull`) contains its own scenario.** Reference them directly from DCF:

```csv
Item,Formula (Model - Base example),Reference
D&A,=E29*$E$21,$E$21 = D&A % from Drivers & Assumptions Base column
CapEx,=E29*$E$22,$E$22 = CapEx % from Drivers & Assumptions Base column
Δ NWC,=(E29-D29)*$E$23,$E$23 = NWC % from Drivers & Assumptions Base column
Unlevered FCF,=E57+E58-E60-E62,E57=NOPAT E58=D&A E60=CapEx E62=Δ NWC
```

Each model sheet references the corresponding Bear/Base/Bull column from `Drivers & Assumptions`. The `DCF` sheet then reads FCF from `Model - Bear`, `Model - Base`, `Model - Bull` directly — no consolidation columns or case selectors needed.

**Cell Comment Format**

**Every hardcoded value needs both source and per-cell assumption rationale:**

"Source: [System/Document], [Date], [Reference], [URL if applicable] | Rationale: [line+quarter+scenario specific reason for this value]"

**Examples:**
```csv
Item,Source Comment
Stock price,Source: Market data script 2025-10-12 Close price
Shares outstanding,Source: 10-K FY2024 Page 45 Note 12
Historical revenue,Source: 10-K FY2024 Page 32 Consolidated Statements
Beta,Source: Market data script 2025-10-12 5-year monthly beta
Consensus estimates,Source: Management guidance Q3 2024 earnings call
Bear FY26 Q1 Rev Growth,Source: 10-K FY2025 Segment Data | Rationale: 2% seq decline on seasonal weakness and expected competitor launch pressuring Stream A volumes
Base FY26 Q2 GM Stream B,Source: Q4 FY25 Earnings Call guidance | Rationale: 40bp expansion from supplier consolidation savings flowing through from Q1
```

Do not use wide note columns for per-cell assumption rationale. Rationales go in individual cell comments. Keep high-level source/rationale metadata columns on `Drivers & Assumptions` only if useful for overview.

### Correct Assumption Table Structure

**The `Drivers & Assumptions` sheet is quarterly and line-item specific, with Bear/Base/Bull scenario columns:**

```csv
DRIVERS & ASSUMPTIONS
Assumption, Bear, Base, Bull, Source/Reference, Cells Driven, Last Updated
—— COMMON ASSUMPTIONS ——
Tax Rate (%), 21.0%, 21.0%, 21.0%, ..., ..., 'Model - Base'!D50, 2025-10-12
Diluted Shares (M), 1,250, 1,250, 1,250, ..., ..., 'DCF'!B20, 2025-10-12
WACC (%), 10.0%, 9.0%, 8.0%, ..., ..., 'DCF'!B10, 2025-10-12
Terminal Growth (%), 2.0%, 3.0%, 4.0%, ..., ..., 'DCF'!B12, 2025-10-12
—— REVENUE STREAMS (quarterly) ——
Stream A - FY26 Q1 Growth (%), 2.0%, 5.2%, 10.0%, ..., ..., 'Model - Base'!D8, 2025-10-12
Stream A - FY26 Q2 Growth (%), 1.5%, 4.8%, 9.5%, ..., ..., 'Model - Base'!E8, 2025-10-12
Stream B - FY26 Q1 Volume (K), 500, 550, 620, ..., ..., 'Model - Base'!D14, 2025-10-12
Stream B - FY26 Q1 ASP ($), 180, 190, 200, ..., ..., 'Model - Base'!D15, 2025-10-12
—— COST OF REVENUE (per stream) ——
Stream A - FY26 Q1 GM (%), 58.0%, 60.0%, 62.0%, ..., ..., 'Model - Base'!D12, 2025-10-12
—— EXPENSE LINES (quarterly) ——
S&M - FY26 Q1 ($M), 365, 345, 320, ..., ..., 'Model - Base'!D32, 2025-10-12
R&D - FY26 Q1 ($M), 300, 285, 270, ..., ..., 'Model - Base'!D33, 2025-10-12
...
```

Each assumption row shows Bear/Base/Bull values side by side. Each model sheet references only its corresponding Bear, Base, or Bull column from this sheet. No consolidation column or case selector is needed. Per-cell rationale goes in cell comments on the individual quarterly scenario assumption cell, not in wide rationale columns.

### Correct Row Planning Process

**1. Write ALL headers and labels FIRST:**
```csv
Row,Content
1,[Company Name] DCF Model
2,Ticker | Date | Year End
4,Case Selector
7,KEY ASSUMPTIONS
26,Assumption headers
27-31,Growth assumptions
...,...
```

**2. Write ALL section dividers and blank rows**

**3. THEN write formulas using the locked row positions**

**4. Test formulas immediately after creation**

**Think of it like construction:**
- Good: Pour foundation, then build walls (stable structure)
- Bad: Build walls, then pour foundation (walls collapse)

**Excel version:**
- Good: Add headers, then write formulas (formulas stable)
- Bad: Write formulas, then add headers (formulas break)

### Correct Sensitivity Table Implementation

**IMPORTANT**: These are NOT Excel's "Data Table" feature. These are simple grids where you write regular formulas using openpyxl. Yes, this means ~75 formulas total (3 tables × 25 cells each), but this is straightforward and required.

**Programmatic Population with Formulas:**

Each sensitivity table must be fully populated with formulas that recalculate the implied share price for each combination of assumptions. **Do not use Excel's Data Table feature** (it requires manual intervention and cannot be automated via openpyxl).

**Implementation approach - CONCRETE EXAMPLE:**

**Table Structure — 5×5 grid (ODD dimensions, base case centered):**

If the model's base WACC = 9.0% and base terminal growth = 3.0%, build the axes symmetrically around those values:

```csv
WACC vs Terminal Growth,  2.0%,  2.5%,  3.0%,  3.5%,  4.0%
              8.0%,       [fml], [fml], [fml], [fml], [fml]
              8.5%,       [fml], [fml], [fml], [fml], [fml]
              9.0%,       [fml], [fml], [★  ], [fml], [fml]   ← middle row = base WACC
              9.5%,       [fml], [fml], [fml], [fml], [fml]
             10.0%,       [fml], [fml], [fml], [fml], [fml]
                                   ↑
                          middle col = base terminal g
```

**★ = the center cell.** Its formula output MUST equal the model's actual implied share price (from the valuation summary). Apply the medium-blue fill (`#BDD7EE`) and bold font to this cell so the base case is visually anchored.

**Rule for axis values:** `axis_values = [base - 2*step, base - step, base, base + step, base + 2*step]` — symmetric around the base, odd count guarantees a center.

**Formula Pattern - Cell B88 (WACC=8.0%, Terminal Growth=2.0%):**

The formula in B88 should recalculate the implied price using:
- WACC from row header: `$A88` (8.0%)
- Terminal Growth from column header: `B$87` (2.0%)

**Recommended approach:** Reference the main DCF calculation but substitute these values.

**Example formula structure:**
`=([SUM of PV FCFs using $A88 as discount rate] + [Terminal Value using B$87 as growth rate and $A88 as WACC] - [Net Debt]) / [Shares]`

**CRITICAL - Write a formula for EVERY cell in the 5x5 grid (25 cells per table, 75 cells total).** Use openpyxl to write these formulas programmatically in a loop. Do NOT skip this step or leave placeholder text.

**Python implementation pattern:**
```python
# Pseudocode for populating sensitivity table
for row_idx, wacc_value in enumerate(wacc_range):
    for col_idx, term_growth_value in enumerate(term_growth_range):
        # Build formula that uses wacc_value and term_growth_value
        formula = f"=<DCF recalc using {wacc_value} and {term_growth_value}>"
        ws.cell(row=start_row+row_idx, column=start_col+col_idx).value = formula
```

**The sensitivity tables must work immediately when the model is opened, with no manual steps required from the user.**

</correct_patterns>

<common_mistakes>

This section contains all the WRONG patterns to avoid when building DCF models.

### WRONG: Simplified Sensitivity Table Approximations or Placeholder Text

**Never use scalar/linear approximations unless explicitly labeled:**

```
// WRONG - Linear approximation
B97: =B88*(1+(0.096-0.116))    // Assumes linear relationship — NOT valid for DCF

// WRONG - Division shortcut
B105: =B88/(1+(E48-0.07))      // Doesn't recalculate full DCF — NOT valid

// WRONG - Scalar multiplier
C97: =B88*1.05                  // Just multiplies by a constant
```

**Exception:** If a scalar approximation is absolutely necessary (e.g., extreme time constraints), it MUST be explicitly labeled "SCALAR APPROXIMATION — NOT FULL DCF" and the center cell must still be validated against the base DCF. Prefer full DCF recalculation in all cases.

**Don't leave placeholder text:**
```
// WRONG - Placeholder note
"Note: Use Excel Data Table feature (Data → What-If Analysis → Data Table) to populate sensitivity tables."

// WRONG - Empty cells
[leaving cells blank because "this is complex"]
```

**Don't confuse terminology:**
- ❌ "Sensitivity tables need Excel's Data Table feature" (NO - that's a specific Excel tool we can't use)
- ✅ "Sensitivity tables are simple grids with formulas in each cell" (YES - this is what we build)

**Why these shortcuts are wrong:**
- Linear approximation formulas don't actually recalculate the DCF - they just apply simple math adjustments
- The relationships are not linear, so the results will be inaccurate
- Placeholder text requires manual user intervention
- Model is not immediately usable when delivered
- Not professional or client-ready
- Empty cells = incomplete deliverable

**Common rationalization to REJECT:**
"Writing 75+ formulas feels complex, so I'll leave a note for the user to complete it manually."

**Reality:** Writing 75 formulas is straightforward when you use a loop in Python with openpyxl. Each formula follows the same pattern - just substitute the row/column values. This is a required part of the deliverable.

**Instead:** Populate every sensitivity cell with formulas that recalculate the full DCF for that specific combination of assumptions

### WRONG: Missing Cell Comments

**Don't do this:**
- Create all hardcoded inputs without comments
- Think "I'll add them later"
- Write "TODO: add source"
- Leave bright blue editable inputs without documentation
- Add only source without per-cell assumption rationale

**Why it's wrong:**
- Can't verify where data came from or why a specific value was chosen for this line+quarter+scenario
- Fails xlsx skill requirements
- Not audit-ready
- Wastes time fixing later

**Instead:** Add cell comment AS EACH hardcoded value is created, with both source AND per-cell rationale.

### WRONG: Formula Row References Off

**Symptom:**
The FCF section references wrong assumption rows:
`D&A:  =E29*$E$34    // Should be $E$21, but referencing wrong row`
`CapEx: =E29*$E$41   // Should be $E$22, but row shifted`

**Why this happens:**
1. Formulas written first
2. Then headers inserted
3. All row references shifted
4. Now formulas point to wrong cells → #REF! errors

**Instead:** Lock row layout FIRST, then write formulas

### WRONG: Single Row for Each Assumption Across Scenarios

**Don't structure assumptions like this:**
```csv
Assumption,Bear,Base,Bull
Revenue Growth FY1,10%,13%,16%
Revenue Growth FY2,9%,12%,15%
```
This vertical layout makes it hard to see the progression across years within each scenario.

**Why it's wrong:**
- Makes it difficult to see assumptions evolving across years within each scenario
- Harder to compare scenario assumptions across full projection period
- Less intuitive for reviewing scenario logic

**Instead:**
- Create separate blocks for each scenario (Bear, Base, Bull)
- Within each block, show assumptions horizontally across projection years
- This makes each scenario's assumptions easier to review as a cohesive set

### WRONG: No Borders

**Don't deliver a model without borders:**
- No section delineation
- All cells blend together
- Hard to read and unprofessional

**Why it's wrong:**
- Not client-ready
- Difficult to navigate
- Looks amateur

**Instead:** Add borders around all major sections

### WRONG: Wrong Font Colors or No Font Color Distinction

**Don't do this:**
- All text is black
- Only use fill colors (no font color changes)
- Mix up which cells are blue vs black

**Why it's wrong:**
- Can't distinguish inputs from formulas
- Auditing becomes impossible
- Violates xlsx skill requirements

**Instead:** Black text for actual hardcodes, bright blue (#0066CC) for ALL editable inputs, dark blue (#1F3864) for formula outputs, purple (#7030A0) for cross-sheet links

### WRONG: Operating Expenses Based on Gross Profit

**Don't do this:**
`S&M: =E33*0.15    // E33 = Gross Profit (WRONG)`

**Why it's wrong:**
- Operating expenses scale with revenue, not gross profit
- Produces unrealistic margin progression
- Not how businesses actually operate

**Instead:**
`S&M: =E29*0.15    // E29 = Revenue (CORRECT)`

### TOP 5 ERRORS SUMMARY

1. **Formula row references off** → Define ALL row positions BEFORE writing formulas
2. **Missing cell comments** → Add comments with source AND per-cell rationale AS cells are created, not at end
3. **Simplified sensitivity tables** → Populate all cells with full DCF recalc formulas; no scalar approximations; validate center cell against base DCF
4. **Scenario block references wrong** → Ensure formulas pull from correct model sheet (`Model - Bear`, `Model - Base`, `Model - Bull`)
5. **No borders** → Add professional section borders for client-ready appearance

In addition, be aware of these errors:

### WACC Calculation Errors
- Mixing book and market values in capital structure
- Using equity beta instead of asset/unlevered beta incorrectly
- Wrong tax rate application to cost of debt
- Incorrect risk-free rate (must use current 10Y Treasury)
- Failure to adjust for net debt vs net cash position

### Growth Assumption Flaws
- Terminal growth > WACC (creates infinite value)
- Projection growth rates inconsistent with historical performance
- Ignoring industry growth constraints
- Revenue growth not aligned with unit economics
- Margin expansion without operational justification

### Terminal Value Mistakes
- Using wrong growth method (perpetuity vs exit multiple)
- Terminal value >80% of enterprise value (suggests over-reliance)
- Inconsistent terminal margins with steady state assumptions
- Wrong discount period for terminal value

### Cash Flow Projection Errors
- Operating expenses based on gross profit instead of revenue
- D&A/CapEx percentages misaligned with business model
- Working capital changes not properly calculated
- Tax rate inconsistency between years
- NOPAT calculation errors

**These errors are the most common. Re-read this section before starting any DCF build.**

</common_mistakes>

## Excel File Creation

**This skill uses the `xlsx` skill for all spreadsheet operations.** The xlsx skill provides:
- Standardized formula construction rules
- Number formatting conventions
- Automated formula recalculation via `recalc.py` script
- Comprehensive error checking and validation

All Excel files created by this skill must follow xlsx skill requirements, including zero formula errors and proper recalculation.

## Quality Rubric

Every DCF model must maximize for:

### Financial Modeling Quality
1. **Realistic revenue and margin assumptions** based on historical performance and industry benchmarks — not aspirational targets
2. **Appropriate cost of capital calculation** with proper CAPM methodology, current risk-free rate, and reasoned equity risk premium
3. **Comprehensive sensitivity analysis** showing valuation ranges across WACC/g or sector-equivalent, growth/margin, and at least one sector-native key driver — all sensitivity cells formula-populated
4. **Clear terminal value calculation** with supporting rationale; terminal value 50-70% of EV; terminal growth < risk-free rate
5. **Professional model structure** enabling scenario analysis via three separate model sheets (`Model - Bear`, `Model - Base`, `Model - Bull`), all generated from the same template and reading exclusively from `Drivers & Assumptions`, with no case selectors or consolidation columns

### Workbook Completeness
6. **Full core tab set** — Summary, Drivers & Assumptions, Model - Bear, Model - Base, Model - Bull, DCF, Scenarios, Sensitivity, Checks — populated, not placeholder. Optional tabs: QTracker, MarketData, Ownership.
7. **Summary tab is self-contained and return-first** — the beginning of the sheet must show recommendation, current price, target price, upside/downside, 1-year return, 3-year return/IRR, bull/base/bear values, exit-multiple scenario summary, key metrics, trends, and risk summary; a reader should understand the return setup without opening other sheets.
8. **Drivers & Assumptions tab** — quarterly and line-item specific, combining common assumptions (macro/rates/valuation as numbers, not percentages unless inherently a rate) with company-specific drivers (revenue streams, cost of revenue per stream, expense lines); all assumptions have Bear/Base/Bull scenario columns; per-cell assumption rationale in cell comments on individual quarterly scenario assumption cells, not in wide note columns. Diluted Shares / Shares Outstanding must be numeric (shares or shares in millions) and formatted as a number, never as a percentage.
9. **Model - Bear, Model - Base, Model - Bull tabs** — three separate quarterly integrated model sheets, all generated from the same template; each shows full line-item detail (revenue by stream, QoQ/YoY for every material line, cost of revenue/gross profit/gross margin by stream, expense breakdown, EBITDA/EBIT/NI/EPS/FCF and margins); growth/margin percentages visible inline; actual quarters identical across all three sheets; user never edits model sheets directly.
10. **Checks tab is functional** — all checks output TRUE/FALSE, not placeholder text; covers active output formula errors, BS balance, CF tie, revenue-driver tie, WACC cross-check, DCF sensitivity center, Summary-to-active-case ties, scenario ordering, rating/recommendation vs return sanity, 1Y/3Y return math, terminal value sanity, share count consistency, outputs.json references, and formula errors.

### Formula and Color Discipline
11. **Formulas over hardcodes (non-negotiable)** — every projection, margin, discount factor, PV, and sensitivity cell is a live Excel formula; the only hardcoded numbers are raw inputs, assumption drivers, and current market data
12. **Semantic colors disciplined** — black font for actual/historical hardcodes, bright blue (#0066CC) for editable inputs, dark blue (#1F3864) for formula outputs, purple (#7030A0) for cross-sheet refs, red for errors; scenario fill only on assumption/input cells from Drivers & Assumptions, no scenario fill on formula outputs
13. **Cell comments on every hardcoded input** — format "Source: [System/Document], [Date], [Reference], [URL if applicable] | Rationale: [line+quarter+scenario specific reason]" — added AS cells are created, never deferred. Per-cell rationale goes in cell comments, not wide note columns.

### Downstream Readiness
14. **outputs.json written after successful recalc + model validation** — maps stable keys to sheet/cell locations; includes DCF value, current price, target price, upside/downside, 1-year return, 3-year return/IRR, bull/base/bear values, exit-multiple scenario outputs, and key driver/financial extracts; regenerated after every model change. Values must be read from recalculated workbook cells, not recomputed independently.
15. **Validation scripts saved and run** — `recalc.py`, `validate_model.py`, and `validate_outputs.py` must pass before model delivery. If report/deck artifacts are included, `validate_artifacts.py` must also pass.
16. **External comps reference only when applicable** — if peer analysis is used, outputs.json may include the external artifact path/date and final peer-derived value/range, not the full peer table.
17. **Run-specific scripts saved under `data/scripts/model/` and `data/scripts/validation/`** — modular, not monolithic; provides full audit trail and reproducibility

## Input Requirements

### Minimum Required Inputs
1. **Company identifier**: Ticker symbol or company name.
2. **Historical actuals**: revenue/segment data, margins, cash flow, cash/debt, share count, and sector KPIs where available.
3. **Business driver assumptions**: the operating primitive, not just revenue CAGR. Examples: ARR/churn, volume × ASP, stores × SSS, members × ticket, RAB/tariff, commodity deck, utilization/capacity.
4. **Macro/rate assumptions** for the `Drivers & Assumptions` sheet when relevant: risk-free rate, ERP, beta, cost of debt, tax rate, FX, CPI, IPCA, inflation, GDP, SELIC/CDI, commodity prices, or sector-specific rates/fees.
5. **Optional parameters**:
   - Projection period (default: 5 years; 7-10 years for long-runway businesses)
   - Scenario cases (Bear/Base/Bull driver, margin, and valuation assumptions)
   - Terminal growth rate (default: 2.5-3.0% unless sector/country context requires different)
   - Specific WACC/Ke inputs if not using CAPM
   - Exit multiple range and holding periods for 1-year and 3-year return scenarios

## Excel Model Structure

### Repository Sheet Architecture

For this investment research workspace, create the canonical single-company workbook by default:

1. **Summary** - recommendation, current price, target price, upside/downside, 1-year return, 3-year return/IRR, bull/base/bear values, exit-multiple scenario summary, key metrics, trends, and risk highlights.
2. **Drivers & Assumptions** - single source of truth: quarterly and line-item specific. Common assumptions as numbers (tax rate as %, shares in millions, capex in $, D&A in $ or %, SBC in $, WACC, terminal g, risk-free rate, ERP, beta, cost of debt) first. Company-specific drivers follow: quarterly revenue per stream (growth rates or primitive values like volume/ASP/ARR/churn), cost of revenue / gross margin per stream, and expense line assumptions (S&M, R&D, G&A or sector equivalents per quarter). Each row has Bear/Base/Bull scenario columns. Per-cell rationale in cell comments.
3. **Model - Bear**, **Model - Base**, **Model - Bull** - three separate quarterly integrated operating model sheets, all from the same template and read-only from `Drivers & Assumptions`. Each covers P&L, balance sheet, and cash flow / FCF bridge. Full line-item detail: revenue by stream, total revenue, QoQ/YoY for every material line, cost of revenue by stream, gross profit/gross margin by stream, expense breakdown, EBITDA/EBIT/NI/EPS/FCF and margins. Growth/margin percentages visible inline. Actual quarters identical across all three sheets.
4. **DCF** - intrinsic valuation engine, referencing `Model - Bear`, `Model - Base`, `Model - Bull`. One set of calculations producing Bear/Base/Bull price targets. Does not duplicate the operating model.
5. **Scenarios** - bull/base/bear values, 1-year and 3-year returns/IRRs, and exit-multiple return frameworks. Sources DCF values.
6. **Sensitivity** - WACC/g or sector-equivalent plus sector-native sensitivity grids.
7. **Checks** - formula and cross-artifact checks.

Optional tabs only when needed:
- **QTracker** - quarterly actuals, consensus vs actuals, guidance vs actuals, and KPI tracking.
- **MarketData** - current price, shares, market cap, beta, risk-free rate, net debt, and company-only trading history/multiples. No peer table.
- **Ownership** - shareholders, float, insider/management ownership, and basic governance reference data.

A compact two-sheet DCF (`DCF`, `WACC`) is acceptable only when the user explicitly requests a quick standalone DCF.

**CRITICAL**: Sensitivity tables may live on a dedicated `Sensitivity` tab for the repo workbook; in compact DCF mode, place them at the bottom of the DCF sheet. Forward-return and exit-multiple IRR tables belong in `Scenarios`, not in `DCF`.

### Formula Recalculation (MANDATORY)

After creating or modifying the Excel model, **recalculate all formulas with LibreOffice headless** using the recalc.py script from the xlsx skill:

```bash
python .agents/skills/dcf-model/scripts/recalc.py [path_to_excel_file] [timeout_seconds]
# or, after copying into the run for auditability:
python <run>/data/scripts/validation/recalc.py [path_to_excel_file] [timeout_seconds]
```

Example:
```bash
python recalc.py AAPL_DCF_Model_2025-10-12.xlsx 30
```

The script will:
- Open/recalculate/save all formulas in all sheets using LibreOffice headless
- Re-open the recalculated workbook and scan ALL calculated cell values for Excel errors (#REF!, #DIV/0!, #VALUE!, #NAME?, #NULL!, #NUM!, #N/A)
- Return detailed JSON with error locations and counts

**Important:** openpyxl alone does not calculate Excel formulas. A scan of formula text is insufficient for final delivery because runtime errors such as `#VALUE!` may only appear after recalculation.

**Expected output format:**
```json
{
  "status": "success",           // or "errors_found"
  "total_errors": 0,              // Total error count
  "total_formulas": 42,           // Number of formulas in file
  "error_summary": {}             // Only present if errors found
}
```

**If errors are found**, the output will include details:
```json
{
  "status": "errors_found",
  "total_errors": 2,
  "total_formulas": 42,
  "error_summary": {
    "#REF!": {
      "count": 2,
      "locations": ["DCF!B25", "DCF!C25"]
    }
  }
}
```

**Fix all errors** and re-run LibreOffice-headless `recalc.py` until status is "success" before delivering the model. After each fix, recalculate again and confirm the previous error locations no longer return error values.

### Formatting Standards

**IMPORTANT**: Follow the xlsx skill for formula construction rules and number formatting conventions. The DCF skill adds specific visual presentation standards.

**Color Scheme:**

**Font Colors (MANDATORY from xlsx skill):**
- **Black text**: Actual/historical hardcoded data (past quarters, reported figures)
- **Bright blue text (#0066CC)**: Editable inputs / forward assumptions (growth rates, margins, WACC, terminal g)
- **Dark blue text (#1F3864)**: Formula outputs / calculated values
- **Purple text (#7030A0)**: Cross-sheet or cross-file references
- **Red text (#FF0000)**: Excel errors (#REF!, #DIV/0!, etc.)

**Fill Colors:**
- **Scenario fill applies only to scenario assumption/input cells** pulled from `Drivers & Assumptions`. Formula output cells get no scenario fill. Use soft red/pink for Bear, light yellow/amber for Base, and soft green for Bull.
- Bear = soft red/pink fill, Base = light yellow/amber fill, Bull = soft green fill.
- **Structural headers**: Dark blue (#1F4E79) fill with white bold text.
- **Sub-headers/column headers**: Light blue (#D9E1F2) fill with black bold text.
- **Key outputs** (per-share value, EV, etc.): Medium blue (#BDD7EE) fill with dark blue bold font.
- User-provided templates or explicit color preferences ALWAYS override these defaults.

### Border Standards (REQUIRED for Professional Appearance)

**Thick borders** (1.5pt) around major sections:
- KEY INPUTS section
- PROJECTION ASSUMPTIONS section
- 5-YEAR CASH FLOW PROJECTION section
- TERMINAL VALUE section
- VALUATION SUMMARY section
- Each SENSITIVITY ANALYSIS table

**Medium borders** (1pt) between sub-sections:
- Company Details vs Historical Performance
- Growth Assumptions vs EBIT Margin vs FCF Parameters

**Thin borders** (0.5pt) around data tables:
- Scenario assumption tables (Bear | Base | Bull)
- Historical vs projected financials matrix

**No borders:** Individual cells within tables (keep clean, scannable)

**Borders are mandatory** - models without professional borders are not client-ready.

**Number Formats** (follows xlsx skill standards):
- **Years**: Format as text strings (e.g., "2024" not "2,024")
- **Percentages**: `0.0%` (one decimal place)
- **Currency**: `$#,##0` for millions; `$#,##0.00` for per-share - ALWAYS specify units in headers ("Revenue ($mm)")
- **Zeros**: Use number formatting to make all zeros "-" (e.g., `$#,##0;($#,##0);-`)
- **Large numbers**: `#,##0` with thousands separator
- **Diluted Shares / Shares Outstanding / share count**: number format such as `#,##0` or `#,##0.0` in millions; never percentage format. EPS must divide by this numeric share count.
- **Negative numbers**: `(#,##0)` in parentheses (NOT minus sign)

**Cell Comments (MANDATORY for all hardcoded inputs)**:

Per the xlsx skill, ALL hardcoded values must have cell comments documenting the source AND per-cell assumption rationale. Format: "Source: [System/Document], [Date], [Reference], [URL if applicable] | Rationale: [line+quarter+scenario specific reason]"

**CRITICAL**: Add comments AS CELLS ARE CREATED. Do not defer to the end.

### DCF Sheet Detailed Structure

**Repo-standard vs compact mode:** In repo-standard workbooks, the DCF sheet is the intrinsic valuation engine and should contain cross-sheet links to `Model - Bear`, `Model - Base`, `Model - Bull` (for operating forecasts) and `Drivers & Assumptions` (for WACC, terminal g, and other valuation inputs). It must not duplicate the operating model.

**Section 1: Header**
```csv
Row,Content
1,[Company Name] DCF Model
2,Ticker: [XXX] | Date: [Date] | Year End: [FYE]
3,Blank
4,Scenario: Bear / Base / Bull (three-column output from Model)
```

**Section 2: Market Data (NOT case dependent)**
```csv
Item,Value
Current Stock Price,$XX.XX
Shares Outstanding (M),XX.X
Market Cap ($M),[Formula]
Net Debt ($M),XXX [or Net Cash if negative]
```

**Section 3: DCF Input Links**

The DCF should link to `Model - Bear`, `Model - Base`, `Model - Bull`, plus valuation inputs from `Drivers & Assumptions` and optional `MarketData`. Do not rebuild operating drivers here.

Create a small DCF input/link block showing:
- Bear/Base/Bull scenario labels from `Model - Bear`, `Model - Base`, `Model - Bull`
- Linked revenue, EBIT/EBITDA, tax rate, D&A, capex, ΔNWC, FCF — three columns, one per scenario, read from the respective model sheet
- WACC or Ke inputs from `Drivers & Assumptions` (Bear/Base/Bull columns)
- Terminal growth and/or terminal multiple assumption from `Drivers & Assumptions` (Bear/Base/Bull columns)
- Current price, shares, net debt from `MarketData`, the scenario model sheets, or `Drivers & Assumptions`

Full Bear/Base/Bull operating assumptions live in `Drivers & Assumptions`; full forward-return cases live in `Scenarios`.

**Section 4: Historical & Projected Financials**

**Reference the three model sheets.** DCF reads all three scenarios simultaneously — three columns per financial line, one per scenario.

```csv
Financials ($M),Bear 2024E,Base 2024E,Bull 2024E,Bear 2025E,Base 2025E,Bull 2025E
Revenue,='Model - Bear'!F20,='Model - Base'!F20,='Model - Bull'!F20,='Model - Bear'!G20,='Model - Base'!G20,='Model - Bull'!G20
  % growth,='Model - Bear'!F21,='Model - Base'!F21,='Model - Bull'!F21,='Model - Bear'!G21,='Model - Base'!G21,='Model - Bull'!G21
Gross Profit,='Model - Bear'!F23,='Model - Base'!F23,='Model - Bull'!F23,='Model - Bear'!G23,='Model - Base'!G23,='Model - Bull'!G23
```

**Key Formula Pattern**:
- Repo-standard: `='Model - Bear'!F20` for Bear Revenue FY2026E, `='Model - Base'!F20` for Base, `='Model - Bull'!F20` for Bull.
- Compact-mode only: `=PriorYearRevenue*(1+GrowthRate)` with growth rate from `Drivers & Assumptions`.
- NOT: scattered IF/INDEX formulas switching between scenario blocks — all three scenarios are projected simultaneously.

This approach is cleaner, easier to audit, and prevents formula errors by centralizing operating logic in the scenario model sheets.

**Section 5: Free Cash Flow Build**

**CRITICAL**: Verify row references point to the correct model sheet. Test formulas immediately after creation.

```csv
Cash Flow Links ($M),Bear 2024E,Base 2024E,Bull 2024E,Bear 2025E,Base 2025E,Bull 2025E
NOPAT,=B6*(1-B7),=C6*(1-C7),=D6*(1-D7),=E6*(1-E7),=F6*(1-F7),=G6*(1-G7)
(+) D&A,='Model - Bear'!F35,='Model - Base'!F35,='Model - Bull'!F35,='Model - Bear'!G35,='Model - Base'!G35,='Model - Bull'!G35
(-) CapEx,='Model - Bear'!F38,='Model - Base'!F38,='Model - Bull'!F38,='Model - Bear'!G38,='Model - Base'!G38,='Model - Bull'!G38
(-) Δ NWC,='Model - Bear'!F40,='Model - Base'!F40,='Model - Bull'!F40,='Model - Bear'!G40,='Model - Base'!G40,='Model - Bull'!G40
Unlevered FCF,=B10+B11-B12-B13,=C10+C11-C12-C13,=D10+D11-D12-D13,=E10+E11-E12-E13,=F10+F11-F12-F13,=G10+G11-G12-G13
```

**Reference examples** (based on layout planning):
- D&A, CapEx, and ΔNWC come from the respective model sheet (`Model - Bear`, `Model - Base`, `Model - Bull`).
- NOPAT is calculated in DCF from linked EBIT and linked tax rate from the relevant scenario model sheet.

**Before writing formulas**: Confirm these row numbers match the actual scenario model sheet layout. Test one column, then copy across.

**Section 6: Discounting & Valuation**
```csv
DCF Valuation,2024E,2025E,2026E,2027E,2028E,Terminal
Unlevered FCF ($M),XXX,XXX,XXX,XXX,XXX,
Period,0.5,1.5,2.5,3.5,4.5,
Discount Factor,0.XX,0.XX,0.XX,0.XX,0.XX,
PV of FCF ($M),XXX,XXX,XXX,XXX,XXX,
,,,,,,
Terminal FCF ($M),,,,,,,XXX
Terminal Value ($M),,,,,,,XXX
PV Terminal Value ($M),,,,,,,XXX
,,,,,,
Valuation Summary ($M),,,,,,
Sum of PV FCFs,XXX,,,,,
PV Terminal Value,XXX,,,,,
Enterprise Value,XXX,,,,,
(-) Net Debt,(XX),,,,,
Equity Value,XXX,,,,,
,,,,,,
Shares Outstanding (M),XX.X,,,,,
IMPLIED PRICE PER SHARE,$XX.XX,,,,,
Current Stock Price,$XX.XX,,,,,
Implied Upside/(Downside),XX%,,,,,
```

### WACC Sheet Structure

**Compact standalone DCF mode only:** If the workbook is a quick two-sheet DCF, a separate `WACC` sheet is acceptable. In repo-standard workbooks, put WACC/Ke inputs on `Drivers & Assumptions` and link the DCF to those cells.

```csv
COST OF EQUITY CALCULATION,,
Risk-Free Rate (10Y Treasury),X.XX%,[Yellow input]
Beta (5Y monthly),X.XX,[Yellow input]
Equity Risk Premium,X.XX%,[Yellow input]
Cost of Equity,X.XX%,[Calculated blue]
,,
COST OF DEBT CALCULATION,,
Credit Rating,AA-,[Yellow input]
Pre-Tax Cost of Debt,X.XX%,[Yellow input]
Tax Rate,XX.X%,[Link to DCF sheet]
After-Tax Cost of Debt,X.XX%,[Calculated blue]
,,
CAPITAL STRUCTURE,,
Current Stock Price,$XX.XX,[Link to DCF]
Shares Outstanding (M),XX.X,[Link to DCF]
Market Capitalization ($M),"X,XXX",[Calculated]
,,
Total Debt ($M),XXX,[Yellow input]
Cash & Equivalents ($M),XXX,[Yellow input]
Net Debt ($M),XXX,[Calculated]
,,
Enterprise Value ($M),"X,XXX",[Calculated]
,,
WACC CALCULATION,Weight,Cost,Contribution
Equity,XX.X%,X.X%,X.XX%
Debt,XX.X%,X.X%,X.XX%
,,
WEIGHTED AVERAGE COST OF CAPITAL,X.XX%,[Green output]
```

**Key WACC Formulas:**
```
Market Cap = Price × Shares
Net Debt = Total Debt - Cash
Enterprise Value = Market Cap + Net Debt
Equity Weight = Market Cap / EV
Debt Weight = Net Debt / EV
WACC = (Cost of Equity × Equity Weight) + (After-tax Cost of Debt × Debt Weight)
```

### Sensitivity Analysis

**TERMINOLOGY REMINDER**: "Sensitivity tables" = simple 2D grids with row headers, column headers, and formulas in each data cell. NOT Excel's "Data Table" feature (Data → What-If Analysis → Data Table). You will use openpyxl to write regular Excel formulas into each cell.

**Location**: Dedicated `Sensitivity` sheet for repo workbooks. In compact standalone DCF mode only, put sensitivities at the bottom of `DCF`.

**Three sensitivity tables, vertically stacked:**

1. **WACC vs Terminal Growth** or sector-equivalent terminal value table - 5x5 grid = 25 cells with formulas
2. **Growth vs EBIT/FCF Margin** - 5x5 grid = 25 cells with formulas
3. **Sector-native key driver table** - 5x5 grid = 25 cells with formulas. Examples: churn × FCF margin, ASP × utilization, NIM × cost of risk, MLR × ticket growth, commodity price × FX, cap rate × NOI.

**Total formulas to write: 75+** (this is required, not optional)

**CRITICAL**: All sensitivity table cells must be populated programmatically with formulas using openpyxl. DO NOT use linear approximation shortcuts. DO NOT leave placeholder text or notes about manual steps. DO NOT rationalize leaving cells empty because "it's complex" - use a Python loop to generate the formulas.

**Table Setup:**
1. Create table structure with row/column headers (the assumption values to test)
2. Populate EVERY data cell with a formula that:
   - Uses the row header value (e.g., WACC = 9.0%)
   - Uses the column header value (e.g., Terminal Growth = 3.0%)
   - Recalculates the full DCF with those specific assumptions
   - Returns the implied share price for that scenario
3. All cells must contain working formulas when delivered
4. Format cells with conditional formatting: Green scale for higher values, red scale for lower values
5. Bold the base case cell
6. Leave 1-2 blank rows between tables

**No manual intervention required** - the sensitivity tables must be fully functional when the user opens the file.

## Scenario Implementation

**The workbook projects all three scenarios in separate model sheets: `Model - Bear`, `Model - Base`, and `Model - Bull`.**

### Bear Case
- Conservative revenue growth (low end of historical range)
- Margin compression or no expansion
- Higher WACC (risk premium increase)
- Lower terminal growth rate
- Higher CapEx assumptions

### Base Case
- Consensus or management guidance revenue growth
- Moderate margin expansion based on operating leverage
- Current market-implied WACC
- GDP-aligned terminal growth (2.5-3.0%)
- Standard CapEx assumptions

### Bull Case
- Optimistic revenue growth (high end of projections)
- Significant margin expansion
- Lower WACC (reduced risk premium)
- Higher terminal growth (3.5-5.0%)
- Reduced CapEx intensity

**Formula Implementation — quarterly model sheets, one per scenario:**

Actual/historical quarters: hardcoded black-font numbers, identical across all three model sheets.

Projected quarters: each model sheet references its corresponding Bear, Base, or Bull assumption column from `Drivers & Assumptions`.

Example (Model - Base, Revenue Stream A Q1 FY2026E):
`='Drivers & Assumptions'!C10 * (1 + 'Drivers & Assumptions'!D10)`

Example (Model - Bear, same cell row, same column):
`='Drivers & Assumptions'!C10 * (1 + 'Drivers & Assumptions'!E10)`

There is no case selector, no consolidation column, and no INDEX/IF logic. Each model sheet references only its own scenario column from `Drivers & Assumptions`. The `DCF` sheet reads from all three model sheets to produce three price targets.

## Deliverables Structure

**File naming**: in this repo, write the primary model as `<run>/model.xlsx`.

**Default repo tabs** (7 core tabs for institutional-quality single-company models):

1. **Summary** — investment recommendation and return setup. The beginning of the sheet must show current price vs target price, upside/downside, 1-year return, 3-year return/IRR, bull/base/bear implied values, exit-multiple scenario summary, key valuation metrics (EV/EBITDA, P/E, FCF yield or sector-equivalent), revenue/EBIT/FCF trends, and key risk highlights. This is the first sheet anyone opens — make it self-contained.

2. **Drivers & Assumptions** — single source of truth, quarterly and line-item specific. **Common assumptions as numbers** (tax rate as %, diluted shares in millions, capex in $, D&A in $ or %, SBC in $, WACC, terminal g, risk-free rate, ERP, beta, cost of debt, FX, CPI, inflation, commodity decks) come first. **Company-specific drivers** follow: quarterly revenue per stream (growth rates or primitive values like volume/ASP/ARR/churn), cost of revenue / gross margin per stream (dollar costs or margin rates per quarter), and expense line assumptions (S&M, R&D, G&A or sector equivalents per quarter). Each row has Bear/Base/Bull scenario columns. Per-cell assumption rationale goes in cell comments on the individual quarterly scenario assumption cell, not in wide note columns.

3. **Model - Bear**, **Model - Base**, **Model - Bull** — three separate quarterly integrated operating model sheets, all generated from the same template and read-only from `Drivers & Assumptions`. Each sheet shows full line-item detail: revenue by each reported stream, total revenue (formula sum), QoQ/YoY growth for every material line, cost of revenue by stream, gross profit/gross margin by stream, expense breakdown (S&M, R&D, G&A or sector equivalents), EBITDA, D&A, EBIT, interest, tax, net income, EPS, and FCF. Growth rates and margin percentages are visible inline. Covers P&L, balance sheet, and cash flow / FCF bridge in one integrated layout per sheet. Actual/historical quarters are hardcoded black-font numbers (identical across all three sheets). Projected quarters are formulas referencing the respective Bear, Base, or Bull column from `Drivers & Assumptions`.

4. **DCF** — intrinsic valuation engine. References `Model - Bear`, `Model - Base`, and `Model - Bull` directly to compute three price targets (Bear/Base/Bull). Calculates UFCF/FCFE, WACC/Ke, discount factors, terminal value, enterprise/equity value, and value per share — **one** set of calculations that reads the three model sheets. Does **not** duplicate the full operating model. Does **not** contain its own scenario blocks.

5. **Scenarios** — forward-return framework. Computes 1-year return and 3-year return/IRR for Bear/Base/Bull cases, plus exit-multiple scenarios across holding periods (EV/EBITDA, P/E, P/BV, EV/Sales, cap rate, EV/RAB, NAV, etc.). Sources DCF values from `DCF`. Links headline outputs to `Summary`.

6. **Sensitivity** — fully populated sensitivity grids, all formula-driven. Required: WACC vs Terminal Growth or sector-equivalent. Required: at least one sector-native sensitivity (churn × FCF margin, ASP × utilization, NIM × cost of risk, MLR × ticket growth, commodity price × FX, cap rate × NOI). Center cell = base case, highlighted.

7. **Checks** — formula, model-sanity, and cross-artifact integrity checks: active output cells are not Excel errors, BS balances (A = L + E), CF ties to cash, revenue equals sum of drivers, DCF center sensitivity equals base DCF, Summary target/base case ties to active DCF/Scenarios output, scenario ordering (Bear ≤ Base ≤ Bull for value and returns), recommendation/rating is consistent with base upside and 1Y/3Y IRR thresholds, return math ties, share count consistency, WACC cross-check, terminal value sanity (50-70% of EV or sector-equivalent), outputs.json references exist, and any user-defined validation rules. All checks output TRUE/FALSE or pass/fail.

**Optional tabs**: `QTracker` for quarterly actuals/consensus/guidance (can serve as audit/reconciliation alongside Model), `MarketData` for minimal market inputs and company-only trading history, and `Ownership` for shareholder/float/governance reference data.

**No default Comps tab**: company comparisons, peer multiples, broker grids, and sector benchmark tables belong in an external comps artifact. If peer analysis informs valuation, use a dated external reference and import only the final peer-derived value/range or terminal-multiple assumption.

**Key features**: Three separate model sheets (`Model - Bear`, `Model - Base`, `Model - Bull`) all from the same template and read-only from `Drivers & Assumptions`, quarterly columns, growth/margin percentages visible inline, no case selectors, no duplicated full model inside DCF, semantic font colors (see below), professional fill colors for headers/structural elements, cell comments with per-cell source + rationale on all inputs, professional borders around major sections, formatted numbers/tables, and named outputs in outputs.json for downstream consumers (reports, presentations, dashboards).

**Semantic colors:**
- **Black font** — actual/historical hardcoded data.
- **Bright blue font (#0066CC)** — editable inputs / forward assumptions.
- **Dark blue font (#1F3864)** — formula outputs / calculated values.
- **Purple font (#7030A0)** — cross-sheet or cross-file references.
- **Red font (#FF0000)** — Excel errors (#REF!, #DIV/0!, etc.).
- **Fill colors:** scenario fill applies **only** to scenario assumption/input cells pulled from `Drivers & Assumptions`. Formula output cells get **no** scenario fill. Soft red/pink = Bear, light yellow/amber = Base, soft green = Bull. Structural headers use dark blue (#1F4E79) fill with white bold text; sub-headers use light blue (#D9E1F2) fill with black bold text.

## Outputs JSON

After recalc passes (status: "success") and `validate_model.py` passes, write `<run>/outputs.json` mapping stable output keys to their sheet/cell locations. Read every value from the recalculated workbook cell identified by `sheet` + `cell`; do not recompute output values separately in Python. Also export workbook-derived tables to `<run>/data/normalized/model_extracts/` for downstream consumers (charts, reports, presentations, dashboards). Then run `validate_outputs.py` to verify JSON values equal workbook cells within tolerance.

### Schema

Use the array shape below. This matches the repo's run-level `outputs.json` pattern and the Univer builder output shape.

```json
{
  "workbook_id": "ticker-dcf-run-id",
  "workbook_name": "Ticker DCF Model",
  "model": "<run>/model.xlsx",
  "generated_at": "<ISO timestamp>",
  "recalc": { "status": "success", "errors": 0, "checked_at": "<ISO timestamp>" },
  "outputs": [
    { "key": "valuation.implied_share_price", "sheet": "DCF", "cell": "E85", "value": 142.50, "unit": "USD/share" },
    { "key": "market.current_price", "sheet": "Summary", "cell": "B5", "value": 118.30, "unit": "USD/share" },
    { "key": "valuation.upside_downside", "sheet": "Summary", "cell": "B7", "value": 0.205, "unit": "percent" },
    { "key": "return.one_year_base", "sheet": "Summary", "cell": "B8", "value": 0.205, "unit": "percent" },
    { "key": "return.three_year_irr_base", "sheet": "Summary", "cell": "B9", "value": 0.082, "unit": "percent" },
    { "key": "scenario.exit_multiple_base", "sheet": "Scenarios", "cell": "F15", "value": 18.0, "unit": "x" },
    { "key": "scenario.exit_multiple_3yr_irr", "sheet": "Scenarios", "cell": "F22", "value": 0.095, "unit": "percent" },
    { "key": "valuation.enterprise_value", "sheet": "DCF", "cell": "E81", "value": 125000, "unit": "USD millions" },
    { "key": "valuation.equity_value", "sheet": "DCF", "cell": "E83", "value": 114000, "unit": "USD millions" },
    { "key": "assumption.wacc", "sheet": "Drivers & Assumptions", "cell": "C20", "value": 0.092, "unit": "percent" },
    { "key": "assumption.terminal_growth", "sheet": "Drivers & Assumptions", "cell": "C21", "value": 0.030, "unit": "percent" },
    { "key": "valuation.terminal_value_pct_ev", "sheet": "DCF", "cell": "E78", "value": 0.62, "unit": "percent" },
    { "key": "financial.revenue_ltm", "sheet": "Model", "cell": "D10", "value": 48500, "unit": "USD millions" },
    { "key": "financial.revenue_5yr_cagr", "sheet": "Summary", "cell": "B20", "value": 0.122, "unit": "percent" },
    { "key": "financial.ebit_margin_terminal", "sheet": "Summary", "cell": "B24", "value": 0.52, "unit": "percent" },
    { "key": "capital_structure.net_debt", "sheet": "Model", "cell": "H35", "value": -8500, "unit": "USD millions" },
    { "key": "capital_structure.shares_outstanding", "sheet": "Model", "cell": "H42", "value": 800, "unit": "millions" }
  ],
  "scenarios": {
    "bear":  { "implied_share_price": 98.00,  "one_year_return": -0.172, "three_year_irr": -0.060, "exit_multiple": 14.0 },
    "base":  { "implied_share_price": 142.50, "one_year_return":  0.205, "three_year_irr":  0.082, "exit_multiple": 18.0 },
    "bull":  { "implied_share_price": 195.00, "one_year_return":  0.648, "three_year_irr":  0.181, "exit_multiple": 22.0 }
  },
  "external_comps_reference": {
    "used": false,
    "path": null,
    "snapshot_date": null,
    "peer_derived_value_per_share": null
  }
}
```


### Requirements

- Write `outputs.json` ONLY after `recalc.py` returns status "success" with zero errors and `validate_model.py` passes.
- Every object in `outputs[]` MUST include `key`, `sheet`, `cell`, `value`, and `unit`; `sheet` + `cell` must resolve to an actual workbook cell. Do not fabricate values.
- Values are workbook-derived — read them from the recalculated model, do not recompute in Python.
- Run `validate_outputs.py` immediately after writing `outputs.json`; it must assert each JSON value equals the referenced workbook cell within tolerance.
- Include the `scenarios` block with bull/base/bear implied prices, 1-year returns, 3-year IRRs, and exit multiples to give downstream a quick return framework.
- Do not include a full comps table in `outputs.json` by default. If external peer analysis is used, include only `external_comps_reference` with path/date and final peer-derived value/range.
- Thesis narrative belongs in `report.md`; only include thesis-derived numeric KPIs if they are workbook outputs.
- Export supporting CSV/JSON tables under `<run>/data/normalized/model_extracts/` (e.g., `dcf_projection.csv`, `scenario_summary.csv`, `exit_multiple_returns.csv`, `wacc_tgr_sensitivity.csv`, `sector_driver_sensitivity.csv`, `kpi_tracker.csv`).
- Regenerate `outputs.json` and model extracts after every model change that affects outputs.

### Model Extract Schemas

Use stable column names so chart/report/deck scripts do not break.

`dcf_projection.csv`:
- `year` (string, e.g., `2026E`)
- `period_type` (`actual` or `estimate`)
- `revenue_usd_m` (number)
- `revenue_growth_pct` (number, decimal)
- `gross_margin_pct` (number, decimal)
- `ebit_margin_pct` (number, decimal)
- `unlevered_fcf_usd_m` (number)
- `fcf_margin_pct` (number, decimal)
- `source_sheet`, `source_cell` (audit fields)

`scenario_summary.csv`:
- `scenario` (`bear`, `base`, `bull`)
- `revenue_cagr_pct` (number, decimal)
- `terminal_fcf_margin_pct` (number, decimal)
- `wacc_pct` (number, decimal)
- `terminal_growth_pct` (number, decimal)
- `implied_share_price_usd` (number)
- `upside_downside_pct` (number, decimal)
- `source_sheet`, `source_cell`

`wacc_tgr_sensitivity.csv`:
- `wacc_pct` (number, decimal)
- `terminal_growth_pct` (number, decimal)
- `implied_share_price_usd` (number)
- `is_base_case` (boolean)
- `source_sheet`, `source_cell`

`exit_multiple_returns.csv`:
- `scenario` (`bear`, `base`, `bull`)
- `holding_period_years` (1, 3, or other modeled periods)
- `exit_multiple_type` (EV/EBITDA, P/E, P/BV, cap_rate, EV/RAB, NAV, or sector-equivalent)
- `exit_multiple` (number)
- `exit_price_per_share` (number)
- `dividends_per_share` (number, if applicable)
- `total_return_pct` (number, decimal)
- `irr_pct` (number, decimal)
- `source_sheet`, `source_cell`

`external_comps_reference.json` (only if external comps are used):
- `used` (boolean)
- `path` (string)
- `snapshot_date` (date)
- `methodology` (string)
- `peer_derived_value_per_share` (number, optional)
- `peer_derived_range_low/high` (number, optional)

`kpi_tracker.csv`:
- `pillar`, `kpi`, `current_value`, `unit`
- `bear_trigger`, `base_case`, `bull_trigger`
- `model_impact`, `next_review_date`
- `source_sheet`, `source_cell`

## Run-Specific Scripts

Scripts used to build, recalculate, or validate the model must be saved under the active run directory — not at the repo root and not as a single monolithic script. Use modular, purpose-specific scripts:

### Directory Convention

```
<run>/data/scripts/
  model/
    build_model.py        # workbook construction (openpyxl)
    populate_assumptions.py  # assumption blocks and scenario data
    sensitivity_tables.py    # sensitivity grid formula generation
  validation/
    recalc.py             # LibreOffice recalculation and error scan
    check_outputs.py      # validate outputs.json against model cells
    cross_checks.py       # balance checks, terminal value sanity, formula audit
```

### Rules

- **Modular, not monolithic.** One script per concern. `build_model.py` constructs the workbook; `sensitivity_tables.py` writes the sensitivity formulas; `recalc.py` handles recalculation and error scanning. Do NOT write a single `do_everything.py`.
- **Idempotent.** Running the same script twice produces the same result.
- **Save scripts before delivering.** Scripts are part of the audit trail. If you built the model with a Python script, save it. If you used Office JS in a live session, save the JS snippet that mirrors the key operations.
- **Validation scripts run after `recalc.py` passes.** Only run `check_outputs.py` and `cross_checks.py` when the workbook has zero formula errors.
- **Do not commit `data/` to git** unless explicitly asked — the `.gitignore` covers `runs/*/data/raw/` already. Model and validation scripts under `data/scripts/` are small and useful to keep under version control; add them unless the user opts out.

## Best Practices

### Model Construction
1. **Build incrementally**: Complete each section before moving to next
2. **Test as building**: Enter sample numbers to verify formulas
3. **Use consistent structure**: Similar calculations follow similar patterns
4. **Comment complex formulas**: Add notes for unusual calculations
5. **Build in checks**: Sum checks and balance checks where applicable

### Documentation
1. **Document all assumptions**: Explain reasoning behind key inputs
2. **Cite data sources**: Note where each data point came from
3. **Explain methodology**: Describe any non-standard approaches
4. **Flag uncertainties**: Highlight areas with limited visibility

### Quality Control
1. **Cross-check calculations**: Verify math in multiple ways
2. **Stress test assumptions**: Run sensitivity to ensure model is robust
3. **Peer review**: Have someone else check formulas
4. **Version control**: Save versions as work progresses

## Common Variations

### High-Growth Technology Companies
- Longer projection period (7-10 years)
- Higher initial growth rates (20-30%)
- Significant margin expansion over time
- Higher WACC (12-15%)
- Model unit economics (users, ARPU, etc.)

### Mature/Stable Companies
- Shorter projection period (3-5 years)
- Modest growth rates (GDP +1-3%)
- Stable margins
- Lower WACC (7-9%)
- Focus on cash generation and capital allocation

### Cyclical Companies
- Model through economic cycle
- Normalize margins at mid-cycle
- Consider trough and peak scenarios
- Adjust beta for cyclicality

### Multi-Segment Companies
- Separate DCFs for each business unit
- Different growth rates and margins by segment
- Sum-of-parts valuation
- Consider synergies

## Troubleshooting

**If you encounter errors or unreasonable results, read [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for detailed debugging guidance.**

## Workflow Integration

### At Start of DCF Build

1. **Gather market data**:
   - Check for available MCP servers for current market data
   - Use web search/fetch for stock prices, beta, and other market metrics
   - Request from user if specific data is needed

2. **Gather historical financials**:
   - Check for available MCP servers (Daloopa, etc.)
   - Request from user if not available via MCP
   - Manual extraction from 10-Ks if necessary

3. **Begin model construction** using the DCF methodology detailed in this skill

### During Model Construction

1. **Build Excel model** using openpyxl with formulas (not hardcoded values)
2. **Follow xlsx skill conventions** for formula construction and formatting
3. **Apply fill colors only if requested** by user or if specific brand guidelines are provided

### Before Delivering Model (MANDATORY)

1. **Verify structure**:
   - Core tabs exist: Summary, Drivers & Assumptions, Model - Bear, Model - Base, Model - Bull, DCF, Scenarios, Sensitivity, Checks
   - `Drivers & Assumptions` is quarterly and line-item specific with Bear/Base/Bull scenario columns; common assumptions as numbers; per-cell rationale in cell comments
   - Three model sheets all generated from same template, read-only from `Drivers & Assumptions`; full line-item detail (revenue by stream, QoQ/YoY, cost by stream, gross profit/margin by stream, expense breakdown, EBITDA/EBIT/NI/EPS/FCF and margins); growth/margin percentages visible inline
   - `DCF` references `Model - Bear`, `Model - Base`, `Model - Bull` directly; does not duplicate the operating model or contain its own scenario blocks
   - Scenarios sheet includes 1-year return, 3-year return/IRR, and exit-multiple return framework; headline outputs link to Summary
   - Sensitivity tables are on `Sensitivity` for repo workbooks; all cells populated with full DCF recalculation; center cell validated against base case; no scalar approximations unless explicitly labeled
   - Font colors: black = actuals, bright blue = editable inputs, dark blue = formula outputs, purple = cross-sheet refs, red = errors
   - Share count / Diluted Shares inputs and linked DCF/EPS cells are number-formatted, not percentage-formatted
   - Cell comments on ALL inputs with both source AND per-cell assumption rationale
   - Scenario fill only on assumption/input cells from Drivers & Assumptions; formula outputs get no scenario fill
   - Professional borders around major sections

2. **Recalculate formulas**: Run `python recalc.py model.xlsx 30`

3. **Check output**:
   - If `status` is `"success"` → Continue to step 4
   - If `status` is `"errors_found"` → Check `error_summary` and read [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for debugging guidance

4. **Fix errors and re-run LibreOffice-headless recalc.py** until status is "success"; confirm the recalculated workbook no longer shows the prior `#VALUE!`, `#REF!`, or other error values

5. **Run validation scripts**:
   - `validate_model.py` before generating `outputs.json`
   - Generate `outputs.json` from recalculated workbook cells only
   - `validate_outputs.py` after writing `outputs.json`
   - `validate_artifacts.py` if `report.md`, `deck.spec.json`, `deck.html`, or `deck.pptx` exists or is being delivered

6. **Spot-check formulas**:
   - Verify actual/historical quarters are identical across all three model sheets
   - Verify projected quarters in each model sheet reference the correct Bear, Base, or Bull column from `Drivers & Assumptions`
   - Verify growth/margin percentages are visible inline in each model sheet
   - Verify `DCF` references the three model sheets (not duplicated operating logic)
   - Verify recommendation/rating is consistent with base upside and 1Y/3Y return thresholds
   - Verify Summary return outputs tie to active DCF/Scenarios outputs

7. **Deliver model**

### Available Data Sources

- **MCP servers**: If configured (Daloopa for historical financials)
- **Web search/fetch**: For current stock prices, beta, and market data
- **User-provided data**: Historical financials, consensus estimates
- **Manual extraction**: SEC EDGAR filings as fallback

## Final Output Checklist

Before delivering DCF model:

**Structure:**
- [ ] Full core tab set populated: Summary, Drivers & Assumptions, Model - Bear, Model - Base, Model - Bull, DCF, Scenarios, Sensitivity, Checks
- [ ] Summary tab is self-contained and starts with recommendation, target/current price, upside, 1-year return, 3-year return/IRR, bull/base/bear values, exit-multiple summary, key metrics, and risk highlights
- [ ] Drivers & Assumptions tab is quarterly and line-item specific: common assumptions as numbers first, then revenue stream assumptions, cost per stream, expense lines; each row has Bear/Base/Bull scenario columns; per-cell rationale in cell comments, not wide note columns; Diluted Shares / Shares Outstanding formatted as numbers, not percentages
- [ ] Model - Bear, Model - Base, Model - Bull tabs: all from same template, read-only from Drivers & Assumptions; full line-item detail with revenue by stream, QoQ/YoY, cost/gross profit/gross margin by stream, expense breakdown, EBITDA/EBIT/NI/EPS/FCF and margins; growth/margin percentages visible inline; actual quarters identical across all three sheets
- [ ] DCF references Model - Bear, Model - Base, Model - Bull directly; does not duplicate the operating model or contain its own scenario blocks
- [ ] Scenarios tab includes bull/base/bear, 1-year return, 3-year return/IRR, and exit-multiple scenarios across holding periods
- [ ] No Comps/Peer Comps/Comparative sheet in the company model unless explicitly requested; peer analysis is external by default
- [ ] Checks tab outputs TRUE/FALSE for all integrity checks, including formula-error checks on active outputs and Summary-vs-active-case ties

**Formulas & Recalculation:**
- [ ] Run `python recalc.py model.xlsx 30` until status is "success" (zero formula errors across ALL sheets)
- [ ] All projections, margins, discount factors, PVs, and sensitivity cells are live formulas — no hardcoded computed values
- [ ] Sensitivity tables fully populated with formulas (75+ cells across 3 tables, not approximations or placeholders)
- [ ] Bear/Base/Bull references correct across Model - Bear, Model - Base, Model - Bull, DCF, and Scenarios

**Colors & Formatting:**
- [ ] Font colors: black = actuals, bright blue (#0066CC) = editable inputs, dark blue (#1F3864) = formula outputs, purple (#7030A0) = cross-sheet refs, red = errors
- [ ] Fill colors: scenario fill only on assumption/input cells from Drivers & Assumptions; formula output cells get no scenario fill
- [ ] Structural headers: dark blue (#1F4E79) fill with white bold text
- [ ] Cell comments on ALL inputs (both actual hardcodes and editable assumptions) with source/date/reference
- [ ] Professional borders around major sections
- [ ] Number formats: years as text, percentages at 0.0%, currency in millions with units in headers, zeros as "-"; Diluted Shares / Shares Outstanding formatted as numbers, not percentages

**Validation:**
- [ ] OpEx based on revenue (not gross profit)
- [ ] Terminal value 50-70% of EV
- [ ] Terminal growth < WACC and < risk-free rate
- [ ] Tax rate 21-28%
- [ ] Net debt sign correct (negative = net cash position)

**Downstream Artifacts:**
- [ ] `outputs.json` written to `<run>/outputs.json` only after recalc and `validate_model.py` pass; values are read from recalculated workbook cells
- [ ] `validate_outputs.py` confirms every `outputs.json` value equals its referenced workbook cell within tolerance
- [ ] `outputs.json` includes stable key → sheet/cell mappings, DCF value, current/target price, upside, 1-year return, 3-year return/IRR, scenario range, and exit-multiple scenario outputs
- [ ] External comps reference included only if used: path/date/final peer-derived value, not the peer table
- [ ] Workbook-derived extracts written to `<run>/data/normalized/model_extracts/` for charts/reports/decks
- [ ] `validate_artifacts.py` passes if report/deck artifacts exist or are delivered
- [ ] Run-specific scripts saved under `<run>/data/scripts/model/` and `<run>/data/scripts/validation/` — modular, not monolithic
- [ ] File naming: primary model is `<run>/model.xlsx`