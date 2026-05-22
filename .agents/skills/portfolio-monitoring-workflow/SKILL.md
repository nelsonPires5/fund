---
name: portfolio-monitoring-workflow
description: Orchestrate recurring monitoring for a public-equity portfolio or watchlist, including daily news reaction, morning notes, catalyst tracking, thesis checks, earnings preparation, earnings reaction, model updates, and periodic portfolio review. Use when the user asks for daily portfolio narrative, pre-market update, midday update, closing review, weekly thesis review, watchlist monitoring, or whether portfolio theses are playing out.
---

# Portfolio Monitoring Workflow

## Purpose

Coordinate daily and periodic monitoring for a public-equity portfolio or watchlist.

This workflow does not replace `equity-news-reaction`; it organizes when to use it and what to do after material events are found.

## Skill Map

| Situation | Use |
|---|---|
| Daily market/news scan | `morning-note` + `equity-news-reaction` |
| Single news/event triage | `equity-news-reaction` |
| Upcoming earnings | `earnings-preview` |
| Earnings release before call | `earnings-flash-reaction` |
| Full post-earnings review | `earnings-analysis` |
| Changed estimates or valuation | `model-update` |
| Thesis check | `thesis-tracker` |
| Upcoming catalysts | `catalyst-calendar` |
| New idea from monitoring | `idea-generation` |
| Full new coverage | `initiating-coverage` |

## Recurring Workflow

### Daily — Pre-Market / Market Open

Use `morning-note` and `equity-news-reaction`.

Cover:

- Overnight company news
- Earnings releases
- Pre-market movers
- Macro events
- FX, rates, commodities if relevant
- Sector moves
- Watchlist/portfolio items requiring action

Output should be concise and action-oriented.

### Daily — Intraday / Midday

Use `equity-news-reaction`.

Cover:

- Material new headlines since open
- Unusual stock moves
- Earnings/call updates
- Analyst day / conference comments
- Macro surprises
- Whether anything requires `thesis-tracker` or `model-update`

### Daily — Close

Use `equity-news-reaction`.

Cover:

- Biggest portfolio/watchlist movers
- What explained the move
- Whether it was market/factor/sector/company-specific
- New open questions
- What matters tomorrow

### Weekly

Use `thesis-tracker`.

Review:

- Which thesis pillars progressed
- Which risks increased
- Which catalysts are approaching
- Which names require model updates
- Which names require deeper research
- Conviction changes

### Monthly / Quarterly

Use:

- `catalyst-calendar`
- `thesis-tracker`
- `model-update`
- `dcf-model` / `comps-analysis` if valuation needs refresh

Review:

- Portfolio thesis health
- Estimate revision trends
- Valuation changes
- Earnings calendar
- Macro/factor exposure
- Watchlist upgrades/downgrades

## Event Routing

Use this routing table:

| Event | First skill | Then use |
|---|---|---|
| Normal news | `equity-news-reaction` | `thesis-tracker` if material |
| Price move without obvious news | `equity-news-reaction` | `sector-overview` if factor/theme-driven |
| Earnings upcoming | `earnings-preview` | `earnings-flash-reaction` after release |
| Earnings release out, no call | `earnings-flash-reaction` | `earnings-analysis` after call |
| Earnings call/transcript available | `earnings-analysis` | `model-update`, `thesis-tracker` |
| Guidance change | `equity-news-reaction` | `model-update` |
| M&A / regulation / management change | `equity-news-reaction` | `thesis-tracker`, possibly `model-update` |
| New investment idea | `idea-generation` | `initiating-coverage` |

## Default Output

```markdown
## Portfolio Monitoring — [Date / Session]

**Session:** Pre-market / midday / close / weekly review

**Top conclusion:**  
[One-line portfolio narrative.]

### Material Developments

| Company | Event | Materiality | Thesis impact | Model impact | Action |
|---|---|---|---|---|---|
| | | | | | |

### What Changed

[Short explanation of what changed since last review.]

### Actions

1. [Use skill / update / monitor / ignore]
2. [Use skill / update / monitor / ignore]

### Next Catalysts

| Date | Company | Event | Why it matters |
|---|---|---|---|
| | | | |
```

## Guardrails

* Do not force an action every day; "no material change" is a valid conclusion.
* Separate market beta, sector move, FX/rates, and company-specific news.
* Prioritize portfolio/watchlist relevance over general market commentary.
* Do not duplicate `thesis-tracker`; use it only when a thesis needs updating.
* Cite news, market moves, earnings data, and macro data.
