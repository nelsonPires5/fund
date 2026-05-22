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
 * Koyfin Description Tab Extractor
 * 
 * Extracts structured data from Koyfin's Security Analysis > Description tab.
 * Run in browser console on https://app.koyfin.com/snapshot/des/{security_id}
 * 
 * Usage: paste into DevTools console, result is printed as JSON.
 */

(function extractKoyfinDescription() {
    const grid = document.querySelector('[class*="snapshot-description__gridRoot"]');
    if (!grid) {
        console.error('Description grid not found. Are you on the Description tab?');
        return null;
    }

    const lines = grid.innerText.split('\n').map(l => l.trim()).filter(l => l);
    
    const result = {
        ticker: __koyfinTicker(),
        tab: 'Description',
        extracted_at: new Date().toISOString(),
        url: window.location.href,
        security_id: window.location.pathname.split('/').pop(),
        business_description: '',
        company_profile: {},
        price_data: {},
        key_data: {},
        dividend_info: {},
        related_securities: [],
        sections_found: [],
        sections_missing: []
    };

    let i = 0;

    // Business description
    if (lines[i] === 'Description') i++;
    if (i < lines.length) {
        result.business_description = lines[i];
        result.sections_found.push('business_description');
        i++;
    }

    // Company profile part 1
    const profile1 = ['name','year_founded','headquarters','employees','total_return_since_inception','website'];
    for (const field of profile1) {
        if (i + 1 >= lines.length) break;
        let val = lines[i + 1];
        if (i + 2 < lines.length && lines[i + 2] === '%' && field === 'total_return_since_inception') {
            val += '%'; i++;
        }
        result.company_profile[field] = val;
        i += 2;
    }

    // Profile sub-section
    if (lines[i] === 'Profile') i++;
    const profile2 = ['country','isin','equity_type','exchange','equity_sector','industry','fiscal_year_end','next_earnings_release'];
    for (const field of profile2) {
        if (i + 1 >= lines.length) break;
        result.company_profile[field] = lines[i + 1];
        i += 2;
    }
    result.sections_found.push('company_profile');

    // Skip price chart data points until "Last Price"
    while (i < lines.length && lines[i] !== 'Last Price') i++;

    // Price metrics
    if (lines[i] === 'Last Price') { result.price_data.last_price = lines[++i]; i++; }
    if (lines[i] === '52-Week Low') { i++; result.price_data['52_week_low'] = {date: lines[i], value: lines[i+1]}; i += 2; }
    if (lines[i] === '52-Week High') { i++; result.price_data['52_week_high'] = {date: lines[i], value: lines[i+1]}; i += 2; }
    if (lines[i] === '1Y Total Return') {
        i++;
        let val = lines[i];
        if (i + 1 < lines.length && lines[i + 1] === '%') { val += '%'; i++; }
        result.price_data['1y_total_return'] = val;
        i++;
    }
    result.sections_found.push('price_data');

    // Key data
    if (lines[i] === 'Key Data') i++;
    const keyFields = ['market_cap','enterprise_value','shares_out','average_10d_volume','sales','sales_5y_cagr','ebitda','ebitda_5y_cagr','net_income','ni_5y_cagr'];
    for (const field of keyFields) {
        if (i + 1 >= lines.length) break;
        let val = lines[i + 1];
        let unit = '';
        if (val === '$' && i + 2 < lines.length) {
            val = '$' + lines[i + 2];
            if (i + 3 < lines.length && ['B','M','%','K'].includes(lines[i + 3])) { unit = lines[i + 3]; i++; }
            i++;
        } else if (i + 2 < lines.length && ['B','M','%','K'].includes(lines[i + 2])) {
            unit = lines[i + 2]; i++;
        }
        result.key_data[field] = (val + ' ' + unit).trim();
        i += 2;
    }
    result.sections_found.push('key_data');

    // Dividend info
    if (lines[i] === 'Dividend Information') i++;
    const divFields = ['div_yield','payout_ratio','dps','dps_5y_cagr'];
    for (const field of divFields) {
        if (i + 1 >= lines.length) break;
        let val = lines[i + 1];
        if (i + 2 < lines.length && lines[i + 2] === '%') { val += '%'; i++; }
        result.dividend_info[field] = val;
        i += 2;
    }
    result.sections_found.push('dividend_info');

    // Related securities
    if (lines[i] === 'Related Securities') i++;
    while (i + 1 < lines.length) {
        const ticker = lines[i];
        const exchange = lines[i + 1];
        if (ticker.startsWith('.fak.') || ticker.startsWith('.fa-')) { i++; continue; }
        if (ticker.length > 20) { i++; continue; }
        // Stop at next section header (safety)
        if (['Description','Name','Profile','Price Data','Key Data','Dividend Information'].includes(ticker)) break;
        result.related_securities.push({ticker, exchange});
        i += 2;
    }
    result.sections_found.push('related_securities');

    console.log(JSON.stringify(result, null, 2));
    return result;
})();
