import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { LeaderboardPage } from '../src/pages/LeaderboardPage';
import { PublishScore } from '../src/components/PublishScore';
import { ProgressProvider } from '../src/contexts/ProgressContext';
import { gameInfo, topics } from '../src/data/neighbourhood';
import type { GameRun } from '../src/types';
const own = { nickname: 'Mây', score: 54, played: 1, rank: 1, mine: true };
const board = { entries: [own], own, total: 1, hasPublished: true };
const response = (data: unknown, ok = true) => ({ ok, json: async () => data });
afterEach(() => vi.unstubAllGlobals());
const mount = () =>
  render(
    <MemoryRouter>
      <LeaderboardPage />
    </MemoryRouter>,
  );
describe('shared leaderboard', () => {
  it('keeps server categories and time limits aligned with game data', () => {
    const rules = JSON.parse(readFileSync('../backend/src/rules.json', 'utf8'));
    expect(rules.topics).toEqual(topics.map((topic) => topic.id));
    expect(rules.games).toEqual(
      Object.fromEntries(
        Object.entries(gameInfo).map(([id, info]) => [id, info.seconds]),
      ),
    );
  });
  it('loads real entries, filters and removes only after confirmation', async () => {
    const fetcher = vi.fn().mockResolvedValue(response(board));
    vi.stubGlobal('fetch', fetcher);
    const user = userEvent.setup();
    mount();
    expect(await screen.findByRole('cell', { name: '54' })).toBeInTheDocument();
    expect(screen.getByText(/Bạn đang ở hạng/)).toHaveTextContent('1');
    await user.selectOptions(screen.getByLabelText('Chủ đề'), 'my-house');
    await waitFor(() =>
      expect(fetcher.mock.lastCall?.[0]).toContain('topic=my-house'),
    );
    await screen.findByRole('cell', { name: '54' });
    await user.click(
      screen.getByRole('button', { name: 'Gỡ toàn bộ điểm tôi đã đăng' }),
    );
    await user.click(screen.getByRole('button', { name: 'Hủy / Ở lại' }));
    expect(fetcher.mock.calls.some((call) => call[1].method === 'DELETE')).toBe(
      false,
    );
    await user.click(
      screen.getByRole('button', { name: 'Gỡ toàn bộ điểm tôi đã đăng' }),
    );
    fetcher.mockResolvedValue(
      response({ entries: [], own: null, total: 0, hasPublished: false }),
    );
    await user.click(screen.getByRole('button', { name: 'Gỡ toàn bộ điểm' }));
    expect(
      await screen.findByText('Chưa có điểm ở bảng này'),
    ).toBeInTheDocument();
    expect(fetcher.mock.calls.some((call) => call[1].method === 'DELETE')).toBe(
      true,
    );
  });
  it('shows connection failures and supports retry without fake rows', async () => {
    const fetcher = vi.fn().mockRejectedValue(new TypeError('offline'));
    vi.stubGlobal('fetch', fetcher);
    mount();
    expect(await screen.findByRole('alert')).toHaveTextContent('Chưa kết nối');
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    fetcher.mockResolvedValue(response(board));
    await userEvent.click(screen.getByRole('button', { name: 'Làm mới' }));
    expect(await screen.findByRole('table')).toBeInTheDocument();
  });
  it('publishes a challenge only on click and reports errors for retry', async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValue(response({ error: 'Chưa lưu được điểm.' }, false));
    vi.stubGlobal('fetch', fetcher);
    const run = {
      mode: 'challenge',
      topicId: 'my-house',
      gameId: 'quick-quiz',
      score: 54,
      correctCount: 5,
      wrongCount: 0,
      elapsedSeconds: 30,
      finishedBy: 'completed',
    } as GameRun;
    render(
      <MemoryRouter>
        <ProgressProvider>
          <PublishScore run={run} />
        </ProgressProvider>
      </MemoryRouter>,
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Đăng điểm' }));
    await userEvent.click(screen.getByRole('button', { name: 'Để sau' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(fetcher).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole('button', { name: 'Đăng điểm' }));
    const dialog = within(screen.getByRole('dialog'));
    const submit = dialog.getByRole('button', { name: 'Đăng điểm' });
    const nickname = dialog.getByLabelText('Biệt danh hiển thị công khai');
    await userEvent.clear(nickname);
    await userEvent.type(nickname, '   ');
    expect(submit).toBeDisabled();
    await userEvent.clear(nickname);
    await userEvent.type(nickname, 'Mây{Enter}');
    expect(await screen.findByText('Chưa lưu được điểm.')).toBeInTheDocument();
    expect(JSON.parse(fetcher.mock.calls[0][1].body).run.score).toBe(54);
    let finish!: (value: ReturnType<typeof response>) => void;
    fetcher.mockReturnValue(
      new Promise((resolve) => {
        finish = resolve;
      }),
    );
    await userEvent.click(submit);
    expect(dialog.getByRole('button', { name: 'Đang đăng…' })).toBeDisabled();
    expect(
      dialog.getByRole('button', { name: 'Đóng hộp thoại' }),
    ).toBeDisabled();
    expect(nickname).toBeDisabled();
    finish(response({ ok: true }));
    expect(
      await screen.findByText('Đã cập nhật điểm cao nhất của bạn.'),
    ).toBeInTheDocument();
    expect(
      dialog.queryByRole('button', { name: 'Đăng điểm' }),
    ).not.toBeInTheDocument();
    await userEvent.click(dialog.getByRole('button', { name: 'Về kết quả' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Xem điểm đã đăng' }),
    ).toBeInTheDocument();
  });
  it('does not offer practice scores for publication', () => {
    render(
      <MemoryRouter>
        <ProgressProvider>
          <PublishScore run={{ mode: 'practice' } as GameRun} />
        </ProgressProvider>
      </MemoryRouter>,
    );
    expect(
      screen.queryByRole('button', { name: 'Đăng điểm' }),
    ).not.toBeInTheDocument();
  });
});
