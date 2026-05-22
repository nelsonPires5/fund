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
 * Koyfin Multiples Tab — Data Extraction Script
 *
 * Run in browser-harness as:
 *   browser-harness <<'PY'
 *   import json
 *   data = js(open("/tmp/MSFT/multiples/extract.js").read())
 *   print(json.dumps(data, indent=2))
 *   PY
 *
 * This script reads the rendered Multiples table from the DOM.
 * It handles both quarterly and annual fiscal period views.
 */

(function() {
  const result = {
    ticker: null,
    tab: "Multiples",
    extracted_at: new Date().toISOString(),
    url: window.location.href,
    fiscal_period_type: null,
    columns: [],
    metrics: [],
    sections: [],
  };

  // ── 1. Identify ticker ──
  const tickerEl = document.evaluate(
    '//span[contains(@class,"kfTicker") or text()="MSFT"]',
    document, null, XPathResult.FIRST_ORDERED_NODE_TYPE
  ).singleNodeValue;
  // Fallback: look for any element containing the ticker near the header
  result.ticker = tickerEl ? tickerEl.textContent.trim() : (() => {
    const all = document.querySelectorAll('*');
    for (const el of all) {
      if (el.children.length === 0) {
        const t = (el.textContent || '').trim();
        if (/^[A-Z]{1,5}$/.test(t) && el.offsetWidth > 0) {
          // Likely a ticker — check it's near the header area
          const r = el.getBoundingClientRect();
          if (r.y < 150 && r.y > 80) return t;
        }
      }
    }
    return "UNKNOWN";
  })();

  // ── 2. Identify active fiscal period type ──
  const periodEls = document.querySelectorAll('span, div, label');
  for (const el of periodEls) {
    const text = (el.textContent || '').trim();
    if (text === 'Quarterly (Q)' || text === 'Annual (Y)' || text === 'Last 12 Months (LTM)') {
      // Check if it's the active/selected one by looking at style/class
      const parent = el.parentElement;
      const style = parent ? window.getComputedStyle(parent) : null;
      if (style && (style.color === 'rgb(255, 255, 255)' || style.fontWeight === '700' || parent.classList.contains('active') || parent.classList.contains('selected'))) {
        result.fiscal_period_type = text;
        break;
      }
    }
  }
  // If not found by style, default to the currently rendered columns
  if (!result.fiscal_period_type) {
    const headerRow = document.querySelector('[class*="faDashboard_tableContainer"] [class*="header"], [class*="fa-table"] [class*="header"]');
    if (headerRow) {
      const headerText = headerRow.textContent || '';
      if (headerText.includes('FY ')) result.fiscal_period_type = 'Annual (Y)';
      else if (headerText.includes('FY')) result.fiscal_period_type = 'Quarterly (Q)';
    }
  }

  // ── 3. Extract column headers ──
  // Find elements in the 260-290px y-range that contain fiscal period labels
  const allEls = document.querySelectorAll('*');
  const headerCells = [];
  for (const el of allEls) {
    if (el.children.length > 0) continue;
    const text = (el.textContent || '').trim();
    if (!text || text.length > 20) continue;
    const r = el.getBoundingClientRect();
    if (r.width > 0 && r.height > 0 && r.x > 200 && r.x < 2100 && r.y > 260 && r.y < 290) {
      // Check if it looks like a column header
      if (/^(FY \d{4}|\d[Qq] FY\d{4}|Current\/LTM|Fiscal (Years|Quarters))$/.test(text)) {
        headerCells.push({ label: text, x: Math.round(r.x), y: Math.round(r.y) });
      }
    }
  }
  headerCells.sort((a, b) => a.x - b.x);
  result.columns = headerCells.map(c => c.label);

  // ── 4. Extract metric rows ──
  // Build a position map of all text nodes in the table area
  const textNodes = [];
  for (const el of allEls) {
    if (el.children.length > 0) continue;
    const text = (el.textContent || '').trim();
    if (!text) continue;
    const r = el.getBoundingClientRect();
    if (r.width > 0 && r.height > 0 && r.x > 200 && r.x < 2100 && r.y > 290 && r.y < 1300) {
      textNodes.push({
        text: text,
        x: Math.round(r.x),
        y: Math.round(r.y),
        w: Math.round(r.width),
        h: Math.round(r.height),
      });
    }
  }

  // Group by y-coordinate (row)
  const rowMap = {};
  for (const n of textNodes) {
    const y = n.y;
    if (!rowMap[y]) rowMap[y] = [];
    rowMap[y].push(n);
  }
  for (const y in rowMap) {
    rowMap[y].sort((a, b) => a.x - b.x);
  }

  // Identify metric label rows (first element has text aligning with left column)
  const metricNames = [];
  const sortedY = Object.keys(rowMap).map(Number).sort((a, b) => a - b);
  for (const y of sortedY) {
    const cells = rowMap[y];
    if (cells.length === 0) continue;
    const first = cells[0];
    // Metric labels are at x < 380 and describe a named multiple
    if (first.x > 200 && first.x < 400 && first.text.length > 5 && /^[A-Z]/.test(first.text)) {
      metricNames.push({ name: first.text, y: y, cells: cells });
    }
  }

  // For each metric, find the data row (next y with numeric values)
  for (const m of metricNames) {
    const metricY = m.y;
    // Find the data row: typically metricY + 8 to 10px
    const dataRowY = sortedY.find(y => y > metricY && y <= metricY + 15);
    if (!dataRowY) {
      result.metrics.push({
        metric: m.name,
        error: "No data row found",
        values: []
      });
      continue;
    }
    const dataCells = rowMap[dataRowY] || [];
    // Filter out "x" unit markers and extract just the values
    const values = [];
    for (const cell of dataCells) {
      const v = cell.text;
      if (v.toLowerCase() === 'x' || v === '×') continue; // skip unit markers
      // Determine which column this value belongs to based on x position
      const colIdx = result.columns.length > 0 ? findColumnIndex(cell.x, headerCells) : null;
      values.push({
        value: v,
        x: cell.x,
        // column: colIdx !== null ? result.columns[colIdx] : null,
      });
    }
    // Align values with columns by position
    const aligned = alignValuesWithColumns(values, headerCells);
    result.metrics.push({
      metric: m.name,
      values: aligned,
    });
  }

  // ── 5. Identify sections ──
  const sectionNames = ['Sales | Revenues', 'Earnings', 'Book Value'];
  for (const name of sectionNames) {
    // Find metrics belonging to this section
    const sectionMetrics = [];
    let inSection = false;
    for (const m of result.metrics) {
      const metricY = metricNames.find(mn => mn.name === m.metric)?.y || 0;
      if (inSection) {
        // Check if the metric is below the section header and above the next section
        const nextSection = sectionNames[sectionNames.indexOf(name) + 1];
        const nextSectionEl = nextSection ? findSectionY(nextSection, allEls) : 9999;
        if (metricY < nextSectionEl) {
          sectionMetrics.push(m.metric);
        } else {
          break;
        }
      }
      if (!inSection && isSectionHeaderAtY(name, metricY - 40, allEls)) {
        inSection = true;
      }
    }
    if (sectionMetrics.length > 0) {
      result.sections.push({ name, metrics: sectionMetrics });
    }
  }

  // ── 6. Extract raw table dimensions (for future scraping) ──
  const tableContainers = document.querySelectorAll('[class*="faDashboard_tableContainer"], [class*="fa-table"]');
  for (const tc of tableContainers) {
    const r = tc.getBoundingClientRect();
    if (r.x > 200 && r.width > 1000) {
      result.table_container = {
        x: Math.round(r.x),
        y: Math.round(r.y),
        width: Math.round(r.width),
        height: Math.round(r.height),
        scrollHeight: tc.scrollHeight,
        scrollWidth: tc.scrollWidth,
      };
      break;
    }
  }

  return result;

  // ── Helper functions ──
  function findColumnIndex(px, headers) {
    // Map pixel x to column based on header positions
    if (!headers || headers.length === 0) return null;
    let best = 0;
    let bestDist = Infinity;
    for (let i = 0; i < headers.length; i++) {
      const dist = Math.abs(px - headers[i].x);
      if (dist < bestDist) {
        bestDist = dist;
        best = i;
      }
    }
    // Only match if within 60px
    return bestDist < 80 ? best : null;
  }

  function alignValuesWithColumns(values, headers) {
    if (!headers || headers.length === 0) return values.map(v => v.value);
    const aligned = new Array(headers.length).fill(null);
    for (const v of values) {
      const idx = findColumnIndex(v.x, headers);
      if (idx !== null && idx < aligned.length) {
        aligned[idx] = v.value;
      }
    }
    return aligned;
  }

  function isSectionHeaderAtY(name, y, elements) {
    for (const el of elements) {
      if (el.children.length > 0) continue;
      const t = (el.textContent || '').trim();
      if (t === name) {
        const r = el.getBoundingClientRect();
        if (Math.abs(r.y - y) < 5) return true;
      }
    }
    return false;
  }

  function findSectionY(name, elements) {
    for (const el of elements) {
      if (el.children.length > 0) continue;
      const t = (el.textContent || '').trim();
      if (t === name) {
        return Math.round(el.getBoundingClientRect().y);
      }
    }
    return 9999;
  }
})();
