---
name: initiating-coverage
description: Create institutional-quality equity research initiation reports through a 5-task workflow. Tasks must be executed individually with verified prerequisites - (1) company research, (2) financial modeling, (3) valuation analysis, (4) chart generation, (5) final report assembly. This repo is model-first: model.xlsx and outputs.json precede charts, report.md, and optional decks. Tasks 3-5 have dependencies on earlier tasks.
---

# Initiating Coverage

Create institutional-quality equity research initiation reports through a structured 5-task workflow. Each task must be executed separately with verified inputs.

## Overview

This skill produces comprehensive first-time coverage reports following institutional standards (JPMorgan, Goldman Sachs, Morgan Stanley format). Tasks are executed individually, each verifying prerequisites before proceeding.

**Default Font**: Times New Roman throughout Office documents (unless user specifies otherwise).

## Repository Output Override

In this investment research workspace, the default final artifacts are run-local files, not loose task folders. The repo is **model-first**: `model.xlsx` and `outputs.json` are the quantitative source of truth. `report.md` is generated only after both exist.

```text
sectors/<sector>/companies/<ticker>/runs/<yyyy-mm-dd>-initial-coverage/
  data/raw/              # raw source captures; ignored by git
  data/normalized/       # optional cleaned/model-ready data
  data/scripts/          # model-build and validation scripts
    model/               # scripts that build/populate model.xlsx
    validation/          # scripts that cross-check/audit the model
  assets/charts/         # charts/images used in report and deck
  assets/screenshots/    # curated screenshots used in report and deck
  model.xlsx             # quantitative source of truth (Task 2 builds, Task 3 updates)
  outputs.json           # stable key-value model outputs (Task 2 builds, Task 3 updates)
  report.md              # detailed written analysis (Task 5; only after model.xlsx + outputs.json)
  deck.pptx              # optional presentation artifact
```

`workbook.html` (Univer) is **not** a default artifact - produce it only when the user explicitly requests Univer/HTML output. Report/deck visuals must be stored under `<run>/assets/` and referenced from the report/deck. Do not reference raw screenshots directly from `data/raw/` in final deliverables.

---

## ⚠️ CRITICAL: One Task at a Time

**THIS SKILL OPERATES IN SINGLE-TASK MODE ONLY.**

### If User Requests Full Pipeline

When user requests:
- "Create a coverage initiation report for [Company]"
- "Write an initiation report for [Company]"
- "Do the entire equity research process for [Company]"
- "Complete all 5 tasks for [Company]"
- Any request that implies running multiple tasks or the entire workflow

**REQUIRED RESPONSE:**

1. **Ask which specific task to perform:**
   ```
   I can help you create an equity research initiation report for [Company].
   This involves 5 separate tasks that need to be completed individually:

   1. Company Research - Research business, management, industry
   2. Financial Modeling - Build projection model
   3. Valuation Analysis - DCF and comparable companies
   4. Chart Generation - Create 25-35 charts
   5. Report Assembly - Compile final report

   Which task would you like to start with?
   ```

2. **When user explicitly requests all tasks together:**
   ```
   I understand you'd like to complete the entire initiation report pipeline.
   Currently, this skill supports executing one task at a time, which allows
   for better quality control and review at each stage.

   We're working on a seamless end-to-end workflow that will make this process
   more automated, but for now, we'll need to complete each task separately.

   Would you like to start with Task 2 (Financial Modeling) so the workbook becomes the quantitative source of truth, or Task 1 (Company Research) if you only want to gather qualitative research first?
   ```

3. **Never automatically assume which task to start** - always ask user to confirm.

4. **Never execute multiple tasks in sequence** - complete one task, deliver outputs, then wait for next user request.

### Task Execution Rules

- ✅ Execute exactly ONE task per user request
- ✅ Always verify prerequisites before starting a task
- ✅ Deliver task outputs and confirm completion
- ✅ Wait for user to explicitly request the next task
- ❌ Never chain multiple tasks together automatically
- ❌ Never assume user wants to proceed to next task
- ❌ Never execute Tasks 3-5 without verifying required inputs exist

### ⚠️ Deliverables Policy: NO SHORTCUTS

**DELIVER ONLY THE SPECIFIED OUTPUTS. DO NOT CREATE EXTRA DOCUMENTS.**

Each task specifies exact deliverables. Do NOT create:
- ❌ "Completion summaries"
- ❌ "Executive summaries"
- ❌ "Quick reference guides"
- ❌ "Next steps documents"
- ❌ "Task completion reports"
- ❌ Any other "helpful" documentation not explicitly specified

**Why**: These extras waste context and are not part of the professional workflow.

