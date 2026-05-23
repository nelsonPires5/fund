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

## How to build the workbook

Write a short Python script and run it with Bash. Use `openpyxl`:

```python
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill

wb = Workbook()
ws = wb.active; ws.title = "Inputs"
ws["B2"] = "Revenue"; ws["C2"] = 1_250_000_000
ws["C2"].font = Font(color="0000FF")           # blue = hardcoded input
calc = wb.create_sheet("DCF")
calc["C5"] = "=Inputs!C2*(1+Inputs!C3)"        # black = formula
wb.save("./out/model.xlsx")
```

## Conventions

### Formula & Input Discipline
- **Blue / black / green font.** Blue = hardcoded input, black = formula, green = link to another sheet/file.
- **No hardcodes in calc cells (non-negotiable).** Every calculation cell is a formula; every input lives on an Inputs or Assumptions area/tab.
- **Named ranges** for any value referenced from a deck or memo.
- **Balance checks.** Include a Checks tab that ties (BS balances, CF ties to cash, sum-of-parts, WACC cross-check, terminal value sanity) and surfaces TRUE/FALSE for every check.
- **One model per file.** Do not append to an existing workbook unless explicitly asked.

### Semantic Colors — Two-Layer System
- **Font color (WHAT it is):** blue = hardcoded input, black = formula/calculation, green = cross-sheet or cross-file reference.
- **Fill color (WHERE you are):** dark blue (#1F4E79) = section headers with white bold text; light blue (#D9E1F2) = sub-headers and column headers; light grey (#F2F2F2) = input cells; medium blue (#BDD7EE) = key outputs and base case cells; white = calculated cells.
- **Together:** blue font on light grey fill = editable assumption; black font on white = derived calculation; green font on white = cross-sheet reference; black bold on medium blue = key output like implied share price.
- **Limited scenario accents:** soft green = bull/upside, soft red/pink = bear/downside, pale yellow = key editable assumption. Use sparingly and consistently, mostly on reader-facing Summary, Scenarios, Sensitivity, Comps, and Thesis Tracker sheets.

### Tab & Content Standards
- **Repo default tab set for initial coverage / DCF models (11 tabs):**
  1. **Summary** — self-contained investment overview: recommendation, current price, target price, upside/downside, bull/base/bear implied values, key valuation metrics (EV/EBITDA, P/E, FCF yield), revenue/EBIT/FCF trend table, scenario snapshot, and key risk highlights.
  2. **Revenue Model** — product/segment/geography/channel build with unit economics where data supports it.
  3. **Income Statement** — historical and projected P&L, all projections as live formulas.
  4. **Balance Sheet** — historical and projected, driven by revenue ratios and CapEx/depreciation schedules.
  5. **Cash Flow** — operating/investing/financing CF, FCF to firm.
  6. **DCF** — market data, scenario blocks, historical & projected financials, FCF build, WACC discounting, terminal value, equity bridge.
  7. **Sensitivity** — three fully populated sensitivity grids (WACC vs g, Growth vs Margin, Beta vs Rf), all cells formula-driven. Center cell = base case, highlighted.
  8. **Comps** — 5-8 relevant peers with operating metrics (growth, margins, ROIC, leverage) and valuation multiples (EV/Revenue, EV/EBITDA, P/E, P/B, FCF yield). Include implied valuation range derived from comps.
  9. **Thesis Tracker** — thesis pillars with qualitative evidence, quantitative KPIs (linked to model cells), current vs baseline vs trigger values, event/catalyst calendar with dates, and model/scenario impact. KPI cells must be formula-linked so changes propagate.
  10. **DCF Assumptions** — every material assumption, its base value, rationale/source, sensitivity range, and the model cells it drives. Single source of truth for all inputs.
  11. **Checks** — formula and cross-artifact integrity: BS balance, CF tie, share count, WACC cross-check, terminal value sanity (50-70% EV), sum-of-parts agreement. All output TRUE/FALSE.

### Formatting
- **Number formats:** thousands separators, percentages at 0.0%, currency in millions with units in headers (e.g., "Revenue ($mm)"), per-share values at two decimals, zeros as "-", negative numbers in parentheses.
- **Frozen panes, column widths, shaded headers, professional borders** around major sections (thick), between sub-sections (medium), around data tables (thin).
- **Cell comments on every hardcoded input** — format "Source: [System/Document], [Date], [Reference], [URL if applicable]" — added as cells are created, not deferred.

### Downstream Artifacts
- **outputs.json + model extracts:** After recalc passes with zero errors, write stable key → sheet/cell mappings to `<run>/outputs.json` and workbook-derived CSV/JSON tables to `<run>/data/normalized/model_extracts/`. Include scenario range, comps summary, and thesis summary. Regenerate after any model change.
- **Run-specific scripts:** Save build and validation scripts under `<run>/data/scripts/model/` and `<run>/data/scripts/validation/`. Modular (one concern per script), idempotent, committed with the run.

## When NOT to use

If `mcp__office__excel_*` tools are available (Cowork plugin mode), use those instead — they drive the user's live workbook with review checkpoints. This skill is the file-producing fallback for headless runs.
