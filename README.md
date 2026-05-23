
# Prompts para utilizar

## Initiating Coverage
```markdown
Use the initiating-coverage workflow for [TICKER]. Produce:
1. a complete investment report;
2. a thesis tracker with pillars, risks, catalysts and KPIs;
3. a valuation framework;
4. a list of assumptions required for the DCF model.

Use the initiating-coverage skill, but grab the info first from koyfin (using the koyfin skill). Grab all at once, using the script and next if have info missing search the web for additional information or use manual tab-by-tab extraction.
Use one subagent only to grab the koyfin info.
Use multiple subagents to search the web.
```

## Create the DCF
```markdown
Now I want that you create the DCF model in xlsx for [TICKER].
load all skills needed to do this
```

## Creating the Presentation
```markdown
Create an investment committee html presentation for [TICKER] based on the report, thesis tracker and valuation model.
```

## Initiating Coverage Prompt
```markdown
Run a full model-first initiating coverage workflow for [TICKER].

Important: do not write the final report or presentation until the data package is complete, the DCF/model workbook is built, outputs are extracted, and charts/diagrams are generated.

Workflow order:
1. Fetch and organize all required data first.
   - Quantitative data: use Koyfin for financial statements, estimates, valuation multiples, profitability, ROIC, solvency, ownership, price target, historical performance, comparison/peers, enterprise value, and any other relevant ticker tabs.
   - Qualitative data: use Koyfin ticker news, filings, press releases, transcripts, description/highlights, and web research.
   - Web sources should cover industry structure, competitors, market size/TAM, regulation, recent news, management commentary, product strategy, macro/industry trends, and relevant press from sources like Bloomberg, Yahoo Finance/news, Reuters, company IR, SEC/SEDAR/filings, and other credible publications.
   - Save raw captures under the run's data/raw/ subfolders and cleaned/model-ready data under data/normalized/.
2. Create written research artifacts about the main company and industry subjects before modeling:
   - business overview;
   - industry/market overview;
   - competitive landscape;
   - recent news and filings summary;
   - transcript/management commentary summary;
   - key KPIs and model drivers;
   - risks and catalysts;
   - source/citation register.
3. Build the DCF/model workbook as <run>/model.xlsx.
   - The workbook is the quantitative source of truth.
   - Include Summary, Revenue Model, Income Statement, Balance Sheet, Cash Flow, DCF, Sensitivity, Comps, Thesis Tracker, DCF Assumptions, and Checks.
   - Write <run>/outputs.json with stable model output keys.
   - Export workbook-derived tables to <run>/data/normalized/model_extracts/.
   - Save run-specific Python scripts under <run>/data/scripts/ with small focused files, not one monolithic script.
4. Generate charts and diagrams only after the workbook and outputs exist.
   - Charts must read from outputs.json or data/normalized/model_extracts/.
   - Final used visuals go under assets/charts/, assets/diagrams/, or assets/screenshots/.
   - Unused/intermediate visuals stay under data/intermediate/.
   - Mermaid diagrams may be embedded in report.md or rendered for the presentation.
5. Write <run>/report.md after the workbook and charts are done.
   - Every material number must trace to outputs.json, model extracts, or citations.
   - Include DCF bridge, WACC build, sensitivity table, comps table, scenario summary, price target derivation, risks, catalysts, and thesis tracker.
6. Create the presentation last, based on report.md, outputs.json, model extracts, and final assets.
   - HTML presentation preferred unless I explicitly ask for PPTX.
   - Every material number in the deck must trace to outputs.json or model extracts.

Do not modify old runs unless I explicitly ask. For meaningful revisions, create a new run folder.
```

