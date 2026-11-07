import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Compass, Volume2 } from 'lucide-react';
import { useProgress } from '../contexts/ProgressContext';
import type { VocabularyItem } from '../types';
export function Picture({
  item,
  className = '',
}: {
  item: VocabularyItem;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  return failed ? (
    <span className={`image-fallback ${className}`}>{item.meaningVi}</span>
  ) : (
    <img
      className={className}
      src={item.imagePath}
      alt={item.imageAlt}
      onError={() => setFailed(true)}
    />
  );
}
export function BackLink({
  to = '/topics',
  children = 'Chủ đề',
}: {
  to?: string;
  children?: ReactNode;
}) {
  return (
    <Link className="back-link" to={to}>
      <ArrowLeft size={17} /> {children}
    </Link>
  );
}
export function ActionLink({
  to,
  children,
  secondary = false,
}: {
  to: string;
  children: ReactNode;
  secondary?: boolean;
}) {
  return (
    <Link className={`button ${secondary ? 'secondary' : 'primary'}`} to={to}>
      {children}
      <ArrowRight size={18} />
    </Link>
  );
}
export function EmptyState({
  title = 'Chưa có nội dung',
  children,
}: {
  title?: string;
  children?: ReactNode;
}) {
  return (
    <section className="empty-state">
      <Compass size={48} />
      <h1>{title}</h1>
      <p>
        {children ||
          'Trang này không có nội dung. Bạn có thể chọn một chủ đề khác.'}
      </p>
      <ActionLink to="/topics">Khám phá chủ đề</ActionLink>
    </section>
  );
}
export function Modal({
  title,
  children,
  onCancel,
  onConfirm,
  confirmText = 'Đồng ý',
}: {
  title: string;
  children: ReactNode;
  onCancel: () => void;
  onConfirm: () => void;
  confirmText?: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current!;
    dialog.showModal();
    return () => dialog.close();
  }, []);
  return (
    <dialog
      ref={ref}
      onCancel={(event) => {
        event.preventDefault();
        onCancel();
      }}
      aria-labelledby="dialog-title"
    >
      <h2 id="dialog-title">{title}</h2>
      <p>{children}</p>
      <div className="actions">
        <button className="button secondary" onClick={onCancel} autoFocus>
          Hủy / Ở lại
        </button>
        <button className="button danger" onClick={onConfirm}>
          {confirmText}
        </button>
      </div>
    </dialog>
  );
}
export function SpeechButton({ text }: { text: string }) {
  const { progress, update } = useProgress();
  const [message, setMessage] = useState('');
  const activeUtterance = useRef<SpeechSynthesisUtterance | null>(null);
  const supported =
    typeof window !== 'undefined' &&
    'speechSynthesis' in window &&
    'SpeechSynthesisUtterance' in window;
  useEffect(() => {
    setMessage('');
    return () => {
      activeUtterance.current = null;
      if (supported) window.speechSynthesis.cancel();
    };
  }, [supported, text]);
  function speak() {
    try {
      if (!progress.settings.soundEnabled)
        update((p) => ({
          ...p,
          settings: { ...p.settings, soundEnabled: true },
        }));
      activeUtterance.current = null;
      setMessage('');
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.85;
      activeUtterance.current = utterance;
      utterance.onerror = (event) => {
        if (activeUtterance.current !== utterance) return;
        activeUtterance.current = null;
        if (event.error === 'canceled' || event.error === 'interrupted') return;
        setMessage(
          'Không phát được âm thanh. Hãy kiểm tra giọng đọc tiếng Anh trên thiết bị.',
        );
      };
      utterance.onend = () => {
        if (activeUtterance.current === utterance)
          activeUtterance.current = null;
      };
      window.speechSynthesis.speak(utterance);
    } catch {
      activeUtterance.current = null;
      setMessage('Thiết bị chưa hỗ trợ phát âm tự động.');
    }
  }
  return (
    <div>
      <button
        className="button secondary"
        disabled={!supported}
        onClick={speak}
        aria-label={`Nghe phát âm ${text}`}
      >
        <Volume2 size={19} />
        {progress.settings.soundEnabled ? 'Nghe phát âm' : 'Bật âm & nghe'}
      </button>
      {!supported && (
        <p className="muted">Thiết bị chưa hỗ trợ phát âm tự động.</p>
      )}
      <span role="status">{message}</span>
    </div>
  );
}
