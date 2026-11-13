import { test, expect } from '@playwright/test';
import { newSchool, house, friends } from '../../frontend/src/data/firstUnits';

for (const topic of [newSchool, house, friends]) {
  test(`${topic.titleEn}: lessons, all games and saved progress`, async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/topics');
    await page
      .getByRole('link')
      .filter({
        has: page.getByRole('heading', { name: topic.titleEn, exact: true }),
      })
      .click();
    await expect(
      page.getByRole('heading', { name: topic.titleEn, exact: true }),
    ).toBeVisible();
    await page.goto(`/topics/${topic.id}/vocabulary`);
    for (let i = 0; i < topic.vocabulary.length; i++) {
      await expect(
        page.getByRole('heading', {
          name: topic.vocabulary[i].term,
          exact: true,
        }),
      ).toBeVisible();
      await expect
        .poll(() =>
          page
            .locator('.flashcard-picture img')
            .evaluate((img: HTMLImageElement) => img.naturalWidth),
        )
        .toBeGreaterThan(0);
      if (i < topic.vocabulary.length - 1)
        await page.getByRole('button', { name: 'Tiếp', exact: true }).click();
    }
    await expect(
      page.getByRole('button', { name: 'Tiếp', exact: true }),
    ).toBeDisabled();
    await page.goto(`/topics/${topic.id}/grammar`);
    await expect(
      page.getByRole('heading', { name: topic.grammarTitle, exact: true }),
    ).toBeVisible();
    await expect(page.locator('.grammar-rules article')).toHaveCount(
      topic.grammar.length,
    );
    await page.getByRole('button', { name: 'Đánh dấu đã xem bài học' }).click();
    for (const gameId of ['word-match', 'quick-quiz', 'sentence-builder']) {
      await page.goto(`/play/${topic.id}/${gameId}`);
      await expect(
        page.getByRole('link', { name: topic.titleEn, exact: true }),
      ).toBeVisible();
      await page.getByRole('button', { name: 'Bắt đầu chơi' }).click();
      for (let i = 0; i < 5; i++) {
        if (gameId === 'word-match') {
          const term = await page
            .locator('.word-tile:enabled')
            .first()
            .innerText();
          const word = topic.vocabulary.find((word) => word.term === term)!;
          await page
            .getByRole('button', { name: word.term, exact: true })
            .click();
          await page
            .getByRole('button', {
              name: `Chọn hình ${word.meaningVi}`,
              exact: true,
            })
            .click();
        } else {
          if (gameId === 'quick-quiz') {
            const prompt = await page.locator('.question').innerText();
            const question = topic.quiz.find((q) => q.prompt === prompt)!;
            const answer = question.options.find(
              (o) => o.id === question.correctOptionId,
            )!;
            await page
              .locator('.quiz-option')
              .filter({ has: page.getByText(answer.text, { exact: true }) })
              .click();
          } else {
            const tokens = await page
              .locator('.token-bank button')
              .allTextContents();
            const sentence = topic.sentences.find(
              (s) =>
                s.tokens
                  .map((t) => t.text)
                  .sort()
                  .join('|') === [...tokens].sort().join('|'),
            )!;
            for (const token of sentence.tokens)
              await page
                .locator('.token-bank')
                .getByRole('button', {
                  name: token.text,
                  exact: true,
                  disabled: false,
                })
                .first()
                .click();
            await page
              .getByRole('button', { name: 'Kiểm tra', exact: true })
              .click();
          }
          await expect(page.locator('.feedback')).toContainText('Chính xác');
          await page
            .getByRole('button', {
              name: i === 4 ? 'Xem kết quả' : 'Câu tiếp theo',
            })
            .click();
        }
      }
      await expect(page).toHaveURL(/\/results\//);
      await expect(page.locator('.result-summary')).toContainText('50/50');
      await page.reload();
      await expect(page.locator('.result-summary')).toContainText('50/50');
    }
    await page.goto(`/topics/${topic.id}`);
    await expect(page.getByText('Đã xem 9/9 từ vựng')).toBeVisible();
    await expect(page.getByText('3/3 trò chơi đã hoàn thành')).toBeVisible();
    await expect(page.getByText('Đã xem bài học')).toBeVisible();
    await page.goto('/topics/my-neighbourhood');
    await expect(page.getByText('Đã xem 0/9 từ vựng')).toBeVisible();
    await page.goto('/achievements');
    await page.getByLabel('Lọc chủ đề').selectOption(topic.id);
    await expect(page.locator('.run-history a')).toHaveCount(3);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
    expect(errors).toEqual([]);
  });
}