## Thesis Tracker / Thesis Check Prompt
```markdown
Run a thesis tracker / thesis check update for [TICKER].

Prerequisite: [TICKER] must already have an initial coverage run. Start by locating the latest initial coverage or the run I specify, and use its report.md, model.xlsx, outputs.json, thesis tracker, valuation framework, and presentation as the baseline.

At least use the skills below; use any additional relevant skills if needed:
- company-workspace-manager: locate/create the new run folder and update manifest.
- thesis-tracker: update thesis pillars, KPI thresholds, risks, catalysts, and watch items.
- koyfin-company-research: extract Koyfin changes in sell-side estimates, price targets, revisions, news, filings, transcripts, and relevant ticker tabs.
- equity-news-reaction: classify important news and estimate thesis/model impact.
- model-update: only if new data changes estimates or valuation assumptions.
- catalyst-calendar: update upcoming catalysts if events changed.
- html-presentation-author or pptx-author: only if I ask for a presentation.

Workflow:
1. Create a new thesis-track run. Do not modify the old initial coverage run.
2. Pull the baseline thesis from the prior run.
3. Use Koyfin to extract:
   - sell-side estimate revisions;
   - price target / rating changes;
   - earnings history and estimate trends;
   - recent news and press releases;
   - filings and transcripts;
   - any KPI or valuation tabs relevant to the thesis.
4. Use web/news sources to supplement Koyfin, especially for news reaction and industry/competitive developments.
5. Classify each new datapoint as: thesis confirming, thesis weakening, neutral/noise, or requires model update.
6. Update the thesis tracker with:
   - current status by pillar;
   - evidence and counter-evidence;
   - KPI changes;
   - risk/catalyst changes;
   - sell-side estimate/reaction summary;
   - action items and next review date.
7. If the thesis/model changed materially, recommend whether to run a model update next.

Output:
- <run>/thesis_tracker.md
- <run>/report.md as a concise thesis-check note, if useful
- updated manifest.json
- raw/normalized source captures under data/
```

## Model Update Prompt
```markdown
Run a model update for [TICKER].

Prerequisite: [TICKER] must already have an initial coverage run. Locate the latest initial coverage run or use the run I specify as the baseline. Do not modify the old run; create a new model-update run.

At least use the skills below; use any additional relevant skills if needed:
- company-workspace-manager: create the model-update run and update manifest.
- koyfin-company-research: pull updated financials, estimates, multiples, price targets, news, filings, transcripts, and peer comparison data.
- model-update: update the model with new actuals/guidance/assumptions.
- dcf-model: update DCF valuation logic and sensitivity if assumptions changed materially.
- xlsx-author: generate/update <run>/model.xlsx and workbook-derived outputs.
- thesis-tracker: update thesis pillars, risks, catalysts, and KPI thresholds affected by the model update.
- equity-news-reaction: classify news/filings/transcripts that explain estimate or thesis changes.
- html-presentation-author or pptx-author: only if I ask for a presentation.

Workflow:
1. Fetch new data first:
   - Koyfin financials, estimates, multiples, price target, earnings history, news, filings, transcripts, and comparison tabs;
   - company IR / filings / earnings release / transcript;
   - web/news sources for major business or industry changes.
2. Summarize what changed vs the baseline run:
   - actual results;
   - consensus estimate revisions;
   - guidance changes;
   - KPI changes;
   - valuation multiple changes;
   - news or thesis developments.
3. Update <run>/model.xlsx.
   - Keep workbook formulas live.
   - Update assumptions in DCF Assumptions.
   - Update Thesis Tracker, Scenarios, Comps, and Checks if needed.
4. Recalculate/validate the workbook.
5. Regenerate <run>/outputs.json and <run>/data/normalized/model_extracts/.
6. Generate updated charts/diagrams from outputs.json or model extracts.
7. Write a model-update report.md summarizing changes vs baseline.
8. Optional: if I ask, create a new presentation showing the updated view.

Output:
- <run>/model.xlsx
- <run>/outputs.json
- <run>/data/normalized/model_extracts/
- <run>/assets/charts/ and/or assets/diagrams/
- <run>/report.md
- optional <run>/deck/index.html or deck.pptx if requested
```

