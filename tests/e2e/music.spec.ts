import { test, expect } from '@playwright/test';

test('local music is opt-in, continues through navigation and stops on request', async ({
  page,
}) => {
  await page.goto('/');
  const audio = page.locator('.background-music audio');
  await expect(audio).toHaveJSProperty('paused', true);
  await expect(audio).toHaveAttribute('preload', 'none');
  await page.getByRole('button', { name: 'Bật nhạc nền', exact: true }).click();
  await expect(audio).toHaveJSProperty('paused', false);
  await expect
    .poll(() =>
      audio.evaluate((element: HTMLAudioElement) => element.readyState),
    )
    .toBeGreaterThanOrEqual(2);
  await expect(audio).toHaveJSProperty('loop', true);
  const before = await audio.evaluate(
    (element: HTMLAudioElement) => element.currentTime,
  );
  await page
    .getByRole('navigation')
    .getByRole('link', { name: 'Thử thách', exact: true })
    .click();
  await expect(audio).toHaveJSProperty('paused', false);
  expect(
    await audio.evaluate((element: HTMLAudioElement) => element.currentTime),
  ).toBeGreaterThanOrEqual(before);
  await page.getByRole('button', { name: 'Tắt nhạc nền', exact: true }).click();
  await expect(audio).toHaveJSProperty('paused', true);
  await page.reload();
  await expect(
    page.getByRole('button', { name: 'Bật nhạc nền', exact: true }),
  ).toBeVisible();
  await expect(audio).toHaveJSProperty('paused', true);
});
