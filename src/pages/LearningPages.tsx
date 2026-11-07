import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  Flag,
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
import { useProgress } from '../contexts/ProgressContext';
import type { GameId, Topic } from '../types';
export function GameLinks({
  topicId = neighbourhood.id,
  ids = gameIds,
}: {
  topicId?: string;
  ids?: GameId[];
}) {
  return (
    <div className="game-links">
      {ids.map((id, i) => (
        <Link className="game-link" key={id} to={`/play/${topicId}/${id}`}>
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
  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <h1>
            Học tiếng Anh qua những cuộc <span>phiêu lưu!</span>
          </h1>
          <p className="hero-english" lang="en">
            Learn English through fun challenges!
          </p>
          <p className="lead">
            Mỗi từ mới là một điểm đến. Mỗi thử thách là một bước tiến. Cùng
            khám phá khu phố bằng tiếng Anh nhé!
          </p>
          <div className="actions">
            <ActionLink to="/topics">Bắt đầu khám phá</ActionLink>
            <ActionLink secondary to="/play/my-neighbourhood/quick-quiz">
              Chơi thử ngay
            </ActionLink>
          </div>
          <p className="hero-note">
            <CheckCircle2 size={16} /> Không cần đăng nhập · Học theo nhịp của
            bạn
          </p>
        </div>
        <div className="hero-art">
          <img
            src="/images/neighbourhood-map.svg"
            alt="Bản đồ khám phá khu phố với phòng tranh, nhà thờ, ngôi đền, quảng trường và nhà ga"
          />
          <div className="map-label">
            <MapPin size={21} />
            <div>
              <strong>My Neighbourhood</strong>
              <span>Trạm khám phá đầu tiên · Lớp 6</span>
            </div>
          </div>
          <span className="map-stamp">
            <CompassMark />
            Your next adventure
          </span>
        </div>
      </section>
      <section className="learning-section">
        <div className="section-heading">
          <h2>Chọn hành trình của bạn</h2>
          <p>Học một chút. Chơi một vòng. Nhớ lâu hơn.</p>
        </div>
        <div className="learning-paths">
          <Link
            className="learning-path vocab-path"
            to="/topics/my-neighbourhood/vocabulary"
          >
            <div className="path-symbol">
              <BookOpen size={32} />
            </div>
            <div>
              <h3>Vocabulary Explorer</h3>
              <p>9 từ mới đưa bạn đi khắp khu phố.</p>
              <strong>
                Khám phá từ vựng <ArrowRight size={18} />
              </strong>
            </div>
            <img src="/images/neighbourhood/art-gallery.svg" alt="" />
          </Link>
          <Link
            className="learning-path grammar-path"
            to="/topics/my-neighbourhood/grammar"
          >
            <div className="path-symbol">
              <Flag size={32} />
            </div>
            <div>
              <h3>Grammar Hero</h3>
              <p>So sánh những điều thân thuộc quanh em.</p>
              <strong>
                Chinh phục ngữ pháp <ArrowRight size={18} />
              </strong>
            </div>
            <span className="grammar-art" aria-hidden="true">
              big<span>bigger</span>
            </span>
          </Link>
        </div>
      </section>
      <section className="challenge-section">
        <div className="section-heading">
          <h2>Ba cách chơi. Một hành trình tiến bộ.</h2>
          <p>Chọn thử thách và biến kiến thức thành kỹ năng.</p>
        </div>
        <GameLinks />
      </section>
      <section className="local-note">
        <CheckCircle2 size={23} />
        <p>
          <strong>Thành tích của riêng bạn.</strong> Tiến độ và huy hiệu được
          lưu trên thiết bị này. Không tài khoản, không áp lực xếp hạng.
        </p>
        <Link to="/achievements">
          Xem thành tích <ArrowRight size={16} />
        </Link>
      </section>
    </>
  );
}
function CompassMark() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.7" />
      <path d="m16 8-3 6-5 2 2-5Z" fill="currentColor" />
    </svg>
  );
}
export function TopicsPage() {
  const { progress } = useProgress();
  return (
    <>
      <div className="page-heading">
        <h1>Đi đâu học hôm nay?</h1>
        <p className="lead">
          Chọn một chủ đề và bắt đầu hành trình tiếng Anh của bạn.
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
                {topic.vocabulary.length} từ vựng · {topic.grammarTitle} · 3 trò
                chơi
              </p>
              <strong>
                {progress.completedRuns.some((r) => r.topicId === topic.id)
                  ? 'Tiếp tục khám phá'
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
  const visited = topic.vocabulary.filter((v) =>
    progress.visitedVocabularyIds.includes(`${topic.id}:${v.id}`),
  ).length;
  const learned = topic.grammar.every((g) =>
    progress.viewedGrammarIds.includes(`${topic.id}:${g.id}`),
  );
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
      <div className="section-heading">
        <h2>Học trước, tự tin hơn</h2>
        <p>Chọn một nhánh để bắt đầu. Bạn có thể chơi bất cứ lúc nào.</p>
      </div>
      <div className="learning-paths">
        <Link
          className="learning-path vocab-path"
          to={`/topics/${topic.id}/vocabulary`}
        >
          <BookOpen size={32} />
          <div>
            <h3>Vocabulary Explorer</h3>
            <p>
              Đã xem {visited}/{topic.vocabulary.length} từ vựng
            </p>
            <strong>
              Học từ vựng <ArrowRight size={18} />
            </strong>
          </div>
        </Link>
        <Link
          className="learning-path grammar-path"
          to={`/topics/${topic.id}/grammar`}
        >
          <Flag size={32} />
          <div>
            <h3>Grammar Hero</h3>
            <p>
              {learned
                ? 'Đã xem bài học'
                : `${topic.grammarTitle} · ${topic.grammar.length} quy tắc`}
            </p>
            <strong>
              Học ngữ pháp <ArrowRight size={18} />
            </strong>
          </div>
        </Link>
      </div>
      <section className="challenge-section">
        <h2>Sẵn sàng thử sức?</h2>
        <GameLinks topicId={topic.id} />
      </section>
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
function VocabularyLesson({ topic }: { topic: Topic }) {
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
      <BackLink to={`/topics/${topic.id}`}>{topic.titleEn}</BackLink>
      <div className="page-heading compact">
        <h1>Vocabulary Explorer</h1>
        <p className="lead">
          Khám phá {topic.vocabulary.length} từ mới trong chủ đề {topic.titleEn}
          .
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
          <h2>Từ điển bỏ túi</h2>
          <p className="muted small">Chọn từ để xem lại bất cứ lúc nào.</p>
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
      <div className="lesson-end">
        <div>
          <h2>Sẵn sàng ôn lại từ mới?</h2>
          <p>Ghép từ với hình để kiểm tra trí nhớ của bạn.</p>
        </div>
        <ActionLink to={`/play/${topic.id}/word-match`}>
          Luyện tập Word Match
        </ActionLink>
      </div>
    </>
  );
}
export function GrammarPage() {
  const { topicId } = useParams();
  const topic = topics.find((t) => t.id === topicId);
  const { progress, update } = useProgress();
  if (!topic) return <EmptyState title="Không tìm thấy bài học" />;
  const learned = topic.grammar.every((g) =>
    progress.viewedGrammarIds.includes(`${topic.id}:${g.id}`),
  );
  return (
    <>
      <BackLink to={`/topics/${topic.id}`}>{topic.titleEn}</BackLink>
      <div className="page-heading">
        <h1>{topic.grammarTitle}</h1>
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
      <section className="challenge-section">
        <h2>Đến lượt bạn thử sức!</h2>
        <GameLinks
          topicId={topic.id}
          ids={['quick-quiz', 'sentence-builder']}
        />
      </section>
    </>
  );
}
