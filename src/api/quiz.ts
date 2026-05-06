import instance from './instance';
import type { Quiz, Question, Category } from '@/types';

type ApiResponse<T> = {
  success: boolean;
  data: T;
};

type QuizDetailResponse = Quiz & {
  questions: Question[];
};

type PageQuizResponse = {
  content: Quiz[];
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

export const getCategories = async (): Promise<CategoryItem[]> => {
  const res = await instance.get<ApiResponse<CategoryItem[]>>('/api/quizzes/categories');
  return res.data.data;
};

export const getQuizzes = async (params?: {
  category?: string;
  page?: number;
  size?: number;
}): Promise<PageQuizResponse> => {
  const res = await instance.get<ApiResponse<PageQuizResponse>>('/api/quizzes', {
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

export const updateQuizVisibility = async (quizId: number, isPublic: boolean): Promise<Quiz> => {
  const res = await instance.patch<ApiResponse<Quiz>>(`/api/quizzes/${quizId}/visibility`, {
    isPublic,
  });
  return res.data.data;
};
