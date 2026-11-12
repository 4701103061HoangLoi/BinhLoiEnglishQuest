import { test, expect } from '@playwright/test';
test('daily review saves five distinct words and survives reload on mobile', async ({
  page,
}) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto('/');
  await page.getByRole('link', { name: 'Ôn cùng Mây' }).click();
  for (let i = 0; i < 5; i++) {
    await page.locator('.review-options button').first().click();
    await expect(page.locator('.example')).toBeVisible();
    if (i === 0)
      await page.screenshot({ path: '/tmp/review-mobile.png', fullPage: true });
    await expect(page.locator('.review-options button').first()).toBeDisabled();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page
      .getByRole('button', {
        name: i === 4 ? 'Xem kết quả ôn tập' : 'Từ tiếp theo',
      })
      .click();
  }
  await expect(page.getByText('Bạn đã đạt mục tiêu hôm nay.')).toBeVisible();
  await page.getByRole('link', { name: 'Về trang chủ' }).click();
  await page.reload();
  await expect(page.locator('.daily-review')).toContainText('5/5 từ');
  await expect(page.locator('.daily-review')).toContainText(
    '1 ngày học liên tiếp',
  );
  await page.goto('/review');
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.screenshot({ path: '/tmp/review-desktop.png', fullPage: true });
});
