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

    return new Promise((resolve) => {
        // 1. Click "ALL" button if available and not already active
        const els = Array.from(document.querySelectorAll('.time-frame-options__item___i_o0Y'));
        const target = els.find(el => el.textContent && el.textContent.trim().toUpperCase() === 'ALL');
        
        let clicked = false;
        // Check active state
        if (target && !target.className.includes('active')) {
            target.click();
            clicked = true;
        }

        // 2. Wait 2 seconds (if clicked) or 100ms (if already loaded) and then extract
        setTimeout(() => {
            const visited = new Set();
            let found = null;

            function scanFiber(fiber) {
                if (!fiber || visited.has(fiber) || found) return;
                visited.add(fiber);

                if (fiber.memoizedProps && fiber.memoizedProps.series && fiber.memoizedProps.series.length > 0) {
                    const s = fiber.memoizedProps.series[0];
                    if (s && s.data && s.data.plotData) {
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

            if (!found) {
                resolve({
                    ticker: __koyfinTicker(),
                    tab: 'Security Analysis > Graphs > Performance',
                    extracted_at: new Date().toISOString(),
                    url: window.location.href,
                    status: 'unavailable',
                    error: 'No performance series data found in React Fiber.'
                });
                return;
            }

            const dataMap = {};
            found.forEach(s => {
                if (s.data && s.data.plotData) {
                    const ticker = s.tooltip ? s.tooltip.title : 'UNKNOWN';
                    const plotData = s.data.plotData.map(pt => ({
                        date: pt.date instanceof Date ? pt.date.toISOString() : String(pt.date),
                        value: pt.value
                    }));
                    dataMap[ticker] = plotData;
                }
            });

            const mainTicker = __koyfinTicker();
            const mainSeries = dataMap[mainTicker] || Object.values(dataMap)[0] || [];

            resolve({
                ticker: mainTicker,
                tab: 'Performance (gm)',
                extracted_at: new Date().toISOString(),
                status: 'success',
                metadata: {
                    method: 'react-fiber-direct-props',
                    clickedALL: clicked,
                    seriesCount: Object.keys(dataMap).length,
                    tickers: Object.keys(dataMap)
                },
                data: mainSeries,
                allSeries: dataMap
            });
        }, clicked ? 2000 : 100);
    });
})();
