import { test, expect } from '@playwright/test';
import { topics } from '../../src/data/neighbourhood';
import { createMemoryCards } from '../../src/lib/questLogic';

for (const topic of topics) {
  test(`quest ${topic.id}: three missions, chest, persistence`, async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`/topics/${topic.id}`);
    await page
      .getByRole('link', { name: 'Bắt đầu Quest', exact: true })
      .click();
    await expect(page.locator('.quest-key-count')).toContainText('0/3');
    await expect(
      page.getByRole('button', { name: 'Mở rương kho báu' }),
    ).toHaveCount(0);
    await page
      .getByRole('button', { name: 'Bắt đầu hành trình', exact: true })
      .click();
    // A wrong choice never grants a key or advances the target.
    await page
      .getByRole('button', {
        name: `Tìm hình ${topic.vocabulary[4].meaningVi}`,
        exact: true,
      })
      .click();
    await expect(page.getByRole('status')).toContainText('Chưa đúng');
    for (const word of topic.vocabulary.slice(0, 3)) {
      await page
        .getByRole('button', {
          name: `Tìm hình ${word.meaningVi}`,
          exact: true,
        })
        .click();
      await expect(page.getByRole('status')).toContainText('Đúng rồi');
      await page
        .getByRole('button', { name: 'Cất vào túi đồ', exact: true })
        .click();
    }
    await page
      .getByRole('button', { name: 'Nhận chìa khóa và đi tiếp', exact: true })
      .click();
    await expect(page.locator('.quest-key-count')).toContainText('1/3');
    const cards = createMemoryCards(topic.vocabulary.slice(3, 6));
    const first = cards[0];
    const mismatch = cards.findIndex((card) => card.wordId !== first.wordId);
    await page.getByRole('button', { name: 'Lật thẻ 1', exact: true }).click();
    await page
      .getByRole('button', { name: `Lật thẻ ${mismatch + 1}`, exact: true })
      .click();
    await expect(page.getByRole('status')).toContainText('chưa cùng nghĩa');
    await page
      .getByRole('button', { name: 'Úp thẻ và thử lại', exact: true })
      .click();
    for (const [i, word] of topic.vocabulary.slice(3, 6).entries()) {
      for (const card of cards.filter((item) => item.wordId === word.id)) {
        await page
          .getByRole('button', {
            name: `Lật thẻ ${cards.indexOf(card) + 1}`,
            exact: true,
          })
          .click();
      }
      if (i < 2)
        await page
          .getByRole('button', { name: 'Lật cặp tiếp theo', exact: true })
          .click();
    }
    await page
      .getByRole('button', { name: 'Nhận chìa khóa và đi tiếp', exact: true })
      .click();
    await expect(page.locator('.quest-key-count')).toContainText('2/3');
    await page.getByRole('button', { name: 'Xem gợi ý', exact: true }).click();
    for (const token of topic.sentences[0].tokens) {
      await page
        .locator('[aria-label="Mảnh từ mật thư"]')
        .getByRole('button', { name: token.text, exact: true, disabled: false })
        .first()
        .click();
    }
    await page
      .getByRole('button', { name: 'Giải mật thư', exact: true })
      .click();
    await expect(page.getByRole('status')).toContainText('Mật thư đã giải');
    await page
      .getByRole('button', { name: 'Đến rương kho báu', exact: true })
      .click();
    await expect(page.locator('.quest-key-count')).toContainText('3/3');
    expect(
      await page.evaluate(
        () =>
          JSON.parse(localStorage.getItem('bleq_progress_v1') ?? '{}')
            .completedQuestIds ?? [],
      ),
    ).not.toContain(topic.id);
    await page
      .getByRole('button', { name: 'Mở rương kho báu', exact: true })
      .click();
    await expect(
      page.getByRole('heading', { name: 'Hành trình hoàn thành!' }),
    ).toBeVisible();
    const progress = await page.evaluate(() =>
      JSON.parse(localStorage.getItem('bleq_progress_v1')!),
    );
    expect(progress.completedQuestIds).toEqual([topic.id]);
    expect(progress.completedRuns).toHaveLength(0);
    await page.reload();
    await expect(page.getByText('Đã chinh phục hành trình này')).toBeVisible();
    await page.goto('/achievements');
    await expect(
      page.getByRole('link', { name: `${topic.titleEn} · Đã mở rương` }),
    ).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    expect(errors).toEqual([]);
  });
}

test('quest exit confirmation, recovery and responsive mission', async ({
  page,
}) => {
  await page.goto('/quest/missing');
  await expect(
    page.getByRole('heading', { name: 'Không tìm thấy hành trình' }),
  ).toBeVisible();
  await page.goto('/quest/my-new-school');
  await page
    .getByRole('button', { name: 'Bắt đầu hành trình', exact: true })
    .click();
  for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    await expect(page.locator('.quest-hunt-grid button')).toHaveCount(6);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.screenshot({ path: `/tmp/quest-${width}.png`, fullPage: true });
  }
  await page.getByRole('link', { name: 'My New School', exact: true }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByRole('button', { name: 'Hủy / Ở lại' }).click();
  await expect(page).toHaveURL(/\/quest\/my-new-school$/);
  await page.getByRole('link', { name: 'My New School', exact: true }).click();
  await page
    .getByRole('button', { name: 'Rời hành trình', exact: true })
    .click();
  await expect(page).toHaveURL(/\/topics\/my-new-school$/);
});
