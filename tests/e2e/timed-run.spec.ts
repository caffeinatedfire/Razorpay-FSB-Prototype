// A timed run survives a page reload in the middle (G3 bug: runs on a phone were lost).
import { expect, test } from '@playwright/test';

test('a timed run survives a reload between Start and Sent', async ({ page }) => {
  await page.goto('/?demo=1&timed=1');
  await page.getByLabel(/Label for this run/).fill('reload-check');
  await page.getByRole('button', { name: 'Start' }).click();
  await page.getByTestId('chase-card').first().getByRole('button', { name: /^Chase / }).click();
  await expect(page.getByRole('heading', { name: 'Why now' })).toBeVisible();

  await page.reload();
  await expect(page.getByRole('heading', { name: 'Why now' })).toBeVisible();

  await page.getByRole('button', { name: 'Send on WhatsApp' }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Confirm (simulated)' }).click();
  await expect(page.getByTestId('run-readout')).toBeVisible();

  const end = await page.evaluate(() =>
    JSON.parse(localStorage.getItem('collect.events') ?? '[]').find((e: { name: string }) => e.name === 'timed_end'),
  );
  expect(end.data.label).toBe('reload-check');
  expect(end.data.taps).toBeGreaterThanOrEqual(3);
});

test('Sent says so when Timed run is on but no run was started', async ({ page }) => {
  await page.goto('/?demo=1&timed=1');
  await page.getByTestId('chase-card').first().getByRole('button', { name: /^Chase / }).click();
  await page.getByRole('button', { name: 'Send on WhatsApp' }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Confirm (simulated)' }).click();
  await expect(page.getByTestId('run-missing')).toBeVisible();
});

test('a scroll during a timed run is not counted as a tap (D-28)', async ({ page }) => {
  await page.goto('/?demo=1&timed=1');
  await page.getByLabel(/Label for this run/).fill('scroll-check');
  await page.getByRole('button', { name: 'Start' }).click();
  // A press that moves 80 px before release is a scroll, not a tap.
  await page.mouse.move(200, 600);
  await page.mouse.down();
  await page.mouse.move(200, 520, { steps: 5 });
  await page.mouse.up();
  await page.getByTestId('chase-card').first().getByRole('button', { name: /^Chase / }).click();
  await page.getByRole('button', { name: 'Send on WhatsApp' }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Confirm (simulated)' }).click();
  await expect(page.getByTestId('run-readout')).toContainText('3 taps');
  const end = await page.evaluate(() =>
    JSON.parse(localStorage.getItem('collect.events') ?? '[]').find((e: { name: string }) => e.name === 'timed_end'),
  );
  expect(end.data.targets.split(' | ')).toHaveLength(3);
  expect(end.data.targets).toContain('Send on WhatsApp');
});
