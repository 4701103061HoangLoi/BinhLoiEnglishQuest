import { describe, expect, it } from 'vitest';
import { topics } from '../src/data/neighbourhood';
import { quests } from '../src/data/quests';
import {
  createMemoryCards,
  flipMemory,
  initialMemory,
} from '../src/lib/questLogic';
import {
  defaultProgress,
  readProgress,
  STORAGE_KEY,
  validProgress,
} from '../src/lib/storage';

describe('quest rules', () => {
  it.each(topics)(
    'has a story and three complete memory pairs for $titleEn',
    (topic) => {
      expect(quests[topic.id].ending).toBeTruthy();
      const cards = createMemoryCards(topic.vocabulary.slice(3, 6));
      expect(cards).toHaveLength(6);
      expect(new Set(cards.map((card) => card.id)).size).toBe(6);
      for (const word of topic.vocabulary.slice(3, 6)) {
        expect(
          cards
            .filter((card) => card.wordId === word.id)
            .map((card) => card.kind)
            .sort(),
        ).toEqual(['picture', 'word']);
      }
    },
  );
  it('rejects unknown and repeated flips, locks after two cards, and keeps matched pairs', () => {
    const cards = createMemoryCards(topics[0].vocabulary.slice(3, 6));
    const first = cards[0];
    const other = cards.find((card) => card.wordId !== first.wordId)!;
    const match = cards.find(
      (card) => card.wordId === first.wordId && card.id !== first.id,
    )!;
    let state = initialMemory();
    expect(flipMemory(state, cards, 'missing')).toBe(state);
    state = flipMemory(state, cards, first.id);
    expect(flipMemory(state, cards, first.id)).toBe(state);
    state = flipMemory(state, cards, other.id);
    expect(state.matched).toEqual([]);
    expect(state.attempts).toBe(1);
    expect(flipMemory(state, cards, match.id)).toBe(state);
    state = { ...state, open: [] };
    state = flipMemory(flipMemory(state, cards, first.id), cards, match.id);
    expect(state.matched).toEqual([first.wordId]);
    expect(state.attempts).toBe(2);
    state = { ...state, open: [] };
    expect(flipMemory(state, cards, first.id)).toBe(state);
  });
  it('reads existing v1 progress and validates optional quest milestones', () => {
    const legacy = { ...defaultProgress(), nickname: 'Explorer' };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(legacy));
    expect(readProgress().data).toEqual(legacy);
    const completed = { ...legacy, completedQuestIds: ['my-new-school'] };
    expect(validProgress(completed)).toBe(true);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(completed));
    expect(readProgress().data).toEqual(completed);
    expect(validProgress({ ...legacy, completedQuestIds: [null] })).toBe(false);
  });
});
