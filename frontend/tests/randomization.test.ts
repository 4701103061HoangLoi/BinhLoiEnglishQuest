import { describe, expect, it } from 'vitest';
import { newSchool } from '../src/data/firstUnits';
import { createDemoQuestion, randomFromSeed } from '../src/lib/gameLogic';
import { createMemoryCards } from '../src/lib/questLogic';

describe('randomized question layouts', () => {
  it('varies demo questions and correct positions, keeping three unique choices and avoiding the previous question', () => {
    const words = newSchool.vocabulary.slice(0, 5);
    const targets = new Set<string>();
    const positions = new Set<number>();
    for (let seed = 1; seed <= 80; seed++) {
      const question = createDemoQuestion(words, randomFromSeed(seed * 65537));
      targets.add(question.target.id);
      positions.add(
        question.choices.findIndex((word) => word.id === question.target.id),
      );
      expect(new Set(question.choices.map((word) => word.id)).size).toBe(3);
      expect(
        question.choices.filter((word) => word.id === question.target.id),
      ).toHaveLength(1);
      const next = createDemoQuestion(
        words,
        randomFromSeed(seed),
        question.target.id,
      );
      expect(next.target.id).not.toBe(question.target.id);
    }
    expect(targets.size).toBe(5);
    expect(positions.size).toBe(3);
    expect(() =>
      createDemoQuestion(words.slice(0, 2), randomFromSeed(1)),
    ).toThrow();
  });
  it('varies memory positions while preserving every pair and its stable identity', () => {
    const words = newSchool.vocabulary.slice(3, 6);
    const orders = new Set<string>();
    for (let seed = 1; seed <= 20; seed++) {
      const cards = createMemoryCards(words, randomFromSeed(seed * 65537));
      orders.add(cards.map((card) => card.id).join('|'));
      expect(new Set(cards.map((card) => card.id)).size).toBe(6);
      for (const word of words)
        expect(cards.filter((card) => card.wordId === word.id)).toHaveLength(2);
    }
    expect(orders.size).toBeGreaterThan(1);
  });
});
