// P3-T09: the happy path at 390 × 844, with axe on S1 to S3 and no horizontal scroll.
import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

const SHOTS = 'docs/evidence/p3';

async function expectAccessible(page: Page, screen: string) {
  const r = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
  const bad = r.violations.filter((v) => v.impact === 'critical' || v.impact === 'serious');
  expect(bad.map((v) => `${screen}: ${v.id} (${v.impact}) ${v.nodes.length} node(s)`)).toEqual([]);
}

async function expectNoHorizontalScroll(page: Page, screen: string) {
  const { sw, cw } = await page.evaluate(() => ({
    sw: document.documentElement.scrollWidth,
    cw: document.documentElement.clientWidth,
  }));
  expect(sw, `${screen} scrolls sideways`).toBeLessThanOrEqual(cw);
}

test('happy path: Home -> Chase -> simulated send -> Sent, in 8 taps or fewer', async ({ page }) => {
  await page.goto('/?demo=1&timed=1');

  // S1 Home
  const cards = page.getByTestId('chase-card');
  await expect(page.getByRole('heading', { name: /Chase today/ })).toBeVisible();
  expect(await cards.count()).toBeGreaterThanOrEqual(3);
  await expectAccessible(page, 'S1');
  await expectNoHorizontalScroll(page, 'S1');
  await page.screenshot({ path: `${SHOTS}/s1-home.png` });

  // Timed run: Start, then the designed path.
  await page.getByLabel(/Label for this run/).fill('e2e');
  await page.getByRole('button', { name: 'Start' }).click();
  await expect(page.getByText('Timed run in progress.')).toBeVisible();

  const firstName = (await cards.first().locator('.name').textContent()) ?? '';
  await cards.first().getByRole('button', { name: /^Chase / }).click();

  // S2 Chase
  await expect(page.getByRole('heading', { name: 'Why now' })).toBeVisible();
  await expect(page.getByRole('heading', { name: firstName })).toBeVisible();
  await expectAccessible(page, 'S2');
  await expectNoHorizontalScroll(page, 'S2');
  await page.screenshot({ path: `${SHOTS}/s2-chase.png` });
  const linkId = decodeURIComponent(new URL(page.url()).hash.split('/')[2] ?? '');
  expect(linkId).toMatch(/^plink_/);

  await page.getByRole('button', { name: 'Send on WhatsApp' }).click();

  // Simulated send sheet
  const sheet = page.getByRole('dialog');
  await expect(sheet).toBeVisible();
  await expect(sheet.getByText('SIMULATED', { exact: true })).toBeVisible();
  await expect(sheet.getByText('nothing leaves your phone')).toBeVisible();
  await expectAccessible(page, 'send sheet');
  await page.screenshot({ path: `${SHOTS}/s2b-send-sheet.png` });
  await sheet.getByRole('button', { name: 'Confirm (simulated)' }).click();

  // S3 Sent
  await expect(page.getByRole('heading', { name: 'Ready in chat (SIMULATED)' })).toBeVisible();
  await expect(page.getByText('Nothing was sent to anyone.')).toBeVisible();
  const readout = page.getByTestId('run-readout');
  await expect(readout).toBeVisible();
  const taps = Number((/(\d+) taps/.exec((await readout.textContent()) ?? '') ?? [])[1]);
  expect(taps).toBeGreaterThan(0);
  expect(taps).toBeLessThanOrEqual(8);
  await expectAccessible(page, 'S3');
  await expectNoHorizontalScroll(page, 'S3');
  // The run time here is the script's speed, not a person's: mask it so no scripted speed is shown as a result.
  await page.screenshot({ path: `${SHOTS}/s3-sent.png`, mask: [readout] });

  // The link was touched exactly once, and the run was recorded.
  const stored = await page.evaluate(() => ({
    state: JSON.parse(localStorage.getItem('collect.v1') ?? '{}'),
    events: JSON.parse(localStorage.getItem('collect.events') ?? '[]'),
  }));
  const link = stored.state.links.find((l: { id: string }) => l.id === linkId);
  expect(link.touchCount).toBe(1);
  const end = stored.events.find((e: { name: string }) => e.name === 'timed_end');
  expect(end.data.taps).toBe(taps);
  console.log(`happy path: ${taps} taps from Start to Sent`);
});