**What TO deliver**:
- ✅ Task 1: Research notes / document under the run folder or `data/normalized/` - **NOTHING ELSE**
- ✅ Task 2: `<run>/model.xlsx`, `<run>/outputs.json`, model extracts, and saved model/validation scripts - **NOTHING ELSE**
- ✅ Task 3: Updates to `<run>/model.xlsx`, `<run>/outputs.json`, valuation extracts, and optional `valuation_framework.md` - **NOTHING ELSE**
- ✅ Task 4: Final used charts in `<run>/assets/charts/`, chart scripts in `<run>/data/scripts/charts/`, and chart index - **NOTHING ELSE**
- ✅ Task 5: `<run>/report.md` by default (`.docx` only if explicitly requested) - **NOTHING ELSE**

**If a deliverable is not listed above, DO NOT CREATE IT.**

---

## Task Selection

Select which task to execute:

| Task | Name | Prerequisites | Output |
|------|------|--------------|--------|
| **1** | Company Research | Company name/ticker | Research notes / document |
| **2** | Financial Modeling | Financial data access | `<run>/model.xlsx` + `outputs.json` + extracts |
| **3** | Valuation Analysis | Task 2 model and outputs | Model/outputs valuation update + optional `valuation_framework.md` |
| **4** | Chart Generation | Tasks 1-3 + outputs/extracts | Final PNG/JPG charts in `assets/charts/` |
| **5** | Report Assembly | ALL previous tasks (1-4) | `<run>/report.md` by default |

---

## How to Use This Skill

### User Request Patterns and Responses

**Pattern 1: User specifies a specific task**
```
User: "Use initiating-coverage, Task 1 for Tesla"
Response: ✅ Execute Task 1 immediately
```

**Pattern 2: User asks for "initiation report" or "full pipeline"**
```
User: "Create a coverage initiation report for Tesla"
Response: ❌ DO NOT start any task automatically
         ✅ Ask which task to start with (see template above)
```

**Pattern 3: User wants to do "all tasks" or "entire workflow"**
```
User: "I want to complete all 5 tasks for Tesla"
Response: ❌ DO NOT chain tasks together
         ✅ Explain one-at-a-time limitation (see template above)
         ✅ Ask if they want to start with Task 2 (model-first default) or Task 1 (research first)
```

### Correct Usage Examples

**Executing a single task:**
```
"Use initiating-coverage skill, Task 1 for Tesla"
"Do Task 2 of initiating-coverage for Tesla"
"Run Task 3 for Tesla using the initiating-coverage skill"
```

**Completing full report (requires 5 separate requests):**
```
Request 1: "Do Task 1 for Tesla" → Complete → Deliver outputs
Request 2: "Do Task 2 for Tesla" → Complete → Deliver outputs
Request 3: "Do Task 3 for Tesla" → Complete → Deliver outputs
Request 4: "Do Task 4 for Tesla" → Complete → Deliver outputs
Request 5: "Do Task 5 for Tesla" → Complete → Deliver outputs
```

### Task Execution Order

For a complete initiation report, tasks must be executed in separate user requests following this order:

```
Request 1: Task 1 - Company Research (independent)
           ↓ [User reviews outputs and requests next task]
Request 2: Task 2 - Financial Modeling (independent)
           ↓ [User reviews outputs and requests next task]
Request 3: Task 3 - Valuation Analysis (requires Task 2 output)
           ↓ [User reviews outputs and requests next task]
Request 4: Task 4 - Chart Generation (requires Tasks 2 & 3 outputs)
           ↓ [User reviews outputs and requests next task]
Request 5: Task 5 - Report Assembly (requires ALL previous task outputs)
```

**Note**: Tasks 1 and 2 can be run in any order. Tasks 3-5 have strict dependencies and must verify inputs before proceeding.

---

## Task 1: Company Research

**Purpose**: Research company's business, management, competitive position, industry, and risks.

**Prerequisites**: ✅ None (fully independent)
- Company name or ticker symbol

**Process**:
1. Verify company name/ticker provided
2. Load detailed instructions from references/task1-company-research.md
3. Execute qualitative research workflow
4. Deliver research document

**Output**: Company Research Document (6,000-8,000 words) or run-local research section inputs for `report.md`
- Company overview & history
- Business model mechanics and revenue streams
- Management bios (300-400 words × 3-4 execs)
- Products & services analysis
- Customer segments and go-to-market model
- Industry overview and market structure
- Competitive analysis (5-10 competitors)
- TAM sizing and market growth drivers
- Risk assessment (8-12 risks)

**File name**: `[Company]_Research_Document_[Date].md`

**⚠️ DELIVER ONLY THIS 1 FILE. NO completion summaries, no extra documents.**

**⚠️ DO NOT TAKE SHORTCUTS:**
- ✅ Write full 6,000-8,000 words (not summaries)
- ✅ Complete 300-400 word bios for ALL 3-4 executives
- ✅ Analyze ALL 5-10 competitors thoroughly
- ✅ Cover all 8-12 risks across 4 categories
- ❌ Do not abbreviate sections to save time
- ❌ Do not skip any required sections

