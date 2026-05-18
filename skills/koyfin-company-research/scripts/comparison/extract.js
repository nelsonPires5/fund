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
 * extract.js — Koyfin Comparison Graph Data Extraction
 * 
 * Extracts structured comparison data from the rendered SVG chart.
 * Works on the Koyfin Comparison page at /charts/gc/{equityId}
 * 
 * The Koyfin app uses Web Components, so DOM querySelector cannot reach
 * elements inside shadow roots. This script works by serializing the chart
 * SVG (which includes shadow DOM content) and parsing the legend tables
 * embedded as <foreignObject> elements.
 * 
 * Usage:
 *   1. Navigate to https://app.koyfin.com/charts/gc/eq-kuqeq3
 *   2. Run in browser-harness:
 *      browser-harness <<'PY'
 *        with open('/tmp/MSFT/comparison/extract.js') as f:
 *          script = f.read()
 *        result = js(script)
 *        print(result)
 *      PY
 * 
 *   3. Or in browser DevTools Console, paste and execute.
 */

// Step 1: Locate the chart SVG
// The chart is a direct child of a deeply nested div structure.
// Try multiple approaches:
let svg = null;

// Approach A: Find by known path in the base-container layout
try {
  svg = document.querySelector('section')
    ?.children[1]?.children[1]?.children[0]?.children[0]
    ?.children[1]?.children[0]?.children[1]?.children[1]
    ?.children[0]?.children[0]?.children[0]?.children[0]
    ?.children[0];
  if (svg && svg.tagName === 'svg') {
    // Found via path
  } else {
    svg = null;
  }
} catch(e) { svg = null; }

// Approach B: Find by dimension (the chart SVG is 1480px wide)
if (!svg) {
  const allSvg = document.querySelectorAll('svg');
  for (const s of allSvg) {
    const w = parseInt(s.getAttribute('width'));
    if (!svg || (w * parseInt(s.getAttribute('height') || '0')) > ((parseInt(svg.getAttribute('width') || '0')) * (parseInt(svg.getAttribute('height') || '0')))) { svg = s; }
  }
}

if (!svg) {
  console.error('Comparison chart SVG not found');
  const result = {
    ticker: __koyfinTicker(),
    tab: 'Security Analysis > Graphs > Comparison',
    url: window.location.href,
    extracted_at: new Date().toISOString(),
    error: 'Comparison chart SVG not found. Make sure you are on the Comparison page.',
    panels: [],
    tickers: []
  };
  // For browser-harness, return JSON string
  if (typeof process !== 'undefined') {
    console.log(JSON.stringify(result, null, 2));
  }
}

// Step 2: Serialize SVG to string to bypass shadow DOM boundaries
const svgHTML = svg.outerHTML;

// Step 3: Parse the foreignObject legend blocks
const metricTitles = [
  'Price Change %',
  'Price / Earnings - P/E (NTM)',
  'EV / EBITDA (NTM)',
  'EV / Sales (NTM)'
];

// Match foreignObject blocks
const foRegex = /<foreignObject[^>]*>([\s\S]*?)<\/foreignObject>/g;
let foMatch;
const panels = [];

while ((foMatch = foRegex.exec(svgHTML)) !== null) {
  const foContent = foMatch[1];
  
  // Extract title
  const titleMatch = foContent.match(
    /class="svg-legend-styles__title[^"]*"[^>]*>([^<]+)/
  );
  if (!titleMatch) continue;
  
  const title = titleMatch[1].trim();
  if (!metricTitles.includes(title)) continue;
  
  // Extract series items
  const itemRegex = /class="svg-legend-styles__item[^"]*"[^>]*>([\s\S]*?)<\/div>/g;
  let itemMatch;
  const series = [];
  
  while ((itemMatch = itemRegex.exec(foContent)) !== null) {
    const itemHTML = itemMatch[1];
    
    // Extract ticker, company, value from the nested divs
    const divs = itemHTML.match(/<div[^>]*>([^<]*)<\/div>/g);
    if (divs && divs.length >= 4) {
      const ticker = divs[0].replace(/<[^>]+>/g, '').trim();
      const company = divs[1].replace(/<[^>]+>/g, '').trim();
      const value = divs[3].replace(/<[^>]+>/g, '').trim();
      
      // Extract border color
      const colorMatch = itemMatch[1].match(
        /border-left-color:\s*([^;]+)/
      );
      const color = colorMatch ? colorMatch[1].trim() : '';
      
      series.push({ ticker, company, value, color });
    }
  }
  
  panels.push({ metric: title, series });
}

// Step 4: Extract tickers from sidebar (this is accessible via DOM)
const tickers = [];
try {
  const sidebarItems = document.querySelectorAll('.chart-sidebar-styles__listItem');
  sidebarItems.forEach(item => {
    const securityEl = item.querySelector('.chart-sidebar-styles__security');
    if (securityEl) {
      const tickerEl = securityEl.querySelector('.ticker-title');
      const nameEl = securityEl.querySelector('.chart-sidebar-styles__name');
      const ticker = tickerEl
        ? tickerEl.textContent.trim().split('\n')[0].trim()
        : '';
      const name = nameEl
        ? nameEl.getAttribute('title') || nameEl.textContent.trim()
        : '';
      if (ticker) {
        tickers.push({ ticker, name });
      }
    }
  });
} catch(e) {
  console.warn('Could not extract tickers from sidebar:', e);
}

// Step 5: Extract x-axis labels (dates) from SVG
const xAxisLabels = [];
const dateRegex = /(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d+/g;
let dateMatch;
while ((dateMatch = dateRegex.exec(svgHTML)) !== null) {
  if (!xAxisLabels.includes(dateMatch[0])) {
    xAxisLabels.push(dateMatch[0]);
  }
}

// Step 6: Build result
const result = {
  ticker: __koyfinTicker(),
  tab: 'Security Analysis > Graphs > Comparison',
  url: window.location.href,
  extracted_at: new Date().toISOString(),
  metadata: {
    svgDimensions: {
      width: svg.getAttribute('width'),
      height: svg.getAttribute('height')
    },
    xAxisLabels: xAxisLabels
  },
  tickers: tickers,
  panels: panels
};

// Output result
if (typeof process !== 'undefined') {
  // Running in Node/browser-harness
  console.log(JSON.stringify(result, null, 2));
} else {
  // Running in browser DevTools
  console.table(result.panels.map(p => ({
    Metric: p.metric,
    Entries: p.series.length
  })));
  console.log('Full data:', result);
  // Copy to clipboard
  copy(JSON.stringify(result, null, 2));
  console.log('Data copied to clipboard!');
}
