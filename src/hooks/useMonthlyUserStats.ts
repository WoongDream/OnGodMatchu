import useSWR from 'swr';
import { getMonthlyUserStats } from '@/api/admin';
import type { MonthlyUserStat } from '@/api/admin';

export type UseMonthlyUserStatsReturn = {
  stats: MonthlyUserStat[] | undefined;
  isLoading: boolean;
  error: unknown;
};

/** 월별 유저 추이. enabled=false 면 호출하지 않음 (모달 열렸을 때만 조회). */
const useMonthlyUserStats = (enabled: boolean, months = 6): UseMonthlyUserStatsReturn => {
  const { data, error, isLoading } = useSWR(
    enabled ? ['admin', 'users', 'monthly', months] : null,
    () => getMonthlyUserStats(months),
    { revalidateOnFocus: false },
  );
  return { stats: data, isLoading, error };
};

export default useMonthlyUserStats;
