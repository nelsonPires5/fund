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
 * extract.js — Koyfin Enterprise Value DOM Data Extraction
 *
 * Designed for use with browser-harness. Run via:
 *   browser-harness <<'PY'
 *   with open("/tmp/MSFT/enterprise-value/extract.js") as f:
 *       data = json.loads(js("return " + f.read()))
 *   PY
 *
 * Extracts visible table data from the Enterprise Value tab.
 * Returns structured JSON with ticker, tab, extracted_at, period_info, and rows.
 *
 * Dependencies: None (vanilla JS)
 * Works with: Koyfin Financial Analysis > Enterprise Value (FA.EV)
 */

(function() {
  'use strict';

  var result = {
    ticker: __koyfinTicker(),
    tab: 'Enterprise Value (FA.EV)',
    extracted_at: new Date().toISOString(),
    period_info: {},
    rows: []
  };

  // Collect all visible divs with their position and text
  var divs = document.querySelectorAll('div');
  var items = [];
  for (var i = 0; i < divs.length; i++) {
    var d = divs[i];
    var rect = d.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) continue;
    if (rect.x < 100 || rect.x > 2000) continue;
    var text = d.textContent.trim();
    if (!text || text.length > 80) continue;
    items.push({text: text, x: Math.round(rect.x), y: Math.round(rect.y), w: Math.round(rect.width)});
  }

  // Extract column headers from Fiscal Years row
  var headerY = -1;
  for (var i = 0; i < items.length; i++) {
    if (items[i].text === 'Fiscal Years') { headerY = items[i].y; break; }
  }

  var headers = [];
  if (headerY > 0) {
    for (var i = 0; i < items.length; i++) {
      if (Math.abs(items[i].y - headerY) <= 5 && items[i].x > 400) {
        var h = items[i].text;
        if (/^FY \d{4}$/.test(h) || /^Current/i.test(h) || /^LTM/i.test(h)) {
          if (headers.indexOf(h) === -1) headers.push(h);
        }
      }
    }
  }
  result.period_info.column_headers = headers;

  // Known metrics that appear as row labels in the Enterprise Value tab
  var knownMetrics = [
    'Market Capitalization',
    'Cash & Short Term Investments',
    'Total Debt',
    'Preferred Equity',
    'Minority Interest',
    'Enterprise Value',
    'EV / Sales',
    'EV / EBITDA',
    'EV / EBIT',
    'Total Capital',
    'Total Common Equity',
    'Total Preferred Equity',
    'Total Debt',
    'Return on Total Capital',
    'Total Debt / Total Capital',
    'Total Debt / Equity',
    'Total Debt / EBITDA',
    'Long-Term Debt / Total Capital'
  ];

  // For each known metric, find its row and extract values
  for (var m = 0; m < knownMetrics.length; m++) {
    var label = knownMetrics[m];
    var metricY = -1;
    for (var i = 0; i < items.length; i++) {
      if (items[i].text === label && items[i].x < 400) {
        metricY = items[i].y;
        break;
      }
    }
    if (metricY === -1) continue;

    var values = [];
    for (var i = 0; i < items.length; i++) {
      if (Math.abs(items[i].y - metricY) <= 5 && items[i].x > 400 && items[i].w < 200) {
        var v = items[i].text;
        // Deduplicate from DOM nesting
        if (values.indexOf(v) === -1) values.push(v);
      }
    }

    if (values.length > 0) {
      result.rows.push({label: label, values: values});
    }
  }

  return JSON.stringify(result, null, 2);
})();
