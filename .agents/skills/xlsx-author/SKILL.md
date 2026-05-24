---
name: xlsx-author
description: Produce a .xlsx file on disk (headless) instead of driving a live Excel workbook — for managed-agent sessions with no open Office app.
---

# xlsx-author

Use this skill when running **headless** (managed-agent / CMA mode) and you need to deliver an Excel workbook as a **file artifact** rather than editing a live workbook via `mcp__office__excel_*`.

## Output contract

- For company/run workspaces, write to `<run>/model.xlsx`. For standalone non-run tasks only, write to `./out/<name>.xlsx`. Create parent directories if they don't exist.
- Return the relative path in your final message so the orchestration layer can collect it.
- **After recalculation and validation pass**, write `<run>/outputs.json` mapping stable output keys to their sheet/cell locations and export workbook-derived tables under `<run>/data/normalized/model_extracts/` for downstream consumers (charts, reports, presentations, dashboards). See the DCF model skill for the full schema.
- Save run-specific build and validation scripts under `<run>/data/scripts/model/` and `<run>/data/scripts/validation/` — modular scripts, not one monolithic script. See the DCF model skill for the directory convention.
- Every company/run workbook must include validation scripts under `<run>/data/scripts/validation/`: `recalc.py`, `validate_model.py`, `validate_outputs.py`, and, when report/deck artifacts exist, `validate_artifacts.py`.

## How to build the workbook

Write a short Python script and run it with Bash. Use `openpyxl`:

```python
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill

wb = Workbook()
ws = wb.active; ws.title = "Drivers & Assumptions"
ws["B2"] = "Revenue"; ws["C2"] = 1_250_000_000
ws["B3"] = "Growth"; ws["C3"] = 0.10
ws["C2"].font = Font(color="0066CC")               # bright blue = editable input
ws["C3"].font = Font(color="0066CC")               # bright blue = editable input
calc = wb.create_sheet("Model")
calc["C5"] = "='Drivers & Assumptions'!C2*(1+'Drivers & Assumptions'!C3)"  # dark blue = formula output
wb.save("./out/model.xlsx")
```

## Conventions

### Formula & Input Discipline
- **No hardcodes in calc cells (non-negotiable).** Every calculation cell is a formula; every input lives on the canonical `Drivers & Assumptions` sheet.
- **Named ranges** for any value referenced from a deck or memo.
- **Balance and sanity checks.** Include a Checks tab that ties (BS balances, CF ties to cash, revenue-driver totals, DCF-to-summary outputs, scenario ordering, rating-vs-return sanity, return math, WACC cross-check, terminal value sanity) and surfaces TRUE/FALSE for every check.
- **One model per file.** Do not append to an existing workbook unless explicitly asked.

### Semantic Colors

