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
ws = wb.active; ws.title = "Assumptions"
ws["B2"] = "Revenue"; ws["C2"] = 1_250_000_000
ws["B3"] = "Growth"; ws["C3"] = 0.10
ws["C2"].font = Font(color="0000FF")           # blue = hardcoded input
ws["C3"].font = Font(color="0000FF")           # blue = hardcoded input
calc = wb.create_sheet("DCF")
calc["C5"] = "=Assumptions!C2*(1+Assumptions!C3)"  # black = formula
wb.save("./out/model.xlsx")
```

## Conventions

### Formula & Input Discipline
- **Blue / black / green font.** Blue = hardcoded input, black = formula, green = link to another sheet/file.
- **No hardcodes in calc cells (non-negotiable).** Every calculation cell is a formula; every input lives on the canonical `Assumptions` tab or a clearly labeled assumptions area.
- **Named ranges** for any value referenced from a deck or memo.
- **Balance and sanity checks.** Include a Checks tab that ties (BS balances, CF ties to cash, revenue-driver totals, DCF-to-summary outputs, scenario ordering, rating-vs-return sanity, return math, WACC cross-check, terminal value sanity) and surfaces TRUE/FALSE for every check.
- **One model per file.** Do not append to an existing workbook unless explicitly asked.

### Semantic Colors — Two-Layer System
- **Font color (WHAT it is):** blue = hardcoded input, black = formula/calculation, green = cross-sheet or cross-file reference.
- **Fill color (WHERE you are):** dark blue (#1F4E79) = section headers with white bold text; light blue (#D9E1F2) = sub-headers and column headers; light grey (#F2F2F2) = input cells; medium blue (#BDD7EE) = key outputs and base case cells; white = calculated cells.
- **Together:** blue font on light grey fill = editable assumption; black font on white = derived calculation; green font on white = cross-sheet reference; black bold on medium blue = key output like implied share price.
- **Limited scenario accents:** soft green = bull/upside, soft red/pink = bear/downside, pale yellow = key editable assumption. Use sparingly and consistently, mostly on reader-facing Summary, Scenarios, Sensitivity, and Assumptions sheets.

### Tab & Content Standards

#### Canonical repo workbook architecture

- **Default rule:** `model.xlsx` is a **single-company operating and valuation model only**. Do **not** include a `Comps`, `Peer Comps`, `Comparative`, broker consensus, or sector comparison sheet in the company workbook by default.
- **Peer/company comparison lives elsewhere:** put peer snapshots and relative valuation work in a separate sector/industry comps artifact, e.g. `sectors/<sector>/industries/<industry>/comps/<date>-peer-snapshot.csv`, `<date>-peer-analysis.md`, or a standalone `<date>-comps.xlsx`. The model may reference only a small dated peer-derived assumption or output, never the full peer table.
- **Calculation flow:** `Assumptions` → `Drivers` → `Income Statement` / `Balance Sheet` / `Cash Flow` → `DCF` → `Scenarios` / `Sensitivity` → `Summary` / `outputs.json`.

- **Repo default tab set for initial coverage / DCF models (10 core tabs):**
  1. **Summary** — self-contained investment overview and first sheet opened. At the top, show current price, target price, upside/downside, 1-year expected return, 3-year expected return/IRR, bull/base/bear values, and exit-multiple scenario summary. Also include key valuation metrics, revenue/EBIT/FCF trend table, and key risk highlights.
  2. **Drivers** — sector-native revenue and operating build. This replaces generic `Revenue Model` naming. Model the economic primitive: ARR/churn, volume × ASP, stores × SSS, members × ticket, beds × occupancy, RAB × tariff, fleet × utilization, commodity volume × realized price, etc. Complex cost drivers such as gross margin by segment, SG&A per unit/store, R&D intensity, customer acquisition cost, utilization, depreciation drivers, and capex drivers should live here when they are business-specific.
  3. **Income Statement** — clean historical and projected P&L. Revenue, COGS, gross profit, SG&A, R&D, other OpEx, EBITDA, D&A, EBIT, interest, tax, net income, EPS. This sheet should mostly reference `Drivers` and `Assumptions`; it should not duplicate detailed driver logic unless the logic is trivial.
  4. **Balance Sheet** — historical and projected BS, driven by working-capital ratios, PP&E/capex/depreciation schedules, debt, cash, equity, shares, and invested capital.
  5. **Cash Flow** — operating/investing/financing CF and FCF bridge. This is the source for DCF cash-flow inputs: D&A, capex, ΔNWC, CFO, FCF, and cash reconciliation.
  6. **DCF** — intrinsic valuation engine. It should reference forecast outputs from `Income Statement`, `Balance Sheet`, and `Cash Flow`; do not rebuild revenue, SG&A, capex, or working capital here. Calculate UFCF/FCFE, WACC/Ke, discount factors, terminal value, enterprise/equity value, and value per share.
  7. **Scenarios** — bull/base/bear and return framework. Must include 1-year return and 3-year return/IRR to target price, plus exit multiple scenarios (e.g. exit EV/EBITDA, P/E, P/BV, cap rate, or sector-appropriate multiple) across holding periods. This sheet is where forward-return and exit-multiple IRR logic belongs; do not confuse it with the intrinsic DCF.
  8. **Sensitivity** — fully populated sensitivity grids, all formula-driven. Required: WACC vs terminal growth or sector-equivalent. Also include at least one sector-native sensitivity (e.g. churn × FCF margin, ASP × utilization, NIM × cost of risk, MLR × ticket growth, commodity price × FX, cap rate × NOI). Center cell = base case, highlighted.
  9. **Assumptions** — single source of truth for all assumptions. Include company operating assumptions, valuation assumptions, and macro/rate assumptions such as risk-free rate, ERP, beta, cost of debt, tax rate, FX, CPI, IPCA, inflation, GDP, SELIC/CDI, commodity decks, or other sector-relevant rates/fees. Each row must show base/bear/bull or low/base/high, source, rationale, model cell(s) driven, and last-updated date.
  10. **Checks** — formula, model-sanity, and cross-artifact integrity. Required checks include: no active output formula errors (`NOT(ISERROR(...))`), BS balance, CF ties to cash, revenue equals sum of drivers, DCF sensitivity center equals base DCF, Summary target/base case ties to active DCF/Scenarios output, scenario ordering (Bear ≤ Base ≤ Bull for value and returns), rating/recommendation is consistent with upside and 1Y/3Y return thresholds, return math ties (1Y total return and 3Y IRR), share count, WACC cross-check, terminal value sanity, outputs.json cell references, and no formula errors. All checks output TRUE/FALSE.

- **Optional tabs, only when needed:**
  - **QTracker** — quarterly actuals, consensus vs actuals, guidance vs actuals, and KPI tracking for earnings updates or covered-company maintenance.
  - **MarketData** — minimal market inputs: current price, shares, market cap, beta, risk-free rate, net debt, company-only historical price/multiple history. No peer table.
  - **Ownership** — shareholder register, float, insider/management ownership, and selected governance reference data. Narrative governance analysis belongs in `report.md`.

### Formatting
- **Number formats:** thousands separators, percentages at 0.0%, currency in millions with units in headers (e.g., "Revenue ($mm)"), per-share values at two decimals, zeros as "-", negative numbers in parentheses.
- **Frozen panes, column widths, shaded headers, professional borders** around major sections (thick), between sub-sections (medium), around data tables (thin).
- **Cell comments on every hardcoded input** — format "Source: [System/Document], [Date], [Reference], [URL if applicable]" — added as cells are created, not deferred.

### Downstream Artifacts
- **outputs.json + model extracts:** Generate only after `model.xlsx` is built, recalculated, and formula-error scan passes. Read values from the recalculated workbook cells; do not recompute them independently in Python. Write stable key → sheet/cell mappings to `<run>/outputs.json` and workbook-derived CSV/JSON tables to `<run>/data/normalized/model_extracts/`. Include DCF value, target price, current price, upside/downside, 1-year return, 3-year return/IRR, bull/base/bear scenario values, exit-multiple scenario outputs, revenue/margin/FCF extracts, and key sector-native drivers. Regenerate after any model change.
- **No comps summary in company model outputs by default:** if a separate peer analysis exists, include only a reference path/date and final peer-derived valuation output in `outputs.json`; the peer table itself belongs in the external comps artifact.
- **Run-specific scripts:** Save build and validation scripts under `<run>/data/scripts/model/` and `<run>/data/scripts/validation/`. Modular (one concern per script), idempotent, committed with the run.
- **Required validation scripts:**
  - `recalc.py` — recalculates workbook and scans for Excel errors (`#REF!`, `#DIV/0!`, `#VALUE!`, `#NAME?`, `#NULL!`, `#NUM!`, `#N/A`).
  - `validate_model.py` — reads the recalculated workbook and validates business/model sanity: active output cells are not errors, Summary ties to DCF/Scenarios, scenario ordering, rating/recommendation vs implied return, return math, terminal value sanity, WACC/Ke sanity, revenue-driver ties, and core financial statement checks.
  - `validate_outputs.py` — verifies every `outputs.json` key points to an existing workbook cell and that the JSON value exactly matches the recalculated workbook value within tolerance.
  - `validate_artifacts.py` — when `report.md`, `deck.spec.json`, `deck.html`, or `deck.pptx` exists, verifies material hardcoded prices/returns/targets in those artifacts match `outputs.json` before final delivery.

## When NOT to use

If `mcp__office__excel_*` tools are available (Cowork plugin mode), use those instead — they drive the user's live workbook with review checkpoints. This skill is the file-producing fallback for headless runs.
