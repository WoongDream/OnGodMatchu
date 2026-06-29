import { useCallback, useMemo } from 'react';
import useSWRInfinite from 'swr/infinite';
import { getBoNicknames } from '@/api/admin';
import type { ForbiddenNickname, NicknameRuleFilter } from '@/types';

type BoNicknamePage = Awaited<ReturnType<typeof getBoNicknames>>;

export type UseBoNicknamesParams = {
  filter?: NicknameRuleFilter;
  query?: string;
  size?: number;
};

export type UseBoNicknamesReturn = {
  items: ForbiddenNickname[];
  totalElements: number;
  isLoading: boolean;
  isLoadingMore: boolean;
  hasNext: boolean;
  error: unknown;
  loadMore: () => void;
  refresh: () => void;
};

const DEFAULT_SIZE = 20;

const useBoNicknames = (params: UseBoNicknamesParams = {}): UseBoNicknamesReturn => {
  const { filter = 'ALL', query = '', size = DEFAULT_SIZE } = params;

  const getKey = useCallback(
    (pageIndex: number, previousPageData: BoNicknamePage | null) => {
      if (previousPageData && previousPageData.last) {
        return null;
      }
      return ['admin', 'nicknames', filter, query, pageIndex, size] as const;
    },
    [filter, query, size],
  );

  const {
    data,
    error,
    isLoading,
    isValidating,
    size: pageCount,
    setSize,
    mutate,
  } = useSWRInfinite(getKey, ([, , f, q, page, s]) =>
    getBoNicknames({
      filter: f as NicknameRuleFilter,
      query: (q as string) || undefined,
      page: page as number,
      size: s as number,
    }),
  );

  const items = useMemo<ForbiddenNickname[]>(
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

  const refresh = useCallback(() => {
    mutate();
  }, [mutate]);

  return { items, totalElements, isLoading, isLoadingMore, hasNext, error, loadMore, refresh };
};

export default useBoNicknames;
