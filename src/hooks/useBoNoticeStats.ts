import useSWR from 'swr';
import { getBoNoticeStats } from '@/api/admin';
import type { NoticeStats } from '@/types';

export type UseBoNoticeStatsReturn = {
  stats: NoticeStats | undefined;
  isLoading: boolean;
  error: unknown;
  refresh: () => void;
};

const useBoNoticeStats = (): UseBoNoticeStatsReturn => {
  const { data, error, isLoading, mutate } = useSWR(
    ['admin', 'notices', 'stats'],
    getBoNoticeStats,
  );
  return { stats: data, isLoading, error, refresh: () => void mutate() };
};

export default useBoNoticeStats;
