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
| Build full financial model | `xlsx-author` with repo-standard model tabs |
| Update existing model with new data | `model-update` |
| Audit formulas and workbook integrity | `xlsx-author` conventions + run validation scripts |
| Create Excel workbook | `xlsx-author` |
| Create presentation | `pptx-author` |
| Full company report | `initiating-coverage` |

## Strict Phase Order

All model-builder runs must follow this sequence. Do not skip phases.

| Phase | Artifacts | Pre-requisite |
|---|---|---|
| 1. Model / Valuation | `model.xlsx` | Historical data gathered |
| 2. Workbook Validation | `data/scripts/validation/recalc.py`, `validate_model.py` pass | Phase 1 complete |
| 3. Outputs + Extracts | `outputs.json`, `data/normalized/model_extracts/`, `validate_outputs.py` pass | Phase 2 complete |
| 4. Charts / Diagrams | `assets/charts/`, `assets/diagrams/` | Phase 3 complete |
| 5. Report | `report.md`, `validate_artifacts.py` pass if material numbers are hardcoded | Phases 3-4 complete |
| 6. Presentation (optional) | `deck.pptx` / `deck.html`, `validate_artifacts.py` pass | Phases 3-5 complete |

**Guardrail:** Do not produce `outputs.json` until the workbook is recalculated and `validate_model.py` passes. Do not produce `report.md` before `outputs.json`, model extracts, validations, and charts are ready. Do not produce `deck.pptx`/`deck.html` before `report.md` is complete unless explicitly requested. Every chart and diagram must trace to a value in `outputs.json` or model extracts. Before final delivery, `validate_outputs.py` and, when reports/decks exist, `validate_artifacts.py` must pass.

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

If the user asks for a valuation view, default to DCF / sector-appropriate intrinsic valuation as the core valuation. Use comps only as an external sanity check or separate relative-valuation artifact; do not embed peer comparison sheets in the single-company `model.xlsx` unless explicitly requested.

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
2. `xlsx-author` conventions and run validation scripts if Excel is created
3. Optional external `comps-analysis` only if the user requests relative valuation or a peer sanity check; keep output outside `model.xlsx`

If updating an existing model:
1. `model-update`
2. Run validation scripts under `<run>/data/scripts/validation/`
3. `thesis-tracker` if the update changes thesis or conviction

If preparing an investment deliverable:
1. `dcf-model`
2. Optional external `comps-analysis` if relative valuation is needed
3. Write `outputs.json` and `data/normalized/model_extracts/`
4. Generate charts/diagrams from model outputs
5. `initiating-coverage` for `report.md`, then `pptx-author` only if a deck is requested
```

### Step 4: Validate Model Logic

For initial coverage / full DCF workbooks in this repo, use the canonical single-company model structure: Summary, Drivers, Income Statement, Balance Sheet, Cash Flow, DCF, Scenarios, Sensitivity, Assumptions, Checks. Optional tabs: QTracker, MarketData, Ownership. Do not include Comps/Peer Comps/Comparative sheets in the company workbook by default.

The Summary tab must show key metrics/trends/scenarios and begin with the return setup: current price, target price, upside/downside, 1-year return, 3-year return/IRR, bull/base/bear values, and exit-multiple scenario summary. The Scenarios tab must include forward-return logic for 1-year and 3-year holding periods and exit multiples.

Check:

* Historical numbers tie to source
* Forecast assumptions are explicit in Assumptions, including macro/rate assumptions such as risk-free rate, ERP, beta, cost of debt, tax, FX, CPI/IPCA/inflation/GDP/SELIC/CDI where relevant
* Revenue is driver-first and sector-native; generic CAGR is clearly labeled as fallback
* Cost breakdown logic is either cleanly in Income Statement or, if business-specific, built in Drivers and linked into Income Statement
* DCF references Income Statement, Balance Sheet, Cash Flow, and Assumptions; it does not duplicate the operating model
* FCF bridge is coherent
* WACC/Ke inputs are sourced or clearly marked as assumptions
* Terminal value does not dominate excessively without explanation
* Sensitivity tables include the base case and at least one sector-native sensitivity
* Scenarios include 1-year return, 3-year return/IRR, and exit-multiple cases
* Share count and net debt are current
* All model outputs are formulas if Excel is created
* Checks/validation catch rating-vs-return inconsistency, e.g. Buy/Outperform with material base-case downside or Sell/Underperform with material upside
* `validate_model.py` passes before `outputs.json` is generated
* `validate_outputs.py` passes after `outputs.json` is generated from recalculated workbook cells
* `validate_artifacts.py` passes before final report/deck delivery when downstream artifacts exist

### Step 5: Produce Valuation Bridge

Always summarize:

| Item                            | Output |
| ------------------------------- | ------ |
| DCF / intrinsic fair value      |        |
| External comps-implied value, if used |        |
| Current price                   |        |
| Target price                    |        |
| Upside/downside                 |        |
| 1-year return                   |        |
| 3-year return / IRR             |        |
| Exit multiple scenario range    |        |
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

* Follow the strict phase order above. Do not produce `report.md` or `deck.pptx` before `outputs.json` and charts are ready.
* Do not hardcode calculated model outputs.
* Generate `outputs.json` only after workbook recalc and model validation pass; extract values from workbook cells.
* Clearly distinguish sourced data from assumptions.
* Do not present a price target without methodology.
* Do not allow recommendation/rating to contradict valuation outputs without an explicit override note (e.g. Buy with base-case downside or Sell with base-case upside).
* Do not update valuation mechanically if the thesis changed qualitatively.
* Surface model limitations and data gaps.
* Stage the model for user review before downstream use.
* Do not deliver reports/decks with material numbers that fail validation against `outputs.json`.
