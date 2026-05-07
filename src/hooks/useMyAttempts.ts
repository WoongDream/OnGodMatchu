import useSWR from 'swr';
import { getMyAttempts, getUserAttempts } from '@/api/attempt';
import type { AttemptListItem } from '@/types';

export type UseMyAttemptsParams = {
  userId?: string;
  page?: number;
  size?: number;
};

export type UseMyAttemptsReturn = {
  items: AttemptListItem[];
  totalElements: number;
  totalPages: number;
  isLoading: boolean;
  error: unknown;
};

const buildKey = (p: UseMyAttemptsParams) =>
  ['my-attempts', p.userId ?? 'me', p.page ?? 0, p.size ?? 20] as const;

const useMyAttempts = (params: UseMyAttemptsParams = {}): UseMyAttemptsReturn => {
  const key = buildKey(params);

  const fetcher = () => {
    if (params.userId) {
      return getUserAttempts(params.userId, { page: params.page, size: params.size });
    }
    return getMyAttempts({ page: params.page, size: params.size });
  };

  const { data, error, isLoading } = useSWR(key, fetcher);

  return {
    items: data?.content ?? [],
    totalElements: data?.totalElements ?? 0,
    totalPages: data?.totalPages ?? 0,
    isLoading,
    error,
  };
};

export default useMyAttempts;
