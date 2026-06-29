import { useCallback, useMemo } from 'react';
import useSWRInfinite from 'swr/infinite';
import { getMyStarredQuizzes } from '@/api/quiz';
import type { Quiz } from '@/types';

type QuizPage = {
  content: Quiz[];
  totalElements: number;
  last: boolean;
};

export type UseStarredQuizzesParams = {
  size?: number;
  /** 퀴즈 제목 부분일치 검색 */
  title?: string;
};

export type UseStarredQuizzesReturn = {
  items: Quiz[];
  totalElements: number;
  isLoading: boolean;
  isLoadingMore: boolean;
  hasNext: boolean;
  error: unknown;
  loadMore: () => void;
  /** 스타 취소된 퀴즈를 목록에서 즉시 제거 (재검증 없는 낙관적 제거) */
  removeQuiz: (quizId: number) => void;
};

const DEFAULT_SIZE = 20;

const useStarredQuizzes = (params: UseStarredQuizzesParams = {}): UseStarredQuizzesReturn => {
  const { size = DEFAULT_SIZE, title = '' } = params;
  const normalizedTitle = title.trim();

  const getKey = useCallback(
    (pageIndex: number, previousPageData: QuizPage | null) => {
      if (previousPageData && previousPageData.last) {
        return null;
      }
      return ['starred-quizzes', normalizedTitle, pageIndex, size] as const;
    },
    [normalizedTitle, size],
  );

  const {
    data,
    error,
    isLoading,
    isValidating,
    size: pageCount,
    setSize,
    mutate,
  } = useSWRInfinite(getKey, ([, t, page, s]) =>
    getMyStarredQuizzes({ page: page as number, size: s as number, title: t as string }),
  );

  const items = useMemo<Quiz[]>(() => (data ?? []).flatMap((page) => page.content), [data]);

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

  const removeQuiz = useCallback(
    (quizId: number) => {
      void mutate(
        (pages) => {
          if (!pages) {
            return pages;
          }
          const present = pages.some((page) => page.content.some((q) => q.id === quizId));
          if (!present) {
            return pages;
          }
          return pages.map((page, idx) => ({
            ...page,
            content: page.content.filter((q) => q.id !== quizId),
            totalElements: idx === 0 ? Math.max(0, page.totalElements - 1) : page.totalElements,
          }));
        },
        { revalidate: false },
      );
    },
    [mutate],
  );

  return {
    items,
    totalElements,
    isLoading,
    isLoadingMore,
    hasNext,
    error,
    loadMore,
    removeQuiz,
  };
};

export default useStarredQuizzes;
