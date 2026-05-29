import { useCallback, useState } from 'react';
import axios from 'axios';
import {
  updateQuiz,
  mapQuizError,
  type UpdateQuizPayload,
  type QuestionUpdate,
  type QuizErrorCode,
} from '@/api/quiz';
import { uploadImage } from '@/api/upload';
import { resolveSlot, type ImageSlot } from '@/lib/image/imageSlot';
import { ImageUploadError } from './useUploadImage';
import type { DraftQuestion } from '@/features/quiz/create/questionTypes';
import type { Quiz } from '@/types';

export type UpdateQuizSubmitParams = Omit<
  UpdateQuizPayload,
  'questions' | 'thumbnailKey' | 'originalThumbnailKey' | 'thumbnailTransform'
> & {
  thumbnail?: ImageSlot;
  questions?: DraftQuestion[];
};

const ERROR_MESSAGES: Record<QuizErrorCode, string> = {
  QUIZ_NOT_FOUND: '퀴즈를 찾을 수 없어요.',
  FORBIDDEN: '편집 권한이 없습니다.',
  INVALID_INPUT: '입력값을 다시 확인해주세요.',
  UNAUTHORIZED: '로그인이 필요해요.',
  NETWORK: '퀴즈 수정 요청에 실패했어요.',
};

export type UseUpdateQuizReturn = {
  submit: (quizId: number, params: UpdateQuizSubmitParams) => Promise<Quiz | null>;
  isSubmitting: boolean;
  error: string | null;
  errorCode: QuizErrorCode | 'IMAGE_UPLOAD_FAILED' | null;
  clearError: () => void;
};

const buildQuestionsPayload = async (drafts: DraftQuestion[]): Promise<QuestionUpdate[]> =>
  Promise.all(
    drafts.map(async (q): Promise<QuestionUpdate> => {
      const img = await resolveSlot(q.image, uploadImage);
      const ans = q.answerImageSameAsQuestion ? img : await resolveSlot(q.answerImage, uploadImage);
      return {
        id: q.serverId,
        imageKey: img.imageKey ?? null,
        originalImageKey: img.originalImageKey ?? null,
        imageTransform: img.transform ?? null,
        answerImageKey: ans.imageKey ?? null,
        originalAnswerImageKey: ans.originalImageKey ?? null,
        answerImageTransform: ans.transform ?? null,
        questionText: q.questionText.trim() || null,
        answer: q.answer.trim(),
      };
    }),
  );

const useUpdateQuiz = (): UseUpdateQuizReturn => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<QuizErrorCode | 'IMAGE_UPLOAD_FAILED' | null>(null);

  const clearError = useCallback(() => {
    setError(null);
    setErrorCode(null);
  }, []);

  const submit = useCallback(
    async (quizId: number, params: UpdateQuizSubmitParams): Promise<Quiz | null> => {
      setIsSubmitting(true);
      clearError();
      try {
        const { thumbnail, questions, ...rest } = params;
        const payload: UpdateQuizPayload = { ...rest };
        if (thumbnail) {
          const thumb = await resolveSlot(thumbnail, uploadImage);
          payload.thumbnailKey = thumb.imageKey;
          payload.originalThumbnailKey = thumb.originalImageKey;
          payload.thumbnailTransform = thumb.transform;
        }
        if (questions !== undefined) {
          payload.questions = await buildQuestionsPayload(questions);
        }
        const updated = await updateQuiz(quizId, payload);
        return updated;
      } catch (err) {
        if (err instanceof ImageUploadError) {
          setErrorCode('IMAGE_UPLOAD_FAILED');
          setError('이미지 업로드에 실패했어요. 다시 시도해주세요.');
          return null;
        }
        const code = axios.isAxiosError(err) ? mapQuizError(err) : 'NETWORK';
        setErrorCode(code);
        setError(ERROR_MESSAGES[code]);
        return null;
      } finally {
        setIsSubmitting(false);
      }
    },
    [clearError],
  );

  return { submit, isSubmitting, error, errorCode, clearError };
};

export default useUpdateQuiz;
