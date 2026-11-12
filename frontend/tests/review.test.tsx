import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import {
  recordReview,
  reviewQuestions,
  reviewStats,
  validReview,
} from '../src/lib/review';
import {
  defaultProgress,
  validProgress,
  STORAGE_KEY,
} from '../src/lib/storage';
import { ReviewPage } from '../src/pages/ReviewPage';
import { ProgressProvider } from '../src/contexts/ProgressContext';
describe('daily review', () => {
  it('spaces correct answers, prioritizes mistakes and counts distinct words', () => {
    const key = 'my-new-school:pencil';
    const first = recordReview(undefined, key, true, 100);
    expect(first.words[key].due).toBe(101);
    const sameDay = recordReview(first, key, true, 100);
    expect(sameDay.today).toHaveLength(1);
    expect(sameDay.words[key].level).toBe(1);
    const next = recordReview(sameDay, key, true, 101);
    expect(next.words[key].due).toBe(104);
    expect(next.streak).toBe(2);
    const wrong = recordReview(next, key, false, 101);
    expect(wrong.words[key].due).toBe(101);
    expect(
      reviewQuestions({ ...defaultProgress(), review: wrong }, 42, 101)[0].word
        .key,
    ).toBe(key);
    expect(reviewStats(next, 103).streak).toBe(0);
    expect(recordReview(next, key, true, 105).streak).toBe(1);
  });
  it('keeps old progress valid and rejects broken new data', () => {
    expect(validProgress(defaultProgress())).toBe(true);
    expect(validReview({ words: {}, day: 1, today: [], streak: -1 })).toBe(
      false,
    );
    expect(validReview(recordReview(undefined, 'my-house:bed', false, 1))).toBe(
      true,
    );
    const questions = reviewQuestions(defaultProgress(), 42, 1);
    expect(questions).toHaveLength(5);
    expect(new Set(questions.map((q) => q.word.key)).size).toBe(5);
    for (const q of questions)
      expect(q.options.filter((o) => o.key === q.word.key)).toHaveLength(1);
  });
  it('shows feedback, locks answers and saves a completed five-word lesson', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <ProgressProvider>
          <ReviewPage />
        </ProgressProvider>
      </MemoryRouter>,
    );
    for (let i = 0; i < 5; i++) {
      const buttons = document.querySelectorAll<HTMLButtonElement>(
        '.review-options button',
      );
      await user.click(buttons[0]);
      expect(buttons[0]).toBeDisabled();
      expect(document.querySelector('.example')).toBeInTheDocument();
      await user.click(
        screen.getByRole('button', {
          name: i === 4 ? 'Xem kết quả ôn tập' : 'Từ tiếp theo',
        }),
      );
    }
    expect(
      screen.getByRole('heading', { name: 'Đã ôn xong!' }),
    ).toBeInTheDocument();
    const progress = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
    expect(progress.review.today).toHaveLength(5);
    expect(validProgress(progress)).toBe(true);
  });
});
