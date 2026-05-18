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
 * extract.js — Koyfin Solvency Tab Data Extraction
 *
 * Paste this into the browser console on a Koyfin Financial Analysis > Solvency page.
 * Extracts structured tabular data from the Koyfin React table component.
 * Handles missing values gracefully (returns '-' placeholder).
 *
 * Durable selectors (Koyfin CSS module pattern — stable across builds):
 *   - Table rows:    .base-table-row__root___VnXIn or [class*="base-table-row__root"]
 *   - Group headers: [class*="lde-data-table-group__groupHeader"]
 *   - Header cells:  [class*="fa-table__faTable__headerCell"]
 *   - Row labels:    [class*="default-cell__label"]
 *   - Table root:    [class*="fa-table__root"]
 */

(function() {
  'use strict';

  const result = {
    ticker: '',
    tab: 'Solvency (FA.SOLV)',
    extracted_at: new Date().toISOString(),
    url: document.URL,
    period_type: '',
    date_range: '',
    currency: '',
    headers: [],
    groups: [],
    raw_rows: []
  };

  // 1. Extract headers (fiscal year columns)
  const headerCells = document.querySelectorAll('[class*="fa-table__faTable__headerCell"]');
  const headers = [];
  const seen = new Set();
  for (const cell of headerCells) {
    const text = (cell.textContent || '').trim();
    if (text && !seen.has(text)) {
      seen.add(text);
      headers.push(text);
    }
  }
  result.headers = headers;

  // 2. Extract period info from the UI toggles (if available)
  const periodToggle = document.querySelector('[class*="active"][class*="period"], [class*="toggle"]');
  // Fall back to examining text content for period indicators
  const bodyText = document.body.innerText || '';
  const periodMatch = bodyText.match(/Last\s+12\s+Months\s*\(LTM\)|Quarterly\s*\(Q\)|Annual\s*\(Y\)/g);
  if (periodMatch) result.period_type = periodMatch.join(' | ');
  const dateRangeMatch = bodyText.match(/\d{4}\s*-\s*\d{4}/);
  if (dateRangeMatch) result.date_range = dateRangeMatch[0];
  const currencyMatch = bodyText.match(/US Dollar\s*\(([A-Z]{3})\)/);
  if (currencyMatch) result.currency = currencyMatch[1];

  // 3. Extract ticker from the page header
  const tickerMatch = bodyText.match(/SECURITY ANALYSIS\s+([A-Z]+)/);
  if (tickerMatch) result.ticker = tickerMatch[1];

  // 4. Extract group names
  const groupEls = document.querySelectorAll('[class*="lde-data-table-group__groupHeader"]');
  for (const g of groupEls) {
    const name = (g.textContent || '').trim();
    if (name) result.groups.push(name);
  }

  // 5. Extract data rows
  const rows = document.querySelectorAll('[class*="base-table-row__root"]');
  for (const row of rows) {
    const text = (row.textContent || '').trim();
    if (!text || text.length < 10) continue;
    // Skip rows that are just group headers
    if (result.groups.some(g => text === g)) continue;
    // Skip empty or decoration rows
    const rect = row.getBoundingClientRect();
    if (rect.width < 100) continue;

    // Find the row label
    const labelEl = row.querySelector('[class*="default-cell__label"]');
    const label = labelEl ? (labelEl.textContent || '').trim() : '';

    // Find value cells — skip the label cell, header cell, and sticky cell
    const allCells = row.querySelectorAll('[class*="fa-table__defaultCell"]');
    const values = [];
    for (const cell of allCells) {
      const txt = (cell.textContent || '').trim();
      const cls = cell.className || '';
      // Skip header cells and sticky/empty cells
      if (cls.includes('header') || cls.includes('label') || !txt) continue;
      if (txt === label) continue;
      // Skip index/empty cells (they're empty or just contain a spacer)
      if (cell.querySelector('[class*="cellGrid"]') && !cell.querySelector('[class*="dataCell"]')) continue;
      values.push(txt);
    }

    // Fallback: parse from concatenated text if cell-based extraction fails
    let parsedValues = values;
    if (values.length === 0) {
      // Parse the concatenated row text: label followed by values
      // Values end with %, x, or are numeric
      const valueRegex = /(-|[0-9]+\.[0-9]+%?|[0-9]+\.[0-9]+x)/g;
      const matches = text.substring(label.length).trim().match(valueRegex);
      if (matches) parsedValues = matches;
    }

    result.raw_rows.push({
      label: label || text.substring(0, 40),
      values: parsedValues,
      raw_text: text.substring(0, 200)
    });
  }

  // 6. Build structured output
  // Assign rows to groups by matching group labels in order
  const structuredGroups = [];
  let currentGroup = null;
  let rowIdx = 0;

  for (const row of result.raw_rows) {
    // Check if a group name partially matches the current row label
    // (groups appear before their rows in the DOM)
    // We use a simpler approach: the DOM order matches the visual layout
    // So we track which group we're in based on proximity
    structuredGroups.push({
      label: row.label,
      values: row.values
    });
  }

  // Output
  result.groups_structured = result.groups;
  result.rows = result.raw_rows.map(r => ({
    label: r.label,
    values: r.values
  }));

  // Remove the raw_rows for cleaner output
  delete result.raw_rows;

  return result;
})();