**Font colors (WHAT it is):**
- **Black** — actual/historical hardcoded data (past quarters, reported figures)
- **Bright blue (#0066CC)** — editable inputs / forward assumptions (growth rates, margins, WACC, terminal g)
- **Dark blue (#1F3864)** — formula outputs / calculated values
- **Purple (#7030A0)** — cross-sheet or cross-file references
- **Red (#FF0000)** — Excel errors (#REF!, #DIV/0!, etc.)

**Fill colors (scenario context only):**
- Scenario fill applies **only** to scenario assumption/input cells that are pulled from `Drivers & Assumptions`.
- Formula output cells get **no** scenario fill.
- Scenario fill palette: soft red/pink = Bear, light yellow/amber = Base, soft green = Bull.
- Section/column headers use dark blue (#1F4E79) fill with white bold text; sub-headers use light blue (#D9E1F2) fill with black bold text.

### Tab & Content Standards

#### Canonical repo workbook architecture

- **Default rule:** `model.xlsx` is a **single-company operating and valuation model only**. Do **not** include a `Comps`, `Peer Comps`, `Comparative`, broker consensus, or sector comparison sheet in the company workbook by default.
- **Peer/company comparison lives elsewhere:** put peer snapshots and relative valuation work in a separate sector/industry comps artifact, e.g. `sectors/<sector>/industries/<industry>/comps/<date>-peer-snapshot.csv`, `<date>-peer-analysis.md`, or a standalone `<date>-comps.xlsx`. The model may reference only a small dated peer-derived assumption or output, never the full peer table.
- **Calculation flow:** `Drivers & Assumptions` → `Model - Bear` / `Model - Base` / `Model - Bull` → `DCF` → `Scenarios` / `Sensitivity` → `Summary` / `outputs.json`.

- **Repo default tab groups for initial coverage / DCF models:****
  1. **Summary** — self-contained investment overview and first sheet opened. At the top, show current price, target price, upside/downside, 1-year expected return, 3-year expected return/IRR, bull/base/bear values, and exit-multiple scenario summary. Also include key valuation metrics, revenue/EBIT/FCF trend table, and key risk highlights.
  2. **Drivers & Assumptions** — single source of truth, **quarterly and line-item specific**. Only sheet the user edits; all model sheets read from it exclusively. Organized in blocks:
     - **Revenue streams** (discovered from filings/releases): one row per stream per quarter, with Bear/Base/Bull growth rates or driver values (volume, ASP, ARR, churn, take rate, ticket, occupancy, utilization, tariff, commodity price, etc.). Total revenue is a formula sum of streams.
     - **Cost of revenue / gross margin per stream** (where disclosed): per-stream dollar costs or margin rates per quarter, with Bear/Base/Bull values.
     - **Expense line assumptions**: S&M, R&D, G&A (and sector equivalents) per quarter, either as dollar amounts or percentages of revenue, with Bear/Base/Bull values.
     - **Common items** (as numbers, not percentages unless the item is inherently a rate): tax rate (%), capex ($), D&A ($ or %), SBC ($), diluted share count (shares in millions), WACC (%), terminal g (%), risk-free rate, ERP, beta, cost of debt, FX, CPI, inflation, commodity decks.
     Each row shows Bear/Base/Bull scenario values, source/reference, model cell(s) driven, and last-updated date. Per-cell assumption rationale goes in Excel cell comments on the individual quarterly scenario assumption cell — not in wide note columns. High-level rationale columns are optional only for overview.
  3. **Model - Bear**, **Model - Base**, **Model - Bull** — three separate scenario model sheets, all generated from the same template and **all read-only from `Drivers & Assumptions`**. User never edits model sheets directly; only `Drivers & Assumptions` is editable. Each sheet is a full quarterly integrated operating model covering the same row layout:
     - **Full line-item detail, not summaries**: revenue by each reported stream, total revenue (formula sum), QoQ/YoY growth for every material line, cost of revenue by stream, gross profit / gross margin by stream, expense breakdown (S&M, R&D, G&A or sector equivalents), EBITDA, D&A, EBIT, interest, tax, net income, EPS, and FCF. All margins and growth rates are visible inline.
     - Actual/historical quarters: hardcoded black-font numbers, identical across all three sheets.
     - Projected quarters: formulas referencing the Bear, Base, or Bull column respectively from `Drivers & Assumptions`.
     - Covers P&L, balance sheet, and cash flow / FCF bridge in one integrated quarterly layout per sheet.
  4. **DCF** — intrinsic valuation engine. References `Model - Bear`, `Model - Base`, and `Model - Bull` sheets to compute Bear/Base/Bull price targets. Calculates UFCF/FCFE, WACC/Ke, discount factors, terminal value, enterprise/equity value, and value per share — one set of valuation calculations that reads the three scenario sheets. Does **not** duplicate the full operating model.
  5. **Scenarios** — forward-return framework. Computes Bear/Base/Bull 1-year return and 3-year return/IRR to target price, plus exit multiple scenarios (exit EV/EBITDA, P/E, P/BV, cap rate, or sector-appropriate multiple) across holding periods. Sources scenario DCF values from `DCF` sheet, which in turn reads `Model - Bear`, `Model - Base`, `Model - Bull`.
  6. **Sensitivity** — fully populated sensitivity grids, all formula-driven. Required: WACC vs terminal growth or sector-equivalent. Also include at least one sector-native sensitivity (e.g. churn × FCF margin, ASP × utilization, NIM × cost of risk, MLR × ticket growth, commodity price × FX, cap rate × NOI). Center cell = base case, highlighted.
  7. **Checks** — formula, model-sanity, and cross-artifact integrity. Required checks include: no output formula errors (`NOT(ISERROR(...))`), BS balance, CF ties to cash, revenue equals sum of drivers, DCF sensitivity center equals base DCF, Summary target/base case ties to DCF/Scenarios outputs, scenario ordering (Bear ≤ Base ≤ Bull for value and returns), rating/recommendation is consistent with upside and 1Y/3Y return thresholds, return math ties (1Y total return and 3Y IRR), share count, WACC cross-check, terminal value sanity, outputs.json cell references, and no formula errors. All checks output TRUE/FALSE.

- **Optional tabs, only when needed:**
  - **QTracker** — quarterly actuals, consensus vs actuals, guidance vs actuals, and KPI tracking for earnings updates or covered-company maintenance. Can serve as an audit/reconciliation sheet alongside the model sheets.
  - **driver_map.json** — optional flexible intermediate schema mapping discovered revenue/cost streams to model rows. Not a rigid template; the model generator expands rows based on discovered streams. Do not create a separate skill for this; it lives as a run artifact.
  - **MarketData** — minimal market inputs: current price, shares, market cap, beta, risk-free rate, net debt, company-only historical price/multiple history. No peer table.
  - **Ownership** — shareholder register, float, insider/management ownership, and selected governance reference data. Narrative governance analysis belongs in `report.md`.

### Formatting
- **Number formats:** thousands separators, percentages at 0.0%, currency in millions with units in headers (e.g., "Revenue ($mm)"), per-share values at two decimals, zeros as "-", negative numbers in parentheses. **Diluted Shares / Shares Outstanding / share count must be formatted as a number in shares or millions of shares, never as a percentage.** Add a validation check for share-count number format on `Drivers & Assumptions`, DCF, EPS, and outputs references.
- **Frozen panes, column widths, shaded headers, professional borders** around major sections (thick), between sub-sections (medium), around data tables (thin).
- **Cell comments on every editable input** — added as cells are created, not deferred. Each cell comment must be specific to that cell and include both **source** ("Source: [System/Document], [Date], [Reference], [URL if applicable]") and **assumption rationale** for the specific line+quarter+scenario value (e.g., "Bear Q3 FY26: assumes 2% sequential decline due to seasonal weakness and macro headwinds from [specific factor]"). Do not use wide note columns for per-cell assumption rationale; rationales go in individual cell comments. Actual/historical hardcoded values (black font) should also carry source comments. Keep high-level source/rationale metadata columns on `Drivers & Assumptions` only if useful for overview, but per-cell rationale is in the cell comments.

### Downstream Artifacts
- **outputs.json + model extracts:** Generate only after `model.xlsx` is built, recalculated with **LibreOffice headless (or Excel native calculation when operating inside Excel)**, and formula-error scan passes. Read values from the recalculated workbook cells; do not recompute them independently in Python. Write stable key → sheet/cell mappings to `<run>/outputs.json` and workbook-derived CSV/JSON tables to `<run>/data/normalized/model_extracts/`. Include DCF value, target price, current price, upside/downside, 1-year return, 3-year return/IRR, bull/base/bear scenario values, exit-multiple scenario outputs, revenue/margin/FCF extracts, and key sector-native drivers. Regenerate after any model change.
- **No comps summary in company model outputs by default:** if a separate peer analysis exists, include only a reference path/date and final peer-derived valuation output in `outputs.json`; the peer table itself belongs in the external comps artifact.
- **Run-specific scripts:** Save build and validation scripts under `<run>/data/scripts/model/` and `<run>/data/scripts/validation/`. Modular (one concern per script), idempotent, committed with the run.
- **Required validation scripts:**
  - `recalc.py` — must open/recalculate/save the workbook with **LibreOffice headless** (or Excel native calculation when in live Excel), then scan the recalculated workbook values for Excel errors (`#REF!`, `#DIV/0!`, `#VALUE!`, `#NAME?`, `#NULL!`, `#NUM!`, `#N/A`). Do not rely only on openpyxl formula-text scanning for final validation.
  - `validate_model.py` — reads the recalculated workbook and validates business/model sanity: output cells are not errors, Summary ties to DCF/Scenarios, scenario ordering, rating/recommendation vs implied return, return math, terminal value sanity, WACC/Ke sanity, revenue-driver ties, share-count number formats (not %), and core financial statement checks.
  - `validate_outputs.py` — verifies every `outputs.json` key points to an existing workbook cell and that the JSON value exactly matches the recalculated workbook value within tolerance.
  - `validate_artifacts.py` — when `report.md`, `deck.spec.json`, `deck.html`, or `deck.pptx` exists, verifies material hardcoded prices/returns/targets in those artifacts match `outputs.json` before final delivery.

## When NOT to use

If `mcp__office__excel_*` tools are available (Cowork plugin mode), use those instead — they drive the user's live workbook with review checkpoints. This skill is the file-producing fallback for headless runs.
