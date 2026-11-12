import { DailyReviewCard } from './ReviewPage';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  Compass,
  KeyRound,
  MapPin,
  Route,
  Sparkles,
} from 'lucide-react';
import {
  gameIds,
  gameInfo,
  neighbourhood,
  topics,
} from '../data/neighbourhood';
import {
  ActionLink,
  BackLink,
  EmptyState,
  Picture,
  SpeechButton,
} from '../components/Common';
import { JourneyOverview } from '../components/JourneyOverview';
import { useProgress } from '../contexts/ProgressContext';
import type { GameId, Topic } from '../types';
export function GameLinks({
  topicId = neighbourhood.id,
  ids = gameIds,
  quest = false,
  challenge = false,
}: {
  topicId?: string;
  ids?: GameId[];
  quest?: boolean;
  challenge?: boolean;
}) {
  const search = new URLSearchParams();
  if (quest) search.set('quest', '1');
  if (challenge) search.set('from', 'challenges');
  const suffix = search.size ? `?${search}` : '';
  return (
    <div className="game-links">
      {ids.map((id, i) => (
        <Link
          className="game-link"
          key={id}
          to={`/play/${topicId}/${id}${suffix}`}
        >
          <span className={`game-icon tone-${i}`}>
            {id === 'word-match' ? (
              <MapPin />
            ) : id === 'quick-quiz' ? (
              <Sparkles />
            ) : (
              <Route />
            )}
          </span>
          <div>
            <h3>{gameInfo[id].title}</h3>
            <p>{gameInfo[id].subtitle}</p>
            <span className="small muted">
              5 {id === 'word-match' ? 'cặp' : 'câu'} · {gameInfo[id].seconds}{' '}
              giây
            </span>
          </div>
          <ArrowRight size={20} />
        </Link>
      ))}
    </div>
  );
}
export function HomePage() {
  const [topicId, setTopicId] = useState(neighbourhood.id);
  const topic = topics.find((item) => item.id === topicId)!;
  return (
    <>
      <DailyReviewCard />
      <section className="hero">
        <img
          className="explorer-clouds"
          src="/images/explorer-clouds.svg"
          alt=""
          aria-hidden="true"
        />
        <div className="hero-copy">
          <h1>
            Học tiếng Anh từ <span>những điều quen thuộc</span>
          </h1>
          <p className="hero-english" lang="en">
            Grade 6 · Vocabulary and grammar
          </p>
          <p className="lead">
            Có {topics.length} chủ đề về trường học, nhà ở, bạn bè và khu phố.
            Học từ mới, ôn ngữ pháp rồi làm nhiệm vụ để nhận chìa khóa. Bạn cũng
            có thể chọn trò chơi riêng ở mục Thử thách.
          </p>
          <div className="actions">
            <ActionLink to="/topics">Bắt đầu khám phá</ActionLink>
            <ActionLink secondary to="/demo">
              Chơi thử ngay
            </ActionLink>
          </div>
          <p className="hero-note">
            <CheckCircle2 size={16} /> Không cần đăng nhập · Có thể dừng và học
            tiếp
          </p>
        </div>
        <div className="home-topic-map" aria-label="Khám phá bốn chủ đề">
          <span className="explorer-compass" aria-hidden="true">
            <Compass size={32} />
          </span>
          {topics.map((item) => (
            <Link key={item.id} to={`/topics/${item.id}`}>
              <img src={item.imagePath} alt={item.imageAlt} />
              <span>
                <small>Unit {item.unit}</small>
                <strong>{item.titleEn}</strong>
              </span>
            </Link>
          ))}
          <div className="map-legend">
            <MapPin size={16} />
            {topics.length} chủ đề <span aria-hidden="true">·</span>
            <KeyRound size={16} />3 chìa khóa mỗi hành trình
          </div>
        </div>
      </section>
      <section className="learning-section">
        <label className="home-topic-picker">
          Chọn chủ đề
          <select
            value={topicId}
            onChange={(event) => setTopicId(event.target.value)}
          >
            {topics.map((item) => (
              <option key={item.id} value={item.id}>
                {item.titleEn}
              </option>
            ))}
          </select>
        </label>
        <JourneyOverview topic={topic} />
      </section>
      <section className="local-note">
        <CheckCircle2 size={23} />
        <p>
          <strong>Tiến độ được lưu trên máy này.</strong> Bạn có thể quay lại
          học tiếp trên cùng trình duyệt.
        </p>
        <Link to="/achievements">
          Xem thành tích <ArrowRight size={16} />
        </Link>
      </section>
    </>
  );
}
export function TopicsPage() {
  const { progress } = useProgress();
  return (
    <>
      <div className="page-heading">
        <h1>Chọn chủ đề</h1>
        <p className="lead">
          Mỗi chủ đề có bài học từ vựng, ngữ pháp và ba nhiệm vụ.
        </p>
      </div>
      <div className="topic-list">
        {topics.map((topic) => (
          <Link
            key={topic.id}
            className="topic-card"
            to={`/topics/${topic.id}`}
          >
            <img src={topic.imagePath} alt={topic.imageAlt} />
            <div>
              <span className="pill">
                Lớp {topic.grade} · Unit {topic.unit}
              </span>
              <h2>{topic.titleEn}</h2>
              <p>{topic.titleVi}</p>
              <p className="muted">
                {topic.vocabulary.length} từ vựng · {topic.grammarTitle} · 3
                chặng học và chơi
              </p>
              <strong>
                {progress.completedRuns.some((r) => r.topicId === topic.id)
                  ? 'Học tiếp'
                  : 'Bắt đầu hành trình'}{' '}
                <ArrowRight size={18} />
              </strong>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}
export function TopicPage() {
  const { topicId } = useParams();
  const topic = topics.find((t) => t.id === topicId);
  const { progress } = useProgress();
  if (!topic) return <EmptyState title="Không tìm thấy chủ đề" />;
  const completed = gameIds.filter((id) =>
    progress.completedRuns.some(
      (r) =>
        r.topicId === topic.id &&
        r.gameId === id &&
        r.finishedBy === 'completed',
    ),
  ).length;
  return (
    <>
      <BackLink />
      <section className="topic-hero">
        <div>
          <span className="pill">
            Lớp {topic.grade} · Unit {topic.unit}
          </span>
          <h1>{topic.titleEn}</h1>
          <h2 className="subheading">{topic.titleVi}</h2>
          <p className="lead">{topic.descriptionVi}</p>
          <div className="topic-progress">
            <span>{completed}/3 trò chơi đã hoàn thành</span>
            <progress max={3} value={completed} aria-label="Tiến độ trò chơi" />
          </div>
        </div>
        <img src={topic.imagePath} alt={topic.imageAlt} />
      </section>
      <JourneyOverview topic={topic} />
    </>
  );
}
export function VocabularyPage() {
  const { topicId } = useParams();
  const topic = topics.find((t) => t.id === topicId);
  return topic ? (
    <VocabularyLesson key={topic.id} topic={topic} />
  ) : (
    <EmptyState title="Không tìm thấy bài học" />
  );
}
export function VocabularyLesson({
  topic,
  embedded = false,
}: {
  topic: Topic;
  embedded?: boolean;
}) {
  const [index, setIndex] = useState(0);
  const { progress, update } = useProgress();
  const item = topic.vocabulary[index];
  useEffect(() => {
    const id = `${topic.id}:${item.id}`;
    update((p) =>
      p.visitedVocabularyIds.includes(id)
        ? p
        : { ...p, visitedVocabularyIds: [...p.visitedVocabularyIds, id] },
    );
  }, [topic.id, item.id, update]);
  return (
    <>
      {!embedded && (
        <BackLink to={`/quest/${topic.id}`}>Về hành trình</BackLink>
      )}
      <div className="page-heading compact">
        {embedded ? (
          <h3>Từ vựng của chặng này</h3>
        ) : (
          <h1>Vocabulary Explorer</h1>
        )}
        <p className="lead">
          {topic.vocabulary.length} từ trong chủ đề {topic.titleEn}. Chọn từ để
          xem nghĩa, nghe phát âm và đọc ví dụ.
        </p>
      </div>
      <div className="vocab-layout">
        <section
          className="flashcard"
          aria-label={`Từ ${index + 1} trên ${topic.vocabulary.length}`}
        >
          <div className="flashcard-picture">
            <Picture key={item.id} item={item} />
          </div>
          <div className="flashcard-copy">
            <span className="muted small">
              Từ {index + 1} / {topic.vocabulary.length}{' '}
              <span className="pill">{item.partOfSpeech}</span>
            </span>
            <h2 lang="en">{item.term}</h2>
            <p className="phonetic" lang="en-US">
              <span className="small muted">IPA (US) </span>
              {item.phonetic}
            </p>
            <p className="meaning">{item.meaningVi}</p>
            <SpeechButton text={item.term} />
            <div className="example">
              <p lang="en">{item.exampleEn}</p>
              <p className="muted">{item.exampleVi}</p>
            </div>
          </div>
          <div className="flashcard-controls">
            <button
              className="button secondary"
              disabled={index === 0}
              onClick={() => setIndex((i) => i - 1)}
            >
              <ArrowLeft size={18} />
              Trước
            </button>
            <span>
              {index + 1} / {topic.vocabulary.length}
            </span>
            <button
              className="button secondary"
              disabled={index === topic.vocabulary.length - 1}
              onClick={() => setIndex((i) => i + 1)}
            >
              Tiếp
              <ArrowRight size={18} />
            </button>
          </div>
        </section>
        <aside className="word-index">
          <h2>Danh sách từ</h2>
          <p className="muted small">Chọn một từ để xem nghĩa và ví dụ.</p>
          {topic.vocabulary.map((v, i) => (
            <button
              key={v.id}
              className={index === i ? 'active' : ''}
              aria-current={index === i ? 'true' : undefined}
              onClick={() => setIndex(i)}
            >
              <span>{v.term}</span>
              {progress.visitedVocabularyIds.includes(
                `${topic.id}:${v.id}`,
              ) && <Check size={17} aria-label="Đã xem" />}
            </button>
          ))}
        </aside>
      </div>
      {!embedded && (
        <div className="lesson-end">
          <div>
            <h2>Ôn lại từ vừa học</h2>
            <p>Quay lại hành trình để dùng những từ này trong nhiệm vụ.</p>
          </div>
          <ActionLink to={`/quest/${topic.id}`}>Tiếp tục hành trình</ActionLink>
        </div>
      )}
    </>
  );
}
export function GrammarPage() {
  const { topicId } = useParams();
  const topic = topics.find((t) => t.id === topicId);
  return topic ? (
    <GrammarLesson topic={topic} />
  ) : (
    <EmptyState title="Không tìm thấy bài học" />
  );
}
export function GrammarLesson({
  topic,
  embedded = false,
}: {
  topic: Topic;
  embedded?: boolean;
}) {
  const { progress, update } = useProgress();
  const learned = topic.grammar.every((g) =>
    progress.viewedGrammarIds.includes(`${topic.id}:${g.id}`),
  );
  return (
    <>
      {!embedded && (
        <BackLink to={`/quest/${topic.id}`}>Về hành trình</BackLink>
      )}
      <div className="page-heading">
        {embedded ? (
          <h3>{topic.grammarTitle}</h3>
        ) : (
          <h1>{topic.grammarTitle}</h1>
        )}
        <p className="lead">{topic.grammarDescriptionVi}</p>
      </div>
      <section className="grammar-example">
        <BookOpen size={28} />
        <div>
          <p lang="en">{topic.grammarExample}</p>
          <span>{topic.grammarExampleVi}</span>
        </div>
      </section>
      <div className="grammar-rules">
        {topic.grammar.map((lesson, i) => (
          <article key={lesson.id}>
            <span className="rule-number">{i + 1}</span>
            <div>
              <h2>{lesson.title}</h2>
              <p>{lesson.rule}</p>
              <p className="rule-example" lang="en">
                {lesson.example}
              </p>
              <p className="muted small">{lesson.note}</p>
            </div>
          </article>
        ))}
      </div>
      <section className="grammar-caution">
        <h2>Những lỗi dễ nhầm</h2>
        <p>{topic.grammarCautionVi}</p>
      </section>
      <button
        className="button secondary"
        disabled={learned}
        onClick={() =>
          update((p) => ({
            ...p,
            viewedGrammarIds: [
              ...new Set([
                ...p.viewedGrammarIds,
                ...topic.grammar.map((g) => `${topic.id}:${g.id}`),
              ]),
            ],
          }))
        }
      >
        <CheckCircle2 size={18} />
        {learned ? 'Đã xem bài học' : 'Đánh dấu đã xem bài học'}
      </button>
      {!embedded && (
        <div className="lesson-end">
          <ActionLink to={`/quest/${topic.id}`}>Tiếp tục hành trình</ActionLink>
        </div>
      )}
    </>
  );
}