## Changes Since Last Presentation / Given Run Prompt
```markdown
Create a report and presentation for [TICKER] showing what changed since the last presentation or since this specific run: [RUN_ID].

Prerequisite: [TICKER] must already have an initial coverage run. Use the latest presentation/run as the baseline unless I specify [RUN_ID]. Create a new thesis-update or model-update run; do not modify the old run.

At least use the skills below; use any additional relevant skills if needed:
- company-workspace-manager: create the comparison/update run and update manifest.
- thesis-tracker: compare thesis pillars, risks, catalysts, and KPI status vs baseline.
- koyfin-company-research: fetch updated estimates, price target, financials, multiples, news, filings, transcripts, and peer data since baseline.
- equity-news-reaction: classify news and filings that explain the changes.
- model-update: update the model only if the change analysis requires refreshed numbers.
- html-presentation-author: create the HTML presentation by default.
- pptx-author: use only if I explicitly request PPTX.
- catalyst-calendar: update catalyst timeline if needed.

Workflow:
1. Identify baseline artifacts:
   - prior report.md;
   - prior model.xlsx;
   - prior outputs.json;
   - prior presentation;
   - prior thesis tracker / valuation framework.
2. Fetch new data and news since the baseline date:
   - Koyfin estimates, price target, financials, multiples, news, filings, transcripts;
   - company IR, SEC/SEDAR filings, press releases, earnings call transcripts;
   - web/news sources and industry developments.
3. Create a change log:
   - estimate changes;
   - valuation changes;
   - share price / multiple changes;
   - KPI changes;
   - thesis pillar status changes;
   - risk/catalyst changes;
   - management commentary changes.
4. If needed, update model.xlsx, outputs.json, and model extracts.
5. Generate charts/diagrams focused on deltas:
   - before/after valuation bridge;
   - estimate revision chart;
   - thesis status change table;
   - catalyst/risk change timeline;
   - price/multiple performance since baseline.
6. Write report.md explaining the changes since baseline.
7. Create an HTML presentation unless I explicitly ask for PPTX.

Output:
- <run>/report.md
- <run>/deck/index.html or deck.pptx if requested
- updated charts/diagrams under assets/
- source captures and change-log tables under data/
```

## Earnings Flash Analysis Prompt
```markdown
Run an earnings flash analysis for [TICKER].

Prerequisite: [TICKER] must already have an initial coverage run. Use the latest initial coverage/model as baseline. This is a fast first reaction, usually before a full call transcript is available.

At least use the skills below; use any additional relevant skills if needed:
- company-workspace-manager: create the earnings-flash run and update manifest.
- earnings-flash-reaction: produce the fast post-release read.
- koyfin-company-research: pull Koyfin actuals/consensus, earnings history, news, estimates, price targets, and available filings/transcripts.
- equity-news-reaction: classify market/news reaction and thesis impact.
- thesis-tracker: flag which thesis pillars and KPIs changed or need follow-up.
- model-update: do not run a full update unless I ask; use only to flag likely model-line changes.

Workflow:
1. Fetch the earnings release, shareholder letter, guidance, presentation, 8-K/6-K, and any available Koyfin earnings/news/estimates data.
2. Pull baseline expectations from the prior model and Koyfin consensus:
   - revenue;
   - margins;
   - EPS/EBITDA/FCF;
   - segment KPIs;
   - guidance assumptions;
   - key thesis KPIs.
3. Compare actuals vs consensus, company guidance, and our model.
4. Classify the print:
   - clear beat / mixed / miss;
   - guidance raise / maintain / cut;
   - thesis positive / neutral / negative;
   - likely stock reaction and why.
5. Identify what matters for the call and what could change after the transcript.
6. Do not do a full model update unless I ask; list model lines likely to change.

Output:
- <run>/report.md as an earnings flash note
- data/raw and data/normalized source captures
- optional quick charts under assets/charts/
```

