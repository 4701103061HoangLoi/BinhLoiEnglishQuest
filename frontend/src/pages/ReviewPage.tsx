import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useProgress } from '../contexts/ProgressContext';
import { recordReview, reviewQuestions, reviewStats } from '../lib/review';
import { SpeechButton } from '../components/Common';
import { QuestGuide } from '../components/QuestGuide';
import { playFeedbackAudio } from '../lib/feedbackAudio';
export function DailyReviewCard() {
  const { progress } = useProgress();
  const { count, streak } = reviewStats(progress.review);
  return (
    <section className="challenge-section daily-review">
      <div>
        <h2>Ôn tập hôm nay</h2>
        <p>Ôn 5 từ mỗi ngày. Mây sẽ chọn từ đã học và từ cần luyện thêm.</p>
        <p>
          <strong>{Math.min(count, 5)}/5 từ</strong> hôm nay · {streak} ngày học
          liên tiếp
        </p>
      </div>
      <Link className="button primary" to="/review">
        {count >= 5 ? 'Ôn thêm một lượt' : 'Ôn cùng Mây'}
      </Link>
    </section>
  );
}
export function ReviewPage() {
  const { progress, update } = useProgress();
  const [questions] = useState(() =>
    reviewQuestions(progress, Math.floor(Math.random() * 4294967296)),
  );
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const locked = useRef(false);
  const question = questions[index];
  const stats = reviewStats(progress.review);
  const heading = useRef<HTMLHeadingElement>(null);
  if (!question)
    return (
      <section className="narrow game-intro">
        <h1>Đã ôn xong!</h1>
        <QuestGuide
          mood="celebrate"
          hint="Từ chưa nhớ sẽ được ưu tiên trong lượt ôn tiếp theo."
        >
          Bạn trả lời đúng {correctCount}/{questions.length} từ. Mỗi lần ôn là
          một lần nhớ thêm.
        </QuestGuide>
        <p>
          Hôm nay đã ôn {stats.count} từ khác nhau · {stats.streak} ngày liên
          tiếp.
        </p>
        <p>
          {stats.count >= 5
            ? 'Bạn đã đạt mục tiêu hôm nay.'
            : 'Học thêm từ trong chủ đề để mở rộng lượt ôn.'}
        </p>
        <div className="actions">
          <Link className="button primary" to="/topics">
            Học tiếp chủ đề
          </Link>
          <Link className="button secondary" to="/">
            Về trang chủ
          </Link>
        </div>
      </section>
    );
  const correct = selected === question.word.key;
  return (
    <section className="narrow review-lesson">
      <Link to="/">Về trang chủ</Link>
      <h1>Ôn tập hôm nay</h1>
      <p>
        Từ {index + 1}/{questions.length} · {question.word.topic}
      </p>
      <progress
        value={index}
        max={questions.length}
        aria-label="Tiến độ lượt ôn"
      />
      <QuestGuide
        mood={selected ? (correct ? 'happy' : 'thinking') : 'ready'}
        hint="Chọn nghĩa tiếng Việt. Sau khi trả lời, hãy đọc ví dụ và thử nói lại từ."
      >
        {selected
          ? correct
            ? 'Đúng rồi! Đọc ví dụ để nhớ cách dùng nhé.'
            : 'Mình cùng xem lại nghĩa và ví dụ nhé.'
          : 'Em còn nhớ nghĩa của từ này không?'}
      </QuestGuide>
      <h2 ref={heading} tabIndex={-1} lang="en">
        {question.word.term}
      </h2>
      <p className="phonetic">{question.word.phonetic}</p>
      <SpeechButton text={question.word.term} />
      <div className="review-options">
        {question.options.map((option) => (
          <button
            className={`button secondary ${selected && option.key === question.word.key ? 'review-correct' : ''}`}
            key={option.key}
            disabled={selected !== null}
            onClick={() => {
              if (locked.current) return;
              locked.current = true;
              const isCorrect = option.key === question.word.key;
              setSelected(option.key);
              if (isCorrect) setCorrectCount((count) => count + 1);
              update((p) => ({
                ...p,
                review: recordReview(p.review, question.word.key, isCorrect),
              }));
              void playFeedbackAudio(isCorrect, progress.settings.soundEnabled);
            }}
          >
            {option.meaningVi}
          </button>
        ))}
      </div>
      {selected && (
        <div className="example">
          <p role="status">
            {correct ? 'Chính xác!' : 'Chưa đúng.'} {question.word.term}:{' '}
            {question.word.meaningVi}
          </p>
          <p lang="en">{question.word.exampleEn}</p>
          <p>{question.word.exampleVi}</p>
          <button
            className="button primary"
            onClick={() => {
              setIndex((value) => value + 1);
              setSelected(null);
              locked.current = false;
              heading.current?.focus();
            }}
          >
            {index === questions.length - 1
              ? 'Xem kết quả ôn tập'
              : 'Từ tiếp theo'}
          </button>
        </div>
      )}
      <p className="muted small">
        Trả lời sai vẫn được học tiếp. Mục tiêu ngày tính số từ khác nhau đã ôn.
      </p>
    </section>
  );
}
