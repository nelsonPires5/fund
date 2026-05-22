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

// Koyfin Profitability Data Extraction Script v3
// Target: MSFT Security Analysis > Financial Analysis > Profitability
// Extracts all visible rows and columns from the Financial Analysis table

(function() {
  'use strict';

  var result = {
    ticker: __koyfinTicker(),
    tab: 'Profitability',
    extracted_at: new Date().toISOString(),
    page_url: window.location.href,
    page_title: document.title,
    periods: [],
    sections: [],
    metrics: {},
    raw_values: []
  };

  // 1. Locate the table
  var root = document.querySelector('[class*="fa-table__root"]');
  if (!root) { result.error = 'Table root not found'; window._koyfin_extraction = result; return; }

  var scrollArea = root.querySelector('[style*="height"]');
  if (!scrollArea) { result.error = 'Scroll area not found'; window._koyfin_extraction = result; return; }

  // 2. Extract period headers  
  var headerRow = scrollArea.children[0];
  if (headerRow) {
    var periodEls = headerRow.querySelectorAll('[class*="faTable__finLabel"]');
    // Also try alternative class pattern
    if (periodEls.length === 0) {
      periodEls = headerRow.querySelectorAll('[class*="finLabel___"]');
    }
    periodEls.forEach(function(el) {
      var txt = (el.textContent || '').trim();
      if (txt && result.periods.indexOf(txt) === -1) {
        result.periods.push(txt);
      }
    });
  }
  // Filter out "Fiscal Years" label
  result.periods = result.periods.filter(function(p) { return p !== 'Fiscal Years'; });

  // 3. Extract sections and data
  for (var s = 1; s < scrollArea.children.length; s++) {
    var section = scrollArea.children[s];
    if (!section || !section.children) continue;

    var sectionName = null;

    for (var r = 0; r < section.children.length; r++) {
      var rowWrapper = section.children[r];
      if (!rowWrapper) continue;

      // Find the actual row div inside the wrapper
      // The structure is: wrapper > actualRow > [leftSticky, cellGrid, cellGrid, ...]
      var actualRow = null;
      for (var w = 0; w < rowWrapper.children.length; w++) {
        var child = rowWrapper.children[w];
        if (child.className && child.className.indexOf('base-table-row__root') >= 0) {
          actualRow = child;
          break;
        }
      }
      // If wrapper has only 1 child and it's the row itself
      if (!actualRow && rowWrapper.children.length > 0) {
        // Check if the row is the wrapper itself (flat structure)
        if (rowWrapper.className && rowWrapper.className.indexOf('base-table-row__root') >= 0) {
          actualRow = rowWrapper;
        } else if (rowWrapper.children.length === 1) {
          var onlyChild = rowWrapper.children[0];
          if (onlyChild.className && onlyChild.className.indexOf('base-table-row__root') >= 0) {
            actualRow = onlyChild;
          }
        }
      }

      // Check for section header (group header)
      var groupHeader = rowWrapper.querySelector('[class*="groupHeader"]');
      if (groupHeader) {
        sectionName = (groupHeader.textContent || '').trim();
        if (sectionName && result.sections.indexOf(sectionName) === -1) {
          result.sections.push(sectionName);
        }
        continue;
      }

      if (!actualRow) continue;

      // Check if this is a data row with a metric label
      var labelEl = actualRow.querySelector('[class*="default-cell__label"]');
      if (!labelEl) continue;

      var metricName = (labelEl.textContent || '').trim();
      if (!metricName) continue;

      // EBT / EBT Excl rows might be empty (dashes)
      var isDashRow = actualRow.textContent.indexOf('-') >= 0;

      var rowEntry = {section: sectionName, metric: metricName, values: []};

      // Get value cells - they are direct children of actualRow, after the leftStickyCells
      var cells = actualRow.children;
      for (var c = 0; c < cells.length; c++) {
        var cell = cells[c];
        // Skip the left sticky cells area
        if (cell.className && cell.className.indexOf('leftStickyCells') >= 0) continue;
        
        // Check if this cell has a color-value (which indicates a value cell)
        var valueContainer = cell.querySelector('[class*="color-value"]');
        if (!valueContainer) continue;

        // Extract value and unit
        var valueEl = valueContainer.querySelector('[class*="default-cell__label"]');
        var postfixEl = valueContainer.querySelector('[class*="default-cell__postfix"]');

        var value = valueEl ? (valueEl.textContent || '').trim() : null;
        var postfix = postfixEl ? (postfixEl.textContent || '').trim() : '';

        // Treat dashes as null (missing data)
        if (value === '-') value = null;

        rowEntry.values.push({
          value: value,
          unit: postfix || null
        });
      }

      result.raw_values.push(rowEntry);

      // Organize by section
      if (sectionName) {
        if (!result.metrics[sectionName]) result.metrics[sectionName] = {};
        result.metrics[sectionName][metricName] = rowEntry.values.map(function(v) { return v.value; });
      }
    }
  }

  window._koyfin_extraction = result;
  return result;
})();
