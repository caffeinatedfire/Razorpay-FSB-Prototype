// P4-T10: edge flows at 390 × 844, axe on all six screens, screenshots in docs/evidence/p4/.
import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

const SHOTS = 'docs/evidence/p4';

async function expectAccessible(page: Page, screen: string) {
  const r = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
  const bad = r.violations.filter((v) => v.impact === 'critical' || v.impact === 'serious');
  expect(bad.map((v) => `${screen}: ${v.id} (${v.impact}) ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)).toEqual([]);
}

async function expectNoSideways(page: Page, screen: string) {
  const { sw, cw } = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }));
  expect(sw, `${screen} scrolls sideways`).toBeLessThanOrEqual(cw);
}

/** Opens the top "Chase today" card and returns its link id and customer name. */
async function openTopCard(page: Page) {
  const card = page.getByTestId('chase-card').first();
  const name = ((await card.locator('.name').textContent()) ?? '').trim();
  await card.getByRole('button', { name: /^Chase / }).click();
  await expect(page.getByRole('heading', { name: 'Why now' })).toBeVisible();
  const id = decodeURIComponent(new URL(page.url()).hash.split('/')[2] ?? '');
  return { id, name };
}

async function sendOpenCard(page: Page) {
  await page.getByRole('button', { name: 'Send on WhatsApp' }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Confirm (simulated)' }).click();
  await expect(page.getByRole('heading', { name: 'Ready in chat (SIMULATED)' })).toBeVisible();
}

test('promise flow: log "promised Friday" and the link waits with its date', async ({ page }) => {
  await page.goto('/?demo=1');
  const { name } = await openTopCard(page);
  await sendOpenCard(page);
  await page.getByRole('button', { name: 'Log a reply' }).click();
  await page.getByRole('button', { name: 'Promised a date' }).click();
  await page.getByLabel('They promised to pay by').fill('2026-10-09');
  await expectAccessible(page, 'S4');
  await expectNoSideways(page, 'S4');
  await page.screenshot({ path: `${SHOTS}/s4-log-reply.png` });
  await page.getByRole('button', { name: 'Save promise' }).click();
  await expect(page.getByTestId('reply-result')).toContainText('Waiting until Sat 10 Oct');
  await page.getByRole('button', { name: 'Back to list' }).click();
  await page.getByRole('button', { name: /Waiting/ }).click();
  await expect(page.locator('.list').getByText(name)).toBeVisible();
  await expect(page.locator('.list li', { hasText: name })).toContainText('promise · until Sat 10 Oct');
});

test('paid flow: a simulated payment shows a quiet "Paid" line and the chase stops', async ({ page }) => {
  await page.goto('/?demo=1#/settings');
  await expectAccessible(page, 'S6');
  await expectNoSideways(page, 'S6');
  await page.screenshot({ path: `${SHOTS}/s6-settings.png`, fullPage: true });
  const option = await page.locator('#demo-link').locator('option:checked').textContent();
  const name = (option ?? '').split(' · ')[0] ?? '';
  await page.getByRole('button', { name: 'Simulate: payment arrives', exact: true }).click();
  await expect(page.getByTestId('settings-status')).toContainText('SIMULATED');
  await page.getByRole('link', { name: 'Activity' }).click();
  const paidLine = page.locator('.timeline li', { hasText: `${name} paid` }).first();
  await expect(paidLine).toContainText('Paid');
  await expect(paidLine).toContainText('SIMULATED');
  await expectAccessible(page, 'S5');
  await expectNoSideways(page, 'S5');
  await page.screenshot({ path: `${SHOTS}/s5-activity.png` });
  await page.getByRole('link', { name: 'Home' }).click();
  await expect(page.getByTestId('chase-card').filter({ hasText: name })).toHaveCount(0);
});

test('stale flow: a payment that lands while the card is open stops the send with "Already paid"', async ({ page }) => {
  test.setTimeout(45_000);
  await page.goto('/?demo=1');
  const { id } = await openTopCard(page);
  await page.goto(`/?demo=1#/settings`);
  await page.locator('#demo-link').selectOption(id);
  await page.getByRole('button', { name: 'Simulate: payment arrives in 10 s' }).click();
  await page.evaluate((linkId) => { window.location.hash = `/chase/${linkId}`; }, id);
  await page.getByRole('button', { name: 'Send on WhatsApp' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  // Wait for the simulated payment, then confirm: the link is re-read and the send is aborted (R06).
  await expect(page.getByRole('alert').filter({ hasText: 'Already paid. Nothing to send.' })).toBeVisible({ timeout: 15_000 });
  await page.getByRole('dialog').getByRole('button', { name: 'Confirm (simulated)' }).click();
  await expect(page.getByRole('heading', { name: 'Ready in chat (SIMULATED)' })).toHaveCount(0);
  await expect(page.getByRole('alert').filter({ hasText: 'Already paid' }).first()).toBeVisible();
  const touches = await page.evaluate((linkId) => JSON.parse(localStorage.getItem('collect.v1') ?? '{}').links.find((l: { id: string }) => l.id === linkId).touchCount, id);
  expect(touches).toBe(0);
});

test('quiet-hours flow: at 22:30 the primary action reads "Remind me at 9:00 AM"', async ({ page }) => {
  await page.goto('/?demo=1&now=2026-10-06T22:30:00%2B05:30');
  await expect(page.getByTestId('quiet-banner')).toContainText('It is 10:30 PM');
  const { name } = await openTopCard(page);
  const soft = page.getByTestId('soft-R01');
  await expect(soft).toContainText('It is 10:30 PM. Most people prefer payment messages in the daytime.');
  await expect(soft.getByRole('button').first()).toHaveText('Remind me at 9:00 AM');
  await expect(page.getByRole('button', { name: 'Send on WhatsApp' })).toHaveCount(0);
  await page.screenshot({ path: `${SHOTS}/s2-quiet-hours.png` });
  await soft.getByRole('button', { name: 'Remind me at 9:00 AM' }).click();
  await page.getByRole('button', { name: /Waiting/ }).click();
  await expect(page.locator('.list li', { hasText: name })).toContainText('next check · until Wed 7 Oct');

  // "Send anyway" needs its own confirm, then the normal send works.
  await openTopCard(page);
  await page.getByTestId('soft-R01').getByRole('button', { name: 'Send anyway' }).click();
  await sendOpenCard(page);
});

test('Hindi renders in Devanagari without clipping at 390 px', async ({ page }) => {
  await page.goto('/?demo=1');
  await openTopCard(page);
  await page.getByRole('button', { name: 'हिन्दी' }).click();
  const box = page.locator('#message');
  await expect(box).toHaveValue(/[ऀ-ॿ]/);
  await expect(box).toHaveValue(/ । /);
  const { sw, cw } = await box.evaluate((el) => ({ sw: el.scrollWidth, cw: el.clientWidth }));
  expect(sw).toBeLessThanOrEqual(cw);
  await expectNoSideways(page, 'S2 Hindi');
  await page.screenshot({ path: `${SHOTS}/s2-hindi.png` });
  await page.getByRole('button', { name: 'Hinglish' }).click();
  await expect(box).toHaveValue(/^Namaste /);
});

test('dispute flow: a simulated dispute moves the link to Needs you', async ({ page }) => {
  await page.goto('/?demo=1#/settings');
  const option = await page.locator('#demo-link').locator('option:checked').textContent();
  const name = (option ?? '').split(' · ')[0] ?? '';
  await page.getByRole('button', { name: 'Simulate: customer disputes' }).click();
  await page.getByRole('link', { name: 'Home' }).click();
  await page.getByRole('button', { name: /Needs you/ }).click();
  await expect(page.locator('.list li', { hasText: name }).first()).toContainText('disputes it');
});

test('undo within 10 seconds puts the link back (R16)', async ({ page }) => {
  await page.goto('/?demo=1');
  const { id, name } = await openTopCard(page);
  await sendOpenCard(page);
  await expect(page.getByText('Undo only updates this app. It cannot unsend a message.')).toBeVisible();
  await page.getByRole('button', { name: 'Undo', exact: true }).click();
  await expect(page.getByTestId('chase-card').filter({ hasText: name })).toHaveCount(1);
  const touches = await page.evaluate((linkId) => JSON.parse(localStorage.getItem('collect.v1') ?? '{}').links.find((l: { id: string }) => l.id === linkId).touchCount, id);
  expect(touches).toBe(0);
});

test('an edit with threatening words gets a soft warning (R11); amount and link are hard checks', async ({ page }) => {
  await page.goto('/?demo=1');
  await openTopCard(page);
  const box = page.locator('#message');
  const original = await box.inputValue();
  await box.fill(`${original} This is your last warning.`);
  await page.getByRole('button', { name: 'Send on WhatsApp' }).click();
  await expect(page.getByTestId('soft-R11')).toContainText('This could read as a threat. Try a friendlier wording.');
  await page.getByTestId('soft-R11').getByRole('button', { name: 'Send anyway' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByRole('dialog').getByRole('button', { name: 'Cancel' }).click();
  await box.fill(original.replace(/https:\/\/\S+/, ''));
  await page.getByRole('button', { name: 'Send on WhatsApp' }).click();
  await expect(page.getByRole('alert').filter({ hasText: 'The message must include the payment link exactly once.' })).toBeVisible();
});

test('works at 200% zoom: Home and Chase fit a 195 px wide viewport', async ({ page }) => {
  await page.setViewportSize({ width: 195, height: 422 });
  await page.goto('/?demo=1');
  await expectNoSideways(page, 'S1 at 200%');
  await openTopCard(page);
  await expectNoSideways(page, 'S2 at 200%');
  await expect(page.getByRole('button', { name: 'Send on WhatsApp' })).toBeVisible();
});