**Verification before proceeding**: None required for this task.

---

## Task 2: Financial Modeling

**Purpose**: Extract historical financials and build comprehensive Excel financial model with projections and scenarios.

**Prerequisites**: ⚠️ Verify before starting
- **Required**: Access to company financial data
  - For public companies: Latest 10-K from SEC EDGAR
  - For private companies: Financial statements or available estimates
  - OR: Pre-extracted historical financials provided by user
- **Optional**: Company research (Task 1) for business context

**Input Verification**:
```
BEFORE STARTING - Select approach:

Option A: Extract financials (most common)
- [ ] Have access to 10-K or financial statements?
- [ ] Ready to extract 3-5 years of data?

Option B: User provided pre-extracted financials
- [ ] Historical financials file received?
- [ ] Contains income statement, cash flow, balance sheet (3-5 years)?

Optional:
- [ ] Company research (Task 1) complete for context?
```

**Process**:
1. Verify access to financial data
2. Load detailed instructions from references/task2-financial-modeling.md
3. **Step 1**: Extract historical financials (if needed)
4. **Step 2**: Discover company-specific reported drivers/KPIs from filings, earnings releases, presentations, and guidance
5. **Step 3+**: Build quarterly projection model with repo-standard tabs
6. Deliver Excel model

**Output**: Run-local quantitative artifacts in `<run>/`:
- **`<run>/model.xlsx`** — canonical single-company financial model with repo-standard tabs:
  1. **Summary** — recommendation, current price, target price, upside/downside, 1-year return, 3-year return/IRR, exit-multiple scenarios, key metrics, trends, and valuation bridge
  2. **Drivers & Assumptions** — single source of truth, quarterly and line-item specific. Common assumptions as numbers (tax rate, capex, D&A, SBC, diluted shares, WACC, terminal g, risk-free rate, ERP, beta, cost of debt). Diluted shares / share count must be formatted as a number, never as a percentage. Revenue streams and cost of revenue/gross margin per stream discovered from filings/releases/presentations/Koyfin. Expense line assumptions per quarter. Bear/Base/Bull scenario columns. Per-cell rationale in cell comments. **Only sheet the user edits.**
  3. **Model - Bear**, **Model - Base**, **Model - Bull** — three separate quarterly integrated operating model sheets, all from same template and read-only from `Drivers & Assumptions`. Full line-item detail: revenue by each reported stream, total revenue, QoQ/YoY for every material line, cost of revenue by stream, gross profit/gross margin by stream, expense breakdown, EBITDA/EBIT/NI/EPS/FCF and margins. P&L, balance sheet, cash flow, and FCF bridge per sheet.
  4. **DCF** — Intrinsic valuation model referencing `Model - Bear`, `Model - Base`, `Model - Bull`; computes Bear/Base/Bull price targets without duplicating the full operating model
  5. **Scenarios** - Bull/base/bear, 1-year return, 3-year return/IRR, and exit-multiple return framework
  6. **Sensitivity** - WACC/g or sector-equivalent plus sector-native sensitivities
  7. **Checks** - Formula, model-sanity, and cross-artifact checks
  Optional: **QTracker**, **MarketData**, **Ownership** when needed. No default Comps tab; peer analysis is external by default.
- **`<run>/outputs.json`** - stable key-value outputs extracted from the model (revenue, EBITDA, EPS, FCF, key multiples, scenario outputs). Every material model output used by reports/presentations must have a stable key in this file.
- **Model extracts** - clean machine-readable CSVs under `<run>/data/normalized/model_extracts/` for revenue build, P&L, cash flow, balance sheet, and key metrics.
- **Build and validation scripts** - under `<run>/data/scripts/model/` (scripts that build/populate the model) and `<run>/data/scripts/validation/` (scripts that cross-check/audit model integrity). Required validation scripts: `recalc.py`, `validate_model.py`, `validate_outputs.py`, and `validate_artifacts.py` when report/deck artifacts exist.

**Canonical path**: `<run>/model.xlsx`

**⚠️ DELIVER ONLY THESE ARTIFACTS. NO completion summaries, no extra documents.**

