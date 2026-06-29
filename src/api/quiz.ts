import instance from './instance';
import type {
  Quiz,
  Question,
  Category,
  QuizVisibility,
  MyQuizListItem,
  QuizScoreDistribution,
  ImageTransform,
} from '@/types';

type ApiResponse<T> = {
  success: boolean;
  data: T;
};

type QuizDetailResponse = Quiz & {
  questions: Question[];
};

type RawQuizDetailResponse = Omit<QuizDetailResponse, 'isPublic'> & {
  visibility: QuizVisibility;
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

type QuestionRequest = {
  imageKey?: string;
  originalImageKey?: string;
  imageTransform?: ImageTransform | null;
  answerImageKey?: string;
  originalAnswerImageKey?: string;
  answerImageTransform?: ImageTransform | null;
  questionText?: string;
  answer: string;
};

type QuizCreateRequest = {
  title: string;
  description?: string;
  category: Category;
  thumbnailKey?: string;
  originalThumbnailKey?: string;
  thumbnailTransform?: ImageTransform | null;
  isPublic: boolean;
  questions: QuestionRequest[];
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

export type QuestionUpdate = {
  id?: number;
  imageKey?: string | null;
  originalImageKey?: string | null;
  imageTransform?: ImageTransform | null;
  answerImageKey?: string | null;
  originalAnswerImageKey?: string | null;
  answerImageTransform?: ImageTransform | null;
  questionText?: string | null;
  answer: string;
};

export type UpdateQuizPayload = {
  title?: string;
  description?: string;
  category?: Category;
  thumbnailKey?: string;
  originalThumbnailKey?: string;
  thumbnailTransform?: ImageTransform | null;
  isPublic?: boolean;
  questions?: QuestionUpdate[];
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

const toQuizDetail = (raw: RawQuizDetailResponse): QuizDetailResponse => {
  const { visibility, ...rest } = raw;
  return { ...rest, isPublic: visibilityToFlag(visibility) };
};

export const getCategories = async (): Promise<CategoryItem[]> => {
  const res = await instance.get<ApiResponse<CategoryItem[]>>('/api/quizzes/categories');
  return res.data.data;
};

export type QuizListSort = 'plays' | 'latest';

export const getQuizzes = async (params?: {
  category?: string;
  q?: string;
  page?: number;
  size?: number;
  sort?: QuizListSort;
}): Promise<Page<Quiz>> => {
  const query: Record<string, string | number> = {
    page: params?.page ?? 0,
    size: params?.size ?? 20,
  };
  if (params?.category) {
    query.category = params.category;
  }
  const keyword = params?.q?.trim();
  if (keyword) {
    query.q = keyword;
  }
  if (params?.sort === 'latest') {
    query.sort = 'createdAt,desc';
  }
  const res = await instance.get<ApiResponse<Page<Quiz>>>('/api/quizzes', { params: query });
  return res.data.data;
};

export const getMyStarredQuizzes = async (params?: {
  page?: number;
  size?: number;
  title?: string;
}): Promise<Page<Quiz>> => {
  const query: Record<string, string | number> = {
    page: params?.page ?? 0,
    size: params?.size ?? 20,
  };
  if (params?.title && params.title.trim() !== '') {
    query.title = params.title.trim();
  }
  const res = await instance.get<ApiResponse<Page<Quiz>>>('/api/users/me/stars', { params: query });
  return res.data.data;
};

export const starQuiz = async (quizId: number): Promise<void> => {
  await instance.put(`/api/quizzes/${quizId}/star`);
};

export const unstarQuiz = async (quizId: number): Promise<void> => {
  await instance.delete(`/api/quizzes/${quizId}/star`);
};

export type QuizShareResult = {
  shareCount: number;
  alreadyShared: boolean;
};

export const recordQuizShare = async (quizId: number): Promise<QuizShareResult> => {
  const res = await instance.post<ApiResponse<QuizShareResult>>(`/api/quizzes/${quizId}/share`);
  return res.data.data;
};

export const getQuizDetail = async (quizId: number): Promise<QuizDetailResponse> => {
  const res = await instance.get<ApiResponse<RawQuizDetailResponse>>(`/api/quizzes/${quizId}`);
  return toQuizDetail(res.data.data);
};

export const getQuizScoreDistribution = async (quizId: number): Promise<QuizScoreDistribution> => {
  const res = await instance.get<ApiResponse<QuizScoreDistribution>>(
    `/api/quizzes/${quizId}/score-distribution`,
  );
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
