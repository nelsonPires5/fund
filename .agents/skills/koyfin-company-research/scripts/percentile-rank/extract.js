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

/*
 * extract.js — Koyfin Percentile Rank tab extraction script
 *
 * Works on https://app.koyfin.com/snapshot/rank/<ticker-id>
 * Extracts all percentile rank data from the DOM, including:
 *   - Tab/period state (Fundamentals vs Performance, 3Y/5Y/10Y/20Y, Country/Region/Global)
 *   - Section headers (Valuation Multiples, Valuation Yields, etc.)
 *   - Metric name, current value, and percentile rank values for each comparison column
 *
 * The percentile rank visualizations use <div class="high-low-band-mini-graphic__dot___jxgGY">
 * elements with a data-rank attribute containing the integer percentile rank (0–100).
 *
 * Usage: paste into browser console on https://app.koyfin.com/snapshot/rank/<ticker-id>
 *        or load via bookmarklet / browser-harness js() call.
 *
 * Output: JSON object with ticker, url, extractedAt, tabs, headerColumns, dataRows
 */

(function extractKoyfinPercentileRanks() {
  'use strict';

  // Bail if not on a rank page
  if (!window.location.pathname.includes('/snapshot/rank/')) {
    console.error('Not a Koyfin Percentile Rank page');
    return null;
  }

  const result = {
    ticker: __koyfinTicker(),
    url: window.location.href,
    tab: 'Percentile Rank',
    extractedAt: new Date().toISOString(),
  };

  // --- Active tab detection ---
  const tabItems = document.querySelectorAll('.koy-tab-item__koyTabItem____PH0o');
  result.tabs = [];
  tabItems.forEach(function (t) {
    var label = t.querySelector('.koy-tab-item__koyTabItem__label___n0rKu');
    result.tabs.push({
      label: label ? label.textContent : '',
      active: t.classList.contains('koy-tab-item__active___QCxcp'),
    });
  });

  // --- Active sub-buttons (Period: 3Y/5Y/10Y/20Y, Region: Country/Region/Global) ---
  var allButtons = document.querySelectorAll(
    '.flex-row-column__flexRow___KMDJ8 button'
  );
  result.activeSubButtons = [];
  allButtons.forEach(function (b) {
    var label = b.querySelector('label');
    if (label && b.classList.contains('base-button__dataActive___mh9m2')) {
      result.activeSubButtons.push(label.textContent);
    }
  });

  // --- Column headers ---
  var headerRow = document.querySelector('.table-styles__table__head___Uu9qm');
  if (headerRow) {
    var headerCells = headerRow.querySelectorAll('[class*="table__headerCell"]');
    result.headerColumns = [];
    headerCells.forEach(function (c) {
      result.headerColumns.push(c.textContent || '');
    });
  }

  // --- Data rows ---
  var scrollContainer = document.querySelector(
    '.table-styles__table__scrollContainer___WBAWY'
  );
  if (!scrollContainer) {
    console.error('Could not find scroll container');
    return result;
  }

  var container = scrollContainer.children[0];
  if (!container) {
    console.error('Could not find inner container');
    return result;
  }

  var rows = [];
  var currentSection = '';

  var sectionKeywords = [
    'Valuation Multiples',
    'Valuation Yields',
    'Margins & Profitability',
    'Leverage',
    'Price Change',
    'Total Return',
    'Annualized Return',
    'Volatility',
    'Sharpe Ratio',
    'Max Drawdown',
    'Best/Worst',
    'Rolling Returns',
  ];

  function isSectionHeader(text, classes) {
    if (classes.includes('table__row')) return false;
    for (var i = 0; i < sectionKeywords.length; i++) {
      if (text.trim() === sectionKeywords[i] || text.startsWith(sectionKeywords[i])) {
        return sectionKeywords[i];
      }
    }
    return null;
  }

  for (var i = 0; i < container.children.length; i++) {
    var child = container.children[i];
    var text = child.textContent || '';
    var classes = child.className || '';

    // Check for section header
    var sectionName = isSectionHeader(text, classes);
    if (sectionName) {
      currentSection = sectionName;
      continue;
    }

    // Skip header row
    if (classes.includes('table__head')) continue;

    // Data rows
    if (classes.includes('table__row')) {
      var cells = child.children;
      var rowData = {
        section: currentSection,
        metric: '',
        currentValue: '',
        percentileRanks: [],
      };

      for (var j = 0; j < cells.length; j++) {
        var cell = cells[j];
        var cellText = (cell.textContent || '').trim();

        if (j === 0) {
          rowData.metric = cellText;
        } else if (j === 1) {
          rowData.currentValue = cellText;
        } else {
          // Find the percentile rank dot
          var dot = cell.querySelector('[data-rank]');
          var rank = dot ? dot.getAttribute('data-rank') : null;
          var upper = dot
            ? dot.classList.contains('high-low-band-mini-graphic__upper___hOCMW')
            : false;

          // Also capture the dot position from CSS left
          var position = null;
          if (dot) {
            var style = dot.getAttribute('style') || '';
            var match = style.match(/left:\s*calc\(([\d.]+)%/);
            if (match) position = parseFloat(match[1]);
          }

          rowData.percentileRanks.push({
            columnIndex: j,
            rank: rank !== null ? parseInt(rank, 10) : null,
            position_pct: position,
            isUpperBand: upper,
          });
        }
      }

      rows.push(rowData);
    }
  }

  result.dataRows = rows;
  return result;
})();
