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

(function() {
/**
 * extract.js — Extract Earnings History table from Koyfin Security Analysis page.
 *
 * Usage: 
 *   browser-harness <<'PY'
 *     import json
 *     data = js(open("/tmp/MSFT/earnings-history/extract.js").read())
 *     with open("/tmp/MSFT/earnings-history/sample-output.json","w") as f:
 *       json.dump(data, f, indent=2)
 *   PY
 *
 * IMPORTANT: This file starts with `(function() {` to prevent the browser-harness
 * `js()` helper from double-wrapping it in an IIFE (which would swallow the
 * return value). The `js()` helper wraps expressions containing `return` in
 * `(function(){...})()` unless the expression starts with `(`.
 *
 * Strategy:
 *   The table lives inside a scrollable container with class containing
 *   "koy__scrollContainer". Year-groups are <div> children, each with a
 *   group-header as the first child followed by data-row <div>s. Each
 *   data-row contains cells with class "universal-styles__koy__table_cell___jcDKm".
 *
 * Durable patterns:
 *   - koy__scrollContainer: stable scrollable table container
 *   - headerCell: stable column header class
 *   - table_cell: stable data cell class
 *   - lde-data-table-group__groupHeader: stable year-group header
 *   - The columns and data format are consistent across tickers
 */

  // --- Find the scroll container ---
  var containers = document.querySelectorAll('[class*="koy__scrollContainer"]');
  if (!containers || containers.length === 0) {
    return {error: "Scroll container not found. Are you on the Earnings History tab (url contains /snapshot/earn/)?"};
  }
  var sc = containers[0];
  var inner = sc.children[0];
  if (!inner) {
    return {error: "Scroll container is empty"};
  }

  // --- Metadata ---
  var tickerEl = document.querySelector('.quote-box__securityName___XtQtz');
  var ticker = tickerEl ? tickerEl.textContent.trim() : 'unknown';
  var url = location.href;
  var extractedAt = new Date().toISOString();

  // --- Extract header row ---
  var headerRow = inner.children[0];
  var headerCells = headerRow.querySelectorAll('[class*="headerCell"]');
  var headers = [];
  for (var hi = 0; hi < headerCells.length; hi++) {
    headers.push((headerCells[hi].textContent || '').trim());
  }

  // --- Extract year groups and data rows ---
  var rows = [];
  for (var gi = 1; gi < inner.children.length; gi++) {
    var group = inner.children[gi];
    var groupChildren = group.children;
    if (!groupChildren || groupChildren.length === 0) continue;

    // First child is the year group header (e.g. "CY 2026")
    var yearText = (groupChildren[0].textContent || '').trim();

    // Subsequent children are data rows
    for (var rj = 1; rj < groupChildren.length; rj++) {
      var row = groupChildren[rj];
      var cells = row.querySelectorAll('[class*="table_cell"]');
      var rowData = {};
      for (var ci = 0; ci < cells.length && ci < headers.length; ci++) {
        rowData[headers[ci]] = (cells[ci].textContent || '').trim();
      }
      rowData['_yearGroup'] = yearText;
      rows.push(rowData);
    }
  }

  return {
    ticker: ticker,
    url: url,
    extractedAt: extractedAt,
    tab: "Earnings History",
    headers: headers,
    rowCount: rows.length,
    rows: rows
  };
})()
