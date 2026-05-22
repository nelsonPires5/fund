# Enterprise Value extraction script

Use this from an authenticated Koyfin browser session on the `Enterprise Value` tab for the target ticker.


## Preflight

Before running this extractor, run `../common/preflight.js` (or `scripts/common/preflight.js` from the skill root) to detect `auth_required` and premium/upgrade gates. Stop normal extraction if preflight says the tab is gated; save a structured status instead of treating the result as an empty dataset.

## Run with browser-harness

```bash
browser-harness <<'PY'
# Navigate to the target Koyfin tab first, then inject the script.
code = open('skills/koyfin-company-research/scripts/enterprise-value/extract.js').read()
print(js(code))
PY
```

## Run in DevTools console

Open Koyfin → Security Analysis → `Enterprise Value`, paste `extract.js`, and copy the JSON/CSV result.

## Expected output

The extractor should include at least `ticker`, `tab`, and `extracted_at`. Missing or unavailable sections should be represented as empty arrays, null values, or explicit `status` / `errors` fields rather than invented data.

Example files from MSFT exploration: sample-output.json.
