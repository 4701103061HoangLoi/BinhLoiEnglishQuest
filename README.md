# Bình Lợi English Quest

Website học tiếng Anh lớp 6 qua bốn chủ đề, bài học Vocabulary/Grammar và ba game thật. Không đăng nhập, không backend, không API key. Nội dung theo `BINH_LOI_ENGLISH_QUEST_PRD.md`.

## Chạy dự án

Node.js **20.19+** hoặc **22.12+**; môi trường triển khai đã dùng Node 20.20.2. Cài phiên bản thư viện khóa trong `package-lock.json` bằng `npm ci` cho các lần tiếp theo.

```sh
npm install
npm run dev       # http://localhost:5173
npm run test      # Vitest + React Testing Library
npm run build     # kiểm tra TypeScript strict, tạo dist/
npm run preview   # xem bản production tại http://localhost:4173
```

Stack: React, React Router, TypeScript strict, Vite; CSS riêng và biểu tượng lucide-react. Test: Vitest, Testing Library, jsdom. Không Tailwind. Toàn bộ SVG và dữ liệu được đóng gói cục bộ; không tải font/ảnh từ dịch vụ ngoài.

## Các trang và cách chơi

- `/`: giới thiệu bốn chủ đề đang hoạt động; chọn chủ đề để mở một hành trình học–chơi thống nhất. Nút Chơi thử ngay mở `/demo`: một câu chọn từ theo hình ngẫu nhiên từ cả 9 từ vựng của Unit 1, xáo trộn ba lựa chọn, không đồng hồ và không lưu điểm; chọn sai được thử lại, chọn đúng có nút bắt đầu Unit 1.
- `/challenges`: tab Thử thách riêng cho Word Match, Quick Quiz và Sentence Builder; chọn một trong bốn chủ đề. Nút quay lại của game giữ đúng chủ đề trong tab.
- `/topics`, `/topics/my-neighbourhood`: chọn chủ đề, theo dõi bài đã học và game đã hoàn thành.
- `/topics/my-neighbourhood/vocabulary`: 9 thẻ từ, minh họa, ví dụ và đọc từ `en-US` khi bấm loa.
- `/topics/my-neighbourhood/grammar`: 6 quy tắc so sánh hơn, ví dụ và lỗi dễ nhầm.
- `/play/my-neighbourhood/word-match`: chọn từ rồi chọn ảnh; 5 cặp địa điểm, sai trừ 5 điểm.
- `/play/my-neighbourhood/quick-quiz`: 5 câu, đúng +10, giải thích sau mỗi đáp án.
- `/play/my-neighbourhood/sentence-builder`: chạm từ để thêm/bỏ, dùng đủ từ rồi kiểm tra; token trùng có ID riêng.
- `/results/:runId`: điểm cơ bản/bonus, câu đúng/sai/chưa trả lời, thời gian và giải thích.
- `/achievements`: 5 huy hiệu, kỷ lục trong 30 lượt gần nhất; lịch sử kết hợp lọc chủ đề và game, hiển thị tối đa 5 lượt phù hợp. Có số lượt khớp và nút xóa bộ lọc khi không có kết quả; bộ lọc không thay đổi dữ liệu đã lưu.
- `/settings`: biệt danh tùy chọn, âm thanh, giảm chuyển động, xóa tiến độ có xác nhận.
- Đường dẫn lạ hoặc dữ liệu game không hợp lệ hiển thị thông báo và đường quay lại.

Thử thách: Word Match/Quiz 90s, Sentence Builder 150s. Bonus chỉ khi hoàn thành trước hạn: `min(10, floor(remainingSeconds/15))`. Điểm tối đa 60; đồng hồ tiếp tục khi chuyển tab. Luyện tập không giới hạn giờ, không ghi kỷ lục/huy hiệu, vẫn lưu lịch sử. Chưa trả lời khi hết giờ không bị tính là đã trả lời sai.

Phát âm luôn cần thao tác người dùng, không tự phát khi chuyển thẻ. Nút “Bật âm & nghe” bật lại phát âm cho phiên học; nút tắt trong Cài đặt hủy lời đọc đang phát. Giọng Web Speech phụ thuộc thiết bị, có thể cần tải giọng English trong hệ điều hành. Ứng dụng không ghi âm.

