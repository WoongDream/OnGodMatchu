import useSWR from 'swr';
import { getAdminUserDetail } from '@/api/admin';
import type { AdminUserDetail } from '@/api/admin';

export type UseAdminUserDetailReturn = {
  user: AdminUserDetail | undefined;
  isLoading: boolean;
  error: unknown;
  refresh: () => void;
};

const useAdminUserDetail = (publicId?: string | null): UseAdminUserDetailReturn => {
  const { data, error, isLoading, mutate } = useSWR(
    publicId ? ['admin', 'user', publicId] : null,
    () => getAdminUserDetail(publicId as string),
    { revalidateOnFocus: false },
  );
  return { user: data, isLoading, error, refresh: () => void mutate() };
};

export default useAdminUserDetail;
