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
  data/
    raw/koyfin/
    normalized/
  runs/
    <yyyy-mm-dd>-<run-type>/
      manifest.json
      model.xlsx
      outputs.json
      report.md
      deck.pptx
```

`deck.pptx` is optional.

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
- Use `model.xlsx` for workbook/model artifacts by default in this comparison phase.
- Use `deck.pptx` for presentation artifacts by default when requested.
- Use `report.md` for detailed research discussion.
