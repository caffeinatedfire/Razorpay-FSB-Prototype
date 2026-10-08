// P6-T03: plays the 90-second storyboard (docs/design/storyboard.md) on a production build at human
// pace, with a caption bar from demo/captions.json, and records out/demo.webm at 390 × 844.
//
//   npm run demo:record
//
// Rules: the video shows a tap counter, never a seconds counter (no scripted speed is shown as a
// result); the run fails on any request to a non-local host (P6-A02) and if the send sheet does not
// say SIMULATED (P6-A08). Numbers on the cards come from docs/numbers.md.

import { chromium, type Locator } from '@playwright/test';
import { spawn, spawnSync, type ChildProcess } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, readdirSync, renameSync, rmSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

interface Caption { startS: number; endS: number; text: string }

const ROOT = process.cwd();
const PORT = 4173;
const BASE = `http://localhost:${PORT}`;
const OUT = join(ROOT, 'out');
const RAW = join(OUT, 'raw');
const FRAMES = join(OUT, 'frames');
const SIZE = { width: 390, height: 844 };
const TOTAL_S = 90;
const VIDEO_S = 89.5;
const captions = JSON.parse(readFileSync(join(ROOT, 'demo', 'captions.json'), 'utf8')) as Caption[];

function checkCaptions(): void {
  captions.forEach((c, i) => {
    if (c.text.split(/\s+/).length > 14) throw new Error(`caption ${i} is over 14 words`);
    if (c.endS <= c.startS) throw new Error(`caption ${i} ends before it starts`);
    const prev = captions[i - 1];
    if (prev && prev.endS > c.startS) throw new Error(`caption ${i} overlaps the previous one`);
  });
  const last = captions[captions.length - 1];
  if (!last || last.endS > TOTAL_S) throw new Error('captions run past 90 s');
}

/** Playwright's own ffmpeg (VP8/WebM only), used to trim the blank lead-in and to read the duration. */
function findFfmpeg(): string | null {
  const roots = [
    process.env.PLAYWRIGHT_BROWSERS_PATH,
    process.env.LOCALAPPDATA && join(process.env.LOCALAPPDATA, 'ms-playwright'),
    join(homedir(), 'Library', 'Caches', 'ms-playwright'),
    join(homedir(), '.cache', 'ms-playwright'),
  ].filter((r): r is string => Boolean(r) && existsSync(r as string));
  for (const root of roots) {
    for (const dir of readdirSync(root).filter((d) => d.startsWith('ffmpeg')).sort().reverse()) {
      const exe = readdirSync(join(root, dir)).find((f) => /^ffmpeg/.test(f) && !f.includes('.txt'));
      if (exe) return join(root, dir, exe);
    }
  }
  return null;
}

function durationS(ffmpeg: string, file: string): number | null {
  // This ffmpeg build has no null muxer, so read the container's Duration header.
  const r = spawnSync(ffmpeg, ['-hide_banner', '-i', file], { encoding: 'utf8' });
  const m = /Duration:\s*(\d+):(\d+):(\d+(?:\.\d+)?)/.exec(r.stderr ?? '');
  return m ? Number(m[1]) * 3600 + Number(m[2]) * 60 + Number(m[3]) : null;
}

async function waitForServer(url: string, ms = 30_000): Promise<void> {
  const until = performance.now() + ms;
  while (performance.now() < until) {
    try {
      if ((await fetch(url)).ok) return;
    } catch {
      // not up yet
    }
    await new Promise((r) => setTimeout(r, 300));
  }
  throw new Error(`server did not start at ${url}`);
}

function startPreview(): ChildProcess {
  // Always rebuild, so the video never shows a stale build.
  const b = spawnSync(process.execPath, [join('node_modules', 'vite', 'bin', 'vite.js'), 'build'], { stdio: 'ignore' });
  if (b.status !== 0 || !existsSync(join(ROOT, 'dist', 'index.html'))) throw new Error('build failed');
  return spawn(process.execPath, [join('node_modules', 'vite', 'bin', 'vite.js'), 'preview', '--port', String(PORT), '--strictPort'], {
    stdio: 'ignore',
  });
}

