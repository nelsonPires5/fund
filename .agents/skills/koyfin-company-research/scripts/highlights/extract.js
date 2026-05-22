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
 * Koyfin MSFT Highlights Data Extractor
 * 
 * Extracts financial data from the Koyfin Security Analysis > Financial Analysis >
 * Highlights page for the current ticker.
 * 
 * Usage: paste into browser console on the Highlights page, or
 *        inject via browser-harness:
 *          browser-harness <<'PY'
 *          data = js(open("/tmp/MSFT/highlights/extract.js").read())
 *          print(json.dumps(data, indent=2))
 *          PY
 * 
 * Output: returns a JSON object with ticker, tab, extracted_at, fiscal_periods,
 *         and rows of financial data.
 */

(function() {
  'use strict';

  const result = {
    ticker: null,
    tab: 'Financial Analysis > Highlights',
    extracted_at: new Date().toISOString(),
    url: location.href,
    title: document.title,
    fiscal_periods: [],
    rows: [],
    controls: {}
  };

  // --- 1. Extract ticker from page ---
  const activeTickerEl = document.querySelector(
    '.navi-panel-ticker-info__ticker___p_8hW, ' +
    '[class*="tickerInfo"] [class*="ticker"], ' +
    '[class*="ticker-info"] [class*="ticker"]'
  );
  if (activeTickerEl) {
    result.ticker = activeTickerEl.innerText.trim();
  } else {
    // Fallback: look for ticker in the top header
    const tickerMatch = document.title.match(/^([A-Z]+)\s*-/);
    if (tickerMatch) result.ticker = tickerMatch[1];
  }

  // --- 2. Extract controls state ---
  const activePeriodBtn = document.querySelector(
    '[class*="active"][class*="period"], ' +
    'button[class*="active"], ' +
    '[class*="toggle"] [class*="active"]'
  );
  if (activePeriodBtn) {
    result.controls.active_period = activePeriodBtn.innerText.trim();
  }

  // Detect active sub-tab
  const activeTab = document.querySelector(
    '[class*="tabBar"] [class*="active"], ' +
    '[class*="sub-tab"] [class*="active"]'
  );
  if (activeTab) {
    result.controls.active_sub_tab = activeTab.innerText.trim();
  }

  // --- 3. Extract fiscal period column headers ---
  const fiscalPeriodsHeader = Array.from(
    document.querySelectorAll('div, span')
  ).find(el => el.innerText.trim() === 'Fiscal Quarters' || 
               el.innerText.trim() === 'Fiscal Periods' ||
               el.innerText.trim() === 'Fiscal Years');

  if (fiscalPeriodsHeader) {
    // Find the container with period labels — typically a sibling or parent
    let container = fiscalPeriodsHeader.closest('div');
    if (container) {
      // Look for all period-like labels (matching pattern like "1Q FY2024", "Current/LTM")
      const periodLabels = container.querySelectorAll(
        'span, div, label'
      );
      const periods = [];
      periodLabels.forEach(el => {
        const txt = el.innerText.trim();
        if (
          /^\d+(st|nd|rd|th)?\s*(Q|Half|H)\s*FY\d{4}$/i.test(txt) ||
          /^(Current\/LTM|LTM|TTM|FY\d{4})$/i.test(txt)
        ) {
          periods.push(txt);
        }
      });
      if (periods.length > 0) {
        result.fiscal_periods = periods;
      }
    }
  }

  // Fallback: scrape periods from the page text
  if (result.fiscal_periods.length === 0) {
    const bodyText = document.body.innerText;
    const periodSection = bodyText.match(/Fiscal (?:Quarters|Periods|Years)[\s\S]*?(?=\n(?:Key Financials|Financial Highlights|$))/);
    if (periodSection) {
      const periods = periodSection[0]
        .split('\n')
        .slice(1) // skip the header
        .filter(t => t.trim().length > 0 && /[A-Z]/.test(t));
      result.fiscal_periods = periods;
    }
  }

  // --- 4. Extract data rows ---
  // Strategy: find the data table by looking for "Key Financials" header
  // then walk through sibling rows
  
  const allDivs = document.querySelectorAll('div');
  let dataTableContainer = null;

  for (const div of allDivs) {
    const txt = div.innerText.trim();
    if (txt.startsWith('Key Financials') && txt.length < 100) {
      dataTableContainer = div;
      break;
    }
  }

  if (dataTableContainer) {
    // Walk up to find the actual table/data container
    let container = dataTableContainer;
    // Try to find the grid/table container
    const grid = container.closest('[class*="grid"], [class*="table"], [class*="data"], [class*="content"]') ||
                 container.parentElement;
    
    if (grid) {
      // Get all direct text-bearing elements
      const allChildren = grid.querySelectorAll('div, span');
      const rowLabels = new Set([
        'Total Revenues', 'YoY Growth %', 'Gross Profit', 
        'Gross Profit Margin', 'EBITDA', 'EBITDA Margin',
        'Net Income', 'Net Income Margin', 'Diluted EPS',
        'Price / Earnings - P/E', 'Market Capitalization',
        'Cash & Equivalents', 'Total Debt', 'Preferred Equity',
        'Minority Interest', 'Enterprise Value - EV',
        'Cash from Operations', 'Capital Expenditure',
        'Capital Structure', 'Cash Flow Analysis', 'Key Financials'
      ]);

      let currentSection = null;
      let currentRow = null;

      allChildren.forEach(el => {
        const txt = el.innerText.trim();
        if (!txt) return;
        
        // Detect section headers
        if (txt === 'Key Financials' || txt === 'Capital Structure' || txt === 'Cash Flow Analysis') {
          currentSection = txt;
          return;
        }

        // Detect row labels
        if (rowLabels.has(txt) && el.children.length === 0) {
          currentRow = { label: txt, section: currentSection, values: [] };
          result.rows.push(currentRow);
          return;
        }

        // Collect values for current row
        if (currentRow && el.children.length === 0) {
          // Check if this looks like a financial value
          if (
            /^[\d,]+\.?\d*\s*[BMT]?$/.test(txt) ||      // "86.9 B", "3,134.21 B"
            /^\(?[\d,]+\.?\d*\)?\s*%$/.test(txt) ||      // "(8.33)%", "5.40%"
            /^\(?[\d,]+\.?\d*\)?\s*x$/.test(txt) ||       // "43.0 x", "25.1 x"
            /^[\d,]+\.?\d*$/.test(txt) ||                  // "86.9"
            txt === '-'                                     // empty value
          ) {
            // Only add if we haven't already collected too many for this row
            // (guard against collecting non-table text)
            currentRow.values.push(txt);
          }
        }
      });

      // Clean up: limit values to match number of fiscal periods
      result.rows.forEach(row => {
        if (row.values.length > result.fiscal_periods.length) {
          row.values = row.values.slice(0, result.fiscal_periods.length);
        }
      });

      // Remove rows that didn't collect any values
      result.rows = result.rows.filter(row => row.values.length > 0);
    }
  }

  // --- 5. Fallback: simple text parsing if DOM extraction fails ---
  if (result.rows.length === 0) {
    const bodyText = document.body.innerText;
    const lines = bodyText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    
    const knownLabels = [
      'Total Revenues', 'YoY Growth %', 'Gross Profit', 
      'Gross Profit Margin', 'EBITDA', 'EBITDA Margin',
      'Net Income', 'Net Income Margin', 'Diluted EPS',
      'Price / Earnings - P/E', 'Market Capitalization',
      'Cash & Equivalents', 'Total Debt', 'Preferred Equity',
      'Minority Interest', 'Enterprise Value - EV',
      'Cash from Operations', 'Capital Expenditure'
    ];

    let i = 0;
    while (i < lines.length) {
      if (knownLabels.includes(lines[i])) {
        const label = lines[i];
        const values = [];
        i++;
        // Collect following numeric values until we hit the next known label or section
        while (i < lines.length && !knownLabels.includes(lines[i]) && 
               lines[i] !== 'Key Financials' && lines[i] !== 'Capital Structure' && 
               lines[i] !== 'Cash Flow Analysis') {
          if (
            /^[\d,]+\.?\d*\s*[BMT]?$/.test(lines[i]) ||
            /^\(?[\d,]+\.?\d*\)?\s*%$/.test(lines[i]) ||
            /^\(?[\d,]+\.?\d*\)?\s*x$/.test(lines[i]) ||
            lines[i] === '-'
          ) {
            values.push(lines[i]);
          }
          i++;
        }
        if (values.length > 0) {
          result.rows.push({ label, section: null, values });
        }
      } else {
        i++;
      }
    }
  }

  // --- 6. Compute row count explicitly ---
  result.row_count = result.rows.length;
  result.period_count = result.fiscal_periods.length;

  return result;
})();
