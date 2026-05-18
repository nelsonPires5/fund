---
name: earnings-flash-reaction
description: Produce a fast first reaction to a newly released public company earnings release before the earnings call transcript is available. Use when a company has just reported results and the user wants a quick take, flash note, pre-call reaction, initial read, beat/miss summary, guidance read, KPI check, or preliminary thesis/model impact.
---

# Earnings Flash Reaction

## Purpose

Create a fast, pre-call reaction to an earnings release. This is not a full earnings update. Use it when the press release, shareholder letter, supplemental deck, or 8-K/6-K is available, but the call transcript is not yet available.

This skill should be used before `earnings-analysis` when speed matters.

## What This Produces

A concise flash note covering:

1. Headline read
2. Beat/miss vs consensus or prior expectations
3. Key KPI changes
4. Guidance changes
5. Initial thesis impact
6. Initial model impact
7. Questions for the earnings call
8. Whether a full `earnings-analysis` and `model-update` are needed

## Workflow

### Step 1: Confirm Available Materials

Check what is available:

- Earnings release
- Shareholder letter
- Supplemental presentation
- 8-K / 6-K / filing
- Consensus estimates
- Prior guidance
- Current price reaction, if relevant

If the call transcript is already available, recommend using `earnings-analysis` after the flash note or skip directly to `earnings-analysis` if the user wants depth.

### Step 2: Build the Beat/Miss Table

Compare actuals against consensus and/or prior model.

Use company-specific KPIs, not only revenue and EPS.

| Metric | Actual | Consensus / Prior Estimate | Beat / Miss | Comment |
|---|---:|---:|---:|---|
| Revenue | | | | |
| Gross margin / EBITDA margin | | | | |
| EPS / EBITDA / EBIT | | | | |
| Key operating KPI | | | | |
| Guidance | | | | |

If consensus is unavailable, compare against prior guidance and clearly label it.

### Step 3: Identify What Matters

Focus on the 3–5 most important items:

- Revenue quality
- Volume vs price
- Margin bridge
- Guidance raise/cut
- Segment mix
- Customer growth / churn / ARPU / GMV / TPV / AUM / NPLs / occupancy / same-store sales
- Cash flow and balance sheet
- Capex or buyback changes
- Management language in release/shareholder letter

### Step 4: Assess Thesis and Model Impact

Classify:

| Dimension | Output |
|---|---|
| Thesis impact | Positive / negative / neutral / unclear |
| Model impact | None / small / medium / large |
| Estimate direction | Up / down / unchanged / wait for call |
| Valuation impact | Higher / lower / unchanged / wait for call |
| Conviction | Higher / lower / unchanged |

### Step 5: Prepare Call Questions

Create 3–7 questions to verify what is still unclear.

Prioritize:

- Guidance assumptions
- Margin sustainability
- Segment drivers
- One-offs vs recurring items
- Demand environment
- Pricing / competition
- Capital allocation
- FX / macro / regulation

## Output Format

```markdown
## Earnings Flash Reaction — [Company / Ticker] [Quarter]

**Headline:**  
[One-line conclusion.]

**Initial read:** Positive / negative / mixed / neutral

**Why it matters:**  
[2–4 sentences.]

### Beat/Miss Snapshot

| Metric | Actual | Consensus / Prior | Beat / Miss | Takeaway |
|---|---:|---:|---:|---|
| Revenue | | | | |
| EBITDA / EBIT / EPS | | | | |
| Key KPI | | | | |
| Guidance | | | | |

### Key Takeaways

1. [Most important item]
2. [Second item]
3. [Third item]

### Thesis Impact

- **Pillar affected:** [Pillar]
- **Impact:** Strengthens / weakens / neutral / unclear
- **Reason:** [Short explanation]

### Model Impact

- **Likely estimate revision:** Up / down / unchanged / wait for call
- **Line items affected:** [Revenue, margin, capex, WACC, etc.]
- **Need `model-update`?** Yes / No / after call

### Questions for the Call

1. [Question]
2. [Question]
3. [Question]

### Next Step

Use `earnings-analysis` after the call/transcript is available. Use `model-update` if actuals or guidance change forward estimates.
```

## Guardrails

* Be fast, but do not pretend to have full context before the call.
* Clearly label conclusions as preliminary.
* Do not over-index on EPS if the business is driven by operational KPIs.
* Distinguish actual beat/miss from stock reaction.
* Cite every number and source.
