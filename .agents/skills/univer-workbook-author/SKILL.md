---
name: univer-workbook-author
description: Create or update static Univer spreadsheet workbooks for investment models. Use for DCFs, comps, financial models, assumptions, sensitivities, checks, or any model workbook artifact. Outputs workbook.spec.json, workbook.json, workbook.html, and outputs.json.
---

# Univer Workbook Author

Use this skill when a task needs an interactive spreadsheet/model artifact **and the user explicitly requests a Univer workbook**. By default, `model.xlsx` (via xlsx-author) is the primary quantitative artifact; Univer workbooks are optional/secondary unless the user asks for them.

## Output contract

Write artifacts inside the active company run folder:

```text
workbook.spec.json   # agent-authored source of truth for workbook structure
workbook.json        # generated Univer-style workbook snapshot
workbook.html        # standalone page showing only the workbook UI
outputs.json         # stable named model outputs for reports/decks
```

`workbook.html` must show only the workbook. No mission dashboard, report, or deck content.

## Workflow

Before building a Univer view for a model-backed run, prefer sourcing tables from `<run>/data/normalized/model_extracts/` and named values from `<run>/outputs.json` so the Univer artifact stays aligned with `model.xlsx`.

1. Create or update `workbook.spec.json`.
2. Run:

```bash
node skills/univer-workbook-author/scripts/build-workbook.js <run>/workbook.spec.json <run>/workbook.json --outputs <run>/outputs.json
node skills/univer-workbook-author/scripts/build-workbook-page.js <run>/workbook.json <run>/workbook.html
```

3. Validate generated JSON parses and artifact paths exist.
4. Reference named outputs from `outputs.json` in `report.md` and `deck.html`.

## Spec pattern

```json
{
  "id": "msft-dcf-2026-05-18",
  "name": "MSFT DCF",
  "sheets": [
    {
      "name": "Summary",
      "rows": [
        ["Metric", "Value"],
        ["Implied Share Price", {"formula": "=DCF!B20", "name": "valuation.implied_share_price"}]
      ]
    },
    {"name": "Raw Financials", "csv": "../../data/normalized/financials.csv"}
  ],
  "outputs": [
    {"key": "valuation.implied_share_price", "sheet": "Summary", "cell": "B2", "value": 425.5, "unit": "USD/share"}
  ]
}
```

## Workbook conventions

- Use sheets for model structure: `Summary`, `Revenue Model`, `Income Statement`, `Balance Sheet`, `Cash Flow`, `DCF`, `Sensitivity`, `Comps`, `Thesis Tracker`, `DCF Assumptions`, `Checks`.
- `Summary` must include key metrics, trends, valuation bridge, recommendation, current price, target price, upside/downside, and bull/base/bear scenarios.
- `Thesis Tracker` must connect qualitative thesis pillars and events/catalysts to quantitative KPIs, current values, trigger thresholds, scenario impact, and next review date.
- Short thesis bullets may live in workbook sheets; detailed discussion belongs in `report.md`.
- Use formulas for derived values. Hardcoded values should be raw data or explicit assumptions.
- Add stable `outputs` keys in `workbook.spec.json` for any number used by reports or presentations.
- Format in the spec using fields supported by the builder:
  - `freeze`: sheet freeze panes (e.g., `{ "xSplit": 1, "ySplit": 3, "startRow": 3, "startColumn": 1 }`)
  - `columnData`: sparse column widths (e.g., `{ "0": { "w": 160 }, "1": { "w": 220 } }`)
  - `rowData`: sparse row heights (e.g., `{ "0": { "h": 36 } }`)
  - `mergeData` / `merges`: merged title/header ranges in Univer snapshot shape
  - `styles`: workbook-level style map; set cell `style` or `s` to a style id
  - `numFmt`: cell-level number format metadata (e.g., `{ "value": 0.12, "numFmt": "0.0%" }`). Note: `numFmt` only applies when the cell is specified as an object; bare scalar cells cannot carry formats.
- Prefer updating `workbook.spec.json`; do not hand-edit generated `workbook.json` unless necessary.

## Limits vs model.xlsx

- Univer workbooks are browser-rendered JSON snapshots; they do not support native Excel features like Power Query, Data Tables, VBA, or external data connections.
- Formula support is limited to basic arithmetic, SUM, IF, VLOOKUP, and similar; complex array formulas or dynamic array functions may not work.
- Large datasets (10,000+ rows) may render slowly; for raw data storage, prefer CSV in `data/normalized/` and reference it via the `csv` field.
- For production-grade, auditable financial models, prefer `model.xlsx` (xlsx-author) as the source of truth. Use Univer for interactive exploration, dashboards, or lightweight model views.

## Static save behavior

There is no backend. The generated workbook page embeds the workbook snapshot. `Ctrl/Cmd+S` downloads the edited workbook JSON from the browser.
