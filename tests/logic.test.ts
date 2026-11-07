import { describe, expect, it, vi } from 'vitest';
import {
  calculateScore,
  createRunQuestions,
  isSentenceCorrect,
  normalizeAnswer,
  remainingSeconds,
  badgesForRun,
} from '../src/lib/gameLogic';
import {
  neighbourhood,
  quiz,
  sentences,
  topics,
} from '../src/data/neighbourhood';
import { existsSync } from 'node:fs';
import {
  addRun,
  defaultProgress,
  readProgress,
  STORAGE_KEY,
  validProgress,
  writeProgress,
} from '../src/lib/storage';
import { validateTopic } from '../src/lib/validation';
import type { GameRun } from '../src/types';
export const completedRun = (overrides: Partial<GameRun> = {}): GameRun => ({
  id: 'test-run',
  seed: 1,
  topicId: neighbourhood.id,
  gameId: 'quick-quiz',
  mode: 'challenge',
  startedAt: '2026-11-06T10:00:00.000Z',
  finishedAt: '2026-11-06T10:00:30.000Z',
  elapsedSeconds: 30,
  correctCount: 5,
  wrongCount: 0,
  baseScore: 50,
  timeBonus: 4,
  score: 54,
  totalItems: 5,
  finishedBy: 'completed',
  answers: [],
  ...overrides,
});
describe('scoring and badges', () => {
  it.each([
    [5, 50],
    [3, 30],
    [0, 0],
  ])('quiz %i correct gives %i base', (correct, expected) =>
    expect(
      calculateScore('quick-quiz', correct, 5 - correct, 0, true).score,
    ).toBe(expected),
  );
  it('deducts five per wrong match and never goes negative', () => {
    expect(calculateScore('word-match', 5, 2, 0, true).score).toBe(40);
    expect(calculateScore('word-match', 2, 9, 0, false).score).toBe(0);
  });
  it('caps bonus, respects remainder, completion and practice', () => {
    expect(calculateScore('sentence-builder', 5, 0, 1000, true).score).toBe(60);
    expect(calculateScore('quick-quiz', 5, 0, 14, true).timeBonus).toBe(0);
    expect(calculateScore('quick-quiz', 3, 1, 75, false).timeBonus).toBe(0);
    expect(
      calculateScore('quick-quiz', 5, 0, 75, true, 'practice').timeBonus,
    ).toBe(0);
  });
  it('awards correct badges only after completed challenge', () => {
    expect(badgesForRun(completedRun())).toEqual(
      expect.arrayContaining([
        'grammar-hero',
        'first-quest',
        'perfect-explorer',
      ]),
    );
    expect(
      badgesForRun(
        completedRun({
          gameId: 'word-match',
          wrongCount: 2,
          baseScore: 40,
          score: 44,
        }),
      ),
    ).not.toContain('vocabulary-star');
    expect(badgesForRun(completedRun({ mode: 'practice' }))).toEqual([]);
    expect(badgesForRun(completedRun({ finishedBy: 'timeout' }))).toEqual([]);
  });
});
describe('content and randomization', () => {
  it.each(topics)(
    'provides complete playable content and local images for $titleEn',
    (topic) => {
      expect(validateTopic(topic)).toEqual([]);
      expect(topic.vocabulary).toHaveLength(9);
      expect(topic.grammar.length).toBeGreaterThan(0);
      expect(existsSync(`public${topic.imagePath}`)).toBe(true);
      topic.vocabulary.forEach((word) =>
        expect(existsSync(`public${word.imagePath}`)).toBe(true),
      );
      const questions = createRunQuestions(topic, 42);
      expect(questions.match).toHaveLength(5);
      expect(questions.quiz).toHaveLength(5);
      expect(questions.sentences).toHaveLength(5);
      topic.sentences.forEach((sentence) =>
        expect(
          isSentenceCorrect(
            sentence.tokens,
            sentence.tokens.map((token) => token.id),
            sentence.correctSentence,
          ),
        ).toBe(true),
      );
    },
  );
  it('validates the complete PRD topic', () =>
    expect(validateTopic(neighbourhood)).toEqual([]));
  it('rejects insufficient content and invalid answer IDs', () => {
    expect(
      validateTopic({
        ...neighbourhood,
        quiz: [{ ...quiz[0], correctOptionId: 'missing' }],
      }).length,
    ).toBeGreaterThan(0);
    expect(() =>
      createRunQuestions({ ...neighbourhood, sentences: [] }, 1),
    ).toThrow();
  });
  it('is seeded, retains correct IDs and always has five unique units', () => {
    const positions = new Set<number>();
    for (let seed = 1; seed <= 60; seed++) {
      const q = createRunQuestions(neighbourhood, seed);
      expect(q).toEqual(createRunQuestions(neighbourhood, seed));
      expect(new Set(q.match.map((v) => v.id)).size).toBe(5);
      expect(q.images.map((v) => v.id).sort()).toEqual(
        q.match.map((v) => v.id).sort(),
      );
      q.quiz.forEach((item) => {
        expect(
          item.options.find((o) => o.id === item.correctOptionId)?.text,
        ).toBe(quiz.find((o) => o.id === item.id)!.options[1].text);
        positions.add(
          item.options.findIndex((o) => o.id === item.correctOptionId),
        );
      });
      q.sentences.forEach((item) =>
        expect(
          normalizeAnswer(item.tokens.map((t) => t.text).join(' ')),
        ).not.toBe(normalizeAnswer(item.correctSentence)),
      );
    }
    expect(positions.size).toBe(3);
  });
});
describe('answers and timing', () => {
  it('normalizes whitespace, case and terminal punctuation without changing order', () => {
    expect(normalizeAnswer('  This  street IS busier. ')).toBe(
      'this street is busier',
    );
    expect(normalizeAnswer('street this is busier')).not.toBe(
      normalizeAnswer('This street is busier.'),
    );
  });
  it('handles repeated street tokens by unique ID and rejects duplicate/unknown tokens', () => {
    const s = sentences[0];
    const ids = s.tokens.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(isSentenceCorrect(s.tokens, ids, s.correctSentence)).toBe(true);
    expect(
      isSentenceCorrect(s.tokens, [...ids].reverse(), s.correctSentence),
    ).toBe(false);
    expect(
      isSentenceCorrect(
        s.tokens,
        [ids[0], ...ids.slice(0, -1)],
        s.correctSentence,
      ),
    ).toBe(false);
    expect(
      isSentenceCorrect(
        s.tokens,
        ['invalid', ...ids.slice(1)],
        s.correctSentence,
      ),
    ).toBe(false);
  });
  it('derives timer from deadline including background gaps', () => {
    expect(remainingSeconds(90000, 0)).toBe(90);
    expect(remainingSeconds(90000, 89999)).toBe(1);
    expect(remainingSeconds(90000, 190000)).toBe(0);
  });
});
describe('versioned persistence', () => {
  it('roundtrips progress and deduplicates run IDs and badges', () => {
    const p = addRun(defaultProgress(), completedRun());
    expect(addRun(p, completedRun())).toBe(p);
    expect(writeProgress(p)).toBe(true);
    expect(readProgress().data).toEqual(p);
    expect(new Set(p.earnedBadgeIds).size).toBe(p.earnedBadgeIds.length);
  });
  it('bounds history to 30 without forgetting earned badges', () => {
    let p = defaultProgress();
    for (let i = 0; i < 35; i++) p = addRun(p, completedRun({ id: `${i}` }));
    expect(p.completedRuns).toHaveLength(30);
    expect(p.completedRuns[0].id).toBe('34');
    expect(p.earnedBadgeIds).toContain('grammar-hero');
  });
  it.each(['{bad json', '{"version":2}', '{"version":1,"completedRuns":null}'])(
    'preserves invalid data: %s',
    (raw) => {
      localStorage.setItem(STORAGE_KEY, raw);
      expect(readProgress().data).toEqual(defaultProgress());
      expect(readProgress().writable).toBe(false);
      expect(localStorage.getItem(STORAGE_KEY)).toBe(raw);
    },
  );
  it('rejects malformed nested runs', () =>
    expect(
      validProgress({
        ...defaultProgress(),
        completedRuns: [{ ...completedRun(), answers: [null] }],
      }),
    ).toBe(false));
  it('survives unavailable storage', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    expect(readProgress().error).toBeTruthy();
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('quota');
    });
    expect(writeProgress(defaultProgress())).toBe(false);
  });
});
