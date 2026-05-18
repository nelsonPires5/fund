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
 * Koyfin Balance Sheet extractor.
 * Paste into DevTools console while on Security Analysis > Financial Analysis > Balance Sheet.
 * Returns JSON text. Missing rows/cells are preserved as null/empty strings.
 */
(function extractBalanceSheet() {
  const clean = (s) => (s || '').replace(/\s+/g, ' ').trim();
  const titleTicker = clean(document.title).split(' - ')[0];
  const urlId = (location.pathname.match(/\/(eq-[^/]+)/) || [])[1] || null;
  const ticker = titleTicker && titleTicker !== '🐴' ? titleTicker : (urlId || 'UNKNOWN');

  function leafTexts(root) {
    return Array.from(root.querySelectorAll('*'))
      .filter((el) => el.children.length === 0 && clean(el.textContent))
      .map((el) => clean(el.textContent));
  }

  function dedupeAdjacent(values) {
    const out = [];
    for (const value of values) {
      if (!value) continue;
      if (out[out.length - 1] !== value) out.push(value);
    }
    return out;
  }

  const headerCandidates = Array.from(document.querySelectorAll('[class*="headerCell"], [class*="finLabel"], [class*="Header"]'))
    .map((el) => ({ text: clean(el.textContent), rect: el.getBoundingClientRect() }))
    .filter((x) => x.text && /^(Current|LTM|[1-4]Q|FY|CY|\d{4})/.test(x.text));
  const periods = Array.from(new Set(headerCandidates
    .sort((a, b) => a.rect.x - b.rect.x)
    .map((x) => x.text)));

  const rowEls = Array.from(document.querySelectorAll('[class*="faTable__row"], [class*="base-table-row"], [class*="fa-table__row"]'));
  const rows = [];
  for (const row of rowEls) {
    const cells = dedupeAdjacent(leafTexts(row));
    if (cells.length < 2) continue;
    const metric = cells[0];
    if (!metric || /^(LTM|Quarterly|Annual|Current\/LTM)$/.test(metric)) continue;
    rows.push({
      metric,
      values: cells.slice(1).map((v) => v === '-' ? null : v)
    });
  }

  const sections = Array.from(document.querySelectorAll('[class*="group-header"], [class*="GroupHeader"], [class*="title"]'))
    .map((el) => clean(el.textContent))
    .filter((text) => text && text.length < 80);

  const output = {
    ticker,
    tab: 'Balance Sheet',
    extracted_at: new Date().toISOString(),
    url: location.href,
    periods,
    sections: Array.from(new Set(sections)),
    rows,
    status: rows.length ? 'success' : 'no_data',
    errors: rows.length ? [] : ['No balance sheet rows found; confirm the active Koyfin tab and scroll/load state.']
  };

  return JSON.stringify(output, null, 2);
})();
