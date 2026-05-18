---
name: earnings-reviewer-workflow
description: Orchestrate the full public-equity earnings workflow for a covered company, from pre-earnings preparation to flash reaction, full post-call earnings analysis, model update, thesis update, and final note. Use when the user asks to run an earnings process, analyze a company reporting results, prepare before earnings, react after a release, update a model after results, or maintain coverage through an earnings cycle.
---

# Earnings Reviewer Workflow

## Purpose

Coordinate the correct skills across the full earnings cycle. This is a workflow skill, not a replacement for the underlying analysis skills.

Use this to decide which skill should run depending on where the company is in the earnings cycle.

## Skill Map

| Situation | Use |
|---|---|
| Before earnings | `earnings-preview` |
| Release is out, call not available | `earnings-flash-reaction` |
| Release and call/transcript are available | `earnings-analysis` |
| New actuals/guidance affect estimates | `model-update` |
| Thesis pillar, risk, catalyst, or conviction changed | `thesis-tracker` |
| Need Excel model audit | `audit-xls` |
| Need final note/deck | `morning-note`, `pptx-author`, `xlsx-author` |

## Workflow

### Phase 1: Pre-Earnings

Use `earnings-preview`.

Produce:

- Key metrics to watch
- Consensus setup
- Buy-side expectations if available
- Prior guidance
- Bull/base/bear scenarios
- Thesis-critical questions
- Potential model sensitivity
- What would make the quarter thesis-changing

### Phase 2: Release Reaction

If only the earnings release, shareholder letter, supplemental deck, or filing is available, use `earnings-flash-reaction`.

Produce:

- Headline read
- Beat/miss table
- Guidance change
- KPI surprises
- Preliminary thesis impact
- Preliminary model impact
- Questions for the call

Do not produce a full post-earnings report until the call/transcript is available unless the user explicitly asks.

### Phase 3: Full Post-Call Analysis

After the call/transcript is available, use `earnings-analysis`.

Produce:

- Full earnings update
- Management tone and call analysis
- Guidance interpretation
- Segment and KPI analysis
- Estimate revision logic
- Updated investment thesis
- Valuation implications

### Phase 4: Model Update

Use `model-update` if any of the following changed:

- Actuals vs prior estimates
- Forward guidance
- Segment revenue or margin assumptions
- Share count
- Cash/debt
- Capex
- Working capital
- WACC / FX / commodity assumptions
- Target multiple or valuation framework

Produce:

- Actual vs estimate table
- Old vs new estimate table
- Valuation bridge
- Price target change, if any
- Clearly sourced assumptions

### Phase 5: Thesis Update

Use `thesis-tracker` if the quarter affects the thesis.

Update:

- Thesis pillars
- Risks
- Catalysts
- Conviction
- Open questions
- What would confirm or disprove the thesis next

### Phase 6: Final Output

Choose one:

| User need | Output |
|---|---|
| Fast internal note | Markdown |
| Formal research note | DOCX |
| Investment meeting | PPTX |
| Model handoff | XLSX |
| Ongoing tracking | Thesis tracker update |

## Default Output

```markdown
## Earnings Workflow Status — [Company / Ticker]

**Stage:** Pre-earnings / release-only / post-call / model update / thesis update

**Recommended next skill:** `[skill-name]`

**Why:**  
[Short explanation.]

**Required inputs:**  
[List missing materials.]

**Expected deliverables:**  
[List outputs.]

**Suggested sequence:**  
1. [Skill]
2. [Skill]
3. [Skill]
```

## Guardrails

* Do not skip from release-only to full conclusion if the call is not available.
* Do not update a model without clearly identifying changed assumptions.
* Do not treat management commentary as fact; verify against numbers.
* Cite every number.
* Stage all outputs for user review.
