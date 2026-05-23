
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
