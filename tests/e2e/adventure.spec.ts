import { test, expect } from '@playwright/test';
import { topics } from '../../frontend/src/data/neighbourhood';

for (const topic of topics) {
  test(`quest ${topic.id}: three missions, chest, persistence`, async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`/topics/${topic.id}`);
    await page
      .getByRole('link', { name: 'Bắt đầu hành trình', exact: true })
      .click();
    await expect(page.locator('.quest-key-count')).toContainText('0/3');
    await expect(
      page.getByRole('button', { name: 'Mở rương kho báu' }),
    ).toHaveCount(0);
    await page
      .getByRole('button', { name: 'Bắt đầu hành trình', exact: true })
      .click();
    await expect(page.locator('.quest-hunt-grid')).toHaveCount(0);
    for (let i = 0; i < 2; i++)
      await page.getByRole('button', { name: 'Tiếp', exact: true }).click();
    await expect(
      page.getByRole('heading', {
        name: topic.vocabulary[2].term,
        exact: true,
      }),
    ).toBeVisible();
    await page.getByRole('button', { name: 'Vào nhiệm vụ' }).click();
    // A wrong choice never grants a key or advances the target.
    await page
      .getByRole('button', {
        name: `Tìm hình ${topic.vocabulary[4].meaningVi}`,
        exact: true,
      })
      .click();
    await expect(page.getByRole('status')).toContainText('Chưa đúng');
    for (let i = 0; i < 3; i++) {
      const term = await page.locator('.quest-target strong').innerText();
      const word = topic.vocabulary.find((word) => word.term === term)!;
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
    page.once('dialog', (dialog) => dialog.accept());
    await page.reload();
    await expect(page.locator('.quest-key-count')).toContainText('1/3');
    await expect(page.locator('.quest-memory-grid')).toHaveCount(0);
    for (let i = 0; i < 5; i++)
      await page.getByRole('button', { name: 'Tiếp', exact: true }).click();
    await expect(
      page.getByRole('heading', {
        name: topic.vocabulary.at(-1)!.term,
        exact: true,
      }),
    ).toBeVisible();
    await page.getByRole('button', { name: 'Vào nhiệm vụ' }).click();
    await expect(
      page.getByRole('link', { name: 'Đến trang Thử thách' }),
    ).toHaveAttribute('href', `/challenges?topic=${topic.id}&quest=1`);
    if (topic.id === 'my-new-school') {
      await page.getByRole('link', { name: 'Đến trang Thử thách' }).click();
      await expect(
        page.getByRole('heading', { name: 'Thử thách tiếng Anh' }),
      ).toBeVisible();
      await page.getByRole('link', { name: /Word Match/ }).click();
      await expect(page).toHaveURL(/word-match\?quest=1&from=challenges$/);
      await page
        .getByRole('button', { name: 'Bắt đầu chơi', exact: true })
        .click();
      for (let i = 0; i < 5; i++) {
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
      }
      await expect(page).toHaveURL(/\/results\//);
      await expect(page.locator('.result-summary')).toContainText('50/50');
      await page
        .getByRole('link', { name: 'Tiếp tục hành trình', exact: true })
        .click();
      await expect(page).toHaveURL(/\/quest\/my-new-school$/);
      await expect(page.locator('.quest-key-count')).toContainText('1/3');
      await page.getByRole('button', { name: 'Vào nhiệm vụ' }).click();
      await expect(
        page.getByText('Đã hoàn thành một lượt luyện tập trong chặng này.'),
      ).toBeVisible();
    }
    // Discover the shuffled deck using only the visible faces, then recall pairs.
    const positions = new Map<string, number[]>();
    for (let index = 0; index < 6; index++) {
      await page
        .getByRole('button', { name: `Lật thẻ ${index + 1}`, exact: true })
        .click();
      const label = await page
        .locator('.quest-memory-card')
        .nth(index)
        .getAttribute('aria-label');
      const text = label!.replace(/^Thẻ \d+: /, '');
      const word = topic.vocabulary.find(
        (word) => word.term === text || word.meaningVi === text,
      )!;
      positions.set(word.id, [...(positions.get(word.id) ?? []), index]);
      if (index % 2 === 1) {
        const next = page.getByRole('button', {
          name: /^(Lật cặp tiếp theo|Úp thẻ và thử lại)$/,
        });
        if (await next.count()) await next.click();
      }
    }
    for (const indexes of positions.values()) {
      const hidden = page.getByRole('button', {
        name: `Lật thẻ ${indexes[0] + 1}`,
        exact: true,
      });
      if (!(await hidden.count())) continue;
      for (const index of indexes)
        await page
          .getByRole('button', { name: `Lật thẻ ${index + 1}`, exact: true })
          .click();
      const next = page.getByRole('button', {
        name: 'Lật cặp tiếp theo',
        exact: true,
      });
      if (await next.count()) await next.click();
    }
    await page
      .getByRole('button', { name: 'Nhận chìa khóa và đi tiếp', exact: true })
      .click();
    await expect(page.locator('.quest-key-count')).toContainText('2/3');
    await expect(page.locator('.quest-sentence')).toHaveCount(0);
    await page
      .getByRole('button', { name: 'Đánh dấu đã xem bài học', exact: true })
      .click();
    await page.getByRole('button', { name: 'Vào nhiệm vụ' }).click();
    await expect(
      page.getByRole('link', { name: 'Đến trang Thử thách' }),
    ).toHaveAttribute('href', `/challenges?topic=${topic.id}&quest=1`);
    await page.getByRole('button', { name: 'Xem gợi ý', exact: true }).click();
    const fragments = await page
      .locator('[aria-label="Mảnh từ mật thư"] button')
      .allTextContents();
    const cipher = topic.sentences.find(
      (sentence) =>
        sentence.tokens
          .map((token) => token.text)
          .sort()
          .join('|') === [...fragments].sort().join('|'),
    )!;
    for (const token of cipher.tokens) {
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
      page.getByRole('heading', { name: 'Đã hoàn thành hành trình' }),
    ).toBeVisible();
    const progress = await page.evaluate(() =>
      JSON.parse(localStorage.getItem('bleq_progress_v1')!),
    );
    expect(progress.completedQuestIds).toEqual([topic.id]);
    expect(progress.completedRuns).toHaveLength(
      topic.id === 'my-new-school' ? 1 : 0,
    );
    await page.reload();
    await expect(page.getByText('Đã hoàn thành hành trình này')).toBeVisible();
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
  for (let i = 0; i < 2; i++)
    await page.getByRole('button', { name: 'Tiếp', exact: true }).click();
  await page.getByRole('button', { name: 'Vào nhiệm vụ' }).click();
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

test('inline learning is responsive and uses the same viewed-word progress as full lessons', async ({
  page,
}) => {
  await page.goto('/quest/my-new-school');
  await page
    .getByRole('button', { name: 'Bắt đầu hành trình', exact: true })
    .click();
  for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    await expect(page.locator('.quest-study')).toHaveAttribute('open', '');
    await expect(
      page.getByRole('heading', { name: 'school bag', exact: true }),
    ).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.screenshot({
      path: `/tmp/quest-study-${width}.png`,
      fullPage: true,
    });
  }
  for (let i = 0; i < 2; i++)
    await page.getByRole('button', { name: 'Tiếp', exact: true }).click();
  await expect(page.locator('.quest-hunt-grid')).toHaveCount(0);
  await page.getByRole('button', { name: 'Vào nhiệm vụ' }).click();
  await expect(page.locator('.quest-hunt-grid')).toBeVisible();
  await page.getByRole('link', { name: 'My New School', exact: true }).click();
  await page
    .getByRole('button', { name: 'Rời hành trình', exact: true })
    .click();
  await expect(
    page.getByText('Đã xem 3/9 từ vựng', { exact: false }),
  ).toBeVisible();
  await page
    .getByRole('link', { name: 'Tiếp tục hành trình', exact: true })
    .click();
  await expect(page.locator('.quest-hunt-grid')).toHaveCount(0);
  await page.getByRole('button', { name: 'Vào nhiệm vụ' }).click();
  await expect(page.locator('.quest-hunt-grid')).toBeVisible();
  await expect(page.locator('.quest-study')).not.toHaveAttribute('open');
});
