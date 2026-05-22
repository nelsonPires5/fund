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
 * extract.js — Koyfin Filings Tab Data Extraction
 *
 * Extracts filing metadata from the Koyfin Security Analysis > News, Filings & Transcripts > Filings page.
 *
 * URL pattern: https://app.koyfin.com/news/cf/{equity_id}
 * Example: https://app.koyfin.com/news/cf/eq-kuqeq3
 *
 * Usage:
 *   1. Navigate to the Filings tab for any ticker on Koyfin
 *   2. Run this script in the browser console (or via browser-harness js())
 *   3. Result is a JSON array of filing objects
 *
 * Data structure per filing:
 *   {
 *     "description":  "Form 8-K - Current report - Item 5.02 Item 9.01",
 *     "formType":     "8-K (Edgar)",
 *     "formCode":     "8-K",
 *     "isEdgar":      true,
 *     "date":         "May 14 '26",
 *     "docType":      "8-K"
 *   }
 *
 * Ticker & tab metadata are attached at the top level:
 *   {
 *     "ticker": "MSFT",
 *     "tab": "Filings",
 *     "extractedAt": "2026-05-17T...",
 *     "url": "https://app.koyfin.com/news/cf/eq-kuqeq3",
 *     "filings": [ ... ]
 *   }
 *
 * Dependencies: None (vanilla JS)
 * Works with: browser-harness, browser console, Puppeteer, Playwright
 */

(function extractKoyfinFilings() {
  'use strict';

  // --- Metadata ---
  const url = document.URL;
  const now = new Date().toISOString();

  // Extract ticker from page
  const tickerEl = document.querySelector('[class*="market-quote-base__ticker"]');
  const ticker = tickerEl ? tickerEl.textContent.trim() : '';

  // --- Extract filing items ---
  // Filings are rendered as groups of 3 <label> elements:
  //   [0] = description (e.g., "Form 8-K - Current report - Item 5.02 Item 9.01")
  //   [1] = form type   (e.g., "8-K (Edgar)")
  //   [2] = date        (e.g., "May 14 '26")
  const allLabels = document.querySelectorAll('label');
  const labels = Array.from(allLabels).map(l => l.textContent.trim());

  // Find where filing data starts: look for first label starting with "Form ",
  // or containing a known SEC form type pattern
  const formPattern = /^(Form |10-Q|10-K|11-K|ARS|SCHEDULE 13G)/;
  let startIdx = -1;
  for (let i = 0; i < labels.length; i++) {
    if (formPattern.test(labels[i]) && labels[i].length > 10) {
      startIdx = i;
      break;
    }
  }

  if (startIdx === -1) {
    // Fallback: look for "(Edgar)" pattern in labels
    for (let i = 0; i < labels.length; i++) {
      if (labels[i].includes('(Edgar)') && i > 0 && labels[i-1].includes('Form')) {
        startIdx = i - 1;
        break;
      }
    }
  }

  if (startIdx === -1) {
    return {
      ticker,
      tab: 'Filings',
      extractedAt: now,
      url,
      filings: [],
      message: 'No filing data found on this page. Ensure you are on the Filings tab of a Koyfin security analysis page.'
    };
  }

  const filings = [];
  for (let i = startIdx; i < labels.length - 2; i += 3) {
    const desc = labels[i];
    const formType = labels[i + 1];
    const dateText = labels[i + 2];

    // Validate: each triples should have meaningful data
    if (desc.length < 5 || formType.length < 2) break;

    // Parse form code
    const formCode = formType.replace(/\s*\(Edgar\)\s*/, '').trim();
    const isEdgar = formType.includes('(Edgar)');

    // Extract document type from description
    let docType = '';
    if (desc.startsWith('Form ')) {
      const parts = desc.split(' ');
      if (parts.length > 1) {
        docType = parts[1];
      }
    } else if (desc.startsWith('10-Q') || desc.startsWith('10-K') || desc.startsWith('11-K') || desc.startsWith('ARS')) {
      docType = desc.split(' ')[0].replace('~', '').trim();
      if (!docType) docType = desc.split('~')[0].trim();
    }

    filings.push({
      description: desc,
      formType,
      formCode,
      isEdgar,
      date: dateText,
      docType
    });
  }

  return {
    ticker,
    tab: 'Filings',
    extractedAt: now,
    url,
    filings
  };
})();
