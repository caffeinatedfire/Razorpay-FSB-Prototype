#!/usr/bin/env node
// P4-A01: every rule R01 to R18 has at least one test whose title starts with its ID.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = join(process.cwd(), 'tests');
const TITLE_RE = /\b(?:it|test)\s*\(\s*(['"`])(R\d{2})\b/g;

function files(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) files(full, out);
    else if (/\.(test|spec)\.tsx?$/.test(name)) out.push(full);
  }
  return out;
}

const covered = new Set();
for (const f of files(ROOT)) for (const m of readFileSync(f, 'utf8').matchAll(TITLE_RE)) covered.add(m[2]);

const all = Array.from({ length: 18 }, (_, i) => `R${String(i + 1).padStart(2, '0')}`);
const missing = all.filter((r) => !covered.has(r));
console.log(`rule coverage: ${all.length - missing.length} of ${all.length} rules covered`);
if (missing.length) {
  console.error(`missing tests titled with: ${missing.join(', ')}`);
  process.exit(1);
}
