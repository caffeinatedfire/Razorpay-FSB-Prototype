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