## Cấu trúc và mở rộng nội dung

- `src/data/neighbourhood.ts`: topic, 9 từ, bài giảng, quiz và câu xếp từ.
- `src/types.ts`: kiểu dữ liệu dùng chung.
- `src/lib/gameLogic.ts`: shuffle theo seed, chấm điểm, so khớp câu, huy hiệu và đồng hồ; hàm thuần.
- `src/games/useGame.ts`: trạng thái lượt chơi, chặn nộp hai lần, kết thúc và timeout.
- `src/lib/storage.ts`, `src/contexts/ProgressContext.tsx`: kiểm tra schema, đọc/ghi an toàn.
- `src/pages`, `src/components`, `src/styles`: giao diện, routes, CSS responsive.
- `public/images/neighbourhood/`: 9 SVG riêng; `neighbourhood-map.svg`: bản đồ trang chủ.
- `tests/*.test.ts(x)`: logic, persistence, game interactions, routes, xác nhận thoát/xóa.

Để thêm chủ đề: tạo dữ liệu theo `Topic`, thêm vào mảng `topics`, cung cấp ít nhất 5 từ có hình, 5 câu quiz, 5 câu xếp từ và bài giảng. Cấp ID ổn định, duy nhất; `correctOptionId` trỏ đến một option thực. Mỗi token có ID riêng ngay cả khi chữ lặp. Hình lưu dưới `public/images/<topic>/`. Chạy `validateTopic` và thêm test cho nội dung mới. Các route học/game dùng topic ID tự động; khai báo hình và thông tin bài học riêng trong Topic. Word Match chọn ngẫu nhiên 5 từ, chọn 5 câu ngẫu nhiên cho hai game còn lại.

Sửa câu hỏi trong data, không hardcode đáp án vào UI. Test xác nhận shuffle giữ đúng ID, câu/token không thiếu, scoring/timeout/nhấp đúp, schema hỏng, quota và giới hạn lưu. Không đặt mục tiêu coverage giả; bổ sung test cho luật hoặc nhánh hành vi mới.

## Ba chủ đề mới

Chọn tại `/topics`; mỗi chủ đề có 9 từ kèm SVG cục bộ, 5 quy tắc ngữ pháp, 20 câu Quick Quiz và 20 câu Sentence Builder. Mỗi lượt Word Match chọn ngẫu nhiên 5 trong 9 từ. Cả chế độ luyện tập/thử thách, điểm, huy hiệu và lưu tiến độ đều dùng chung hệ thống hiện có.

| Chủ đề                 | Đường dẫn               | Ngữ pháp                          |
| ---------------------- | ----------------------- | --------------------------------- |
| My New School · Unit 1 | `/topics/my-new-school` | Hiện tại đơn và trạng từ tần suất |
| My House · Unit 2      | `/topics/my-house`      | Sở hữu cách và giới từ vị trí     |
| My Friends · Unit 3    | `/topics/my-friends`    | Hiện tại tiếp diễn                |

Ảnh đại diện chủ đề dùng SVG bản đồ cục bộ: `public/images/my-new-school-map.svg`, `my-house-map.svg`, `my-friends-map.svg`, đồng bộ phong cách với Neighbourhood.

Nội dung mới nằm trong `src/data/firstUnits.ts`; đăng ký chủ đề trong `topics` tại `src/data/neighbourhood.ts`. `Topic` có tiêu đề, mô tả, ví dụ, lưu ý ngữ pháp và hình riêng; các trang đọc trực tiếp các trường này. Khi thêm chủ đề, cung cấp đủ các trường theo `src/types.ts` và SVG cục bộ. Bài học và trò chơi của My Neighbourhood vẫn giữ nguyên, dữ liệu schema v1 không cần chuyển đổi. Các ID từ/bài được lưu kèm topic ID nên tiến độ không lẫn giữa các chủ đề.

`tests/e2e/topics.spec.ts` kiểm tra cả 9 lượt chơi mới, học từ/ngữ pháp, tải lại kết quả, lọc thành tích và tách biệt tiến độ.

## Lưu trữ và riêng tư

