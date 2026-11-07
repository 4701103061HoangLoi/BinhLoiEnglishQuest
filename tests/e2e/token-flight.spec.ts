import { test, expect } from '@playwright/test';

test('sentence tokens fly up and down, reset together and respect reduced motion', async ({
  page,
}) => {
  await page.addInitScript(() => {
    const state = window as Window & {
      tokenFlights?: { zone?: string; transforms: string[] }[];
    };
    state.tokenFlights = [];
    const original = Element.prototype.animate;
    Element.prototype.animate = function (frames, options) {
      if (
        this instanceof HTMLElement &&
        this.dataset.tokenId &&
        Array.isArray(frames)
      ) {
        state.tokenFlights!.push({
          zone: this.dataset.tokenZone,
          transforms: frames.map((frame) => String(frame.transform ?? '')),
        });
      }
      return original.call(this, frames, options);
    };
  });
  const flights = () =>
    page.evaluate(
      () =>
        (
          window as Window & {
            tokenFlights?: { zone?: string; transforms: string[] }[];
          }
        ).tokenFlights ?? [],
    );
  await page.setViewportSize({ width: 390, height: 900 });
  await page.goto('/play/my-new-school/sentence-builder');
  await page.getByRole('button', { name: 'Bắt đầu chơi', exact: true }).click();
  await page.locator('.token-bank button:enabled').first().click();
  await expect(page.locator('.sentence-answer button')).toHaveCount(1);
  const up = (await flights())[0];
  expect(up.zone).toBe('answer');
  expect(
    Number(up.transforms[0].match(/translate\([^,]+,\s*(-?[\d.]+)px/)![1]),
  ).toBeGreaterThan(0);
  await page.locator('.sentence-answer button').first().click();
  await expect(page.locator('.sentence-answer button')).toHaveCount(0);
  const down = (await flights())[1];
  expect(down.zone).toBe('bank');
  expect(
    Number(down.transforms[0].match(/translate\([^,]+,\s*(-?[\d.]+)px/)![1]),
  ).toBeLessThan(0);
  // Rapid clicks update game state immediately, without waiting for the flights.
  for (let i = 0; i < 3; i++)
    await page
      .locator('.token-bank button:enabled')
      .nth(i)
      .dispatchEvent('click');
  await expect(page.locator('.sentence-answer button')).toHaveCount(3);
  await page.getByRole('button', { name: 'Làm lại câu', exact: true }).click();
  await expect(page.locator('.sentence-answer button')).toHaveCount(0);
  expect(
    (await flights()).filter((flight) => flight.zone === 'bank'),
  ).toHaveLength(4);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const before = (await flights()).length;
  await page.locator('.token-bank button:enabled').first().click();
  await expect(page.locator('.sentence-answer button')).toHaveCount(1);
  expect((await flights()).length).toBe(before);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.evaluate(() => {
    document.documentElement.dataset.reducedMotion = 'true';
  });
  await page.locator('.sentence-answer button').first().click();
  await expect(page.locator('.sentence-answer button')).toHaveCount(0);
  expect((await flights()).length).toBe(before);
});
