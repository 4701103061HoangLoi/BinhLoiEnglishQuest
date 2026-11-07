import type {
  GrammarLesson,
  QuizQuestion,
  SentenceQuestion,
  Topic,
  VocabularyItem,
} from '../types';

function vocabulary(folder: string, rows: string[][]): VocabularyItem[] {
  return rows.map(([id, term, meaningVi, exampleEn, exampleVi]) => ({
    id,
    term,
    meaningVi,
    exampleEn,
    exampleVi,
    partOfSpeech: ['kind', 'friendly', 'creative', 'confident'].includes(id)
      ? 'adj.'
      : 'n.',
    imagePath: `/images/${folder}/${id}.svg`,
    imageAlt: `Minh họa ${meaningVi}`,
  }));
}
function grammar(rows: string[][]): GrammarLesson[] {
  return rows.map(([id, title, rule, example, note]) => ({
    id,
    title,
    rule,
    example,
    note,
  }));
}
function quiz(rows: string[][]): QuizQuestion[] {
  return rows.map(([prompt, a, b, c, explanationVi], i) => ({
    id: `q${i + 1}`,
    prompt,
    explanationVi,
    options: [a, b, c].map((text, j) => ({ id: `q${i + 1}-${j}`, text })),
    correctOptionId: `q${i + 1}-1`,
  }));
}
function sentences(rows: string[][]): SentenceQuestion[] {
  return rows.map(([correctSentence, explanationVi], i) => ({
    id: `s${i + 1}`,
    correctSentence,
    explanationVi,
    tokens: correctSentence
      .replace(/[.?]$/, '')
      .split(' ')
      .map((text, j) => ({ id: `s${i + 1}-t${j}`, text })),
  }));
}

export const newSchool: Topic = {
  id: 'my-new-school',
  titleEn: 'My New School',
  titleVi: 'Trường mới của em',
  grade: 6,
  unit: 1,
  descriptionVi:
    'Khám phá đồ dùng và không gian trường học; luyện hiện tại đơn và trạng từ tần suất.',
  imagePath: '/images/my-new-school-map.svg',
  imageAlt: 'Minh họa trường mới của em',
  grammarTitle: 'Present simple & frequency adverbs',
  grammarDescriptionVi:
    'Hiện tại đơn và trạng từ tần suất — kể về lịch học và thói quen của em.',
  grammarExample: 'She usually walks to school.',
  grammarExampleVi: 'Bạn ấy thường đi bộ đến trường.',
  grammarCautionVi:
    'Sau does hoặc does not, dùng động từ nguyên mẫu: Does she like English? Không dùng Does she likes English?',
  vocabulary: vocabulary('my-new-school', [
    [
      'school-bag',
      'school bag',
      'cặp sách',
      'My school bag is blue.',
      'Cặp sách của tôi màu xanh.',
    ],
    [
      'notebook',
      'notebook',
      'vở ghi',
      'I write new words in my notebook.',
      'Tôi viết từ mới vào vở ghi.',
    ],
    [
      'pencil',
      'pencil',
      'bút chì',
      'This pencil is long.',
      'Chiếc bút chì này dài.',
    ],
    [
      'ruler',
      'ruler',
      'thước kẻ',
      'I use a ruler to draw lines.',
      'Tôi dùng thước kẻ để vẽ đường thẳng.',
    ],
    [
      'calculator',
      'calculator',
      'máy tính cầm tay',
      'We use a calculator in maths lessons.',
      'Chúng tôi dùng máy tính cầm tay trong giờ toán.',
    ],
    [
      'classroom',
      'classroom',
      'phòng học',
      'Our classroom has two doors.',
      'Phòng học của chúng tôi có hai cửa.',
    ],
    [
      'library',
      'library',
      'thư viện',
      'I read books in the library.',
      'Tôi đọc sách trong thư viện.',
    ],
    [
      'playground',
      'playground',
      'sân chơi',
      'We play in the playground.',
      'Chúng tôi chơi ở sân chơi.',
    ],
    [
      'uniform',
      'uniform',
      'đồng phục',
      'We wear a uniform at school.',
      'Chúng tôi mặc đồng phục ở trường.',
    ],
  ]),
  grammar: grammar([
    [
      'positive',
      'Hiện tại đơn: khẳng định',
      'I/You/We/They + động từ; He/She/It + động từ thêm -s/-es.',
      'I study English. She studies English.',
      'Với phụ âm + y, đổi y thành ies: study → studies.',
    ],
    [
      'negative',
      'Hiện tại đơn: phủ định',
      'I/You/We/They + do not; He/She/It + does not + động từ nguyên mẫu.',
      'He does not play football.',
      'Sau does not, không thêm -s vào động từ.',
    ],
    [
      'questions',
      'Câu hỏi hiện tại đơn',
      'Do/Does + chủ ngữ + động từ nguyên mẫu?',
      'Does she walk to school? Yes, she does.',
      'Dùng does với he, she và it.',
    ],
    [
      'frequency',
      'Trạng từ tần suất',
      'always, usually, often, sometimes, never thường đứng trước động từ thường.',
      'We often read in the library.',
      'Trạng từ tần suất thường đứng sau be: She is always on time.',
    ],
    [
      'routine',
      'Thói quen hằng ngày',
      'Dùng hiện tại đơn để nói về thói quen và sự việc lặp lại.',
      'We go to school every morning.',
      'Các dấu hiệu thường gặp: every day, on Mondays, usually.',
    ],
  ]),
  quiz: quiz([
    [
      'She ____ to school every day.',
      'go',
      'goes',
      'going',
      'She là ngôi thứ ba số ít: go thêm -es thành goes.',
    ],
    [
      'We ____ football after school.',
      'plays',
      'play',
      'playing',
      'We đi với động từ nguyên mẫu trong hiện tại đơn.',
    ],
    [
      'He does not ____ a calculator today.',
      'uses',
      'use',
      'using',
      'Sau does not dùng động từ nguyên mẫu use.',
    ],
    [
      '____ your sister like English?',
      'Do',
      'Does',
      'Is',
      'Dùng Does với your sister; like giữ nguyên mẫu.',
    ],
    [
      'Choose the correct sentence.',
      'We read often books.',
      'We often read books.',
      'We reading often books.',
      'Often đứng trước động từ thường read.',
    ],
  ]),
  sentences: sentences([
    [
      'She goes to school every day.',
      'She + goes; every day chỉ thói quen hằng ngày.',
    ],
    ['We often read in the library.', 'Often đứng trước động từ thường read.'],
    ['He does not play football.', 'Sau does not dùng play, không dùng plays.'],
    [
      'Do you like your new school?',
      'Câu hỏi hiện tại đơn: Do + you + động từ nguyên mẫu.',
    ],
    [
      'My sister studies English on Mondays.',
      'My sister là số ít; study → studies.',
    ],
  ]),
};

