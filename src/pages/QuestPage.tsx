import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useBlocker, useParams } from 'react-router-dom';
import {
  Check,
  Flag,
  KeyRound,
  LockKeyhole,
  MapPin,
  Search,
  Sparkles,
  Trophy,
} from 'lucide-react';
import {
  ActionLink,
  BackLink,
  EmptyState,
  Modal,
  Picture,
} from '../components/Common';
import { GameSoundToggle } from '../components/GameSoundToggle';
import { playFeedbackAudio } from '../lib/feedbackAudio';
import { QuestGuide } from '../components/QuestGuide';
import { topics } from '../data/neighbourhood';
import { quests } from '../data/quests';
import { useProgress } from '../contexts/ProgressContext';
import { isSentenceCorrect, shuffle, shuffledTokens } from '../lib/gameLogic';
import {
  createMemoryCards,
  flipMemory,
  initialMemory,
  questStage,
} from '../lib/questLogic';
import { VocabularyLesson, GrammarLesson } from './LearningPages';
import type { Topic } from '../types';

const stations = ['Săn tìm dấu vết', 'Cặp thẻ bí mật', 'Giải mật thư'];
export function QuestPage() {
  const { topicId } = useParams();
  const topic = topics.find((item) => item.id === topicId);
  return topic && quests[topic.id] ? (
    <Adventure key={topic.id} topic={topic} />
  ) : (
    <EmptyState title="Không tìm thấy hành trình" />
  );
}
function Adventure({ topic }: { topic: Topic }) {
  const story = quests[topic.id];
  const { progress, update } = useProgress();
  const [started, setStarted] = useState(
    () =>
      progress.questCheckpoints?.[topic.id] !== undefined ||
      (progress.completedQuestIds ?? []).includes(topic.id),
  );
  const [stage, setStage] = useState(() => questStage(progress, topic.id));
  const blocker = useBlocker(
    ({ nextLocation }) =>
      started &&
      stage < 4 &&
      !(
        (nextLocation.pathname.startsWith(`/play/${topic.id}/`) ||
          (nextLocation.pathname === '/challenges' &&
            new URLSearchParams(nextLocation.search).get('topic') ===
              topic.id)) &&
        new URLSearchParams(nextLocation.search).get('quest') === '1'
      ),
  );
  function saveStage(next: number) {
    setStage(next);
    update((p) => ({
      ...p,
      questCheckpoints: { ...p.questCheckpoints, [topic.id]: next },
    }));
  }
  const panel = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (started) panel.current?.focus();
  }, [started, stage]);
  useEffect(() => {
    if (!started || stage === 4) return;
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [started, stage]);
  function openTreasure() {
    if (stage !== 3) return;
    update((p) =>
      (p.completedQuestIds ?? []).includes(topic.id)
        ? p
        : {
            ...p,
            completedQuestIds: [...(p.completedQuestIds ?? []), topic.id],
          },
    );
    setStage(4);
    void playFeedbackAudio(true, progress.settings.soundEnabled);
  }
  return (
    <>
      <BackLink to={`/topics/${topic.id}`}>{topic.titleEn}</BackLink>
      <div className="page-heading compact">
        <h1>{story.title}</h1>
        <p className="lead">{story.story}</p>
        <p className="muted">
          3 chặng · Không giới hạn giờ · Chạm hoặc dùng bàn phím
        </p>
      </div>
      <GameSoundToggle />
      <div className="quest-layout">
        <aside className="quest-map-panel" aria-label="Bản đồ hành trình">
          <img
            className="quest-map-image"
            src={topic.imagePath}
            alt={topic.imageAlt}
          />
          <div className="quest-key-count">
            <KeyRound size={20} /> {Math.min(stage, 3)}/3 chìa khóa
          </div>
          <ol className="quest-stations">
            {stations.map((name, index) => (
              <li
                key={name}
                className={stage > index ? 'quest-station-complete' : ''}
                aria-current={stage === index ? 'step' : undefined}
              >
                <span>
                  {stage > index ? (
                    <Check size={20} />
                  ) : stage < index ? (
                    <LockKeyhole size={18} />
                  ) : (
                    <MapPin size={20} />
                  )}
                </span>
                <div>
                  <strong>{name}</strong>
                  <small>
                    {stage > index
                      ? 'Đã nhận chìa khóa'
                      : stage === index
                        ? 'Nhiệm vụ hiện tại'
                        : 'Hoàn thành chặng trước để mở'}
                  </small>
                </div>
              </li>
            ))}
          </ol>
          {(progress.completedQuestIds ?? []).includes(topic.id) && (
            <p className="quest-earned">
              <Trophy size={18} /> Đã chinh phục hành trình này
            </p>
          )}
        </aside>
        <section className="quest-mission">
          <h2 ref={panel} tabIndex={-1} className="quest-mission-heading">
            {!started
              ? 'Sẵn sàng lên đường?'
              : stage < 3
                ? stations[stage]
                : stage === 3
                  ? 'Chiếc rương đã mở khóa!'
                  : 'Hành trình hoàn thành!'}
          </h2>
          {!started ? (
            <>
              <QuestGuide hint="Bắt đầu hành trình, vượt ba nhiệm vụ rồi dùng ba chìa khóa mở rương.">
                Chào bạn! Mình là Mây. Cùng khám phá {topic.titleEn} nhé! Chạm
                vào mình bất cứ khi nào cần nhắc cách chơi.
              </QuestGuide>
              <p>
                Mỗi nhiệm vụ đúng mang về một chìa khóa. Thu thập đủ ba chìa để
                mở rương kho báu.
              </p>
              <p className="muted">
                Bạn có thể thử lại khi sai. Chìa khóa được lưu sau mỗi chặng.
                Bạn có thể đi luyện thêm rồi trở lại tiếp tục hành trình.
              </p>
              <button
                className="button primary"
                onClick={() => {
                  setStarted(true);
                  saveStage(0);
                }}
              >
                <Flag size={19} /> Bắt đầu hành trình
              </button>
            </>
          ) : stage === 0 ? (
            <QuestStudy key="study-0" topic={topic} stage={0}>
              <Hunt topic={topic} onComplete={() => saveStage(1)} />
            </QuestStudy>
          ) : stage === 1 ? (
            <QuestStudy key="study-1" topic={topic} stage={1}>
              <Memory topic={topic} onComplete={() => saveStage(2)} />
            </QuestStudy>
          ) : stage === 2 ? (
            <QuestStudy key="study-2" topic={topic} stage={2}>
              <Cipher topic={topic} onComplete={() => saveStage(3)} />
            </QuestStudy>
          ) : stage === 3 ? (
            <div className="quest-treasure">
              <div className="quest-chest" aria-hidden="true">
                <LockKeyhole size={64} />
                <span>
                  <KeyRound />
                  <KeyRound />
                  <KeyRound />
                </span>
              </div>
              <QuestGuide
                mood="celebrate"
                hint="Bấm Mở rương kho báu để nhận dấu mốc hoàn thành."
              >
                Bạn đã thu thập đủ ba chìa khóa. Kho báu đang chờ!
              </QuestGuide>
              <button className="button primary" onClick={openTreasure}>
                Mở rương kho báu <Sparkles size={19} />
              </button>
            </div>
          ) : (
            <div className="quest-treasure">
              <div className="quest-trophy">
                <Trophy size={64} />
              </div>
              <p>{story.ending}</p>
              <QuestGuide
                mood="celebrate"
                hint="Dấu mốc mở rương được lưu trong Thành tích. Bạn có thể khám phá chủ đề khác hoặc chơi lại."
              >
                ✓ Bạn đã chinh phục cả ba nhiệm vụ!
              </QuestGuide>
              <div className="actions">
                <ActionLink to="/achievements">Xem thành tích</ActionLink>
                <ActionLink secondary to="/topics">
                  Khám phá chủ đề khác
                </ActionLink>
                <button
                  className="button secondary"
                  onClick={() => {
                    setStarted(false);
                    saveStage(0);
                  }}
                >
                  Chơi lại hành trình
                </button>
              </div>
            </div>
          )}
        </section>
      </div>
      {blocker.state === 'blocked' && (
        <Modal
          title="Rời hành trình?"
          confirmText="Rời hành trình"
          onCancel={() => blocker.reset()}
          onConfirm={() => blocker.proceed()}
        >
          Chìa khóa và bài đã học được giữ nguyên. Nhiệm vụ đang làm dở sẽ bắt
          đầu lại khi quay về.
        </Modal>
      )}
    </>
  );
}

