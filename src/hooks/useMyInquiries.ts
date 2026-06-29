import { useCallback, useMemo } from 'react';
import useSWRInfinite from 'swr/infinite';
import { getMyInquiries } from '@/api/inquiry';
import type { InquiryListItem } from '@/types';

type MyInquiryPage = Awaited<ReturnType<typeof getMyInquiries>>;

export type UseMyInquiriesReturn = {
  items: InquiryListItem[];
  totalElements: number;
  isLoading: boolean;
  isLoadingMore: boolean;
  hasNext: boolean;
  error: unknown;
  loadMore: () => void;
  refresh: () => void;
};

const DEFAULT_SIZE = 20;

/** 본인 문의 목록(최신순, 받은 답변 포함)을 무한 스크롤로 조회. */
const useMyInquiries = (size = DEFAULT_SIZE): UseMyInquiriesReturn => {
  const getKey = useCallback(
    (pageIndex: number, previousPageData: MyInquiryPage | null) => {
      if (previousPageData && previousPageData.last) {
        return null;
      }
      return ['my-inquiries', pageIndex, size] as const;
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
    mutate,
  } = useSWRInfinite(getKey, ([, page, s]) =>
    getMyInquiries({ page: page as number, size: s as number }),
  );

  const items = useMemo<InquiryListItem[]>(
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

export default useMyInquiries;
