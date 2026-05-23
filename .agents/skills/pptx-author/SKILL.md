---
name: pptx-author
description: Produce a .pptx file on disk (headless) instead of driving a live PowerPoint document — for managed-agent sessions with no open Office app.
---

# pptx-author

Use this skill when running **headless** (managed-agent / CMA mode) and you need to deliver a PowerPoint deck as a **file artifact** rather than editing a live document via `mcp__office__powerpoint_*`.

## Output contract

- For company/run workspaces, write to `<run>/deck.pptx`.
- For standalone non-run tasks only, write to `./out/<name>.pptx` and create `./out/` if it does not exist.
- Return the relative path in your final message so the orchestration layer can collect it.

## Prerequisites

Before building the deck, confirm these artifacts exist and are current:

- `<run>/model.xlsx`
- `<run>/outputs.json`
- `<run>/data/normalized/model_extracts/`
- Charts under `<run>/assets/charts/`
- `report.md`
- Passing model/output validations: `<run>/data/scripts/validation/recalc.py`, `validate_model.py`, and `validate_outputs.py` must have run successfully after the latest model change.

Do not start deck creation until the model, outputs, validations, and charts are ready.

## How to build the deck

Write a short Python script and run it with Bash. Use `python-pptx`:

```python
from pptx import Presentation
from pptx.util import Inches, Pt

prs = Presentation("./templates/firm-template.pptx")  # if a template is provided
# or: prs = Presentation()

slide = prs.slides.add_slide(prs.slide_layouts[5])    # title-only
slide.shapes.title.text = "Valuation Summary"
# ... add tables / charts / text boxes ...

prs.save("<run>/deck.pptx")  # or ./out/pitch-<target>.pptx for standalone non-run tasks
```

## Conventions (mirror the live-Office `pitch-deck` skill)

- **One idea per slide.** Title states the takeaway; body supports it.
- **Every number traces to the model.** Every material figure must trace to a named key in `outputs.json` or a `data/normalized/model_extracts/` entry, not just a raw cell address. Footnote the output key and run id. Do not manually type target prices, returns, multiples, or scenario values unless they are copied from `outputs.json` and the output key is recorded.
- **Use run assets.** Source charts/images only from `<run>/assets/charts/` or `<run>/assets/screenshots/`; do not embed raw captures directly from `<run>/data/raw/`.
- **Use the firm template** when one is mounted at `./templates/`; otherwise default layouts.
- **Scripts.** Prefer run-specific scripts under `<run>/data/scripts/presentation/` for deck generation and asset prep. Before delivery, run `<run>/data/scripts/validation/validate_artifacts.py` (or create it if missing) to assert material numbers in `deck.pptx` inputs/spec/source tables match `outputs.json` within tolerance.
- **Initial coverage structure**: title, agenda, investment summary, company overview, business model, market/industry, competitive landscape/peers, financial trends, model/scenarios, valuation, thesis tracker/catalysts, risks, and final End/Q&A slide.
- **Visual density**: include charts/images where they improve analysis; avoid all-text decks.
- **No external sends.** This skill writes a file; it never emails or uploads.

## When NOT to use

If `mcp__office__powerpoint_*` tools are available (Cowork plugin mode), use those instead — they drive the user's live document with review checkpoints. This skill is the file-producing fallback for headless runs.
