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
 * extract.js — Koyfin Transcripts Tab Data Extraction
 * 
 * Run in browser console on https://app.koyfin.com/news/ts/eq-*
 * Extracts all visible transcript metadata from the virtual list.
 * Handles: populated list, partially loaded, or empty/no-transcripts state.
 * 
 * Usage:
 *   copy(JSON.stringify(extractTranscripts(), null, 2))
 */

(function extractTranscripts() {
  'use strict';

  const result = {
    ticker: __koyfinTicker(),
    tab: 'News, Filings & Transcripts > Transcripts',
    extracted_at: new Date().toISOString(),
    url: window.location.href,
    transcripts: [],
    count: 0,
    state: 'unknown',
    errors: []
  };

  try {
    // 1. Find the virtual list container
    const container = document.querySelector(
      '.news-virtual-list__newsVirtualList__items___M4noe'
    );

    if (!container) {
      // Check if the page/tab exists at all
      const transcriptHeader = document.querySelector('.koy-section-header');
      const pageBody = document.body ? document.body.textContent : '';

      if (pageBody.includes('Transcripts') && pageBody.includes('Earnings Call')) {
        result.state = 'dom_container_missing_but_content_present';
        result.errors.push('Virtual list container not found via CSS selector, but transcript content exists in DOM');
      } else if (pageBody.includes('Transcripts')) {
        result.state = 'transcripts_header_present_empty';
        result.errors.push('Transcripts header found but no items in list');
      } else if (pageBody.includes('login') || pageBody.includes('sign in') || pageBody.includes('Log In')) {
        result.state = 'auth_required';
        result.errors.push('Page redirected to login — authentication required');
      } else {
        result.state = 'no_transcripts_content';
        result.errors.push('No transcript content found on page');
      }

      return result;
    }

    // 2. Count children (total items rendered, even if some off-screen)
    const totalChildren = container.children.length;

    // 3. Extract items
    const items = container.querySelectorAll('.koy-news-item__koyNewsItem___StpWe');

    if (!items || items.length === 0) {
      result.state = 'container_empty';
      result.count = 0;
      result.errors.push('Container found but no transcript items in DOM');
      return result;
    }

    // Date regex: matches "Mon DD 'YY" at end of string
    const dateRegex = /([A-Z][a-z]{2}\s+\d{1,2})\s+'(\d{2})$/;

    items.forEach(function(item, idx) {
      try {
        const label = item.querySelector('label');
        const title = label ? label.textContent.trim() : '';

        // Third child has category + date concatenated
        const thirdChild = item.children[2];
        const restText = thirdChild
          ? thirdChild.textContent.trim().replace(/\s+/g, ' ')
          : '';

        let category = '';
        let dateStr = '';

        // Parse date from end of third child text
        const match = restText.match(dateRegex);
        if (match) {
          dateStr = match[0];
          category = restText.substring(0, match.index).trim();
        } else {
          category = restText;
        }

        result.transcripts.push({
          index: idx,
          title: title,
          category: category,
          date: dateStr
        });
      } catch (itemErr) {
        result.errors.push('Error parsing item ' + idx + ': ' + itemErr.message);
      }
    });

    result.count = result.transcripts.length;
    result.state = result.count > 0 ? 'populated' : 'empty';

  } catch (err) {
    result.state = 'extraction_error';
    result.errors.push(err.message);
  }

  return result;
})();
