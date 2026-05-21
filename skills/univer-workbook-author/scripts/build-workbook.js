#!/usr/bin/env node
/*
Build a Univer-style workbook snapshot from a simple agent-authored spec.

Usage:
  node skills/univer-workbook-author/scripts/build-workbook.js workbook.spec.json workbook.json [--outputs outputs.json]

Spec shape:
{
  "id": "msft-dcf-2026-05-18",
  "name": "MSFT DCF",
  "sheets": [
    {
      "name": "Summary",
      "rows": [
        ["Metric", "Value"],
        ["Implied Share Price", {"formula": "=DCF!B20", "name": "valuation.implied_share_price"}]
      ],
      "cells": {
        "D1": {"value": "Source: agent"}
      }
    },
    {"name": "Raw Financials", "csv": "../../data/normalized/financials.csv"}
  ],
  "outputs": [
    {"key": "valuation.implied_share_price", "sheet": "Summary", "cell": "B2", "value": 425.5, "unit": "USD/share"}
  ]
}
*/

const fs = require('fs');
const path = require('path');

function usage() {
  console.error('Usage: node skills/univer-workbook-author/scripts/build-workbook.js <workbook.spec.json> <workbook.json> [--outputs <outputs.json>]');
  process.exit(2);
}

const args = process.argv.slice(2);
if (args.length < 2) usage();
const specPath = path.resolve(args[0]);
const outPath = path.resolve(args[1]);
let outputsPath = null;
for (let i = 2; i < args.length; i++) {
  if (args[i] === '--outputs') {
    outputsPath = path.resolve(args[++i]);
  } else {
    usage();
  }
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function ensureDir(file) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
}

function slug(input) {
  return String(input || 'sheet')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'sheet';
}

function colNameToIndex(name) {
  let n = 0;
  for (const ch of name.toUpperCase()) {
    n = n * 26 + (ch.charCodeAt(0) - 64);
  }
  return n - 1;
}

