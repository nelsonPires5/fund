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
 * MSFT Intraday Data Extraction — Koyfin Graph API
 *
 * This script extracts intraday OHLCV data for MSFT from the Koyfin graph API.
 * It handles the core data source, the visible table, and graceful degradation.
 *
 * Usage: Run in browser devtools console on https://app.koyfin.com/charts/gip/eq-kuqeq3
 *        Or paste into CDP Runtime.evaluate.
 *
 * The script below is organized in three tiers:
 *   Tier 1 (primary): Fetch from the Koyfin API directly
 *   Tier 2 (fallback): Read data from the visible data table (DOM)
 *   Tier 3 (metadata): Extract chart metadata from the SVG
 */

// =============================================================================
// CONFIGURATION
// =============================================================================
const CONFIG = {
  ticker: __koyfinTicker(),
  kid: __koyfinSecurityId(),
  apiUrl: 'https://app.koyfin.com/api/v3/data/graph?schema=packed',
  periods: ['1d', '2d', '3d', '4d', '5d', '6d', '7d', '8d', '9d', '10d'],
  defaultPeriod: '1d'
};

// =============================================================================
// TIER 1: Fetch from Koyfin Graph API
// =============================================================================

/**
 * Fetch intraday OHLCV data from Koyfin's private API.
 *
 * @param {string} kid - Koyfin security ID (e.g., "eq-kuqeq3")
 * @param {string} dateFrom - Start date "YYYY-MM-DD"
 * @param {string} dateTo - End date "YYYY-MM-DD"
 * @param {string} priceFormat - "standard" | "adj"
 * @returns {Promise<Object>} { KID, id, category, startDate, endDate, graph, error }
 */
