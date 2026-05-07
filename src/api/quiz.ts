import instance from './instance';
import type { Quiz, Question, Category, QuizVisibility, MyQuizListItem } from '@/types';

type ApiResponse<T> = {
  success: boolean;
  data: T;
};

type QuizDetailResponse = Quiz & {
  questions: Question[];
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

type GradeResponse = {
  questionId: number;
  correct: boolean;
  correctAnswer: string;
};

type QuizCreateRequest = {
  title: string;
  description?: string;
  category: Category;
  thumbnailKey?: string;
  isPublic: boolean;
  questions: Array<{
    imageKey?: string;
    answerImageKey?: string;
    questionText?: string;
    answer: string;
  }>;
};

export type CategoryItem = {
  key: Category;
  label: string;
};

export type MyQuizzesVisibilityFilter = 'all' | 'public' | 'private';

export type MyQuizzesSort = 'latest' | 'plays' | 'shares' | 'stars' | 'comments';

export type MyQuizzesQuery = {
  visibility?: MyQuizzesVisibilityFilter;
  sort?: MyQuizzesSort;
  page?: number;
  size?: number;
};

export type UpdateQuizPayload = {
  title?: string;
  description?: string;
  category?: Category;
  thumbnailKey?: string;
  isPublic?: boolean;
};

export type QuizErrorCode =
  | 'QUIZ_NOT_FOUND'
  | 'FORBIDDEN'
  | 'INVALID_INPUT'
  | 'UNAUTHORIZED'
  | 'NETWORK';

const visibilityToFlag = (v: QuizVisibility): boolean => v === 'PUBLIC';

const flagToVisibility = (flag: boolean): QuizVisibility => (flag ? 'PUBLIC' : 'PRIVATE');

type RawMyQuizListItem = Omit<MyQuizListItem, 'isPublic' | 'publicId'> & {
  visibility: QuizVisibility;
  quizId: string;
};

const toMyQuizListItem = (raw: RawMyQuizListItem): MyQuizListItem => {
  const { visibility, quizId, ...rest } = raw;
  return { ...rest, publicId: quizId, isPublic: visibilityToFlag(visibility) };
};

export const getCategories = async (): Promise<CategoryItem[]> => {
  const res = await instance.get<ApiResponse<CategoryItem[]>>('/api/quizzes/categories');
  return res.data.data;
};

export const getQuizzes = async (params?: {
  category?: string;
  page?: number;
  size?: number;
}): Promise<Page<Quiz>> => {
  const res = await instance.get<ApiResponse<Page<Quiz>>>('/api/quizzes', {
    params: { ...params, page: params?.page ?? 0, size: params?.size ?? 20 },
  });
  return res.data.data;
};

export const getQuizDetail = async (quizId: number): Promise<QuizDetailResponse> => {
  const res = await instance.get<ApiResponse<QuizDetailResponse>>(`/api/quizzes/${quizId}`);
  return res.data.data;
};

export const incrementPlayCount = async (quizId: number): Promise<void> => {
  await instance.post(`/api/quizzes/${quizId}/play`);
};

export const gradeAnswer = async (
  questionId: number,
  userAnswer: string,
): Promise<GradeResponse> => {
  const res = await instance.post<ApiResponse<GradeResponse>>('/api/quizzes/grade', {
    questionId,
    userAnswer,
  });
  return res.data.data;
};

export const createQuiz = async (data: QuizCreateRequest): Promise<Quiz> => {
  const res = await instance.post<ApiResponse<Quiz>>('/api/quizzes', data);
  return res.data.data;
};

export const updateQuiz = async (quizId: number, payload: UpdateQuizPayload): Promise<Quiz> => {
  const { isPublic, ...rest } = payload;
  const body: Record<string, unknown> = { ...rest };
  if (isPublic !== undefined) {
    body.visibility = flagToVisibility(isPublic);
  }
  const res = await instance.patch<ApiResponse<Quiz>>(`/api/quizzes/${quizId}`, body);
  return res.data.data;
};

export const updateQuizVisibility = async (quizId: number, isPublic: boolean): Promise<Quiz> => {
  return updateQuiz(quizId, { isPublic });
};

export const deleteQuiz = async (quizId: number): Promise<void> => {
  await instance.delete(`/api/quizzes/${quizId}`);
};

const buildMyQuizzesParams = (q: MyQuizzesQuery = {}): Record<string, string | number> => {
  const params: Record<string, string | number> = {
    page: q.page ?? 0,
    size: q.size ?? 10,
  };
  if (q.visibility && q.visibility !== 'all') {
    params.visibility = q.visibility;
  }
  if (q.sort) {
    params.sort = q.sort;
  }
  return params;
};

export const getMyQuizzes = async (q?: MyQuizzesQuery): Promise<Page<MyQuizListItem>> => {
  const res = await instance.get<ApiResponse<Page<RawMyQuizListItem>>>('/api/users/me/quizzes', {
    params: buildMyQuizzesParams(q),
  });
  const page = res.data.data;
  return { ...page, content: page.content.map(toMyQuizListItem) };
};

export const getUserQuizzes = async (
  userId: string,
  q?: Pick<MyQuizzesQuery, 'sort' | 'page' | 'size'>,
): Promise<Page<MyQuizListItem>> => {
  const res = await instance.get<ApiResponse<Page<RawMyQuizListItem>>>(
    `/api/users/${userId}/quizzes`,
    { params: buildMyQuizzesParams(q) },
  );
  const page = res.data.data;
  return { ...page, content: page.content.map(toMyQuizListItem) };
};

type ErrorResponseBody = {
  error?: { code?: string };
};

export const mapQuizError = (error: unknown): QuizErrorCode => {
  const err = error as { response?: { status?: number; data?: ErrorResponseBody } };
  const status = err.response?.status;
  const code = err.response?.data?.error?.code;

  if (code === 'QUIZ_NOT_FOUND' || status === 404) {
    return 'QUIZ_NOT_FOUND';
  }
  if (code === 'QUIZ_FORBIDDEN' || code === 'FORBIDDEN' || status === 403) {
    return 'FORBIDDEN';
  }
  if (code === 'INVALID_INPUT' || status === 400) {
    return 'INVALID_INPUT';
  }
  if (status === 401) {
    return 'UNAUTHORIZED';
  }
  return 'NETWORK';
};
