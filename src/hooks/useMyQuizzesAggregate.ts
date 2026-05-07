import useSWR from 'swr';
import { getMyProfileStats } from '@/api/user';
import type { MyQuizzesAggregate } from '@/types';

export type UseMyQuizzesAggregateReturn = {
  stats: MyQuizzesAggregate | undefined;
  isLoading: boolean;
  error: unknown;
};

const useMyQuizzesAggregate = (): UseMyQuizzesAggregateReturn => {
  const { data, isLoading, error } = useSWR<MyQuizzesAggregate>(['my-quizzes-aggregate'], () =>
    getMyProfileStats(),
  );
  return { stats: data, isLoading, error };
};

export default useMyQuizzesAggregate;