**⚠️ DO NOT TAKE SHORTCUTS:**
- ✅ If extracting financials: Extract ALL line items from 3 financial statements (3-5 years)
- ✅ Build ALL repo-standard projection/model tabs completely with full detail
- ✅ Discover reported company-specific drivers/KPIs before modeling and reflect them in `Drivers & Assumptions`
- ✅ Discover reported revenue streams, KPIs, cost of revenue breakdowns, and expense line details from filings, earnings releases, presentations, and Koyfin before building model assumptions
- ✅ Create detailed quarterly driver model using company-specific revenue/cost lines where reported; break out each revenue stream and cost stream
- ✅ Build three complete quarterly model sheets (`Model - Bear`, `Model - Base`, `Model - Bull`) covering P&L, balance sheet, cash flow, and FCF; all from same template, read-only from `Drivers & Assumptions`; full line-item detail with QoQ/YoY
- ✅ Complete ALL three scenarios (Bull/Base/Bear) with different parameters in `Drivers & Assumptions`
- ✅ Format Diluted Shares / Shares Outstanding as numeric shares or shares in millions, not percentages; validate EPS/DCF references use the numeric share count
- ✅ Include 1-year return, 3-year return/IRR, and exit-multiple scenario logic in Scenarios and Summary
- ✅ Run validation scripts before delivery; rating/target must be consistent with base upside/return unless an explicit override is documented
- ❌ Do not create simplified/abbreviated versions
- ❌ Do not skip Summary, Drivers & Assumptions, Model - Bear, Model - Base, Model - Bull, DCF, Scenarios, Sensitivity, or Checks in initial coverage models
- ❌ Do not include a default Comps tab in the company model; peer analysis belongs in an external comps artifact unless explicitly requested
- ❌ Do not skip historical financials extraction if needed

**Verification before proceeding to Task 3**:
- [ ] `<run>/model.xlsx` created and opens cleanly
- [ ] Model has repo-standard tabs (Summary, Drivers & Assumptions, Model - Bear, Model - Base, Model - Bull, DCF, Scenarios, Sensitivity, Checks; optional QTracker/MarketData/Ownership only when needed)
- [ ] `recalc.py` recalculated the workbook with LibreOffice headless (or native Excel calculation in live Excel), scanned recalculated values, and passed before `validate_model.py`; `validate_model.py` passed before outputs generation
- [ ] `<run>/outputs.json` generated from recalculated workbook cells with stable keys for all material model outputs
- [ ] `validate_outputs.py` passed after outputs generation
- [ ] Model extracts saved under `<run>/data/normalized/model_extracts/`
- [ ] Build/validation scripts saved under `<run>/data/scripts/model/` and `<run>/data/scripts/validation/`
- [ ] Historical data (3-5 years) incorporated
- [ ] Quarterly projections complete (at least 5 years forward or enough to support valuation)
- [ ] Scenarios complete (Bull/Base/Bear)

---

## Task 3: Valuation Analysis

**Purpose**: Perform comprehensive valuation using DCF, comparables, and precedent transactions.

**Prerequisites**: ⚠️ Verify before starting
- **Required**: Financial model from Task 2
  - Projected income statements
  - Projected cash flows
  - Revenue and EBITDA forecasts
  - DCF inputs (unlevered FCF)

**⚠️ CRITICAL: DO NOT START THIS TASK UNLESS TASK 2 IS COMPLETE**

This task requires the financial model from Task 2. Starting without it will result in incomplete work.

**IF TASK 2 IS NOT COMPLETE**: Stop immediately and inform the user that Task 2 (Financial Modeling) must be completed first. Do not attempt to proceed or create placeholder valuations.

**Input Verification**:
```
BEFORE STARTING:
- [ ] Task 2 complete? (Financial model exists)
- [ ] Model file path/location known?
- [ ] Can access projected financials from model?

Required from model:
- [ ] Projected FCF (5 years)
- [ ] Revenue projections
- [ ] EBITDA projections
- [ ] Terminal year metrics
```

**Process**:
1. Verify financial model is accessible
2. Load detailed instructions from references/task3-valuation.md
3. Execute valuation workflow
4. Deliver valuation analysis

**Output**: Valuation Analysis (4-6 pages + model updates)
- DCF analysis with sensitivity tables
- Comparable companies (5-10 peers with statistical summary)
- Precedent transactions (if applicable)
- Valuation football field
- **Price target**: $XX.XX
- **Recommendation**: BUY/HOLD/SELL
- **Upside**: XX%
- Key catalysts (3-5)

**Files**:
- **Update `<run>/model.xlsx`** - add or update these tabs:
  - DCF tab with calculations
  - Sensitivity analysis tab
  - Comparable companies tab
  - Valuation summary tab
- **Update `<run>/outputs.json`** - add valuation keys (price_target, recommendation, upside_pct, dcf_value, comps_value, football_field_range, catalysts, key_risks)
- **Valuation extracts** - save clean CSVs of DCF, sensitivity, and comps data under `<run>/data/normalized/model_extracts/`
- `[Company]_Valuation_Analysis_[Date].md` (written analysis document)

**⚠️ DELIVER ONLY: model/outputs.json updates + valuation extracts + 1 markdown file. NO completion summaries, no extra documents.**

