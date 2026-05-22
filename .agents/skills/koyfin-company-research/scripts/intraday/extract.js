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

    // 1. Scan React Fiber tree for intraday series props
    function findIntradaySeries() {
        const visited = new Set();
        let found = null;

        function scanFiber(fiber) {
            if (!fiber || visited.has(fiber) || found) return;
            visited.add(fiber);

            if (fiber.memoizedProps && Array.isArray(fiber.memoizedProps.series) && fiber.memoizedProps.series.length > 0) {
                const first = fiber.memoizedProps.series[0];
                if (first && typeof first === 'object' && first.data && first.data.plotData) {
                    found = fiber.memoizedProps.series;
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

    const series = findIntradaySeries();
    if (!series) {
        return {
            ticker: __koyfinTicker(),
            tab: 'Security Analysis > Graphs > Intraday',
            extracted_at: new Date().toISOString(),
            url: window.location.href,
            status: 'unavailable',
            error: 'No intraday chart series data found in React Fiber.'
        };
    }

    const dataMap = {};
    series.forEach(s => {
        if (s.data && s.data.plotData && s.data.plotData.length > 1) {
            const ticker = s.tooltip ? s.tooltip.title : 'UNKNOWN';
            const plotData = s.data.plotData.map(pt => ({
                timestamp: pt.date instanceof Date ? pt.date.toISOString() : String(pt.date),
                value: pt.value
            }));
            dataMap[ticker] = plotData;
        }
    });

    const mainTicker = __koyfinTicker();
    const mainSeries = dataMap[mainTicker] || Object.values(dataMap)[0] || [];

    return {
        ticker: mainTicker,
        tab: 'Intraday (gip)',
        extracted_at: new Date().toISOString(),
        extractedAt: new Date().toISOString(),
        status: 'success',
        metadata: {
            method: 'react-fiber-direct-props',
            seriesCount: Object.keys(dataMap).length,
            tickers: Object.keys(dataMap)
        },
        tier1_api: {
            ticker: mainTicker,
            kid: __koyfinSecurityId(),
            totalBars: mainSeries.length,
            extractedAt: new Date().toISOString(),
            data: mainSeries,
            _fullDataAvailable: mainSeries.length
        },
        allSeries: dataMap
    };
})();
