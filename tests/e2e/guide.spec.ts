import { test, expect } from '@playwright/test';
import { newSchool } from '../../frontend/src/data/firstUnits';

test('Mây reacts to answers, offers help and respects reduced motion', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/demo');
  await expect(page.locator('.quest-guide')).toHaveAttribute(
    'data-mood',
    'ready',
  );
  await page.getByRole('button', { name: 'Nhờ Mây nhắc cách chơi' }).click();
  await expect(page.locator('.guide-help')).toBeVisible();
  await page
    .getByRole('button', { name: 'Nhờ Mây nhắc cách chơi' })
    .press('Enter');
  await expect(page.locator('.guide-help')).toBeHidden();
  const source = await page.locator('.demo-picture img').getAttribute('src');
  const answer = newSchool.vocabulary.find(
    (word) => word.imagePath === source,
  )!;
  const wrong = (
    await page.locator('.quiz-options button').allTextContents()
  ).find((text) => text !== answer.term)!;
  await page.getByRole('button', { name: wrong, exact: true }).click();
  await expect(page.locator('.quest-guide')).toHaveAttribute(
    'data-mood',
    'thinking',
  );
  await expect(
    page.getByRole('img', { name: 'Mây đang suy nghĩ cùng bạn' }),
  ).toBeVisible();
  await page.screenshot({
    path: '/tmp/may-thinking-mobile.png',
    fullPage: true,
  });
  await page.getByRole('button', { name: answer.term, exact: true }).click();
  await expect(page.locator('.quest-guide')).toHaveAttribute(
    'data-mood',
    'happy',
  );
  await expect(page.getByRole('status')).toContainText('Chính xác');
  await page.screenshot({ path: '/tmp/may-happy-mobile.png', fullPage: true });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.screenshot({ path: '/tmp/may-happy-desktop.png', fullPage: true });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  expect(
    await page
      .locator('.guide-body')
      .evaluate((element) => getComputedStyle(element).animationName),
  ).toBe('none');
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
