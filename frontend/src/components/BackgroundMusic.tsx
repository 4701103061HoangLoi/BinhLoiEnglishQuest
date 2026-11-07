import { useEffect, useRef, useState } from 'react';
import { Music2, Pause } from 'lucide-react';

export function BackgroundMusic() {
  const audio = useRef<HTMLAudioElement>(null);
  const wanted = useRef(false);
  const request = useRef(0);
  const [enabled, setEnabled] = useState(false);
  const [message, setMessage] = useState('');

  async function play() {
    const ticket = ++request.current;
    try {
      if (!audio.current) return;
      audio.current.volume = 0.22;
      await audio.current.play();
      if (ticket !== request.current) return;
      if (!wanted.current || document.hidden) audio.current.pause();
    } catch {
      if (ticket !== request.current) return;
      wanted.current = false;
      setEnabled(false);
      setMessage('Chưa phát được nhạc. Bạn bấm bật lại thử nhé.');
    }
  }
  function toggle() {
    setMessage('');
    wanted.current = !wanted.current;
    setEnabled(wanted.current);
    if (wanted.current) void play();
    else {
      request.current++;
      audio.current?.pause();
    }
  }
  useEffect(() => {
    const element = audio.current;
    function visibility() {
      if (document.hidden) {
        request.current++;
        element?.pause();
      } else if (wanted.current) void play();
    }
    document.addEventListener('visibilitychange', visibility);
    return () => {
      request.current++;
      element?.pause();
      document.removeEventListener('visibilitychange', visibility);
    };
  }, []);
  return (
    <div className="background-music">
      <audio
        ref={audio}
        src="/audio/exploration.wav"
        loop
        preload="none"
        aria-hidden="true"
      />
      <button
        className={`music-toggle ${enabled ? 'music-enabled' : ''}`}
        aria-pressed={enabled}
        aria-label={enabled ? 'Tắt nhạc nền' : 'Bật nhạc nền'}
        onClick={toggle}
      >
        {enabled ? <Pause size={17} /> : <Music2 size={17} />}
        <span>Nhạc nền {enabled ? 'bật' : 'tắt'}</span>
      </button>
      {message && (
        <p className="music-message" role="status">
          {message}
        </p>
      )}
    </div>
  );
}
