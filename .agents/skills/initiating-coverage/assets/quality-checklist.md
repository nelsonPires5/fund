# Quality Control Checklist for Initiation Reports

Before delivering an initiation report, verify all items below are complete.

## Critical Minimums - Reports Must Meet These

**CRITICAL DO NOT DELIVER IF:**
- ❌ `report.md` fewer than 3,500 words for initial coverage → INCOMPLETE
- ❌ No charts/images referenced from `<run>/assets/` → INCOMPLETE
- ❌ Fewer than 8 comprehensive tables → INCOMPLETE
- ❌ Company / market / industry / business model / competitors sections are shallow → INCOMPLETE
- ❌ No XLS financial model → MISSING DELIVERABLE
- ❌ Charts are text descriptions, not actual PNG/JPG files → MAJOR FAILURE

## Deliverables Checklist

- [ ] `report.md` created in the active run folder
- [ ] XLS financial model file created
- [ ] Run-local `assets/charts/` or `assets/screenshots/` contains visuals used by report/deck
- [ ] Raw data, if any, is under `<run>/data/raw/` and not company-level `data/raw/`

## Report - Length & Content

**Length Verification:**
- [ ] `report.md` is 3,500-6,000+ words for initial coverage
- [ ] If DOCX explicitly requested, report is 30-50 pages
- [ ] If under minimum depth: STOP and add more company, market, industry, business model, competitor, valuation, scenario, and thesis content

**Visual Elements:**
- [ ] Charts/images referenced from `<run>/assets/` (count them: _____ visuals)
- [ ] All visuals are actual PNG/JPG/SVG files (NOT text descriptions)
- [ ] 8-20 comprehensive tables included (count them: _____ tables)
- [ ] Charts and tables interspersed throughout, not grouped at end

**Chart Requirements:**
- [ ] Revenue by product chart: Stacked Area format ✓
- [ ] Revenue by geography chart: Stacked Bar format ✓
- [ ] DCF sensitivity: 2-way Heat Map with color coding ✓
- [ ] Valuation football field: Horizontal bar chart ✓
- [ ] All other charts are actual image files ✓

**Table Requirements:**
- [ ] Full Income Statement (40-50 rows) with 5 years historical + 5 years projected
- [ ] Full Cash Flow Statement (30-40 rows)
- [ ] Full Balance Sheet (35-45 rows)
- [ ] Revenue by product table (20-30 rows)
- [ ] Revenue by geography table (15-20 rows)
- [ ] Revenue by channel table (10-15 rows)
- [ ] Comparable companies table with statistical summary (max/75th/median/25th/min)
- [ ] DCF calculation table (30-40 rows)
- [ ] WACC calculation table (8-10 rows)
- [ ] Two sensitivity tables
- [ ] 2-3 additional financial/competitive tables

## Report - Structure

**Page 1 Requirements:**
- [ ] "INITIATING COVERAGE" header present (NOT "Company Update")
- [ ] Thesis-focused title (NOT event-driven like "Strong Q4 Results")
- [ ] Rating box with rating, price, target price, 52-week range, market cap, EV
- [ ] 3-4 paragraph-length bullets with ■ character and bold headers
- [ ] Financial & valuation metrics table with 2-3 years historical, 2 years projected
- [ ] Table shows "A" suffix for actuals, "E" suffix for estimates
- [ ] Source lines on all visuals

**Content Sections:**
- [ ] Table of Contents (Page 2)
- [ ] Investment Thesis & Risks (3-5 pages)
- [ ] Company Overview (6-12 pages) including:
  - [ ] Company description
  - [ ] History and milestones
  - [ ] Management bios (300-400 words EACH for 3-4 executives)
  - [ ] Products/services detail
  - [ ] Competitive landscape
- [ ] Financial Analysis & Projections (10-15 pages)
- [ ] Valuation Analysis (8-12 pages)
- [ ] Assumptions section (2,000-3,000 words documenting ALL projection assumptions)
- [ ] Scenario Analysis (1,500-2,000 words with Bull/Base/Bear parameters)
- [ ] Appendices including Data Sources & References page

## Report - Formatting

**Figure & Table Formatting:**
- [ ] Every figure has caption above: "Figure X - [Company] [Descriptive Title]"
- [ ] Every figure has source line below: "Source: [Specific sources with dates]"
- [ ] Sequential figure numbering (Figure 1, 2, 3... no gaps)
- [ ] Every table has header row with shading
- [ ] Every table has source line at bottom
- [ ] All years use "A" for actual, "E" for estimate notation

**Professional Formatting:**
- [ ] Consistent fonts throughout (Calibri, Arial, or similar)
- [ ] Headers and footers with page numbers
- [ ] Dense layout: 60-80% page coverage, minimal white space
- [ ] Every page has both text AND visuals (charts or tables)
- [ ] Professional business report template used

## Sources and Asset Traceability

**Source Attribution:**
- [ ] Every figure has a concise source note or source context when useful
- [ ] Every table states whether it comes from model, outputs.json, Koyfin, company filings, or estimates
- [ ] Key statistics are traceable to model/outputs/source data, but formal citations and links are optional unless requested
- [ ] No distracting raw URL dumps

