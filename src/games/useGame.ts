import { useEffect, useRef, useState } from 'react';
import {
  calculateScore,
  createRunQuestions,
  isSentenceCorrect,
  remainingSeconds,
} from '../lib/gameLogic';
import { gameInfo } from '../data/neighbourhood';
import type { Answer, GameId, GameMode, GameRun, Topic } from '../types';
interface GameState {
  index: number;
  answers: Answer[];
  matched: string[];
  wrong: number;
  selectedWord: string | null;
  selectedTokens: string[];
  feedback: { correct: boolean; text: string; answer: string } | null;
  done: boolean;
}
export function useGame(
  topic: Topic,
  gameId: GameId,
  mode: GameMode,
  onFinish: (run: GameRun) => void,
  onAnswer?: (correct: boolean) => void,
) {
  const [identity] = useState(() => {
    const start = Date.now();
    const seed = Math.floor(Math.random() * 4294967296);
    return {
      id: `run-${start}-${seed}`,
      seed,
      start,
      deadline: start + gameInfo[gameId].seconds * 1000,
    };
  });
  const [questions] = useState(() => createRunQuestions(topic, identity.seed));
  const [state, setState] = useState<GameState>({
    index: 0,
    answers: [],
    matched: [],
    wrong: 0,
    selectedWord: null,
    selectedTokens: [],
    feedback: null,
    done: false,
  });
  const latest = useRef(state);
  const [now, setNow] = useState(identity.start);
  const finishCallback = useRef(onFinish);
  finishCallback.current = onFinish;
  const commit = (next: GameState) => {
    latest.current = next;
    setState(next);
  };
  function finish(reason: GameRun['finishedBy']) {
    const current = latest.current;
    if (current.done) return;
    commit({ ...current, done: true });
    const end = Date.now();
    const correct =
      gameId === 'word-match'
        ? current.matched.length
        : current.answers.filter((a) => a.isCorrect).length;
    const unanswered =
      gameId === 'word-match'
        ? questions.match
            .filter((q) => !current.matched.includes(q.id))
            .map((q) => ({
              questionId: q.id,
              isCorrect: false,
              correctAnswer: q.term,
              explanationVi: q.meaningVi,
            }))
        : (gameId === 'quick-quiz'
            ? questions.quiz.map((q) => ({
                questionId: q.id,
                isCorrect: false,
                correctAnswer: q.options.find(
                  (o) => o.id === q.correctOptionId,
                )!.text,
                explanationVi: q.explanationVi,
              }))
            : questions.sentences.map((q) => ({
                questionId: q.id,
                isCorrect: false,
                correctAnswer: q.correctSentence,
                explanationVi: q.explanationVi,
              }))
          ).filter(
            (q) => !current.answers.some((a) => a.questionId === q.questionId),
          );
    const score = calculateScore(
      gameId,
      correct,
      current.wrong,
      reason === 'timeout' ? 0 : remainingSeconds(identity.deadline, end),
      reason === 'completed',
      mode,
    );
    finishCallback.current({
      id: identity.id,
      seed: identity.seed,
      topicId: topic.id,
      gameId,
      mode,
      startedAt: new Date(identity.start).toISOString(),
      finishedAt: new Date(end).toISOString(),
      elapsedSeconds: Math.max(0, Math.floor((end - identity.start) / 1000)),
      correctCount: correct,
      wrongCount: current.wrong,
      ...score,
      totalItems: 5,
      finishedBy: reason,
      answers: [...current.answers, ...unanswered],
    });
  }
  const finishRef = useRef(finish);
  finishRef.current = finish;
  useEffect(() => {
    const tick = () => {
      const time = Date.now();
      setNow(time);
      if (
        mode === 'challenge' &&
        remainingSeconds(identity.deadline, time) === 0
      )
        finishRef.current('timeout');
    };
    const interval = window.setInterval(tick, 250);
    document.addEventListener('visibilitychange', tick);
    window.addEventListener('focus', tick);
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', tick);
      window.removeEventListener('focus', tick);
    };
  }, [identity, mode]);
  function canAct() {
    if (latest.current.done) return false;
    if (mode === 'challenge' && Date.now() >= identity.deadline) {
      finish('timeout');
      return false;
    }
    return true;
  }
  function selectWord(id: string) {
    if (
      canAct() &&
      !latest.current.feedback &&
      !latest.current.matched.includes(id)
    )
      commit({ ...latest.current, selectedWord: id });
  }
  function selectImage(id: string) {
    if (!canAct()) return;
    const s = latest.current;
    if (!s.selectedWord || s.feedback || s.matched.includes(id)) return;
    const item = questions.match.find((q) => q.id === s.selectedWord)!;
    const correct = s.selectedWord === id;
    const next = {
      ...s,
      wrong: s.wrong + (correct ? 0 : 1),
      matched: correct ? [...s.matched, id] : s.matched,
      answers: correct
        ? [
            ...s.answers,
            {
              questionId: id,
              isCorrect: true,
              submittedAnswer: item.term,
              correctAnswer: item.term,
              explanationVi: item.meaningVi,
            },
          ]
        : s.answers,
      feedback: {
        correct,
        answer: correct ? item.term : '',
        text: correct
          ? `Chính xác! ${item.term}: ${item.meaningVi}.`
          : 'Try again! Hai thẻ chưa khớp. Hãy quan sát hình rồi thử lại. −5 điểm.',
      },
    };
    commit(next);
    onAnswer?.(correct);
    if (next.matched.length === 5) finish('completed');
  }
  function answerQuiz(id: string) {
    if (!canAct() || latest.current.feedback) return;
    const s = latest.current;
    const q = questions.quiz[s.index];
    const option = q.options.find((o) => o.id === id);
    if (!option) return;
    const correct = id === q.correctOptionId;
    const answer = q.options.find((o) => o.id === q.correctOptionId)!.text;
    commit({
      ...s,
      wrong: s.wrong + (correct ? 0 : 1),
      answers: [
        ...s.answers,
        {
          questionId: q.id,
          isCorrect: correct,
          submittedAnswer: option.text,
          correctAnswer: answer,
          explanationVi: q.explanationVi,
        },
      ],
      feedback: { correct, answer, text: q.explanationVi },
    });
    onAnswer?.(correct);
  }
  function toggleToken(id: string) {
    if (!canAct() || latest.current.feedback) return;
    const s = latest.current;
    if (!questions.sentences[s.index].tokens.some((t) => t.id === id)) return;
    commit({
      ...s,
      selectedTokens: s.selectedTokens.includes(id)
        ? s.selectedTokens.filter((t) => t !== id)
        : [...s.selectedTokens, id],
    });
  }
  function clearTokens() {
    if (canAct() && !latest.current.feedback)
      commit({ ...latest.current, selectedTokens: [] });
  }
  function checkSentence() {
    if (!canAct() || latest.current.feedback) return;
    const s = latest.current;
    const q = questions.sentences[s.index];
    if (s.selectedTokens.length !== q.tokens.length) return;
    const correct = isSentenceCorrect(
      q.tokens,
      s.selectedTokens,
      q.correctSentence,
    );
    commit({
      ...s,
      wrong: s.wrong + (correct ? 0 : 1),
      answers: [
        ...s.answers,
        {
          questionId: q.id,
          isCorrect: correct,
          submittedAnswer: s.selectedTokens
            .map((id) => q.tokens.find((t) => t.id === id)!.text)
            .join(' '),
          correctAnswer: q.correctSentence,
          explanationVi: q.explanationVi,
        },
      ],
      feedback: { correct, answer: q.correctSentence, text: q.explanationVi },
    });
    onAnswer?.(correct);
  }
  function next() {
    if (!canAct() || !latest.current.feedback) return;
    if (gameId !== 'word-match' && latest.current.index === 4) {
      finish('completed');
      return;
    }
    commit({
      ...latest.current,
      feedback: null,
      selectedWord: null,
      selectedTokens: [],
      index: latest.current.index + (gameId === 'word-match' ? 0 : 1),
    });
  }
  const correct =
    gameId === 'word-match'
      ? state.matched.length
      : state.answers.filter((a) => a.isCorrect).length;
  return {
    state,
    questions,
    remaining: remainingSeconds(identity.deadline, now),
    elapsed: Math.floor((now - identity.start) / 1000),
    score: calculateScore(gameId, correct, state.wrong, 0, false).baseScore,
    selectWord,
    selectImage,
    answerQuiz,
    toggleToken,
    clearTokens,
    checkSentence,
    next,
  };
}
