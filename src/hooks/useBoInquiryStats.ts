import { useCallback } from 'react';
import useSWR from 'swr';
import { getBoInquiryStats } from '@/api/inquiry';
import type { InquiryStats } from '@/types';

export type UseBoInquiryStatsReturn = {
  stats: InquiryStats | undefined;
  isLoading: boolean;
  error: unknown;
  refresh: () => void;
};

/** BO 문의 통계 (전체/대기/처리중/완료). */
const useBoInquiryStats = (): UseBoInquiryStatsReturn => {
  const { data, error, isLoading, mutate } = useSWR(
    ['admin', 'inquiries', 'stats'],
    getBoInquiryStats,
  );

  const refresh = useCallback(() => {
    mutate();
  }, [mutate]);

  return { stats: data, isLoading, error, refresh };
};

export default useBoInquiryStats;
