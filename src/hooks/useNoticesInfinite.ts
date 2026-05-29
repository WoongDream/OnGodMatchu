import { useCallback, useMemo } from 'react';
import useSWRInfinite from 'swr/infinite';
import { getAnnouncements, type NoticePage } from '@/api/notice';
import type { NoticeListItem } from '@/types';

export type UseNoticesInfiniteParams = {
  size?: number;
};

export type UseNoticesInfiniteReturn = {
  items: NoticeListItem[];
  totalElements: number;
  isLoading: boolean;
  isLoadingMore: boolean;
  hasNext: boolean;
  error: unknown;
  loadMore: () => void;
};

const DEFAULT_SIZE = 20;

const useNoticesInfinite = (params: UseNoticesInfiniteParams = {}): UseNoticesInfiniteReturn => {
  const { size = DEFAULT_SIZE } = params;

  const getKey = useCallback(
    (pageIndex: number, previousPageData: NoticePage | null) => {
      if (previousPageData && previousPageData.last) {
        return null;
      }
      return ['notices', 'announcements', pageIndex, size] as const;
    },
    [size],
  );

  const {
    data,
    error,
    isLoading,
    isValidating,
    size: pageCount,
    setSize,
  } = useSWRInfinite(getKey, ([, , page, s]) =>
    getAnnouncements({ page: page as number, size: s as number }),
  );

  const items = useMemo<NoticeListItem[]>(
    () => (data ?? []).flatMap((page) => page.content),
    [data],
  );

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

  return {
    items,
    totalElements,
    isLoading,
    isLoadingMore,
    hasNext,
    error,
    loadMore,
  };
};

export default useNoticesInfinite;
