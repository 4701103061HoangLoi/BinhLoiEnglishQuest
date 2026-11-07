import { Volume2, VolumeX } from 'lucide-react';
import { useProgress } from '../contexts/ProgressContext';

export function GameSoundToggle() {
  const { progress, update } = useProgress();
  const enabled = progress.settings.soundEnabled;
  return (
    <div className="game-sound-control">
      <button
        className="button secondary"
        aria-pressed={enabled}
        aria-label={enabled ? 'Tắt âm thanh trò chơi' : 'Bật âm thanh trò chơi'}
        onClick={() =>
          update((p) => ({
            ...p,
            settings: { ...p.settings, soundEnabled: !p.settings.soundEnabled },
          }))
        }
      >
        {enabled ? <Volume2 size={18} /> : <VolumeX size={18} />}Âm thanh{' '}
        {enabled ? 'bật' : 'tắt'}
      </button>
    </div>
  );
}
