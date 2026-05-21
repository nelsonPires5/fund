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

1. Confirm the run folder and source artifacts: `manifest.json`, `outputs.json`, `report.md`, and any charts/assets.
2. Draft slide outline first if the deck is substantial.
3. Build standalone HTML directly or create `deck.spec.json` and run:

```bash
node skills/html-presentation-author/scripts/build-deck.js <run>/deck.spec.json <run>/deck/index.html
```

4. Every model number should trace to `outputs.json` key and run id.

## Conventions

- One idea per slide.
- Title states the takeaway.
- Use standalone HTML/CSS/JS.
- Treat the deck as a point-in-time snapshot of a run, not the source of truth.
- Link/cite source run id in the deck footer or final methodology slide.
