---
name: model-builder-workflow
description: Orchestrate public-equity financial modeling and valuation workflows, including DCF, trading comps, three-statement model, model update, Excel model creation, sensitivity analysis, and model audit. Use when the user asks to build a valuation model, create or update an Excel model, value a company, compare valuation methods, refresh estimates, or produce a model-backed investment view.
---

# Model Builder Workflow

## Purpose

Coordinate the correct modeling skills for building or updating public-equity valuation work.

This workflow decides whether to build from scratch, update an existing model, run a DCF, run comps, audit a workbook, or produce Excel/PPT outputs.

## Skill Map

| Situation | Use |
|---|---|
| Build DCF from scratch | `dcf-model` |
| Build or analyze peer multiples | `comps-analysis` |
| Build full financial model | `3-statement-model` |
| Update existing model with new data | `model-update` |
| Audit formulas and workbook integrity | `audit-xls` |
| Create Excel workbook | `xlsx-author` |
| Create presentation | `pptx-author` |
| Full company report | `initiating-coverage` |

## Workflow

### Step 1: Determine Model Type

Classify the request:

| Request | Model type |
|---|---|
| Intrinsic value / fair value | DCF |
| Relative valuation | Comps |
| Forecast financial statements | Three-statement model |
| Earnings/guidance changed | Model update |
| Existing workbook has issues | Audit |
| Investment deck needed | PPTX |
| New coverage report needed | Initiating coverage |

If the user asks for a valuation view, default to DCF as the core valuation and comps as a sanity check, unless the business model requires a different framework.

### Step 2: Gather Inputs

Required inputs:

- Company / ticker / listing
- Reporting currency
- Historical revenue, margins, cash flow, cash/debt, share count
- Segment data if relevant
- Consensus estimates if available
- Current price and market cap
- Key assumptions
- Preferred model horizon
- Output format: markdown, Excel, presentation, or report

If inputs are missing, use available sources and clearly label assumptions.

### Step 3: Select Skills

Use this routing:

```markdown
If building intrinsic valuation:
1. `dcf-model`
2. `comps-analysis`
3. `audit-xls` if Excel is created
4. `xlsx-author` if standalone workbook is needed

If updating an existing model:
1. `model-update`
2. `audit-xls`
3. `thesis-tracker` if the update changes thesis or conviction

If preparing an investment deliverable:
1. `dcf-model`
2. `comps-analysis`
3. `initiating-coverage` or `pptx-author`
```

### Step 4: Validate Model Logic

For initial coverage / full DCF workbooks in this repo, use the standard model structure: Summary, Revenue Model, Income Statement, Balance Sheet, Cash Flow, DCF, Sensitivity, Comps, Thesis Tracker, DCF Assumptions, Checks. The Summary tab should show key metrics/trends/scenarios, and the Thesis Tracker should connect catalysts/events to qualitative thesis status and quantitative model KPIs.

Check:

* Historical numbers tie to source
* Forecast assumptions are explicit
* Revenue growth and margin assumptions are reasonable
* FCF bridge is coherent
* WACC inputs are sourced or clearly marked as assumptions
* Terminal value does not dominate excessively without explanation
* Sensitivity tables include the base case
* Share count and net debt are current
* All model outputs are formulas if Excel is created

### Step 5: Produce Valuation Bridge

Always summarize:

| Item                            | Output |
| ------------------------------- | ------ |
| DCF fair value                  |        |
| Comps-implied value             |        |
| Current price                   |        |
| Upside/downside                 |        |
| Main drivers                    |        |
| Key sensitivities               |        |
| What would change the valuation |        |

### Step 6: Decide Follow-up

Recommend:

| Finding                                 | Next action                                    |
| --------------------------------------- | ---------------------------------------------- |
| Valuation depends on thesis assumptions | Use `thesis-tracker`                           |
| Quarter changed estimates               | Use `model-update`                             |
| More context needed                     | Use `initiating-coverage` or `sector-overview` |
| Need presentation                       | Use `pptx-author`                              |
| Need workbook                           | Use `xlsx-author`                              |

## Default Output

```markdown
## Model Builder Workflow — [Company / Ticker]

**Model objective:**  
[DCF / comps / model update / full valuation.]

**Recommended skill sequence:**  
1. [Skill]
2. [Skill]
3. [Skill]

**Required inputs:**  
[List.]

**Core assumptions to verify:**  
[List.]

**Expected deliverables:**  
[Excel / memo / valuation table / presentation.]

**Review checkpoints:**  
1. Historical data
2. Forecast assumptions
3. WACC / terminal value
4. Valuation bridge
5. Sensitivities
```

## Guardrails

* Do not hardcode calculated model outputs.
* Clearly distinguish sourced data from assumptions.
* Do not present a price target without methodology.
* Do not update valuation mechanically if the thesis changed qualitatively.
* Surface model limitations and data gaps.
* Stage the model for user review before downstream use.
