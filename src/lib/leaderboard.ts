import type { GameRun } from '../types';
export interface RankingEntry {
  nickname: string;
  score: number;
  played: number;
  rank: number;
  mine: boolean;
}
export interface Ranking {
  entries: RankingEntry[];
  own: RankingEntry | null;
  total: number;
  hasPublished: boolean;
}
async function request(
  method: string,
  path = '',
  body?: unknown,
  signal?: AbortSignal,
) {
  const controller = new AbortController();
  const abort = () => controller.abort();
  signal?.addEventListener('abort', abort, { once: true });
  if (signal?.aborted) controller.abort();
  const timer = window.setTimeout(abort, 10000);
  try {
    const response = await fetch(`/api/leaderboard${path}`, {
      method,
      credentials: 'same-origin',
      headers:
        method === 'GET' ? undefined : { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: controller.signal,
    });
    const data = await response.json();
    if (!response.ok)
      throw new Error(
        typeof data.error === 'string'
          ? data.error
          : 'Chưa kết nối được bảng xếp hạng.',
      );
    return data;
  } catch (error) {
    if (signal?.aborted) throw error;
    throw new Error(
      error instanceof Error &&
        error.name !== 'AbortError' &&
        error.name !== 'SyntaxError' &&
        error.name !== 'TypeError'
        ? error.message
        : 'Chưa kết nối được bảng xếp hạng. Bạn thử lại nhé.',
    );
  } finally {
    window.clearTimeout(timer);
    signal?.removeEventListener('abort', abort);
  }
}
const validEntry = (value: unknown): value is RankingEntry => {
  if (!value || typeof value !== 'object') return false;
  const entry = value as RankingEntry;
  return (
    typeof entry.nickname === 'string' &&
    entry.nickname.length <= 40 &&
    Number.isInteger(entry.score) &&
    entry.score >= 0 &&
    entry.score <= 720 &&
    Number.isInteger(entry.played) &&
    entry.played >= 1 &&
    entry.played <= 12 &&
    Number.isInteger(entry.rank) &&
    entry.rank >= 1 &&
    typeof entry.mine === 'boolean'
  );
};
export async function loadRanking(
  topic: string,
  game: string,
  signal?: AbortSignal,
): Promise<Ranking> {
  const data = await request(
    'GET',
    `?${new URLSearchParams({ topic, game })}`,
    undefined,
    signal,
  );
  if (
    !data ||
    !Array.isArray(data.entries) ||
    data.entries.length > 50 ||
    !data.entries.every(validEntry) ||
    (data.own !== null && !validEntry(data.own)) ||
    !Number.isInteger(data.total) ||
    data.total < 0 ||
    typeof data.hasPublished !== 'boolean'
  )
    throw new Error('Bảng xếp hạng chưa tải được. Bạn thử lại nhé.');
  return data;
}
export function publishScore(nickname: string, run: GameRun) {
  const {
    topicId,
    gameId,
    mode,
    correctCount,
    wrongCount,
    elapsedSeconds,
    finishedBy,
    score,
  } = run;
  return request('POST', '', {
    nickname,
    run: {
      topicId,
      gameId,
      mode,
      correctCount,
      wrongCount,
      elapsedSeconds,
      finishedBy,
      score,
    },
  });
}
export const removeScores = () => request('DELETE');
