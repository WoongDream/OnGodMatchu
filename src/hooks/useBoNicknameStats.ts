import useSWR from 'swr';
import { getBoNicknameStats } from '@/api/admin';
import type { NicknameRuleStats } from '@/types';

export type UseBoNicknameStatsReturn = {
  stats: NicknameRuleStats | undefined;
  isLoading: boolean;
  error: unknown;
  refresh: () => void;
};

const useBoNicknameStats = (): UseBoNicknameStatsReturn => {
  const { data, error, isLoading, mutate } = useSWR(
    ['admin', 'nicknames', 'stats'],
    getBoNicknameStats,
  );
  return { stats: data, isLoading, error, refresh: () => void mutate() };
};

export default useBoNicknameStats;
