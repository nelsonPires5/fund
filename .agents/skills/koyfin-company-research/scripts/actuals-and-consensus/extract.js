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
 * Koyfin Actuals and Consensus (EAC) — DOM Extractor
 * 
 * Usage: Paste this into the browser console on
 *        https://app.koyfin.com/estimates/eac/<ticker-id>
 * 
 * Extracts both Annual and Quarterly views from the custom
 * div-based table used by Koyfin.
 *
 * Output: Returns a JSON object with ticker, tab, extracted_at,
 *         headers, rows, and section groupings.
 *
 * Durable patterns:
 *   - Table container: div[class*="table-styles__table__scrollContainer___"]
 *   - Header row: div[class*="table-styles__table__head___"]
 *   - Data rows: div[class*="table-styles__table__row___"]
 *   - Section headers: div wrapper with single child
 *   - Data cells: direct children of each row div
 */

(function extractEAC() {

  const container = document.querySelector(
    '[class*="table-styles__table__scrollContainer___"]'
  );
  if (!container || !container.children[0]) {
    return { error: "EAC table container not found. Are you on the Actuals and Consensus page?" };
  }

  const root = container.children[0];

  // Detect active view
  let activeView = "unknown";
  document.querySelectorAll("button").forEach((b) => {
    const t = b.textContent.trim();
    if ((t === "Annual (Y)" || t === "Quarterly (Q)") && b.classList.contains("active")) {
      activeView = t;
    }
  });

  const result = {
    ticker: (() => {
      const m = window.location.pathname.match(/\/eac\/(.+)/);
      return m ? m[1] : "unknown";
    })(),
    tab: "Actuals and Consensus",
    url: window.location.href,
    extracted_at: new Date().toISOString(),
    active_view: activeView,
  };

  // Parse header row
  const rows = [];
  for (let i = 0; i < root.children.length; i++) {
    const row = root.children[i];
    const cls = row.className || "";
    const entry = { idx: i };

    if (cls.includes("table-styles__table__head___")) {
      entry.type = "head";
      const headRow = row.children[0];
      entry.cells = [];
      if (headRow) {
        for (let j = 0; j < headRow.children.length; j++) {
          const cell = headRow.children[j];
          entry.cells.push(
            (cell.textContent || "").trim().replace(/\s+/g, " ")
          );
        }
      }
    } else if (
      row.children.length === 1 &&
      !cls.includes("table-styles__table__row___")
    ) {
      entry.type = "section";
      entry.label = (row.children[0].textContent || "").trim();
    } else {
      entry.type = "data";
      entry.cells = [];
      for (let j = 0; j < row.children.length; j++) {
        const cell = row.children[j];
        entry.cells.push((cell.textContent || "").trim());
      }
    }
    rows.push(entry);
  }

  result.row_count = rows.length;
  result.rows = rows;

  // Build column metadata from header
  if (rows.length > 0 && rows[0].type === "head") {
    const headerCells = rows[0].cells || [];
    if (headerCells.length > 1) {
      result.columns = headerCells.slice(1).map((h, i) => {
        // Parse header like "CY 2023A Jun-30-2023 Jul-25-2023"
        const parts = h.split(" ");
        const fy = parts[0] || "";
        const periodEnd = parts[1] || "";
        const reportDate = parts.slice(2).join(" ") || "";
        const status = fy.endsWith("A")
          ? "Actual"
          : fy.endsWith("E")
          ? "Estimate"
          : "Unknown";
        return { label: h, fy, period_end: periodEnd, report_date: reportDate, status };
      });
    }
  }

  return result;
})();
