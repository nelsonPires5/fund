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
 * extract.js — Koyfin Press Releases extractor
 *
 * Paste into browser DevTools Console on the Koyfin Press Releases page
 * (https://app.koyfin.com/news/pr/{tickerId}) to extract all visible items.
 *
 * Works by reading the React-rendered virtual list container.
 *
 * Usage:
 *   1. Navigate to https://app.koyfin.com/news/pr/eq-kuqeq3 (or your ticker)
 *   2. Open DevTools Console (F12)
 *   3. Paste this script and press Enter
 *   4. Result prints as JSON to the console
 *
 * No-press-release-state handling:
 *   If no items are found, the script returns { totalItems: 0, items: [] }
 *   with no error thrown.
 */

(function extractKoyfinPressReleases() {
  'use strict';

  const CONTAINER_SELECTOR = '[class*="news-virtual-list__newsVirtualList__items"]';
  const ITEM_SELECTOR = '[class*="koy-news-item"]';

  const container = document.querySelector(CONTAINER_SELECTOR);
  if (!container) {
    console.warn('[extractKoyfinPressReleases] Container not found. Are you on the Press Releases page?');
    console.log(JSON.stringify({
      url: document.location.href,
      ticker: extractTicker(),
      tab: 'Press Releases',
      extractedAt: new Date().toISOString(),
      totalItems: 0,
      items: []
    }, null, 2));
    return;
  }

  function extractTicker() {
    const el = document.querySelector('[class*="tickerInfo"] [class*="ticker"]');
    return el ? el.innerText.trim() : 'unknown';
  }

  function extractCompany() {
    const el = document.querySelector('[class*="tickerInfo"] [class*="company"]');
    return el ? el.innerText.trim() : 'unknown';
  }

  const items = [];
  for (let i = 0; i < container.children.length; i++) {
    const child = container.children[i];
    const textParts = (child.innerText || '')
      .trim()
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean);

    const newsItem = child.querySelector(ITEM_SELECTOR);
    if (!newsItem) continue;

    items.push({
      index: i,
      title: textParts[0] || '',
      date: textParts[1] || ''
    });
  }

  const output = {
    url: document.location.href,
    ticker: extractTicker(),
    company: extractCompany(),
    tab: 'Press Releases',
    extractedAt: new Date().toISOString(),
    totalItems: items.length,
    items: items
  };

  console.log(JSON.stringify(output, null, 2));
  return output;
})();
