#!/usr/bin/env node
// Renders docs/design/wireframes/*.html to PNG at 390 x 844 (plan P2-T03, P2-A01).
import { chromium } from '@playwright/test';
import { readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const dir = resolve('docs/design/wireframes');
const pages = readdirSync(dir).filter((f) => /^s\d.*\.html$/.test(f)).sort();
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
for (const f of pages) {
  await page.goto(pathToFileURL(join(dir, f)).href);
  const overflow = await page.evaluate(() => ({
    x: document.documentElement.scrollWidth > 390,
    clipped: [...document.querySelectorAll('main')].some((m) => m.scrollHeight > m.clientHeight + 1),
  }));
  const out = join(dir, f.replace(/\.html$/, '.png'));
  await page.screenshot({ path: out });
  console.log(`${f} -> ${f.replace(/\.html$/, '.png')}${overflow.x ? ' HORIZONTAL OVERFLOW' : ''}${overflow.clipped ? ' CONTENT CLIPPED' : ''}`);
}
await browser.close();
