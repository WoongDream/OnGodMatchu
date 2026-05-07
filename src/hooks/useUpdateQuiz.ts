import { useCallback, useState } from 'react';
import axios from 'axios';
import { updateQuiz, mapQuizError, type UpdateQuizPayload, type QuizErrorCode } from '@/api/quiz';
import { uploadImage } from '@/api/upload';
import { ImageUploadError } from './useUploadImage';
import type { Quiz } from '@/types';

export type UpdateQuizSubmitParams = UpdateQuizPayload & {
  thumbnailFile?: File | null;
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
        const { thumbnailFile, ...rest } = params;
        const payload: UpdateQuizPayload = { ...rest };
        if (thumbnailFile) {
          payload.thumbnailKey = await uploadImage(thumbnailFile);
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
