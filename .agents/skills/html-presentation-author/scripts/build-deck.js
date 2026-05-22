#!/usr/bin/env node
/*
Build a standalone HTML presentation from a small JSON spec.

Usage:
  node skills/html-presentation-author/scripts/build-deck.js deck.spec.json deck/index.html

Spec shape:
{
  "title": "MSFT Initial Coverage",
  "run_id": "2026-05-18-initial-coverage",
  "slides": [
    {"title": "Investment view", "body": ["- Thesis point", "- Valuation: $425/share"]},
    {"html": "<h1>Custom slide</h1><p>Allowed when needed.</p>"}
  ]
}
*/

const fs = require('fs');
const path = require('path');

const [specArg, htmlArg] = process.argv.slice(2);
if (!specArg || !htmlArg) {
  console.error('Usage: node skills/html-presentation-author/scripts/build-deck.js <deck.spec.json> <deck/index.html>');
  process.exit(2);
}

const specPath = path.resolve(specArg);
const htmlPath = path.resolve(htmlArg);
const spec = JSON.parse(fs.readFileSync(specPath, 'utf8'));
if (!Array.isArray(spec.slides) || spec.slides.length === 0) {
  throw new Error('deck.spec.json must include a non-empty slides array');
}

const slides = spec.slides.map((slide, i) => {
  if (slide.html) return `<section class="slide">${slide.html}</section>`;
  const title = slide.title ? `<h1>${escapeHtml(slide.title)}</h1>` : '';
  const body = Array.isArray(slide.body) ? renderLines(slide.body) : renderLines(String(slide.body || '').split('\n'));
  const footnote = slide.footnote ? `<footer>${escapeHtml(slide.footnote)}</footer>` : '';
  return `<section class="slide">${title}<div class="body">${body}</div>${footnote}</section>`;
}).join('\n');

const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(spec.title || 'Presentation')}</title>
  <style>
    :root { font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; color: #111827; background: #f8fafc; }
    body { margin: 0; overflow: hidden; }
    .deck { width: 100vw; height: 100vh; }
    .slide { box-sizing: border-box; width: 100vw; height: 100vh; padding: 5vw 6vw; display: none; flex-direction: column; justify-content: center; background: white; }
    .slide.active { display: flex; }
    h1 { font-size: 3.2rem; line-height: 1.05; margin: 0 0 2rem; color: #0f172a; }
    h2 { font-size: 2rem; margin: 1.5rem 0 0.75rem; color: #1e3a8a; }
    p, li { font-size: 1.5rem; line-height: 1.35; }
    ul { margin: 0; padding-left: 1.5em; }
    footer { position: absolute; bottom: 2rem; left: 6vw; right: 6vw; color: #64748b; font-size: 0.9rem; }
    .counter { position: fixed; right: 1rem; bottom: 1rem; color: #64748b; font-size: 0.85rem; }
    table { border-collapse: collapse; font-size: 1.1rem; }
    td, th { border-bottom: 1px solid #e2e8f0; padding: 0.45rem 0.7rem; text-align: right; }
    th:first-child, td:first-child { text-align: left; }
  </style>
</head>
<body>
  <main class="deck">
    ${slides}
  </main>
  <div class="counter" id="counter"></div>
  <script>
    const slides = [...document.querySelectorAll('.slide')];
    let current = 0;
    function show(index) {
      current = Math.max(0, Math.min(slides.length - 1, index));
      slides.forEach((s, i) => s.classList.toggle('active', i === current));
      document.getElementById('counter').textContent = (current + 1) + ' / ' + slides.length;
    }
    window.addEventListener('keydown', (event) => {
      if (['ArrowRight', 'PageDown', ' '].includes(event.key)) show(current + 1);
      if (['ArrowLeft', 'PageUp'].includes(event.key)) show(current - 1);
    });
    show(0);
  </script>
</body>
</html>
`;

fs.mkdirSync(path.dirname(htmlPath), { recursive: true });
fs.writeFileSync(htmlPath, html);
console.log(JSON.stringify({ status: 'success', html: htmlPath, slides: spec.slides.length }, null, 2));

function renderLines(lines) {
  const out = [];
  let inList = false;
  for (const raw of lines) {
    const line = String(raw);
    if (line.trim().startsWith('- ')) {
      if (!inList) { out.push('<ul>'); inList = true; }
      out.push(`<li>${escapeHtml(line.trim().slice(2))}</li>`);
    } else {
      if (inList) { out.push('</ul>'); inList = false; }
      if (line.trim()) out.push(`<p>${escapeHtml(line)}</p>`);
    }
  }
  if (inList) out.push('</ul>');
  return out.join('\n');
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
