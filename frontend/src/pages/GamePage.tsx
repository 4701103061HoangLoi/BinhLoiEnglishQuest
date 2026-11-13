import { useEffect, useState } from 'react';
import {
  useBlocker,
  useLocation,
  useNavigate,
  useParams,
} from 'react-router-dom';
import { ArrowRight, Check, Clock3, Flag, RotateCcw, X } from 'lucide-react';
import { gameIds, gameInfo, topics } from '../data/neighbourhood';
import { useProgress } from '../contexts/ProgressContext';
import { BackLink, EmptyState, Modal, Picture } from '../components/Common';
import { QuestGuide } from '../components/QuestGuide';
import { GameSoundToggle } from '../components/GameSoundToggle';
import { playFeedbackAudio } from '../lib/feedbackAudio';
import { useTokenFlight } from '../games/useTokenFlight';
import { useGame } from '../games/useGame';
import { validateTopic } from '../lib/validation';
import type { GameId, GameMode, Topic } from '../types';
export function GamePage() {
  const { topicId, gameId } = useParams();
  const location = useLocation();
  const topic = topics.find((t) => t.id === topicId);
  if (!topic || !gameIds.includes(gameId as GameId))
    return <EmptyState title="Không tìm thấy thử thách" />;
  if (validateTopic(topic).length)
    return (
      <EmptyState title="Nội dung đang cần cập nhật">
        Bộ câu hỏi chưa hợp lệ. Bạn có thể quay lại các chủ đề khác.
      </EmptyState>
    );
  return (
    <GameEntry key={location.key} topic={topic} gameId={gameId as GameId} />
  );
}
function GameEntry({ topic, gameId }: { topic: Topic; gameId: GameId }) {
  const [mode, setMode] = useState<GameMode>('challenge');
  const [started, setStarted] = useState(false);
  const location = useLocation();
  const search = new URLSearchParams(location.search);
  const returnTo =
    search.get('from') === 'challenges'
      ? `/challenges?topic=${topic.id}${search.get('quest') === '1' ? '&quest=1' : ''}`
      : search.get('quest') === '1'
        ? `/quest/${topic.id}`
        : `/topics/${topic.id}`;
  const info = gameInfo[gameId];
  if (started) return <ActiveGame topic={topic} gameId={gameId} mode={mode} />;
  return (
    <section className="game-intro narrow">
      <BackLink to={returnTo}>{topic.titleEn}</BackLink>
      <div className="intro-mark">
        <Flag size={36} />
      </div>
      <h1>{info.title}</h1>
      <p className="lead">{info.description}</p>
      <div className="mode-picker" role="group" aria-label="Chế độ chơi">
        <button
          aria-pressed={mode === 'challenge'}
          onClick={() => setMode('challenge')}
        >
          <strong>Thử thách</strong>
          <span>{info.seconds} giây · điểm & huy hiệu</span>
        </button>
        <button
          aria-pressed={mode === 'practice'}
          onClick={() => setMode('practice')}
        >
          <strong>Luyện tập</strong>
          <span>Không giới hạn · không ghi kỷ lục</span>
        </button>
      </div>
      <p>
        5 {gameId === 'word-match' ? 'cặp' : 'câu'} · 50 điểm cơ bản
        {mode === 'challenge' ? ' + tối đa 10 điểm thời gian' : ''}
      </p>
      <button className="button primary" onClick={() => setStarted(true)}>
        Bắt đầu chơi <ArrowRight size={19} />
      </button>
      <p className="muted small">
        Chạm hoặc dùng Tab và Enter. Không cần kéo thả.
      </p>
    </section>
  );
}
function ActiveGame({
  topic,
  gameId,
  mode,
}: {
  topic: Topic;
  gameId: GameId;
  mode: GameMode;
}) {
  const navigate = useNavigate();
  const { saveRun, progress } = useProgress();
  const [finished, setFinished] = useState(false);
  const [resultId, setResultId] = useState('');
  const game = useGame(
    topic,
    gameId,
    mode,
    (run) => {
      saveRun(run);
      setResultId(run.id);
      setFinished(true);
    },
    (correct) => {
      void playFeedbackAudio(correct, progress.settings.soundEnabled);
    },
  );
  const { state, questions } = game;
  const blocker = useBlocker(!finished);
  useEffect(() => {
    if (finished && resultId)
      navigate(`/results/${resultId}`, { replace: true });
  }, [finished, resultId, navigate]);
  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => {
      if (!finished) {
        event.preventDefault();
        event.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [finished]);
  const location = useLocation();
  const search = new URLSearchParams(location.search);
  const returnTo =
    search.get('from') === 'challenges'
      ? `/challenges?topic=${topic.id}${search.get('quest') === '1' ? '&quest=1' : ''}`
      : search.get('quest') === '1'
        ? `/quest/${topic.id}`
        : `/topics/${topic.id}`;
  const info = gameInfo[gameId];
  const q = questions.quiz[state.index];
  const sentence = questions.sentences[state.index];
  const flight = useTokenFlight(state.selectedTokens, sentence.id);
  const count = gameId === 'word-match' ? state.matched.length : state.index;
  return (
    <section className="game-wrap">
      <div className="game-heading">
        <div>
          <p className="muted">
            {topic.titleEn} · {mode === 'challenge' ? 'Thử thách' : 'Luyện tập'}
          </p>
          <h1>{info.title}</h1>
        </div>
        <button
          className="icon-button"
          aria-label="Rời thử thách"
          onClick={() => navigate(returnTo)}
        >
          <X />
        </button>
      </div>
      <GameSoundToggle />
      <div className="game-stats">
        <span>
          {gameId === 'word-match'
            ? `Đã ghép ${count}/5`
            : `Câu ${state.index + 1}/5`}
        </span>
        <strong>{game.score} điểm</strong>
        <span
          className={
            mode === 'challenge' && game.remaining <= 10
              ? 'timer warning'
              : 'timer'
          }
        >
          <Clock3 size={18} />
          {mode === 'challenge' ? game.remaining : game.elapsed}s
        </span>
      </div>
      <progress max={5} value={count} aria-label="Tiến độ lượt chơi" />
      <div className="sr-only" role="status">
        {mode === 'challenge' && game.remaining <= 10
          ? 'Còn dưới 10 giây. Hãy hoàn thành câu trả lời.'
          : ''}
      </div>
      <div className="game-board">
        {gameId === 'word-match' && (
          <>
            <h2>Ghép từ với hình tương ứng</h2>
            <p className="muted">
              Chọn từ ở bên trái, rồi chọn hình ở bên phải.
            </p>
            <div className="match-grid">
              <div className="match-column">
                {questions.match.map((item) => (
                  <button
                    key={item.id}
                    className={`word-tile ${state.selectedWord === item.id ? 'selected' : ''} ${state.matched.includes(item.id) ? 'matched' : ''}`}
                    disabled={state.matched.includes(item.id)}
                    aria-pressed={state.selectedWord === item.id}
                    onClick={() => game.selectWord(item.id)}
                  >
                    {item.term}
                    {state.matched.includes(item.id) && <Check size={18} />}
                  </button>
                ))}
              </div>
              <div className="match-column">
                {questions.images.map((item) => (
                  <button
                    key={item.id}
                    className={`picture-tile ${state.matched.includes(item.id) ? 'matched' : ''}`}
                    aria-label={`Chọn hình ${item.meaningVi}`}
                    disabled={
                      state.matched.includes(item.id) || !state.selectedWord
                    }
                    onClick={() => game.selectImage(item.id)}
                  >
                    <Picture item={item} />
                    {state.matched.includes(item.id) && <Check size={18} />}
                  </button>
                ))}
              </div>
            </div>
            <p className="muted small">
              Số lần thử sai: {state.wrong} · Mỗi lần sai −5 điểm
            </p>
          </>
        )}
        {gameId === 'quick-quiz' && (
          <>
            <p className="muted">Chọn đáp án phù hợp để hoàn thành câu.</p>
            <h2 className="question" lang="en">
              {q.prompt}
            </h2>
            <div className="quiz-options">
              {q.options.map((option, index) => (
                <button
                  key={option.id}
                  className={`quiz-option ${state.feedback && option.id === q.correctOptionId ? 'correct-option' : ''} ${state.feedback && !state.feedback.correct && state.answers.at(-1)?.submittedAnswer === option.text ? 'wrong-option' : ''}`}
                  disabled={!!state.feedback}
                  onClick={() => game.answerQuiz(option.id)}
                >
                  <span className="option-letter">
                    {String.fromCharCode(65 + index)}
                  </span>
                  <span lang="en">{option.text}</span>
                  {state.feedback && option.id === q.correctOptionId && (
                    <Check size={20} />
                  )}
                </button>
              ))}
            </div>
          </>
        )}
        {gameId === 'sentence-builder' && (
          <div ref={flight.containerRef} className="sentence-workspace">
            <h2>Sắp xếp thành một câu</h2>
            <p className="muted">
              Dùng tất cả các từ. Chạm vào từ trong câu để bỏ chọn.
            </p>
            <div className="sentence-answer" aria-label="Câu trả lời của bạn">
              {!state.selectedTokens.length && (
                <span className="muted">Câu của bạn sẽ xuất hiện ở đây…</span>
              )}
              {state.selectedTokens.map((id) => (
                <button
                  className="token selected"
                  key={id}
                  data-token-id={id}
                  data-token-zone="answer"
                  disabled={!!state.feedback}
                  onClick={(event) =>
                    flight.move(event.currentTarget, () => game.toggleToken(id))
                  }
                  aria-label={`Bỏ từ ${sentence.tokens.find((t) => t.id === id)!.text}`}
                >
                  {sentence.tokens.find((t) => t.id === id)!.text}
                </button>
              ))}
            </div>
            <div className="token-bank" aria-label="Các từ để chọn">
              {sentence.tokens.map((token) => (
                <button
                  className="token"
                  key={token.id}
                  data-token-id={token.id}
                  data-token-zone="bank"
                  disabled={
                    state.selectedTokens.includes(token.id) || !!state.feedback
                  }
                  onClick={(event) =>
                    flight.move(event.currentTarget, () =>
                      game.toggleToken(token.id),
                    )
                  }
                >
                  {token.text}
                </button>
              ))}
            </div>
            <div className="actions">
              <button
                className="button secondary"
                disabled={!state.selectedTokens.length || !!state.feedback}
                onClick={() => flight.reset(game.clearTokens)}
              >
                <RotateCcw size={17} />
                Làm lại câu
              </button>
              <button
                className="button primary"
                disabled={
                  state.selectedTokens.length !== sentence.tokens.length ||
                  !!state.feedback
                }
                onClick={game.checkSentence}
              >
                Kiểm tra <Check size={18} />
              </button>
            </div>
          </div>
        )}
        <QuestGuide
          mood={
            state.feedback
              ? state.feedback.correct
                ? 'happy'
                : 'thinking'
              : 'ready'
          }
          hint={gameInfo[gameId].description}
        >
          {state.feedback
            ? state.feedback.correct
              ? 'Đúng rồi. Bạn có thể tiếp tục.'
              : 'Xem đáp án và lời giải bên dưới trước khi tiếp tục.'
            : gameId === 'word-match'
              ? 'Chọn một từ, rồi chọn hình tương ứng.'
              : gameId === 'quick-quiz'
                ? 'Đọc câu hỏi rồi chọn một đáp án.'
                : 'Chạm các từ để ghép câu. Chạm từ đã chọn để bỏ.'}
        </QuestGuide>
        {state.feedback && (
          <div
            className={`feedback ${state.feedback.correct ? 'success' : 'retry'}`}
            role="status"
          >
            <strong>
              {state.feedback.correct
                ? '✓ Chính xác!'
                : '✕ Chưa đúng. Xem lời giải bên dưới.'}
            </strong>
            {state.feedback.answer && <p lang="en">{state.feedback.answer}</p>}
            <p>{state.feedback.text}</p>
            {gameId !== 'word-match' && (
              <button className="button primary" onClick={game.next}>
                {state.index === 4 ? 'Xem kết quả' : 'Câu tiếp theo'}
                <ArrowRight size={18} />
              </button>
            )}
          </div>
        )}
      </div>
      {blocker.state === 'blocked' && (
        <Modal
          title="Bạn muốn rời thử thách?"
          onCancel={() => blocker.reset()}
          onConfirm={() => blocker.proceed()}
          confirmText="Rời thử thách"
        >
          Điểm lượt này sẽ không được lưu.
        </Modal>
      )}
    </section>
  );
}
