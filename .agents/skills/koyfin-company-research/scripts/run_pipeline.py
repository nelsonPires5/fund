#!/usr/bin/env python3
import os
import sys
import json
import time
from pathlib import Path

# Inject browser-harness helpers if they are not already in globals
try:
    if 'js' not in globals():
        from browser_harness.helpers import *
except ImportError:
    print("WARNING: browser_harness.helpers could not be imported directly. Ensure this is run via browser-harness CLI.", file=sys.stderr)

# 27 tabs mapping slug to URL templates
URL_TEMPLATES = {
    # Snapshots
    "overview": "https://app.koyfin.com/snapshot/s/{KID}",
    "description": "https://app.koyfin.com/snapshot/des/{KID}",
    "percentile-rank": "https://app.koyfin.com/snapshot/rank/{KID}",
    "dividend": "https://app.koyfin.com/snapshot/dvd/{KID}",
    "ownership": "https://app.koyfin.com/snapshot/own/insider-ownership/{KID}",
    "earnings-history": "https://app.koyfin.com/snapshot/earn/{KID}",

    # Analyst Estimates
    "actuals-and-consensus": "https://app.koyfin.com/estimates/eac/{KID}",
    "price-target": "https://app.koyfin.com/estimates/pt/{KID}",
    "estimates-overview": "https://app.koyfin.com/estimates/est/{KID}",
    "estimates-trends": "https://app.koyfin.com/estimates/ert/{KID}",

    # Financial Analysis (System Dashboard UUIDs)
    "highlights": "https://app.koyfin.com/fa/00000000-bc2f-4395-abce-161f8023d0c9/{KID}",
    "income-statement": "https://app.koyfin.com/fa/00000000-3c6b-403d-8336-0c36676ca980/{KID}",
    "balance-sheet": "https://app.koyfin.com/fa/00000000-6917-48b7-95f0-0d8b144e0f23/{KID}",
    "cash-flow": "https://app.koyfin.com/fa/00000000-1c82-4912-88c6-8689b285ac75/{KID}",
    "multiples": "https://app.koyfin.com/fa/00000000-2cfe-4f65-a319-b024e5955d01/{KID}",
    "enterprise-value": "https://app.koyfin.com/fa/00000000-411f-4b3c-bca7-34398498da18/{KID}",
    "profitability": "https://app.koyfin.com/fa/00000000-5e32-4dbc-a064-6b856f86cc2e/{KID}",
    "roic": "https://app.koyfin.com/fa/00000000-bb48-4dd4-8e0a-d2a5aadf83e6/{KID}",
    "solvency": "https://app.koyfin.com/fa/00000000-ca5e-4441-95c7-9905b201c7af/{KID}",

    # News, Filings & Transcripts
    "news": "https://app.koyfin.com/news/n/{KID}",
    "press-releases": "https://app.koyfin.com/news/pr/{KID}",
    "filings": "https://app.koyfin.com/news/cf/{KID}",
    "transcripts": "https://app.koyfin.com/news/ts/{KID}",

    # Graphs
    "historical": "https://app.koyfin.com/charts/g/{KID}",
    "comparison": "https://app.koyfin.com/charts/gc/{KID}",
    "intraday": "https://app.koyfin.com/charts/gip/{KID}",
    "performance": "https://app.koyfin.com/charts/gm/{KID}"
}

