/**
 * Koyfin extraction preflight helpers.
 * Paste/run before a tab extractor, or copy helpers into an extractor.
 */
function koyfinTextClean(value) {
  return (value || '').replace(/\s+/g, ' ').trim();
}

function koyfinSecurityId() {
  const match = location.pathname.match(/\/(eq-[^/?#]+)/);
  return match ? match[1] : null;
}

function koyfinTicker() {
  const title = koyfinTextClean(document.title).replace(/^[^A-Za-z0-9]+\s*/, '');
  const titleMatch = title.match(/^([A-Z][A-Z0-9.\-]{0,11})(?:\s|-|$)/);
  if (titleMatch) return titleMatch[1];

  const selectors = [
    '[class*="market-quote-base__ticker"]',
    '[class*="ticker-title"]',
    '[class*="tickerInfo"] [class*="ticker"]',
    '[class*="ticker-info"] [class*="ticker"]',
    '[class*="securityName"]'
  ];
  for (const selector of selectors) {
    const el = document.querySelector(selector);
    const text = koyfinTextClean(el && el.textContent).replace(/^[^A-Za-z0-9]+\s*/, '');
    const match = text.match(/^([A-Z][A-Z0-9.\-]{0,11})(?:\s|$)/);
    if (match && !['SECURITY', 'ANALYSIS', 'LOG', 'SIGN'].includes(match[1])) return match[1];
  }

  return koyfinSecurityId() || 'UNKNOWN';
}

function koyfinGateStatus() {
  const text = koyfinTextClean(document.body && document.body.innerText);
  if (/only for registered Koyfin users|Please login|Log In|Sign Up Free|Unlock the infinite power of Koyfin/i.test(text)) {
    return 'auth_required';
  }
  if (/Upgrade|Download Available Data|premium|subscription/i.test(text)) {
    return 'premium_or_upgrade_limited';
  }
  return null;
}

function koyfinBaseResult(tab) {
  const gate = koyfinGateStatus();
  const result = {
    ticker: koyfinTicker(),
    security_id: koyfinSecurityId(),
    tab,
    extracted_at: new Date().toISOString(),
    url: location.href,
    status: gate || 'running',
    errors: []
  };

  if (gate === 'auth_required') {
    result.errors.push('Koyfin tab is gated for registered users in the current browser session.');
    result.action_required = 'User must log in to Koyfin in the Chrome session, then rerun this tab.';
    result.user_message = 'This Koyfin tab requires login/registered access. Please log in to Koyfin in Chrome, then I can retry.';
  } else if (gate === 'premium_or_upgrade_limited') {
    result.errors.push('Koyfin shows premium/Upgrade-gated content on this tab.');
    result.action_required = 'If the blocked fields are required, user may need a Koyfin plan with access to those fields.';
    result.user_message = 'Koyfin is showing premium/Upgrade-gated fields here; I can extract visible fields, but blocked fields may require a higher plan.';
  }

  return result;
}
