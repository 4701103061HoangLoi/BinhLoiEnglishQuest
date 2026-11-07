import { test, expect } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { newSchool } from '../../src/data/firstUnits';
const words = [
  ['art gallery', 'phòng trưng bày nghệ thuật'],
  ['cathedral', 'nhà thờ lớn'],
  ['railway station', 'nhà ga xe lửa'],
  ['temple', 'đền thờ'],
  ['square', 'quảng trường'],
];
const sentences = [
  'This street is busier than that street',
  'The temple is older than the art gallery',
  'My neighbourhood is more peaceful than the city centre',
  'This square is bigger than that square',
  'The railway station is more modern than the temple',
];
test('complete all games, persist badges and recover routes', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  await page.getByRole('link', { name: 'Chơi thử ngay' }).click();
  await expect(page).toHaveURL(/\/demo$/);
  const source = await page.locator('.demo-picture img').getAttribute('src');
  const demoAnswer = newSchool.vocabulary.find(
    (word) => word.imagePath === source,
  )!;
  for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    await expect(
      page.getByRole('button', { name: demoAnswer.term, exact: true }),
    ).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.screenshot({
      path: `/tmp/english-demo-${width}.png`,
      fullPage: true,
    });
  }
  const wrongDemoAnswer = (
    await page.locator('.quiz-options button').allTextContents()
  ).find((text) => text !== demoAnswer.term)!;
  await page
    .getByRole('button', { name: wrongDemoAnswer, exact: true })
    .click();
  await expect(page.getByRole('status')).toContainText('Chưa đúng');
  await page
    .getByRole('button', { name: demoAnswer.term, exact: true })
    .click();
  await expect(page.getByRole('status')).toContainText('Chính xác');
  expect(
    await page.evaluate(() => localStorage.getItem('bleq_progress_v1')),
  ).toBeNull();
  await page.getByRole('link', { name: 'Bắt đầu Unit 1' }).click();
  await expect(page).toHaveURL(/\/topics\/my-new-school$/);
  await page.goto('/play/my-new-school/quick-quiz');
  await page.getByRole('button', { name: 'Bắt đầu chơi' }).click();
  for (let i = 0; i < 5; i++) {
    const text = await page.locator('.question').innerText();
    const question = newSchool.quiz.find((q) => q.prompt === text)!;
    const answer = question.options.find(
      (option) => option.id === question.correctOptionId,
    )!;
    await page
      .locator('.quiz-option')
      .filter({ has: page.getByText(answer.text, { exact: true }) })
      .click();
    await expect(page.locator('.feedback')).toContainText('Chính xác');
    await page
      .getByRole('button', { name: i === 4 ? 'Xem kết quả' : 'Câu tiếp theo' })
      .click();
  }
  await expect(page).toHaveURL(/\/results\//);
  await expect(page.locator('.result-summary')).toContainText('50/50');
  await page.reload();
  await expect(page.locator('.result-summary')).toContainText('50/50');
  await page.goto('/play/my-neighbourhood/word-match');
  await page.getByRole('button', { name: 'Bắt đầu chơi' }).click();
  for (let i = 0; i < 2; i++) {
    await page
      .getByRole('button', { name: 'art gallery', exact: true })
      .click();
    await page
      .getByRole('button', { name: 'Chọn hình nhà thờ lớn', exact: true })
      .click();
    await expect(page.locator('.feedback')).toContainText('Try again');
    await page.getByRole('button', { name: 'Tiếp tục ghép' }).click();
  }
  for (const [word, meaning] of words) {
    await page.getByRole('button', { name: word, exact: true }).click();
    await page
      .getByRole('button', { name: `Chọn hình ${meaning}`, exact: true })
      .click();
    if (word !== 'square')
      await page.getByRole('button', { name: 'Tiếp tục ghép' }).click();
  }
  await expect(page).toHaveURL(/\/results\//);
  await expect(page.locator('.result-summary')).toContainText('40/50');
  await expect(page.locator('.result-summary')).toContainText('71%');
  await page.goto('/play/my-neighbourhood/sentence-builder');
  await page.getByRole('button', { name: 'Bắt đầu chơi' }).click();
  for (let i = 0; i < 5; i++) {
    const tokens = await page.locator('.token-bank button').allTextContents();
    const target = sentences.find(
      (sentence) =>
        sentence.split(' ').sort().join('|') === [...tokens].sort().join('|'),
    )!;
    expect(target).toBeTruthy();
    for (const word of target.split(' '))
      await page
        .locator('.token-bank button:enabled')
        .filter({ hasText: new RegExp(`^${word}$`) })
        .first()
        .click();
    await page.getByRole('button', { name: 'Kiểm tra', exact: true }).click();
    await expect(page.locator('.feedback')).toContainText('Chính xác');
    await page
      .getByRole('button', { name: i === 4 ? 'Xem kết quả' : 'Câu tiếp theo' })
      .click();
  }
  await expect(page).toHaveURL(/\/results\//);
  await expect(page.locator('.result-summary')).toContainText('50/50');
  await page.goto('/achievements');
  await expect(page.locator('.badge.earned')).toHaveCount(4);
  await page.reload();
  await expect(page.locator('.badge.earned')).toHaveCount(4);
  const runs = await page.evaluate(
    () => JSON.parse(localStorage.getItem('bleq_progress_v1')!).completedRuns,
  );
  expect(runs).toHaveLength(3);
  await page.goto('/results/khong-ton-tai');
  await expect(
    page.getByRole('heading', { name: 'Không tìm thấy lượt chơi' }),
  ).toBeVisible();
  await page.goto('/play/unknown/unknown');
  await expect(
    page.getByRole('heading', { name: 'Không tìm thấy thử thách' }),
  ).toBeVisible();
  expect(errors).toEqual([]);
});
test('responsive routes, touch play and screenshot evidence', async ({
  page,
}) => {
  mkdirSync('.impeccable/review', { recursive: true });
  const routes = [
    '/',
    '/topics',
    '/topics/my-neighbourhood',
    '/topics/my-neighbourhood/vocabulary',
    '/topics/my-neighbourhood/grammar',
    '/achievements',
    '/settings',
  ];
  for (const width of [360, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of routes) {
      await page.goto(route);
      await expect(page.locator('main h1')).toBeVisible();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
        `${route} overflow at ${width}`,
      ).toBe(true);
      if (route === '/' && (width === 390 || width === 1440))
        await page.screenshot({
          path: `.impeccable/review/${width === 390 ? 'mobile' : 'desktop'}.png`,
          fullPage: true,
        });
    }
  }
  await page.setViewportSize({ width: 390, height: 844 });
  for (const game of ['word-match', 'quick-quiz', 'sentence-builder']) {
    await page.goto(`/play/my-neighbourhood/${game}`);
    await page.getByRole('button', { name: 'Bắt đầu chơi' }).click();
    await expect(page.locator('.game-board')).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
    await page.screenshot({
      path: `.impeccable/review/${game}-mobile.png`,
      fullPage: true,
    });
    await page.getByLabel('Rời thử thách', { exact: true }).click();
    await page.getByRole('button', { name: 'Hủy / Ở lại' }).click();
    await expect(page.getByRole('dialog')).toBeHidden();
    await expect(page.locator('.game-board')).toBeVisible();
    await page.getByLabel('Rời thử thách', { exact: true }).click();
    await page
      .getByRole('dialog')
      .getByRole('button', { name: 'Rời thử thách', exact: true })
      .click();
  }
});