**⚠️ DO NOT TAKE SHORTCUTS:**
- ✅ Complete full DCF analysis with sensitivity matrix (not simplified)
- ✅ Analyze ALL 5-10 comparable companies with full data
- ✅ Include statistical summary in comps table (max/75th/median/25th/min)
- ✅ Create complete sensitivity analysis tab with multiple WACC and terminal growth scenarios
- ✅ Write full 4-6 pages of valuation analysis (not abbreviated)
- ✅ Research and justify price target with specific methodology
- ❌ Do not skip comparable company analysis
- ❌ Do not create simplified DCF without sensitivity

**Verification before proceeding to Task 4**:
- [ ] `<run>/model.xlsx` updated with valuation tabs
- [ ] `<run>/outputs.json` updated with valuation keys
- [ ] Valuation extracts saved under `<run>/data/normalized/model_extracts/`
- [ ] Price target determined
- [ ] Valuation uses multiple methods (DCF + Comps minimum)
- [ ] DCF sensitivity table complete
- [ ] Comparable companies table includes statistical summary

---

## Task 4: Chart Generation

**Purpose**: Generate 25-35 professional financial charts for the report.

**Prerequisites**: ⚠️ Verify before starting
- **Required**: Company research from Task 1
  - Company history and milestones (for timeline charts)
  - Management team and org structure (for org charts)
  - Product portfolio (for product charts)
  - Customer segmentation (for customer charts)
  - Competitive landscape (for competitive charts)
  - TAM analysis (for market size charts)
- **Required**: Financial model from Task 2 (with Task 3 valuation tabs added)
  - Revenue by product/geography data (Task 2 tabs)
  - Margin trends (Task 2 tabs)
  - Scenario comparison data (Task 2 tabs)
  - DCF sensitivity table (Task 3 tab in same Excel file)
  - Comparable companies data (Task 3 tab in same Excel file)
  - Valuation ranges (Task 3 tab in same Excel file)
- **Required**: External market data
  - Historical stock price data (Yahoo Finance, Bloomberg, etc.)
  - Historical valuation multiples (for historical trend charts)

**⚠️ CRITICAL: DO NOT START THIS TASK UNLESS TASKS 1, 2, AND 3 ARE COMPLETE**

This task requires outputs from all three previous tasks. Starting without them will result in incomplete charts.

**IF ANY OF TASKS 1, 2, OR 3 ARE NOT COMPLETE**: Stop immediately and inform the user which tasks need to be completed first. The specific requirements are:
- Task 1: Company research document (for 9 charts)
- Task 2: Financial model with all 6 tabs (for 8 charts)
- Task 3: Valuation tabs added to the model (for 6 charts)
- External data access (for 2 charts)

Do not attempt to create placeholder charts or skip charts due to missing data.

**Input Verification**:
```
BEFORE STARTING:
- [ ] Task 1 complete? (Company research exists)
- [ ] Task 2 complete? (Financial model exists)
- [ ] Task 3 complete? (Valuation analysis exists)
- [ ] Can access external market data sources?

Required from Task 1:
- [ ] Company history and milestones (for charts 05, 06)
- [ ] Management team structure (for chart 07)
- [ ] Product portfolio details (for chart 08)
- [ ] Customer segmentation data (for chart 09)
- [ ] Competitive landscape analysis (for charts 16, 17, 18)
- [ ] TAM sizing and market data (for chart 15)

Required from Task 2:
- [ ] Revenue by product (historical + projected) - for chart 03 ⭐
- [ ] Revenue by geography (historical + projected) - for chart 04 ⭐
- [ ] Income statement with margins (for charts 02, 10, 11)
- [ ] Cash flow statement (for chart 12)
- [ ] Scenario comparison data (for chart 14)

Required from Task 3:
- [ ] DCF sensitivity matrix - for chart 28 ⭐
- [ ] DCF components (for chart 29)
- [ ] Comparable companies data (for charts 30, 31)
- [ ] Valuation ranges - for chart 32 ⭐

Required from External Sources:
- [ ] Historical stock price data (for chart 01)
- [ ] Historical valuation multiples (for chart 34)
```

**Process**:
1. Verify `<run>/model.xlsx`, `<run>/outputs.json`, and `<run>/data/normalized/model_extracts/` are accessible
2. Load detailed instructions from references/task4-chart-generation.md
3. Execute chart generation workflow using focused scripts under `<run>/data/scripts/charts/`
4. Save only final, used visuals to `<run>/assets/charts/`; keep exploratory/unused outputs in `<run>/data/intermediate/`
5. Deliver the chart folder and chart index; package a zip only if explicitly requested

**Output**: 25-35 Professional Chart Files (PNG/JPG, 300 DPI) stored under `<run>/assets/charts/`, with generation scripts under `<run>/data/scripts/charts/`

**4 MANDATORY Charts** (must be present) ⭐:
- chart_03: Revenue by product (stacked area)
- chart_04: Revenue by geography (stacked bar)
- chart_28: DCF sensitivity (2-way heatmap)
- chart_32: Valuation football field (horizontal bars)

