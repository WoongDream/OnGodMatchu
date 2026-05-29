import useSWR from 'swr';
import { getQuizScoreDistribution } from '@/api/quiz';
import type { QuizScoreDistribution } from '@/types';

type UseQuizScoreDistributionReturn = {
  data: QuizScoreDistribution | undefined;
  isLoading: boolean;
  error: unknown;
};

const useQuizScoreDistribution = (quizId: number): UseQuizScoreDistributionReturn => {
  const { data, isLoading, error } = useSWR(
    quizId > 0 ? ['quiz', quizId, 'score-distribution'] : null,
    () => getQuizScoreDistribution(quizId),
    {
      revalidateOnFocus: false,
      dedupingInterval: 5 * 60 * 1000,
    },
  );
  return { data, isLoading, error };
};

export default useQuizScoreDistribution;
