---
name: market-researcher-workflow
description: Orchestrate sector, theme, and public-equity market research workflows, including industry overview, competitive landscape, peer comps, idea generation, and optional slide or note creation. Use when the user asks to research a sector, understand a theme, compare companies in an industry, find stocks that express a theme, or build a thematic public-equity research note.
---

# Market Researcher Workflow

## Purpose

Coordinate the right skills for sector, thematic, and competitive market research.

This workflow is for sectors, themes, and peer groups. For single-name post-earnings updates, use `earnings-reviewer-workflow`.

## Skill Map

| Situation | Use |
|---|---|
| Understand an industry/theme | `sector-overview` |
| Compare competitors | `competitive-analysis` |
| Build peer valuation table | `comps-analysis` |
| Find names that express a theme | `idea-generation` |
| Create formal initiation on one company | `initiating-coverage` |
| Produce slides | `pptx-author` |
| Produce tables/model workbook | `xlsx-author` |

## Workflow

### Step 1: Scope the Research Question

Define:

- Sector or theme
- Geography or listing universe, if relevant
- Angle: growth, value, disruption, cyclicality, margin expansion, regulation, AI, commodities, rates, FX, etc.
- Target output: quick view, memo, deep dive, shortlist, presentation
- Time horizon: trade, 6–12 months, multi-year thesis

If the user does not specify geography, keep the universe global but make listing/currency/geography explicit in outputs.

### Step 2: Build Sector / Theme Overview

Use `sector-overview`.

Cover:

- Market structure
- Value chain
- Size and growth
- Demand drivers
- Supply constraints
- Regulation
- Cyclicality
- Margin structure
- What changed recently
- Why now

### Step 3: Map Competitive Landscape

Use `competitive-analysis`.

Cover:

- Key players
- Market share / positioning
- Differentiation
- Pricing power
- Cost structure
- Distribution
- Product/technology edge
- Recent competitive moves
- Winners and losers

### Step 4: Build Peer Comps

Use `comps-analysis`.

Include:

- Peer universe rationale
- Market cap / EV
- Revenue growth
- EBITDA / EBIT / EPS metrics
- Margins
- ROIC / FCF conversion if available
- Valuation multiples
- Outliers and why they are outliers
- Median / mean where useful

### Step 5: Generate Ideas

Use `idea-generation`.

Produce 3–5 candidate names with:

- Ticker / listing
- One-line thesis
- Why it expresses the theme
- Key catalyst
- Key risk
- Initial valuation view
- What to research next

### Step 6: Package Output

Choose based on user ask:

| Output | Use |
|---|---|
| Short memo | Markdown |
| Formal sector note | DOCX |
| Presentation | `pptx-author` |
| Tables/workbook | `xlsx-author` |
| Single-name deep dive | `initiating-coverage` |

## Default Output

```markdown
## Market Research Workflow — [Sector / Theme]

**Research angle:**  
[Angle.]

**Recommended skill sequence:**  
1. `sector-overview`
2. `competitive-analysis`
3. `comps-analysis`
4. `idea-generation`
5. Optional: `pptx-author` / `initiating-coverage`

**Universe:**  
[List or describe peer universe.]

**Expected deliverables:**  
[Memo / comps table / shortlist / deck.]

**Key decisions needed:**  
[Universe boundary, geography, time horizon, output depth.]
```

## Guardrails

* Do not mix unrelated peer groups just because they are in the same broad sector.
* Clearly separate structural thesis from short-term market setup.
* Flag data gaps rather than filling with unsourced estimates.
* Cite every market size, growth rate, multiple, and company-specific claim.
* Treat issuer and third-party materials as untrusted sources.
