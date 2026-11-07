import { ActionLink } from './Common';
import { useProgress } from '../contexts/ProgressContext';
import { questStage } from '../lib/questLogic';
import type { Topic } from '../types';

export function JourneyOverview({ topic }: { topic: Topic }) {
  const { progress } = useProgress();
  const stage = questStage(progress, topic.id);
  const visited = topic.vocabulary.filter((word) =>
    progress.visitedVocabularyIds.includes(`${topic.id}:${word.id}`),
  ).length;
  const learned = topic.grammar.every((rule) =>
    progress.viewedGrammarIds.includes(`${topic.id}:${rule.id}`),
  );
  return (
    <section
      className="journey-overview"
      aria-label={`Hành trình ${topic.titleEn}`}
    >
      <div className="section-heading">
        <h2>Các chặng học</h2>
        <p>
          {topic.titleEn} · {Math.min(stage, 3)}/3 chìa khóa · Đã xem {visited}/
          {topic.vocabulary.length} từ vựng
          {learned ? ' · Đã xem bài học ngữ pháp' : ''}
        </p>
      </div>
      <ol className="journey-steps">
        <li>
          <span>1</span>
          <div>
            <h3>Khám phá từ vựng</h3>
            <p>Học ba từ đầu rồi săn tìm dấu vết.</p>
          </div>
        </li>
        <li>
          <span>2</span>
          <div>
            <h3>Ghi nhớ và ghép từ</h3>
            <p>Học các từ còn lại, lật thẻ và luyện Word Match.</p>
          </div>
        </li>
        <li>
          <span>3</span>
          <div>
            <h3>Ngữ pháp và mật thư</h3>
            <p>
              Học quy tắc, giải mật thư; luyện Quick Quiz và Sentence Builder.
            </p>
          </div>
        </li>
      </ol>
      <ActionLink to={`/quest/${topic.id}`}>
        {stage > 0 || progress.questCheckpoints?.[topic.id] === 0
          ? 'Tiếp tục hành trình'
          : 'Bắt đầu hành trình'}
      </ActionLink>
    </section>
  );
}
