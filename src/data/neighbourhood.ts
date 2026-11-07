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
  [
    'q6',
    'The park is ____ than the market. It has less noise.',
    'quiet',
    'quieter',
    'quietest',
    'Quiet thêm -er thành quieter; so sánh hơn đi với than.',
  ],
  [
    'q7',
    'This road is ____ than the lane. It is not as narrow.',
    'wide',
    'wider',
    'widest',
    'Wide đã có e cuối nên chỉ thêm -r: wider.',
  ],
  [
    'q8',
    'The village is ____ than the city. It has less pollution.',
    'clean',
    'cleaner',
    'cleanest',
    'Clean là tính từ ngắn; thêm -er thành cleaner.',
  ],
  [
    'q9',
    'This shop is ____ than that one. The prices are lower.',
    'cheap',
    'cheaper',
    'cheapest',
    'Cheap thêm -er thành cheaper, nghĩa là rẻ hơn.',
  ],
  [
    'q10',
    'The new park is ____ than the old one.',
    'good',
    'better',
    'best',
    'Good có dạng so sánh hơn bất quy tắc là better.',
  ],
  [
    'q11',
    'This tower is ____ than the temple. It has more floors.',
    'tall',
    'taller',
    'tallest',
    'Tall thêm -er thành taller, nghĩa là cao hơn.',
  ],
  [
    'q12',
    'The bus is ____ than the bicycle. It takes less time.',
    'fast',
    'faster',
    'fastest',
    'Fast thêm -er thành faster, nghĩa là nhanh hơn.',
  ],
  [
    'q13',
    'The river is ____ than the stream.',
    'long',
    'longer',
    'longest',
    'Long thêm -er thành longer; stream là dòng suối.',
  ],
  [
    'q14',
    'The railway station is ____ than this small shop.',
    'big',
    'bigger',
    'biggest',
    'Big gấp đôi g rồi thêm -er: bigger.',
  ],
  [
    'q15',
    'This hotel is ____ than that guest house. It costs more.',
    'expensiver',
    'more expensive',
    'most expensive',
    'Expensive là tính từ dài, dùng more expensive trong so sánh hơn.',
  ],
  [
    'q16',
    'The square is ____ than the temple today. There are more people.',
    'crowded',
    'more crowded',
    'most crowded',
    'Crowded dùng more crowded, nghĩa là đông đúc hơn.',
  ],
  [
    'q17',
    'My street is ____ than your street at night. It has less traffic.',
    'peaceful',
    'more peaceful',
    'most peaceful',
    'Peaceful dùng more peaceful, nghĩa là yên bình hơn.',
  ],
  [
    'q18',
    'The art gallery is more modern ____ the temple.',
    'then',
    'than',
    'that',
    'Dùng than khi nêu đối tượng được so sánh, không dùng then.',
  ],
  [
    'q19',
    'This sofa is ____ than that wooden chair.',
    'comfortabler',
    'more comfortable',
    'most comfortable',
    'Comfortable là tính từ dài; dùng more comfortable, nghĩa là thoải mái hơn.',
  ],
  [
    'q20',
    'The library has less noise. It is ____ than the playground.',
    'noisier',
    'quieter',
    'quietest',
    'Quieter là so sánh hơn của quiet; quietest là so sánh nhất.',
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
  [
    'The park is quieter than the market.',
    'Quiet thêm -er thành quieter: công viên yên tĩnh hơn chợ.',
  ],
  ['This road is wider than the lane.', 'Wide có e cuối nên thêm -r: wider.'],
  [
    'The village is cleaner than the city.',
    'Clean thêm -er thành cleaner, nghĩa là sạch hơn.',
  ],
  [
    'This shop is cheaper than that one.',
    'Cheap thêm -er thành cheaper: cửa hàng này rẻ hơn cửa hàng kia.',
  ],
  [
    'The new park is better than the old one.',
    'Good có dạng so sánh hơn là better.',
  ],
  [
    'This tower is taller than the temple.',
    'Tall thêm -er thành taller, nghĩa là cao hơn.',
  ],
  [
    'The bus is faster than the bicycle.',
    'Fast thêm -er thành faster, nghĩa là nhanh hơn.',
  ],
  [
    'The river is longer than the stream.',
    'Long thêm -er thành longer; dùng than trước đối tượng so sánh.',
  ],
  [
    'The railway station is bigger than this shop.',
    'Big gấp đôi g trước khi thêm -er thành bigger.',
  ],
  [
    'This hotel is more expensive than that guest house.',
    'Expensive dùng more trong so sánh hơn.',
  ],
  [
    'The square is more crowded than the temple today.',
    'Crowded dùng more crowded để nói đông đúc hơn.',
  ],
  [
    'My street is more peaceful than your street.',
    'Peaceful dùng more peaceful trong so sánh hơn.',
  ],
  [
    'The new cinema is more modern than the old theatre.',
    'Modern dùng more trong so sánh hơn; cinema là rạp chiếu phim.',
  ],
  [
    'This sofa is more comfortable than that wooden chair.',
    'Dùng more + comfortable + than.',
  ],
  [
    'The library is quieter than the playground.',
    'Quiet đổi thành quieter trong so sánh hơn.',
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
    'Học tên địa điểm trong khu phố và cách dùng tính từ so sánh hơn.',
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
