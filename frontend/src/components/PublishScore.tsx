import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Trophy, X } from 'lucide-react';
import { Modal } from './Common';
import { useProgress } from '../contexts/ProgressContext';
import { gameInfo, topics } from '../data/neighbourhood';
import { publishScore } from '../lib/leaderboard';
import type { GameRun } from '../types';
export function PublishScore({ run }: { run: GameRun }) {
  const { progress } = useProgress();
  const [nickname, setNickname] = useState(progress.nickname);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState('');
  const [published, setPublished] = useState(false);
  const [busy, setBusy] = useState(false);
  const nicknameInput = useRef<HTMLInputElement>(null);
  if (run.mode !== 'challenge') return null;
  const close = () => {
    if (!busy) setOpen(false);
  };
  return (
    <>
      <section
        className="publish-score challenge-section"
        aria-labelledby="publish-title"
      >
        <div>
          <h2 id="publish-title">Cùng thi đua trên bảng xếp hạng</h2>
          <p>Chia sẻ điểm lượt này bằng biệt danh của bạn.</p>
        </div>
        <button
          className="button primary"
          aria-haspopup="dialog"
          onClick={() => setOpen(true)}
        >
          <Trophy size={18} aria-hidden="true" />
          {published ? 'Xem điểm đã đăng' : 'Đăng điểm'}
        </button>
      </section>
      {open && (
        <Modal
          title={published ? 'Đã đăng điểm!' : 'Ghi tên trên bảng xếp hạng'}
          onCancel={close}
          className="publish-dialog"
          initialFocus={nicknameInput}
        >
          <button
            className="publish-close"
            aria-label="Đóng hộp thoại"
            onClick={close}
            disabled={busy}
          >
            <X size={20} aria-hidden="true" />
          </button>
          {published ? (
            <div className="publish-success">
              <CheckCircle2 size={40} aria-hidden="true" />
              <p role="status">Đã cập nhật điểm cao nhất của bạn.</p>
              <p className="muted">
                Hẹn gặp {nickname.trim()} trên bảng xếp hạng!
              </p>
              <Link
                className="button primary"
                to="/leaderboard"
                ref={(link) => {
                  link?.focus();
                }}
              >
                Xem bảng xếp hạng
              </Link>
              <button className="button secondary" onClick={close}>
                Về kết quả
              </button>
            </div>
          ) : (
            <form
              onSubmit={async (event) => {
                event.preventDefault();
                if (busy || !nickname.trim()) return;
                setBusy(true);
                setError('');
                try {
                  await publishScore(nickname, run);
                  setPublished(true);
                } catch (failure) {
                  setError((failure as Error).message);
                } finally {
                  setBusy(false);
                }
              }}
            >
              <div className="publish-run">
                <div>
                  <strong>{gameInfo[run.gameId].title}</strong>
                  <span>
                    {topics.find((topic) => topic.id === run.topicId)?.titleEn}
                  </span>
                </div>
                <span>
                  <strong>{run.score}</strong> điểm
                </span>
              </div>
              <label htmlFor="ranking-nickname">
                Biệt danh hiển thị công khai
              </label>
              <input
                id="ranking-nickname"
                value={nickname}
                onChange={(event) => setNickname(event.target.value)}
                maxLength={40}
                required
                autoComplete="off"
                ref={nicknameInput}
                disabled={busy}
                aria-describedby="publish-privacy"
              />
              <p id="publish-privacy" className="muted small">
                Dùng biệt danh, không cần tên thật. Chỉ chia sẻ khi bạn bấm Đăng
                điểm; có thể gỡ trên cùng trình duyệt.
              </p>
              <p className="publish-rule small">
                Chỉ giữ điểm cao nhất của mỗi trò trong từng chủ đề.
              </p>
              {error && (
                <p className="publish-error" role="alert">
                  {error}
                </p>
              )}
              <div className="publish-actions">
                <button
                  className="button secondary"
                  type="button"
                  onClick={close}
                  disabled={busy}
                >
                  Để sau
                </button>
                <button
                  className="button primary"
                  disabled={busy || !nickname.trim()}
                  type="submit"
                >
                  {busy ? 'Đang đăng…' : 'Đăng điểm'}
                </button>
              </div>
              <span className="sr-only" role="status">
                {busy ? 'Đang đăng điểm…' : ''}
              </span>
            </form>
          )}
        </Modal>
      )}
    </>
  );
}
