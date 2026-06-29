import { useCallback, useMemo } from 'react';
import useSWRInfinite from 'swr/infinite';
import { getReceivedNotifications, type ReceivedNotificationPage } from '@/api/notification';
import type { UserNotification } from '@/types';

export type UseReceivedNotificationsParams = {
  size?: number;
};

export type UseReceivedNotificationsReturn = {
  items: UserNotification[];
  totalElements: number;
  isLoading: boolean;
  isLoadingMore: boolean;
  hasNext: boolean;
  error: unknown;
  loadMore: () => void;
};

const DEFAULT_SIZE = 20;

/** 받은 알림 전체(최신순)를 무한 스크롤로 조회. read 무관 히스토리. */
const useReceivedNotifications = (
  params: UseReceivedNotificationsParams = {},
): UseReceivedNotificationsReturn => {
  const { size = DEFAULT_SIZE } = params;

  const getKey = useCallback(
    (pageIndex: number, previousPageData: ReceivedNotificationPage | null) => {
      if (previousPageData && previousPageData.last) {
        return null;
      }
      return ['received-notifications', pageIndex, size] as const;
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
  } = useSWRInfinite(getKey, ([, page, s]) =>
    getReceivedNotifications({ page: page as number, size: s as number }),
  );

  const items = useMemo<UserNotification[]>(
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

export default useReceivedNotifications;
