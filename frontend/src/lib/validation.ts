import type { Topic } from '../types';
export function validateTopic(topic: Topic): string[] {
  const errors: string[] = [];
  const unique = (ids: string[]) => new Set(ids).size === ids.length;
  if (
    topic.vocabulary.length < 5 ||
    topic.quiz.length < 5 ||
    topic.sentences.length < 5
  )
    errors.push('Mỗi game cần ít nhất 5 mục.');
  if (
    ![topic.vocabulary, topic.quiz, topic.sentences, topic.grammar].every(
      (items) => unique(items.map((item) => item.id)),
    )
  )
    errors.push('ID nội dung bị trùng.');
  for (const q of topic.quiz)
    if (
      !unique(q.options.map((o) => o.id)) ||
      q.options.length < 3 ||
      q.options.filter((o) => o.id === q.correctOptionId).length !== 1
    )
      errors.push(`Đáp án không hợp lệ: ${q.id}`);
  for (const q of topic.sentences)
    if (!q.tokens.length || !unique(q.tokens.map((t) => t.id)))
      errors.push(`Token không hợp lệ: ${q.id}`);
  return errors;
}
