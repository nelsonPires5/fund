#!/usr/bin/env node
/*
Build a standalone workbook page. The visible page is only the Univer workbook.

Usage:
  node skills/univer-workbook-author/scripts/build-workbook-page.js workbook.json workbook.html

The generated page embeds the workbook snapshot directly, so it can be opened from
an artifact folder without fetching local JSON. It loads Univer packages from a CDN.
Ctrl/Cmd+S downloads the edited workbook snapshot as JSON (no backend required).
*/

const fs = require('fs');
const path = require('path');

function usage() {
  console.error('Usage: node skills/univer-workbook-author/scripts/build-workbook-page.js <workbook.json> <workbook.html>');
  process.exit(2);
}

const [workbookArg, htmlArg] = process.argv.slice(2);
if (!workbookArg || !htmlArg) usage();

const workbookPath = path.resolve(workbookArg);
const htmlPath = path.resolve(htmlArg);
const workbook = JSON.parse(fs.readFileSync(workbookPath, 'utf8'));
const safeJson = JSON.stringify(workbook).replace(/</g, '\\u003c');
const downloadName = `${workbook.id || path.basename(workbookPath, '.json')}.workbook.json`;

const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(workbook.name || 'Workbook')}</title>
  <!-- Univer dependencies (UMD) -->
  <script src="https://unpkg.com/react@18.3.1/umd/react.production.min.js"></script>
  <script src="https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js"></script>
  <script src="https://unpkg.com/rxjs/dist/bundles/rxjs.umd.min.js"></script>
  <script src="https://unpkg.com/echarts@5.6.0/dist/echarts.min.js"></script>
  <!-- Univer preset (UMD) -->
  <script src="https://unpkg.com/@univerjs/presets/lib/umd/index.js"></script>
  <script src="https://unpkg.com/@univerjs/preset-sheets-core/lib/umd/index.js"></script>
  <script src="https://unpkg.com/@univerjs/preset-sheets-core/lib/umd/locales/en-US.js"></script>
  <link rel="stylesheet" href="https://unpkg.com/@univerjs/preset-sheets-core/lib/index.css" />
  <style>
    html, body, #app { width: 100%; height: 100%; margin: 0; padding: 0; overflow: hidden; }
    body { background: #fff; }
  </style>
</head>
<body>
  <div id="app"></div>
  <script>
    var createUniver = UniverPresets.createUniver;
    var LocaleType = UniverCore.LocaleType;
    var mergeLocales = UniverCore.mergeLocales;
    var UniverSheetsCorePreset = UniverPresetSheetsCore.UniverSheetsCorePreset;

    var workbookData = ${safeJson};
    var locales = {};
    locales[LocaleType.EN_US] = mergeLocales(UniverPresetSheetsCoreEnUS);
    var result = createUniver({
      locale: LocaleType.EN_US,
      locales: locales,
      presets: [UniverSheetsCorePreset({ container: 'app' })],
    });
    var univerAPI = result.univerAPI;

    univerAPI.createWorkbook(workbookData);
    window.__univerAPI = univerAPI;

    function downloadSnapshot() {
      var activeWorkbook = univerAPI.getActiveWorkbook();
      if (!activeWorkbook) return;
      var snapshot = activeWorkbook.save();
      var blob = new Blob([JSON.stringify(snapshot, null, 2) + '\\n'], { type: 'application/json' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = ${JSON.stringify(downloadName)};
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    }

    window.addEventListener('keydown', function(event) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 's') {
        event.preventDefault();
        downloadSnapshot();
      }
    });
  </script>
</body>
</html>
`;

fs.mkdirSync(path.dirname(htmlPath), { recursive: true });
fs.writeFileSync(htmlPath, html);
console.log(JSON.stringify({ status: 'success', html: htmlPath, workbook: workbookPath }, null, 2));

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
