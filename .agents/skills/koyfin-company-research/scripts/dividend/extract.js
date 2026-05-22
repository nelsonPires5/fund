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
 * extract.js — Koyfin Security Analysis > Dividend Tab
 *
 * Selector-based extraction for the Dividend snapshot page at:
 *   https://app.koyfin.com/snapshot/dvd/{tickerId}
 *
 * The page is a React SPA.  All dividend data lives in the rendered DOM
 * through standard elements (koy-panel__* classes).  No shadow DOM or
 * cross-origin iframe needed.
 *
 * Usage: paste into browser-harness <<'PY' block as js("""...""") call.
 *
 * Patterns discovered (durable, not pixel-dependent):
 *   Grid container:   .snapshot-dividend__dividendGrid___EdfcT
 *   Summary panels:   div > .koy-panel__stdDataHeader__L39Td + .koy-panel__stdContent__jpVOp
 *   Data cells:       .koy-panel__stdDataCell___hb9cr
 *   Cell label:       .koy-panel__stdDataLabel___z8upW
 *   Cell value:       .koy-panel__stdCellValueResult___Py9IQ
 *   Sub-headers:      .koy-panel__stdSubHeaderCell___jMJ4O  (in grid layout)
 *   Table container:  .dividend-table__root___Wo5Ew
 *   Table rows:       .base-table-row__root___VnXIn.dividend-table__row___Dr5oL
 *   Chart area:       .snapshot-dividend__dividendChart___lR1SP (SVG/Canvas — no DOM data)
 */

(function () {

  var tickerId = window.location.pathname.match(/\/dvd\/(.+)/);
  tickerId = tickerId ? tickerId[1] : 'unknown';

  var extractedAt = new Date().toISOString();
  var result = {
    ticker: __koyfinTicker(),
    tickerId: tickerId,
    tab: 'Dividend',
    url: window.location.href,
    extractedAt: extractedAt,
    summary: {},
    dividends: [],
    hasDividendData: false
  };

  // ---- Summary panels (first 3 children of the grid) ----
  var grid = document.querySelector('.snapshot-dividend__dividendGrid___EdfcT');
  if (!grid) {
    result.error = 'Grid container not found — page may not be a Dividend tab.';
    return result;
  }

  // Panel 0 — Dividend Yield & Frequency
  var panel0 = grid.children[0];
  if (panel0) {
    var cells = panel0.querySelectorAll('.koy-panel__stdDataCell___hb9cr');
    var yieldData = {};
    cells.forEach(function (cell) {
      var label = cell.querySelector('.koy-panel__stdDataLabel___z8upW');
      var value = cell.querySelector('.koy-panel__stdCellValueResult___Py9IQ');
      var lbl = label ? label.textContent.trim() : '';
      var val = value ? value.textContent.trim() : cell.textContent.trim();
      if (lbl && val && lbl !== val) yieldData[lbl] = val;
    });
    result.summary['Dividend Yield & Frequency'] = yieldData;
  }

  // Panel 1 — Dividend Growth (has sub-header grid)
  var panel1 = grid.children[1];
  if (panel1) {
    var growthCells = panel1.querySelectorAll('.koy-panel__stdDataCell___hb9cr');
    var growthData = {};
    growthCells.forEach(function (cell) {
      var label = cell.querySelector('.koy-panel__stdDataLabel___z8upW');
      var value = cell.querySelector('.koy-panel__stdCellValueResult___Py9IQ');
      var lbl = label ? label.textContent.trim() : '';
      var val = value ? value.textContent.trim() : cell.textContent.trim();
      if (lbl && val && lbl !== val) growthData[lbl] = val;
    });

    // Sub-headers (1Y, 3Y, 5Y, 10Y) + values
    var subHeaders = panel1.querySelectorAll('.koy-panel__stdSubHeaderCell___jMJ4O');
    var periods = [];
    subHeaders.forEach(function (sh) {
      var t = sh.textContent.trim();
      if (t) periods.push(t);
    });

    // Annualized growth values (color-value cells)
    var growthValues = panel1.querySelectorAll('.color-value__primary___BjrFP');
    var growthVals = [];
    growthValues.forEach(function (gv) {
      growthVals.push(gv.textContent.trim());
    });

    growthData.annualizedGrowthPeriods = periods;
    growthData.annualizedGrowthValues = growthVals;
    result.summary['Dividend Growth'] = growthData;
  }

  // Panel 2 — Shareholder Yield
  var panel2 = grid.children[2];
  if (panel2) {
    var shCells = panel2.querySelectorAll('.koy-panel__stdDataCell___hb9cr');
    var shData = {};
    shCells.forEach(function (cell) {
      var label = cell.querySelector('.koy-panel__stdDataLabel___z8upW');
      var value = cell.querySelector('.koy-panel__stdCellValueResult___Py9IQ');
      var lbl = label ? label.textContent.trim() : '';
      var val = value ? value.textContent.trim() : cell.textContent.trim();
      if (lbl && val && lbl !== val) shData[lbl] = val;
    });
    result.summary['Shareholder Yield'] = shData;
  }

  // ---- Dividend Payment Schedule Table ----
  var tableContainer = document.querySelector('.dividend-table__root___Wo5Ew');
  if (!tableContainer) {
    result.noTable = true;
    return result;
  }

  // Headers
  var headerCells = tableContainer.querySelectorAll('.table-styles__table__headerCell___gC361 div[style*="font-weight: 700"]');
  var headers = [];
  headerCells.forEach(function (el) {
    var t = el.textContent.trim();
    if (t) headers.push(t);
  });

  // Rows
  var rows = tableContainer.querySelectorAll('.base-table-row__root___VnXIn.dividend-table__row___Dr5oL');
  var dividends = [];
  rows.forEach(function (row) {
    var cells = row.children;
    var rowData = {};
    for (var i = 0; i < Math.min(cells.length, headers.length); i++) {
      rowData[headers[i]] = (cells[i] ? cells[i].textContent.trim() : '');
    }
    dividends.push(rowData);
  });

  result.dividends = dividends;
  result.hasDividendData = dividends.length > 0;
  result.headers = headers;
  result.totalDividendEntries = dividends.length;

  return result;

})();
