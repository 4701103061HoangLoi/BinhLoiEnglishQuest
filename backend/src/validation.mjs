import { readFileSync } from 'node:fs';
export const rules = JSON.parse(
  readFileSync(new URL('./rules.json', import.meta.url)),
);
export const integer = (value, max) =>
  Number.isInteger(value) && value >= 0 && value <= max;
export const fail = (status, message) =>
  Object.assign(new Error(message), { status });
export function validateSubmission(value) {
  if (!value || typeof value !== 'object')
    throw fail(400, 'Dữ liệu không hợp lệ.');
  const { nickname, run } = value;
  if (
    typeof nickname !== 'string' ||
    !nickname.trim() ||
    nickname.trim().length > 40 ||
    /[\p{Cc}\p{Cf}]/u.test(nickname)
  )
    throw fail(
      400,
      'Biệt danh cần từ 1 đến 40 ký tự, không chứa ký tự điều khiển.',
    );
  if (
    !run ||
    typeof run !== 'object' ||
    typeof run.gameId !== 'string' ||
    !rules.topics.includes(run.topicId) ||
    !Object.hasOwn(rules.games, run.gameId) ||
    run.mode !== 'challenge' ||
    !['completed', 'timeout'].includes(run.finishedBy) ||
    !integer(run.correctCount, 5) ||
    !integer(run.wrongCount, 100000) ||
    !integer(run.elapsedSeconds, 86400) ||
    !integer(run.score, 60)
  )
    throw fail(400, 'Chỉ đăng kết quả thử thách hợp lệ.');
  const duration = rules.games[run.gameId];
  if (
    (run.finishedBy === 'timeout' && run.elapsedSeconds < duration) ||
    (run.gameId !== 'word-match' && run.correctCount + run.wrongCount > 5) ||
    (run.finishedBy === 'completed' &&
      (run.gameId === 'word-match'
        ? run.correctCount !== 5
        : run.correctCount + run.wrongCount !== 5))
  )
    throw fail(400, 'Kết quả và thời gian không khớp.');
  const base = Math.max(
    0,
    run.correctCount * 10 -
      (run.gameId === 'word-match' ? run.wrongCount * 5 : 0),
  );
  const bonus =
    run.finishedBy === 'completed'
      ? Math.min(
          10,
          Math.floor(Math.max(0, duration - run.elapsedSeconds) / 15),
        )
      : 0;
  if (run.score !== base + bonus) throw fail(400, 'Điểm không khớp kết quả.');
  return {
    nickname: nickname.trim(),
    key: `${run.topicId}:${run.gameId}`,
    score: run.score,
  };
}
