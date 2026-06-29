import { useCallback, useMemo } from 'react';
import useSWRInfinite from 'swr/infinite';
import { getMyAttempts, getUserAttempts } from '@/api/attempt';
import type { AttemptListItem } from '@/types';

type AttemptPage = {
  content: AttemptListItem[];
  totalElements: number;
  last: boolean;
};

export type UseMyAttemptsInfiniteParams = {
  /** 지정 시 타 유저 풀이 기록(공개 프로필) 조회, 없으면 본인 */
  userId?: string;
  size?: number;
  /** 퀴즈 제목 부분일치 검색 */
  title?: string;
};

export type UseMyAttemptsInfiniteReturn = {
  items: AttemptListItem[];
  totalElements: number;
  isLoading: boolean;
  isLoadingMore: boolean;
  hasNext: boolean;
  error: unknown;
  loadMore: () => void;
};

const DEFAULT_SIZE = 20;

const useMyAttemptsInfinite = (
  params: UseMyAttemptsInfiniteParams = {},
): UseMyAttemptsInfiniteReturn => {
  const { userId, size = DEFAULT_SIZE, title = '' } = params;
  const normalizedTitle = title.trim();

  const getKey = useCallback(
    (pageIndex: number, previousPageData: AttemptPage | null) => {
      if (previousPageData && previousPageData.last) {
        return null;
      }
      return ['my-attempts-infinite', userId ?? 'me', normalizedTitle, pageIndex, size] as const;
    },
    [userId, normalizedTitle, size],
  );

  const {
    data,
    error,
    isLoading,
    isValidating,
    size: pageCount,
    setSize,
  } = useSWRInfinite(getKey, ([, , t, page, s]) => {
    const query = { page: page as number, size: s as number, title: t as string };
    return userId ? getUserAttempts(userId, query) : getMyAttempts(query);
  });

  const items = useMemo<AttemptListItem[]>(
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

export default useMyAttemptsInfinite;
