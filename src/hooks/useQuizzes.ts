import useSWR from 'swr';
import { getQuizzes, type QuizListSort } from '@/api/quiz';
import type { Quiz } from '@/types';

type UseQuizzesParams = {
  category?: string;
  q?: string;
  page?: number;
  size?: number;
  sort?: QuizListSort;
};

type UseQuizzesReturn = {
  quizzes: Quiz[];
  totalPages: number;
  isLoading: boolean;
  error: unknown;
};

const useQuizzes = (params?: UseQuizzesParams): UseQuizzesReturn => {
  const key = [
    'quizzes',
    params?.category ?? null,
    params?.q?.trim() ?? '',
    params?.page ?? 0,
    params?.size ?? 20,
    params?.sort ?? 'plays',
  ];

  const { data, isLoading, error } = useSWR(key, () => getQuizzes(params));

  return {
    quizzes: data?.content ?? [],
    totalPages: data?.totalPages ?? 0,
    isLoading,
    error,
  };
};

export default useQuizzes;
