import { useId, useState, type ReactNode } from 'react';
import '../styles/guide.css';

type Mood = 'ready' | 'happy' | 'thinking' | 'celebrate';
const expressions: Record<Mood, string> = {
  ready: 'Mây sẵn sàng đồng hành',
  happy: 'Mây vui mừng và giơ tay cổ vũ',
  thinking: 'Mây đang suy nghĩ cùng bạn',
  celebrate: 'Mây ăn mừng cùng bạn',
};
export function QuestGuide({
  mood = 'ready',
  hint,
  children,
}: {
  mood?: Mood;
  hint: string;
  children: ReactNode;
}) {
  const [help, setHelp] = useState(false);
  const hintId = useId();
  const joyful = mood === 'happy' || mood === 'celebrate';
  return (
    <div className={`quest-guide guide-${mood}`} data-mood={mood}>
      <button
        className="guide-character"
        aria-label="Nhờ Mây nhắc cách chơi"
        aria-expanded={help}
        aria-controls={hintId}
        onClick={() => setHelp(!help)}
      >
        <svg
          key={mood}
          viewBox="0 0 140 160"
          role="img"
          aria-label={expressions[mood]}
        >
          <ellipse cx="70" cy="149" rx="40" ry="7" fill="#d2e3da" />
          <g className="guide-body">
            <path
              d="M56 123l-5 23m33-23 5 23"
              stroke="#435875"
              strokeWidth="10"
              strokeLinecap="round"
            />
            <path
              d="M42 147h15m26 0h15"
              stroke="#58718a"
              strokeWidth="8"
              strokeLinecap="round"
            />
            <path d="M45 83q25-14 50 0l7 44H38Z" fill="#72b5c4" />
            <path d="M47 84l23 15 23-15-12-10H59Z" fill="#fff8e6" />
            <path d="M66 95l4 18 5-18" fill="#e8ae50" />
            <path
              className="guide-left-arm"
              d={joyful ? 'M44 87L23 69l-4-21' : 'M43 88l-15 30'}
              stroke="#efc5a0"
              strokeWidth="10"
              strokeLinecap="round"
              fill="none"
            />
            <path
              className="guide-right-arm"
              d={
                mood === 'celebrate'
                  ? 'M96 87l21-18 4-21'
                  : mood === 'thinking'
                    ? 'M97 87l15 15-22-30'
                    : 'M97 88l15 30'
              }
              stroke="#efc5a0"
              strokeWidth="10"
              strokeLinecap="round"
              fill="none"
            />
            <circle cx="70" cy="56" r="31" fill="#efc5a0" />
            <path
              d="M39 56V41q0-26 31-26t31 26v15L86 36l-17 10-14-9Z"
              fill="#58718a"
            />
            <path d="M37 32l7-23q26-15 52 0l7 23Z" fill="#e8ae50" />
            <path
              d="M29 32h82"
              stroke="#c5954b"
              strokeWidth="8"
              strokeLinecap="round"
            />
            <path d="M46 15h48v9H43Z" fill="#fff8e6" />
            {joyful ? (
              <path
                d="M53 57q5-7 10 0m14 0q5-7 10 0"
                stroke="#435875"
                strokeWidth="3"
                fill="none"
                strokeLinecap="round"
              />
            ) : (
              <g fill="#435875">
                <circle cx="58" cy="56" r="3" />
                <circle cx="82" cy="56" r="3" />
              </g>
            )}
            {mood === 'thinking' && (
              <path
                d="M51 47l13-3m13 0 12 3"
                stroke="#58718a"
                strokeWidth="3"
                strokeLinecap="round"
              />
            )}
            <path
              d={
                joyful
                  ? 'M57 68q13 20 26 0Z'
                  : mood === 'thinking'
                    ? 'M65 72q6-4 12 0'
                    : 'M59 69q11 10 22 0'
              }
              fill={joyful ? '#b75e4c' : 'none'}
              stroke="#98634f"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <g fill="#e6a5a1">
              <ellipse cx="47" cy="65" rx="5" ry="3" />
              <ellipse cx="93" cy="65" rx="5" ry="3" />
            </g>
          </g>
          {mood === 'celebrate' && (
            <g fill="#e8ae50">
              <path d="m16 15 3 8 9 1-7 5 2 9-7-5-7 5 2-9-7-5 9-1Z" />
              <path d="m121 17 3 7 8 1-6 5 1 8-6-4-7 4 2-8-6-5 8-1Z" />
            </g>
          )}
        </svg>
        <span>Mây giúp bạn</span>
      </button>
      <div className="guide-dialogue">
        <strong>Mây · Bạn đồng hành</strong>
        <div role="status" aria-atomic="true">
          {children}
        </div>
        <p id={hintId} className="guide-help" hidden={!help}>
          {hint}
        </p>
      </div>
    </div>
  );
}
