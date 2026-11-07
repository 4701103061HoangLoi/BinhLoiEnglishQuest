export type GameId = 'word-match' | 'quick-quiz' | 'sentence-builder';
export type GameMode = 'challenge' | 'practice';
export interface VocabularyItem {
  id: string;
  term: string;
  meaningVi: string;
  partOfSpeech: string;
  exampleEn: string;
  exampleVi: string;
  imagePath: string;
  imageAlt: string;
}
export interface GrammarLesson {
  id: string;
  title: string;
  rule: string;
  example: string;
  note: string;
}
export interface QuizQuestion {
  id: string;
  prompt: string;
  options: { id: string; text: string }[];
  correctOptionId: string;
  explanationVi: string;
}
export interface Token {
  id: string;
  text: string;
}
export interface SentenceQuestion {
  id: string;
  tokens: Token[];
  correctSentence: string;
  explanationVi: string;
}
export interface Topic {
  id: string;
  titleEn: string;
  titleVi: string;
  grade: number;
  unit: number;
  descriptionVi: string;
  imagePath: string;
  imageAlt: string;
  grammarTitle: string;
  grammarDescriptionVi: string;
  grammarExample: string;
  grammarExampleVi: string;
  grammarCautionVi: string;
  vocabulary: VocabularyItem[];
  grammar: GrammarLesson[];
  quiz: QuizQuestion[];
  sentences: SentenceQuestion[];
}
export interface Answer {
  questionId: string;
  isCorrect: boolean;
  submittedAnswer?: string;
  correctAnswer: string;
  explanationVi: string;
}
export interface GameRun {
  id: string;
  seed: number;
  topicId: string;
  gameId: GameId;
  mode: GameMode;
  startedAt: string;
  finishedAt: string;
  elapsedSeconds: number;
  correctCount: number;
  wrongCount: number;
  baseScore: number;
  timeBonus: number;
  score: number;
  totalItems: 5;
  finishedBy: 'completed' | 'timeout';
  answers: Answer[];
}
export interface UserProgress {
  version: 1;
  nickname: string;
  settings: { soundEnabled: boolean; reducedMotion: boolean };
  visitedVocabularyIds: string[];
  viewedGrammarIds: string[];
  completedRuns: GameRun[];
  earnedBadgeIds: string[];
}
