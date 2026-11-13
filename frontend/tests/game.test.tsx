import { StrictMode } from 'react';
import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useGame } from '../src/games/useGame';
import { neighbourhood, sentences } from '../src/data/neighbourhood';
import type { GameRun } from '../src/types';
describe('game interaction engine', () => {
  it('scores all quiz answers, blocks double submits and saves exactly once', () => {
    const save = vi.fn();
    const sound = vi.fn();
    const { result } = renderHook(
      () => useGame(neighbourhood, 'quick-quiz', 'challenge', save, sound),
      { wrapper: StrictMode },
    );
    for (let i = 0; i < 5; i++) {
      const q = result.current.questions.quiz[i];
      act(() => {
        result.current.answerQuiz(q.correctOptionId);
        result.current.answerQuiz(q.correctOptionId);
      });
      expect(result.current.state.answers).toHaveLength(i + 1);
      act(() => result.current.next());
    }
    expect(sound).toHaveBeenCalledTimes(5);
    expect(sound.mock.calls.every(([correct]) => correct === true)).toBe(true);
    expect(save).toHaveBeenCalledTimes(1);
    const run = save.mock.calls[0][0] as GameRun;
    expect(run.correctCount).toBe(5);
    expect(run.baseScore).toBe(50);
    act(() => result.current.next());
    expect(save).toHaveBeenCalledTimes(1);
  });
  it('records 3 correct and 2 wrong quiz answers', () => {
    const save = vi.fn();
    const { result } = renderHook(() =>
      useGame(neighbourhood, 'quick-quiz', 'challenge', save),
    );
    for (let i = 0; i < 5; i++) {
      const q = result.current.questions.quiz[i];
      act(() =>
        result.current.answerQuiz(
          i < 3
            ? q.correctOptionId
            : q.options.find((o) => o.id !== q.correctOptionId)!.id,
        ),
      );
      act(() => result.current.next());
    }
    expect(save.mock.calls[0][0]).toMatchObject({
      baseScore: 30,
      correctCount: 3,
      wrongCount: 2,
    });
  });
  it('deducts exactly twice for two wrong matches before completing', () => {
    const save = vi.fn();
    const { result } = renderHook(() =>
      useGame(neighbourhood, 'word-match', 'challenge', save),
    );
    const items = result.current.questions.match;
    for (let i = 0; i < 2; i++) {
      act(() => result.current.selectWord(items[0].id));
      act(() => {
        result.current.selectImage(items[1].id);
        result.current.selectImage(items[1].id);
      });
      act(() => result.current.next());
    }
    for (const item of items) {
      act(() => result.current.selectWord(item.id));
      act(() => result.current.selectImage(item.id));
      if (!result.current.state.done) act(() => result.current.next());
    }
    expect(save).toHaveBeenCalledTimes(1);
    expect(save.mock.calls[0][0]).toMatchObject({
      correctCount: 5,
      wrongCount: 2,
      baseScore: 40,
    });
  });
  it('lets tokens be removed, reset and submitted only once', () => {
    const save = vi.fn();
    const { result } = renderHook(() =>
      useGame(neighbourhood, 'sentence-builder', 'challenge', save),
    );
    const q = result.current.questions.sentences[0];
    const original = sentences.find((s) => s.id === q.id)!;
    act(() => result.current.toggleToken(q.tokens[0].id));
    act(() => result.current.toggleToken(q.tokens[0].id));
    expect(result.current.state.selectedTokens).toEqual([]);
    act(() => result.current.checkSentence());
    expect(result.current.state.answers).toEqual([]);
    act(() => result.current.toggleToken(q.tokens[0].id));
    act(() => result.current.clearTokens());
    expect(result.current.state.selectedTokens).toEqual([]);
    for (const token of original.tokens)
      act(() => result.current.toggleToken(token.id));
    act(() => {
      result.current.checkSentence();
      result.current.checkSentence();
    });
    expect(result.current.state.answers).toHaveLength(1);
    expect(result.current.state.answers[0].isCorrect).toBe(true);
  });
  it.each(['quick-quiz', 'sentence-builder'] as const)(
    'pauses %s feedback and resumes the deadline on next',
    (gameId) => {
      vi.useFakeTimers();
      const save = vi.fn();
      const { result } = renderHook(
        () => useGame(neighbourhood, gameId, 'challenge', save),
        { wrapper: StrictMode },
      );
      act(() => vi.advanceTimersByTime(5000));
      if (gameId === 'quick-quiz') {
        act(() =>
          result.current.answerQuiz(
            result.current.questions.quiz[0].correctOptionId,
          ),
        );
      } else {
        const q = result.current.questions.sentences[0];
        const original = sentences.find((s) => s.id === q.id)!;
        for (const token of original.tokens)
          act(() => result.current.toggleToken(token.id));
        act(() => result.current.checkSentence());
      }
      const remaining = result.current.remaining;
      act(() => vi.advanceTimersByTime(200000));
      expect(result.current.remaining).toBe(remaining);
      expect(save).not.toHaveBeenCalled();
      act(() => result.current.next());
      act(() => vi.advanceTimersByTime(1000));
      expect(result.current.remaining).toBe(remaining - 1);
      act(() => vi.advanceTimersByTime(200000));
      expect(save).toHaveBeenCalledTimes(1);
      expect(save.mock.calls[0][0]).toMatchObject({
        finishedBy: 'timeout',
        baseScore: 10,
        timeBonus: 0,
      });
      expect(save.mock.calls[0][0].answers).toHaveLength(5);
      act(() => vi.advanceTimersByTime(5000));
      expect(save).toHaveBeenCalledTimes(1);
    },
  );
  it('prevents answers after a suspended tab passes the deadline', () => {
    vi.useFakeTimers();
    const save = vi.fn();
    const { result } = renderHook(() =>
      useGame(neighbourhood, 'quick-quiz', 'challenge', save),
    );
    vi.setSystemTime(Date.now() + 100000);
    act(() =>
      result.current.answerQuiz(
        result.current.questions.quiz[0].correctOptionId,
      ),
    );
    expect(save.mock.calls[0][0]).toMatchObject({
      correctCount: 0,
      finishedBy: 'timeout',
    });
  });
  it('practice never times out', () => {
    vi.useFakeTimers();
    const save = vi.fn();
    renderHook(() => useGame(neighbourhood, 'quick-quiz', 'practice', save));
    act(() => vi.advanceTimersByTime(200000));
    expect(save).not.toHaveBeenCalled();
  });
});
