import type { GameRun, UserProgress } from '../types';
import { badgesForRun } from './gameLogic';
export const STORAGE_KEY = 'bleq_progress_v1';
export const defaultProgress = (): UserProgress => ({
  version: 1,
  nickname: 'Nhà thám hiểm',
  settings: { soundEnabled: true, reducedMotion: false },
  visitedVocabularyIds: [],
  viewedGrammarIds: [],
  completedRuns: [],
  earnedBadgeIds: [],
});
const record = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;
const strings = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((v) => typeof v === 'string');
const integer = (
  value: unknown,
  max = Number.MAX_SAFE_INTEGER,
): value is number =>
  Number.isInteger(value) && (value as number) >= 0 && (value as number) <= max;
function validRun(value: unknown): value is GameRun {
  if (!record(value)) return false;
  return (
    typeof value.id === 'string' &&
    typeof value.topicId === 'string' &&
    integer(value.seed) &&
    ['word-match', 'quick-quiz', 'sentence-builder'].includes(
      String(value.gameId),
    ) &&
    ['challenge', 'practice'].includes(String(value.mode)) &&
    ['completed', 'timeout'].includes(String(value.finishedBy)) &&
    typeof value.startedAt === 'string' &&
    Number.isFinite(Date.parse(value.startedAt)) &&
    typeof value.finishedAt === 'string' &&
    Number.isFinite(Date.parse(value.finishedAt)) &&
    integer(value.elapsedSeconds) &&
    integer(value.correctCount, 5) &&
    integer(value.wrongCount) &&
    integer(value.baseScore, 50) &&
    integer(value.timeBonus, 10) &&
    integer(value.score, 60) &&
    value.score === value.baseScore + value.timeBonus &&
    value.totalItems === 5 &&
    Array.isArray(value.answers) &&
    value.answers.every(
      (a) =>
        record(a) &&
        typeof a.questionId === 'string' &&
        typeof a.isCorrect === 'boolean' &&
        typeof a.correctAnswer === 'string' &&
        typeof a.explanationVi === 'string' &&
        (a.submittedAnswer === undefined ||
          typeof a.submittedAnswer === 'string'),
    )
  );
}
export function validProgress(value: unknown): value is UserProgress {
  return (
    record(value) &&
    value.version === 1 &&
    typeof value.nickname === 'string' &&
    value.nickname.length <= 40 &&
    record(value.settings) &&
    typeof value.settings.soundEnabled === 'boolean' &&
    typeof value.settings.reducedMotion === 'boolean' &&
    strings(value.visitedVocabularyIds) &&
    strings(value.viewedGrammarIds) &&
    strings(value.earnedBadgeIds) &&
    (value.questCheckpoints === undefined ||
      (record(value.questCheckpoints) &&
        !Array.isArray(value.questCheckpoints) &&
        Object.values(value.questCheckpoints).every((stage) =>
          integer(stage, 3),
        ))) &&
    (value.completedQuestIds === undefined ||
      strings(value.completedQuestIds)) &&
    Array.isArray(value.completedRuns) &&
    value.completedRuns.length <= 30 &&
    value.completedRuns.every(validRun)
  );
}
export function readProgress(): {
  data: UserProgress;
  error: string | null;
  writable: boolean;
} {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { data: defaultProgress(), error: null, writable: true };
    const parsed: unknown = JSON.parse(raw);
    if (!validProgress(parsed)) throw new Error('Invalid schema');
    return { data: parsed, error: null, writable: true };
  } catch {
    return {
      data: defaultProgress(),
      error:
        'Không thể đọc tiến độ trên thiết bị này. Bạn vẫn có thể chơi; dữ liệu cũ được giữ nguyên. Vào Cài đặt để chủ động đặt lại.',
      writable: false,
    };
  }
}
export function writeProgress(progress: UserProgress): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    return true;
  } catch {
    return false;
  }
}
export function addRun(progress: UserProgress, run: GameRun): UserProgress {
  if (progress.completedRuns.some((item) => item.id === run.id))
    return progress;
  return {
    ...progress,
    completedRuns: [run, ...progress.completedRuns].slice(0, 30),
    earnedBadgeIds: [
      ...new Set([...progress.earnedBadgeIds, ...badgesForRun(run)]),
    ],
  };
}
