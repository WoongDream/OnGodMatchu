import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { createQuiz } from '@/api/quiz';
import { uploadImage } from '@/api/upload';
import type { Category, Quiz } from '@/types';
import { ImageUploadError } from './useUploadImage';

type QuestionDraft = {
  imageFile: File | null;
  answerImageFile?: File | null;
  answerImageSameAsQuestion?: boolean;
  questionText: string;
  answer: string;
};

export type CreateQuizErrorCode =
  | 'INVALID_INPUT'
  | 'INVALID_CATEGORY'
  | 'UNAUTHORIZED'
  | 'USER_NOT_FOUND'
  | 'IMAGE_UPLOAD_FAILED'
  | 'INTERNAL_SERVER_ERROR'
  | 'NETWORK';

const ERROR_MESSAGES: Record<CreateQuizErrorCode, string> = {
  INVALID_INPUT: '입력값을 다시 확인해주세요.',
  INVALID_CATEGORY: '선택한 카테고리가 올바르지 않아요.',
  UNAUTHORIZED: '로그인이 필요해요.',
  USER_NOT_FOUND: '사용자 정보를 찾을 수 없어요. 다시 로그인해주세요.',
  IMAGE_UPLOAD_FAILED: '이미지 업로드에 실패했어요. 다시 시도해주세요.',
  INTERNAL_SERVER_ERROR: '서버 오류가 발생했어요. 잠시 후 다시 시도해주세요.',
  NETWORK: '퀴즈 저장 요청에 실패했어요.',
};

const resolveCreateError = (err: unknown): CreateQuizErrorCode => {
  if (err instanceof ImageUploadError) {
    return 'IMAGE_UPLOAD_FAILED';
  }
  if (axios.isAxiosError(err)) {
    const status = err.response?.status;
    const apiCode = (err.response?.data as { error?: { code?: string } } | undefined)?.error?.code;
    switch (apiCode) {
      case 'INVALID_INPUT':
        return 'INVALID_INPUT';
      case 'INVALID_CATEGORY':
        return 'INVALID_CATEGORY';
      case 'USER_NOT_FOUND':
        return 'USER_NOT_FOUND';
      case 'INTERNAL_SERVER_ERROR':
        return 'INTERNAL_SERVER_ERROR';
    }
    if (status === 401) {
      return 'UNAUTHORIZED';
    }
    if (status === 400) {
      return 'INVALID_INPUT';
    }
    if (status === 404) {
      return 'USER_NOT_FOUND';
    }
    if (status && status >= 500) {
      return 'INTERNAL_SERVER_ERROR';
    }
  }
  return 'NETWORK';
};

type SubmitParams = {
  title: string;
  description: string;
  category: Category;
  thumbnailFile: File | null;
  isPublic: boolean;
  questions: QuestionDraft[];
};

type UseCreateQuizReturn = {
  submit: (params: SubmitParams) => Promise<Quiz | null>;
  clearError: () => void;
  isSubmitting: boolean;
  error: string | null;
  errorCode: CreateQuizErrorCode | null;
};

const useCreateQuiz = (): UseCreateQuizReturn => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<CreateQuizErrorCode | null>(null);
  const navigate = useNavigate();

  const clearError = useCallback(() => {
    setError(null);
    setErrorCode(null);
  }, []);

  const submit = useCallback(
    async (params: SubmitParams): Promise<Quiz | null> => {
      setIsSubmitting(true);
      setError(null);
      setErrorCode(null);
      try {
        const uploadIfPresent = (file: File | null | undefined) =>
          file ? uploadImage(file) : Promise.resolve(null);

        const [thumbnailKey, questionImageKeys, answerImageKeys] = await Promise.all([
          uploadIfPresent(params.thumbnailFile),
          Promise.all(params.questions.map((q) => uploadIfPresent(q.imageFile))),
          Promise.all(
            params.questions.map((q) =>
              q.answerImageSameAsQuestion
                ? Promise.resolve(null)
                : uploadIfPresent(q.answerImageFile),
            ),
          ),
        ]);

        const quiz = await createQuiz({
          title: params.title.trim(),
          description: params.description.trim() || undefined,
          category: params.category,
          thumbnailKey: thumbnailKey ?? undefined,
          isPublic: params.isPublic,
          questions: params.questions.map((q, index) => {
            const imageKey = questionImageKeys[index] ?? undefined;
            const answerImageKey = q.answerImageSameAsQuestion
              ? imageKey
              : (answerImageKeys[index] ?? undefined);
            return {
              imageKey,
              answerImageKey,
              questionText: q.questionText.trim() || undefined,
              answer: q.answer.trim(),
            };
          }),
        });

        return quiz;
      } catch (err) {
        const code = resolveCreateError(err);
        setErrorCode(code);
        setError(ERROR_MESSAGES[code]);
        if (code === 'UNAUTHORIZED') {
          navigate('/login');
        }
        return null;
      } finally {
        setIsSubmitting(false);
      }
    },
    [navigate],
  );

  return { submit, clearError, isSubmitting, error, errorCode };
};

export default useCreateQuiz;
