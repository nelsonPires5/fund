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
- NO placeholder text, NO linear approximations, NO manual steps required
- Each cell must recalculate full DCF for that assumption combination

**Cell Comments:**
- Add cell comments AS each hardcoded value is created
- Format: "Source: [System/Document], [Date], [Reference], [URL if applicable]"
- Every blue input must have a comment before moving to next section
- Do not defer to end or write "TODO: add source"

**Model Layout Planning:**
- Define ALL section row positions BEFORE writing any formulas
- Write ALL headers and labels first
- Write ALL section dividers and blank rows second
- THEN write formulas using the locked row positions
- Test formulas immediately after creation

**Formula Recalculation and Validation:**
- Run `python recalc.py model.xlsx 30` before delivery. Use the bundled script at `scripts/recalc.py` from this skill, or copy it into `<run>/data/scripts/validation/recalc.py` for auditability.
- Fix ALL errors until status is "success".
- Zero formula errors required (#REF!, #DIV/0!, #VALUE!, etc.).
- After recalc succeeds, run `validate_model.py` before generating `outputs.json`.
- After `outputs.json` is generated from recalculated workbook cells, run `validate_outputs.py`.
- If report/deck artifacts already exist or are being delivered, run `validate_artifacts.py` after they are built.

**Scenario Blocks and Return Framework:**
- Create separate blocks for Bear/Base/Bull cases.
- Show assumptions horizontally across projection years within each block.
- Use IF formulas or a clean case selector/consolidation column: `=IF($B$6=1,[Bear cell],IF($B$6=2,[Base cell],[Bull cell]))`.
- Verify formulas reference correct scenario block cells.
- Build a dedicated `Scenarios` sheet for forward-return analysis. It MUST include 1-year return and 3-year return/IRR for Bear/Base/Bull cases, plus exit-multiple scenarios across holding periods.
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
2. Build the primitive on the `Drivers` sheet, then link the resulting revenue lines into `Income Statement`.
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
- Put complex cost logic on `Drivers`; put clean P&L presentation on `Income Statement`.
  - Example: store-level SG&A, utilization-driven labor, data center cost/MW, claims cost/member, vehicle depreciation/fleet, fuel cost/MWh, cash cost/ton, or R&D capitalization logic belongs in `Drivers`.
  - The `Income Statement` then links to these calculated outputs and presents COGS, SG&A, R&D, EBITDA, D&A, EBIT, interest, tax, NI, and EPS in a clean financial statement format.

**Margin expansion framework:**
```
Current State → Target State (Year 5)
Gross Margin: X% → Y% (justify based on scale, efficiency)
EBIT Margin: X% → Y% (result of revenue growth + opex leverage)
```

### Step 5: Free Cash Flow Calculation

**Source of truth:** build the operating forecast in `Income Statement`, `Balance Sheet`, and `Cash Flow`. The `DCF` sheet should reference those forecast outputs; it should not duplicate revenue, SG&A, capex, D&A, or working-capital logic.

**Build FCF in proper sequence:**

```
EBIT                    ← linked from Income Statement
(-) Taxes               ← linked from Assumptions / Income Statement
= NOPAT
(+) D&A                 ← linked from Cash Flow or Income Statement
(-) CapEx               ← linked from Cash Flow / Drivers
(-) Δ NWC               ← linked from Cash Flow / Balance Sheet
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
- **Use Diluted Shares**: Includes options, RSUs, convertible securities
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

### Scenario Block Selection Pattern - Follow This Approach

**Assumptions are organized in separate blocks for each scenario:**

**CRITICAL STRUCTURE - Three rows per section header:**

```csv
BEAR CASE ASSUMPTIONS (section header, merge cells across)
Assumption,FY1,FY2,FY3,FY4,FY5
Revenue Growth (%),12%,10%,9%,8%,7%
EBIT Margin (%),45%,44%,43%,42%,41%

BASE CASE ASSUMPTIONS (section header, merge cells across)
Assumption,FY1,FY2,FY3,FY4,FY5
Revenue Growth (%),16%,14%,12%,10%,9%
EBIT Margin (%),48%,49%,50%,51%,52%

BULL CASE ASSUMPTIONS (section header, merge cells across)
Assumption,FY1,FY2,FY3,FY4,FY5
Revenue Growth (%),20%,18%,15%,13%,11%
EBIT Margin (%),50%,51%,52%,53%,54%
```

**Each scenario block MUST have a column header row** showing the projection years (FY2025E, FY2026E, etc.) immediately below the section title. Without this, users cannot tell which assumption value corresponds to which year.

**How to reference assumptions - Create a consolidation column:**
1. Case selector cell (e.g., B6) contains 1=Bear, 2=Base, or 3=Bull
2. Create a consolidation column with INDEX or OFFSET formulas to pull from the correct scenario block
3. Projection formulas reference the consolidation column (clean cell references)
4. Each scenario block contains full set of DCF assumptions across projection years

**Recommended consolidation column pattern (using INDEX):**
`=INDEX(B10:D10, 1, $B$6)`

**NOT this - scattered IF statements throughout:**
`=IF($B$6=1,[Bear block cell],IF($B$6=2,[Base block cell],[Bull block cell]))`

The consolidation column approach centralizes logic and makes the model easier to audit.

### Correct Revenue Projection Pattern

**Create a consolidation column with INDEX formulas, then reference it in projections:**

**Step 1 - Consolidation column for FY1 growth:**
`=INDEX([Bear FY1 growth]:[Bull FY1 growth], 1, $B$6)`

**Step 2 - Revenue projection references the consolidation column:**
- In `Drivers` or compact mode: `Revenue Year 1: =D29*(1+$E$10)`
- In repo-standard DCF links: `DCF selected revenue: ='Income Statement'!F10`

Where:
- D29 = Prior year revenue, when building the actual operating forecast on `Drivers` / `Income Statement`
- $E$10 = Consolidation column cell for FY1 growth (contains INDEX formula)
- $B$6 = Case selector (1=Bear, 2=Base, 3=Bull)

**This approach is cleaner than embedding IF statements in every projection formula** and makes it much easier to audit which scenario assumptions are being used. Build operating projection formulas in `Drivers` / `Income Statement`; use cross-sheet references in `DCF`.

### Correct FCF Formula Pattern

**Use consolidation columns with INDEX formulas, then reference them in FCF calculations:**

**Consolidation column approach:**
```csv
Item,Formula,Reference
D&A,=E29*$E$21,$E$21 = consolidation column for D&A %
CapEx,=E29*$E$22,$E$22 = consolidation column for CapEx %
Δ NWC,=(E29-D29)*$E$23,$E$23 = consolidation column for NWC %
Unlevered FCF,=E57+E58-E60-E62,E57=NOPAT E58=D&A E60=CapEx E62=Δ NWC
```

**Each consolidation column cell contains an INDEX formula** that pulls from the appropriate scenario block based on case selector. This keeps projection formulas clean and auditable.

Before writing formulas, confirm scenario block row locations and set up consolidation columns.

### Correct Cell Comment Format

**Every hardcoded value needs this format:**

"Source: [System/Document], [Date], [Reference], [URL if applicable]"

**Examples:**
```csv
Item,Source Comment
Stock price,Source: Market data script 2025-10-12 Close price
Shares outstanding,Source: 10-K FY2024 Page 45 Note 12
Historical revenue,Source: 10-K FY2024 Page 32 Consolidated Statements
Beta,Source: Market data script 2025-10-12 5-year monthly beta
Consensus estimates,Source: Management guidance Q3 2024 earnings call
```

### Correct Assumption Table Structure

**CRITICAL: Each scenario block requires THREE structural elements:**

1. **Section header row** (merged cells): e.g., "BEAR CASE ASSUMPTIONS"
2. **Column header row** showing years - THIS IS REQUIRED, DO NOT SKIP
3. **Data rows** with assumption values

**Structure:**
```csv
BEAR CASE ASSUMPTIONS (section header - merge across columns A:G)
Assumption,FY1,FY2,FY3,FY4,FY5
Revenue Growth (%),X%,X%,X%,X%,X%
EBIT Margin (%),X%,X%,X%,X%,X%
Terminal Growth,X%,,,,
WACC,X%,,,,

BASE CASE ASSUMPTIONS (section header - merge across columns A:G)
Assumption,FY1,FY2,FY3,FY4,FY5
Revenue Growth (%),X%,X%,X%,X%,X%
EBIT Margin (%),X%,X%,X%,X%,X%
Terminal Growth,X%,,,,
WACC,X%,,,,

BULL CASE ASSUMPTIONS (section header - merge across columns A:G)
Assumption,FY1,FY2,FY3,FY4,FY5
Revenue Growth (%),X%,X%,X%,X%,X%
EBIT Margin (%),X%,X%,X%,X%,X%
Terminal Growth,X%,,,,
WACC,X%,,,,
```

**WITHOUT the column header row showing projection years (FY2025E, FY2026E, etc.), users cannot tell which assumption value corresponds to which year. This row is MANDATORY.**

**Then create a consolidation column** (typically the next column to the right) that uses INDEX formulas to pull from the selected scenario block based on the case selector. This consolidation column is what your projection formulas reference.

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

**Don't use linear approximations:**

```
// WRONG - Linear approximation
B97: =B88*(1+(0.096-0.116))    // Assumes linear relationship

// WRONG - Division shortcut
B105: =B88/(1+(E48-0.07))      // Doesn't recalculate full DCF
```

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
- Leave blue inputs without documentation

**Why it's wrong:**
- Can't verify where data came from
- Fails xlsx skill requirements
- Not audit-ready
- Wastes time fixing later

**Instead:** Add cell comment AS EACH hardcoded value is created

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

**Instead:** Blue text for ALL hardcoded inputs, black text for ALL formulas, green for sheet links

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
2. **Missing cell comments** → Add comments AS cells are created, not at end
3. **Simplified sensitivity tables** → Populate all cells with full DCF recalc formulas, not approximations
4. **Scenario block references wrong** → Ensure IF formulas pull from correct Bear/Base/Bull blocks
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
5. **Professional model structure** enabling scenario analysis via case selector, consolidation columns, and clean formula references

### Workbook Completeness
6. **Full core tab set** — Summary, Drivers, Income Statement, Balance Sheet, Cash Flow, DCF, Scenarios, Sensitivity, Assumptions, Checks — populated, not placeholder. Optional tabs: QTracker, MarketData, Ownership.
7. **Summary tab is self-contained and return-first** — the beginning of the sheet must show recommendation, current price, target price, upside/downside, 1-year return, 3-year return/IRR, bull/base/bear values, exit-multiple scenario summary, key metrics, trends, and risk summary; a reader should understand the return setup without opening other sheets.
8. **Drivers tab exposes the economic primitive** — revenue and major cost drivers are built from sector-native units before flowing to the financial statements.
9. **No company-comparison tab by default** — do not include Comps/Peer Comps/Comparative sheets in `model.xlsx`. Peer analysis lives in an external comps artifact; the model may include only a small dated peer-derived assumption/output if needed.
10. **Checks tab is functional** — all checks output TRUE/FALSE, not placeholder text; covers active output formula errors, BS balance, CF tie, revenue-driver tie, WACC cross-check, DCF sensitivity center, Summary-to-active-case ties, scenario ordering, rating/recommendation vs return sanity, 1Y/3Y return math, terminal value sanity, share count consistency, outputs.json references, and formula errors.

### Formula and Color Discipline
11. **Formulas over hardcodes (non-negotiable)** — every projection, margin, discount factor, PV, and sensitivity cell is a live Excel formula; the only hardcoded numbers are raw inputs, assumption drivers, and current market data
12. **Semantic colors disciplined** — blue font for inputs, black for formulas, green for cross-sheet links; use the professional blue/grey palette for structure, with limited scenario accents allowed on presentation-facing sheets (green = bull/upside, red/pink = bear/downside, yellow = key editable assumption) when they improve readability
13. **Cell comments on every hardcoded input** — format "Source: [System/Document], [Date], [Reference], [URL if applicable]" — added AS cells are created, never deferred

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
4. **Macro/rate assumptions** for the `Assumptions` sheet when relevant: risk-free rate, ERP, beta, cost of debt, tax rate, FX, CPI, IPCA, inflation, GDP, SELIC/CDI, commodity prices, or sector-specific rates/fees.
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
2. **Drivers** - sector-native revenue and major operating/cost driver build. This is the detailed operating logic formerly called `Revenue Model`.
3. **Income Statement** - historical and projected P&L, linked from Drivers and Assumptions.
4. **Balance Sheet** - historical and projected balance sheet.
5. **Cash Flow** - historical and projected cash flow / FCF.
6. **DCF** - intrinsic valuation engine, referencing Income Statement, Balance Sheet, and Cash Flow forecasts.
7. **Scenarios** - bull/base/bear values, 1-year and 3-year returns/IRRs, and exit-multiple return frameworks.
8. **Sensitivity** - WACC/g or sector-equivalent plus sector-native sensitivity grids.
9. **Assumptions** - explicit assumption register with macro/rates/fees, scenario values, rationale, sources, and cells driven.
10. **Checks** - formula and cross-artifact checks.

Optional tabs only when needed:
- **QTracker** - quarterly actuals, consensus vs actuals, guidance vs actuals, and KPI tracking.
- **MarketData** - current price, shares, market cap, beta, risk-free rate, net debt, and company-only trading history/multiples. No peer table.
- **Ownership** - shareholders, float, insider/management ownership, and basic governance reference data.

A compact two-sheet DCF (`DCF`, `WACC`) is acceptable only when the user explicitly requests a quick standalone DCF.

**CRITICAL**: Sensitivity tables may live on a dedicated `Sensitivity` tab for the repo workbook; in compact DCF mode, place them at the bottom of the DCF sheet. Forward-return and exit-multiple IRR tables belong in `Scenarios`, not in `DCF`.

### Formula Recalculation (MANDATORY)

After creating or modifying the Excel model, **recalculate all formulas** using the recalc.py script from the xlsx skill:

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
- Recalculate all formulas in all sheets using LibreOffice
- Scan ALL cells for Excel errors (#REF!, #DIV/0!, #VALUE!, #NAME?, #NULL!, #NUM!, #N/A)
- Return detailed JSON with error locations and counts

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

**Fix all errors** and re-run recalc.py until status is "success" before delivering the model.

### Formatting Standards

**IMPORTANT**: Follow the xlsx skill for formula construction rules and number formatting conventions. The DCF skill adds specific visual presentation standards.

**Color Scheme - Two Layers**:

**Layer 1: Font Colors (MANDATORY from xlsx skill)**
- **Blue text (RGB: 0,0,255)**: ALL hardcoded inputs (stock price, shares, historical data, assumptions)
- **Black text (RGB: 0,0,0)**: ALL formulas and calculations
- **Green text (RGB: 0,128,0)**: Links to other sheets (WACC sheet references)

**Layer 2: Fill Colors — Professional Structure Palette + Limited Scenario Accents**
- **Keep it minimal** — use blues/greys for structural formatting. Add scenario accents only when they improve reader navigation.
- **Default structure palette:**
  - **Section headers**: Dark blue (RGB: 31,78,121 / `#1F4E79`) background with white bold text
  - **Sub-headers/column headers**: Light blue (RGB: 217,225,242 / `#D9E1F2`) background with black bold text
  - **Input cells**: Light grey (RGB: 242,242,242 / `#F2F2F2`) background with blue font — or just white with blue font if you want maximum minimalism
  - **Calculated cells**: White background with black font
  - **Output/summary rows** (per-share value, EV, etc.): Medium blue (RGB: 189,215,238 / `#BDD7EE`) background with black bold font
- **Optional scenario accents for reader-facing sheets:** bull/upside = soft green, bear/downside = soft red/pink, key editable assumption = pale yellow. Use sparingly, mainly in Summary, Scenarios, Sensitivity, and Assumptions.
- User-provided templates or explicit color preferences ALWAYS override these defaults.

**How the layers work together:**
- Input cell: Blue font + light grey fill = "Hardcoded input"
- Formula cell: Black font + white background = "Calculated value"
- Sheet link: Green font + white background = "Reference from another sheet"
- Key output: Black bold font + medium blue fill = "This is the answer"

**Font color tells you WHAT it is (input/formula/link). Fill color tells you WHERE you are (header/data/output).**

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
- Scenario assumption tables (Bear | Base | Bull | Selected)
- Historical vs projected financials matrix

**No borders:** Individual cells within tables (keep clean, scannable)

**Borders are mandatory** - models without professional borders are not client-ready.

**Number Formats** (follows xlsx skill standards):
- **Years**: Format as text strings (e.g., "2024" not "2,024")
- **Percentages**: `0.0%` (one decimal place)
- **Currency**: `$#,##0` for millions; `$#,##0.00` for per-share - ALWAYS specify units in headers ("Revenue ($mm)")
- **Zeros**: Use number formatting to make all zeros "-" (e.g., `$#,##0;($#,##0);-`)
- **Large numbers**: `#,##0` with thousands separator
- **Negative numbers**: `(#,##0)` in parentheses (NOT minus sign)

**Cell Comments (MANDATORY for all hardcoded inputs)**:

Per the xlsx skill, ALL hardcoded values must have cell comments documenting the source. Format: "Source: [System/Document], [Date], [Reference], [URL if applicable]"

**CRITICAL**: Add comments AS CELLS ARE CREATED. Do not defer to the end.

### DCF Sheet Detailed Structure

**Repo-standard vs compact mode:** In repo-standard 10-tab workbooks, the DCF sheet is the intrinsic valuation engine and should contain cross-sheet links to `Income Statement`, `Balance Sheet`, `Cash Flow`, and `Assumptions`. It must not duplicate the operating model. The inline single-sheet examples below are acceptable only for compact standalone DCF mode; for repo-standard workbooks, translate each operating line into a cross-sheet reference.

**Section 1: Header**
```csv
Row,Content
1,[Company Name] DCF Model
2,Ticker: [XXX] | Date: [Date] | Year End: [FYE]
3,Blank
4,Case Selector Cell (1=Bear 2=Base 3=Bull)
5,Case Name Display (formula: =IF([Selector]=1"Bear"IF([Selector]=2"Base""Bull")))
```

**Section 2: Market Data (NOT case dependent)**
```csv
Item,Value
Current Stock Price,$XX.XX
Shares Outstanding (M),XX.X
Market Cap ($M),[Formula]
Net Debt ($M),XXX [or Net Cash if negative]
```

**Section 3: DCF Input Links / Selected Case**

The DCF should link to the selected-case outputs from `Income Statement`, `Balance Sheet`, and `Cash Flow`, plus valuation inputs from `Assumptions` and optional `MarketData`. Do not rebuild operating drivers here.

Create a small DCF input/link block showing:
- Selected scenario name / case selector
- Linked revenue, EBIT/EBITDA, tax rate, D&A, capex, ΔNWC, FCF
- WACC or Ke inputs from `Assumptions`
- Terminal growth and/or terminal multiple assumption from `Assumptions`
- Current price, shares, net debt from `MarketData`, `Balance Sheet`, or `Assumptions`

Full Bear/Base/Bull operating assumptions live in `Assumptions` and `Drivers`; full forward-return cases live in `Scenarios`.

**Section 4: Historical & Projected Financials**

**Reference the selected-case forecast lines from the financial statements**, not scattered IF formulas or duplicated operating-model rows inside DCF.

```csv
Selected Financials ($M),2020A,2021A,2022A,2023A,2024E,2025E,2026E
Revenue,='Income Statement'!B10,='Income Statement'!C10,='Income Statement'!D10,='Income Statement'!E10,='Income Statement'!F10,='Income Statement'!G10,='Income Statement'!H10
  % growth,='Income Statement'!B11,='Income Statement'!C11,='Income Statement'!D11,='Income Statement'!E11,='Income Statement'!F11,='Income Statement'!G11,='Income Statement'!H11
Gross Profit,='Income Statement'!B15,='Income Statement'!C15,='Income Statement'!D15,='Income Statement'!E15,='Income Statement'!F15,='Income Statement'!G15,='Income Statement'!H15
EBITDA,='Income Statement'!B30,='Income Statement'!C30,='Income Statement'!D30,='Income Statement'!E30,='Income Statement'!F30,='Income Statement'!G30,='Income Statement'!H30
EBIT,='Income Statement'!B35,='Income Statement'!C35,='Income Statement'!D35,='Income Statement'!E35,='Income Statement'!F35,='Income Statement'!G35,='Income Statement'!H35
Tax Rate,='Income Statement'!B40,='Income Statement'!C40,='Income Statement'!D40,='Income Statement'!E40,='Income Statement'!F40,='Income Statement'!G40,='Income Statement'!H40
NOPAT,=B6*(1-B7),=C6*(1-C7),=D6*(1-D7),=E6*(1-E7),=F6*(1-F7),=G6*(1-G7),=H6*(1-H7)
```

**Key Formula Pattern**:
- Repo-standard operating line: `='Income Statement'!F10` or `='Cash Flow'!F25`.
- Compact-mode projection only: `=PriorYearRevenue*(1+SelectedGrowth)` where `SelectedGrowth` comes from the consolidation column.
- NOT: `=E29*(1+IF($B$6=1,$B$10,IF($B$6=2,$C$10,$D$10)))`

This approach is cleaner, easier to audit, and prevents formula errors by centralizing operating logic outside the DCF sheet.

**Section 5: Free Cash Flow Build**

**CRITICAL**: Verify row references point to the CORRECT assumption rows. Test formulas immediately after creation.

```csv
Cash Flow Links ($M),2020A,2021A,2022A,2023A,2024E,2025E,2026E
NOPAT,=B6*(1-B7),=C6*(1-C7),=D6*(1-D7),=E6*(1-E7),=F6*(1-F7),=G6*(1-G7),=H6*(1-H7)
(+) D&A,='Cash Flow'!B18,='Cash Flow'!C18,='Cash Flow'!D18,='Cash Flow'!E18,='Cash Flow'!F18,='Cash Flow'!G18,='Cash Flow'!H18
(-) CapEx,='Cash Flow'!B25,='Cash Flow'!C25,='Cash Flow'!D25,='Cash Flow'!E25,='Cash Flow'!F25,='Cash Flow'!G25,='Cash Flow'!H25
(-) Δ NWC,='Cash Flow'!B22,='Cash Flow'!C22,='Cash Flow'!D22,='Cash Flow'!E22,='Cash Flow'!F22,='Cash Flow'!G22,='Cash Flow'!H22
Unlevered FCF,=B10+B11-B12-B13,=C10+C11-C12-C13,=D10+D11-D12-D13,=E10+E11-E12-E13,=F10+F11-F12-F13,=G10+G11-G12-G13,=H10+H11-H12-H13
```

**Reference examples** (based on layout planning):
- D&A comes from `Cash Flow` or `Income Statement`.
- CapEx and ΔNWC come from `Cash Flow` / `Balance Sheet`.
- NOPAT can be calculated in DCF from linked EBIT and linked tax rate.

**Before writing formulas**: Confirm these row numbers match the actual workbook layout. Test one column, then copy across.

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

**Compact standalone DCF mode only:** If the workbook is a quick two-sheet DCF, a separate `WACC` sheet is acceptable. In repo-standard 10-tab workbooks, put WACC/Ke inputs on `Assumptions` and link the DCF to those cells.

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

## Case Selector Implementation

**Three-Case Framework:**

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

**Formula Implementation:**

**DO NOT use nested IF formulas scattered throughout.** Instead, create a consolidation column that uses INDEX or OFFSET formulas to pull from the appropriate scenario block.

**Recommended pattern (using INDEX):**
`=INDEX(B10:D10, 1, $B$6)` where `B10:D10` = Bear/Base/Bull values, `1` = row offset, `$B$6` = case selector cell (1, 2, or 3)

**Then reference the consolidation column** in all projections:
`Revenue Year 1: =D29*(1+$E$10)` where $E$10 is the consolidation column value for Year 1 growth.

This approach centralizes scenario logic, making the model easier to audit and maintain.

## Deliverables Structure

**File naming**: in this repo, write the primary model as `<run>/model.xlsx`.

**Default repo tabs** (10 core tabs for institutional-quality single-company models):

1. **Summary** — investment recommendation and return setup. The beginning of the sheet must show current price vs target price, upside/downside, 1-year return, 3-year return/IRR, bull/base/bear implied values, exit-multiple scenario summary, key valuation metrics (EV/EBITDA, P/E, FCF yield or sector-equivalent), revenue/EBIT/FCF trends, and key risk highlights. This is the first sheet anyone opens — make it self-contained.

2. **Drivers** — sector-native revenue and operating build. Show unit economics (ASP, volume, subscribers, ARPU, stores, SSS, members, ticket, utilization, capacity, tariff, commodity price, FX, etc.) alongside dollar projections when available. Also include complex cost-driver logic when business-specific: gross margin by segment, SG&A per unit/store/customer, R&D intensity, CAC, claims cost/member, fuel cost, fleet depreciation, cash cost/ton, capex capacity build.

3. **Income Statement** — historical (3-5 years) and projected (5+ years) P&L with revenue, COGS, gross profit, OpEx (S&M, R&D, G&A or sector equivalents), EBITDA, D&A, EBIT, interest, taxes, net income, EPS. All projections are live formulas referencing `Drivers` and `Assumptions`.

4. **Balance Sheet** — historical and projected balance sheet with key line items (cash, AR, inventory, PP&E, goodwill, debt, payables, equity, shares, invested capital). Projections driven by revenue ratios, working capital, and CapEx/depreciation schedules.

5. **Cash Flow** — historical and projected cash flow statement with operating CF (net income + D&A + working capital changes), investing CF (CapEx, acquisitions), financing CF (debt issuance/repayment, dividends, buybacks), and free cash flow to firm/equity as appropriate.

6. **DCF** — intrinsic valuation engine. Reference `Income Statement`, `Balance Sheet`, and `Cash Flow` forecasts. Calculate UFCF/FCFE, WACC/Ke, discount factors, terminal value, enterprise/equity value, and value per share. Do not duplicate the operating model.

7. **Scenarios** — bull/base/bear valuation and forward-return framework. Must include 1-year return and 3-year return/IRR. Must include exit-multiple scenarios across holding periods using sector-appropriate multiples (EV/EBITDA, P/E, P/BV, EV/Sales, cap rate, EV/RAB, NAV, etc.). Link headline scenario outputs to `Summary`.

8. **Sensitivity** — sensitivity tables fully populated with formulas. Required: WACC vs Terminal Growth or sector-equivalent. Required: at least one sector-native sensitivity, e.g. churn × FCF margin, ASP × utilization, NIM × cost of risk, MLR × ticket growth, commodity price × FX, cap rate × NOI. Base case centered with highlighted cell.

9. **Assumptions** — explicit assumption register listing every material assumption, base/bear/bull or low/base/high values, rationale/source, sensitivity range, model cells it drives, and last-updated date. Include macro/rate assumptions here: risk-free rate, ERP, beta, cost of debt, tax rate, FX, CPI, IPCA, inflation, GDP, SELIC/CDI, commodity decks, sector rates/fees, and valuation multiples.

10. **Checks** — formula, model-sanity, and cross-artifact integrity checks: active output cells are not Excel errors, BS balances (A = L + E), CF ties to cash, revenue equals sum of drivers, DCF center sensitivity equals base DCF, Summary target/base case ties to active DCF/Scenarios output, scenario ordering (Bear ≤ Base ≤ Bull for value and returns), recommendation/rating is consistent with base upside and 1Y/3Y IRR thresholds, return math ties, share count consistency, WACC cross-check, terminal value sanity (50-70% of EV or sector-equivalent), outputs.json references exist, and any user-defined validation rules. All checks output TRUE/FALSE or pass/fail.

**Optional tabs**: `QTracker` for quarterly actuals/consensus/guidance, `MarketData` for minimal market inputs and company-only trading history, and `Ownership` for shareholder/float/governance reference data.

**No default Comps tab**: company comparisons, peer multiples, broker grids, and sector benchmark tables belong in an external comps artifact. If peer analysis informs valuation, use a dated external reference and import only the final peer-derived value/range or terminal-multiple assumption.

**Key features**: Case selector (1/2/3), consolidation column with INDEX/OFFSET formulas, semantic font colors (blue=input, black=formula, green=cross-sheet link), professional fill colors (blue/grey structure plus limited scenario accents where useful), cell comments on all inputs, professional borders around major sections, formatted numbers/tables, and named outputs in outputs.json for downstream consumers (reports, presentations, dashboards).

**Semantic colors — two-layer system:**
- **Font color (WHAT):** blue = hardcoded input, black = formula/calculation, green = cross-sheet or cross-file reference.
- **Fill color (WHERE):** dark blue (#1F4E79) = section headers with white text, light blue (#D9E1F2) = sub-headers / column headers, light grey (#F2F2F2) = input cells, medium blue (#BDD7EE) = key outputs / base case cells, white = calculated cells.
- **Scenario accents (limited):** soft green = bull/upside, soft red/pink = bear/downside, pale yellow = key editable assumption. Use sparingly and consistently.
- **Together:** blue font on light grey fill = "I am an editable assumption"; black font on white = "I am a derived calculation"; green font on white = "I pull from another sheet."

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
    { "key": "assumption.wacc", "sheet": "Assumptions", "cell": "C20", "value": 0.092, "unit": "percent" },
    { "key": "assumption.terminal_growth", "sheet": "Assumptions", "cell": "C21", "value": 0.030, "unit": "percent" },
    { "key": "valuation.terminal_value_pct_ev", "sheet": "DCF", "cell": "E78", "value": 0.62, "unit": "percent" },
    { "key": "financial.revenue_ltm", "sheet": "Income Statement", "cell": "D10", "value": 48500, "unit": "USD millions" },
    { "key": "financial.revenue_5yr_cagr", "sheet": "Summary", "cell": "B20", "value": 0.122, "unit": "percent" },
    { "key": "financial.ebit_margin_terminal", "sheet": "Summary", "cell": "B24", "value": 0.52, "unit": "percent" },
    { "key": "capital_structure.net_debt", "sheet": "Balance Sheet", "cell": "H35", "value": -8500, "unit": "USD millions" },
    { "key": "capital_structure.shares_outstanding", "sheet": "Balance Sheet", "cell": "H42", "value": 800, "unit": "millions" }
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
   - Core tabs exist: Summary, Drivers, Income Statement, Balance Sheet, Cash Flow, DCF, Scenarios, Sensitivity, Assumptions, Checks
   - Scenario blocks for Bear/Base/Bull with assumptions across projection years
   - Case selector functional with formulas referencing correct scenario blocks
   - Scenarios sheet includes 1-year return, 3-year return/IRR, and exit-multiple return framework; headline outputs link to Summary
   - Sensitivity tables are on `Sensitivity` for repo workbooks (bottom of DCF only in compact mode)
   - Font colors: Blue inputs, black formulas, green sheet links
   - Cell comments on ALL hardcoded inputs
   - Professional borders around major sections

2. **Recalculate formulas**: Run `python recalc.py model.xlsx 30`

3. **Check output**:
   - If `status` is `"success"` → Continue to step 4
   - If `status` is `"errors_found"` → Check `error_summary` and read [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for debugging guidance

4. **Fix errors and re-run recalc.py** until status is "success"

5. **Run validation scripts**:
   - `validate_model.py` before generating `outputs.json`
   - Generate `outputs.json` from recalculated workbook cells only
   - `validate_outputs.py` after writing `outputs.json`
   - `validate_artifacts.py` if `report.md`, `deck.spec.json`, `deck.html`, or `deck.pptx` exists or is being delivered

6. **Spot-check formulas**:
   - Test one FCF formula - does it reference the correct assumption rows?
   - Change case selector - does the consolidation column update properly?
   - Verify revenue formulas reference consolidation column (not nested IF formulas)
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
- [ ] Full core tab set populated: Summary, Drivers, Income Statement, Balance Sheet, Cash Flow, DCF, Scenarios, Sensitivity, Assumptions, Checks
- [ ] Summary tab is self-contained and starts with recommendation, target/current price, upside, 1-year return, 3-year return/IRR, bull/base/bear values, exit-multiple summary, key metrics, and risk highlights
- [ ] Drivers tab exposes the sector-native revenue primitive and major business-specific cost drivers
- [ ] DCF references Income Statement, Balance Sheet, Cash Flow, and Assumptions; it does not duplicate the operating model
- [ ] Scenarios tab includes bull/base/bear, 1-year return, 3-year return/IRR, and exit-multiple scenarios across holding periods
- [ ] Assumptions tab includes company, valuation, macro/rate assumptions (risk-free, ERP, beta, cost of debt, tax, FX, CPI/IPCA/inflation/GDP/SELIC/CDI where relevant), sources, rationale, and cells driven
- [ ] No Comps/Peer Comps/Comparative sheet in the company model unless explicitly requested; peer analysis is external by default
- [ ] Checks tab outputs TRUE/FALSE for all integrity checks, including formula-error checks on active outputs and Summary-vs-active-case ties

**Formulas & Recalculation:**
- [ ] Run `python recalc.py model.xlsx 30` until status is "success" (zero formula errors across ALL sheets)
- [ ] All projections, margins, discount factors, PVs, and sensitivity cells are live formulas — no hardcoded computed values
- [ ] Sensitivity tables fully populated with formulas (75+ cells across 3 tables, not approximations or placeholders)
- [ ] Case selector functional; consolidation columns use INDEX/OFFSET, not nested IFs

**Colors & Formatting:**
- [ ] Font colors: Blue=inputs, Black=formulas, Green=cross-sheet links
- [ ] Fill colors: professional blue/grey structure palette, with limited consistent scenario accents only where useful
- [ ] Cell comments on ALL hardcoded inputs with source/date/reference
- [ ] Professional borders around major sections
- [ ] Number formats: years as text, percentages at 0.0%, currency in millions with units in headers, zeros as "-"

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