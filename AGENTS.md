# Repository conventions

This repo is an investment research workspace for company models, thesis notes, reports, and presentations. Current default artifacts are legacy Office-style files so outputs can be compared against prior work from other platforms.

Use the web-native Univer/HTML skills only when explicitly requested.

## Goals

- Store company models, assumptions, source data, thesis notes, and presentation/report artifacts in folders that AI agents can update safely.
- Keep each company/run self-contained and auditable.
- Make the model workbook the quantitative source of truth; make `report.md` the detailed written analysis.

## Company folder structure

Use this layout:

```text
sectors/<sector>/companies/<ticker>/
  company.json
  runs/
    <yyyy-mm-dd>-<run-type>/
      manifest.json
      data/
        raw/              # source captures; do not commit
          koyfin/
        normalized/       # optional cleaned/model-ready data
      assets/
        charts/           # report/deck-ready charts and analysis images
        screenshots/      # selected screenshots used as visuals
      model.xlsx
      outputs.json
      report.md
      deck.pptx
```

`deck.pptx` is optional and only present when a presentation is requested. `assets/` is for curated visuals used in `report.md` and presentations; raw captures stay under run-local `data/raw/`.

## `company.json`

Small metadata file for agents, not a research report. Include only stable routing and identity fields, such as:

```json
{
  "company_name": "Microsoft Corporation",
  "ticker": "MSFT",
  "exchange": "NASDAQ",
  "sector": "software",
  "subsector": "infrastructure software",
  "currency": "USD",
  "fiscal_year_end": "06-30",
  "koyfin_id": "MSFT US",
  "sec_cik": "0000789019",
  "status": "active",
  "owned": false,
  "latest_run_id": "2026-05-18-initial-coverage",
  "notes": "Use USD millions unless stated otherwise."
}
```

## Run types

Use descriptive run ids:

- `initial-coverage`
- `model-update`
- `thesis-update`
- `thesis-track`
- `earnings-preview`
- `earnings-review`
- `sector-or-company-deck`

## Run artifacts

- `manifest.json`: run metadata, source files, artifact paths, model version notes.
- `model.xlsx`: financial model / workbook artifact.
- `outputs.json`: named valuation/model outputs used by reports and presentations.
- `report.md`: detailed research discussion, assumptions, thesis, risks, and model interpretation.
- `deck.pptx`: optional presentation generated from run artifacts.

## Workbook conventions

- Use `xlsx-author` when creating standalone workbook artifacts.
- Keep assumptions and raw inputs separate from calculations.
- Detailed thesis discussion belongs in `report.md`, not only in workbook cells.
- Every material model output should have a stable key in `outputs.json` when used by reports or presentations.

## Presentation conventions

- Use `pptx-author` when creating presentation artifacts.
- Every material number in a deck should trace to the model or `outputs.json`.
- Treat presentations as point-in-time snapshots. Do not make them the source of truth.

## Data and asset conventions

- Put downloaded/source files under the active run's `data/raw/`.
- Do not commit `runs/*/data/raw/`; it is ignored by `.gitignore`.
- Put cleaned model-ready CSVs under the active run's `data/normalized/` when they are stable enough to audit or reuse.
- Koyfin exports should live under `<run>/data/raw/koyfin/` unless normalized.
- Preserve source filenames where possible.
- Put report/deck-ready visuals under `<run>/assets/charts/` or `<run>/assets/screenshots/`.
- Do not embed raw screenshots directly from `data/raw/` in deliverables; copy/select/generate the final visual under `assets/` first.

## Agent rules

- Prefer `model.xlsx`, `report.md`, `outputs.json`, and optional `deck.pptx` for this comparison phase.
- Do not use Univer/HTML artifacts unless the user explicitly asks.
- Keep run folders immutable after publishing unless the user explicitly asks to revise that run.
- For revisions, create a new run folder and compare outputs against prior runs.
- Do not create a `subagent-outputs/` folder at the repository root.
   - All intermediate subagent deliverables must be written either directly to the specific run folder (`sectors/<sector>/companies/<ticker>/runs/<run-id>/`) on the `/tmp/`.
