import { useSearchParams } from 'react-router-dom';
import { BackLink } from '../components/Common';
import { topics } from '../data/neighbourhood';
import { GameLinks } from './LearningPages';

export function ChallengesPage() {
  const [search, setSearch] = useSearchParams();
  const topic =
    topics.find((item) => item.id === search.get('topic')) ?? topics[0];
  const fromQuest = search.get('quest') === '1';
  return (
    <>
      {fromQuest && (
        <BackLink to={`/quest/${topic.id}`}>Quay lại hành trình</BackLink>
      )}
      <div className="page-heading">
        <h1>Thử thách tiếng Anh</h1>
        <p className="lead">
          Ghép từ, chọn đáp án hoặc xếp câu. Chọn chủ đề rồi chọn một trò chơi
          bên dưới.
        </p>
        <label className="home-topic-picker">
          Chủ đề thử thách
          <select
            value={topic.id}
            onChange={(event) =>
              setSearch({
                topic: event.target.value,
                ...(fromQuest ? { quest: '1' } : {}),
              })
            }
          >
            {topics.map((item) => (
              <option key={item.id} value={item.id}>
                {item.titleEn}
              </option>
            ))}
          </select>
        </label>
      </div>
      <section aria-label={`Thử thách ${topic.titleEn}`}>
        <h2>{topic.titleEn}</h2>
        <p className="muted">
          Mỗi trò chơi có chế độ Luyện tập và Thử thách. Điểm, kết quả và huy
          hiệu được lưu trên thiết bị này.
        </p>
        <GameLinks topicId={topic.id} quest={fromQuest} challenge />
      </section>
    </>
  );
}
