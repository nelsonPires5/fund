---
name: model-update
description: Update financial models with new data — quarterly earnings, management guidance, macro changes, or revised assumptions. Adjusts estimates, recalculates valuation, and flags material changes. Use after earnings, guidance updates, or when assumptions need refreshing. Triggers on "update model", "plug earnings", "refresh estimates", "update numbers for [company]", "new guidance", or "revise estimates".
---

# Model Update


## Workflow

### Step 1: Identify What Changed

Determine the update trigger:
- **Earnings release**: New quarterly actuals to plug in
- **Guidance change**: Company updated forward outlook
- **Estimate revision**: Analyst changing assumptions based on new data
- **Macro update**: Interest rates, FX, commodity prices changed
- **Event-driven**: M&A, restructuring, new product, management change

### Step 2: Plug New Data

#### After Earnings
Update the model with reported actuals. **Actuals go into the quarterly model sheets** (`Model - Bear`, `Model - Base`, `Model - Bull`) and optional `QTracker` for audit/reconciliation. Actual/historical quarters are hardcoded in black font and are identical across all three model sheets.

**Compare by revenue stream, cost stream, and expense line — not just top-line totals:**

| Line Item | Prior Estimate | Actual | Delta | Notes |
|-----------|---------------|--------|-------|-------|
| Revenue - Stream A | | | | |
| Revenue - Stream B | | | | |
| Total Revenue | | | | |
| Cost of Rev - Stream A | | | | |
| Gross Profit - Stream A | | | | |
| Gross Margin - Stream A | | | | |
| S&M | | | | |
| R&D | | | | |
| G&A | | | | |
| EBITDA | | | | |
| EPS | | | | |
| [Key KPI 1] | | | | |
| [Key KPI 2] | | | | |

**Segment Detail** (if applicable):
- Update each segment's revenue and margin
- Note any segment mix shifts

**Balance Sheet / Cash Flow Updates**:
- Cash and debt balances
- Share count (buybacks, dilution)
- Capex actual vs. estimate
- Working capital changes

### Step 3: Revise Forward Estimates

Based on the new data, adjust forward estimates. **Estimates change only in `Drivers & Assumptions`** — update the Bear/Base/Bull scenario columns for the affected revenue streams, cost streams, and expense lines. The model sheets (`Model - Bear`, `Model - Base`, `Model - Bull`) are read-only formulas that read from `Drivers & Assumptions`, so they update automatically when assumptions change. **Update Drivers & Assumptions before writing the note.**

| | Old FY Est | New FY Est | Change | Old Next FY | New Next FY | Change |
|---|-----------|-----------|--------|------------|------------|--------|
| Revenue | | | | | | |
| EBITDA | | | | | | |
| EPS | | | | | | |

**Key Assumption Changes:**
- What assumptions are you changing and why?
- Revenue growth rate: old → new (reason)
- Margin assumption: old → new (reason)
- Any new items (restructuring charges, one-time gains, etc.)

### Step 4: Valuation Impact

Recalculate valuation with updated estimates. **Regenerate scenario valuations** — since `Model - Bear`, `Model - Base`, and `Model - Bull` projections are live formulas reading from `Drivers & Assumptions`, DCF and Scenarios recompute automatically after assumption changes. Run `recalc.py` to recalculate the workbook with LibreOffice headless and scan recalculated values for errors.

| Valuation Method | Prior | Updated | Change |
|-----------------|-------|---------|--------|
| DCF fair value (Base) | | | |
| DCF fair value (Bear) | | | |
| DCF fair value (Bull) | | | |
| **Price Target** | | | |

### Step 5: Summary & Action

**Estimate Change Summary:**
- One paragraph: what changed, why, and what it means for the stock
- Is this a thesis-changing event or noise?

**Rating / Price Target:**
- Maintain or change rating?
- New price target (if changed) with methodology
- Upside/downside to current price

### Step 6: Validation and Output

After updating the workbook:

1. Run workbook recalculation and formula-error scan (`recalc.py`) using LibreOffice headless (or native Excel in live Excel). The script must open/recalculate/save first, then scan recalculated values for `#REF!`, `#VALUE!`, `#DIV/0!`, etc.
2. Run `validate_model.py` to catch model-sanity errors:
   - output cells contain no Excel errors
   - Summary target/base case ties to DCF/Scenarios outputs
   - scenario ordering is logical (Bear ≤ Base ≤ Bull for values/returns)
   - rating/recommendation is consistent with base upside and 1Y/3Y return thresholds, unless an explicit override note is documented
   - 1Y return and 3Y IRR math ties
   - terminal value, WACC/Ke, revenue-driver, BS, and CF checks pass
   - `Model - Bear`, `Model - Base`, `Model - Bull` sheets are consistent: actual quarters identical across all three, projected quarters reference correct Drivers & Assumptions columns
   - Diluted Shares / Shares Outstanding inputs and linked EPS/DCF cells are number-formatted, not percentage-formatted
3. If any formula errors are found, fix them, rerun LibreOffice-headless `recalc.py`, and confirm the recalculated workbook is clean before continuing.
4. Regenerate `outputs.json` from recalculated workbook cells only.
5. Run `validate_outputs.py` to verify `outputs.json` equals workbook cells.
6. If `report.md`, `deck.spec.json`, `deck.html`, or `deck.pptx` exists, run `validate_artifacts.py` and update downstream artifacts or flag that they are stale.

Outputs:

- Updated Excel model (if user provides the existing model)
- Regenerated `<run>/outputs.json` and model extracts when a run folder exists
- Passing validation scripts under `<run>/data/scripts/validation/`
- Estimate change summary (markdown or Word)
- Updated price target derivation

## Important Notes

- Always reconcile your estimates to the company's reported figures before projecting forward
- Note any non-recurring items and whether your estimates are GAAP or adjusted
- Track your estimate revision history — it shows your analytical progression
- If the quarter was noisy, separate signal from noise in your estimate changes
- Check consensus after updating — how do your revised estimates compare to the Street?
- Share count matters — dilution from stock comp, converts, or buybacks can materially affect EPS
- Do not leave a stale rating/price-target mismatch: if the update creates a Buy with base-case downside or a Sell with base-case upside, either change the rating/target or document an explicit override and flag it in validation output
- Do not deliver updated reports/decks until `outputs.json` and downstream artifact validations pass