// Overlay drawn on top of the app for the video only: caption bar, tap counter, title and end cards,
// and a ring where each tap lands. Injected on every page load.
const OVERLAY = `
(() => {
  const css = \`
    #demo-cap { position: fixed; left: 8px; right: 8px; bottom: 8px; z-index: 2147483646; pointer-events: none;
      background: rgba(10,17,36,.92); color: #fff; font: 600 17px/1.35 system-ui, sans-serif; padding: 10px 12px;
      border-radius: 10px; text-align: center; }
    #demo-cap:empty { display: none; }
    #demo-taps { position: fixed; top: 30px; right: 10px; z-index: 2147483646; pointer-events: none; display: none;
      background: #1c6dc9; color: #fff; font: 700 13px system-ui, sans-serif; padding: 4px 10px; border-radius: 999px; }
    #demo-card { position: fixed; inset: 0; z-index: 2147483645; display: none; background: #111b34; color: #fff;
      font: 16px/1.45 system-ui, sans-serif; padding: 48px 24px 140px; box-sizing: border-box; overflow: hidden; }
    #demo-card h1 { font-size: 30px; margin: 0 0 4px; }
    #demo-card .sub { color: #c3cad8; font-size: 14px; margin: 0 0 22px; }
    #demo-card .q { background: rgba(255,255,255,.08); border-left: 3px solid #5ea3f0; padding: 8px 10px; margin: 8px 0;
      font-size: 15px; }
    #demo-card .src { display: block; color: #c3cad8; font-size: 12px; margin-top: 2px; }
    #demo-card h2 { font-size: 15px; text-transform: uppercase; letter-spacing: .05em; color: #c3cad8; margin: 22px 0 6px; }
    #demo-card .small { color: #c3cad8; font-size: 13px; margin-top: 18px; }
    .demo-ring { position: fixed; z-index: 2147483647; width: 44px; height: 44px; margin: -22px 0 0 -22px; border-radius: 50%;
      border: 3px solid #f5b300; pointer-events: none; animation: demo-ring .6s ease-out forwards; }
    @keyframes demo-ring { from { transform: scale(.4); opacity: 1; } to { transform: scale(1.4); opacity: 0; } }
  \`;
  const add = () => {
    if (document.getElementById('demo-cap')) return;
    const style = document.createElement('style'); style.textContent = css; document.head.appendChild(style);
    for (const id of ['demo-cap', 'demo-taps', 'demo-card']) {
      const el = document.createElement('div'); el.id = id; document.body.appendChild(el);
    }
    window.__demo = {
      caption: (t) => { document.getElementById('demo-cap').textContent = t; },
      taps: (n) => { const el = document.getElementById('demo-taps'); el.style.display = 'block'; el.textContent = 'Taps: ' + n; },
      card: (html) => { const el = document.getElementById('demo-card'); el.innerHTML = html || ''; el.style.display = html ? 'block' : 'none'; },
      ring: (x, y) => { const r = document.createElement('div'); r.className = 'demo-ring'; r.style.left = x + 'px';
        r.style.top = y + 'px'; document.body.appendChild(r); setTimeout(() => r.remove(), 700); },
    };
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', add); else add();
})();
`;

const TITLE_CARD = `
  <h1>Collect</h1>
  <p class="sub">Concept prototype · not a Razorpay product</p>
  <p>A one-person catering, coaching or design business that bills on credit <em>(composite, fictional)</em>.</p>
  <h2>What sellers and the docs say</h2>
  <div class="q">“nowadays people sometimes ignore SMS”<span class="src">Play review of a ledger app (E-001)</span></div>
  <div class="q">“we don't always want to remind our customers ... it will break relation”<span class="src">Play review of a ledger app (E-007)</span></div>
  <div class="q">“You can set a maximum of 3 reminders.”<span class="src">Razorpay docs, automatic reminders (E-074)</span></div>
  <p class="small">Customers, amounts and links are synthetic. Messages are signed by the builder, not by a merchant.</p>
`;

const END_CARD = `
  <h1>How it would be measured</h1>
  <p>North star: overdue value recovered within 14 days of the first reminder. Baseline 35% <em>(assumed)</em>.</p>
  <h2>Left out on purpose</h2>
  <p>Autonomous sending · AI-written messages · Bulk blasts to many customers</p>
  <h2>What is proven</h2>
  <p>Built on synthetic data. Not validated with merchants. Nothing is ever sent.</p>
`;

