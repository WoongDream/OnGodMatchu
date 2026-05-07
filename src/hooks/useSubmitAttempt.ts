import { useCallback, useState } from 'react';
import axios from 'axios';
import { submitAttempt, mapAttemptError, type AttemptErrorCode } from '@/api/attempt';
import type { AttemptAnswerInput, AttemptResponse } from '@/types';

const ERROR_MESSAGES: Record<AttemptErrorCode, string> = {
  QUIZ_NOT_FOUND: '퀴즈를 찾을 수 없어요.',
  QUESTION_NOT_FOUND: '잘못된 문제 정보가 포함됐어요.',
  INVALID_INPUT: '답안을 다시 확인해주세요.',
  UNAUTHORIZED: '로그인이 필요해요.',
  NETWORK: '제출에 실패했어요. 잠시 후 다시 시도해주세요.',
};

export type UseSubmitAttemptReturn = {
  submit: (quizId: number, answers: AttemptAnswerInput[]) => Promise<AttemptResponse | null>;
  isSubmitting: boolean;
  error: string | null;
  errorCode: AttemptErrorCode | null;
  clearError: () => void;
};

const useSubmitAttempt = (): UseSubmitAttemptReturn => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<AttemptErrorCode | null>(null);

  const clearError = useCallback(() => {
    setError(null);
    setErrorCode(null);
  }, []);

  const submit = useCallback(
    async (quizId: number, answers: AttemptAnswerInput[]): Promise<AttemptResponse | null> => {
      setIsSubmitting(true);
      clearError();
      try {
        return await submitAttempt(quizId, answers);
      } catch (err) {
        const code = axios.isAxiosError(err) ? mapAttemptError(err) : 'NETWORK';
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

export default useSubmitAttempt;
