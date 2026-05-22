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

// ==Koyfin Income Statement Table Extractor==
// Target: app.koyfin.com/fa/*/eq-* (Income Statement tab)
// Extracts quarterly income statement data with column headers
// 
// Usage: paste into browser console or use with js() in browser-harness
// Returns: {headers: string[], sections: {section: string, rows: {label: string, values: string[]}[]}[]}

(function extractKoyfinIncomeStatement() {
  const table = document.querySelector('.fa-table__root___cf3J4');
  if (!table) return {error: 'Table root not found. Are you on the Financial Analysis > Income Statement tab?'};
  
  const inner = table.children[0];
  const result = {};

  // --- Column Headers ---
  const headerRow = inner.children[0];
  const headers = [];
  for (let i = 0; i < headerRow.children.length; i++) {
    headers.push(headerRow.children[i].textContent.trim());
  }
  result.headers = headers;

  // --- Sections & Rows ---
  const sections = [];
  for (let s = 1; s < inner.children.length; s++) {
    const sectionDiv = inner.children[s];
    if (!sectionDiv.children || sectionDiv.children.length < 2) continue;

    const sectionLabel = sectionDiv.children[0]?.textContent?.trim() || '';
    const rows = [];

    for (let r = 1; r < sectionDiv.children.length; r++) {
      const rowDiv = sectionDiv.children[r];
      // Row has 1 wrapper child with cells; some sections have direct cells
      const cells = rowDiv.children[0]?.children || rowDiv.children;
      if (cells.length < 2) continue;

      // Cell[0] = sticky left area; first sub-element = row label
      const labelCell = cells[0];
      const label = labelCell?.children[0]?.textContent?.trim() 
                 || labelCell?.textContent?.trim() 
                 || '';

      // Cells[1..N] = data values (aligns with headers[2:])
      const values = [];
      for (let v = 1; v < cells.length; v++) {
        values.push(cells[v]?.textContent?.trim() || '');
      }

      rows.push({label, values});
    }

    sections.push({section: sectionLabel, rows});
  }
  result.sections = sections;

  return result;
})();
