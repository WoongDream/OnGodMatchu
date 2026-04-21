import useSWR from 'swr';
import { getQuizDetail } from '@/api/quiz';
import type { Quiz, Question } from '@/types';

type UseQuizDetailReturn = {
  quiz: (Quiz & { questions: Question[] }) | undefined;
  isLoading: boolean;
  error: unknown;
};

const useQuizDetail = (quizId: number): UseQuizDetailReturn => {
  const { data, isLoading, error } = useSWR(['quiz', quizId], () => getQuizDetail(quizId));

  return { quiz: data, isLoading, error };
};

export default useQuizDetail;
