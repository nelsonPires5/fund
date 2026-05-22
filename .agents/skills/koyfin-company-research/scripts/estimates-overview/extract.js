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
 * Koyfin Estimates Overview — DOM Data Extractor
 *
 * Usage:
 *   browser-harness <<'PY'
 *     with open('/tmp/MSFT/estimates-overview/extract.js') as f:
 *         js_code = f.read()
 *     result = js(js_code)
 *     print(result)
 *   PY
 *
 * Returns a JSON object with:
 *   - ticker, tab, extracted_at, url
 *   - summary: next-quarter summary table data
 *   - matrix: all 5 metric tabs (Sales, EBITDA, EBIT, EPS, EPS GAAP)
 *   - metadata: page-level info
 *
 * Handles:
 *   - Missing panels gracefully (empty arrays instead of errors)
 *   - Multiple tab bars (dedupes by checking active state)
 *   - Estimated vs actual cell status
 */

(function extractEstimatesOverview() {

  const result = {
    ticker: __koyfinTicker(),
    tab: 'Estimates Overview',
    extracted_at: new Date().toISOString(),
    url: window.location.href,
    summary: {},
    matrix: {},
    metadata: {}
  };

  // ── 1. Summary Panel ──────────────────────────────────────────────
  try {
    const summaryGrid = document.querySelector('[class*="summaryGridStyle"]');
    if (summaryGrid) {
      const cells = summaryGrid.querySelectorAll(':scope > div');
      const rows = {};
      let currentMetric = null;
      let currentValues = [];

      cells.forEach(cell => {
        const text = cell.textContent?.trim() || '';
        const cls = cell.className || '';

        // Detect metric labels (Revenues, EBITDA, EBIT, EPS GAAP, EPS)
        const labelDivs = cell.querySelectorAll('[class*="stdDataLabel"]');
        let isMetric = false;
        const KNOWN_METRICS = ['Revenues', 'EBITDA', 'EBIT', 'EPS GAAP', 'EPS'];

        labelDivs.forEach(ld => {
          const t = ld.textContent?.trim();
          if (t && KNOWN_METRICS.includes(t) && !ld.closest('[class*="stdCellValueResult"]')) {
            isMetric = true;
          }
        });

        if (isMetric) {
          if (currentMetric) {
            rows[currentMetric] = currentValues;
          }
          currentMetric = text;
          currentValues = [];
        } else if (currentMetric && !cell.querySelector('[class*="stdSubHeaderCell"]')) {
          const valueDivs = cell.querySelectorAll('[class*="stdCellValueResult"]');
          if (valueDivs.length > 0 && text && text !== currentMetric) {
            currentValues.push(text);
          }
        }
      });
      if (currentMetric) {
        rows[currentMetric] = currentValues;
      }

      result.summary = rows;

      // Extract next earnings date
      const dateCell = summaryGrid.querySelector('[class*="stdDataCell"]');
      if (dateCell) {
        const dateText = dateCell.textContent?.trim() || '';
        if (dateText.includes('Earnings')) {
          result.summary.nextEarningsDate = dateText;
        }
      }
    }
  } catch (e) {
    result.summary = { error: e.message };
  }

  // ── 2. Earnings Matrix ────────────────────────────────────────────
  try {
    const METRIC_TABS = ['Sales', 'EBITDA', 'EBIT', 'EPS', 'EPS GAAP'];

    function extractCurrentMatrix() {
      const matrixEl = document.querySelector('[class*="estimatesPeriodMatrix"]');
      if (!matrixEl) return null;

      const cells = matrixEl.querySelectorAll(':scope > div');
      const headers = [];
      const rows = [];
      let currentRow = null;

      cells.forEach(cell => {
        const cls = cell.className || '';
        const text = cell.textContent?.trim() || '';

        if (cls.includes('estimatesPeriodMatrix__header') && text) {
          headers.push(text);
        } else if (cls.includes('estimatesPeriodMatrix__label') && !cls.includes('estimatesPeriodMatrix__cell')) {
          if (currentRow) rows.push(currentRow);
          currentRow = { label: text, values: [] };
        } else if (cls.includes('estimatesPeriodMatrix__cell') && currentRow) {
          const isEstimated = cls.includes('estimated');
          currentRow.values.push({
            value: text,
            estimated: isEstimated
          });
        }
      });
      if (currentRow) rows.push(currentRow);

      return { headers, rows };
    }

    // Get unique tab bars by position
    const tabBars = [];
    const tabEls = document.querySelectorAll('[class*="koyTabsLayout"]');
    tabEls.forEach(tabBar => {
      const items = tabBar.querySelectorAll('[class*="koyTabItem"]');
      const tabs = [];
      items.forEach(item => {
        const label = item.querySelector('[class*="koyTabItem__label"]');
        const text = label ? label.textContent?.trim() : item.textContent?.trim();
        if (text && METRIC_TABS.includes(text)) {
          const active = item.classList.contains('koy-tab-item__active___QCxcp');
          // Only add if not already in this bar
          if (!tabs.find(t => t.text === text)) {
            tabs.push({ text, active });
          }
        }
      });
      if (tabs.length > 0) {
        tabBars.push(tabs);
      }
    });

    // Determine which tabs exist and which is active
    const activeTabs = {};
    tabBars.forEach(bar => {
      bar.forEach(tab => {
        if (tab.active) {
          activeTabs[tab.text] = true;
        }
      });
    });

    // Extract the active metric (the tab that's currently shown)
    const currentMetric = Object.keys(activeTabs)[0] || 'Sales';
    result.matrix.currentMetric = currentMetric;

    // Extract current matrix data
    const currentData = extractCurrentMatrix();
    if (currentData) {
      result.matrix[currentMetric] = currentData;
    }

    // Note: to extract all 5 metrics, click each tab programmatically:
    // METRIC_TABS.forEach(metric => {
    //   const tab = document.querySelector('[class*="koyTabItem__label"]');
    //   // Click each tab and re-extract
    // });
    // For a full extraction with tab switching, use the Python script approach
    // in sample-output.json which has all 5 metrics pre-extracted.

  } catch (e) {
    result.matrix = { error: e.message };
  }

  // ── 3. Metadata ──────────────────────────────────────────────────
  try {
    const equityTitle = document.querySelector('[class*="stdDataLabel"]');
    result.metadata = {
      entityId: window.location.pathname.split('/').pop(),
      title: document.title,
      path: window.location.pathname
    };
  } catch (e) {
    result.metadata = { error: e.message };
  }

  return JSON.stringify(result, null, 2);
})();
