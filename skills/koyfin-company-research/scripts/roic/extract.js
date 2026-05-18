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
 * extract.js — Koyfin ROIC Data Extractor
 *
 * Paste this into the browser DevTools console on a Koyfin Financial Analysis ROIC page.
 * Example URL shape: https://app.koyfin.com/fa/<template-id>/eq-<security-id>
 *
 * Or invoke via browser-harness:
 *   browser-harness <<'PY'
 *     data = js("return " + open("/tmp/MSFT/roic/extract.js").read() + "()")
 *     print(data)
 *   PY
 *
 * Returns a JSON object with ticker, tab, extracted_at, period_config, sections, and rows.
 * Handles missing ROIC rows gracefully (returns empty array if not on ROIC tab).
 */

(function extractROIC() {

  // --- Helper: clean duplicate text from cell array ---
  function cleanCells(cells) {
    // Cells often have nested elements producing duplicates like ["22.1B","22.1B","22.1B","22.1","B"]
    // Take every other element (0-indexed, evens) to deduplicate
    const seen = new Set();
    const result = [];
    for (const c of cells) {
      const key = c.trim().replace(/\s+/g, ' ');
      if (!seen.has(key)) {
        seen.add(key);
        result.push(key);
      }
    }
    return result;
  }

  // --- Extract header row ---
  const headerCells = document.querySelectorAll('.fa-table__faTable__headerCell');
  const headers = Array.from(headerCells).map(el => el.textContent.trim()).filter(Boolean);

  // --- Extract data rows ---
  const rowEls = document.querySelectorAll('.base-table-row__root.fa-table__faTable__row');
  const rows = Array.from(rowEls).map(row => {
    // Get all leaf-level text nodes
    const cells = Array.from(row.querySelectorAll('*'))
      .filter(el => el.children.length === 0 && el.textContent.trim())
      .map(el => el.textContent.trim());
    const cleaned = cleanCells(cells);
    if (cleaned.length === 0) return null;
    return cleaned;
  }).filter(Boolean);

  // --- Extract section/group headers ---
  const groupHeaders = Array.from(document.querySelectorAll('.lde-group-header-row__title'))
    .map(el => el.textContent.trim())
    .filter(Boolean);

  // --- Detect period toggle (Annual/Quarterly/LTM) ---
  const periodToggles = Array.from(document.querySelectorAll('.koy-tab-item__koyTabItem'))
    .map(el => ({
      label: el.textContent.trim(),
      active: el.classList.contains('koy-tab-item__active')
    }))
    .filter(t => ['Last 12 Months (LTM)', 'Quarterly (Q)', 'Annual (Y)'].includes(t.label));

  const activePeriod = periodToggles.find(t => t.active);

  return JSON.stringify({
    ticker: (() => {
      const m = location.pathname.match(/\/eq-([^/]+)/);
      return m ? m[1].replace('eq-', '').toUpperCase() : 'UNKNOWN';
    })(),
    tab: 'ROIC',
    extracted_at: new Date().toISOString(),
    url: location.href,
    period_config: {
      active_period: activePeriod ? activePeriod.label : null,
      available_periods: periodToggles.map(t => t.label),
      headers: headers,
      note: 'Headers are the fiscal year columns. The first column is the metric name.'
    },
    sections: groupHeaders,
    rows: rows.map(r => ({
      metric: r[0] || '',
      values: r.slice(1)  // Array of values per fiscal year
    })),
    total_rows: rows.length,
    status: rows.length > 0 ? 'success' : 'no_data',
    note: rows.length === 0
      ? 'No ROIC data rows found. Are you on the correct tab? Navigate to Security Analysis > Financial Analysis > ROIC.'
      : null
  }, null, 2);
})();
