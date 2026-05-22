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
 * extract.js — Koyfin MSFT Ownership data extraction
 * Durable DOM patterns for Koyfin Security Analysis > Ownership
 *
 * Ticker: MSFT (eq-kuqeq3)
 * Captured: 2026-05-17
 */

/* Helper: extract table rows from Koyfin's virtual grid */
function extractKoyfinTable(colDefs, startY) {
  /* colDefs: [{key, x}...] column x-positions and field names */
  /* startY: first data row y position */
  const all = document.querySelectorAll('div');
  const rowYs = [];
  all.forEach(el => {
    const r = el.getBoundingClientRect();
    if (Math.abs(r.x - colDefs[0].x) < 5 && r.y >= startY && r.height === 32) {
      const text = (el.textContent || '').trim();
      if (text && text !== 'Sum' && text.length > 2 && !rowYs.includes(r.y)) {
        rowYs.push(r.y);
      }
    }
  });
  rowYs.sort((a, b) => a - b);
  return rowYs.map(y => {
    const cells = {};
    colDefs.forEach(col => {
      let found = '';
      all.forEach(el => {
        const r = el.getBoundingClientRect();
        if (Math.abs(r.y - y) < 2 && Math.abs(r.x - col.x) < 5 && r.height === 32) {
          const text = (el.textContent || '').trim();
          if (text && text.length < 80) found = text;
        }
      });
      cells[col.key] = found;
    });
    return cells;
  }).filter(row => row[colDefs[0].key]);
}

/* Insider Ownership columns (y=299) */
const INSIDER_COLS = [
  {key: 'name', x: 234},
  {key: 'title', x: 534},
  {key: 'marketValue', x: 834},
  {key: 'pctMarketcap', x: 1014},
  {key: 'sharesHeld', x: 1194},
  {key: 'positionDate', x: 1374}
];

/* Institutional Holdings columns (y=299) */
const INST_COLS = [
  {key: 'holder', x: 234},
  {key: 'value', x: 534},
  {key: 'pctOut', x: 714},
  {key: 'shares', x: 894},
  {key: 'pctPortfolio', x: 1074},
  {key: 'reported', x: 1254}
];

/* Insider Transactions columns (y>855, below the chart) */
const TXN_COLS = [
  {key: 'name', x: 235},
  {key: 'type', x: 775},
  {key: 'category', x: 955},
  {key: 'date', x: 1135},
  {key: 'shares', x: 1295},
  {key: 'change', x: 1475},
  {key: 'value', x: 1655}
];

const result = (function extractKoyfinOwnership() {
  const ticker = __koyfinTicker();
  const securityId = __koyfinSecurityId();
  const url = window.location.href;
  
  const res = {
    ticker: ticker,
    tab: 'Security Analysis > Ownership',
    extracted_at: new Date().toISOString(),
    url: url,
    security_id: securityId,
    data: {}
  };

  try {
    if (url.includes('/insider-ownership/')) {
      res.data.type = 'insider-ownership';
      res.data.insiders = extractKoyfinTable(INSIDER_COLS, 299);
    } else if (url.includes('/insider-transactions/')) {
      res.data.type = 'insider-transactions';
      res.data.transactions = extractKoyfinTable(TXN_COLS, 299);
    } else if (url.includes('/institutional-ownership/')) {
      res.data.type = 'institutional-ownership';
      res.data.institutions = extractKoyfinTable(INST_COLS, 299);
    } else {
      res.data.insiders = extractKoyfinTable(INSIDER_COLS, 299);
    }
  } catch (err) {
    res.error = err.message;
  }
  
  return res;
})();

result;
