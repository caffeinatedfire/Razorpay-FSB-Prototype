#!/usr/bin/env node
// Safety guard (plan Appendix A). Fails on live keys, stray clocks, real-looking phone numbers,
// handles in evidence, WhatsApp deep links outside the hand-off module, and key leaks in dist/.
//
// Usage:
//   node scripts/guard.mjs                 scan the working tree
//   node scripts/guard.mjs --root <dir>    scan another folder (used by the guard's own test)
//   node scripts/guard.mjs --history       also scan every commit in git history
//
// Literal trigger strings are assembled from parts so this file does not trip itself.

import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { execFileSync } from 'node:child_process';

const args = process.argv.slice(2);
const rootIdx = args.indexOf('--root');
const ROOT = rootIdx >= 0 ? args[rootIdx + 1] : process.cwd();
const HISTORY = args.includes('--history');

const LIVE = 'rzp_' + 'live_';
const ANT = 'sk-' + 'ant-';
const NOW_CALL = 'Date' + '.now(';
const BARE_DATE = 'new ' + 'Date()';
const WA = 'wa' + '.me';

// A key-like character must follow the prefix, so prose that names the bare prefix in backticks
// passes while a planted key fails. The plan's own description of the guard test (the prefix plus
// "x", inside backticks) is documentation, not a key, and is ignored. Decision D-11.
const LIVE_RE = new RegExp('(?<!`)' + LIVE + '[A-Za-z0-9]|' + LIVE + '(?!x`)[A-Za-z0-9]');
const ANT_RE = new RegExp(ANT + '[A-Za-z0-9]');
const HANDLE_RE = /(?<![\w])(@\w{3,}|u\/\w{3,})/;
const MOBILE_RE = /(?<!\d)[6-9]\d{9}(?!\d)/;
const URL_RE = /https?:\/\/\S+/g;
const FIXTURE_PHONE_RE = /^\+91 00000 000\d\d$/;

const SKIP_DIRS = new Set(['node_modules', '.git', 'test-results', 'playwright-report', 'out', 'submission']);
const BINARY_EXT = /\.(png|jpe?g|gif|webp|ico|webm|mp4|pdf|zip|woff2?|ttf)$/i;
const CODE_EXT = /\.(ts|tsx|js|mjs|cjs|jsx)$/i;

function walk(dir, out = []) {
  if (!existsSync(dir)) return out;
  for (const name of readdirSync(dir)) {
    if (SKIP_DIRS.has(name)) continue;
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) walk(full, out);
    else if (!BINARY_EXT.test(name)) out.push(full);
  }
  return out;
}

const posix = (p) => p.split(sep).join('/');
const isEnvFile = (rel) => /(^|\/)\.env(\.[\w-]+)?$/.test(rel);
const inDir = (rel, d) => rel === d || rel.startsWith(d + '/');

function readOwnWhatsapp() {
  const p = join(ROOT, '.env.local');
  if (!existsSync(p)) return null;
  const m = readFileSync(p, 'utf8').match(/^\s*VITE_OWN_WHATSAPP\s*=\s*(\d{6,})/m);
  return m ? m[1] : null;
}

/** Checks for one file's text. Returns a list of problems. `rel` is a posix path from ROOT. */
function checkText(rel, text, ownWhatsapp) {
  const problems = [];
  const lines = text.split(/\r?\n/);
  const isCode = CODE_EXT.test(rel);
  const isDist = inDir(rel, 'dist');

  lines.forEach((line, i) => {
    const at = `${rel}:${i + 1}`;
    if (LIVE_RE.test(line)) problems.push(`${at} live Razorpay key prefix`);
    if (!isEnvFile(rel) && ANT_RE.test(line)) problems.push(`${at} Anthropic key prefix`);
    if (isCode && rel !== 'src/clock.ts' && !isDist) {
      if (line.includes(NOW_CALL)) problems.push(`${at} ${NOW_CALL}) outside src/clock.ts (R14)`);
      if (line.includes(BARE_DATE)) problems.push(`${at} ${BARE_DATE} outside src/clock.ts (R14)`);
    }
    if ((isCode || isDist) && rel !== 'src/send/realHandoff.ts' && line.includes(WA)) {
      problems.push(`${at} ${WA} outside src/send/realHandoff.ts (R15)`);
    }
    if (inDir(rel, 'docs/evidence')) {
      const m = line.match(HANDLE_RE);
      if (m) problems.push(`${at} handle-like token "${m[0]}"`);
    }
    if (['fixtures', 'src', 'docs/evidence', 'dist'].some((d) => inDir(rel, d))) {
      if (MOBILE_RE.test(line.replace(URL_RE, ' '))) problems.push(`${at} 10-digit mobile-like number`);
    }
    if (isDist) {
      if (line.includes('rzp_')) problems.push(`${at} "rzp_" inside dist/`);
      if (ownWhatsapp && line.includes(ownWhatsapp)) problems.push(`${at} owner's WhatsApp number inside dist/`);
    }
  });

  if (inDir(rel, 'fixtures') && rel.endsWith('.json')) {
    for (const m of text.matchAll(/"phone"\s*:\s*"([^"]*)"/g)) {
      if (!FIXTURE_PHONE_RE.test(m[1])) problems.push(`${rel} fixture phone "${m[1]}" is not +91 00000 000NN`);
    }
  }
  return problems;
}

function scanTree() {
  const own = readOwnWhatsapp();
  const problems = [];
  for (const full of walk(ROOT)) {
    const rel = posix(relative(ROOT, full));
    problems.push(...checkText(rel, readFileSync(full, 'utf8'), own));
  }
  return problems;
}

function scanHistory() {
  let log;
  try {
    log = execFileSync('git', ['log', '-p', '--all', '--no-color', '--format=commit %H'], {
      cwd: ROOT, encoding: 'utf8', maxBuffer: 512 * 1024 * 1024,
    });
  } catch {
    return ['git history could not be read'];
  }
  const problems = [];
  let commit = '';
  let file = '';
  for (const line of log.split(/\r?\n/)) {
    if (line.startsWith('commit ')) { commit = line.slice(7, 15); continue; }
    if (line.startsWith('+++ ')) { file = line.replace(/^\+\+\+ (b\/)?/, ''); continue; }
    if (!line.startsWith('+') || line.startsWith('+++')) continue;
    const added = line.slice(1);
    const at = `history ${commit} ${file}`;
    if (LIVE_RE.test(added)) problems.push(`${at} live Razorpay key prefix`);
    if (!isEnvFile(file) && ANT_RE.test(added)) problems.push(`${at} Anthropic key prefix`);
    if (inDir(file, 'docs/evidence') && HANDLE_RE.test(added)) problems.push(`${at} handle-like token`);
    if (['fixtures', 'src', 'docs/evidence'].some((d) => inDir(file, d)) && MOBILE_RE.test(added.replace(URL_RE, ' '))) {
      problems.push(`${at} 10-digit mobile-like number`);
    }
  }
  return problems;
}

const problems = scanTree();
if (HISTORY) problems.push(...scanHistory());

if (problems.length) {
  console.error(`guard: ${problems.length} problem(s)`);
  for (const p of problems) console.error('  ' + p);
  process.exit(1);
}
console.log(`guard: ok${HISTORY ? ' (working tree and history)' : ''}`);
