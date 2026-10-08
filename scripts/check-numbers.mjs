#!/usr/bin/env node
// P6-A05: every number in note/note.md appears in the first column of docs/numbers-audit.md.
// Headings, list numbering, the track number and URLs are labels, not data, and are skipped.

import { existsSync, readFileSync } from 'node:fs';

const NOTE = 'note/note.md';
const AUDIT = 'docs/numbers-audit.md';
if (!existsSync(AUDIT)) {
  console.log('numbers: skipped (docs/numbers-audit.md is a local working file, D-24)');
  process.exit(0);
}

const note = readFileSync(NOTE, 'utf8')
  .split(/\r?\n/)
  .filter((l) => !/^#/.test(l)) // headings
  .map((l) => l.replace(/^\d+\.\s+/, '')) // list numbering
  .map((l) => l.replace(/https?:\/\/\S+/g, ' ')) // URLs
  .map((l) => l.replace(/Track 1,/g, 'Track,')) // the track's name
  .join('\n');

const found = new Set((note.match(/\d+(?:\.\d+)?%?/g) ?? []));

const audited = new Set();
for (const row of readFileSync(AUDIT, 'utf8').split(/\r?\n/)) {
  const cell = /^\|\s*([^|]+?)\s*\|/.exec(row)?.[1];
  if (!cell || /In the note|---/.test(cell)) continue;
  for (const n of cell.match(/\d+(?:\.\d+)?%?/g) ?? []) audited.add(n);
}

const missing = [...found].filter((n) => !audited.has(n));
console.log(`numbers: ${found.size} distinct numbers in the note; ${missing.length} unsourced`);
if (missing.length) {
  console.error(`unsourced: ${missing.join(', ')}`);
  process.exit(1);
}
