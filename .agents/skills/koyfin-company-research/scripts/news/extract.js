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
 * Koyfin News Tab — Data Extraction Script
 * 
 * Usage: Paste this into the browser-harness heredoc or browser DevTools console.
 * 
 * Extracts all visible news items from the Koyfin Company News section.
 * Handles the virtual-list lazy loading by scrolling to bottom.
 * 
 * Returns: Array of {title, source, date} objects.
 */

async function extractKoyfinNews() {
  const items = [];

  // 1. Force-load all items by scrolling to bottom repeatedly
  const scrollContainer = document.querySelector('[class*="news-virtual-list"]');
  if (!scrollContainer) {
    console.warn('No virtual list container found');
  } else {
    const scrollStep = () => {
      return new Promise(resolve => {
        const prevScroll = scrollContainer.scrollTop;
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
        setTimeout(() => {
          const loadedMore = scrollContainer.scrollTop > prevScroll;
          resolve(loadedMore);
        }, 300);
      });
    };

    let hasMore = true;
    let attempts = 0;
    while (hasMore && attempts < 5) {
      hasMore = await scrollStep();
      attempts++;
    }
    console.log(`Scrolled ${attempts} times to load items`);
  }

  // 2. Extract items from the DOM
  const newsItems = document.querySelectorAll('[class*="koy-news-item"]');
  
  newsItems.forEach(item => {
    const labels = Array.from(item.querySelectorAll('label'));
    if (labels.length >= 1) {
      const title = labels[0].textContent.trim();
      let source = '';
      let date = '';
      
      if (labels.length === 2) {
        const val = labels[1].textContent.trim();
        if (val.includes('AM') || val.includes('PM') || /'\d{2}/.test(val)) {
          date = val;
        } else {
          source = val;
        }
      } else if (labels.length >= 3) {
        source = labels[1].textContent.trim();
        date = labels[2].textContent.trim();
      }
      
      items.push({ title, source, date });
    }
  });

  return items;
}

// Self-executing wrapper
(async () => {
  try {
    const data = await extractKoyfinNews();
    console.log(`Extracted ${data.length} news items`);
    console.log(JSON.stringify(data, null, 2));
    return data;
  } catch (err) {
    console.error('Extraction failed:', err);
  }
})();
