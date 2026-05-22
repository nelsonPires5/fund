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
 * extract.js — Koyfin Estimates Trends DOM extraction
 *
 * Usage: Run inside Koyfin on https://app.koyfin.com/estimates/ert/<ticker-id>
 * Returns structured JSON of all visible estimates trends data.
 *
 * Patterns:
 *   - Table is a div-based virtualized grid (not <table>)
 *   - Groups are sibling divs inside scrollContainer > div
 *   - Each group has a header div + N row divs
 *   - Rows have 7 cell divs
 */

(function extractEstimatesTrends() {
  'use strict';

  const ROOT_SELECTOR = '[class*="estimates-trends-table"]';

  /**
   * Find the estimates trend table container
   */
  function findTable() {
    const walk = (el) => {
      if (!el || el.nodeType !== 1) return null;
      const cls = (typeof el.className === 'string') ? el.className : '';
      if (cls.includes('estimates-trends-table')) return el;
      for (let i = 0; i < el.children.length; i++) {
        const r = walk(el.children[i]);
        if (r) return r;
      }
      return null;
    };
    return walk(document.getElementById('root'));
  }

  /**
   * Parse a cell's text content into structured data
   */
  function parseCell(text) {
    const t = text.trim();
    if (!t) return t;

    // Check for range pattern (low\\nhigh or low\\nhigh with $)
    const lines = t.split('\n').map(s => s.trim()).filter(Boolean);
    if (lines.length >= 2) {
      return { low: lines[0], high: lines[1], raw: t };
    }

    // Check for percentage
    if (t.endsWith('%')) {
      return { value: t, raw: t };
    }

    // Check for multiplier
    if (t.endsWith('x')) {
      return { value: t, raw: t };
    }

    // Dollar value
    if (t.startsWith('$')) {
      return { value: t, raw: t };
    }

    // Dash = not available
    if (t === '-') {
      return null;
    }

    return { value: t, raw: t };
  }

  /**
   * Extract all groups and rows
   */
  function extract() {
    const table = findTable();
    if (!table) return { error: 'Estimates Trends table container not found' };

    const scrollContainer = table.querySelector('[class*="scrollContainer"]');
    if (!scrollContainer) return { error: 'Scroll container not found' };

    const inner = scrollContainer.children[0];
    if (!inner) return { error: 'Inner container not found' };

    // Header row (child[0])
    const headerRow = inner.children[0];
    const headers = [];
    if (headerRow) {
      const cells = headerRow.querySelectorAll(':scope > div');
      for (const c of cells) {
        const txt = c.innerText.trim();
        if (txt && txt.length < 50 && !txt.includes('draggable')) {
          headers.push(txt);
        }
      }
    }

    // Groups (children[1..n])
    const groups = [];
    for (let i = 1; i < inner.children.length; i++) {
      const groupDiv = inner.children[i];
      if (!groupDiv || groupDiv.nodeType !== 1) continue;

      // Group header
      const gh = groupDiv.querySelector('[class*="groupHeader"]');
      const metricName = gh ? gh.innerText.trim() : ('Group ' + i);

      // Data rows
      const rowEls = groupDiv.querySelectorAll('[class*="base-table-row__root"]');
      const rows = [];
      for (const row of rowEls) {
        const cells = row.querySelectorAll(':scope > div');
        const rowData = {};
        for (let ci = 0; ci < cells.length; ci++) {
          const key = headers[ci] || ('col_' + ci);
          const val = cells[ci].innerText.trim();
          // Skip empty/drag-handle columns
          if (val && !val.includes('draggable')) {
            rowData[key] = parseCell(val);
          }
        }
        rows.push(rowData);
      }

      if (metricName || rows.length > 0) {
        groups.push({ metric: metricName, rows });
      }
    }

    return {
      ticker: __koyfinTicker(),
      tab: 'Estimates Trends (ERT)',
      extractedAt: new Date().toISOString(),
      url: window.location.href,
      headers,
      groups,
      metadata: {
        pageTitle: document.title,
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight
      }
    };
  }

  return extract();
})();
