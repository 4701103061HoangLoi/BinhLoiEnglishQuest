import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Trophy } from 'lucide-react';
import { Modal } from '../components/Common';
import { gameIds, gameInfo, topics } from '../data/neighbourhood';
import { loadRanking, removeScores, type Ranking } from '../lib/leaderboard';
export function LeaderboardPage() {
  const [topic, setTopic] = useState('all');
  const [game, setGame] = useState('all');
  const [ranking, setRanking] = useState<Ranking | null>(null);
  const [error, setError] = useState('');
  const [refresh, setRefresh] = useState(0);
  const [loading, setLoading] = useState(true);
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError('');
    setRanking(null);
    loadRanking(topic, game, controller.signal)
      .then((data) => {
        if (!controller.signal.aborted) setRanking(data);
      })
      .catch((failure: Error) => {
        if (!controller.signal.aborted) setError(failure.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [topic, game, refresh]);
  return (
    <>
      <div className="page-heading">
        <span className="ranking-kicker">
          <Trophy size={20} /> Cùng thi đua
        </span>
        <h1>Bảng xếp hạng</h1>
        <p className="lead">
          Mỗi lượt chơi là một cơ hội vượt kỷ lục của mình.
        </p>
        <p className="muted">
          Cộng điểm cao nhất của mỗi trò trong từng chủ đề. Chỉ tính lượt Thử
          thách đã được người chơi đăng; bằng điểm thì cùng hạng.
        </p>
      </div>
      <section
        className="ranking-board"
        aria-label="Kết quả xếp hạng"
        aria-busy={loading}
      >
        <div className="section-heading inline">
          <div className="history-filters">
            <div className="filter-label">
              <label htmlFor="ranking-topic">Chủ đề</label>
              <select
                id="ranking-topic"
                value={topic}
                onChange={(event) => setTopic(event.target.value)}
              >
                <option value="all">Tất cả chủ đề</option>
                {topics.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.titleEn}
                  </option>
                ))}
              </select>
            </div>
            <div className="filter-label">
              <label htmlFor="ranking-game">Trò chơi</label>
              <select
                id="ranking-game"
                value={game}
                onChange={(event) => setGame(event.target.value)}
              >
                <option value="all">Tất cả trò chơi</option>
                {gameIds.map((id) => (
                  <option key={id} value={id}>
                    {gameInfo[id].title}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <button
            className="button secondary"
            disabled={loading || busy}
            onClick={() => setRefresh((value) => value + 1)}
          >
            Làm mới
          </button>
        </div>
        {loading && <p role="status">Đang tải bảng xếp hạng…</p>}
        {error && <p role="alert">{error} Bấm Làm mới để thử lại.</p>}
        {ranking && (
          <>
            <p className="muted small">
              {ranking.total} người đã đăng điểm · Hiển thị tối đa 50 người đứng
              đầu
            </p>
            {ranking.own && (
              <p className="ranking-own">
                Bạn đang ở hạng <strong>{ranking.own.rank}</strong> ·{' '}
                {ranking.own.score} điểm theo bộ lọc hiện tại.
              </p>
            )}
            {ranking.entries.length ? (
              <div className="ranking-scroll">
                <table className="ranking-table">
                  <caption className="sr-only">
                    Xếp hạng theo tổng điểm cao nhất, từ cao xuống thấp
                  </caption>
                  <thead>
                    <tr>
                      <th scope="col">Hạng</th>
                      <th scope="col">Biệt danh</th>
                      <th scope="col">Điểm</th>
                      <th scope="col">Mục đã chơi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ranking.entries.map((entry, index) => (
                      <tr
                        key={index}
                        className={entry.mine ? 'is-mine' : undefined}
                      >
                        <td>{entry.rank}</td>
                        <th scope="row">
                          {entry.nickname}
                          {entry.mine && (
                            <span className="ranking-you"> · Bạn</span>
                          )}
                        </th>
                        <td>
                          <strong>{entry.score}</strong>
                        </td>
                        <td>{entry.played}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty-inline">
                <Trophy size={32} />
                <h2>Chưa có điểm ở bảng này</h2>
                <p>Hoàn thành một thử thách rồi đăng điểm từ trang kết quả.</p>
                <Link className="button primary" to="/challenges">
                  Chọn thử thách
                </Link>
              </div>
            )}
            {ranking.hasPublished && (
              <button
                className="button secondary ranking-remove"
                disabled={busy}
                onClick={() => setConfirm(true)}
              >
                Gỡ toàn bộ điểm tôi đã đăng
              </button>
            )}
          </>
        )}
        <p role="status">{message}</p>
      </section>
      <p className="privacy-note">
        Mỗi trình duyệt là một người chơi riêng. Điểm dùng để thi đua vui; kết
        quả được gửi từ thiết bị của người chơi.
      </p>
      {confirm && (
        <Modal
          title="Gỡ điểm khỏi bảng xếp hạng?"
          confirmText={busy ? 'Đang gỡ…' : 'Gỡ toàn bộ điểm'}
          onCancel={() => {
            if (!busy) setConfirm(false);
          }}
          onConfirm={async () => {
            if (busy) return;
            setBusy(true);
            try {
              await removeScores();
              setMessage('Đã gỡ toàn bộ điểm bạn đăng trên trình duyệt này.');
              setRefresh((value) => value + 1);
            } catch (failure) {
              setMessage((failure as Error).message);
            } finally {
              setBusy(false);
              setConfirm(false);
            }
          }}
        >
          Biệt danh và điểm đã đăng từ trình duyệt này sẽ được gỡ. Tiến độ học
          trên thiết bị vẫn được giữ.
        </Modal>
      )}
    </>
  );
}
