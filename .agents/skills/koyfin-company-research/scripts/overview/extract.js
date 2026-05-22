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
 * Koyfin Security Analysis — Overview Tab Extractor
 *
 * Run this in the browser console on a Koyfin Overview page:
 *   https://app.koyfin.com/snapshot/s/{securityId}
 *
 * Outputs structured JSON with ticker, tab, extracted_at, and all visible data panels.
 * Pass ?format=csv to URL or set window.__koyfinFormat = 'csv' for CSV output.
 */

(function extractKoyfinOverview() {
    'use strict';

    const TICKER = __koyfinTicker();

    const TAB = 'Overview';

    const EXTRACTED_AT = new Date().toISOString();

    // ─── Helpers ──────────────────────────────────────────

    /** Get the semantic label from a data cell */
    function cellLabel(cell) {
        const labelEl = cell.querySelector('[class*="stdDataLabel"]');
        if (!labelEl) return '';
        if (labelEl.classList.contains('noLabel')) return '';
        return labelEl.textContent.trim();
    }

    /** Get the formatted value from a data cell */
    function cellValue(cell) {
        const resultDiv = cell.querySelector('[class*="stdCellValueResult"]');
        if (!resultDiv) return cell.textContent.trim();

        const prefix = resultDiv.querySelector('[class*="prefix"]');
        const postfix = resultDiv.querySelector('[class*="postfix"]');
        const valueLabel = resultDiv.querySelector('[class*="label"]');

        let val = valueLabel ? valueLabel.textContent.trim() : resultDiv.textContent.trim();
        if (prefix) val = prefix.textContent.trim() + val;
        if (postfix) val = val + postfix.textContent.trim();
        return val;
    }

    /** Find a grid section by partial class match */
    function findSection(partialClass) {
        return document.querySelector(`[class*="${partialClass}"]`);
    }

    /** Extract header texts from a grid */
    function extractHeaders(section, headerSelector) {
        return Array.from(section.querySelectorAll(headerSelector))
            .map(h => h.textContent.trim())
            .filter(Boolean);
    }

    /** Extract labeled cells as {label, value} pairs from a section */
    function extractLabeledCells(section) {
        const result = {};
        section.querySelectorAll('[class*="stdDataCell"]').forEach(cell => {
            const lbl = cellLabel(cell);
            const val = cellValue(cell);
            if (lbl && val && val !== lbl) {
                result[lbl] = val.replace(/^\$\$/, '$'); // fix double $ prefix
            }
        });
        return result;
    }

    /** Extract tabular data with row headers and column values */
    function extractTabularData(section, headerSelector) {
        const headers = extractHeaders(section, headerSelector);
        const cells = Array.from(section.querySelectorAll('[class*="stdDataCell"]'));
        const rows = [];
        let curMetric = '';

        cells.forEach(cell => {
            const lbl = cellLabel(cell);
            const val = cellValue(cell);
            if (lbl && val === lbl) {
                curMetric = lbl;
                rows.push({ metric: lbl, values: [] });
            } else if (val && curMetric && rows.length) {
                rows[rows.length - 1].values.push(val.replace(/^\$\$/, '$'));
            }
        });

        return { columns: headers, data: rows };
    }

    // ─── Extraction ──────────────────────────────────────

    const data = { ticker: TICKER, tab: TAB, extracted_at: EXTRACTED_AT };

    // 1. Key Data
    const keySection = findSection('equityOverviewGrid');
    if (keySection) {
        data.key_data = extractLabeledCells(keySection);
    }

    // 2. Performance Returns
    const perfSection = findSection('equityPerformanceGrid');
    if (perfSection) {
        const headers = extractHeaders(perfSection, '[class*="stdSubHeaderCell"]')
            .filter(t => t.length <= 4);
        const cells = Array.from(perfSection.querySelectorAll('[class*="stdDataCell"]'));
        const metrics = {};
        let cur = '';

        cells.forEach(cell => {
            const lbl = cellLabel(cell);
            const val = cellValue(cell);
            if (lbl && val === lbl) {
                cur = lbl;
                metrics[cur] = [];
            } else if (val && cur) {
                metrics[cur].push(val);
            }
        });

        data.performance_returns = { periods: headers, ...metrics };
    }

    // 3. Valuation
    const valSection = findSection('valuationGrid');
    if (valSection) {
        data.valuation = extractTabularData(valSection, '[class*="stdSubHeaderCell"]');
    }

    // 4. Capital Structure
    const capSection = findSection('capstrGrid');
    if (capSection) {
        data.capital_structure = extractLabeledCells(capSection);
    }

    // 5. Analyst Estimates
    const estSection = findSection('estimatesGrid');
    if (estSection) {
        data.analyst_estimates = extractTabularData(estSection, '[class*="stdSubHeaderRow"]');
    }

    // 6. Chart periods
    const toolbar = document.querySelector('[class*="chart-toolbar"]');
    if (toolbar) {
        data.chart_periods = Array.from(toolbar.querySelectorAll('button'))
            .map(b => b.textContent.trim())
            .filter(t => t.length <= 5);
    }

    // 7. Quote Box (top bar)
    const mainContent = document.querySelector('[class*="mainContentWrap"]');
    if (mainContent) {
        data.quote_box = {};
        const topCells = Array.from(mainContent.querySelectorAll('[class*="stdDataCell"], [class*="stdCellValue"]'))
            .filter(c => {
                // exclude cells inside card panels
                return !c.closest('[class*="snapshot-overview__"]') &&
                       !c.closest('[class*="card"]');
            });
        topCells.forEach(cell => {
            const lbl = cellLabel(cell);
            const val = cellValue(cell);
            if (lbl && val && val !== lbl) {
                data.quote_box[lbl] = val;
            }
        });
    }

    // ─── Output ──────────────────────────────────────────

    const fmt = (new URLSearchParams(window.location.search).get('format') ||
                  window.__koyfinFormat || 'json').toLowerCase();

    if (fmt === 'csv') {
        // Flatten to CSV rows
        const rows = [];
        rows.push(['ticker', 'tab', 'extracted_at', 'section', 'metric', 'period', 'value']);

        function emit(section, metric, period, value) {
            rows.push([TICKER, TAB, EXTRACTED_AT, section, metric, period || '', value]);
        }

        // key_data
        if (data.key_data) {
            Object.entries(data.key_data).forEach(([k, v]) => emit('key_data', k, '', v));
        }
        // performance_returns
        if (data.performance_returns) {
            const periods = data.performance_returns.periods || [];
            Object.entries(data.performance_returns).forEach(([k, v]) => {
                if (k !== 'periods' && Array.isArray(v)) {
                    v.forEach((val, i) => emit('performance_returns', k, periods[i] || '', val));
                }
            });
        }
        // valuation
        if (data.valuation && data.valuation.data) {
            data.valuation.data.forEach(row => {
                row.values.forEach((val, i) =>
                    emit('valuation', row.metric, data.valuation.columns[i] || '', val));
            });
        }
        // capital_structure
        if (data.capital_structure) {
            Object.entries(data.capital_structure).forEach(([k, v]) => emit('capital_structure', k, '', v));
        }
        // analyst_estimates
        if (data.analyst_estimates && data.analyst_estimates.data) {
            data.analyst_estimates.data.forEach(row => {
                row.values.forEach((val, i) =>
                    emit('analyst_estimates', row.metric, data.analyst_estimates.columns[i] || '', val));
            });
        }

        const csv = rows.map(r => r.map(c => '"' + String(c).replace(/"/g, '""') + '"').join(',')).join('\n');
        console.log(csv);
        return csv;
    }

    // Default: JSON
    console.log(JSON.stringify(data, null, 2));
    return data;
})();
