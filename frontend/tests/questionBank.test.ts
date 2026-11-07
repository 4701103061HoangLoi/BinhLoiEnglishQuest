import { describe, expect, it } from 'vitest';
import { topics } from '../src/data/neighbourhood';
import {
  createDemoQuestion,
  createRunQuestions,
  isSentenceCorrect,
  normalizeAnswer,
  randomFromSeed,
} from '../src/lib/gameLogic';
import { validateTopic } from '../src/lib/validation';

describe('expanded topic question banks', () => {
  it.each(topics)(
    'provides 20 distinct quizzes and 20 complete sentences for $titleEn',
    (topic) => {
      expect(validateTopic(topic)).toEqual([]);
      expect(topic.quiz).toHaveLength(20);
      expect(topic.sentences).toHaveLength(20);
      expect(
        new Set(topic.quiz.map((q) => normalizeAnswer(q.prompt))).size,
      ).toBe(20);
      expect(
        new Set(topic.sentences.map((q) => normalizeAnswer(q.correctSentence)))
          .size,
      ).toBe(20);
      for (const question of topic.quiz) {
        expect(
          new Set(
            question.options.map((option) => normalizeAnswer(option.text)),
          ).size,
        ).toBe(question.options.length);
        expect(
          question.options.filter(
            (option) => option.id === question.correctOptionId,
          ),
        ).toHaveLength(1);
        expect(question.explanationVi.trim()).not.toBe('');
      }
      for (const sentence of topic.sentences) {
        expect(
          isSentenceCorrect(
            sentence.tokens,
            sentence.tokens.map((token) => token.id),
            sentence.correctSentence,
          ),
        ).toBe(true);
        expect(sentence.explanationVi.trim()).not.toBe('');
      }
    },
  );
  it.each(topics)(
    'samples every item across seeds with five unique questions per run for $titleEn',
    (topic) => {
      const words = new Set<string>(),
        quiz = new Set<string>(),
        sentences = new Set<string>();
      const combinations = new Set<string>();
      const original = JSON.stringify(topic);
      for (let seed = 1; seed <= 100; seed++) {
        const run = createRunQuestions(topic, seed * 65537);
        for (const items of [run.match, run.quiz, run.sentences])
          expect(new Set(items.map((item) => item.id)).size).toBe(5);
        run.match.forEach((item) => words.add(item.id));
        run.quiz.forEach((item) => quiz.add(item.id));
        run.sentences.forEach((item) => sentences.add(item.id));
        combinations.add(
          run.quiz
            .map((item) => item.id)
            .sort()
            .join('|'),
        );
      }
      expect(words.size).toBe(topic.vocabulary.length);
      expect(quiz.size).toBe(20);
      expect(sentences.size).toBe(20);
      expect(combinations.size).toBeGreaterThan(1);
      expect(JSON.stringify(topic)).toBe(original);
    },
  );
  it('uses the whole Unit 1 vocabulary for random demo questions', () => {
    const topic = topics.find((topic) => topic.id === 'my-new-school')!;
    const chosen = new Set<string>();
    for (let seed = 1; seed <= 100; seed++)
      chosen.add(
        createDemoQuestion(topic.vocabulary, randomFromSeed(seed * 65537))
          .target.id,
      );
    expect(chosen.size).toBe(9);
  });
});
