// Koyfin cross-ticker helpers
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

(function() {
    'use strict';

    // 1. Locate raw chart data from React Fiber tree
    function findReactData() {
        const visited = new Set();
        let found = null;

        function scanFiber(fiber) {
            if (!fiber || visited.has(fiber) || found) return;
            visited.add(fiber);

            if (fiber.memoizedProps && Array.isArray(fiber.memoizedProps.data) && fiber.memoizedProps.data.length > 50) {
                const first = fiber.memoizedProps.data[0];
                if (first && typeof first === 'object' && first.date && first.close !== undefined) {
                    found = fiber.memoizedProps.data;
                    return;
                }
            }

            if (fiber.child) scanFiber(fiber.child);
            if (fiber.sibling) scanFiber(fiber.sibling);
        }

        const allEl = document.querySelectorAll('*');
        for (let el of allEl) {
            const fiberKey = Object.keys(el).find(k => k.startsWith('__reactFiber$') || k.startsWith('__reactInternalInstance$'));
            if (fiberKey) {
                scanFiber(el[fiberKey]);
                if (found) break;
            }
        }
        return found;
    }

    const rawData = findReactData();
    if (!rawData) {
        return {
            ticker: __koyfinTicker(),
            tab: 'Security Analysis > Graphs > Historical',
            extracted_at: new Date().toISOString(),
            url: window.location.href,
            status: 'unavailable',
            error: 'No chart data found in React Fiber. Chart might still be loading.'
        };
    }

    // 2. Compute technical overlays directly from raw prices
    const prices = rawData.map(d => d.close);
    
    function calculateSMA(prices, period) {
        const sma = [];
        let sum = 0;
        for (let i = 0; i < prices.length; i++) {
            sum += prices[i];
            if (i >= period - 1) {
                if (i >= period) {
                    sum -= prices[i - period];
                }
                sma.push(Math.round((sum / period) * 100) / 100);
            } else {
                sma.push(null);
            }
        }
        return sma;
    }

    function calculateRSI(prices, period = 14) {
        const rsi = [];
        if (prices.length <= period) {
            for (let i = 0; i < prices.length; i++) rsi.push(null);
            return rsi;
        }
        
        let gains = 0;
        let losses = 0;
        
        for (let i = 0; i < period; i++) rsi.push(null);
        
        for (let i = 1; i <= period; i++) {
            const diff = prices[i] - prices[i - 1];
            if (diff > 0) {
                gains += diff;
            } else {
                losses -= diff;
            }
        }
        
        let avgGain = gains / period;
        let avgLoss = losses / period;
        
        let rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
        rsi.push(avgLoss === 0 ? 100 : Math.round((100 - (100 / (1 + rs))) * 10) / 10);
        
        for (let i = period + 1; i < prices.length; i++) {
            const diff = prices[i] - prices[i - 1];
            const gain = diff > 0 ? diff : 0;
            const loss = diff < 0 ? -diff : 0;
            
            avgGain = (avgGain * (period - 1) + gain) / period;
            avgLoss = (avgLoss * (period - 1) + loss) / period;
            
            rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
            rsi.push(avgLoss === 0 ? 100 : Math.round((100 - (100 / (1 + rs))) * 10) / 10);
        }
        
        return rsi;
    }

    const sma50 = calculateSMA(prices, 50);
    const sma200 = calculateSMA(prices, 200);
    const rsi14 = calculateRSI(prices, 14);

    const priceSeries = rawData.map((d, i) => {
        const dateStr = d.date instanceof Date ? d.date.toISOString() : String(d.date);
        return {
            index: i,
            date: dateStr,
            open: d.open,
            high: d.high,
            low: d.low,
            close: d.close,
            volume: d.volume,
            sma50: sma50[i],
            sma200: sma200[i],
            rsi: rsi14[i]
        };
    });

    const pointCount = priceSeries.length;
    const minPrice = Math.min.apply(Math, prices);
    const maxPrice = Math.max.apply(Math, prices);
    const avgPrice = Math.round(prices.reduce((a, b) => a + b, 0) / prices.length * 100) / 100;

    return {
        ticker: __koyfinTicker(),
        tab: 'Security Analysis > Graphs > Historical',
        extracted_at: new Date().toISOString(),
        url: window.location.href,
        status: 'success',

        chart: {
            template: 'EQ - Price & Timing',
            indicators: ['Price', 'SMA (50D)', 'SMA (200D)', 'RSI (14D)', 'Volume (Shares)'],
            frequency: 'Daily'
        },

        controls: {
            periodPresets: ['MTD', '1M', 'QTD', '3M', '6M', 'YTD', '1Y', '3Y', '5Y', '10Y', '20Y', 'ALL'],
            frequencyOptions: ['Daily', 'Weekly', 'Monthly']
        },

        calibration: {
            method: 'react-fiber-direct-props',
            priceSlope: 1.0,
            priceIntercept: 0.0,
            rsiSlope: 1.0,
            rsiIntercept: 0.0,
            labelsUsed: {
                price: 0,
                rsi: 0
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

        priceSeries: prices,
        allPoints: priceSeries
    };
})();
