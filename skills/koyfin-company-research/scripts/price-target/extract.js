// Koyfin cross-ticker helpers (copied from scripts/common/preflight.js)
function __koyfinTextClean(value) { return (value || '').replace(/\s+/g, ' ').trim(); }
function __koyfinSecurityId() { const match = location.pathname.match(/\/(eq-[^/?#]+)/); return match ? match[1] : null; }
function __koyfinTicker() {
  const title = __koyfinTextClean(document.title).replace(/^[^A-Za-z0-9]+\s*/, '');
  const titleMatch = title.match(/^([A-Z][A-Z0-9.\-]{0,11})(?:\s|-|$)/);
  if (titleMatch) return titleMatch[1];
  const selectors = ['[class*="market-quote-base__ticker"]','[class*="ticker-title"]','[class*="tickerInfo"] [class*="ticker"]','[class*="ticker-info"] [class*="ticker"]','[class*="securityName"]'];
  for (const selector of selectors) {
    const el = document.querySelector(selector);
    const text = __koyfinTextClean(el && el.textContent).replace(/^[^A-Za-z0-9]+\s*/, '');
    const match = text.match(/^([A-Z][A-Z0-9.\-]{0,11})(?:\s|$)/);
    if (match && !['SECURITY','ANALYSIS','LOG','SIGN'].includes(match[1])) return match[1];
  }
  return __koyfinSecurityId() || 'UNKNOWN';
}
function __koyfinGateStatus() {
  const text = __koyfinTextClean(document.body && document.body.innerText);
  if (/only for registered Koyfin users|Please login|Log In|Sign Up Free|Unlock the infinite power of Koyfin/i.test(text)) return 'auth_required';
  if (/Upgrade|Download Available Data|premium|subscription/i.test(text)) return 'premium_or_upgrade_limited';
  return null;
}

/**
 * extract.js — Koyfin Price Target Extraction Script
 *
 * Extracts price target, analyst rating, and consensus data from
 * Koyfin's Price Target page. Two extraction strategies:
 *
 *   1. DOM extraction (run in browser console on the PT page)
 *   2. API extraction (uses page's auth context to call the API)
 *
 * Usage (DOM mode):
 *   Copy-paste this file into browser console on https://app.koyfin.com/estimates/pt/*
 *
 * Usage (API mode via browser-harness):
 *   js(extract_js_code)
 *
 * Output: JSON object with ticker, tab, extracted_at, and all data.
 */

(function () {
  "use strict";

  // ============================================================
  // 1. METADATA
  // ============================================================
  const metadata = {
    ticker: (() => {
      const m = document.title.match(/^[^\s]+\s*[-–—]\s*(.+)$/);
      return m ? m[0].split(" ")[0].replace(/[^\w]/g, "") : "UNKNOWN";
    })(),
    tab: document.title || "MSFT - Price Target",
    url: document.location.href,
    extracted_at: new Date().toISOString(),
  };

  // ============================================================
  // 2. DOM-BASED EXTRACTION (text parsing)
  // ============================================================
  function extractFromDOM() {
    const text = document.body ? document.body.innerText : "";
    const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);

    const data = {
      price_target: null,
      ratings: null,
      historical_chart: null,
    };

    // --- Price Target Summary ---
    // Pattern: text contains key labels followed by values
    const ptValues = {};
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const next = lines[i + 1] || "";

      if (line.includes("12-Month Average Target")) {
        ptValues.avg_target = parseFloat(next);
      }
      if (line === "Current Price") {
        ptValues.current_price = parseFloat(next);
      }
      if (line === "Return Potential") {
        ptValues.return_potential_pct = parseFloat(next.replace("%", ""));
      }
      if (line === "Trailing 1Y Price Return") {
        ptValues.trailing_1y_return_pct = parseFloat(next.replace("%", ""));
      }

      // Low/High targets appear before labels
      // Find the Price Target header, then read two numbers after it
      if (
        line === "Price Target" &&
        !lines[i - 1]?.includes("Historical") &&
        !lines[i - 1]?.includes("Target")
      ) {
        const maybeLow = parseFloat(lines[i + 1]);
        const maybeHigh = parseFloat(lines[i + 2]);
        if (!isNaN(maybeLow) && !isNaN(maybeHigh)) {
          ptValues.low_target = maybeLow;
          ptValues.high_target = maybeHigh;
        }
      }
    }

    if (Object.keys(ptValues).length > 0) {
      data.price_target = ptValues;
    }

    // --- Ratings ---
    // Find rating counts after labels like "Strong Buy", "Buy", etc.
    const ratingMap = {};
    const ratingLabels = [
      "Strong Buy",
      "Buy",
      "Hold",
      "Sell",
      "Strong Sell",
    ];
    for (let i = 0; i < lines.length; i++) {
      for (const label of ratingLabels) {
        if (lines[i] === label) {
          const val = parseInt(lines[i + 1] || lines[i + 2], 10);
          if (!isNaN(val)) {
            ratingMap[label] = val;
          }
        }
      }
      if (lines[i] === "Number of Covering Analysts") {
        const val = parseInt(lines[i + 1], 10);
        if (!isNaN(val)) {
          ratingMap.covering_analysts = val;
        }
      }
    }

    if (Object.keys(ratingMap).length > 0) {
      data.ratings = ratingMap;

      // Also extract historical average ratings
      const histRatings = [];
      for (let i = 0; i < lines.length; i++) {
        if (lines[i] === "Average Analyst Ratings (1-5)") {
          // Next line contains the bar chart years
          const yearsLine = lines[i + 1];
          const valuesLine = lines[i + 2];
          if (yearsLine && valuesLine) {
            const years = yearsLine.split(/\s+/).filter((y) => /^\d{4}$/.test(y));
            const values = valuesLine
              .split(/\s+/)
              .map((v) => parseFloat(v))
              .filter((v) => !isNaN(v));
            for (let j = 0; j < Math.min(years.length, values.length); j++) {
              histRatings.push({ year: parseInt(years[j]), rating: values[j] });
            }
          }
        }
      }
      data.ratings.historical = histRatings.length > 0 ? histRatings : null;
    }

    // --- Historical Price Target Chart ---
    // Extract data labels from SVG text elements
    const svgTexts = Array.from(document.querySelectorAll("svg text"))
      .map((t) => t.textContent.trim())
      .filter(Boolean);

    // Find price target chart dates and values
    const dates = svgTexts.filter(
      (t) => /^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{4}$/.test(t)
    );
    const prices = svgTexts
      .map((t) => parseFloat(t))
      .filter((v) => !isNaN(v) && v > 0);

    if (dates.length > 0 || prices.length > 0) {
      data.historical_chart = {
        dates_visible: dates,
        price_values_visible: prices,
      };
    }

    return data;
  }

  // ============================================================
  // 3. API-BASED EXTRACTION (via fetch)
  // ============================================================
  async function extractFromAPI() {
    try {
      // The /api/v3p/data/keys endpoint requires POST with
      // ids (ticker KID) and keys (data key names) arrays.
      // When called from within the page context, the server
      // infers the session context, but explicit parameters work.
      //
      // If you don't know the KID, extract it from the current URL:
      //   const kid = location.pathname.split("/").pop();
      // Or call without ids to get the default ticker.

      const kid = location.pathname.split("/").pop();

      const resp = await fetch("/api/v3p/data/keys", {
        method: "POST",
        credentials: "include",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ids: [kid],
          keys: [
            "fest_estpt",
            "fest_estpt_high",
            "fest_estpt_low",
            "fest_estpt_median",
            "fest_estpt_stddev",
            "fest_estpt_num",
            "pfest_estpt",
            "fest_est_ar_strongbuy",
            "fest_est_ar_outperform",
            "fest_est_ar_hold",
            "fest_est_ar_underperform",
            "fest_est_ar_sell",
            "fest_est_ar_avg_no",
            "p_l",
          ],
        }),
      });
      const json = await resp.json();

      // Extract the KID data (first key under KID)
      if (!json.KID) {
        return { error: "No KID in response. Raw: " + JSON.stringify(json).substring(0, 200) };
      }
      const kidKeys = Object.keys(json.KID);
      if (!kidKeys.length) {
        return { error: "Empty KID object" };
      }
      const kidData = json.KID[kidKeys[0]];

      // Helper to extract fields
      const val = (key) => {
        const entry = kidData[key];
        return entry ? entry.value : null;
      };

      return {
        price_target: {
          avg_target: val("fest_estpt"),
          high_target: val("fest_estpt_high"),
          low_target: val("fest_estpt_low"),
          median_target: val("fest_estpt_median"),
          std_dev: val("fest_estpt_stddev"),
          num_estimates: val("fest_estpt_num"),
          prev_target: val("pfest_estpt"),
        },
        ratings: {
          strong_buy: val("fest_est_ar_strongbuy"),
          buy: val("fest_est_ar_outperform"),
          hold: val("fest_est_ar_hold"),
          underperform: val("fest_est_ar_underperform"),
          sell: val("fest_est_ar_sell"),
          avg_rating: val("fest_est_ar_avg_no"),
        },
        price: {
          current: val("p_l"),
          date: kidData.p_l ? kidData.p_l.date : null,
        },
      };
    } catch (err) {
      return { error: `API extraction failed: ${err.message}` };
    }
  }

  // ============================================================
  // 4. COMBINED EXTRACTION
  // ============================================================
  async function extract() {
    const domData = extractFromDOM();

    let apiData = {};
    try {
      apiData = await extractFromAPI();
    } catch (e) {
      apiData = { error: e.message };
    }

    return {
      ...metadata,
      source_dom: domData,
      source_api: apiData,
    };
  }

  // Auto-run if this is the main module
  if (typeof window !== "undefined" && window.document) {
    return extract();
  }

  return { extract, extractFromDOM, extractFromAPI };
})();
