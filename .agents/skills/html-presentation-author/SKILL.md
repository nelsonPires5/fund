---
name: html-presentation-author
description: Create standalone HTML investment presentations and decks from company run artifacts. Use for initial coverage, thesis updates, sector/company presentations, valuation summaries, and investment committee decks.
---

# HTML Presentation Author

Use this skill when a presentation/deck is requested. Default output is `deck/index.html` inside a company run folder.

## Output contract

```text
<run>/deck/index.html
```

Optional source file:

```text
<run>/deck.spec.json
```

## Workflow

1. Confirm the run folder and source artifacts: `manifest.json`, `outputs.json`, `report.md`, `model.xlsx` / `workbook.html`, and any charts/assets under `<run>/assets/`.
2. Draft slide outline first if the deck is substantial.
3. Use visuals from `<run>/assets/charts/` or `<run>/assets/screenshots/`; do not reference raw screenshots directly from `<run>/data/raw/`.
4. In `deck.spec.json`, slides may use `image`, `chartImage`, or `images` fields with paths relative to `deck/index.html` (for example `../assets/charts/revenue_mix.png`).
5. Build standalone HTML directly or create `deck.spec.json` and run:

```bash
node skills/html-presentation-author/scripts/build-deck.js <run>/deck.spec.json <run>/deck/index.html
```

4. Every model number should trace to `outputs.json` key and run id.

## Conventions

- One idea per slide.
- Title states the takeaway.
- Use standalone HTML/CSS/JS.
- Initial coverage decks should normally have 12-16+ slides covering: title, agenda, investment summary, company overview, business model, market/industry, competitive landscape/peers, financial trends, model/scenarios, valuation, thesis tracker/catalysts, risks, and a final End/Q&A slide.
- Use charts/images liberally: revenue mix, margin trends, FCF trends, DCF sensitivity, valuation football field, peer comparison, market map, and thesis/catalyst visuals when available.
- Every material number should trace to `outputs.json`, `model.xlsx`, or `workbook.html`.
- Treat the deck as a point-in-time snapshot of a run, not the source of truth.
- Include source run id in the footer or final methodology / End slide.
