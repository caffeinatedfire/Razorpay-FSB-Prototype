// P6-T05: renders note/note.md to note/note.pdf (A4, 10.5 pt or larger) and fails unless it is exactly one page.
//
//   npm run note:pdf
//
// The Markdown subset is the note's own: headings, paragraphs, ordered and unordered lists, bold,
// italics, a rule, and bare links. No Markdown library is needed for that.

import { chromium } from '@playwright/test';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const SRC = join(ROOT, 'note', 'note.md');
const OUT = join(ROOT, 'note', 'note.pdf');
export const FONT_PT = 10.5;

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function inline(s: string): string {
  return esc(s)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^*])\*(?!\s)(.+?)\*/g, '$1<em>$2</em>')
    .replace(/(https?:\/\/[^\s<]+[^\s<.,;:)])/g, '<a href="$1">$1</a>')
    .replace(/\[YOU([^\]]*)\]/g, '<mark>[YOU$1]</mark>');
}

export function markdownToHtml(md: string): string {
  const out: string[] = [];
  let list: 'ul' | 'ol' | null = null;
  let para: string[] = [];
  const flushPara = () => {
    if (para.length) out.push(`<p>${inline(para.join(' '))}</p>`);
    para = [];
  };
  const closeList = () => {
    if (list) out.push(`</${list}>`);
    list = null;
  };
  for (const raw of md.split(/\r?\n/)) {
    const line = raw.trimEnd();
    const h = /^(#{1,3})\s+(.*)$/.exec(line);
    const ul = /^[-*]\s+(.*)$/.exec(line);
    const ol = /^\d+\.\s+(.*)$/.exec(line);
    if (h) {
      flushPara(); closeList();
      const level = (h[1] ?? '#').length;
      out.push(`<h${level}>${inline(h[2] ?? '')}</h${level}>`);
    } else if (line === '---') {
      flushPara(); closeList();
      out.push('<hr>');
    } else if (ul || ol) {
      flushPara();
      const kind = ul ? 'ul' : 'ol';
      if (list !== kind) { closeList(); out.push(`<${kind}>`); list = kind; }
      out.push(`<li>${inline((ul ?? ol)?.[1] ?? '')}</li>`);
    } else if (line === '') {
      flushPara(); closeList();
    } else {
      closeList();
      para.push(line);
    }
  }
  flushPara(); closeList();
  return out.join('\n');
}

export function wordCount(md: string): number {
  const body = md.split(/\n---\n/)[0] ?? md; // the footer is not counted
  return body.replace(/^#.*$/gm, '').split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w)).length;
}

const CSS = `
  @page { size: A4; margin: 11mm 13mm; }
  body { font: ${FONT_PT}pt/1.32 "Segoe UI", system-ui, -apple-system, Roboto, sans-serif; color: #0f1c3a; margin: 0; }
  h1 { font-size: 15pt; margin: 0 0 1pt; }
  h2 { font-size: 11pt; margin: 6pt 0 1pt; color: #111b34; }
  p, ul, ol { margin: 0 0 3pt; }
  ul, ol { padding-left: 15pt; }
  li { margin: 0; }
  hr { border: 0; border-top: 0.5pt solid #b8c0cc; margin: 6pt 0 3pt; }
  hr + p { font-size: ${FONT_PT}pt; color: #3e4651; }
  a { color: #0560b9; text-decoration: none; }
  mark { background: #fff1b8; }
`;

async function main(): Promise<void> {
  const md = readFileSync(SRC, 'utf8');
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Collect: one-page note</title><style>${CSS}</style></head><body>${markdownToHtml(md)}</body></html>`;
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'load' });
  const pdf = await page.pdf({ format: 'A4', printBackground: true, preferCSSPageSize: true });
  await browser.close();
  writeFileSync(OUT, pdf);
  const pages = (pdf.toString('latin1').match(/\/Type\s*\/Page(?!s)/g) ?? []).length;
  console.log(`note: ${wordCount(md)} words before the footer; font ${FONT_PT} pt; ${pages} page(s); wrote ${OUT}`);
  if (pages !== 1) {
    console.error('P6-A04: the note must be exactly one page');
    process.exit(1);
  }
}

const isMain = process.argv[1] && /note-pdf\.ts$/.test(process.argv[1]);
if (isMain) {
  main().catch((e: unknown) => {
    console.error(e instanceof Error ? e.message : e);
    process.exit(1);
  });
}
