import { useCallback, useMemo } from 'react';
import useSWRInfinite from 'swr/infinite';
import { getAdminUsers } from '@/api/admin';
import type { AdminUser } from '@/api/admin';
import type { Role, UserStatus } from '@/types';

type AdminUserPage = Awaited<ReturnType<typeof getAdminUsers>>;

export type UseAdminUsersParams = {
  status?: UserStatus;
  role?: Role;
  query?: string;
  size?: number;
};

export type UseAdminUsersReturn = {
  items: AdminUser[];
  totalElements: number;
  isLoading: boolean;
  isLoadingMore: boolean;
  hasNext: boolean;
  error: unknown;
  loadMore: () => void;
  refresh: () => void;
};

const DEFAULT_SIZE = 20;

const useAdminUsers = (params: UseAdminUsersParams = {}): UseAdminUsersReturn => {
  const { status, role, query = '', size = DEFAULT_SIZE } = params;

  const getKey = useCallback(
    (pageIndex: number, previousPageData: AdminUserPage | null) => {
      if (previousPageData && previousPageData.last) {
        return null;
      }
      return ['admin', 'users', status ?? '', role ?? '', query, pageIndex, size] as const;
    },
    [status, role, query, size],
  );

  const {
    data,
    error,
    isLoading,
    isValidating,
    size: pageCount,
    setSize,
    mutate,
  } = useSWRInfinite(getKey, ([, , s, r, q, page, sz]) =>
    getAdminUsers({
      status: (s as UserStatus) || undefined,
      role: (r as Role) || undefined,
      query: (q as string) || undefined,
      page: page as number,
      size: sz as number,
    }),
  );

  const items = useMemo<AdminUser[]>(() => (data ?? []).flatMap((page) => page.content), [data]);
  const totalElements = data?.[0]?.totalElements ?? 0;
  const lastPage = data?.[data.length - 1];
  const hasNext = lastPage ? !lastPage.last : true;
  const isLoadingMore = isValidating && pageCount > 1 && !isLoading;

  const loadMore = useCallback(() => {
    if (!hasNext || isValidating) {
      return;
    }
    setSize((s) => s + 1);
  }, [hasNext, isValidating, setSize]);

  const refresh = useCallback(() => {
    void mutate();
  }, [mutate]);

  return { items, totalElements, isLoading, isLoadingMore, hasNext, error, loadMore, refresh };
};

export default useAdminUsers;
