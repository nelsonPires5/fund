---
name: univer-workbook-author
description: Create or update static Univer spreadsheet workbooks for investment models. Use for DCFs, comps, financial models, assumptions, sensitivities, checks, or any model workbook artifact. Outputs workbook.spec.json, workbook.json, workbook.html, and outputs.json.
---

# Univer Workbook Author

Use this skill when a task needs an interactive spreadsheet/model artifact. Default to Univer workbook artifacts.

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

1. Create or update `workbook.spec.json`.
2. Run:

```bash
node skills/univer-workbook-author/scripts/build-workbook.js <run>/workbook.spec.json <run>/workbook.json --outputs <run>/outputs.json
node skills/univer-workbook-author/scripts/build-workbook-page.js <run>/workbook.json <run>/workbook.html
```

3. Validate generated JSON parses and artifact paths exist.
4. Reference named outputs from `outputs.json` in `report.md` and `deck/index.html`.

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
- Add stable output keys for any number used by reports or presentations.
- Format numbers and tables in the spec where possible: units, percentage/currency formats, thousands separators, shaded headers, frozen panes, column widths, and borders.
- Prefer updating `workbook.spec.json`; do not hand-edit generated `workbook.json` unless necessary.

## Static save behavior

There is no backend. The generated workbook page embeds the workbook snapshot. `Ctrl/Cmd+S` downloads the edited workbook JSON from the browser.
