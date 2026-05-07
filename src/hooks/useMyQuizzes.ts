import { useCallback, useState } from 'react';
import useSWR, { useSWRConfig } from 'swr';
import axios from 'axios';
import {
  getMyQuizzes,
  getUserQuizzes,
  updateQuiz,
  deleteQuiz,
  mapQuizError,
  type MyQuizzesQuery,
  type MyQuizzesVisibilityFilter,
  type MyQuizzesSort,
  type UpdateQuizPayload,
  type QuizErrorCode,
} from '@/api/quiz';
import type { MyQuizListItem } from '@/types';

export type UseMyQuizzesParams = {
  userId?: string;
  visibility?: MyQuizzesVisibilityFilter;
  sort?: MyQuizzesSort;
  page?: number;
  size?: number;
};

export type UseMyQuizzesReturn = {
  items: MyQuizListItem[];
  totalElements: number;
  totalPages: number;
  isLoading: boolean;
  error: unknown;
  isMutating: boolean;
  mutationErrorCode: QuizErrorCode | null;
  clearMutationError: () => void;
  remove: (quizId: number) => Promise<boolean>;
  update: (quizId: number, payload: UpdateQuizPayload) => Promise<boolean>;
  toggleVisibility: (quizId: number, isPublic: boolean) => Promise<boolean>;
  refresh: () => Promise<unknown>;
};

const buildKey = (p: UseMyQuizzesParams) =>
  [
    'my-quizzes',
    p.userId ?? 'me',
    p.visibility ?? 'all',
    p.sort ?? 'latest',
    p.page ?? 0,
    p.size ?? 10,
  ] as const;

const useMyQuizzes = (params: UseMyQuizzesParams = {}): UseMyQuizzesReturn => {
  const { mutate: globalMutate } = useSWRConfig();
  const [isMutating, setIsMutating] = useState(false);
  const [mutationErrorCode, setMutationErrorCode] = useState<QuizErrorCode | null>(null);

  const key = buildKey(params);

  const fetcher = (): Promise<{
    content: MyQuizListItem[];
    totalElements: number;
    totalPages: number;
  }> => {
    const q: MyQuizzesQuery = {
      visibility: params.visibility,
      sort: params.sort,
      page: params.page,
      size: params.size,
    };
    if (params.userId) {
      return getUserQuizzes(params.userId, {
        sort: q.sort,
        page: q.page,
        size: q.size,
      });
    }
    return getMyQuizzes(q);
  };

  const { data, error, isLoading, mutate } = useSWR(key, fetcher);

  const clearMutationError = useCallback(() => setMutationErrorCode(null), []);

  const handleMutationError = (err: unknown): QuizErrorCode => {
    const code = axios.isAxiosError(err) ? mapQuizError(err) : 'NETWORK';
    setMutationErrorCode(code);
    return code;
  };

  const refresh = useCallback(
    () =>
      globalMutate((k) => Array.isArray(k) && k[0] === 'my-quizzes', undefined, {
        revalidate: true,
      }),
    [globalMutate],
  );

  const remove = useCallback(
    async (quizId: number): Promise<boolean> => {
      setIsMutating(true);
      clearMutationError();
      try {
        await deleteQuiz(quizId);
        await refresh();
        return true;
      } catch (err) {
        handleMutationError(err);
        return false;
      } finally {
        setIsMutating(false);
      }
    },
    [refresh, clearMutationError],
  );

  const update = useCallback(
    async (quizId: number, payload: UpdateQuizPayload): Promise<boolean> => {
      setIsMutating(true);
      clearMutationError();
      try {
        await updateQuiz(quizId, payload);
        await refresh();
        return true;
      } catch (err) {
        handleMutationError(err);
        return false;
      } finally {
        setIsMutating(false);
      }
    },
    [refresh, clearMutationError],
  );

  const toggleVisibility = useCallback(
    async (quizId: number, isPublic: boolean): Promise<boolean> => {
      setIsMutating(true);
      clearMutationError();
      try {
        await updateQuiz(quizId, { isPublic });
        await mutate();
        return true;
      } catch (err) {
        handleMutationError(err);
        return false;
      } finally {
        setIsMutating(false);
      }
    },
    [mutate, clearMutationError],
  );

  return {
    items: data?.content ?? [],
    totalElements: data?.totalElements ?? 0,
    totalPages: data?.totalPages ?? 0,
    isLoading,
    error,
    isMutating,
    mutationErrorCode,
    clearMutationError,
    remove,
    update,
    toggleVisibility,
    refresh,
  };
};

export default useMyQuizzes;
