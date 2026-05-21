
# Prompts para utilizar

## Initiating Coverage
```markdown
Use the initiating-coverage workflow for [TICKER]. Produce:
1. a complete investment report;
2. a thesis tracker with pillars, risks, catalysts and KPIs;
3. a valuation framework;
4. a list of assumptions required for the DCF model.

Load all the skills needed first.
The financial information need to come from koyfin. So use the koyfin knowledge and scripts to grab the info as quickly as possible. Do not need to explore using the koyfin, koyfin already has in the skill how to get the info, just say what you need and it will fetch it for you.
Do not use multiple agents in parallel to grab info from koyfin. Is better to use a single agent per time and ask a batch of what you want per agent call.
```

## Creating the Presentation
```markdown
Create an investment committee presentation for [TICKER] based on the report, thesis tracker and valuation model.
```
