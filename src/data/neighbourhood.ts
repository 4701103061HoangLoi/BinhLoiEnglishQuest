import type {
  GrammarLesson,
  QuizQuestion,
  SentenceQuestion,
  Topic,
  VocabularyItem,
} from '../types';
import { newSchool, house, friends } from './firstUnits';
const words = [
  [
    'art-gallery',
    'art gallery',
    'phòng trưng bày nghệ thuật',
    'n.',
    'We can see beautiful paintings at the art gallery.',
    'Chúng ta có thể ngắm những bức tranh đẹp tại phòng trưng bày nghệ thuật.',
  ],
  [
    'cathedral',
    'cathedral',
    'nhà thờ lớn',
    'n.',
    'The cathedral is near the square.',
    'Nhà thờ lớn ở gần quảng trường.',
  ],
  [
    'railway-station',
    'railway station',
    'nhà ga xe lửa',
    'n.',
    'My father is waiting at the railway station.',
    'Bố tôi đang đợi ở nhà ga xe lửa.',
  ],
  [
    'temple',
    'temple',
    'đền thờ',
    'n.',
    'The temple is very old.',
    'Ngôi đền rất cổ.',
  ],
  [
    'square',
    'square',
    'quảng trường',
    'n.',
    'Many people meet in the square.',
    'Nhiều người gặp nhau ở quảng trường.',
  ],
  [
    'crowded',
    'crowded',
    'đông đúc',
    'adj.',
    'The street is crowded in the morning.',
    'Con phố đông đúc vào buổi sáng.',
  ],
  [
    'modern',
    'modern',
    'hiện đại',
    'adj.',
    'Our city has many modern buildings.',
    'Thành phố của chúng tôi có nhiều tòa nhà hiện đại.',
  ],
  [
    'peaceful',
    'peaceful',
    'yên bình',
    'adj.',
    'My neighbourhood is peaceful at night.',
    'Khu phố của tôi yên bình vào ban đêm.',
  ],
  [
    'busy',
    'busy',
    'nhộn nhịp, bận rộn',
    'adj.',
    'This road is busy during rush hour.',
    'Con đường này nhộn nhịp vào giờ cao điểm.',
  ],
];
export const vocabulary: VocabularyItem[] = words.map(
  ([id, term, meaningVi, partOfSpeech, exampleEn, exampleVi]) => ({
    id,
    term,
    meaningVi,
    partOfSpeech,
    exampleEn,
    exampleVi,
    imagePath: `/images/neighbourhood/${id}.svg`,
    imageAlt: `Minh họa ${meaningVi}`,
  }),
);
export const grammar: GrammarLesson[] = [
  {
    id: 'short',
    title: 'Tính từ ngắn',
    rule: 'adjective + -er + than',
    example: 'small → smaller · old → older',
    note: 'The temple is older than the art gallery.',
  },
  {
    id: 'ends-e',
    title: 'Kết thúc bằng -e',
    rule: 'Thêm -r',
    example: 'large → larger',
    note: 'This square is larger than that square.',
  },
  {
    id: 'double',
    title: 'Gấp đôi phụ âm cuối',
    rule: 'Một số từ có dạng phụ âm–nguyên âm–phụ âm',
    example: 'big → bigger',
    note: 'Không áp dụng máy móc cho mọi từ. My classroom is bigger than yours.',
  },
  {
    id: 'ends-y',
    title: 'Phụ âm + y',
    rule: 'Đổi y → i, rồi thêm -er',
    example: 'busy → busier · noisy → noisier',
    note: 'My street is busier than your street.',
  },
  {
    id: 'long',
    title: 'Tính từ dài',
    rule: 'more + adjective + than',
    example: 'more peaceful · more modern · more crowded',
    note: 'The village is more peaceful than the city centre.',
  },
  {
    id: 'irregular',
    title: 'Ngoại lệ thường gặp',
    rule: 'Ghi nhớ dạng đặc biệt',
    example: 'good → better',
    note: 'This park is better than that park.',
  },
];
const quizRows = [
  [
    'q1',
    'This street is ____ than that street.',
    'busy',
    'busier',
    'busiest',
    'busy kết thúc bằng phụ âm + y: đổi y thành i rồi thêm -er → busier.',
  ],
  [
    'q2',
    'This building is ____ than that one.',
    'moderner',
    'more modern',
    'most modern',
    'modern dùng more trong so sánh hơn: more modern than.',
  ],
  [
    'q3',
    'The village is ____ than the city centre.',
    'peacefuler',
    'more peaceful',
    'most peaceful',
    'Dùng more peaceful than để so sánh mức độ yên bình.',
  ],
  [
    'q4',
    'My classroom is ____ than yours.',
    'biger',
    'bigger',
    'more big',
    'big → bigger: gấp đôi phụ âm g rồi thêm -er.',
  ],
  [
    'q5',
    'The market is ____ than the park.',
    'crowdeder',
    'more crowded',
    'crowdedest',
    'Tính từ crowded dùng more crowded than.',
  ],
];
export const quiz: QuizQuestion[] = quizRows.map(
  ([id, prompt, a, b, c, explanationVi]) => ({
    id,
    prompt,
    options: [
      { id: `${id}-a`, text: a },
      { id: `${id}-b`, text: b },
      { id: `${id}-c`, text: c },
    ],
    correctOptionId: `${id}-b`,
    explanationVi,
  }),
);
const sentenceRows = [
  [
    'This street is busier than that street.',
    'busy → busier. Đặt tính từ so sánh trước than.',
  ],
  [
    'The temple is older than the art gallery.',
    'old → older. Ngôi đền cổ hơn phòng trưng bày nghệ thuật.',
  ],
  [
    'My neighbourhood is more peaceful than the city centre.',
    'Dùng more + peaceful + than. Khu phố của tôi yên bình hơn trung tâm thành phố.',
  ],
  [
    'This square is bigger than that square.',
    'big → bigger. Quảng trường này lớn hơn quảng trường kia.',
  ],
  [
    'The railway station is more modern than the temple.',
    'Dùng more + modern + than. Nhà ga hiện đại hơn ngôi đền.',
  ],
];
export const sentences: SentenceQuestion[] = sentenceRows.map(
  ([correctSentence, explanationVi], index) => ({
    id: `s${index + 1}`,
    correctSentence,
    explanationVi,
    tokens: correctSentence
      .replace(/\.$/, '')
      .split(' ')
      .map((text, i) => ({ id: `s${index + 1}-t${i}`, text })),
  }),
);
export const neighbourhood: Topic = {
  id: 'my-neighbourhood',
  titleEn: 'My Neighbourhood',
  titleVi: 'Khu phố của em',
  grade: 6,
  unit: 4,
  descriptionVi:
    'Khám phá các địa điểm và tính từ mô tả khu phố, sau đó chinh phục thử thách ngữ pháp so sánh hơn.',
  imagePath: '/images/neighbourhood-map.svg',
  imageAlt: 'Bản đồ khu phố',
  grammarTitle: 'Comparative adjectives',
  grammarDescriptionVi:
    'So sánh hơn — nói về sự khác biệt giữa hai người, vật hoặc nơi chốn.',
  grammarExample: 'My street is busier than your street.',
  grammarExampleVi: 'Con phố của tôi nhộn nhịp hơn con phố của bạn.',
  grammarCautionVi:
    'Không dùng more busier, peacefuler hoặc biger. Dùng busier, more peaceful và bigger. Đừng quên than khi nêu đối tượng so sánh.',
  vocabulary,
  grammar,
  quiz,
  sentences,
};
export const topics: Topic[] = [newSchool, house, friends, neighbourhood];
export const gameInfo = {
  'word-match': {
    title: 'Word Match',
    subtitle: 'Ghép từ với hình',
    description:
      'Chọn một từ tiếng Anh, rồi chọn hình tương ứng. Ghép đủ 5 cặp; mỗi lần sai trừ 5 điểm.',
    seconds: 90,
    branch: 'vocabulary',
  },
  'quick-quiz': {
    title: 'Quick Quiz',
    subtitle: 'Thử tài ngữ pháp',
    description:
      'Chọn đáp án đúng cho 5 câu ngữ pháp. Đọc giải thích sau mỗi câu để ghi nhớ tốt hơn.',
    seconds: 90,
    branch: 'grammar',
  },
  'sentence-builder': {
    title: 'Sentence Builder',
    subtitle: 'Từng từ, thành câu',
    description:
      'Chạm các từ theo thứ tự để tạo câu. Chạm từ đã chọn để bỏ. Kiểm tra khi đã dùng đủ từ.',
    seconds: 150,
    branch: 'grammar',
  },
} as const;
export const gameIds = Object.keys(gameInfo) as (keyof typeof gameInfo)[];
