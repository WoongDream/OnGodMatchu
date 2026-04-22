import useSWR from 'swr';
import { getQuizzes } from '@/api/quiz';
import type { Quiz } from '@/types';

type UseQuizzesParams = {
  category?: string;
  page?: number;
  size?: number;
};

type UseQuizzesReturn = {
  quizzes: Quiz[];
  totalPages: number;
  isLoading: boolean;
  error: unknown;
};

const useQuizzes = (params?: UseQuizzesParams): UseQuizzesReturn => {
  const key = ['quizzes', params?.category, params?.page, params?.size];

  const { data, isLoading, error } = useSWR(key, () => getQuizzes(params));

  return {
    quizzes: data?.content ?? [],
    totalPages: data?.totalPages ?? 0,
    isLoading,
    error,
  };
};

export default useQuizzes;
