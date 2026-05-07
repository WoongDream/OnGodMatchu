import type { MyQuizzesAggregate } from '@/types';

export type MyQuizStatsProps = {
  stats: MyQuizzesAggregate | undefined;
  isLoading?: boolean;
};
