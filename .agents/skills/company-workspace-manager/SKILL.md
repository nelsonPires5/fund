---
name: company-workspace-manager
description: Create and maintain sector/company/run folders for the investment research workspace. Use when setting up a company, creating a new model/research run, updating company.json, writing manifest.json, or organizing artifacts.
---

# Company Workspace Manager

Use this skill for file organization only. It does not perform valuation or write thesis content.

## Company layout

```text
sectors/<sector>/companies/<ticker>/
  company.json
  runs/
    <yyyy-mm-dd>-<run-type>/
      manifest.json
      data/
        raw/koyfin/           # raw captures; ignored by git
        scripts/              # reusable data-processing or analysis scripts
        intermediate/         # work-in-progress data; do not use in deliverables
        normalized/
          model_extracts/     # structured CSV/JSON extracts from model.xlsx
      assets/
        charts/               # final charts used in report and deck
        screenshots/          # final screenshots used in report and deck
        diagrams/             # final diagrams used in report and deck
      model.xlsx
      outputs.json
      report.md
      deck.pptx
```

`deck.pptx` is optional. Raw data is run-local so every run is self-contained and auditable.

## `company.json`

Create/update a small metadata file for agents:

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

Do not put detailed thesis in `company.json`.

## `manifest.json`

Each run gets a manifest:

```json
{
  "run_id": "2026-05-18-initial-coverage",
  "run_type": "initial-coverage",
  "company_ticker": "MSFT",
  "created_at": "2026-05-18",
  "source_files": [],
  "artifacts": {
    "raw_data": "data/raw/",
    "scripts": "data/scripts/",
    "intermediate": "data/intermediate/",
    "normalized_data": "data/normalized/",
    "model_extracts": "data/normalized/model_extracts/",
    "assets": "assets/",
    "model": "model.xlsx",
    "outputs": "outputs.json",
    "report": "report.md",
    "deck": "deck.pptx"
  },
  "notes": ""
}
```

## Rules

- Run folders are snapshots. For meaningful revisions, create a new run.
- Put all raw source captures under the active run's `data/raw/`; never create company-level `data/raw/`.
- Raw source captures under `runs/*/data/raw/` should not be committed.
- Put reusable data-processing or analysis scripts under `data/scripts/`.
- Put work-in-progress data under `data/intermediate/`; never use intermediate data directly in deliverables.
- Put model-ready cleaned data under the active run's `data/normalized/` when needed.
- Put structured CSV/JSON extracts from `model.xlsx` under `data/normalized/model_extracts/`.
- `assets/` is for final, curated assets only. Every file under `assets/` must be directly referenced by a deliverable (`report.md` or `deck.pptx`). Do not dump raw screenshots, intermediate charts, or scratch work here.
- Put final charts under `assets/charts/`, diagrams under `assets/diagrams/`, and screenshots under `assets/screenshots/`.
- Use `model.xlsx` for workbook/model artifacts by default in this comparison phase.
- Use `deck.pptx` for presentation artifacts by default when requested.
- Use `report.md` for detailed research discussion.
