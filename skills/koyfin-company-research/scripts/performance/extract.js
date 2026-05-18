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

/*
 * extract.js — Koyfin Performance Graph data extraction
 * 
 * Usage: paste into browser-harness <<'PY' block
 * Dependencies: js(), click_at_xy(), wait_for_load() helpers pre-imported.
 * 
 * Extracts daily performance return data from Koyfin's Performance (GM) chart.
 * Works with the Recharts SVG chart and virtualized data table.
 * 
 * Target page: https://app.koyfin.com/charts/gm/<security-id>
 * Example:    https://app.koyfin.com/charts/gm/eq-kuqeq3  (MSFT)
 */

// ============================================================
// STEP 1: Navigate to the Performance page
// ============================================================
// new_tab("https://app.koyfin.com/charts/gm/eq-kuqeq3")
// wait_for_load()

// ============================================================
// STEP 2: Accept cookie consent if present
// ============================================================
function acceptCookies() {
  var buttons = document.querySelectorAll('button');
  for (var i = 0; i < buttons.length; i++) {
    var b = buttons[i];
    if (b.textContent && b.textContent.trim() === 'Accept All' && b.offsetParent !== null) {
      var r = b.getBoundingClientRect();
      return {x: r.left + r.width/2, y: r.top + r.height/2};
    }
  }
  return null;
}
// Use: click_at_xy(x, y) if acceptCookies() returns coordinates

// ============================================================
// STEP 3: Show the data table
// ============================================================
function showTableButton() {
  var buttons = document.querySelectorAll('button');
  for (var i = 0; i < buttons.length; i++) {
    var b = buttons[i];
    if (b.textContent && b.textContent.trim() === 'Show Table' && b.offsetParent !== null) {
      var r = b.getBoundingClientRect();
      return {x: r.left + r.width/2, y: r.top + r.height/2};
    }
  }
  return null;
}
// Use: click_at_xy(x, y) if showTableButton() returns coordinates

// ============================================================
// STEP 4: Extract table data by scrolling the virtualized container
// ============================================================
function extractAllRows() {
  var allData = [];
  var divs = Array.from(document.querySelectorAll('div'));
  var container = divs.filter(function(d) {
    var cn = d.className || '';
    return cn.indexOf('scrollContainer') >= 0 && cn.indexOf('ChartTable') >= 0;
  })[0];
  
  if (!container) return {error: 'Table container not found. Click Show Table first.'};
  
  var scrollHeight = container.scrollHeight;
  var step = 200;  // pixels per scroll iteration
  var seen = new Set();
  
  for (var pos = 0; pos <= scrollHeight + step; pos += step) {
    container.scrollTop = pos;
    
    // Yield to renderer
    // (In browser-harness, use time.sleep(0.15) after each scroll)
    
    var inner = container.children[0];
    if (!inner) continue;
    
    for (var i = 0; i < inner.children.length; i++) {
      var txt = (inner.children[i].textContent || '').trim();
      if (txt && txt !== 'DateMSFTReturn' && !seen.has(txt)) {
        seen.add(txt);
        
        // Parse the row: "Fri05-15-2026-6.35%" or "Fri03-27-2026Low-20.81%"
        var match = txt.match(/^[A-Z][a-z]{2}(\d{2}-\d{2}-\d{4})(?:Low|High)?([+-]?\d+\.?\d*)%/);
        if (match) {
          allData.push({
            raw: txt,
            date: match[1],
            return_pct: parseFloat(match[2])
          });
        } else {
          allData.push({raw: txt});
        }
      }
    }
  }
  
  return allData;
}

// ============================================================
// STEP 5: Get chart metadata from SVG
// ============================================================
function getChartMetadata() {
  var data = {};
  
  // Find the main chart SVG (largest SVG > 1000px wide)
  var svgs = document.querySelectorAll('svg');
  for (var i = 0; i < svgs.length; i++) {
    var s = svgs[i];
    var r = s.getBoundingClientRect();
    if (r.width > 1000 && r.height > 500) {
      data.svgIndex = i;
      data.chartRect = {w: r.width, h: r.height, t: r.top, l: r.left};
      break;
    }
  }
  
  // Get Y-axis labels
  if (data.svgIndex !== undefined) {
    var svg = svgs[data.svgIndex];
    var gs = svg.querySelectorAll('g');
    // Y-axis is typically the last g with many text children
    for (var i = 0; i < gs.length; i++) {
      var texts = gs[i].querySelectorAll('text');
      if (texts.length > 10) {
        var labels = [];
        for (var j = 0; j < texts.length; j++) {
          labels.push(texts[j].textContent);
        }
        data.yLabels = labels;
        break;
      }
    }
  }
  
  // Get legend text
  var legend = document.querySelector('[class*="legend"]');
  if (legend) data.legendText = legend.textContent.trim();
  
  // Get security info from page
  var pageTitle = document.title;
  data.pageTitle = pageTitle;
  
  // Get ticker info from URL/sidebar
  var sidebarItems = document.querySelectorAll('[class*="sidebar"] [class*="securityBtn"]');
  if (sidebarItems.length) {
    data.securities = Array.from(sidebarItems).map(function(s) { return s.textContent.trim(); });
  }
  
  return data;
}

// ============================================================
// STEP 6: Get currently selected period/frequency
// ============================================================
function getControls() {
  var controls = {};
  
  // Find the toolbar area
  var toolbar = document.querySelector('[class*="chart-toolbar"]');
  if (!toolbar) return controls;
  
  // All buttons in toolbar
  var buttons = toolbar.querySelectorAll('button, [class*="button"]');
  controls.buttons = Array.from(buttons).map(function(b) {
    return (b.textContent || '').trim();
  }).filter(function(t) { return t.length > 0; });
  
  // Find frequency selector (shows "Daily", "Weekly", etc.)
  var freq = document.querySelector('[class*="menu-input"]');
  if (freq) controls.frequency = freq.textContent.trim();
  
  return controls;
}

// ============================================================
// Usage (browser-harness):
// ============================================================
/*
// Paste this into a browser-harness PY heredoc:

# Accept cookies
var btn = js(acceptCookies.toString() + " return JSON.stringify(acceptCookies());")
if (btn && btn !== 'null') {
  var b = JSON.parse(btn);
  click_at_xy(b.x, b.y)
  wait_for_load()
}

# Show table
var st = js(showTableButton.toString() + " return JSON.stringify(showTableButton());")
if (st && st !== 'null') {
  var s = JSON.parse(st);
  click_at_xy(s.x, s.y)
  import time; time.sleep(1)
}

# Extract data
var result = js(extractAllRows.toString() + " return JSON.stringify(extractAllRows());")
print(result)

# Get metadata
var meta = js(getChartMetadata.toString() + " return JSON.stringify(getChartMetadata());")
print(meta)
*/