**25 REQUIRED Charts** (specific list):
- Investment Summary: chart_01
- Financial Performance: charts 02, 03⭐, 04⭐, 10, 11, 12, 14
- Company 101: charts 05, 06, 07, 08, 09, 15, 16
- Competitive/Market: charts 17, 18
- Scenario Analysis: chart 13
- Valuation: charts 28⭐, 29, 30, 31, 32⭐, 33, 34

**10 OPTIONAL Charts** (for 26-35 range):
- charts 19-27, 35 (customer acquisition, unit economics, product roadmap, etc.)

**IMPORTANT**: Task 5 embeds ALL charts created (25-35) for visual density (1 chart per 200-300 words).

**File naming**: `chart_01_description.png`, `chart_02_description.png`, etc.

**Deliverable**: `<run>/assets/charts/` containing all 25-35 final chart files + `chart_index.md`; chart scripts saved under `<run>/data/scripts/charts/` (and, if explicitly requested, `[Company]_Charts_[Date].zip`).

**⚠️ DELIVER ONLY THESE CHART ARTIFACTS. NO completion summaries, no extra documents.**

**⚠️ DO NOT TAKE SHORTCUTS:**
- ✅ Create ALL 25 required charts minimum (specific list provided in task4-chart-generation.md)
- ✅ Include ALL 4 mandatory charts:
  - chart_03: Revenue by product (stacked area) ⭐
  - chart_04: Revenue by geography (stacked bar) ⭐
  - chart_28: DCF sensitivity (heatmap) ⭐
  - chart_32: Valuation football field ⭐
- ✅ Optional: Add 1-10 more charts to reach 26-35 total for greater visual density
- ✅ Generate professional-quality charts at 300 DPI (not low-res placeholders)
- ✅ Create unique, well-formatted charts for each visualization
- ✅ Create a chart index; package charts in a zip only if explicitly requested
- ❌ Do not create only 10-15 charts (minimum is 25)
- ❌ Do not skip any of the 4 mandatory charts
- ❌ Do not use low-quality/placeholder images

**Verification before proceeding to Task 5**:
- [ ] Minimum 25 chart files created (required)
- [ ] All 4 mandatory charts present:
  - [ ] chart_03: Revenue by product ⭐
  - [ ] chart_04: Revenue by geography ⭐
  - [ ] chart_28: DCF sensitivity ⭐
  - [ ] chart_32: Valuation football field ⭐
- [ ] All charts open and display correctly
- [ ] Charts saved at 300 DPI (print quality)
- [ ] Chart index created listing all files with categories
- [ ] Chart scripts saved under `<run>/data/scripts/charts/`; zip created only if explicitly requested
- [ ] File naming follows convention: chart_##_description.png

---

## Task 5: Report Assembly

**Purpose**: Write and assemble the comprehensive final initial-coverage report. The repo default is `<run>/report.md`; create DOCX only if explicitly requested.

**Prerequisites**: ⚠️ Verify before starting
- **Required**: Company research from Task 1
  - All 6-8K words of content
  - Management bios
  - Competitive analysis
  - Risk assessment
- **Required**: Financial model from Task 2
  - `<run>/model.xlsx` workbook
  - `<run>/outputs.json` stable model outputs
  - All projections and scenarios
- **Required**: Valuation analysis from Task 3
  - `<run>/model.xlsx` with valuation tabs
  - `<run>/outputs.json` with valuation keys
  - Price target and recommendation
  - DCF, comps, precedent transactions
  - All valuation data
- **Required**: Chart files from Task 4
  - Final chart files under `<run>/assets/charts/`
  - Chart index included in `<run>/assets/charts/`
  - Chart scripts under `<run>/data/scripts/charts/`

**⚠️ CRITICAL: DO NOT START THIS TASK UNLESS ALL TASKS 1-4 ARE COMPLETE**

This is the final assembly task. It cannot be completed without all previous work products.

**IF ANY OF TASKS 1, 2, 3, OR 4 ARE NOT COMPLETE**: Stop immediately and inform the user which tasks need to be completed first. The specific requirements are:
- Task 1: Company research document (6-8K words)
- Task 2: Financial model with all 6 tabs
- Task 3: Valuation analysis with price target and recommendation
- Task 4: Final charts under `<run>/assets/charts/` with 25-35 charts and chart index

Do not attempt to create placeholder content, substitute missing sections, or assemble an incomplete report. The report requires ALL inputs to be publication-ready.

