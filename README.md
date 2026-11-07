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

- `/`: giới thiệu bốn chủ đề đang hoạt động; chọn chủ đề để mở đúng bài từ vựng, ngữ pháp và ba game. Nút Chơi thử ngay mở `/demo`: một câu chọn từ theo hình từ Unit 1, không đồng hồ và không lưu điểm; chọn sai được thử lại, chọn đúng có nút bắt đầu Unit 1.
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

Để thêm chủ đề: tạo dữ liệu theo `Topic`, thêm vào mảng `topics`, cung cấp ít nhất 5 từ có hình đầu tiên, 5 quiz, 5 câu xếp từ và bài giảng. Cấp ID ổn định, duy nhất; `correctOptionId` trỏ đến một option thực. Mỗi token có ID riêng ngay cả khi chữ lặp. Hình lưu dưới `public/images/<topic>/`. Chạy `validateTopic` và thêm test cho nội dung mới. Các route học/game dùng topic ID tự động; khai báo hình và thông tin bài học riêng trong Topic. Word Match dùng 5 từ đầu tiên cho Word Match, chọn 5 câu ngẫu nhiên cho hai game còn lại.

Sửa câu hỏi trong data, không hardcode đáp án vào UI. Test xác nhận shuffle giữ đúng ID, câu/token không thiếu, scoring/timeout/nhấp đúp, schema hỏng, quota và giới hạn lưu. Không đặt mục tiêu coverage giả; bổ sung test cho luật hoặc nhánh hành vi mới.

## Ba chủ đề mới

Chọn tại `/topics`; mỗi chủ đề có 9 từ kèm SVG cục bộ, 5 quy tắc ngữ pháp, 5 câu Quick Quiz và 5 câu Sentence Builder. Word Match dùng 5 từ đầu tiên. Cả chế độ luyện tập/thử thách, điểm, huy hiệu và lưu tiến độ đều dùng chung hệ thống hiện có.

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

Từ trang chủ hoặc trang chi tiết của mỗi chủ đề, chọn **Bắt đầu Quest** (`/quest/:topicId`). Bốn chủ đề đều có câu chuyện và rương kho báu riêng:

1. **Săn tìm dấu vết:** đọc từ gợi ý, tìm đúng ba hình và cất vào túi đồ.
2. **Cặp thẻ bí mật:** lật và ghi nhớ sáu thẻ để ghép ba cặp từ–hình. Cặp sai được xem lại trước khi úp; không mất lượt vì bấm nhanh.
3. **Giải mật thư:** chạm các mảnh từ để xếp câu, có thể bỏ từ, xếp lại và xem gợi ý.

Mỗi chặng nhận một chìa khóa, đủ ba chìa mới mở rương. Không giới hạn giờ; Quest dùng chạm và Tab/Enter, không yêu cầu kéo thả. Hoàn thành được ghi vào `completedQuestIds` (trường tùy chọn tương thích dữ liệu v1 cũ), hiển thị tại Thành tích. Chơi lại không ghi trùng dấu mốc. Quest không cộng vào bảng điểm của ba game cũ. Xóa tiến độ trong Cài đặt cũng xóa dấu mốc Quest.

Các chặng đang chơi chỉ tồn tại trong phiên trang; rời hoặc tải lại sẽ bắt đầu hành trình từ đầu, có cảnh báo khi đang chơi. Dấu mốc chỉ được ghi khi bấm mở rương. Khi storage bị chặn/đầy, ứng dụng vẫn chơi được và dùng cảnh báo lưu trữ chung của website.

Câu chuyện: `src/data/quests.ts`. Luật ghép thẻ: `src/lib/questLogic.ts`; học liệu lấy từ topic hiện có (ba từ đầu để tìm hình, ba từ tiếp theo để ghép thẻ và câu xếp từ đầu tiên làm mật thư). Khi thêm chủ đề, thêm câu chuyện có cùng topic ID để mở Quest. Kiểm thử: `tests/quest.test.ts`, `tests/e2e/adventure.spec.ts`.
