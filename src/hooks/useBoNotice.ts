import useSWR from 'swr';
import { getBoNotice } from '@/api/admin';
import type { BoNotice } from '@/types';

export type UseBoNoticeReturn = {
  notice: BoNotice | undefined;
  isLoading: boolean;
  error: unknown;
};

const useBoNotice = (id: number | undefined): UseBoNoticeReturn => {
  const key = id != null ? (['admin', 'notice', id] as const) : null;
  const { data, error, isLoading } = useSWR(key, ([, , noticeId]) =>
    getBoNotice(noticeId as number),
  );
  return { notice: data, isLoading, error };
};

export default useBoNotice;
