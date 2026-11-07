import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { ChallengesPage } from '../src/pages/ChallengesPage';
import { DemoPage } from '../src/pages/DemoPage';
import { GamePage } from '../src/pages/GamePage';
import {
  AchievementsPage,
  ResultsPage,
  SettingsPage,
} from '../src/pages/ProgressPages';
import type { GameRun } from '../src/types';
import { HomePage, VocabularyPage } from '../src/pages/LearningPages';
import { topics } from '../src/data/neighbourhood';
import { ProgressProvider } from '../src/contexts/ProgressContext';
import {
  defaultProgress,
  STORAGE_KEY,
  writeProgress,
} from '../src/lib/storage';
function mount(path: string) {
  const router = createMemoryRouter(
    [
      { path: '/', element: <HomePage /> },
      { path: '/demo', element: <DemoPage /> },
      { path: '/challenges', element: <ChallengesPage /> },
      { path: '/play/:topicId/:gameId', element: <GamePage /> },
      { path: '/results/:runId', element: <ResultsPage /> },
      { path: '/settings', element: <SettingsPage /> },
      { path: '/achievements', element: <AchievementsPage /> },
      { path: '/topics/:topicId/vocabulary', element: <VocabularyPage /> },
      { path: '*', element: <p>Destination</p> },
    ],
    { initialEntries: [path] },
  );
  render(
    <ProgressProvider>
      <RouterProvider router={router} />
    </ProgressProvider>,
  );
  return router;
}
describe('routes and user interactions', () => {
  it('offers all three games in the challenge tab for each topic and handles unknown topics', async () => {
    const user = userEvent.setup();
    mount('/challenges?topic=unknown');
    expect(screen.getByLabelText('Chủ đề thử thách')).toHaveValue(topics[0].id);
    for (const topic of topics) {
      await user.selectOptions(
        screen.getByLabelText('Chủ đề thử thách'),
        topic.id,
      );
      expect(screen.getByRole('link', { name: /Word Match/ })).toHaveAttribute(
        'href',
        `/play/${topic.id}/word-match?from=challenges`,
      );
      expect(screen.getByRole('link', { name: /Quick Quiz/ })).toHaveAttribute(
        'href',
        `/play/${topic.id}/quick-quiz?from=challenges`,
      );
      expect(
        screen.getByRole('link', { name: /Sentence Builder/ }),
      ).toHaveAttribute(
        'href',
        `/play/${topic.id}/sentence-builder?from=challenges`,
      );
    }
  });
  it('offers one standalone demo question, retries and a Unit 1 link without changing progress', async () => {
    writeProgress({ ...defaultProgress(), nickname: 'Explorer' });
    const saved = localStorage.getItem(STORAGE_KEY);
    const user = userEvent.setup();
    mount('/demo');
    const picture = document.querySelector('.demo-picture img')!;
    const originalSource = picture.getAttribute('src');
    const target = topics
      .find((topic) => topic.id === 'my-new-school')!
      .vocabulary.find((word) => word.imagePath === originalSource)!;
    const buttons = within(
      screen.getByRole('group', { name: 'Chọn từ đúng với hình' }),
    );
    const order = buttons
      .getAllByRole('button')
      .map((button) => button.textContent);
    const wrong = buttons
      .getAllByRole('button')
      .find((button) => button.textContent !== target.term)!;
    await user.click(wrong);
    expect(screen.getByRole('status')).toHaveTextContent('Chưa đúng');
    expect(picture).toHaveAttribute('src', originalSource);
    expect(
      buttons.getAllByRole('button').map((button) => button.textContent),
    ).toEqual(order);
    await user.click(buttons.getByRole('button', { name: target.term }));
    expect(screen.getByRole('status')).toHaveTextContent('Chính xác');
    expect(
      screen.getByRole('link', { name: 'Bắt đầu Unit 1' }),
    ).toHaveAttribute('href', '/topics/my-new-school');
    buttons
      .getAllByRole('button')
      .forEach((button) => expect(button).toBeDisabled());
    await user.click(screen.getByRole('button', { name: 'Thử lại' }));
    expect(document.querySelector('.demo-picture img')).not.toHaveAttribute(
      'src',
      originalSource,
    );
    buttons
      .getAllByRole('button')
      .forEach((button) => expect(button).toBeEnabled());
    expect(localStorage.getItem(STORAGE_KEY)).toBe(saved);
  });
  it('shows one unified journey for each topic on the home page', async () => {
    const user = userEvent.setup();
    mount('/');
    for (const topic of topics) {
      expect(
        within(
          document.querySelector('.home-topic-map') as HTMLElement,
        ).getByRole('link', { name: new RegExp(topic.titleEn) }),
      ).toHaveAttribute('href', `/topics/${topic.id}`);
      await user.selectOptions(screen.getByLabelText('Chọn chủ đề'), topic.id);
      expect(
        screen.getByRole('link', { name: 'Bắt đầu hành trình' }),
      ).toHaveAttribute('href', `/quest/${topic.id}`);
      expect(
        screen.getByRole('region', { name: `Hành trình ${topic.titleEn}` }),
      ).toHaveTextContent('Word Match');
      expect(
        screen.getByRole('region', { name: `Hành trình ${topic.titleEn}` }),
      ).toHaveTextContent('Quick Quiz');
      expect(
        screen.queryByRole('heading', { name: 'Học trước, tự tin hơn' }),
      ).not.toBeInTheDocument();
    }
    expect(screen.queryByText('Sắp ra mắt')).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Chơi thử ngay' })).toHaveAttribute(
      'href',
      '/demo',
    );
  });
  it('combines topic and game filters, clears empty filters, and keeps saved history', async () => {
    const run: GameRun = {
      id: 'quiz',
      seed: 1,
      topicId: 'my-neighbourhood',
      gameId: 'quick-quiz',
      mode: 'challenge',
      startedAt: '2026-11-06T10:00:00Z',
      finishedAt: '2026-11-06T10:00:30Z',
      elapsedSeconds: 30,
      correctCount: 5,
      wrongCount: 0,
      baseScore: 50,
      timeBonus: 4,
      score: 54,
      totalItems: 5,
      finishedBy: 'completed',
      answers: [],
    };
    writeProgress({
      ...defaultProgress(),
      completedRuns: [
        run,
        { ...run, id: 'match', gameId: 'word-match' },
        { ...run, id: 'other-topic', topicId: 'archived-topic' },
      ],
    });
    const saved = localStorage.getItem(STORAGE_KEY);
    const user = userEvent.setup();
    mount('/achievements');
    const history = () => document.querySelectorAll('.run-history a');
    expect(history()).toHaveLength(3);
    await user.selectOptions(
      screen.getByLabelText('Lọc chủ đề'),
      'my-neighbourhood',
    );
    expect(history()).toHaveLength(2);
    await user.selectOptions(
      screen.getByLabelText('Lọc trò chơi'),
      'quick-quiz',
    );
    expect(history()).toHaveLength(1);
    expect(history()[0]).toHaveAttribute('href', '/results/quiz');
    await user.selectOptions(
      screen.getByLabelText('Lọc trò chơi'),
      'sentence-builder',
    );
    expect(screen.getByText('Chưa có lượt chơi phù hợp')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Xóa bộ lọc' }));
    expect(history()).toHaveLength(3);
    expect(screen.getByLabelText('Lọc chủ đề')).toHaveValue('all');
    expect(screen.getByLabelText('Lọc trò chơi')).toHaveValue('all');
    expect(localStorage.getItem(STORAGE_KEY)).toBe(saved);
  });
  it('handles invalid topic/game/result routes', () => {
    mount('/play/missing/quick-quiz');
    expect(
      screen.getByRole('heading', { name: 'Không tìm thấy thử thách' }),
    ).toBeInTheDocument();
  });
  it('shows missing-result recovery', () => {
    mount('/results/not-found');
    expect(
      screen.getByRole('heading', { name: 'Không tìm thấy lượt chơi' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /Khám phá chủ đề/ }),
    ).toBeInTheDocument();
  });
  it('has functional flashcards and marks viewed vocabulary', async () => {
    const user = userEvent.setup();
    mount('/topics/my-neighbourhood/vocabulary');
    expect(
      screen.getByRole('heading', { name: 'art gallery' }),
    ).toBeInTheDocument();
    expect(screen.getByText('/ˈɑːrt ˌɡæl.ɚ.i/')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Tiếp' }));
    expect(screen.getByText('/kəˈθiː.drəl/')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'cathedral' }),
    ).toBeInTheDocument();
    await waitFor(() =>
      expect(
        JSON.parse(localStorage.getItem(STORAGE_KEY)!).visitedVocabularyIds,
      ).toContain('my-neighbourhood:cathedral'),
    );
  });
  it('preserves data on cancel and clears only on confirmation', async () => {
    writeProgress({
      ...defaultProgress(),
      nickname: 'Explorer',
      earnedBadgeIds: ['first-quest'],
    });
    const user = userEvent.setup();
    mount('/settings');
    await user.click(screen.getByRole('button', { name: 'Xóa tiến độ' }));
    await user.click(screen.getByRole('button', { name: 'Hủy / Ở lại' }));
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!).nickname).toBe(
      'Explorer',
    );
    await user.click(screen.getByRole('button', { name: 'Xóa tiến độ' }));
    await user.click(
      screen.getByRole('button', { name: 'Đồng ý, xóa tiến độ' }),
    );
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!)).toEqual(
      defaultProgress(),
    );
  });
  it('blocks leaving a running game and supports cancel then leave', async () => {
    const user = userEvent.setup();
    const router = mount('/play/my-neighbourhood/quick-quiz');
    await user.click(screen.getByRole('button', { name: 'Bắt đầu chơi' }));
    await user.click(screen.getByRole('button', { name: 'Rời thử thách' }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Hủy / Ở lại' }));
    expect(router.state.location.pathname).toBe(
      '/play/my-neighbourhood/quick-quiz',
    );
    await user.click(screen.getByRole('button', { name: 'Rời thử thách' }));
    await user.click(
      within(screen.getByRole('dialog')).getByRole('button', {
        name: 'Rời thử thách',
      }),
    );
    await waitFor(() =>
      expect(router.state.location.pathname).toBe('/topics/my-neighbourhood'),
    );
  });
});
