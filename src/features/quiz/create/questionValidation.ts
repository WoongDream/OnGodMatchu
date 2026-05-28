import type { DraftQuestion } from './questionTypes';
import type { QuestionItemErrors } from './QuestionItem';

export type QuestionErrorMap = Record<string, QuestionItemErrors>;

export const validateQuestion = (q: DraftQuestion): QuestionItemErrors => {
  const errors: QuestionItemErrors = {};
  const hasImage = q.imagePreviewUrl !== null || q.imageFile !== null || q.imageKey !== null;
  const hasText = q.questionText.trim() !== '';
  if (!hasImage && !hasText) {
    errors.questionImageOrText = '이미지 또는 문제 텍스트를 입력해주세요';
  }
  if (q.answer.trim() === '') {
    errors.answer = '정답을 입력해주세요';
  }
  return errors;
};

export const validateAllQuestions = (qs: DraftQuestion[]): QuestionErrorMap => {
  const map: QuestionErrorMap = {};
  qs.forEach((q) => {
    const errs = validateQuestion(q);
    if (Object.keys(errs).length > 0) {
      map[q.id] = errs;
    }
  });
  return map;
};