Khóa `bleq_progress_v1`, schema version 1: biệt danh, cài đặt, từ/bài đã xem, 30 lượt gần nhất, huy hiệu. Badge được giữ khi lịch sử cũ bị giới hạn. Kỷ lục là giá trị suy ra từ lịch sử đang lưu, không phải kỷ lục toàn thời gian hoặc toàn trường. Mỗi run ID chỉ được ghi một lần. Lượt đang chơi không phục hồi sau refresh; trình duyệt cảnh báo trước khi rời. Hủy xóa không thay đổi dữ liệu; xác nhận xóa chỉ xóa khóa của ứng dụng.

Storage bị chặn/đầy: vẫn chơi trong bộ nhớ và có cảnh báo. JSON hỏng hoặc version lạ: không ghi đè dữ liệu cũ; có thể đặt lại chủ động qua Cài đặt. Trình duyệt riêng tư/xóa cache có thể làm mất tiến độ. Không thu thập thông tin cá nhân, không analytics hay đồng bộ máy khác.

## Deploy static

`npm run build`, đưa `dist/` lên hosting. Netlify: build command `npm run build`, publish `dist`; `public/_redirects` đã cấu hình fallback SPA. Vercel: Vite preset, output `dist`; `vercel.json` có rewrite cho route. Hosting khác phải rewrite URL không phải file về `index.html` để refresh `/play/...` hoạt động. Cấu hình hiện tại phục vụ tại domain root; subpath cần chỉnh Vite `base`, router basename và đường dẫn asset.

Nội dung/game không gọi network sau khi tải JavaScript và SVG; không cam kết PWA/offline reload. Không triển khai Speaking, Listening, AI, Supabase, đăng nhập hay bảng xếp hạng từ xa.

## Kiểm tra demo

Chạy test/build, mở preview ở 360/390/768/1024/1440px. Học từ → Word Match → kết quả; Grammar → Quiz → Sentence Builder; refresh thành tích. Kiểm tra timeout, Tab/Enter, hủy thoát, hủy/xác nhận xóa. Kiểm tra Web Speech và cảm ứng trực tiếp trên iPhone trước buổi trình diễn vì giả lập desktop không kiểm chứng được giọng đọc iOS.

### Kiểm thử trình duyệt tự động

```sh
npx playwright install chromium  # một lần, khi máy chưa có browser Playwright
npm run test:e2e                 # tự mở Vite, chạy Chromium headless
# Hoặc dùng Chromium đã cài sẵn:
CHROMIUM_PATH=/duong/dan/chromium npm run test:e2e
npm run format                  # Prettier, 2 spaces, single quotes
```

E2E chơi đủ ba game, refresh kết quả/huy hiệu, xác nhận thoát, kiểm tra routes ở 360/390/768/1024/1440px, token bằng touch, trả lời bằng bàn phím và timeout thật trên browser. Ảnh kiểm tra được ghi vào `.impeccable/review/` (gitignored). Không thay thế kiểm tra trên iPhone thật.

## Quest: hành trình ba chìa khóa

Từ trang chủ hoặc trang chi tiết của mỗi chủ đề, chọn **Bắt đầu hành trình** (`/quest/:topicId`). Bốn chủ đề đều có câu chuyện và rương kho báu riêng:

1. **Săn tìm dấu vết:** học ba từ đầu ngay trong Quest, rồi tìm đúng ba hình và cất vào túi đồ.
2. **Cặp thẻ bí mật:** học sáu từ còn lại, rồi lật và ghi nhớ sáu thẻ để ghép ba cặp từ–hình. Word Match nằm trong mục Luyện thêm của chặng này.
3. **Giải mật thư:** học bài ngữ pháp, đánh dấu đã xem rồi xếp câu để lấy chìa khóa cuối. Quick Quiz và Sentence Builder nằm trong mục Luyện thêm của chặng này.

Mỗi chặng nhận một chìa khóa, đủ ba chìa mới mở rương. Không giới hạn giờ; Quest dùng chạm và Tab/Enter, không yêu cầu kéo thả. Hoàn thành được ghi vào `completedQuestIds` (trường tùy chọn tương thích dữ liệu v1 cũ), hiển thị tại Thành tích. Chơi lại không ghi trùng dấu mốc. Quest không cộng vào bảng điểm của ba game cũ. Xóa tiến độ trong Cài đặt cũng xóa dấu mốc Quest.

