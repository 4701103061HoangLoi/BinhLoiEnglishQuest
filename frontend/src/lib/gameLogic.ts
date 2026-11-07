import type {
  GameId,
  GameMode,
  GameRun,
  Token,
  Topic,
  VocabularyItem,
} from '../types';
export function randomFromSeed(seed: number) {
  let value = seed >>> 0;
  return () => {
    value = (value * 1664525 + 1013904223) >>> 0;
    return value / 4294967296;
  };
}
export function shuffle<T>(items: readonly T[], random: () => number): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
export function normalizeAnswer(answer: string) {
  return answer
    .trim()
    .replace(/[.!?]+$/, '')
    .replace(/\s+/g, ' ')
    .toLowerCase();
}
export function isSentenceCorrect(
  tokens: Token[],
  selectedIds: string[],
  target: string,
) {
  if (
    selectedIds.length !== tokens.length ||
    new Set(selectedIds).size !== tokens.length
  )
    return false;
  const selected = selectedIds.map((id) =>
    tokens.find((token) => token.id === id),
  );
  return (
    selected.every(Boolean) &&
    normalizeAnswer(selected.map((token) => token!.text).join(' ')) ===
      normalizeAnswer(target)
  );
}
export function shuffledTokens(tokens: Token[], random: () => number) {
  const shuffled = shuffle(tokens, random);
  if (
    normalizeAnswer(shuffled.map((t) => t.text).join(' ')) ===
    normalizeAnswer(tokens.map((t) => t.text).join(' '))
  )
    shuffled.push(shuffled.shift()!);
  return shuffled;
}
export function createRunQuestions(topic: Topic, seed: number) {
  if (
    topic.vocabulary.length < 5 ||
    topic.quiz.length < 5 ||
    topic.sentences.length < 5
  )
    throw new Error('Chủ đề cần ít nhất 5 mục cho mỗi trò chơi.');
  const random = randomFromSeed(seed);
  const match = shuffle(topic.vocabulary, random).slice(0, 5);
  return {
    match,
    images: shuffle(match, random),
    quiz: shuffle(topic.quiz, random)
      .slice(0, 5)
      .map((q) => ({ ...q, options: shuffle(q.options, random) })),
    sentences: shuffle(topic.sentences, random)
      .slice(0, 5)
      .map((q) => ({ ...q, tokens: shuffledTokens(q.tokens, random) })),
  };
}
export function remainingSeconds(deadline: number, now: number) {
  return Math.max(0, Math.ceil((deadline - now) / 1000));
}
export function calculateScore(
  gameId: GameId,
  correct: number,
  wrong: number,
  remaining: number,
  completed: boolean,
  mode: GameMode = 'challenge',
) {
  const baseScore = Math.max(
    0,
    Math.min(5, Math.max(0, correct)) * 10 -
      (gameId === 'word-match' ? Math.max(0, wrong) * 5 : 0),
  );
  const timeBonus =
    mode === 'challenge' && completed && remaining > 0
      ? Math.min(10, Math.floor(remaining / 15))
      : 0;
  return { baseScore, timeBonus, score: baseScore + timeBonus };
}
export const badges = [
  {
    id: 'first-quest',
    name: 'First Quest',
    description: 'Hoàn thành một thử thách.',
  },
  {
    id: 'vocabulary-star',
    name: 'Vocabulary Star',
    description: 'Ghép đúng cả 5 cặp, không thử sai.',
  },
  {
    id: 'grammar-hero',
    name: 'Grammar Hero',
    description: 'Trả lời đúng 5/5 câu Quick Quiz.',
  },
  {
    id: 'sentence-master',
    name: 'Sentence Master',
    description: 'Xếp đúng 5/5 câu Sentence Builder.',
  },
  {
    id: 'perfect-explorer',
    name: 'Perfect Explorer',
    description: 'Đạt điểm cơ bản 50/50 ở một game.',
  },
];
export function badgesForRun(run: GameRun) {
  if (run.mode !== 'challenge' || run.finishedBy !== 'completed') return [];
  return [
    'first-quest',
    ...(run.baseScore === 50 ? ['perfect-explorer'] : []),
    ...(run.correctCount === 5
      ? run.gameId === 'word-match'
        ? run.wrongCount === 0
          ? ['vocabulary-star']
          : []
        : [run.gameId === 'quick-quiz' ? 'grammar-hero' : 'sentence-master']
      : []),
  ];
}

export function createDemoQuestion(
  words: VocabularyItem[],
  random: () => number,
  previousId?: string,
) {
  if (words.length < 3) throw new Error('Chơi thử cần ít nhất 3 từ.');
  const candidates = words.filter((word) => word.id !== previousId);
  const target = candidates[Math.floor(random() * candidates.length)];
  const distractors = shuffle(
    words.filter((word) => word.id !== target.id),
    random,
  ).slice(0, 2);
  return { target, choices: shuffle([target, ...distractors], random) };
}
