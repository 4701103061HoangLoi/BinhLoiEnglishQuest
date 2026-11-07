import { useState } from 'react';
import { ActionLink, BackLink, Picture } from '../components/Common';
import { newSchool } from '../data/firstUnits';

const bag = newSchool.vocabulary.find((word) => word.id === 'school-bag')!;
const choices = ['pencil', 'school-bag', 'ruler'].map((id) =>
  newSchool.vocabulary.find((word) => word.id === id)!,
);

export function DemoPage() {
  const [answer, setAnswer] = useState('');
  const correct = answer === bag.id;
  return (
    <section className="demo-page narrow">
      <BackLink to="/">Trang chủ</BackLink>
      <div className="page-heading compact">
        <h1>Chơi thử một câu nhé!</h1>
        <p className="lead">Nhìn hình và chọn từ tiếng Anh tương ứng.</p>
        <p className="muted small">
          Chỉ một câu mẫu · Không tính giờ · Không lưu điểm
        </p>
      </div>
      <div className="game-board">
        <div className="demo-picture">
          <Picture item={bag} />
        </div>
        <div
          className="quiz-options"
          role="group"
          aria-label="Chọn từ đúng với hình"
        >
          {choices.map((word) => (
            <button
              key={word.id}
              className={`quiz-option ${correct && word.id === bag.id ? 'correct-option' : ''}`}
              disabled={correct}
              onClick={() => setAnswer(word.id)}
              lang="en"
            >
              {word.term}
            </button>
          ))}
        </div>
        <p className="demo-feedback" role="status">
          {correct
            ? '✓ Chính xác! School bag nghĩa là cặp sách.'
            : answer
              ? 'Chưa đúng rồi. Đây là chiếc cặp sách — thử chọn lại nhé!'
              : 'Chạm hoặc dùng Tab và Enter để chọn.'}
        </p>
        {correct && (
          <div className="actions">
            <ActionLink to="/topics/my-new-school">Bắt đầu Unit 1</ActionLink>
            <button className="button secondary" onClick={() => setAnswer('')}>
              Thử lại
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
