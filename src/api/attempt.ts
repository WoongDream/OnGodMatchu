import instance from './instance';
import type { AttemptAnswerInput, AttemptResponse, AttemptListItem } from '@/types';

type ApiResponse<T> = {
  success: boolean;
  data: T;
};

type Page<T> = {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
  empty: boolean;
};

export type AttemptErrorCode =
  | 'QUIZ_NOT_FOUND'
  | 'QUESTION_NOT_FOUND'
  | 'INVALID_INPUT'
  | 'UNAUTHORIZED'
  | 'NETWORK';

export type AttemptsQuery = {
  page?: number;
  size?: number;
};

export const submitAttempt = async (
  quizId: number,
  answers: AttemptAnswerInput[],
): Promise<AttemptResponse> => {
  const res = await instance.post<ApiResponse<AttemptResponse>>(`/api/quizzes/${quizId}/attempts`, {
    answers,
  });
  return res.data.data;
};

const buildPageParams = (q: AttemptsQuery = {}): Record<string, number> => ({
  page: q.page ?? 0,
  size: q.size ?? 20,
});

export const getMyAttempts = async (q?: AttemptsQuery): Promise<Page<AttemptListItem>> => {
  const res = await instance.get<ApiResponse<Page<AttemptListItem>>>('/api/users/me/attempts', {
    params: buildPageParams(q),
  });
  return res.data.data;
};

export const getUserAttempts = async (
  publicId: string,
  q?: AttemptsQuery,
): Promise<Page<AttemptListItem>> => {
  const res = await instance.get<ApiResponse<Page<AttemptListItem>>>(
    `/api/users/${publicId}/attempts`,
    { params: buildPageParams(q) },
  );
  return res.data.data;
};

type ErrorResponseBody = {
  error?: { code?: string };
};

export const mapAttemptError = (error: unknown): AttemptErrorCode => {
  const err = error as { response?: { status?: number; data?: ErrorResponseBody } };
  const status = err.response?.status;
  const code = err.response?.data?.error?.code;

  if (code === 'QUESTION_NOT_FOUND') {
    return 'QUESTION_NOT_FOUND';
  }
  if (code === 'QUIZ_NOT_FOUND' || status === 404) {
    return 'QUIZ_NOT_FOUND';
  }
  if (code === 'INVALID_INPUT' || status === 400) {
    return 'INVALID_INPUT';
  }
  if (status === 401) {
    return 'UNAUTHORIZED';
  }
  return 'NETWORK';
};
