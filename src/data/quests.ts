export const quests: Record<
  string,
  { title: string; story: string; ending: string }
> = {
  'my-new-school': {
    title: 'Chiếc rương ngày khai trường',
    story:
      'Câu lạc bộ tiếng Anh để lại một chiếc rương ở trường. Mây có bản đồ, còn bạn cần tìm đồ dùng và giải mật thư để lấy ba chìa khóa.',
    ending:
      'Trong rương là bộ dụng cụ của câu lạc bộ tiếng Anh. Đã có đủ đồ dùng cho buổi học đầu tiên.',
  },
  'my-house': {
    title: 'Bí mật trong ngôi nhà',
    story:
      'Trong nhà có một chiếc rương cần ba chìa khóa để mở. Các đồ vật trong bài học sẽ giúp bạn tìm lời giải.',
    ending: 'Trong rương là cuốn album ảnh gia đình.',
  },
  'my-friends': {
    title: 'Lời hẹn trong công viên',
    story:
      'Nhóm bạn giấu một lời mời trong chiếc rương ở công viên. Đọc gợi ý, ghép thẻ và giải mật thư để mở rương.',
    ending: 'Bạn tìm thấy thiệp mời đi dã ngoại của cả nhóm.',
  },
  'my-neighbourhood': {
    title: 'Kho báu giữa khu phố',
    story:
      'Một chiếc rương được giấu trong khu phố. Tìm đúng địa điểm trên hình, ghi nhớ các thẻ và xếp câu để lấy ba chìa khóa.',
    ending: 'Trong rương là cuốn sổ kể về những địa điểm trong khu phố.',
  },
};
