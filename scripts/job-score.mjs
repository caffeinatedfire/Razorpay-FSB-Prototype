#!/usr/bin/env node
// Recomputes the P1 job score and H1 to H4 from docs/evidence/coded.csv (plan Appendix G).
// Prints the arithmetic so docs/evidence/job-score.md can be checked line by line.
import { readFileSync } from 'node:fs';

function parseCsv(text) {
  const rows = [];
  let row = [], field = '', inQ = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQ) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') inQ = false;
      else field += c;
    } else if (c === '"') inQ = true;
    else if (c === ',') { row.push(field); field = ''; }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(field); rows.push(row); row = []; field = '';
    } else field += c;
  }
  if (field || row.length) { row.push(field); rows.push(row); }
  const [head, ...body] = rows.filter((r) => r.length > 1);
  return body.map((r) => Object.fromEntries(head.map((h, i) => [h, r[i] ?? ''])));
}

const rows = parseCsv(readFileSync('docs/evidence/coded.csv', 'utf8'));
const firstHand = rows.filter((r) => r.source_type === 'forum' || r.source_type === 'app_review');
// Coverage from docs/evidence/existing-product.md: 0 fully, 1 partly, 2 not covered or not documented.
const UNMET = { collect: 1, dispute: 1, payout: 1 };
const r3 = (x) => Math.round(x * 1000) / 1000;
const pct = (k, n) => `${Math.round((100 * k) / n)}% of ${n}`;

function score(job, mobileOverride) {
  const fh = firstHand.filter((r) => r.job === job);
  const n = fh.length;
  const meanPain = fh.reduce((s, r) => s + Number(r.pain), 0) / n;
  const mob = fh.filter((r) => (mobileOverride ? mobileOverride(r) : Number(r.mobile_signal) >= 1)).length;
  const t1 = 0.3 * Math.min(n / 25, 1);
  const t2 = 0.25 * (meanPain / 3);
  const t3 = 0.25 * (mob / n);
  const t4 = 0.2 * (UNMET[job] / 2);
  return { job, n, meanPain, mob, t1, t2, t3, t4, total: t1 + t2 + t3 + t4 };
}

const jobs = ['collect', 'dispute', 'payout'];
const print = (label, override) => {
  console.log(`\n${label}`);
  console.log('| Job | n | 0.30 x min(n/25,1) | mean pain | 0.25 x pain/3 | mobile >= 1 | 0.25 x share | unmet | 0.20 x unmet/2 | Score |');
  console.log('| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |');
  const out = jobs.map((j) => score(j, override));
  for (const s of out) {
    console.log(`| ${s.job} | ${s.n} | 0.30 x ${r3(Math.min(s.n / 25, 1))} = ${r3(s.t1)} | ${r3(s.meanPain)} | ${r3(s.t2)} | ${s.mob} of ${s.n} | ${r3(s.t3)} | ${UNMET[s.job]} | ${r3(s.t4)} | **${r3(s.total)}** |`);
  }
  return out;
};

const main = print('Scores as coded');
print('Sensitivity: every app-store review counted as mobile_signal >= 1', () => true);

const collect = main.find((s) => s.job === 'collect');
const best = main.filter((s) => s.job !== 'collect').sort((a, b) => b.total - a.total)[0];
const margin = best.total - collect.total;
const eligible = best.n >= 15;
console.log(`\nBest alternative: ${best.job} at ${r3(best.total)}; margin over collect ${r3(margin)}; first-hand rows ${best.n}.`);
console.log(margin > 0.1 && eligible
  ? 'Switch rule: RECOMMEND A SWITCH (margin > 0.10 and n >= 15). The human decides at G1.'
  : 'Switch rule: KEEP COLLECT (no alternative beats it by more than 0.10 with n >= 15).');

const fh = firstHand.filter((r) => r.job === 'collect');
const n = fh.length;
const has = (r, tag) => r.notes.split(/[;,]\s*/).some((t) => t.trim() === tag);
const h1 = fh.filter((r) => has(r, 'manual') || r.device_or_channel.includes('call') || r.device_or_channel.includes('in_person'));
const h2 = fh.filter((r) => ['notebook', 'spreadsheet', 'memory', 'chat_scroll'].includes(r.workaround));
const h3 = fh.filter((r) => has(r, 'relationship'));
const h4 = fh.filter((r) => Number(r.mobile_signal) >= 1);
console.log('\nHypotheses for Collect (first-hand rows only)');
for (const [id, set] of [['H1 manual chasing', h1], ['H2 memory and notes', h2], ['H3 relationship cost', h3], ['H4 phone-first', h4]]) {
  const weak = set.length / n < 0.25 || n < 25 ? ' (weak)' : '';
  console.log(`${id}: ${pct(set.length, n)}${weak} -> ${set.map((r) => r.id).join(', ')}`);
}