Chìa khóa được lưu sau từng chặng trong `questCheckpoints` (trường tùy chọn, giá trị 0–3; đọc được dữ liệu v1 cũ). Khi tải lại hoặc đi luyện thêm, Quest trở về đúng chặng đã mở. Chỉ nhiệm vụ đang làm dở bắt đầu lại; bài đã học, chìa khóa, điểm và huy hiệu vẫn giữ nguyên. Lượt chơi luyện thêm dùng `?quest=1`; nút quay lại và trang kết quả đưa về Quest. Luyện thêm không bắt buộc để nhận chìa khóa. Dấu mốc hoàn thành toàn bộ vẫn ghi khi mở rương. Các chủ đề đã hoàn thành trước đây được nhận đủ ba chìa, không bắt học lại; Chơi lại chỉ đặt lại chặng, giữ thành tích cũ. Khi storage bị chặn/đầy, ứng dụng vẫn chơi được và dùng cảnh báo lưu trữ chung của website.

Trang chủ và trang chủ đề dùng chung `JourneyOverview`; không còn tách Quest và Học trước/Thử sức thành hai nhánh. Hai trang bài học cũ vẫn dùng được và có nút trở về hành trình; nội dung bài học và tiến độ dùng chung với Quest.

Câu chuyện: `src/data/quests.ts`. Luật ghép thẻ: `src/lib/questLogic.ts`; học liệu lấy từ topic hiện có (ba từ đã học ở chặng đầu để tìm hình theo thứ tự ngẫu nhiên, ba từ chọn ngẫu nhiên trong sáu từ còn lại để ghép thẻ, và một câu ngẫu nhiên trong 20 câu xếp từ để làm mật thư). Khi thêm chủ đề, thêm câu chuyện có cùng topic ID để mở Quest. Kiểm thử: `tests/quest.test.ts`, `tests/e2e/adventure.spec.ts`.

## Nhân vật đồng hành Mây

Mây xuất hiện trong Quest, ba game và phần chơi thử. Nhân vật đổi nét mặt và cử chỉ theo phản hồi: sẵn sàng, cổ vũ khi đúng, cùng suy nghĩ khi sai, ăn mừng khi nhận chìa khóa hoặc mở rương. Chạm nhân vật hoặc dùng Tab/Enter để mở/đóng lời nhắc cách chơi. Mây không tự phát âm thanh và không thay đổi cách tính điểm. Chuyển động ngắn tôn trọng cả `prefers-reduced-motion` lẫn tùy chọn Giảm chuyển động trong Cài đặt.

Nhân vật là SVG cục bộ trong `src/components/QuestGuide.tsx`; CSS tại `src/styles/guide.css`. Lời thoại lấy từ trạng thái trả lời hiện có. Kiểm thử bàn phím, biểu cảm, phản hồi và giảm chuyển động nằm trong `tests/guide.test.tsx`, `tests/e2e/guide.spec.ts`.

## Xáo trộn câu hỏi và đáp án

Ba game dùng seed mới mỗi lượt: thứ tự câu hỏi, lựa chọn quiz, thẻ ghép và mảnh từ đều được xáo trộn. Quest cũng xáo trộn vị trí hình săn tìm, bộ thẻ ghi nhớ và mảnh từ mỗi lần bắt đầu nhiệm vụ. Vị trí giữ nguyên trong lúc trả lời, mở gợi ý hoặc thử sai để không làm gián đoạn việc ghi nhớ.

Chơi thử lấy ngẫu nhiên một trong 9 từ vựng của Unit 1, kèm hai lựa chọn nhiễu và vị trí đáp án ngẫu nhiên. Bấm Thử lại tạo câu mới khác câu vừa làm. Mở trang lần mới là một lần chọn ngẫu nhiên độc lập nên vẫn có thể gặp lại câu cũ. Cách chấm điểm, dữ liệu đã học và chìa khóa không thay đổi. Kiểm thử quy tắc nằm trong `tests/randomization.test.ts`.