**Input Verification**:
```
BEFORE STARTING - ALL TASKS MUST BE COMPLETE:

Task 1 Verification:
- [ ] Company research document exists? (6-8K words)
- [ ] Management bios complete? (300-400 words × 3-4 execs)
- [ ] Competitive analysis complete? (5-10 competitors)
- [ ] Risk assessment complete? (8-12 risks)

Task 2 Verification:
- [ ] Financial model exists and can be opened?
- [ ] Model has projections (5 years)?
- [ ] Scenarios exist (Bull/Base/Bear)?

Task 3 Verification:
- [ ] Valuation analysis complete?
- [ ] Price target determined?
- [ ] Recommendation set? (BUY/HOLD/SELL)
- [ ] DCF and comps complete?

Task 4 Verification:
- [ ] `<run>/assets/charts/` exists?
- [ ] Can access all 25-35 final chart files?
- [ ] All 4 mandatory charts present?
  - [ ] Revenue by product (stacked area)
  - [ ] Revenue by geography (stacked bar)
  - [ ] DCF sensitivity (heatmap)
  - [ ] Valuation football field
- [ ] Chart files accessible and can be opened?

IF ANY VERIFICATION FAILS: Stop and complete missing task first.
```

**Process**:
1. **CRITICAL**: Verify ALL prerequisites before starting
2. Load detailed instructions from references/task5-report-assembly.md
3. Execute report assembly workflow:
   - Read `<run>/outputs.json` and `<run>/data/normalized/model_extracts/` for model numbers
   - Read `<run>/model.xlsx` only to verify or extract tables not already exported
   - Read Task 1/Task 3 notes for qualitative context
   - Embed Task 4 charts from `<run>/assets/charts/`
   - Use Mermaid blocks for timelines, org charts, process/flywheel diagrams when useful
   - Create a self-contained report with charts interspersed every 200-300 words
4. Save and deliver `<run>/report.md` by default; create DOCX only if explicitly requested

**Key Principles**:
- Report numbers must trace to `outputs.json`, model extracts, or citations
- Use actual file operations (read .md/.xlsx/.json/.csv/.png files, write report.md)
- Good equity research reports are text-dense with lots of illustrating images (high visual density, 1+ chart per major section)

**🔥 CRITICAL: GO ALL OUT ON THIS TASK**

**THIS IS THE FINAL DELIVERABLE. DO NOT TAKE SHORTCUTS.**

- ✅ **Use full token budget** - This is the culmination of all previous work
- ✅ **Write every section completely** - Do not summarize or abbreviate
- ✅ **Hit ALL minimum requirements** - for `report.md`, 3,500-6,000+ words minimum with model-backed tables/charts; for DOCX if requested, 30+ pages / 10,000+ words
- ✅ **Be thorough on projection assumptions** - 2,000-3,000 words with product-by-product detail
- ✅ **Be comprehensive on scenarios** - 1,500-2,000 words with specific Bull/Base/Bear parameters
- ✅ **Insert ALL charts from Task 4** - Not just a few, ALL 25-35 charts throughout
- ✅ **Create ALL tables from Task 2/3** - Extract every financial table, don't skip any
- ✅ **Use Task 1 content verbatim** - Copy/paste full Company 101 sections (6-8K words)
- ✅ **Professional quality only** - This must be indistinguishable from JPMorgan/Goldman Sachs research

**NEVER:**
- ❌ "This section would include..." - WRITE THE ACTUAL SECTION
- ❌ "Charts would be inserted here..." - INSERT THE ACTUAL CHARTS
- ❌ "See financial model for details..." - EXTRACT AND INCLUDE THE DETAILS
- ❌ Skip sections due to length - Every section MUST be complete
- ❌ Abbreviate for token conservation - Use whatever tokens are needed

**This is publication-ready institutional research. Spare no effort, tokens, or detail.**

**Output**: Comprehensive Equity Research Report (`report.md` by repo default; `.docx` only when explicitly requested)

**Specifications**:
- **Length**: institutional initial-coverage depth; for `report.md`, target 3,500-6,000+ words minimum; for DOCX, 30-50 pages
- **Charts/images**: use run-local visuals from `<run>/assets/charts/` and `<run>/assets/screenshots/`
- **Tables**: 8-20 comprehensive tables depending on output format
- **Format**: professional Markdown for this repo; professional DOCX only when explicitly requested

**Structure**:
- Investment Summary / INITIATING COVERAGE header
- Investment thesis & risks
- Company 101
- Financial analysis & projections
- Valuation analysis
- Catalysts, risks, and appendices

**File name**: `report.md` in the active run folder (or `[Company]_Initiation_Report_[Date].docx` if the user explicitly requested DOCX)

**⚠️ DELIVER ONLY THE REQUESTED REPORT ARTIFACT. NO executive summaries, no "highlights" documents, no extra files.**

**Final Verification**:
- [ ] `report.md` is detailed enough for initial coverage (target 3,500-6,000+ words) or DOCX is 30-50 pages if requested
- [ ] Charts/images are referenced from `<run>/assets/`
- [ ] Tables included for financials, valuation, peers, scenarios, and thesis tracking
- [ ] Company, market, industry, business model, and competitors are covered in depth
- [ ] Numbers match financial model exactly

