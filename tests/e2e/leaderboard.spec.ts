import { test, expect, type Page } from '@playwright/test';
import { newSchool } from '../../frontend/src/data/firstUnits';
const origin = 'http://127.0.0.1:3011';
async function playAndPublish(page: Page, nickname: string) {
  await page.goto(`${origin}/play/my-new-school/quick-quiz`);
  await page.getByRole('button', { name: 'Bắt đầu chơi' }).click();
  for (let i = 0; i < 5; i++) {
    const prompt = await page.locator('.question').innerText();
    const question = newSchool.quiz.find((item) => item.prompt === prompt)!;
    const answer = question.options.find(
      (option) => option.id === question.correctOptionId,
    )!;
    await page
      .locator('.quiz-option')
      .filter({ has: page.getByText(answer.text, { exact: true }) })
      .click();
    await page
      .getByRole('button', { name: i === 4 ? 'Xem kết quả' : 'Câu tiếp theo' })
      .click();
  }
  await expect(page).toHaveURL(/\/results\//);
  const trigger = page.getByRole('button', { name: 'Đăng điểm', exact: true });
  await trigger.click();
  await expect(page.getByLabel('Biệt danh hiển thị công khai')).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(trigger).toBeFocused();
  await trigger.click();
  await page.getByLabel('Biệt danh hiển thị công khai').fill(nickname);
  await page
    .getByRole('dialog')
    .getByRole('button', { name: 'Đăng điểm', exact: true })
    .click();
  await expect(
    page.getByText('Đã cập nhật điểm cao nhất của bạn.'),
  ).toBeVisible();
  await page.getByRole('link', { name: 'Xem bảng xếp hạng' }).click();
}
test('two visitors publish through results, see shared rankings and remove their own scores', async ({
  page,
  browser,
}) => {
  test.setTimeout(60000);
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${origin}/leaderboard`);
  await expect(page.getByText('Chưa có điểm ở bảng này')).toBeVisible();
  await playAndPublish(page, 'Mây khám phá');
  await expect(
    page.getByRole('rowheader', { name: /Mây khám phá/ }),
  ).toBeVisible();
  const other = await browser.newContext();
  try {
    const bob = await other.newPage();
    await bob.goto(`${origin}/leaderboard`);
    await expect(
      bob.getByRole('rowheader', { name: 'Mây khám phá', exact: true }),
    ).toBeVisible();
    await expect(bob.getByText(/Bạn đang ở hạng/)).toHaveCount(0);
    await playAndPublish(bob, 'Bạn học tiếng Anh cùng Mây mỗi ngày');
    await page.getByRole('button', { name: 'Làm mới' }).click();
    await expect(page.getByRole('rowheader')).toHaveCount(2);
    await page.getByLabel('Chủ đề', { exact: true }).selectOption('my-house');
    await expect(page.getByText('Chưa có điểm ở bảng này')).toBeVisible();
    await page
      .getByLabel('Chủ đề', { exact: true })
      .selectOption('my-new-school');
    await expect(page.getByRole('rowheader')).toHaveCount(2);
    for (const width of [360, 390, 640, 768, 1024, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      if ([360, 1024, 1440].includes(width))
        await page.screenshot({
          path: `test-results/leaderboard-${width}.png`,
          fullPage: true,
        });
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        `overflow at ${width}`,
      ).toBe(true);
    }
    await page
      .getByRole('button', { name: 'Gỡ toàn bộ điểm tôi đã đăng' })
      .click();
    await page
      .getByRole('button', { name: 'Gỡ toàn bộ điểm', exact: true })
      .click();
    await expect(page.getByRole('rowheader')).toHaveCount(1);
    await expect(
      page.getByRole('rowheader', { name: /Mây khám phá/ }),
    ).toHaveCount(0);
    await bob.reload();
    await expect(bob.getByRole('rowheader')).toHaveCount(1);
    await expect(bob.getByText(/Bạn đang ở hạng/)).toBeVisible();
    expect(errors).toEqual([]);
  } finally {
    await other.close();
  }
});
