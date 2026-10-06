#!/usr/bin/env node
// P2 acceptance checks (P2-A01 to P2-A05).
import { readFileSync, readdirSync } from 'node:fs';
const ok = (id, pass, detail) => { console.log(`${id} ${pass ? 'pass' : 'FAIL'}: ${detail}`); if (!pass) process.exitCode = 1; };
const read = (p) => readFileSync(p, 'utf8');

const dir = 'docs/design/wireframes';
const pngs = readdirSync(dir).filter((f) => f.endsWith('.png'));
const dims = pngs.map((f) => { const b = readFileSync(`${dir}/${f}`); return [f, b.readUInt32BE(16), b.readUInt32BE(20)]; });
ok('P2-A01', pngs.length >= 6 && dims.every(([, w, h]) => w === 390 && h === 844), `${pngs.length} PNGs, sizes ${[...new Set(dims.map(([, w, h]) => `${w}x${h}`))].join(', ')}`);

const dec = read('docs/design/decisions.md');
const [decPart, notPart] = dec.split('## What I chose not to build');
const decisions = (decPart.match(/^\| P-\d+ \|/gm) || []).length;
const notBuilt = (notPart.match(/^\| (?!Not built|---)/gm) || []).length;
ok('P2-A02', decisions >= 5 && notBuilt >= 6, `${decisions} decisions, ${notBuilt} not-built items`);

const m = read('docs/design/metrics.md');
const sect = (h) => m.split(h)[1]?.split('\n## ')[0] ?? '';
const rows = (s) => (s.match(/^\| (?!Metric|Guardrail|---)/gm) || []).length;
ok('P2-A03', /## North star/.test(m) && rows(sect('## Supporting metrics')) === 3 && rows(sect('## Guardrails')) === 3 && /## The two-minute task/.test(m),
  `north star ${/## North star/.test(m)}, supporting ${rows(sect('## Supporting metrics'))}, guardrails ${rows(sect('## Guardrails'))}, two-minute task ${/## The two-minute task/.test(m)}`);

const cov = read('docs/design/coverage.md');
const covRows = cov.split('\n').filter((l) => /^\| (?!Track 1 element|Criterion|---)/.test(l));
const empty = covRows.filter((l) => l.split('|').slice(1, -1).some((c) => c.trim() === ''));
ok('P2-A04', covRows.length === 11 && empty.length === 0, `${covRows.length} rows (6 elements + 5 criteria), ${empty.length} with an empty cell`);

const sb = read('docs/design/storyboard.md');
const lens = [...sb.matchAll(/^\| \d+ to \d+ \| (\d+) s \|/gm)].map((x) => Number(x[1]));
const spans = [...sb.matchAll(/^\| (\d+) to (\d+) \|/gm)].map((x) => Number(x[2]) - Number(x[1]));
const total = lens.reduce((a, b) => a + b, 0);
ok('P2-A05', total <= 90 && spans.reduce((a, b) => a + b, 0) === total, `storyboard total ${total} s across ${lens.length} scenes`);