async function fetchIntradayGraph(kid, dateFrom, dateTo, priceFormat = 'standard') {
  const response = await fetch(CONFIG.apiUrl, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json, text/plain, */*',
    },
    body: JSON.stringify({
      id: kid,
      key: 'p_live',
      dateFrom,
      dateTo,
      priceFormat
    })
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }

  return await response.json();
}

/**
 * Extract the actual OHLCV arrays from the API response.
 *
 * @param {Object} apiResponse - Raw API response
 * @returns {Array<{timestamp: string, open: number, high: number, low: number, close: number, volume: number}>}
 */
function extractOhlcvSeries(apiResponse) {
  // Handle no-data error
  if (apiResponse.error && apiResponse.error.code === 'KOY_003') {
    console.warn('[extract] No data in selected time range:', apiResponse.error.message);
    return [];
  }

  const graph = apiResponse.graph;
  if (!graph || !graph.date || graph.date.length === 0) {
    console.warn('[extract] Empty or missing graph data');
    return [];
  }

  const { date, open, high, low, close, volume } = graph;
  const bars = [];

  for (let i = 0; i < date.length; i++) {
    bars.push({
      timestamp: date[i],
      open: open[i],
      high: high[i],
      low: low[i],
      close: close[i],
      volume: volume[i]
    });
  }

  return bars;
}

/**
 * High-level fetch + extract for a given period.
 */
async function getIntradayData(kid = CONFIG.kid, daysBack = 30) {
  const now = new Date();
  const dateTo = now.toISOString().split('T')[0];
  const dateFrom = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000)
    .toISOString().split('T')[0];

  const raw = await fetchIntradayGraph(kid, dateFrom, dateTo);
  const bars = extractOhlcvSeries(raw);

  return {
    ticker: CONFIG.ticker,
    kid,
    dateFrom,
    dateTo,
    totalBars: bars.length,
    extractedAt: new Date().toISOString(),
    apiResponse: {
      startDate: raw.startDate,
      endDate: raw.endDate,
      error: raw.error
    },
    data: bars.slice(0, 10), // sample only; full data is large
    _fullDataAvailable: bars.length
  };
}

// =============================================================================
// TIER 2: Fallback — Read Data Table from DOM
// =============================================================================

/**
 * Read visible rows from the Intraday price table.
 * Requires the "Show Table" toggle to be active.
 *
 * @returns {Array<{date: string, price: number}>}
 */
function readTableData() {
  const rows = document.querySelectorAll('[class*="table-styles__table__row"]');
  const data = [];

  for (const row of rows) {
    const cells = row.querySelectorAll('[class*="dataCell"]');
    if (cells.length >= 2) {
      const dateStr = (cells[0].textContent || '').trim();
      const priceStr = (cells[1].textContent || '').trim();
      const price = parseFloat(priceStr);

      if (dateStr && !isNaN(price)) {
        data.push({ date: dateStr, price });
      }
    }
  }

  return data;
}

/**
 * Check if the data table is visible.
 */
function isTableVisible() {
  const toggle = document.querySelector('[class*="table-styles__table"]');
  if (!toggle) return false;
  const rect = toggle.getBoundingClientRect();
  return rect.width > 0 && rect.height > 0;
}

// =============================================================================
// TIER 3: Extract Chart Metadata from SVG
// =============================================================================

/**
 * Read visible price axis labels and time labels from the chart SVG.
 *
 * @returns {{priceLabels: number[], timeLabels: string[], dateLabels: string[]}}
 */
function extractChartMetadata() {
  const svgs = document.querySelectorAll('svg');
  let chartSvg = null;
  let maxArea = 0;

  // Find the largest SVG (the chart)
  for (const svg of svgs) {
    const rect = svg.getBoundingClientRect();
    const area = rect.width * rect.height;
    if (area > maxArea) {
      maxArea = area;
      chartSvg = svg;
    }
  }

  if (!chartSvg) return { priceLabels: [], timeLabels: [], dateLabels: [] };

  const texts = chartSvg.querySelectorAll('text, tspan');
  const priceLabels = [];
  const timeLabels = [];
  const dateLabels = [];

  for (const el of texts) {
    const t = (el.textContent || '').trim();
    if (!t) continue;

    // Price labels: numeric with decimal (e.g., "414.00")
    if (/^\d+\.\d{2}$/.test(t)) {
      priceLabels.push(parseFloat(t));
    }
    // Time labels: H:MM or HH:MM format
    else if (/^\d{1,2}:\d{2}$/.test(t)) {
      timeLabels.push(t);
    }
    // Date labels: M/D format
    else if (/^\d{1,2}\/\d{1,2}$/.test(t)) {
      dateLabels.push(t);
    }
  }

  return {
    priceLabels: priceLabels.sort((a, b) => a - b),
    timeLabels,
    dateLabels
  };
}

// =============================================================================
// MAIN EXTRACTION
// =============================================================================

async function extractAll() {
  const result = {
    ticker: CONFIG.ticker,
    tab: 'Intraday (gip)',
    extractedAt: new Date().toISOString(),
    tier1_api: null,
    tier2_table: null,
    tier3_svg_metadata: null,
    errors: []
  };

  // Tier 1: API
  try {
    const apiData = await getIntradayData();
    result.tier1_api = apiData;
  } catch (err) {
    result.errors.push(`Tier 1 (API) failed: ${err.message}`);
  }

  // Tier 2: Table (if visible)
  try {
    if (isTableVisible()) {
      result.tier2_table = {
        visible: true,
        rows: readTableData()
      };
    } else {
      result.tier2_table = { visible: false, message: 'Table not toggled. Click "Show Table" first.' };
    }
  } catch (err) {
    result.errors.push(`Tier 2 (Table) failed: ${err.message}`);
  }

  // Tier 3: SVG metadata
  try {
    result.tier3_svg_metadata = extractChartMetadata();
  } catch (err) {
    result.errors.push(`Tier 3 (SVG) failed: ${err.message}`);
  }

  return result;
}

// Self-execute if loaded directly
if (typeof window !== 'undefined' && window.document) {
  extractAll().then(result => {
    console.log('=== Koyfin MSFT Intraday Extraction ===');
    console.log(JSON.stringify(result, null, 2));
    console.log('=======================================');
  }).catch(err => {
    console.error('Extraction failed:', err);
  });
}