function a1ToCoord(ref) {
  const match = /^([A-Z]+)([1-9][0-9]*)$/i.exec(String(ref).trim());
  if (!match) throw new Error(`Invalid A1 cell reference: ${ref}`);
  return { row: Number(match[2]) - 1, col: colNameToIndex(match[1]) };
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const next = text[i + 1];
    if (inQuotes) {
      if (ch === '"' && next === '"') {
        field += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        field += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ',') {
        row.push(field);
        field = '';
      } else if (ch === '\n') {
        row.push(field);
        rows.push(row);
        row = [];
        field = '';
      } else if (ch !== '\r') {
        field += ch;
      }
    }
  }
  if (field.length || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

function inferScalar(value) {
  if (value === null || value === undefined) return undefined;
  if (typeof value !== 'string') return value;
  const trimmed = value.trim();
  if (trimmed === '') return '';
  if (/^-?\d+(\.\d+)?$/.test(trimmed)) return Number(trimmed);
  return value;
}

function cellToUniver(cell, context) {
  if (cell === null || cell === undefined) return undefined;
  if (Array.isArray(cell)) return { v: cell.join(', ') };
  if (typeof cell !== 'object') return { v: inferScalar(cell) };

  const out = {};
  const formula = cell.formula ?? cell.f;
  const hasFormula = formula !== undefined && formula !== null && formula !== '';
  if (hasFormula) {
    const formulaText = String(formula);
    if (!formulaText.startsWith('=')) {
      throw new Error(`Formula must start with '=' at ${context}: ${formulaText}`);
    }
    out.f = formulaText;
  }
  if (Object.prototype.hasOwnProperty.call(cell, 'value') || Object.prototype.hasOwnProperty.call(cell, 'v')) {
    out.v = inferScalar(cell.value ?? cell.v);
  }
  if (cell.type !== undefined) out.t = cell.type;
  if (cell.t !== undefined) out.t = cell.t;
  return Object.keys(out).length ? out : undefined;
}

function putCell(cellData, row, col, cell) {
  if (!cell) return;
  if (!cellData[row]) cellData[row] = {};
  cellData[row][col] = cell;
}

function buildSheet(sheetSpec, sheetIndex, specDir, outputKeys) {
  const name = sheetSpec.name || `Sheet ${sheetIndex + 1}`;
  const id = sheetSpec.id || slug(name);
  const cellData = {};
  let maxRow = 0;
  let maxCol = 0;

  let rows = sheetSpec.rows || [];
  const csvPath = sheetSpec.csv || sheetSpec.fromCsv;
  if (csvPath) {
    const absCsv = path.isAbsolute(csvPath) ? csvPath : path.resolve(specDir, csvPath);
    rows = parseCsv(fs.readFileSync(absCsv, 'utf8'));
  }

  rows.forEach((row, r) => {
    (row || []).forEach((cell, c) => {
      const built = cellToUniver(cell, `${name}!R${r + 1}C${c + 1}`);
      putCell(cellData, r, c, built);
      if (cell && typeof cell === 'object' && !Array.isArray(cell) && cell.name) {
        outputKeys.push({ key: cell.name, sheet: name, cell: indexToA1(r, c), source: 'named-cell' });
      }
      maxRow = Math.max(maxRow, r + 1);
      maxCol = Math.max(maxCol, c + 1);
    });
  });

  for (const [ref, cell] of Object.entries(sheetSpec.cells || {})) {
    const { row, col } = a1ToCoord(ref);
    const built = cellToUniver(cell, `${name}!${ref}`);
    putCell(cellData, row, col, built);
    if (cell && typeof cell === 'object' && !Array.isArray(cell) && cell.name) {
      outputKeys.push({ key: cell.name, sheet: name, cell: ref.toUpperCase(), source: 'named-cell' });
    }
    maxRow = Math.max(maxRow, row + 1);
    maxCol = Math.max(maxCol, col + 1);
  }

  return {
    id,
    name,
    rowCount: sheetSpec.rowCount || Math.max(maxRow, 100),
    columnCount: sheetSpec.columnCount || Math.max(maxCol, 26),
    cellData,
    freeze: sheetSpec.freeze || undefined,
    hidden: !!sheetSpec.hidden,
  };
}

function indexToA1(row, col) {
  let n = col + 1;
  let name = '';
  while (n > 0) {
    const rem = (n - 1) % 26;
    name = String.fromCharCode(65 + rem) + name;
    n = Math.floor((n - 1) / 26);
  }
  return `${name}${row + 1}`;
}

const spec = readJson(specPath);
const specDir = path.dirname(specPath);
if (!Array.isArray(spec.sheets) || spec.sheets.length === 0) {
  throw new Error('workbook.spec.json must include a non-empty sheets array');
}

const collectedOutputs = [];
const sheets = {};
const sheetOrder = [];
for (let i = 0; i < spec.sheets.length; i++) {
  const sheet = buildSheet(spec.sheets[i], i, specDir, collectedOutputs);
  let id = sheet.id;
  let suffix = 2;
  while (sheets[id]) id = `${sheet.id}-${suffix++}`;
  sheet.id = id;
  sheets[id] = sheet;
  sheetOrder.push(id);
}

const workbook = {
  id: spec.id || slug(spec.name || path.basename(outPath, '.json')),
  name: spec.name || 'Investment Workbook',
  appVersion: spec.appVersion || '3.0.0',
  locale: spec.locale || 'enUS',
  styles: spec.styles || {},
  sheetOrder,
  sheets,
  resources: spec.resources || [],
};

ensureDir(outPath);
fs.writeFileSync(outPath, `${JSON.stringify(workbook, null, 2)}\n`);

if (outputsPath) {
  const explicit = Array.isArray(spec.outputs) ? spec.outputs : [];
  const seen = new Set();
  const outputs = [];
  for (const item of [...explicit, ...collectedOutputs]) {
    if (!item.key || seen.has(item.key)) continue;
    seen.add(item.key);
    outputs.push(item);
  }
  const outputsDoc = {
    workbook_id: workbook.id,
    workbook_name: workbook.name,
    generated_at: new Date().toISOString(),
    outputs,
  };
  ensureDir(outputsPath);
  fs.writeFileSync(outputsPath, `${JSON.stringify(outputsDoc, null, 2)}\n`);
}

console.log(JSON.stringify({ status: 'success', workbook: outPath, outputs: outputsPath, sheets: sheetOrder.length }, null, 2));
