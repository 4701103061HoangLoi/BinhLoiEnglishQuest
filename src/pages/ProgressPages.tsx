import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  Award,
  CheckCircle2,
  Clock3,
  Medal,
  RotateCcw,
  ShieldCheck,
  Trophy,
} from 'lucide-react';
import { ActionLink, BackLink, EmptyState, Modal } from '../components/Common';
import { useProgress } from '../contexts/ProgressContext';
import { gameIds, gameInfo, topics } from '../data/neighbourhood';
import { badges, badgesForRun } from '../lib/gameLogic';
export function ResultsPage() {
  const { runId } = useParams();
  const { progress } = useProgress();
  const run = progress.completedRuns.find((r) => r.id === runId);
  if (!run)
    return (
      <EmptyState title="Không tìm thấy lượt chơi">
        Lượt chơi này có thể đã bị xóa hoặc nằm ngoài 30 lượt được lưu gần nhất.
        Bạn có thể chọn trò chơi khác để bắt đầu lại.
      </EmptyState>
    );
  const info = gameInfo[run.gameId];
  const earned = badgesForRun(run);
  const accuracy = Math.round(
    (run.correctCount /
      Math.max(
        1,
        run.gameId === 'word-match' ? run.correctCount + run.wrongCount : 5,
      )) *
      100,
  );
  return (
    <>
      <BackLink to={`/topics/${run.topicId}`}>Về chủ đề</BackLink>
      <section className="result-heading">
        <div className="result-medal">
          <Trophy size={44} />
        </div>
        <h1>
          {run.finishedBy === 'timeout'
            ? 'Đã hết giờ'
            : run.correctCount === 5
              ? 'Hoàn thành lượt chơi'
              : 'Kết quả lượt chơi'}
        </h1>
        <p>
          {progress.nickname},{' '}
          {run.correctCount === 5
            ? run.gameId === 'word-match'
              ? 'bạn đã ghép đủ 5 cặp.'
              : 'bạn trả lời đúng 5/5 câu.'
            : 'xem lại đáp án ở bên dưới rồi thử thêm một lượt.'}
        </p>
        <span className="pill">
          {info.title} ·{' '}
          {run.mode === 'practice'
            ? 'Luyện tập · không ghi kỷ lục'
            : 'Thử thách'}
        </span>
      </section>
      <section className="result-summary">
        <div className="score-display">
          <strong>
            {run.score}
            <span>/{run.mode === 'practice' ? 50 : 60}</span>
          </strong>
          <span>điểm lượt chơi</span>
        </div>
        <dl>
          <div>
            <dt>Điểm cơ bản</dt>
            <dd>{run.baseScore}/50</dd>
          </div>
          <div>
            <dt>Thưởng thời gian</dt>
            <dd>+{run.timeBonus}</dd>
          </div>
          <div>
            <dt>
              {run.gameId === 'word-match' ? 'Cặp ghép đúng' : 'Câu đúng'}
            </dt>
            <dd>{run.correctCount}/5</dd>
          </div>
          <div>
            <dt>
              {run.gameId === 'word-match'
                ? 'Lần ghép sai'
                : 'Câu sai đã trả lời'}
            </dt>
            <dd>{run.wrongCount}</dd>
          </div>
          <div>
            <dt>Thời gian</dt>
            <dd>{run.elapsedSeconds}s</dd>
          </div>
          <div>
            <dt>
              {run.gameId === 'word-match'
                ? 'Độ chính xác các lần ghép'
                : 'Độ chính xác'}
            </dt>
            <dd>{accuracy}%</dd>
          </div>
        </dl>
      </section>
      <div className="actions centered">
        <ActionLink secondary to={`/challenges?topic=${run.topicId}`}>
          Chọn thử thách khác
        </ActionLink>
        <ActionLink to={`/quest/${run.topicId}`}>
          Tiếp tục hành trình
        </ActionLink>
        <ActionLink to={`/play/${run.topicId}/${run.gameId}`}>
          Chơi lại
        </ActionLink>
        <ActionLink secondary to={`/topics/${run.topicId}/${info.branch}`}>
          Học lại {info.branch === 'vocabulary' ? 'từ vựng' : 'ngữ pháp'}
        </ActionLink>
      </div>
      {earned.length > 0 && (
        <section className="result-badges">
          <h2>Huy hiệu đạt được trong lượt này</h2>
          <div>
            {badges
              .filter((b) => earned.includes(b.id))
              .map((b) => (
                <span className="earned-badge" key={b.id}>
                  <Award size={21} />
                  {b.name}
                </span>
              ))}
          </div>
          <Link to="/achievements">Xem bộ sưu tập huy hiệu</Link>
        </section>
      )}
      <section className="answer-review">
        <h2>Xem lại đáp án</h2>
        {run.answers.map((answer) => (
          <article key={answer.questionId}>
            <CheckCircle2
              className={answer.isCorrect ? 'text-green' : 'muted'}
              size={22}
            />
            <div>
              <strong>
                {answer.isCorrect
                  ? 'Đúng'
                  : answer.submittedAnswer
                    ? 'Cần ôn lại'
                    : 'Chưa trả lời'}
              </strong>
              {answer.submittedAnswer && !answer.isCorrect && (
                <p>Bạn chọn: {answer.submittedAnswer}</p>
              )}
              <p lang="en">{answer.correctAnswer}</p>
              <p className="muted">{answer.explanationVi}</p>
            </div>
          </article>
        ))}
      </section>
    </>
  );
}
export function AchievementsPage() {
  const { progress } = useProgress();
  const [filter, setFilter] = useState('all');
  const [topicFilter, setTopicFilter] = useState('all');
  const filtered = progress.completedRuns.filter(
    (r) =>
      (filter === 'all' || r.gameId === filter) &&
      (topicFilter === 'all' || r.topicId === topicFilter),
  );
  return (
    <>
      <div className="page-heading">
        <h1>Thành tích của bạn</h1>
        <p className="lead">
          {progress.nickname}, đây là huy hiệu và kết quả các lượt chơi của bạn.
        </p>
        <p className="privacy-note">
          <ShieldCheck size={17} />
          Kết quả được lưu trong trình duyệt này.
        </p>
      </div>
      <section className="challenge-section">
        <h2>Hành trình đã hoàn thành</h2>
        <p className="muted">
          Các chủ đề bạn đã hoàn thành cả ba nhiệm vụ và mở rương.
        </p>
        <div className="quest-collection">
          {topics
            .filter((topic) =>
              (progress.completedQuestIds ?? []).includes(topic.id),
            )
            .map((topic) => (
              <Link key={topic.id} to={`/quest/${topic.id}`}>
                <Trophy size={20} />
                {topic.titleEn} · Đã mở rương
              </Link>
            ))}
        </div>
        {!(progress.completedQuestIds ?? []).length && (
          <p>
            Chưa mở rương nào. <Link to="/topics">Chọn chủ đề để bắt đầu</Link>.
          </p>
        )}
      </section>
      <section>
        <div className="section-heading inline">
          <h2>Bộ sưu tập huy hiệu</h2>
          <span>
            {
              badges.filter((b) => progress.earnedBadgeIds.includes(b.id))
                .length
            }
            /{badges.length} đã mở khóa
          </span>
        </div>
        <div className="badge-grid">
          {badges.map((badge, i) => {
            const earned = progress.earnedBadgeIds.includes(badge.id);
            return (
              <article
                key={badge.id}
                className={`badge ${earned ? 'earned' : ''}`}
              >
                <div className={`badge-symbol tone-${i % 3}`}>
                  {i % 2 ? <Medal size={34} /> : <Award size={34} />}
                </div>
                <h3>{badge.name}</h3>
                <p>{badge.description}</p>
                <span>{earned ? '✓ Đã đạt' : 'Chưa mở khóa'}</span>
              </article>
            );
          })}
        </div>
      </section>
      <section className="challenge-section">
        <h2>Kỷ lục thử thách</h2>
        <p className="muted">
          Điểm cao nhất theo game và chủ đề trong 30 lượt gần nhất. Luyện tập
          không ghi kỷ lục.
        </p>
        <div className="best-scores">
          {topics.flatMap((topic) =>
            gameIds.map((id) => {
              const runs = progress.completedRuns.filter(
                (r) =>
                  r.mode === 'challenge' &&
                  r.gameId === id &&
                  r.topicId === topic.id,
              );
              return (
                <div key={`${topic.id}:${id}`}>
                  <div>
                    <h3>{gameInfo[id].title}</h3>
                    <p>{topic.titleEn}</p>
                  </div>
                  <strong>
                    {runs.length
                      ? `${Math.max(...runs.map((r) => r.score))}/60`
                      : 'Chưa chơi'}
                  </strong>
                </div>
              );
            }),
          )}
        </div>
      </section>
      <section className="challenge-section">
        <div className="section-heading inline">
          <div>
            <h2>5 lượt chơi gần nhất</h2>
            <p className="muted">
              {filtered.length}/{progress.completedRuns.length} lượt khớp với bộ
              lọc
            </p>
          </div>
          <div className="history-filters">
            <label className="filter-label">
              Lọc chủ đề
              <select
                value={topicFilter}
                onChange={(e) => setTopicFilter(e.target.value)}
              >
                <option value="all">Tất cả chủ đề</option>
                {topics.map((topic) => (
                  <option key={topic.id} value={topic.id}>
                    {topic.titleEn}
                  </option>
                ))}
              </select>
            </label>
            <label className="filter-label">
              Lọc trò chơi
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="all">Tất cả trò chơi</option>
                {gameIds.map((id) => (
                  <option key={id} value={id}>
                    {gameInfo[id].title}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
        {filtered.length ? (
          <div className="run-history">
            {filtered.slice(0, 5).map((run) => (
              <Link key={run.id} to={`/results/${run.id}`}>
                <div>
                  <strong>{gameInfo[run.gameId].title}</strong>
                  <span>
                    {new Date(run.finishedAt).toLocaleString('vi-VN')} ·{' '}
                    {run.mode === 'practice' ? 'Luyện tập' : 'Thử thách'}
                  </span>
                </div>
                <span>
                  <Clock3 size={15} />
                  {run.elapsedSeconds}s
                </span>
                <strong>{run.score} điểm</strong>
              </Link>
            ))}
          </div>
        ) : (
          <div className="empty-inline">
            <Trophy size={30} />
            <h3>
              {progress.completedRuns.length
                ? 'Chưa có lượt chơi phù hợp'
                : 'Chưa có lượt chơi'}
            </h3>
            <p>
              {progress.completedRuns.length
                ? 'Đổi bộ lọc để xem các lượt chơi khác.'
                : 'Hoàn thành một trò chơi để lưu kết quả đầu tiên.'}
            </p>
            {progress.completedRuns.length > 0 && (
              <button
                className="button secondary"
                onClick={() => {
                  setFilter('all');
                  setTopicFilter('all');
                }}
              >
                Xóa bộ lọc
              </button>
            )}
            <ActionLink to="/topics">Chọn thử thách</ActionLink>
          </div>
        )}
      </section>
    </>
  );
}
export function SettingsPage() {
  const { progress, update, reset } = useProgress();
  const [nickname, setNickname] = useState(progress.nickname);
  const [message, setMessage] = useState('');
  const [confirm, setConfirm] = useState(false);
  return (
    <section className="settings narrow">
      <div className="page-heading">
        <h1>Cài đặt</h1>
        <p className="lead">
          Đổi biệt danh, bật âm thanh hoặc đặt lại tiến độ.
        </p>
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          update((p) => ({
            ...p,
            nickname: nickname.trim() || 'Nhà thám hiểm',
          }));
          setMessage('Đã lưu biệt danh.');
        }}
      >
        <label htmlFor="nickname">Biệt danh của bạn</label>
        <p className="muted small">Không bắt buộc. Không cần dùng tên thật.</p>
        <div className="nickname-input">
          <input
            id="nickname"
            maxLength={40}
            value={nickname}
            onChange={(e) => {
              setNickname(e.target.value);
              setMessage('');
            }}
            autoComplete="off"
          />
          <button className="button primary" type="submit">
            Lưu
          </button>
        </div>
        <p role="status">{message}</p>
      </form>
      <div className="settings-row">
        <div>
          <h2>Âm thanh trò chơi và phát âm</h2>
          <p>Nhạc hiệu khi trả lời đúng/sai; chỉ đọc từ khi bạn bấm nút loa.</p>
        </div>
        <input
          type="checkbox"
          aria-label="Bật âm thanh trò chơi và phát âm"
          checked={progress.settings.soundEnabled}
          onChange={(e) => {
            update((p) => ({
              ...p,
              settings: { ...p.settings, soundEnabled: e.target.checked },
            }));
          }}
        />
      </div>
      <div className="settings-row">
        <div>
          <h2>Giảm chuyển động</h2>
          <p>Hiển thị nhẹ nhàng, ít hiệu ứng hơn.</p>
        </div>
        <input
          type="checkbox"
          aria-label="Giảm chuyển động"
          checked={progress.settings.reducedMotion}
          onChange={(e) =>
            update((p) => ({
              ...p,
              settings: { ...p.settings, reducedMotion: e.target.checked },
            }))
          }
        />
      </div>
      <div className="settings-reset">
        <h2>Xóa dữ liệu học tập</h2>
        <p>
          Xóa điểm, huy hiệu, bài đã xem và cài đặt trên trình duyệt này. Thao
          tác này không thể hoàn tác.
        </p>
        <button className="button danger" onClick={() => setConfirm(true)}>
          <RotateCcw size={18} />
          Xóa tiến độ
        </button>
      </div>
      <p className="privacy-note">
        <ShieldCheck size={20} />
        Dữ liệu chỉ lưu trong trình duyệt của bạn. Ứng dụng không gửi tiến độ
        hay biệt danh của bạn đến máy chủ.
      </p>
      {confirm && (
        <Modal
          title="Xóa toàn bộ tiến độ?"
          onCancel={() => setConfirm(false)}
          onConfirm={() => {
            reset();
            setNickname('Nhà thám hiểm');
            setMessage('');
            setConfirm(false);
          }}
          confirmText="Đồng ý, xóa tiến độ"
        >
          Điểm, huy hiệu, biệt danh và các bài đã xem sẽ được đặt lại trên thiết
          bị này.
        </Modal>
      )}
    </section>
  );
}