function QuestStudy({
  topic,
  stage,
  children,
}: {
  topic: Topic;
  stage: number;
  children: ReactNode;
}) {
  const { progress } = useProgress();
  const words =
    stage === 0 ? topic.vocabulary.slice(0, 3) : topic.vocabulary.slice(3);
  const viewed = words.filter((word) =>
    progress.visitedVocabularyIds.includes(`${topic.id}:${word.id}`),
  ).length;
  const ready =
    stage === 2
      ? topic.grammar.every((rule) =>
          progress.viewedGrammarIds.includes(`${topic.id}:${rule.id}`),
        )
      : viewed === words.length;
  const [studyOpen, setStudyOpen] = useState(!ready);
  return (
    <>
      <details
        className="quest-study"
        open={studyOpen}
        onToggle={(event) => setStudyOpen(event.currentTarget.open)}
      >
        <summary>
          {stage === 2
            ? `Học ngữ pháp · ${ready ? 'Đã xem' : 'Chưa xem'}`
            : `Học từ vựng · ${viewed}/${words.length} từ đã xem`}
        </summary>
        {stage === 2 ? (
          <GrammarLesson topic={topic} embedded />
        ) : (
          <VocabularyLesson topic={{ ...topic, vocabulary: words }} embedded />
        )}
        {ready && (
          <button
            className="button secondary"
            onClick={(event) => {
              setStudyOpen(false);
              event.currentTarget
                .closest('details')
                ?.querySelector('summary')
                ?.focus();
            }}
          >
            Xong phần học, vào nhiệm vụ
          </button>
        )}
      </details>
      {!ready ? (
        <QuestGuide
          hint={
            stage === 2
              ? 'Đọc quy tắc rồi bấm Đánh dấu đã xem bài học.'
              : 'Dùng nút Tiếp hoặc từ điển bỏ túi để xem đủ các từ của chặng này.'
          }
        >
          Cùng học hành trang trước nhé! Khi đã xem đủ{' '}
          {stage === 2 ? 'bài ngữ pháp' : 'các từ'}, nhiệm vụ bên dưới sẽ mở.
        </QuestGuide>
      ) : (
        <>
          {children}
          {stage > 0 && (
            <section className="quest-practice">
              <h3>Luyện thêm trong chặng này</h3>
              <p className="muted">
                Word Match, Quick Quiz và Sentence Builder nằm trong tab Thử
                thách. Điểm và huy hiệu được lưu riêng; quay lại hành trình từ
                trang kết quả. Luyện thêm không bắt buộc để nhận chìa khóa.
              </p>
              <ActionLink to={`/challenges?topic=${topic.id}&quest=1`}>
                Mở tab Thử thách
              </ActionLink>
              {progress.completedRuns.filter(
                (run) =>
                  run.topicId === topic.id &&
                  run.finishedBy === 'completed' &&
                  (stage === 1
                    ? run.gameId === 'word-match'
                    : run.gameId !== 'word-match'),
              ).length > 0 && (
                <p className="quest-earned">
                  ✓ Bạn đã có lượt luyện tập hoàn thành ở chặng này.
                </p>
              )}
            </section>
          )}
        </>
      )}
    </>
  );
}
function Hunt({ topic, onComplete }: { topic: Topic; onComplete: () => void }) {
  const { progress } = useProgress();
  const targets = topic.vocabulary.slice(0, 3);
  const [found, setFound] = useState<string[]>([]);
  const [answer, setAnswer] = useState('');
  const [items] = useState(() =>
    shuffle(topic.vocabulary.slice(0, 6), Math.random),
  );
  const target = targets[found.length];
  const correct = answer === target?.id;
  const done = found.length === targets.length;
  return (
    <>
      <p>
        Giúp người dẫn đường tìm ba đồ vật hoặc dấu vết. Đọc từ tiếng Anh và
        chạm đúng hình.
      </p>
      <div className="quest-target">
        <Search size={20} />
        <span>
          {done ? (
            'Đã tìm đủ dấu vết!'
          ) : (
            <>
              Tìm: <strong lang="en">{target.term}</strong>
            </>
          )}
        </span>
        <small>{found.length}/3</small>
      </div>
      <div className="quest-hunt-grid">
        {items.map((word) => (
          <button
            key={word.id}
            className={
              found.includes(word.id) || (correct && answer === word.id)
                ? 'quest-found'
                : ''
            }
            disabled={found.includes(word.id) || correct || done}
            aria-label={`Tìm hình ${word.meaningVi}`}
            onClick={() => {
              setAnswer(word.id);
              void playFeedbackAudio(
                word.id === target.id,
                progress.settings.soundEnabled,
              );
            }}
          >
            <Picture item={word} />
            {found.includes(word.id) && <Check aria-label="Đã tìm thấy" />}
          </button>
        ))}
      </div>
      <QuestGuide
        mood={
          done ? 'celebrate' : correct ? 'happy' : answer ? 'thinking' : 'ready'
        }
        hint="Đọc từ ở ô Tìm, rồi chọn hình phù hợp. Đúng rồi thì cất vào túi đồ để tìm từ tiếp theo."
      >
        {done
          ? '✓ Chìa khóa thứ nhất thuộc về bạn!'
          : correct
            ? `✓ Đúng rồi! ${target.term}: ${target.meaningVi}.`
            : answer
              ? `Chưa đúng. Gợi ý: tìm hình ${target.meaningVi}.`
              : 'Hãy quan sát các hình và tìm dấu vết đầu tiên.'}
      </QuestGuide>
      {correct && !done && (
        <button
          className="button primary"
          onClick={() => {
            setFound([...found, target.id]);
            setAnswer('');
          }}
        >
          Cất vào túi đồ
        </button>
      )}
      {done && <NextStation onClick={onComplete} />}
    </>
  );
}
function Memory({
  topic,
  onComplete,
}: {
  topic: Topic;
  onComplete: () => void;
}) {
  const { progress } = useProgress();
  const words = topic.vocabulary.slice(3, 6);
  const [cards] = useState(() => createMemoryCards(words, Math.random));
  const [state, setState] = useState(initialMemory);
  const done = state.matched.length === words.length;
  const pair = state.open.length === 2;
  const matched =
    pair &&
    cards.find((card) => card.id === state.open[0])!.wordId ===
      cards.find((card) => card.id === state.open[1])!.wordId;
  return (
    <>
      <p>
        Lật hai thẻ để tìm cặp từ và hình cùng nghĩa. Ghi nhớ vị trí của chúng
        để lấy chìa khóa thứ hai.
      </p>
      <p className="muted">
        {state.matched.length}/3 cặp · {state.attempts} lần thử
      </p>
      <div className="quest-memory-grid">
        {cards.map((card, index) => {
          const word = words.find((item) => item.id === card.wordId)!;
          const revealed =
            state.open.includes(card.id) || state.matched.includes(card.wordId);
          return (
            <button
              key={card.id}
              className={`quest-memory-card ${revealed ? 'quest-revealed' : ''}`}
              aria-label={
                revealed
                  ? `Thẻ ${index + 1}: ${card.kind === 'word' ? word.term : word.meaningVi}`
                  : `Lật thẻ ${index + 1}`
              }
              disabled={revealed || pair || done}
              onClick={() => {
                const next = flipMemory(state, cards, card.id);
                setState(next);
                if (next !== state && next.open.length === 2)
                  void playFeedbackAudio(
                    next.matched.length > state.matched.length,
                    progress.settings.soundEnabled,
                  );
              }}
            >
              {revealed ? (
                card.kind === 'word' ? (
                  <strong lang="en">{word.term}</strong>
                ) : (
                  <Picture item={word} />
                )
              ) : (
                <>
                  <KeyRound size={28} />
                  <small>{index + 1}</small>
                </>
              )}
            </button>
          );
        })}
      </div>
      <QuestGuide
        mood={
          done ? 'celebrate' : pair ? (matched ? 'happy' : 'thinking') : 'ready'
        }
        hint="Mỗi cặp có một thẻ chữ và một thẻ hình. Lật hai thẻ, ghi nhớ vị trí rồi ghép lại cho đúng."
      >
        {done
          ? '✓ Đủ ba cặp! Bạn nhận được chìa khóa thứ hai.'
          : pair
            ? matched
              ? '✓ Hai thẻ cùng nghĩa! Hãy tiếp tục khám phá.'
              : 'Hai thẻ chưa cùng nghĩa. Ghi nhớ vị trí rồi thử lại nhé.'
            : state.open.length
              ? 'Chọn thêm một thẻ để ghép cặp.'
              : 'Lật một thẻ bất kỳ để bắt đầu.'}
      </QuestGuide>
      {pair && !done && (
        <button
          className="button secondary"
          onClick={() => setState((s) => ({ ...s, open: [] }))}
        >
          {matched ? 'Lật cặp tiếp theo' : 'Úp thẻ và thử lại'}
        </button>
      )}
      {done && <NextStation onClick={onComplete} />}
    </>
  );
}
function Cipher({
  topic,
  onComplete,
}: {
  topic: Topic;
  onComplete: () => void;
}) {
  const { progress } = useProgress();
  const sentence = topic.sentences[0];
  const [tokens] = useState(() => shuffledTokens(sentence.tokens, Math.random));
  const [selected, setSelected] = useState<string[]>([]);
  const [feedback, setFeedback] = useState('');
  const [solved, setSolved] = useState(false);
  const [hint, setHint] = useState(false);
  function check() {
    const correct = isSentenceCorrect(
      tokens,
      selected,
      sentence.correctSentence,
    );
    setSolved(correct);
    void playFeedbackAudio(correct, progress.settings.soundEnabled);
    setFeedback(
      correct
        ? `✓ Mật thư đã giải! ${sentence.explanationVi}`
        : `Chưa đúng thứ tự. ${sentence.explanationVi} Chạm từ đã chọn để bỏ và thử lại.`,
    );
  }
  return (
    <>
      <p>
        Những mảnh giấy trong bản đồ tạo thành một câu tiếng Anh. Xếp đúng thứ
        tự để nhận chìa khóa cuối cùng.
      </p>
      <p className="muted">Quy tắc gợi ý: {topic.grammarTitle}</p>
      <div className="quest-sentence" role="group" aria-label="Câu mật thư">
        {selected.length ? (
          selected.map((id) => (
            <button
              className="token selected"
              key={id}
              disabled={solved}
              onClick={() => {
                setSelected(selected.filter((item) => item !== id));
                setFeedback('');
              }}
            >
              {tokens.find((token) => token.id === id)!.text}
            </button>
          ))
        ) : (
          <span className="muted">Chạm các mảnh từ bên dưới…</span>
        )}
      </div>
      <div className="token-bank" aria-label="Mảnh từ mật thư">
        {tokens.map((token) => (
          <button
            className="token"
            lang="en"
            key={token.id}
            disabled={solved || selected.includes(token.id)}
            onClick={() => {
              setSelected([...selected, token.id]);
              setFeedback('');
            }}
          >
            {token.text}
          </button>
        ))}
      </div>
      <div className="actions">
        <button
          className="button primary"
          disabled={solved || selected.length !== tokens.length}
          onClick={check}
        >
          Giải mật thư
        </button>
        <button
          className="button secondary"
          disabled={solved || !selected.length}
          onClick={() => {
            setSelected([]);
            setFeedback('');
          }}
        >
          Xếp lại
        </button>
        <button
          className="button secondary"
          disabled={hint}
          onClick={() => setHint(true)}
        >
          Xem gợi ý
        </button>
      </div>
      {hint && (
        <p className="quest-hint">
          Từ đầu tiên: <strong lang="en">{sentence.tokens[0].text}</strong>.{' '}
          {sentence.explanationVi}
        </p>
      )}
      <QuestGuide
        mood={solved ? 'celebrate' : feedback ? 'thinking' : 'ready'}
        hint="Chạm từng từ để tạo câu. Chạm từ trong câu để bỏ; dùng Xem gợi ý nếu cần từ đầu tiên."
      >
        {feedback}
      </QuestGuide>
      {solved && <NextStation onClick={onComplete} final />}
    </>
  );
}
function NextStation({
  onClick,
  final = false,
}: {
  onClick: () => void;
  final?: boolean;
}) {
  return (
    <button className="button primary" onClick={onClick}>
      <KeyRound size={19} />
      {final ? 'Đến rương kho báu' : 'Nhận chìa khóa và đi tiếp'}
    </button>
  );
}
