// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

const GUARD = join(process.cwd(), 'scripts', 'guard.mjs');

function runGuard(files: Record<string, string>) {
  const dir = mkdtempSync(join(tmpdir(), 'collect-guard-'));
  try {
    for (const [rel, text] of Object.entries(files)) {
      const full = join(dir, rel);
      mkdirSync(join(full, '..'), { recursive: true });
      writeFileSync(full, text);
    }
    return spawnSync(process.execPath, [GUARD, '--root', dir], { encoding: 'utf8' });
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

// Planted strings are assembled from parts so this test file does not trip the guard itself.
const live = 'rzp_' + 'live_' + 'x';
const ant = 'sk-' + 'ant-' + 'abc';

describe('guard', () => {
  it('passes a clean tree', () => {
    const r = runGuard({ 'src/a.ts': 'export const a = 1;\n', 'docs/note.md': 'Keys must not be `rzp_' + 'live_`.\n' });
    expect(r.status).toBe(0);
  });

  it('fails on a planted live key', () => {
    const r = runGuard({ 'notes.txt': `key=${live}\n` });
    expect(r.status).not.toBe(0);
    expect(r.stderr).toContain('live Razorpay key prefix');
  });

  it("ignores only the plan's backticked description of the planted value", () => {
    expect(runGuard({ 'PLAN.md': 'plants `' + live + '` in a temp file\n' }).status).toBe(0);
    expect(runGuard({ 'PLAN.md': 'key `' + live + 'Abc123`\n' }).status).not.toBe(0);
  });

  it('fails on an Anthropic key outside .env files but not inside them', () => {
    expect(runGuard({ 'a.md': ant }).status).not.toBe(0);
    expect(runGuard({ '.env': `X=${ant}` }).status).toBe(0);
  });

  it('fails on a clock read outside src/clock.ts', () => {
    expect(runGuard({ 'src/x.ts': 'const t = Date' + '.now();\n' }).status).not.toBe(0);
    expect(runGuard({ 'src/x.ts': 'const t = new ' + 'Date();\n' }).status).not.toBe(0);
    expect(runGuard({ 'src/clock.ts': 'const t = Date' + '.now();\n' }).status).toBe(0);
    expect(runGuard({ 'src/x.ts': "const t = new Date('2026-10-06');\n" }).status).toBe(0);
  });

  it('fails on a WhatsApp deep link outside the hand-off module', () => {
    expect(runGuard({ 'src/x.ts': "const u = 'https://wa" + ".me/1';\n" }).status).not.toBe(0);
    expect(runGuard({ 'src/send/realHandoff.ts': "const u = 'https://wa" + ".me/1';\n" }).status).toBe(0);
  });

  it('fails on handle-like tokens in evidence', () => {
    expect(runGuard({ 'docs/evidence/coded.csv': 'said @some' + 'one\n' }).status).not.toBe(0);
    expect(runGuard({ 'docs/evidence/coded.csv': 'see u/some' + 'one\n' }).status).not.toBe(0);
    expect(runGuard({ 'docs/evidence/coded.csv': 'https://example.com/menu/items\n' }).status).toBe(0);
  });

  it('fails on a mobile-like number but ignores URLs and longer digit runs', () => {
    expect(runGuard({ 'src/x.ts': "const p = '98" + "76543210';\n" }).status).not.toBe(0);
    expect(runGuard({ 'src/x.ts': "const u = 'https://e.com/98" + "76543210';\n" }).status).toBe(0);
    expect(runGuard({ 'src/x.ts': 'const n = 1987654321012;\n' }).status).toBe(0);
  });

  it('fails on a fixture phone that is not the fictional pattern', () => {
    expect(runGuard({ 'fixtures/a.json': '{"phone":"+91 00000 00012"}' }).status).toBe(0);
    expect(runGuard({ 'fixtures/a.json': '{"phone":"+91 12345 00012"}' }).status).not.toBe(0);
  });

  it('fails on rzp_ inside dist', () => {
    expect(runGuard({ 'dist/assets/a.js': 'var k="rzp_' + 'test_abc"' }).status).not.toBe(0);
  });
});
