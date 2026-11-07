import { useState } from 'react';
import { ActionLink, BackLink, Picture } from '../components/Common';
import { QuestGuide } from '../components/QuestGuide';
import { createDemoQuestion } from '../lib/gameLogic';
import { GameSoundToggle } from '../components/GameSoundToggle';
import { useProgress } from '../contexts/ProgressContext';
import { playFeedbackAudio } from '../lib/feedbackAudio';
import { newSchool } from '../data/firstUnits';

export function DemoPage() {
  const { progress } = useProgress();
  const [question, setQuestion] = useState(() =>
    createDemoQuestion(newSchool.vocabulary, Math.random),
  );
  const { target, choices } = question;
  const [answer, setAnswer] = useState('');
  const correct = answer === target.id;
  return (
    <section className="demo-page narrow">
      <BackLink to="/">Trang chủ</BackLink>
      <div className="page-heading compact">
        <h1>Chơi thử</h1>
        <p className="lead">Nhìn hình và chọn từ tiếng Anh tương ứng.</p>
        <p className="muted small">
          Chỉ một câu mẫu · Không tính giờ · Không lưu điểm
        </p>
      </div>
      <div className="game-board">
        <GameSoundToggle />
        <div className="demo-picture">
          <Picture item={target} />
        </div>
        <div
          className="quiz-options"
          role="group"
          aria-label="Chọn từ đúng với hình"
        >
          {choices.map((word) => (
            <button
              key={word.id}
              className={`quiz-option ${correct && word.id === target.id ? 'correct-option' : ''}`}
              disabled={correct}
              onClick={() => {
                setAnswer(word.id);
                void playFeedbackAudio(
                  word.id === target.id,
                  progress.settings.soundEnabled,
                );
              }}
              lang="en"
            >
              {word.term}
            </button>
          ))}
        </div>
        <QuestGuide
          mood={correct ? 'happy' : answer ? 'thinking' : 'ready'}
          hint="Nhìn hình rồi chọn một trong ba từ. Bạn có thể thử lại khi chưa đúng."
        >
          {correct
            ? `✓ Chính xác! ${target.term} nghĩa là ${target.meaningVi}.`
            : answer
              ? `Chưa đúng. Hình này là ${target.meaningVi}. Bạn chọn lại thử xem.`
              : 'Chạm hoặc dùng Tab và Enter để chọn.'}
        </QuestGuide>
        {correct && (
          <div className="actions">
            <ActionLink to="/topics/my-new-school">Bắt đầu Unit 1</ActionLink>
            <button
              className="button secondary"
              onClick={() => {
                setQuestion((current) =>
                  createDemoQuestion(
                    newSchool.vocabulary,
                    Math.random,
                    current.target.id,
                  ),
                );
                setAnswer('');
              }}
            >
              Thử lại
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