export const house: Topic = {
  id: 'my-house',
  titleEn: 'My House',
  titleVi: 'Ngôi nhà của em',
  grade: 6,
  unit: 2,
  descriptionVi:
    'Gọi tên đồ vật trong nhà; dùng sở hữu cách và giới từ để mô tả vị trí.',
  imagePath: '/images/my-house-map.svg',
  imageAlt: 'Minh họa ngôi nhà của em',
  grammarTitle: 'Possessive case & prepositions of place',
  grammarDescriptionVi:
    'Sở hữu cách và giới từ vị trí — nói đồ vật thuộc về ai và nằm ở đâu.',
  grammarExample: 'The lamp is on Lan’s desk.',
  grammarExampleVi: 'Chiếc đèn ở trên bàn học của Lan.',
  grammarCautionVi:
    'Phân biệt in (trong), on (trên bề mặt) và under (dưới). Viết Lan’s desk để chỉ bàn của Lan; không viết Lan desk.',
  vocabulary: vocabulary('my-house', [
    [
      'bed',
      'bed',
      'giường',
      'The bed is next to the window.',
      'Chiếc giường ở cạnh cửa sổ.',
    ],
    [
      'sofa',
      'sofa',
      'ghế sô pha',
      'The sofa is in the living room.',
      'Ghế sô pha ở trong phòng khách.',
    ],
    [
      'table',
      'table',
      'bàn',
      'The books are on the table.',
      'Những quyển sách ở trên bàn.',
    ],
    [
      'chair',
      'chair',
      'ghế',
      'The chair is behind the table.',
      'Chiếc ghế ở phía sau bàn.',
    ],
    [
      'lamp',
      'lamp',
      'đèn',
      'The lamp is on my desk.',
      'Chiếc đèn ở trên bàn học của tôi.',
    ],
    [
      'kitchen',
      'kitchen',
      'nhà bếp',
      'My mother is in the kitchen.',
      'Mẹ tôi đang ở trong bếp.',
    ],
    [
      'bedroom',
      'bedroom',
      'phòng ngủ',
      'My bedroom is small.',
      'Phòng ngủ của tôi nhỏ.',
    ],
    [
      'bathroom',
      'bathroom',
      'phòng tắm',
      'The bathroom is upstairs.',
      'Phòng tắm ở tầng trên.',
    ],
    [
      'wardrobe',
      'wardrobe',
      'tủ quần áo',
      'My clothes are in the wardrobe.',
      'Quần áo của tôi ở trong tủ.',
    ],
  ]),
  grammar: grammar([
    [
      'possession',
      'Sở hữu cách',
      'Thêm apostrophe + s vào tên hoặc danh từ số ít để chỉ sự sở hữu.',
      'This is Lan’s bedroom.',
      'Lan’s bedroom nghĩa là phòng ngủ của Lan.',
    ],
    [
      'plural-owner',
      'Sở hữu với danh từ số nhiều',
      'Danh từ số nhiều đã tận cùng bằng s chỉ thêm dấu apostrophe.',
      'This is my parents’ room.',
      'parents’ room là phòng của bố mẹ; không thêm một chữ s nữa.',
    ],
    [
      'in-on-under',
      'Trong, trên và dưới',
      'in: ở trong; on: ở trên bề mặt; under: ở dưới.',
      'The cat is under the table.',
      'Dùng on khi vật tiếp xúc với bề mặt: on the desk.',
    ],
    [
      'next-behind',
      'Bên cạnh và phía sau',
      'next to: bên cạnh; behind: phía sau; in front of: phía trước.',
      'The sofa is next to the lamp.',
      'in front of diễn tả vị trí phía trước một vật khác.',
    ],
    [
      'between',
      'Ở giữa hai vật',
      'between + vật thứ nhất + and + vật thứ hai.',
      'The chair is between the bed and the desk.',
      'Không bỏ and khi nêu hai vật ở hai bên.',
    ],
  ]),
  quiz: quiz([
    [
      'This is ____ room. It belongs to Lan.',
      'Lan',
      'Lan’s',
      'Lans',
      'Sở hữu cách với tên người: Lan + ’s → Lan’s room.',
    ],
    [
      'The books are ____ the table, touching its top.',
      'under',
      'on',
      'behind',
      'On nghĩa là trên bề mặt, có tiếp xúc với mặt bàn.',
    ],
    [
      'The cat is ____ the box. You cannot see it inside the closed box.',
      'on',
      'in',
      'next to',
      'In diễn tả ở bên trong chiếc hộp.',
    ],
    [
      'The chair is between the bed ____ the desk.',
      'or',
      'and',
      'to',
      'Dùng cấu trúc between ... and ... để nói ở giữa hai vật.',
    ],
    [
      'Choose the phrase meaning “phòng của bố mẹ tôi”.',
      'my parent room',
      'my parents’ room',
      'my parents’s room',
      'Parents là danh từ số nhiều tận cùng bằng s nên chỉ thêm dấu ’.',
    ],
  ]),
  sentences: sentences([
    ['The cat is under the table.', 'Under nghĩa là ở dưới.'],
    [
      'The books are on the desk.',
      'Books là số nhiều nên dùng are; on là trên bề mặt.',
    ],
    ['The sofa is next to the lamp.', 'Next to nghĩa là bên cạnh.'],
    [
      'The chair is between the bed and the desk.',
      'Between ... and ... nghĩa là ở giữa hai vật.',
    ],
    ['This is Lan’s bedroom.', 'Lan’s là sở hữu cách: phòng ngủ của Lan.'],
  ]),
};

