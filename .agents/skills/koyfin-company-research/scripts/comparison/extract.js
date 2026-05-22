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

    // 1. Scan React Fiber tree for both legendItems and raw graphs
    function findReactProps() {
        const visited = new Set();
        let legendItems = null;
        let graphs = null;

        function scanFiber(fiber) {
            if (!fiber || visited.has(fiber)) return;
            visited.add(fiber);

            if (fiber.memoizedProps) {
                if (!legendItems && Array.isArray(fiber.memoizedProps.legendItems) && fiber.memoizedProps.legendItems.length > 0) {
                    legendItems = fiber.memoizedProps.legendItems;
                }
                if (!graphs && Array.isArray(fiber.memoizedProps.graphs) && fiber.memoizedProps.graphs.length > 1) {
                    const first = fiber.memoizedProps.graphs[0];
                    if (first && typeof first === 'object' && first.attributes && first.attributes.security && first.data && first.data.plotData) {
                        graphs = fiber.memoizedProps.graphs;
                    }
                }
            }

            if (legendItems && graphs) return;

            if (fiber.child) scanFiber(fiber.child);
            if (fiber.sibling) scanFiber(fiber.sibling);
        }

        const allEl = document.querySelectorAll('*');
        for (let el of allEl) {
            const fiberKey = Object.keys(el).find(k => k.startsWith('__reactFiber$') || k.startsWith('__reactInternalInstance$'));
            if (fiberKey) {
                scanFiber(el[fiberKey]);
                if (legendItems && graphs) break;
            }
        }
        return { legendItems, graphs };
    }

    const { legendItems, graphs } = findReactProps();
    if (!graphs) {
        return {
            ticker: __koyfinTicker(),
            tab: 'Security Analysis > Graphs > Comparison',
            extracted_at: new Date().toISOString(),
            url: window.location.href,
            status: 'unavailable',
            error: 'No comparison chart data found in React Fiber.'
        };
    }

    const panels = {};
    const tickersMap = new Map();

    graphs.forEach(g => {
        const security = g.attributes.security;
        const metric = g.attributes.labels.label;
        const ticker = security.ticker;
        tickersMap.set(ticker, security.name);

        if (!panels[metric]) {
            panels[metric] = {
                metric: metric,
                series: []
            };
        }

        // Find current/legend value if available
        let legendVal = null;
        if (legendItems) {
            const match = legendItems.find(item => item.graphId === g.id);
            if (match) {
                // If it's an array or object, format appropriately
                legendVal = Array.isArray(match.value) ? match.value[0] : String(match.value);
            }
        }

        if (!legendVal && g.data.plotData.length > 0) {
            const lastVal = g.data.plotData[g.data.plotData.length - 1].value;
            legendVal = typeof lastVal === 'number' ? Math.round(lastVal * 100) / 100 : lastVal;
        }

        const seriesData = g.data.plotData.map(pt => ({
            date: pt.date instanceof Date ? pt.date.toISOString() : String(pt.date),
            value: pt.value
        }));

        panels[metric].series.push({
            ticker: ticker,
            company: security.name,
            value: legendVal,
            color: g.color,
            data: seriesData
        });
    });

    const tickers = Array.from(tickersMap.entries()).map(([ticker, name]) => ({
        ticker,
        name
    }));

    return {
        ticker: __koyfinTicker(),
        tab: 'Security Analysis > Graphs > Comparison',
        url: window.location.href,
        extracted_at: new Date().toISOString(),
        status: 'success',
        metadata: {
            method: 'react-fiber-direct-props',
            tickerCount: tickers.length,
            panelCount: Object.keys(panels).length
        },
        tickers: tickers,
        panels: Object.values(panels)
    };
})();
