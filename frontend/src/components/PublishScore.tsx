import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useProgress } from '../contexts/ProgressContext';
import { publishScore } from '../lib/leaderboard';
import type { GameRun } from '../types';
export function PublishScore({ run }: { run: GameRun }) {
  const { progress } = useProgress();
  const [nickname, setNickname] = useState(progress.nickname);
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);
  if (run.mode !== 'challenge') return null;
  return (
    <section
      className="publish-score challenge-section"
      aria-labelledby="publish-title"
    >
      <h2 id="publish-title">Ghi tên trên bảng xếp hạng</h2>
      <p>
        Đăng biệt danh và điểm lượt này để cùng thi đua. Chỉ giữ điểm cao nhất
        của mỗi trò trong từng chủ đề.
      </p>
      <form
        onSubmit={async (event) => {
          event.preventDefault();
          if (busy) return;
          setBusy(true);
          setStatus('Đang đăng điểm…');
          try {
            await publishScore(nickname, run);
            setStatus('Đã cập nhật điểm cao nhất của bạn.');
          } catch (error) {
            setStatus((error as Error).message);
          } finally {
            setBusy(false);
          }
        }}
      >
        <label htmlFor="ranking-nickname">Biệt danh hiển thị công khai</label>
        <div className="nickname-input">
          <input
            id="ranking-nickname"
            value={nickname}
            onChange={(event) => setNickname(event.target.value)}
            maxLength={40}
            required
            autoComplete="off"
          />
          <button
            className="button primary"
            disabled={busy || !nickname.trim()}
            type="submit"
          >
            {busy ? 'Đang đăng…' : 'Đăng điểm'}
          </button>
        </div>
        <p className="muted small">
          Dùng biệt danh, không cần tên thật. Bấm Đăng điểm để chia sẻ công
          khai; bạn có thể gỡ điểm trên cùng trình duyệt.
        </p>
        <p role="status">{status}</p>
      </form>
      <Link to="/leaderboard">Xem bảng xếp hạng</Link>
    </section>
  );
}
