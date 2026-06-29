import { useCallback, useMemo } from 'react';
import useSWRInfinite from 'swr/infinite';
import { getAdminUserHistories } from '@/api/admin';
import type { AdminUserHistory } from '@/api/admin';

type HistoryPage = Awaited<ReturnType<typeof getAdminUserHistories>>;

export type UseAdminUserHistoriesReturn = {
  items: AdminUserHistory[];
  totalElements: number;
  isLoading: boolean;
  isLoadingMore: boolean;
  hasNext: boolean;
  error: unknown;
  loadMore: () => void;
  refresh: () => void;
};

const DEFAULT_SIZE = 20;

const useAdminUserHistories = (
  publicId?: string | null,
  size = DEFAULT_SIZE,
): UseAdminUserHistoriesReturn => {
  const getKey = useCallback(
    (pageIndex: number, previousPageData: HistoryPage | null) => {
      if (!publicId) {
        return null;
      }
      if (previousPageData && previousPageData.last) {
        return null;
      }
      return ['admin', 'user-histories', publicId, pageIndex, size] as const;
    },
    [publicId, size],
  );

  const {
    data,
    error,
    isLoading,
    isValidating,
    size: pageCount,
    setSize,
    mutate,
  } = useSWRInfinite(getKey, ([, , id, page, sz]) =>
    getAdminUserHistories(id as string, { page: page as number, size: sz as number }),
  );

  const items = useMemo<AdminUserHistory[]>(
    () => (data ?? []).flatMap((page) => page.content),
    [data],
  );
  const totalElements = data?.[0]?.totalElements ?? 0;
  const lastPage = data?.[data.length - 1];
  const hasNext = lastPage ? !lastPage.last : false;
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

export default useAdminUserHistories;
