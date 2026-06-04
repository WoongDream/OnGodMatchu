import useSWR from 'swr';
import { getAdminUserSummary } from '@/api/admin';
import type { AdminUserSummary } from '@/api/admin';

export type UseAdminUserSummaryReturn = {
  summary: AdminUserSummary | undefined;
  isLoading: boolean;
  error: unknown;
  refresh: () => void;
};

const useAdminUserSummary = (): UseAdminUserSummaryReturn => {
  const { data, error, isLoading, mutate } = useSWR(
    ['admin', 'users', 'summary'],
    getAdminUserSummary,
  );
  return { summary: data, isLoading, error, refresh: () => void mutate() };
};

export default useAdminUserSummary;