## Earnings Preview Prompt
```markdown
Run an earnings preview for [TICKER] ahead of the upcoming results.

Prerequisite: [TICKER] must already have an initial coverage run. Use the latest initial coverage/model as baseline. Create a new earnings-preview run.

At least use the skills below; use any additional relevant skills if needed:
- company-workspace-manager: create the earnings-preview run and update manifest.
- earnings-preview: build the pre-earnings setup, scenario framework, and key metrics to watch.
- koyfin-company-research: pull current consensus, estimate revisions, price target/rating changes, news, filings, transcripts, and multiples.
- thesis-tracker: connect watch items to thesis pillars and KPI thresholds.
- catalyst-calendar: capture earnings date and upcoming related catalysts.
- equity-news-reaction: classify recent news and market setup.
- model-update: only for lightweight estimate refresh if needed.

Workflow:
1. Fetch current Koyfin consensus, estimate revisions, price target/rating changes, recent news, filings, transcripts, and valuation/multiple data.
2. Use web/news sources and company IR to gather recent developments since the last run.
3. Compare current consensus vs our model:
   - revenue and segment metrics;
   - margins;
   - EPS/EBITDA/FCF;
   - guidance ranges;
   - KPIs most likely to move the stock.
4. Build a setup framework:
   - what the market expects;
   - what our model expects;
   - bull/base/bear outcome scenarios;
   - key questions for management;
   - position/thesis implications.
5. Update lightweight model assumptions only if needed for the preview; do not overwrite old runs.
6. Generate preview charts from outputs/model extracts where applicable.

Output:
- <run>/report.md as an earnings preview
- scenario/watch-items table
- key charts under assets/charts/
- source captures under data/
```

## Full Earnings Analysis + Model Update Prompt
```markdown
Run a full post-earnings analysis and model update for [TICKER].

Prerequisite: [TICKER] must already have an initial coverage run. Use the latest initial coverage/model or the run I specify as baseline. Create a new earnings-review or model-update run; do not modify old runs.

At least use the skills below; use any additional relevant skills if needed:
- company-workspace-manager: create the earnings-review/model-update run and update manifest.
- earnings-analysis: write the full post-call earnings review.
- earnings-reviewer-workflow: orchestrate the complete earnings process when useful.
- koyfin-company-research: pull actuals/consensus, revisions, price targets, news, filings, transcripts, financials, multiples, and peer data.
- model-update: actualize the reported period and update estimates/guidance.
- dcf-model: refresh DCF valuation, scenarios, and sensitivities if valuation changed.
- xlsx-author: update <run>/model.xlsx, outputs.json, and model extracts.
- thesis-tracker: update thesis pillars, KPI thresholds, risks, and catalysts.
- equity-news-reaction: classify news/sell-side reaction and market impact.
- html-presentation-author or pptx-author: only if I ask for a presentation.

Workflow:
1. Fetch and organize all earnings data first:
   - earnings release / shareholder letter;
   - presentation;
   - 8-K/6-K and filings;
   - call transcript;
   - Koyfin actuals, estimates, revisions, price target, news, multiples, financials;
   - web/news/sell-side reactions where available.
2. Compare actuals vs:
   - consensus;
   - company guidance;
   - prior model;
   - thesis KPI thresholds.
3. Write a results analysis:
   - beat/miss table;
   - guidance analysis;
   - segment/KPI analysis;
   - margin/FCF analysis;
   - management commentary and transcript takeaways;
   - news/sell-side reaction summary;
   - thesis impact.
4. Update <run>/model.xlsx.
   - Actualize the reported quarter/year.
   - Update assumptions, guidance, scenarios, DCF, comps, thesis tracker, risks, catalysts, and checks.
5. Recalculate and validate the workbook.
6. Regenerate <run>/outputs.json and <run>/data/normalized/model_extracts/.
7. Generate updated charts/diagrams from workbook outputs.
8. Write <run>/report.md as a full earnings review and model update note.
9. Optional: if I ask, create a presentation showing the results, model changes, valuation impact, and thesis implications.

Output:
- <run>/model.xlsx
- <run>/outputs.json
- <run>/data/normalized/model_extracts/
- <run>/assets/charts/ and/or assets/diagrams/
- <run>/report.md
- optional presentation if requested
```
