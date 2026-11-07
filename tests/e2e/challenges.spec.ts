import { test, expect } from '@playwright/test';
import { topics, gameIds, gameInfo } from '../../frontend/src/data/neighbourhood';

test('challenge tab selects topics, opens all games and keeps navigation responsive', async ({
  page,
}) => {
  await page.goto('/');
  await page
    .getByRole('navigation')
    .getByRole('link', { name: 'Thử thách', exact: true })
    .click();
  await expect(page).toHaveURL(/\/challenges$/);
  await expect(
    page.getByRole('heading', { name: 'Thử thách tiếng Anh' }),
  ).toBeVisible();
  for (const topic of topics) {
    await page.getByLabel('Chủ đề thử thách').selectOption(topic.id);
    for (const id of gameIds) {
      await page
        .locator('.game-links')
        .getByRole('link', { name: new RegExp(gameInfo[id].title) })
        .click();
      await expect(
        page.getByRole('heading', { name: gameInfo[id].title, exact: true }),
      ).toBeVisible();
      await page
        .getByRole('link', { name: topic.titleEn, exact: true })
        .click();
      await expect(page).toHaveURL(
        new RegExp(`/challenges\\?topic=${topic.id}$`),
      );
      await expect(page.getByLabel('Chủ đề thử thách')).toHaveValue(topic.id);
    }
  }
  for (const width of [360, 390, 640, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    await expect(
      page
        .getByRole('navigation')
        .getByRole('link', { name: 'Thử thách', exact: true }),
    ).toHaveAttribute('aria-current', 'page');
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    if (width === 390 || width === 1440)
      await page.screenshot({
        path: `/tmp/challenges-${width}.png`,
        fullPage: true,
      });
  }
});