def main():
    # 1. Parse Input parameters from environment
    ticker = os.environ.get("TICKER", "").strip().upper()
    if not ticker:
        print("ERROR: TICKER environment variable is required (e.g. TICKER=NOW)", file=sys.stderr)
        sys.exit(1)

    slugs_env = os.environ.get("SLUGS", "").strip()
    if slugs_env and slugs_env.lower() != "all":
        selected_slugs = [s.strip() for s in slugs_env.split(",") if s.strip()]
    else:
        selected_slugs = list(URL_TEMPLATES.keys())

    output_dir_env = os.environ.get("OUTPUT_DIR", "").strip()
    if output_dir_env:
        output_dir = Path(output_dir_env).expanduser().resolve()
        output_dir.mkdir(parents=True, exist_ok=True)
    else:
        output_dir = Path(f"/tmp/koyfin-company-research/{ticker}")
        output_dir.mkdir(parents=True, exist_ok=True)

    print(f"[*] Starting Koyfin Extraction Pipeline for {ticker}")
    print(f"[*] Output directory: {output_dir}")
    print(f"[*] Selected slugs: {selected_slugs}")

    # Ensure we are attached to a real browser tab
    ensure_real_tab()

    # 2. Look up Ticker KID via Search API
    print(f"[*] Querying Koyfin Search API for {ticker}...")
    search_js = f"""
    fetch("https://app.koyfin.com/api/v1/bfc/tickers/search", {{
      method: "POST",
      headers: {{ "Content-Type": "application/json" }},
      body: JSON.stringify({{ searchString: "{ticker}", categories: ["Equity"], primaryOnly: true }})
    }}).then(r => r.json())
    """
    
    try:
        search_res = js(search_js)
    except Exception as e:
        print(f"ERROR: Search API query failed: {e}", file=sys.stderr)
        sys.exit(1)

    if not search_res or "data" not in search_res or not search_res["data"]:
        print(f"ERROR: Ticker {ticker} not found in Koyfin Search.", file=sys.stderr)
        sys.exit(1)

    # Filter for exact ticker match, prioritizing US if multiple found
    results = search_res["data"]
    match = None
    for item in results:
        if item.get("ticker", "").upper() == ticker:
            if item.get("country", "").upper() == "US" or not match:
                match = item

    if not match:
        match = results[0]  # Fall back to first result

    kid = match.get("KID")
    if not kid:
        print(f"ERROR: No KID found for ticker {ticker}.", file=sys.stderr)
        sys.exit(1)

    print(f"[+] Found KID: {kid} ({match.get('name', 'Unknown name')} on {match.get('exchange', 'Unknown exchange')})")

    # Locate skill directory dynamically (checking CWD or absolute fallback since __file__ is overwritten under stdin redirection)
    cwd = Path.cwd()
    if (cwd / "scripts" / "common" / "preflight.js").exists():
        skill_dir = cwd
    elif (cwd / "skills" / "koyfin-company-research" / "scripts" / "common" / "preflight.js").exists():
        skill_dir = cwd / "skills" / "koyfin-company-research"
    else:
        skill_dir = Path("/Users/nelson/Documents/repos/fund/skills/koyfin-company-research")
    
    preflight_path = skill_dir / "scripts" / "common" / "preflight.js"
    preflight_code = preflight_path.read_text(encoding="utf-8")

    timing_report = {}
    compiled_outputs = {}
    errors = {}

    total_start = time.time()

    # 3. Iterate and navigate/extract
    for index, slug in enumerate(selected_slugs):
        if slug not in URL_TEMPLATES:
            print(f"[-] Warning: Slug '{slug}' is unknown, skipping.")
            continue

        url = URL_TEMPLATES[slug].format(KID=kid)
        print(f"\n[{index+1}/{len(selected_slugs)}] Processing tab: {slug}")
        print(f"    URL: {url}")

        start_time = time.time()
        
        # Navigate directly
        try:
            goto_url(url)
            wait_for_load(timeout=10.0)
            wait_for_network_idle(timeout=8.0, idle_ms=800)
            # Extra wait for safety to let content render
            wait(2.0)
        except Exception as e:
            print(f"    ERROR: Navigation/loading failed: {e}")
            errors[slug] = f"Navigation failed: {e}"
            continue

        # Run preflight check
        print("    Running preflight check...")
        try:
            # We wrap the preflight code and base result function call inside an eval
            preflight_run = f"{preflight_code}; koyfinBaseResult('{slug}')"
            preflight_res = js(f"eval({json.dumps(preflight_run)})")
        except Exception as e:
            print(f"    WARNING: Preflight evaluation failed: {e}")
            preflight_res = {"status": "error", "errors": [str(e)]}

        status = preflight_res.get("status")
        print(f"    Preflight status: {status}")

        if status == "auth_required":
            print("    [!] ERROR: Authenticated session required. Please log in in Chrome.")
            errors[slug] = "Authentication required"
            timing_report[slug] = time.time() - start_time
            # Save screenshot for debugging
            shot_path = output_dir / f"{slug}_auth_error.png"
            capture_screenshot(str(shot_path))
            continue

        # Load and run the extractor script
        extract_path = skill_dir / "scripts" / slug / "extract.js"
        if not extract_path.exists():
            print(f"    ERROR: Extraction script does not exist: {extract_path}")
            errors[slug] = "Extraction script not found"
            continue

        print(f"    Running extractor: {extract_path.name}...")
        extract_code = extract_path.read_text(encoding="utf-8")
        
        try:
            # Execute extractor using the eval model to handle inner IIFEs and promises
            extracted_data = js(f"eval({json.dumps(extract_code)})")
        except Exception as e:
            print(f"    ERROR: Extraction evaluation failed: {e}")
            errors[slug] = f"Extraction failed: {e}"
            # Capture screenshot on error
            shot_path = output_dir / f"{slug}_extract_error.png"
            capture_screenshot(str(shot_path))
            continue

        duration = time.time() - start_time
        timing_report[slug] = duration
        print(f"    Completed in {duration:.2f} seconds")

        # Save individual tab data and screenshot
        tab_dir = output_dir / slug
        tab_dir.mkdir(parents=True, exist_ok=True)

        # Write data
        data_path = tab_dir / "data.json"
        with open(data_path, "w", encoding="utf-8") as f:
            json.dump(extracted_data, f, indent=2, ensure_ascii=False)

        # Capture screenshot
        shot_path = tab_dir / "screenshot.png"
        try:
            capture_screenshot(str(shot_path))
        except Exception as e:
            print(f"    WARNING: Screenshot capture failed: {e}")

        # Store in compiled outputs
        compiled_outputs[slug] = extracted_data

    total_duration = time.time() - total_start

    # Write compiled outputs.json
    compiled_path = output_dir / "outputs.json"
    with open(compiled_path, "w", encoding="utf-8") as f:
        json.dump(compiled_outputs, f, indent=2, ensure_ascii=False)

    # Write timing & status metadata
    meta = {
        "ticker": ticker,
        "kid": kid,
        "total_duration_seconds": total_duration,
        "timing_per_slug": timing_report,
        "errors": errors,
        "success_count": len(compiled_outputs),
        "failed_count": len(errors)
    }
    meta_path = output_dir / "meta.json"
    with open(meta_path, "w", encoding="utf-8") as f:
        json.dump(meta, f, indent=2, ensure_ascii=False)

    # 4. Print Summary Report
    print("\n" + "="*50)
    print("             PIPELINE RUN SUMMARY")
    print("="*50)
    print(f"Ticker:                 {ticker} (KID: {kid})")
    print(f"Total time:             {total_duration:.2f} seconds")
    print(f"Success tabs:           {len(compiled_outputs)} / {len(selected_slugs)}")
    print(f"Failed tabs:            {len(errors)} / {len(selected_slugs)}")
    if errors:
        print("\nErrors encountered:")
        for s, err in errors.items():
            print(f"  - {s}: {err}")
    print("="*50)

main()