## Âm báo câu trả lời và phát âm

Trả lời đúng phát giai điệu chúc mừng ngắn; trả lời sai phát hai nốt nhắc nhẹ. Có trong ba game, chơi thử, săn dấu vết, ghép thẻ Quest (sau khi lật đủ hai thẻ), giải mật thư và khi mở rương. Âm tạo cục bộ bằng Web Audio, không tải tệp nhạc ngoài. Không phát lúc tải trang, chọn từ đơn lẻ hay lật thẻ đầu tiên. Nút Âm thanh trong màn chơi và mục Âm thanh trò chơi và phát âm trong Cài đặt dùng chung thiết lập lưu trên thiết bị. Người mới mặc định bật; thiết lập tắt đã lưu trước đây được tôn trọng. Tắt âm sẽ dừng nhạc hiệu và lượt đọc đang phát.

Nút phát âm có thể bấm lại để đọc từ từ đầu: lượt cũ được hủy, thông báo hủy/ngắt không được xem là lỗi. Callback từ lượt cũ hoặc từ trước đó không thể ghi đè trạng thái lượt mới; lỗi thật vẫn được thông báo và xóa khi thử lại. API âm thanh bị chặn hoặc không hỗ trợ không ảnh hưởng việc trả lời, tính điểm hay lưu tiến độ. Cần thử nghe trên thiết bị thật, đặc biệt iOS và thiết bị chưa cài giọng English.

Nhạc hiệu: `src/lib/feedbackAudio.ts`; kiểm thử `tests/audio.test.ts`, `tests/e2e/audio.spec.ts`. Phát âm: `SpeechButton` trong `src/components/Common.tsx`; kiểm thử hồi quy bấm liên tiếp và chuyển từ tại `tests/speech.test.tsx`.

## Tab Thử thách và chuyển từ vựng

Thanh điều hướng có tab **Thử thách** (`/challenges`). Chọn chủ đề để chơi Word Match, Quick Quiz và Sentence Builder; có thể mở trực tiếp, không cần bắt đầu Quest. Từ Quest, nút Đến trang Thử thách truyền chủ đề và ngữ cảnh hành trình, giữ nguyên chìa khóa khi chuyển trang. Trang Thử thách có nút quay lại hành trình; trang kết quả có cả Tiếp tục hành trình và Chọn thử thách khác. Bấm quay lại từ game mở trong tab đưa về đúng chủ đề đã chọn.

Trong Quest, phần bài học không tự thu lại khi vừa xem thẻ cuối. Học sinh có thể nghe hoặc xem lại thẻ cuối; câu hỏi chỉ xuất hiện sau khi bấm **Vào nhiệm vụ**. Tự thu phần học hoặc xem đủ từ không mở câu hỏi. Khi quay lại chặng đã học, vẫn cần bấm nút này để bắt đầu nhiệm vụ. Việc chuyển từ trong lúc phát âm vẫn hủy lượt đọc trước an toàn. Kiểm thử tại `tests/speech.test.tsx`, `tests/e2e/challenges.spec.ts` và `tests/e2e/adventure.spec.ts`.

## Câu chữ giao diện

Dùng tiếng Việt ngắn, cụ thể cho hướng dẫn và phản hồi; giữ tên trò chơi, từ vựng, câu mẫu và đáp án bằng tiếng Anh. Lời thoại Mây tập trung vào việc cần làm tiếp theo, giữ giọng thân thiện với học sinh. Các trang dùng nhất quán “hành trình”, “chặng”, “Thử thách” và “Thành tích”. Khi đổi nhãn nút, cập nhật kiểm thử tương tác theo cùng nhãn.

## Bộ câu hỏi mở rộng

Mỗi chủ đề có **20 câu Quick Quiz và 20 câu Sentence Builder**: tổng cộng 160 câu cho bốn chủ đề. Nội dung nằm trực tiếp trong `src/data/firstUnits.ts` và `src/data/neighbourhood.ts`, kèm đáp án và giải thích tiếng Việt. Câu mới được thêm sau các câu cũ để giữ nguyên ID và không ảnh hưởng lịch sử đã lưu.