**Asset Traceability:**
- [ ] Report/deck visuals live under `<run>/assets/`, not `<run>/data/raw/`
- [ ] Raw source captures remain under `<run>/data/raw/`
- [ ] Manifest lists `data/raw/` and `assets/` paths

## XLS Financial Model - Structure

**File Structure:**
- [ ] 15+ tabs in Excel workbook
- [ ] Tabs include: Executive Summary, Assumptions, Historical Financials, Revenue Model, Operating Expenses, Income Statement, Balance Sheet, Cash Flow, Supporting Schedules, DCF Valuation, Comps Analysis, Precedent Transactions, Scenarios, Sensitivity Analysis, Charts

**Formatting:**
- [ ] Blue text for hardcoded inputs
- [ ] Black text for formulas
- [ ] Green text for links to other sheets
- [ ] Professional formatting with borders and shading
- [ ] Clear section headers and labels

**Model Functionality:**
- [ ] All numbers flow (change assumption → entire model updates)
- [ ] DCF links to assumptions and projections
- [ ] No circular references or errors
- [ ] All important cells/ranges are named
- [ ] Sensitivity tables work dynamically

## XLS Financial Model - Content

**Projections:**
- [ ] 3-5 years historical data
- [ ] 5 years forward projections (FY+1 through FY+5)
- [ ] Revenue broken down by product, geography, channel
- [ ] Full P&L with 40-50 line items
- [ ] Full cash flow with 30-40 line items
- [ ] Full balance sheet with 35-45 line items

**Valuation:**
- [ ] Complete DCF model with all calculations shown
- [ ] WACC calculation with all components
- [ ] Terminal value calculation
- [ ] Comparable companies analysis (5-10 companies)
- [ ] Precedent transactions analysis (5-10 deals)
- [ ] Scenario analysis (Bull/Base/Bear)
- [ ] Two sensitivity tables

## Cross-File Consistency

**CRITICAL**: Numbers must match EXACTLY between DOCX and XLS

- [ ] Revenue numbers match across both files
- [ ] EPS numbers match across both files
- [ ] Margin percentages match across both files
- [ ] Valuation numbers match across both files
- [ ] Price target matches across both files
- [ ] All projected years match across both files

**Verification Method**: Spot check 10-15 key numbers between DOCX report and XLS model.

## Content Quality

**Investment Thesis:**
- [ ] 3-5 clear thesis pillars
- [ ] Each pillar supported with specific data and quantification
- [ ] Financial impact quantified for each pillar
- [ ] Catalysts identified with timelines

**Analysis Depth:**
- [ ] Comprehensive business model analysis
- [ ] Detailed competitive assessment
- [ ] 3-5 year financial trends analyzed
- [ ] 8-12 risks identified and quantified
- [ ] Management team analyzed (300-400 words per executive)

**Assumptions:**
- [ ] 2,000-3,000 words documenting ALL assumptions
- [ ] Revenue growth assumptions by category/geography
- [ ] Margin assumptions with bridge showing drivers
- [ ] Working capital assumptions
- [ ] CapEx assumptions
- [ ] Each assumption has specific quantification

**Scenarios:**
- [ ] 1,500-2,000 words on scenario analysis
- [ ] Bull case with specific parameters and catalysts
- [ ] Base case with detailed rationale
- [ ] Bear case with specific triggers
- [ ] Probability assessments for each scenario

## Writing Quality

**Style:**
- [ ] Lead with numbers ("Revenue grew 15% to $1.2B" not "Strong revenue")
- [ ] Use "vs." not "versus"
- [ ] Be direct and concise
- [ ] Professional institutional tone throughout
- [ ] No informal language

**Accuracy:**
- [ ] No typos in ticker symbol
- [ ] No typos in company name
- [ ] All dates accurate
- [ ] All calculations verified
- [ ] Charts match text descriptions
- [ ] All numbers properly formatted ($ signs, % signs, commas)

## Pre-Delivery Final Check

Run through this quick final review:

1. **Deliverables**: `report.md`, `model.xlsx`, and requested deck files created ✓
2. **Length**: `report.md` is 3,500-6,000+ words for initial coverage ✓
3. **Charts/images**: actual visual files referenced from `<run>/assets/` ✓
4. **Tables**: 8-20 comprehensive tables included ✓
5. **Depth**: company, market, industry, business model, competitors, valuation, scenarios, and thesis tracking are substantive ✓
6. **Raw data**: source captures are under `<run>/data/raw/` and ignored by git ✓
7. **Cross-check**: Spot check 10 numbers match between report/deck and model/outputs ✓
8. **Opening section**: "INITIATING COVERAGE" framing present ✓

If ANY item fails, DO NOT DELIVER. Go back and fix.

## Actual Count Verification

**Before delivery, fill in actual counts:**

Report:
- Word count: _____ words (MUST BE 3,500-6,000+ for initial coverage)
- Visual count: _____ charts/images (must reference `<run>/assets/`)
- Table count: _____ tables (MUST BE 8-20)
- DOCX page count if requested: _____ pages

XLS Model:
- Tab count: _____ tabs (SHOULD BE 15+)
- Model years: _____ historical + _____ projected

If any count is below minimum, STOP and add content before delivery.