---

## Input Verification Protocol

### Why Input Verification Matters

Each task has strict prerequisites. Running a task without required inputs will:
- Waste time with incomplete work
- Produce low-quality outputs
- Require rework

**Always verify inputs before starting a task.**

### Verification Checklist by Task

**Task 1**: ✅ No verification needed (independent)

**Task 2**: Check historical financials available

**Task 3**: Check financial model exists and is accessible

**Task 4**: Check both model (Task 2) AND valuation (Task 3) exist

**Task 5**: Check ALL previous tasks complete (1, 2, 3, 4)

### What to Do if Verification Fails

```
IF prerequisites are missing:
1. Stop the current task
2. Identify which prerequisite task(s) need to be completed
3. Execute the missing task(s) first
4. Return to current task once prerequisites are met
```

### Example Verification Dialogue

```
User: "Use initiating-coverage, Task 5 for Tesla"

Claude: "Starting Task 5: Report Assembly for Tesla

VERIFICATION - Checking prerequisites:
- Task 1 (Company research)... ❌ NOT FOUND
- Task 2 (Financial model)... ❌ NOT FOUND
- Task 3 (Valuation)... ❌ NOT FOUND
- Task 4 (Charts)... ❌ NOT FOUND

⚠️ VERIFICATION FAILED

Task 5 requires ALL previous tasks to be complete.

To proceed:
1. Complete Task 1: Company Research
2. Complete Task 2: Financial Modeling
3. Complete Task 3: Valuation Analysis
4. Complete Task 4: Chart Generation
5. Then return to Task 5

Would you like to start with Task 1 first?"
```

---

## Task Reference Files

Detailed instructions for each task are in separate reference files to keep this skill lean:

- **references/task1-company-research.md** - Company research workflow
- **references/task2-financial-modeling.md** - Financial modeling workflow
- **references/task3-valuation.md** - Valuation methodology
  - Also see: references/valuation-methodologies.md for DCF/comps deep dive
- **references/task4-chart-generation.md** - Chart generation workflow
- **references/task5-report-assembly.md** - Report writing workflow
  - Also see: assets/report-template.md for report structure
  - Also see: assets/quality-checklist.md for quality checks

**When to load reference files**: Load ONLY the reference file associated with the specific task being performed. These files are very large - do not load multiple reference files at once. Read the appropriate task reference file at the start of the task for detailed step-by-step instructions.

---

## Quality Standards

All outputs meet institutional standards from leading investment banks (JPMorgan, Goldman Sachs, Morgan Stanley):

- **Comprehensive**: Meet all minimum requirements
- **Detailed**: Specific data and examples, not generic statements
- **Quantified**: Lead with numbers and metrics
- **Traceable**: Key numbers and visuals tie back to model outputs, source files, or concise source notes; clickable links are optional unless requested
- **Professional**: Institutional-quality formatting
- **Accurate**: All numbers verified and cross-checked

---

## Important Notes

### Task Independence

- **Task 1** can run anytime (no dependencies)
- **Task 2** can run anytime (just needs historical data)
- **Tasks 1 & 2** can run in parallel
- **Task 3** requires Task 2
- **Task 4** requires Tasks 2 & 3
- **Task 5** requires Tasks 1, 2, 3, & 4

### Session Management

**Same session**: Outputs automatically available to subsequent tasks

**Different sessions**: Reference previous task outputs explicitly
```
"Use Task 3 with the model from yesterday at [path]"
"Use Task 5 with the research document at [path]"
```

### File Organization

Recommended structure during workflow:
```
<run>/
├── data/
│   ├── raw/
│   ├── normalized/
│   │   └── model_extracts/
│   ├── scripts/
│   │   ├── model/
│   │   ├── charts/
│   │   ├── report/
│   │   └── validation/
│   └── intermediate/
├── assets/
│   ├── charts/
│   ├── diagrams/
│   └── screenshots/
├── model.xlsx
├── outputs.json
├── valuation_framework.md        # optional support note
├── report.md
└── deck.pptx                     # optional if requested
```

### No End-to-End Execution

This skill does **NOT** support running all tasks automatically in sequence. Each task must be explicitly requested and verified.

**Why**: This ensures:
- Quality control at each stage
- Ability to review outputs before proceeding
- Flexibility to pause/resume workflow
- Clear verification of prerequisites

---

## Success Criteria

A successful initiation report workflow should:
1. Complete model-first phases: model/outputs before charts, charts before report
2. Pass all input verifications
3. Meet all quality standards
4. Produce all required deliverables
5. Numbers cross-check between outputs
6. Final report is publication-ready

**Output quality**: Institutional (JPMorgan/Goldman/Morgan Stanley level)
**Use case**: First-time comprehensive coverage of a company
