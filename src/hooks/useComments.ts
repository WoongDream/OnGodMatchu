import { useCallback, useState } from 'react';
import useSWR from 'swr';
import {
  createComment as createCommentApi,
  deleteComment as deleteCommentApi,
  getComments,
  mapCommentError,
  type CommentErrorCode,
} from '@/api/comment';
import type { Comment, CommentPage } from '@/types';

type UseCommentsParams = {
  page?: number;
  size?: number;
};

type UseCommentsReturn = {
  comments: Comment[];
  totalElements: number;
  totalPages: number;
  isLoading: boolean;
  error: unknown;
  create: (content: string) => Promise<Comment | null>;
  remove: (commentId: number) => Promise<boolean>;
  isMutating: boolean;
  mutationError: CommentErrorCode | null;
};

const useComments = (quizId: number, params?: UseCommentsParams): UseCommentsReturn => {
  const page = params?.page ?? 0;
  const size = params?.size ?? 20;
  const key = ['comments', quizId, page, size];
  const { data, isLoading, error, mutate } = useSWR<CommentPage>(
    Number.isFinite(quizId) ? key : null,
    () => getComments(quizId, { page, size }),
  );

  const [isMutating, setIsMutating] = useState(false);
  const [mutationError, setMutationError] = useState<CommentErrorCode | null>(null);

  const create = useCallback(
    async (content: string): Promise<Comment | null> => {
      setIsMutating(true);
      setMutationError(null);
      try {
        const created = await createCommentApi(quizId, content);
        await mutate();
        return created;
      } catch (e) {
        setMutationError(mapCommentError(e));
        return null;
      } finally {
        setIsMutating(false);
      }
    },
    [quizId, mutate],
  );

  const remove = useCallback(
    async (commentId: number): Promise<boolean> => {
      setIsMutating(true);
      setMutationError(null);
      try {
        await deleteCommentApi(commentId);
        await mutate();
        return true;
      } catch (e) {
        setMutationError(mapCommentError(e));
        return false;
      } finally {
        setIsMutating(false);
      }
    },
    [mutate],
  );

  return {
    comments: data?.content ?? [],
    totalElements: data?.totalElements ?? 0,
    totalPages: data?.totalPages ?? 0,
    isLoading,
    error,
    create,
    remove,
    isMutating,
    mutationError,
  };
};

export default useComments;
