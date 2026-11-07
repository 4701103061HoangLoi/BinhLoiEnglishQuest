import { test, expect } from '@playwright/test';
import { newSchool } from '../../frontend/src/data/firstUnits';

test('answer melodies play only after answers and respect persisted mute', async ({
  page,
}) => {
  await page.addInitScript(() => {
    const state = window as Window & { playedNotes?: number[] };
    state.playedNotes = [];
    const original = AudioContext.prototype.createOscillator;
    AudioContext.prototype.createOscillator = function () {
      const oscillator = original.call(this);
      const set = oscillator.frequency.setValueAtTime.bind(
        oscillator.frequency,
      );
      oscillator.frequency.setValueAtTime = (frequency, time) => {
        state.playedNotes!.push(frequency);
        return set(frequency, time);
      };
      return oscillator;
    };
  });
  const notes = () =>
    page.evaluate(
      () => (window as Window & { playedNotes?: number[] }).playedNotes ?? [],
    );
  await page.goto('/demo');
  await expect(
    page.getByRole('button', { name: 'Tắt âm thanh trò chơi' }),
  ).toBeVisible();
  expect(await notes()).toEqual([]);
  const source = await page.locator('.demo-picture img').getAttribute('src');
  const answer = newSchool.vocabulary.find(
    (word) => word.imagePath === source,
  )!;
  const wrong = (
    await page.locator('.quiz-options button').allTextContents()
  ).find((text) => text !== answer.term)!;
  await page.getByRole('button', { name: wrong, exact: true }).click();
  await expect.poll(async () => (await notes()).length).toBe(2);
  expect((await notes())[1]).toBeLessThan((await notes())[0]);
  await page.getByRole('button', { name: answer.term, exact: true }).click();
  await expect.poll(async () => (await notes()).length).toBe(6);
  await page.getByRole('button', { name: 'Tắt âm thanh trò chơi' }).click();
  await expect(
    page.getByRole('button', { name: 'Bật âm thanh trò chơi' }),
  ).toHaveAttribute('aria-pressed', 'false');
  await page.reload();
  await expect(
    page.getByRole('button', { name: 'Bật âm thanh trò chơi' }),
  ).toBeVisible();
  const nextSource = await page
    .locator('.demo-picture img')
    .getAttribute('src');
  const next = newSchool.vocabulary.find(
    (word) => word.imagePath === nextSource,
  )!;
  await page.getByRole('button', { name: next.term, exact: true }).click();
  await expect(page.getByRole('status')).toContainText('Chính xác');
  expect(await notes()).toEqual([]);
});