Mỗi lượt chơi chọn 5 câu khác nhau bằng seed mới; trộn thứ tự câu hỏi, đáp án và mảnh từ. Word Match lấy 5 từ khác nhau từ cả 9 từ của chủ đề. Quest chọn ngẫu nhiên một mật thư từ 20 câu và 3 cặp thẻ từ nhóm đã học; câu được giữ nguyên khi đang trả lời. Chơi thử dùng cả 9 từ Unit 1. Các lượt độc lập vẫn có thể gặp lại một số câu cũ.

Bổ sung câu hỏi bằng cách thêm hàng vào mảng quiz/sentences trong topic; không đổi thứ tự hoặc ID câu đã có. Với dữ liệu mới, kiểm tra một đáp án rõ ràng, không trùng câu, đủ token và giải thích. `tests/questionBank.test.ts` kiểm tra nội dung, khả năng lấy mẫu toàn bộ bộ câu hỏi qua nhiều seed, không trùng câu trong lượt và không làm đổi dữ liệu nguồn.

## Hiệu ứng xếp câu

Trong Sentence Builder và mật thư Quest, từ bay từ kho lên vị trí trong câu khi chọn, rồi bay xuống đúng ô cũ khi bỏ chọn. Làm lại câu/Xếp lại đưa toàn bộ từ đang chọn về kho. Chuyển động kéo dài 280 ms và không trì hoãn việc cập nhật đáp án; dùng được bằng chạm và bàn phím. Khi bật Giảm chuyển động trong Cài đặt hoặc hệ điều hành, từ chuyển vị trí ngay. Trình duyệt không hỗ trợ Web Animations vẫn thao tác bình thường. Hiệu ứng đang chạy được hủy khi chuyển câu hoặc rời màn chơi.

Hook dùng chung: `src/games/useTokenFlight.ts`. Kiểm thử thao tác chọn/bỏ nhanh, đặt lại câu và hai tùy chọn giảm chuyển động: `tests/e2e/token-flight.spec.ts`.

## Trang trí và nhạc nền

Trang chủ có chi tiết mây, la bàn và các thẻ chủ đề dạng bản đồ; đường nét đứt nối ba chặng học. Hiệu ứng di chuyển thẻ khi trỏ/chọn tôn trọng Giảm chuyển động của thiết bị và Cài đặt.

Nút **Nhạc nền** ở đầu trang điều khiển bản nhạc không lời cục bộ, lặp 20 giây. Nhạc được tạo riêng cho dự án tại `public/audio/exploration.wav` (khoảng 862 KiB); không phụ thuộc dịch vụ ngoài. Mặc định tắt, chỉ tải/phát khi bấm bật. Nhạc tiếp tục khi chuyển trang trong ứng dụng, tạm dừng khi tab bị ẩn và tiếp tục khi quay lại nếu vẫn bật. Tải lại trang sẽ tắt nhạc để người dùng chủ động bật lại. Nút này độc lập với âm báo đúng/sai và phát âm. Nếu trình duyệt chặn phát hoặc tiếp tục nhạc, bấm bật lại.

Điều khiển nhạc: `src/components/BackgroundMusic.tsx`; trang trí: `src/styles/delight.css`, `public/images/explorer-clouds.svg`. Kiểm thử bật/tắt, lỗi phát, tạm dừng và chuyển trang nằm trong `tests/music.test.tsx`, `tests/e2e/music.spec.ts`. Khi deploy, chép toàn bộ `dist/`, bao gồm thư mục `audio/`.

## Phiên âm từ vựng

Cả 36 từ của bốn chủ đề có phiên âm IPA Anh-Mỹ, hiển thị dưới từ tiếng Anh trong trang từ vựng và phần học của Quest. Phiên âm được lưu cục bộ trong trường `phonetic` của mỗi từ; khi thêm từ, điền phiên âm trong dấu `/…/` ở cuối hàng dữ liệu từ vựng. Tham khảo cách ghi IPA tại [Cambridge Dictionary](https://dictionary.cambridge.org/pronunciation/english/). Nút nghe vẫn đọc từ bằng giọng `en-US` có sẵn trên thiết bị; giọng thực tế tùy hệ điều hành.
