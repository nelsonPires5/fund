---
name: html-presentation-author
description: Create standalone HTML investment presentations and decks from company run artifacts. Use for initial coverage, thesis updates, sector/company presentations, valuation summaries, and investment committee decks.
---

# HTML Presentation Author

Use this skill when a presentation/deck is requested. Default output is `deck.html` in the company run folder root.

## Output contract

```text
<run>/deck.html
```

Optional source file:

```text
<run>/deck.spec.json
```

## Prerequisites

Before building the deck, confirm these artifacts exist and are current:

- `<run>/model.xlsx`
- `<run>/outputs.json`
- `<run>/data/normalized/model_extracts/`
- Charts under `<run>/assets/charts/`
- `report.md` (for narrative, thesis, risks)
- `manifest.json` (run metadata)
- Passing model/output validations: `<run>/data/scripts/validation/recalc.py`, `validate_model.py`, and `validate_outputs.py` must have run successfully after the latest model change.

Do not start deck creation until the model, outputs, validations, and charts are ready.

## Workflow

1. Confirm the run folder and prerequisite source artifacts above.
2. Draft slide outline first if the deck is substantial.
3. Use only final assets from `<run>/assets/charts/` or `<run>/assets/screenshots/`; do not reference raw captures from `<run>/data/raw/`.
4. Every material number must trace to a named key in `outputs.json` or a `data/normalized/model_extracts/` entry; footnote the source run id. Do not manually type target prices, returns, multiples, or scenario values unless they are copied from `outputs.json` and the output key is recorded.
5. In `deck.spec.json`, slides may use `image`, `chartImage`, or `images` fields with paths relative to `deck.html` (for example `./assets/charts/revenue_mix.png`).
6. Build standalone HTML directly or create `deck.spec.json` and run via scripts under `data/scripts/presentation/` (or the skill's bundled scripts):

```bash
node skills/html-presentation-author/scripts/build-deck.js <run>/deck.spec.json <run>/deck.html
```

7. Optional: embed Mermaid diagrams (e.g., thesis flow, catalyst timeline, competitive map) directly in the HTML via `<pre class="mermaid">` blocks and the Mermaid CDN.
8. Before delivery, run `<run>/data/scripts/validation/validate_artifacts.py` (or create it if missing) to assert material numbers in `deck.spec.json` / `deck.html` match `outputs.json` within tolerance. Fix mismatches before delivery.

## Conventions

- One idea per slide.
- Title states the takeaway.
- Use standalone HTML/CSS/JS.
- Initial coverage decks should normally have 12-16+ slides covering: title, agenda, investment summary, company overview, business model, market/industry, competitive landscape/peers, financial trends, model/scenarios, valuation, thesis tracker/catalysts, risks, and a final End/Q&A slide.
- Use charts/images liberally: revenue mix, margin trends, FCF trends, DCF sensitivity, valuation football field, peer comparison, market map, and thesis/catalyst visuals when available.
- Every material number must trace to an `outputs.json` key or `data/normalized/model_extracts/` entry. For workbook references, prefer named output keys over raw cell addresses in deck text.
- Embed Mermaid diagrams for thesis flow, catalyst timelines, or competitive maps when helpful.
- Treat the deck as a point-in-time snapshot of a run, not the source of truth.
- Include source run id in the footer or final methodology / End slide.
