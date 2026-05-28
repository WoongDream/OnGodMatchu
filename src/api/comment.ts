import instance from './instance';
import type { Comment, CommentPage } from '@/types';

type ApiResponse<T> = {
  success: boolean;
  data: T;
};

export type CommentErrorCode =
  | 'COMMENT_NOT_FOUND'
  | 'COMMENT_FORBIDDEN'
  | 'INVALID_COMMENT_FORMAT'
  | 'UNAUTHORIZED'
  | 'NETWORK';

type ErrorResponseBody = {
  error?: { code?: string };
};

export const COMMENT_MAX_LENGTH = 500;

export const getComments = async (
  quizId: number,
  params?: { page?: number; size?: number },
): Promise<CommentPage> => {
  const res = await instance.get<ApiResponse<CommentPage>>(`/api/quizzes/${quizId}/comments`, {
    params: { page: params?.page ?? 0, size: params?.size ?? 20 },
  });
  return res.data.data;
};

export const createComment = async (quizId: number, content: string): Promise<Comment> => {
  const res = await instance.post<ApiResponse<Comment>>(`/api/quizzes/${quizId}/comments`, {
    content,
  });
  return res.data.data;
};

export const deleteComment = async (commentId: number): Promise<void> => {
  await instance.delete(`/api/comments/${commentId}`);
};

export const mapCommentError = (error: unknown): CommentErrorCode => {
  const err = error as { response?: { status?: number; data?: ErrorResponseBody } };
  const status = err.response?.status;
  const code = err.response?.data?.error?.code;

  if (code === 'COMMENT_NOT_FOUND' || status === 404) {
    return 'COMMENT_NOT_FOUND';
  }
  if (code === 'COMMENT_FORBIDDEN' || status === 403) {
    return 'COMMENT_FORBIDDEN';
  }
  if (code === 'INVALID_COMMENT_FORMAT' || status === 400) {
    return 'INVALID_COMMENT_FORMAT';
  }
  if (status === 401) {
    return 'UNAUTHORIZED';
  }
  return 'NETWORK';
};