export const friends: Topic = {
  id: 'my-friends',
  titleEn: 'My Friends',
  titleVi: 'Bạn bè của em',
  grade: 6,
  unit: 3,
  descriptionVi:
    'Học từ mô tả ngoại hình và tính cách; dùng hiện tại tiếp diễn để kể bạn bè đang làm gì.',
  imagePath: '/images/my-friends-map.svg',
  imageAlt: 'Minh họa bạn bè của em',
  grammarTitle: 'Present continuous',
  grammarDescriptionVi:
    'Hiện tại tiếp diễn — mô tả những hoạt động đang diễn ra quanh em.',
  grammarExample: 'My friends are playing football now.',
  grammarExampleVi: 'Các bạn của tôi đang chơi bóng đá.',
  grammarCautionVi:
    'Không bỏ am/is/are: She is reading, không viết She reading. Sau is not dùng reading, không dùng read.',
  vocabulary: vocabulary('my-friends', [
    ['hair', 'hair', 'tóc', 'She has long hair.', 'Bạn ấy có mái tóc dài.'],
    ['eyes', 'eyes', 'đôi mắt', 'He has brown eyes.', 'Bạn ấy có đôi mắt nâu.'],
    [
      'nose',
      'nose',
      'mũi',
      'She has a small nose.',
      'Bạn ấy có chiếc mũi nhỏ.',
    ],
    [
      'mouth',
      'mouth',
      'miệng',
      'He has a wide mouth.',
      'Bạn ấy có khuôn miệng rộng.',
    ],
    [
      'ears',
      'ears',
      'đôi tai',
      'We listen with our ears.',
      'Chúng ta nghe bằng tai.',
    ],
    [
      'kind',
      'kind',
      'tốt bụng',
      'My friend is kind and helps me.',
      'Bạn tôi tốt bụng và giúp đỡ tôi.',
    ],
    [
      'friendly',
      'friendly',
      'thân thiện',
      'Our new classmate is friendly.',
      'Bạn cùng lớp mới của chúng tôi thân thiện.',
    ],
    [
      'creative',
      'creative',
      'sáng tạo',
      'Mai is creative and draws beautiful pictures.',
      'Mai sáng tạo và vẽ những bức tranh đẹp.',
    ],
    [
      'confident',
      'confident',
      'tự tin',
      'Nam is confident when he speaks English.',
      'Nam tự tin khi nói tiếng Anh.',
    ],
  ]),
  grammar: grammar([
    [
      'positive',
      'Hiện tại tiếp diễn: khẳng định',
      'Chủ ngữ + am/is/are + động từ thêm -ing.',
      'She is reading a book now.',
      'Dùng am với I; is với he/she/it; are với you/we/they.',
    ],
    [
      'negative',
      'Hiện tại tiếp diễn: phủ định',
      'Chủ ngữ + am/is/are + not + động từ thêm -ing.',
      'They are not playing football.',
      'Đặt not sau am, is hoặc are.',
    ],
    [
      'questions',
      'Câu hỏi hiện tại tiếp diễn',
      'Am/Is/Are + chủ ngữ + động từ thêm -ing?',
      'Is he drawing? Yes, he is.',
      'Đảo am/is/are lên trước chủ ngữ.',
    ],
    [
      'spelling',
      'Cách thêm -ing',
      'Thông thường thêm -ing; bỏ e câm; một số từ gấp đôi phụ âm cuối.',
      'read → reading; write → writing; run → running',
      'Không viết writeing hoặc runing.',
    ],
    [
      'now',
      'Hoạt động đang diễn ra',
      'Dùng hiện tại tiếp diễn cho hoạt động đang xảy ra lúc nói.',
      'Look! My friends are dancing.',
      'Dấu hiệu thường gặp: now, at the moment, Look!, Listen!',
    ],
  ]),
  quiz: quiz([
    [
      'Look! Mai ____ a picture.',
      'draws',
      'is drawing',
      'draw',
      'Look! chỉ hoạt động đang diễn ra: is + drawing.',
    ],
    [
      'They ____ football now.',
      'plays',
      'are playing',
      'is playing',
      'They đi với are + động từ thêm -ing.',
    ],
    [
      'I ____ a book at the moment.',
      'is reading',
      'am reading',
      'read',
      'I đi với am; at the moment chỉ hành động đang diễn ra.',
    ],
    [
      'Choose the correct negative sentence.',
      'He not is running.',
      'He is not running.',
      'He does not running.',
      'Đặt not sau is trong hiện tại tiếp diễn.',
    ],
    [
      '____ she writing an email now?',
      'Does',
      'Is',
      'Are',
      'She đi với is; câu hỏi đảo Is lên đầu.',
    ],
  ]),
  sentences: sentences([
    ['She is reading a book now.', 'She + is + reading: cô ấy đang đọc sách.'],
    [
      'They are playing football now.',
      'They + are + playing: họ đang chơi bóng đá.',
    ],
    [
      'I am writing an email.',
      'I + am + writing; bỏ e của write trước khi thêm -ing.',
    ],
    [
      'He is not running at the moment.',
      'Phủ định: is not + running; run gấp đôi n.',
    ],
    [
      'Are your friends drawing pictures?',
      'Câu hỏi: Are + chủ ngữ số nhiều + drawing?',
    ],
  ]),
};
