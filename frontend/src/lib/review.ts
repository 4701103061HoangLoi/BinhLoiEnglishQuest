import { topics } from '../data/neighbourhood';
import { randomFromSeed, shuffle } from './gameLogic';
import type { UserProgress } from '../types';
export interface ReviewProgress {
  words: Record<string, { level: number; due: number; lastDay: number }>;
  day: number;
  today: string[];
  streak: number;
}
export const dayNumber = (date = new Date()) =>
  Math.floor(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86400000,
  );
export function reviewStats(
  review: ReviewProgress | undefined,
  day = dayNumber(),
) {
  return {
    count: review?.day === day ? review.today.length : 0,
    streak: review && review.day >= day - 1 ? review.streak : 0,
  };
}
export function recordReview(
  previous: ReviewProgress | undefined,
  key: string,
  correct: boolean,
  day = dayNumber(),
): ReviewProgress {
  const old = previous?.words[key];
  const level = correct
    ? old?.lastDay === day
      ? old.level
      : Math.min(4, (old?.level ?? 0) + 1)
    : 0;
  const interval = [0, 1, 3, 7, 14][level];
  const today = previous?.day === day ? previous.today : [];
  return {
    words: {
      ...previous?.words,
      [key]: { level, due: day + interval, lastDay: day },
    },
    day,
    today: [...new Set([...today, key])],
    streak:
      previous?.day === day
        ? previous.streak
        : previous?.day === day - 1
          ? previous.streak + 1
          : 1,
  };
}
export function reviewQuestions(
  progress: UserProgress,
  seed: number,
  day = dayNumber(),
) {
  const random = randomFromSeed(seed);
  const all = topics.flatMap((topic) =>
    topic.vocabulary.map((word) => ({
      ...word,
      key: `${topic.id}:${word.id}`,
      topic: topic.titleEn,
    })),
  );
  const learned = new Set(progress.visitedVocabularyIds);
  const mistakes = new Set(
    progress.completedRuns
      .filter((run) => run.gameId === 'word-match')
      .flatMap((run) =>
        run.answers
          .filter((answer) => !answer.isCorrect)
          .map((answer) => `${run.topicId}:${answer.questionId}`),
      ),
  );
  const pool = all.filter(
    (word) =>
      learned.has(word.key) ||
      progress.review?.words[word.key] ||
      mistakes.has(word.key),
  );
  const priority = (key: string) => {
    const record = progress.review?.words[key];
    return record
      ? record.due <= day
        ? record.level === 0
          ? 0
          : 1
        : 3
      : mistakes.has(key)
        ? 0
        : 2;
  };
  return shuffle(
    pool.length
      ? pool
      : all.filter((word) => word.key.startsWith('my-new-school:')),
    random,
  )
    .sort((a, b) => priority(a.key) - priority(b.key))
    .slice(0, 5)
    .map((word) => ({
      word,
      options: shuffle(
        [
          word,
          ...shuffle(
            all.filter((other) => other.meaningVi !== word.meaningVi),
            random,
          ).slice(0, 2),
        ],
        random,
      ),
    }));
}
export function validReview(value: unknown): value is ReviewProgress {
  if (!value || typeof value !== 'object') return false;
  const r = value as ReviewProgress;
  const int = (n: unknown) => Number.isInteger(n) && Number(n) >= 0;
  const keys = new Set(
    topics.flatMap((topic) =>
      topic.vocabulary.map((word) => `${topic.id}:${word.id}`),
    ),
  );
  return (
    int(r.day) &&
    int(r.streak) &&
    Array.isArray(r.today) &&
    r.today.every((key) => keys.has(key)) &&
    new Set(r.today).size === r.today.length &&
    !!r.words &&
    typeof r.words === 'object' &&
    !Array.isArray(r.words) &&
    Object.entries(r.words).every(
      ([key, entry]) =>
        keys.has(key) &&
        entry &&
        int(entry.level) &&
        entry.level <= 4 &&
        int(entry.due) &&
        int(entry.lastDay),
    )
  );
}
