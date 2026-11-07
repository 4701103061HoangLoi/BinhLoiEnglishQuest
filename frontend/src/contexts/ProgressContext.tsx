import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { stopFeedbackAudio } from '../lib/feedbackAudio';
import type { UserProgress, GameRun } from '../types';
import {
  addRun,
  defaultProgress,
  readProgress,
  STORAGE_KEY,
  writeProgress,
} from '../lib/storage';
interface ProgressContextValue {
  progress: UserProgress;
  error: string | null;
  update: (change: (previous: UserProgress) => UserProgress) => void;
  saveRun: (run: GameRun) => void;
  reset: () => void;
}
const ProgressContext = createContext<ProgressContextValue | null>(null);
export function ProgressProvider({ children }: { children: ReactNode }) {
  const [initial] = useState(readProgress);
  const [progress, setProgress] = useState(initial.data);
  const [error, setError] = useState(initial.error);
  const current = useRef(progress);
  const writable = useRef(initial.writable);
  const update = useCallback(
    (change: (previous: UserProgress) => UserProgress) => {
      const next = change(current.current);
      if (next === current.current) return;
      current.current = next;
      setProgress(next);
      if (writable.current && !writeProgress(next))
        setError(
          'Không thể lưu tiến độ trên thiết bị này. Bạn vẫn có thể chơi trong phiên hiện tại.',
        );
    },
    [],
  );
  useEffect(() => {
    if (!progress.settings.soundEnabled) {
      stopFeedbackAudio();
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    }
  }, [progress.settings.soundEnabled]);
  const saveRun = useCallback(
    (run: GameRun) => update((p) => addRun(p, run)),
    [update],
  );
  const reset = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      writable.current = true;
      setError(null);
    } catch {
      setError(
        'Không thể xóa dữ liệu lưu trữ. Hãy kiểm tra quyền lưu trữ của trình duyệt.',
      );
      return;
    }
    update(() => defaultProgress());
  };
  useEffect(() => {
    document.documentElement.dataset.reducedMotion = String(
      progress.settings.reducedMotion,
    );
  }, [progress.settings.reducedMotion]);
  return (
    <ProgressContext.Provider
      value={{ progress, error, update, saveRun, reset }}
    >
      {children}
    </ProgressContext.Provider>
  );
}
export function useProgress() {
  const value = useContext(ProgressContext);
  if (!value) throw new Error('Missing ProgressProvider');
  return value;
}
