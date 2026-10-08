#!/usr/bin/env node
// P6-T07: writes docs/ai-build-log.md from docs/ai-build-log.template.md, filling in, word for word:
//   <!-- WRONG -->            every "AI was wrong about" line from docs/build-log.md
//   <!-- DECISIONS -->        every gate reply from docs/decision-log.md
//   <!-- HUMAN_DECISIONS -->  the IDs of decisions recorded as "human"
// Then checks P6-A06: no placeholder is left, and each gate reply appears unchanged.

import { existsSync, readFileSync, writeFileSync } from 'node:fs';

const TEMPLATE = 'docs/ai-build-log.template.md';
const BUILD = 'docs/build-log.md';
const DECISIONS = 'docs/decision-log.md';
const OUT = 'docs/ai-build-log.md';

for (const f of [TEMPLATE, BUILD, DECISIONS]) {
  if (!existsSync(f)) {
    console.log(`ai-build-log: skipped (${f} is a local working file, D-24)`);
    process.exit(0);
  }
}

const read = (f) => readFileSync(f, 'utf8').replace(/\r\n/g, '\n');

// "AI was wrong about" lines, with the entry they belong to.
const wrong = [];
let header = '';
for (const line of read(BUILD).split('\n')) {
  const h = /^### (.+)$/.exec(line);
  if (h) header = h[1].replace(/\s*\|\s*/g, ' · ');
  const w = /^- AI was wrong about: (.*)$/.exec(line);
  if (w && !/^nothing\b/i.test(w[1].trim())) wrong.push(`- **${header}.** ${w[1].trim()}`);
}

// Gate replies: each block starts at a line "GATE G" and runs to the next one or the end of the file.
const log = read(DECISIONS);
const start = log.indexOf('\nGATE G');
const gateBlocks = start < 0 ? [] : log.slice(start + 1).split(/\n(?=GATE G)/).map((b) => b.replace(/\n+$/, ''));
const quoted = gateBlocks.map((b) => b.split('\n').map((l) => (l ? `> ${l}` : '>')).join('\n')).join('\n\n');

const human = [...log.matchAll(/^(D-\d+) \|[^\n]*\| human\s*$/gm)].map((m) => m[1]);

let out = read(TEMPLATE)
  .replace('<!-- WRONG -->', wrong.join('\n'))
  .replace('<!-- DECISIONS -->', quoted)
  .replace('<!-- HUMAN_DECISIONS -->', human.join(', '));

out = out.replace(/^Facts only, compiled from[^\n]*\n/m, (m) => m); // header kept as written
writeFileSync(OUT, out);

// P6-A06 checks.
const problems = [];
if (/<!--|\bTODO\b|\bTBD\b|\{\{/.test(out)) problems.push('a placeholder is left');
for (const b of gateBlocks) {
  const asQuoted = b.split('\n').map((l) => (l ? `> ${l}` : '>')).join('\n');
  if (!out.includes(asQuoted)) problems.push(`gate reply not copied word for word: ${b.split('\n')[0]}`);
}
console.log(`ai-build-log: ${wrong.length} "AI was wrong" lines, ${gateBlocks.length} gate replies, ${human.length} human decisions; wrote ${OUT}`);
if (problems.length) {
  console.error(problems.join('\n'));
  process.exit(1);
}
console.log('ai-build-log: P6-A06 ok (no placeholders; gate replies match the decision log)');
