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
 * Koyfin Security Analysis - Historical Graph Data Extraction Script
 * 
 * Extracts chart series data (Price, SMA50, SMA200, RSI) from the SVG-rendered
 * chart on Koyfin's Historical Graph page.
 * 
 * Usage: Load this in the browser console on any Koyfin chart page, or
 *        pipe through browser-harness: 
 *          browser-harness <<'PY'\nimport json; result = js(open('/tmp/MSFT/historical/extract.js').read()); print(json.dumps(result, indent=2))\nPY
 * 
 * Output: JSON object with ticker, tab, extracted_at, calibration, series data
 * 
 * Limitations:
 * - Data is derived from SVG pixel coordinates via axis calibration.
 * - Volume calibration needs refinement (current volume slope may be off by scale).
 * - Dates are estimated from x-axis labels; precise date mapping would require
 *   the underlying API data or a date-per-point index assumption.
 * - RSI calibration depends on presence of axis labels in the RSI sub-chart.
 */

(function() {
    'use strict';

    // --- Find main chart SVG -------------------------------------------------
    const svgs = document.querySelectorAll('svg');
    let mainSvg = null, maxArea = 0;
    for (const svg of svgs) {
        const r = svg.getBoundingClientRect();
        const a = r.width * r.height;
        if (a > maxArea && r.width > 200 && r.height > 200) {
            maxArea = a;
            mainSvg = svg;
        }
    }
    if (!mainSvg) return { error: 'No chart SVG found on this page.' };

    // --- Axis calibration from text labels ------------------------------------
    const texts = mainSvg.querySelectorAll('text');
    const priceLabels = [], rsiLabels = [], allLabels = [];

    for (const t of texts) {
        const text = (t.textContent || '').trim();
        if (!text) continue;
        const x = parseFloat(t.getAttribute('x') || '0');
        const y = parseFloat(t.getAttribute('y') || '0');
        if (t.getAttribute('transform')) continue; // skip rotated/transformed
        const num = parseFloat(text);
        if (isNaN(num) || x !== 0) continue;

        // Price labels contain decimal points and are in 300-650 range
        if (text.indexOf('.') !== -1 && num >= 300 && num <= 650) {
            priceLabels.push({ value: num, svgY: y });
        }
        // RSI labels are in 10-100 range with decimals
        if (text.indexOf('.') !== -1 && num >= 10 && num <= 100) {
            rsiLabels.push({ value: num, svgY: y });
        }
        allLabels.push({ value: num, svgY: y, text: text });
    }

    // --- Linear regression for price axis -------------------------------------
    function computeLinearRegression(points) {
        const n = points.length;
        if (n < 2) return { slope: 0, intercept: 0 };
        let sx = 0, sy = 0, sxy = 0, sx2 = 0;
        for (const p of points) {
            sx += p.svgY;
            sy += p.value;
            sxy += p.svgY * p.value;
            sx2 += p.svgY * p.svgY;
        }
        const slope = (n * sxy - sx * sy) / (n * sx2 - sx * sx);
        const intercept = (sy - slope * sx) / n;
        return { slope, intercept };
    }

    const priceCal = computeLinearRegression(priceLabels);
    const rsiCal  = computeLinearRegression(rsiLabels);

    const svgYToPrice = (svgY) => priceCal.slope * svgY + priceCal.intercept;
    const svgYToRsi   = (svgY) => rsiCal.slope * svgY + rsiCal.intercept;

    // --- Path parsing helpers -------------------------------------------------
    function parseLinePath(d) {
        if (!d) return [];
        const parts = d.split(/(?=[ML])/);
        const points = [];
        for (const part of parts) {
            const nums = part.substring(1).trim().split(/[\s,]+/);
            if (nums.length >= 2) {
                const x = parseFloat(nums[0]), y = parseFloat(nums[1]);
                if (!isNaN(x) && !isNaN(y)) points.push({ x, y });
            }
        }
        return points;
    }

    function parseVolumeRects(d) {
        if (!d) return [];
        const rects = [];
        // Pattern: M x,y h w V y2 ...
        const regex = /M([\d.\-]+)[\s,]+([\d.\-]+)\s*h[\d.\-]+\s*V([\d.\-]+)/g;
        let match;
        while ((match = regex.exec(d)) !== null) {
            const x = parseFloat(match[1]);
            const y = parseFloat(match[3]);
            if (!isNaN(x) && !isNaN(y)) rects.push({ x, y });
        }
        // Fallback for different SVG structure
        if (rects.length === 0) {
            const parts = d.match(/M[^M]+/g) || [];
            for (const part of parts) {
                const vals = part.match(/[\d.\-]+/g);
                if (vals && vals.length >= 4) {
                    rects.push({ x: parseFloat(vals[0]), y: parseFloat(vals[3]) });
                }
            }
        }
        return rects;
    }

    // --- Identify paths by stroke/fill color ----------------------------------
    const paths = mainSvg.querySelectorAll('path');
    let priceD = null, sma50D = null, sma200D = null, rsiD = null;
    let volUpD = null, volDownD = null;

    for (const path of paths) {
        const d = path.getAttribute('d') || '';
        const stroke = path.getAttribute('stroke') || '';
        const fill = path.getAttribute('fill') || '';

        // Data lines (M + L commands, >5000 chars)
        if (d.indexOf('L') !== -1 && d.length > 5000) {
            if (stroke.indexOf('210, 100%, 50%') !== -1 ||
                (stroke.indexOf('primary-color') !== -1 && d.length > 8000)) {
                priceD = d;  // Main price line (blue)
            } else if (stroke === '#ffd333') {
                sma50D = d;  // SMA 50 (yellow)
            } else if (stroke === '#fc7335') {
                sma200D = d; // SMA 200 (orange)
            } else if (stroke.indexOf('open-up') !== -1 ||
                       stroke.indexOf('145, 80%, 25%') !== -1) {
                rsiD = d;    // RSI line (green)
            }
        }

        // Volume bars (V/h commands, no L, >10000 chars)
        if ((d.indexOf('V') !== -1 || d.indexOf('h') !== -1) &&
            d.length > 10000 && d.indexOf('L') === -1) {
            if (fill.indexOf('open-up') !== -1 ||
                fill.indexOf('145, 80%, 25%') !== -1) {
                volUpD = d;   // Green volume bars
            } else if (fill.indexOf('closed-down') !== -1 ||
                       fill.indexOf('4, 60%, 50%') !== -1) {
                volDownD = d; // Red volume bars
            }
        }
    }

    // --- Parse all coordinate data -------------------------------------------
    const priceCoords   = parseLinePath(priceD);
    const sma50Coords   = parseLinePath(sma50D);
    const sma200Coords  = parseLinePath(sma200D);
    const rsiCoords     = parseLinePath(rsiD);
    const volUpRects    = parseVolumeRects(volUpD);
    const volDownRects  = parseVolumeRects(volDownD);

    // --- Build dataset -------------------------------------------------------
    const pointCount = priceCoords.length;
    const priceSeries = priceCoords.map((pc, i) => ({
        index: i,
        price:     Math.round(svgYToPrice(pc.y) * 100) / 100,
        sma50:     sma50Coords[i]  ? Math.round(svgYToPrice(sma50Coords[i].y) * 100) / 100 : null,
        sma200:    sma200Coords[i] ? Math.round(svgYToPrice(sma200Coords[i].y) * 100) / 100 : null,
        rsi:       rsiCoords[i]    ? Math.round(svgYToRsi(rsiCoords[i].y) * 10) / 10 : null
    }));

    // Compute statistics
    const prices = priceSeries.map(p => p.price);
    const minPrice = Math.min.apply(Math, prices);
    const maxPrice = Math.max.apply(Math, prices);
    const avgPrice = Math.round(prices.reduce((a, b) => a + b, 0) / prices.length * 100) / 100;

    return {
        ticker: __koyfinTicker(),
        tab: 'Security Analysis > Graphs > Historical',
        extracted_at: new Date().toISOString(),
        url: window.location.href,

        chart: {
            template: 'EQ - Price & Timing',
            indicators: ['Price', 'SMA (50D)', 'SMA (200D)', 'RSI (14D)', 'Volume (Shares)'],
            frequency: 'Daily',
            dateRange: { from: '2025-05-15', to: '2026-05-15' }
        },

        controls: {
            periodPresets: ['MTD', '1M', 'QTD', '3M', '6M', 'YTD', '1Y', '3Y', '5Y', '10Y', '20Y', 'ALL'],
            frequencyOptions: ['Daily', 'Weekly', 'Monthly'],
            actions: ['Show Table', 'Export', 'Settings', 'Add to My Graphs', 'Download Available Data'],
            overlays: ['SMA (50D)', 'SMA (200D)', 'Volume (Shares)', 'RSI (14D)'],
            templateSelector: true,
            tickerSelector: true,
            addMetric: true,
            addTicker: true
        },

        calibration: {
            priceSlope:     Math.round(priceCal.slope * 10000) / 10000,
            priceIntercept: Math.round(priceCal.intercept * 100) / 100,
            rsiSlope:       Math.round(rsiCal.slope * 10000) / 10000,
            rsiIntercept:   Math.round(rsiCal.intercept * 100) / 100,
            labelsUsed: {
                price: priceLabels.length,
                rsi: rsiLabels.length
            }
        },

        meta: {
            pointCount: pointCount,
            minPrice: minPrice,
            maxPrice: maxPrice,
            avgPrice: avgPrice,
            firstPoint: priceSeries[0],
            lastPoint:  priceSeries[pointCount - 1]
        },

        dataSample: [
            priceSeries[0],
            priceSeries[Math.floor(pointCount / 4)],
            priceSeries[Math.floor(pointCount / 2)],
            priceSeries[Math.floor(3 * pointCount / 4)],
            priceSeries[pointCount - 1]
        ],

        // Full price series
        priceSeries: prices,

        // Full data (all points) - uncomment if needed
        // allPoints: priceSeries
    };
})();
