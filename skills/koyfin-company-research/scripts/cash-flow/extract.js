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
 * extract.js — Koyfin Cash Flow Data Extraction Script
 *
 * Extracts cash flow statement data from Koyfin's rendered DOM
 * and/or direct API calls.
 *
 * Usage:
 *   1. Load this script via browser-harness: js(extractCode)
 *   2. Or paste into browser DevTools console on the Cash Flow page
 *
 * Dependencies: None (vanilla JS)
 *
 * Output: JSON object with ticker, tab, extracted_at, periods, rows, sections
 *
 * Author: browser-harness automation
 * Date: 2026-05-17
 */

(function extractKoyfinCashFlow() {

  // ── Metadata ────────────────────────────────────────────────────────
  const TICKER = __koyfinTicker();
  const TAB = 'Cash Flow';
  const EXTRACTED_AT = new Date().toISOString();

  // ── 1. Read the visible data table from the DOM ─────────────────────
  // Koyfin renders the data as a horizontal-scrollable div grid.
  // Each data row has a label element and a set of value elements.
  //
  // Strategy: Use the innerText of the page body and parse the
  // structured layout. The page text has a consistent format:
  //
  //   Row Label
  //   val1  val2  val3  ...
  //
  // Where values are separated by whitespace and ordered left-to-right
  // matching the column headers.

  function extractFromPageText() {
    const text = document.body.innerText;
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);

    // Find the start of the data section
    let dataStart = -1;
    let periodType = 'unknown';

    for (let i = 0; i < lines.length; i++) {
      const l = lines[i];
      if (l.includes('Fiscal Years') || l.includes('Fiscal Quarters')) {
        dataStart = i;
        periodType = l.includes('Fiscal Years') ? 'annual' : 'quarterly';
        break;
      }
      if (l.includes('Last 12 Months')) {
        // Could be LTM view — look for the data after the column headers
        if (lines[i + 1] && lines[i + 1].includes('Current/LTM')) {
          dataStart = i;
          periodType = 'ltm';
          break;
        }
      }
    }

    if (dataStart === -1) {
      return { error: 'Could not find data section in page text' };
    }

    // Parse column headers (fiscal period labels)
    const periodHeaders = [];
    for (let i = dataStart; i < Math.min(dataStart + 3, lines.length); i++) {
      const line = lines[i];
      // Match patterns like "FY 2020", "2Q FY2023", "Current/LTM"
      const matches = line.match(/([0-9A-Z]+\s*(?:FY\s*20\d{2}|20\d{2})|Current\/LTM)/g);
      if (matches) {
        periodHeaders.push(...matches);
      }
    }

    // Parse row labels and values
    const rows = [];
    const sectionHeaders = new Set([
      'Cash from Operations',
      'Cash from Investing',
      'Cash from Financing',
      'Net Change in Cash',
      'Supplemental Items'
    ]);

    let currentSection = 'Unknown';
    let i = dataStart + 2; // skip past column header lines
    while (i < lines.length) {
      const line = lines[i];

      // Skip empty lines and navigation items
      if (!line || line.length < 2) { i++; continue; }

      // Detect section headers (they're in all-caps or bold)
      if (sectionHeaders.has(line) || line.endsWith('───') || line.includes('───')) {
        // Clean section header
        const clean = line.replace(/[─]+/g, '').trim();
        if (sectionHeaders.has(clean)) {
          currentSection = clean;
          rows.push({
            label: currentSection,
            type: 'section_header',
            section: currentSection
          });
          i++;
          continue;
        }
      }

      // Detect sub-section headers (indented row labels like "Net Income" at section start)
      const knownLabels = new Set([
        'Net Income',
        'Depreciation & Amortization, Total',
        'Depreciation & Amortization',
        'Amortization of Goodwill and Intangible Assets',
        '(Gain) Loss From Sale Of Asset',
        '(Gain) Loss on Sale of Investments',
        'Amortization of Deferred Charges, Total',
        'Asset Writedown & Restructuring Costs',
        'Stock-Based Compensation',
        'Other Operating Activities, Total',
        'Change In Accounts Receivable',
        'Change In Inventories',
        'Change In Accounts Payable',
        'Change in Unearned Revenues',
        'Change In Income Taxes',
        'Change in Other Net Operating Assets',
        'Capital Expenditure',
        'Sale of Property, Plant, and Equipment',
        'Cash Acquisitions',
        'Divestitures',
        'Investment in Mkt and Equity Securities, Total',
        'Net (Increase) Decrease in Loans Orig / Sold',
        'Other Investing Activities, Total',
        'Total Debt Issued',
        'Short Term Debt Issued, Total',
        'Long-Term Debt Issued, Total',
        'Total Debt Repaid',
        'Short Term Debt Repaid, Total',
        'Long-Term Debt Repaid, Total',
        'Issuance of Common Stock',
        'Repurchase of Common Stock',
        'Common & Preferred Stock Dividends Paid',
        'Common Dividends Paid',
        'Preferred Dividends Paid',
        'Special Dividends Paid',
        'Other Financing Activities',
        'Foreign Exchange Rate Adjustments',
        'Miscellaneous Cash Flow Adjustments',
        'Free Cash Flow',
        'Free Cash Flow per Share',
        'Cash Interest Paid',
        'Cash Income Tax Paid (Refund)',
        'Change In Net Working Capital',
        'Net Debt Issued / Repaid'
      ]);

      if (knownLabels.has(line)) {
        // Collect values from subsequent lines until we hit the next label
        const values = [];
        let j = i + 1;
        while (j < lines.length && !knownLabels.has(lines[j]) && !sectionHeaders.has(lines[j]) && !lines[j].includes('───')) {
          const v = lines[j];
          if (v && v.length > 0 && v.length < 25 &&
              (v.endsWith('B') || v.endsWith('M') || v.startsWith('(') || v.startsWith('-') ||
               /^[\d,.()\-B M]+$/.test(v))) {
            values.push(v);
          } else if (v && v.length > 0 && !v.endsWith('B') && !v.endsWith('M')) {
            // Check if it's a number without unit (e.g., per-share values)
            if (/^[\d.()\-]+(B|M)?$/.test(v)) {
              values.push(v);
            } else if (v === '-' || v === '—') {
              values.push(v);
            } else {
              break; // Not a value line
            }
          }
          j++;
        }

        rows.push({
          type: 'row',
          section: currentSection,
          label: line,
          values: values,
          valueCount: values.length
        });
        i = j;
        continue;
      }

      // Try to detect values that belong to the last known label
      const lastRow = rows[rows.length - 1];
      if (lastRow && lastRow.type === 'row') {
        if (line.endsWith('B') || line.endsWith('M') || line === '-' || line === '—' ||
            /^\(?[\d,.]+\)?(B|M)?$/.test(line)) {
          lastRow.values.push(line);
          lastRow.valueCount = lastRow.values.length;
          i++;
          continue;
        }
      }

      i++;
    }

    return {
      ticker: TICKER,
      tab: TAB,
      extractedAt: EXTRACTED_AT,
      method: 'page_text',
      periodType: periodType,
      periodHeaders: periodHeaders,
      rows: rows,
      rowCount: rows.length
    };
  }

  // ── 2. Extract via API calls ───────────────────────────────────────
  // The Koyfin graph API provides individual metric time series.
  // Key map: metric label → API key
  const METRIC_API_KEYS = {
    'Net Income': 'f_nicf',
    'Depreciation & Amortization, Total': 'f_dacf',
    'Depreciation & Amortization': 'f_amo',
    'Amortization of Goodwill and Intangible Assets': 'f_defamo',
    '(Gain) Loss From Sale Of Asset': 'f_gaiasscf',
    '(Gain) Loss on Sale of Investments': 'f_gaiinvcf',
    'Amortization of Deferred Charges, Total': 'f_dasupplcf',
    'Asset Writedown & Restructuring Costs': 'f_asswricf',
    'Stock-Based Compensation': 'f_stkcomp',
    'Other Operating Activities, Total': 'f_ooa',
    'Change In Accounts Receivable': 'f_chgar',
    'Change In Inventories': 'f_chginv',
    'Change In Accounts Payable': 'f_chgap',
    'Change in Unearned Revenues': 'f_chgurev',
    'Change In Income Taxes': 'f_chginctax',
    'Change in Other Net Operating Assets': 'f_chgotherassets',
    'Cash from Operations': 'f_cashops',
    'Capital Expenditure': 'f_capex',
    'Sale of Property, Plant, and Equipment': 'f_chgppe',
    'Cash Acquisitions': 'f_acqui',
    'Divestitures': 'f_divest',
    'Investment in Mkt and Equity Securities, Total': 'f_invsec',
    'Net (Increase) Decrease in Loans Orig / Sold': 'f_invloan',
    'Other Investing Activities, Total': 'f_invother',
    'Cash from Investing': 'f_cashinv',
    'Total Debt Issued': 'f_debtiss',
    'Short Term Debt Issued, Total': 'f_stdiss',
    'Long-Term Debt Issued, Total': 'f_ltdiss',
    'Total Debt Repaid': 'f_debtrep',
    'Short Term Debt Repaid, Total': 'f_stdpaid',
    'Long-Term Debt Repaid, Total': 'f_ltdpaid',
    'Issuance of Common Stock': 'f_comiss',
    'Repurchase of Common Stock': 'f_comrep',
    'Common & Preferred Stock Dividends Paid': 'f_divpaid',
    'Common Dividends Paid': 'f_comdivcf',
    'Preferred Dividends Paid': 'f_prefdivpaid',
    'Special Dividends Paid': 'f_specdiv',
    'Other Financing Activities': 'f_otherfin',
    'Cash from Financing': 'f_cashfin',
    'Foreign Exchange Rate Adjustments': 'f_fxcost',
    'Miscellaneous Cash Flow Adjustments': 'f_micfadj',
    'Net Change in Cash': 'f_netchgcash',
    'Free Cash Flow': 'pf_fcf',
    'Free Cash Flow per Share': 'pf_fcf_shr',
    'Cash Interest Paid': 'f_cashint',
    'Cash Income Tax Paid (Refund)': 'f_castax',
    'Change In Net Working Capital': 'f_chgnwc',
    'Net Debt Issued / Repaid': 'f_netdebtchg'
  };

  async function extractViaAPI(kid, periodType, currency, dateFrom, dateTo) {
    kid = kid || __koyfinSecurityId();
    periodType = periodType || 'annual';
    currency = currency || 'USD';
    dateFrom = dateFrom || '2016-01-01';
    dateTo = dateTo || '2026-12-31';

    const results = [];

    for (const [label, key] of Object.entries(METRIC_API_KEYS)) {
      try {
        const resp = await fetch(
          'https://app.koyfin.com/api/v3p/data/graph?schema=packed',
          {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: kid,
              key: key,
              currency: currency,
              financialPeriodType: periodType,
              priceFormat: 'standard',
              dateFrom: dateFrom,
              dateTo: dateTo
            })
          }
        );

        if (!resp.ok) {
          results.push({ label, key, error: `HTTP ${resp.status}` });
          continue;
        }

        const data = await resp.json();

        if (data.error) {
          results.push({ label, key, error: data.error.message || data.error });
          continue;
        }

        results.push({
          label,
          key,
          kid: data.KID,
          dates: data.graph.date || [],
          values: data.graph.value || [],
          dataPoints: (data.graph.date || []).length,
          startDate: data.startDate,
          endDate: data.endDate
        });
      } catch (err) {
        results.push({ label, key, error: err.message });
      }
    }

    return {
      ticker: TICKER,
      tab: TAB,
      extractedAt: new Date().toISOString(),
      method: 'api',
      kid: kid,
      periodType: periodType,
      dateFrom: dateFrom,
      dateTo: dateTo,
      metrics: results,
      metricCount: results.length
    };
  }

  // ── 3. Extract from React component state ──────────────────────────
  // Attempts to find the financial data in React's internal state.
  function extractFromReactFiber() {
    const rootEl = document.querySelector('#root');
    if (!rootEl) return { error: 'No #root element found' };

    const containerKey = Object.keys(rootEl).find(k =>
      k.startsWith('__reactContainer$')
    );
    if (!containerKey) return { error: 'No React container found' };

    const fiber = rootEl[containerKey];
    const found = [];

    function walk(f, depth) {
      if (!f || depth > 50) return;

      // Check memoizedState queue
      if (f.memoizedState) {
        let state = f.memoizedState;
        let d = 0;
        while (state && d < 20) {
          if (state.queue && state.queue.lastRenderedState) {
            const s = state.queue.lastRenderedState;
            if (s && typeof s === 'object') {
              const keys = Object.keys(s);
              // Look for states with financial data patterns
              if (keys.length > 2 && keys.length < 50) {
                const str = JSON.stringify(s);
                // Check if this contains cash flow data
                if (keys.some(k => k.includes('Cash') || k.includes('cash') || k === 'CF') ||
                    str.includes('f_nicf') || str.includes('Net Income')) {
                  found.push({
                    depth: depth,
                    keys: keys,
                    sample: str.substring(0, 500)
                  });
                }
              }
            }
          }
          state = state.next;
          d++;
        }
      }

      walk(f.child, depth + 1);
      walk(f.sibling, depth + 1);
    }

    walk(fiber, 0);

    return {
      ticker: TICKER,
      tab: TAB,
      extractedAt: new Date().toISOString(),
      method: 'react_fiber',
      found: found,
      foundCount: found.length
    };
  }

  // ── 4. Extract current period info from URL / DOM ──────────────────
  function extractPageInfo() {
    const url = window.location.href;
    const title = document.title;

    // Determine current tab from URL or title
    let currentTab = 'Unknown';
    if (title.includes('Cash Flow')) currentTab = 'Cash Flow';
    else if (title.includes('Balance Sheet')) currentTab = 'Balance Sheet';
    else if (title.includes('Income Statement')) currentTab = 'Income Statement';

    // Determine period type from DOM
    const periodToggles = document.querySelectorAll('div');
    let currentPeriod = 'unknown';
    for (const el of periodToggles) {
      const text = el.textContent || '';
      if (text.includes('Last 12 Months (LTM)')) currentPeriod = 'LTM';
      else if (text.includes('Quarterly (Q)')) currentPeriod = 'quarterly';
      else if (text.includes('Annual (Y)')) currentPeriod = 'annual';
    }

    return {
      ticker: TICKER,
      tab: currentTab,
      extractedAt: EXTRACTED_AT,
      url: url,
      title: title,
      currentPeriod: currentPeriod,
      kid: url.match(/eq-[\w]+/)?.[0] || null,
      uuid: url.match(/[0-9a-f-]{36}/)?.[0] || null
    };
  }

  // ── Main ────────────────────────────────────────────────────────────
  const pageInfo = extractPageInfo();
  const textData = extractFromPageText();

  return {
    meta: pageInfo,
    textExtraction: textData,
    metricApiKeys: METRIC_API_KEYS,
    _notes: {
      extractViaAPI: 'Call extractViaAPI(kid, periodType) for API-based extraction. Requires auth cookies.',
      extractFromReactFiber: 'Call extractFromReactFiber() to attempt React state introspection.'
    },
    // Export helpers for use via browser-harness
    extractViaAPI: extractViaAPI.toString(),
    extractFromReactFiber: extractFromReactFiber.toString()
  };
})();