test('touch tokens, keyboard answers and actual deadline timeout', async ({
  browser,
}) => {
  const context = await browser.newContext({
    hasTouch: true,
    viewport: { width: 390, height: 844 },
  });
  const page = await context.newPage();
  await page.goto(
    'http://127.0.0.1:5173/play/my-neighbourhood/sentence-builder',
  );
  await page.getByRole('button', { name: 'Bắt đầu chơi' }).tap();
  const token = page.locator('.token-bank button').first();
  await token.tap();
  await expect(page.locator('.sentence-answer button')).toHaveCount(1);
  await page.locator('.sentence-answer button').tap();
  await expect(page.locator('.sentence-answer button')).toHaveCount(0);
  await page.getByLabel('Rời thử thách', { exact: true }).tap();
  await page
    .getByRole('dialog')
    .getByRole('button', { name: 'Rời thử thách', exact: true })
    .tap();
  await expect(page).toHaveURL(/\/topics\/my-neighbourhood$/);
  await page.goto('http://127.0.0.1:5173/play/my-neighbourhood/quick-quiz');
  await page.clock.install();
  const start = page.getByRole('button', { name: 'Bắt đầu chơi' });
  await start.focus();
  await page.keyboard.press('Enter');
  await page.locator('.quiz-option').first().focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('.feedback')).toBeVisible();
  await page.clock.fastForward(91000);
  await expect(page).toHaveURL(/\/results\//);
  await expect(
    page.getByRole('heading', { name: 'Hết giờ, nhưng chưa hết cơ hội!' }),
  ).toBeVisible();
  const runs = await page.evaluate(
    () => JSON.parse(localStorage.getItem('bleq_progress_v1')!).completedRuns,
  );
  expect(runs).toHaveLength(1);
  expect(runs[0].timeBonus).toBe(0);
  expect(
    runs[0].answers.filter(
      (a: { submittedAnswer?: string }) => !a.submittedAnswer,
    ),
  ).toHaveLength(4);
  await context.close();
});
