import type { UserProgress, VocabularyItem } from '../types';
import { shuffle } from './gameLogic';

export interface MemoryCard {
  id: string;
  wordId: string;
  kind: 'word' | 'picture';
}
export interface MemoryState {
  open: string[];
  matched: string[];
  attempts: number;
}
export const initialMemory = (): MemoryState => ({
  open: [],
  matched: [],
  attempts: 0,
});
export function createMemoryCards(
  words: VocabularyItem[],
  random: () => number,
): MemoryCard[] {
  return shuffle(
    words.flatMap((word) => [
      { id: `${word.id}-word`, wordId: word.id, kind: 'word' as const },
      { id: `${word.id}-picture`, wordId: word.id, kind: 'picture' as const },
    ]),
    random,
  );
}
export function flipMemory(
  state: MemoryState,
  cards: MemoryCard[],
  id: string,
): MemoryState {
  const card = cards.find((item) => item.id === id);
  if (
    !card ||
    state.open.length === 2 ||
    state.open.includes(id) ||
    state.matched.includes(card.wordId)
  )
    return state;
  const open = [...state.open, id];
  if (open.length === 1) return { ...state, open };
  const first = cards.find((item) => item.id === open[0])!;
  return {
    open,
    matched:
      first.wordId === card.wordId
        ? [...state.matched, card.wordId]
        : state.matched,
    attempts: state.attempts + 1,
  };
}

export function questStage(progress: UserProgress, topicId: string): number {
  return (
    progress.questCheckpoints?.[topicId] ??
    ((progress.completedQuestIds ?? []).includes(topicId) ? 3 : 0)
  );
}