async function main(): Promise<void> {
  checkCaptions();
  for (const d of [RAW, FRAMES]) {
    rmSync(d, { recursive: true, force: true });
    mkdirSync(d, { recursive: true });
  }
  const server = startPreview();
  const offHost: string[] = [];
  let simulatedSeen = false;
  try {
    await waitForServer(BASE);
    const browser = await chromium.launch();
    const tVideo = performance.now(); // recording starts with the page, before the title card is up
    const context = await browser.newContext({ viewport: SIZE, recordVideo: { dir: RAW, size: SIZE } });
    await context.addInitScript(OVERLAY);
    const page = await context.newPage();
    page.on('request', (req) => {
      const host = new URL(req.url()).hostname;
      if (!['localhost', '127.0.0.1', '[::1]'].includes(host) && !req.url().startsWith('data:')) offHost.push(req.url());
    });

    let t0 = performance.now();
    const at = async (s: number) => {
      const wait = t0 + s * 1000 - performance.now();
      if (wait > 0) await page.waitForTimeout(wait);
      else if (wait < -400) console.warn(`demo: the scene ending at ${s} s overran by ${(-wait / 1000).toFixed(1)} s`);
    };
    const caption = (s: number) => {
      const c = captions.find((x) => x.startS <= s && s < x.endS);
      return page.evaluate((t) => (window as unknown as { __demo: { caption: (t: string) => void } }).__demo.caption(t), c?.text ?? '');
    };
    const card = (html: string) => page.evaluate((h) => (window as unknown as { __demo: { card: (h: string) => void } }).__demo.card(h), html);
    // A still per scene in out/frames/, for checking the video without a player.
    const still = (name: string) => page.screenshot({ path: join(FRAMES, `${name}.png`) });
    let taps = 0;
    const showTaps = () => page.evaluate((n) => (window as unknown as { __demo: { taps: (n: number) => void } }).__demo.taps(n), taps);
    const tap = async (target: Locator, pauseMs = 900) => {
      await target.scrollIntoViewIfNeeded();
      const box = await target.boundingBox();
      if (box) {
        await page.evaluate(({ x, y }) => (window as unknown as { __demo: { ring: (x: number, y: number) => void } }).__demo.ring(x, y), { x: box.x + box.width / 2, y: box.y + box.height / 2 });
      }
      await page.waitForTimeout(250);
      await target.click();
      taps += 1;
      await showTaps();
      await page.waitForTimeout(pauseMs);
    };

    // 0 to 12 s: title card.
    await page.goto(`${BASE}/?demo=1&now=2026-10-06T11:00:00%2B05:30`);
    await card(TITLE_CARD);
    await caption(0);
    t0 = performance.now(); // second 0 of the video, after trimming
    const leadS = (t0 - tVideo) / 1000;
    await at(6);
    await caption(6);
    await still('00-title');
    await at(12);

    // 12 to 30 s: Home. Who to chase today, each with a reason.
    await card('');
    await caption(12);
    await showTaps();
    await at(19);
    await page.getByTestId('chase-card').first().locator('.chip').hover();
    await still('12-home');
    await at(24);
    await page.getByText('Needs you').scrollIntoViewIfNeeded();
    await at(27);
    await page.evaluate(() => window.scrollTo(0, 0));
    await at(30);

    // 30 to 55 s: open the top card, Hinglish, send, the SIMULATED sheet, Sent.
    await caption(30);
    const top = page.getByTestId('chase-card').first();
    const linkName = ((await top.locator('.name').textContent()) ?? '').trim();
    await tap(top.getByRole('button', { name: /^Chase / }), 2500);
    const linkId = decodeURIComponent(new URL(page.url()).hash.split('/')[2] ?? '');
    await tap(page.getByRole('button', { name: 'Hinglish' }), 3000);
    await at(41);
    await tap(page.getByRole('button', { name: 'Send on WhatsApp' }), 600);
    const sheet = page.getByRole('dialog');
    simulatedSeen = ((await sheet.textContent()) ?? '').includes('SIMULATED');
    if (!simulatedSeen) throw new Error('P6-A08: the send sheet does not say SIMULATED');
    await still('41-sheet');
    await at(48);
    await tap(sheet.getByRole('button', { name: 'Confirm (simulated)' }), 500);
    await still('50-sent');
    await at(55);

    // 55 to 70 s: log "promised Friday"; then quiet hours at 22:30.
    await caption(55);
    await tap(page.getByRole('button', { name: 'Log a reply' }), 500);
    await tap(page.getByRole('button', { name: 'Promised a date' }), 500);
    await tap(page.getByRole('button', { name: 'Save promise' }), 1800);
    await tap(page.getByRole('button', { name: 'Back to list' }), 1500);
    await at(62);
    await page.goto(`${BASE}/?now=2026-10-06T22:30:00%2B05:30`);
    await caption(62);
    await showTaps();
    await page.waitForTimeout(1800);
    await tap(page.getByTestId('chase-card').first().getByRole('button', { name: /^Chase / }), 400);
    await page.getByTestId('soft-R01').scrollIntoViewIfNeeded();
    await still('66-quiet-hours');
    await at(70);

    // 70 to 82 s: a SIMULATED payment arrives; Activity shows the quiet "Paid" line.
    await caption(70);
    await page.goto(`${BASE}/?now=2026-10-06T22:30:00%2B05:30#/settings`);
    await caption(70);
    await showTaps();
    await page.locator('#demo-link').selectOption(linkId);
    await page.getByRole('heading', { name: 'Demo controls' }).scrollIntoViewIfNeeded();
    await page.waitForTimeout(1500);
    await tap(page.getByRole('button', { name: 'Simulate: payment arrives', exact: true }), 1500);
    await tap(page.getByRole('link', { name: 'Activity' }), 400);
    const paidLine = page.locator('.timeline li', { hasText: `${linkName} paid` }).first();
    if (!(await paidLine.isVisible())) throw new Error('the Paid line did not appear');
    await still('78-paid');
    await at(82);

    // 82 to 90 s: end card.
    await card(END_CARD);
    await caption(82);
    await still('82-end');
    await at(VIDEO_S);

    const video = page.video();
    await context.close();
    await browser.close();
    const elapsedS = (performance.now() - t0) / 1000;

    const raw = video ? await video.path() : readdirSync(RAW).map((f) => join(RAW, f)).find((f) => f.endsWith('.webm'));
    if (!raw) throw new Error('no video was recorded');
    const out = join(OUT, 'demo.webm');
    rmSync(out, { force: true });
    const ffmpeg = findFfmpeg();
    let videoS: number | null = null;
    if (ffmpeg) {
      // Cut the blank frames before the title card and anything after the end card.
      const cut = spawnSync(ffmpeg, ['-hide_banner', '-loglevel', 'error', '-ss', leadS.toFixed(2), '-i', raw, '-t', String(VIDEO_S),
        '-c:v', 'libvpx', '-b:v', '1500k', '-an', out], { encoding: 'utf8' });
      if (cut.status !== 0) throw new Error(`trim failed: ${cut.stderr}`);
      videoS = durationS(ffmpeg, out);
    } else {
      console.warn('demo: Playwright ffmpeg not found; the video is not trimmed');
      renameSync(raw, out);
    }
    rmSync(RAW, { recursive: true, force: true });

    if (offHost.length) throw new Error(`P6-A02: requests to non-local hosts: ${offHost.join(', ')}`);
    console.log(`demo: SIMULATED shown on the send sheet: ${simulatedSeen}`);
    console.log(`demo: no requests to non-local hosts`);
    console.log(`demo: wrote ${out}`);
    console.log(`demo: script timeline ${elapsedS.toFixed(1)} s from title card to close; lead-in trimmed ${leadS.toFixed(1)} s`);
    if (videoS === null) {
      if (elapsedS > TOTAL_S) throw new Error('P6-A03: the demo runs over 90 s');
    } else {
      console.log(`demo: video duration ${videoS.toFixed(2)} s (measured from the file; limit ${TOTAL_S} s)`);
      if (videoS > TOTAL_S) throw new Error('P6-A03: the demo runs over 90 s');
    }
  } finally {
    server.kill();
  }
}

main().catch((e: unknown) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
