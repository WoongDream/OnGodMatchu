import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import React from 'react';
import { SWRConfig } from 'swr';
import { AxiosError } from 'axios';
import useMyQuizzes from './useMyQuizzes';
import type { MyQuizListItem } from '@/types';

// ── API mock ─────────────────────────────────────────────────────────────────
const mockGetMyQuizzes = vi.hoisted(() => vi.fn());
const mockGetUserQuizzes = vi.hoisted(() => vi.fn());
const mockUpdateQuiz = vi.hoisted(() => vi.fn());
const mockDeleteQuiz = vi.hoisted(() => vi.fn());

vi.mock('@/api/quiz', () => ({
  getMyQuizzes: mockGetMyQuizzes,
  getUserQuizzes: mockGetUserQuizzes,
  updateQuiz: mockUpdateQuiz,
  deleteQuiz: mockDeleteQuiz,
  mapQuizError: (error: unknown): string => {
    const err = error as { response?: { status?: number; data?: { error?: { code?: string } } } };
    const status = err.response?.status;
    const code = err.response?.data?.error?.code;
    if (code === 'QUIZ_NOT_FOUND' || status === 404) {
      return 'QUIZ_NOT_FOUND';
    }
    if (code === 'QUIZ_FORBIDDEN' || code === 'FORBIDDEN' || status === 403) {
      return 'FORBIDDEN';
    }
    if (code === 'INVALID_INPUT' || status === 400) {
      return 'INVALID_INPUT';
    }
    if (status === 401) {
      return 'UNAUTHORIZED';
    }
    return 'NETWORK';
  },
}));

// ── 가짜 axios 에러 생성 헬퍼 ─────────────────────────────────────────────
const makeAxiosError = (status: number, code?: string): AxiosError => {
  const err = new AxiosError('failed');
  err.response = {
    status,
    data: code ? { error: { code } } : {},
    headers: {},
    config: {} as never,
    statusText: '',
  };
  return err;
};

// ── 샘플 데이터 ───────────────────────────────────────────────────────────────
const MOCK_ITEM: MyQuizListItem = {
  id: 1,
  publicId: 'uuid-1',
  title: '테스트 퀴즈',
  category: 'game',
  categoryLabel: '게임',
  isPublic: true,
  thumbnailKey: null,
  thumbnailUrl: null,
  playCount: 10,
  shareCount: 5,
  starCount: 3,
  commentCount: 2,
  correctRate: 75,
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-02T00:00:00Z',
};

const MOCK_PAGE = {
  content: [MOCK_ITEM],
  totalElements: 1,
  totalPages: 1,
  number: 0,
  size: 10,
  first: true,
  last: true,
  empty: false,
};

// ── SWR 격리 wrapper ──────────────────────────────────────────────────────────
const wrapper = ({ children }: { children: React.ReactNode }) =>
  React.createElement(
    SWRConfig,
    { value: { provider: () => new Map(), dedupingInterval: 0 } },
    children,
  );

// ── 테스트 ────────────────────────────────────────────────────────────────────
describe('useMyQuizzes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('초기 상태', () => {
    it('fetch 완료 전에는 isLoading=true, items=[], isMutating=false', () => {
      mockGetMyQuizzes.mockReturnValue(new Promise(() => {}));
      const { result } = renderHook(() => useMyQuizzes(), { wrapper });

      expect(result.current.isLoading).toBe(true);
      expect(result.current.items).toEqual([]);
      expect(result.current.totalElements).toBe(0);
      expect(result.current.totalPages).toBe(0);
      expect(result.current.isMutating).toBe(false);
      expect(result.current.mutationErrorCode).toBeNull();
    });
  });

  describe('데이터 로딩', () => {
    it('userId 미지정 시 getMyQuizzes 를 호출한다', async () => {
      mockGetMyQuizzes.mockResolvedValue(MOCK_PAGE);
      const { result } = renderHook(() => useMyQuizzes(), { wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(mockGetMyQuizzes).toHaveBeenCalledTimes(1);
      expect(mockGetUserQuizzes).not.toHaveBeenCalled();
    });

    it('응답 content 가 items 로 매핑된다', async () => {
      mockGetMyQuizzes.mockResolvedValue(MOCK_PAGE);
      const { result } = renderHook(() => useMyQuizzes(), { wrapper });

      await waitFor(() => expect(result.current.items).toHaveLength(1));

      expect(result.current.items[0]).toEqual(MOCK_ITEM);
      expect(result.current.totalElements).toBe(1);
      expect(result.current.totalPages).toBe(1);
    });

    it('userId 지정 시 getUserQuizzes 를 호출한다', async () => {
      mockGetUserQuizzes.mockResolvedValue(MOCK_PAGE);
      const { result } = renderHook(() => useMyQuizzes({ userId: 'user-42' }), { wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(mockGetUserQuizzes).toHaveBeenCalledWith('user-42', expect.objectContaining({}));
      expect(mockGetMyQuizzes).not.toHaveBeenCalled();
    });

    it('userId 지정 시 sort/page/size 를 getUserQuizzes 에 전달한다', async () => {
      mockGetUserQuizzes.mockResolvedValue(MOCK_PAGE);
      renderHook(() => useMyQuizzes({ userId: 'u1', sort: 'plays', page: 2, size: 5 }), {
        wrapper,
      });

      await waitFor(() => expect(mockGetUserQuizzes).toHaveBeenCalled());

      expect(mockGetUserQuizzes).toHaveBeenCalledWith(
        'u1',
        expect.objectContaining({ sort: 'plays', page: 2, size: 5 }),
      );
    });

    it('API 실패 시 error 가 노출된다', async () => {
      mockGetMyQuizzes.mockRejectedValue(new Error('network'));
      const { result } = renderHook(() => useMyQuizzes(), { wrapper });

      await waitFor(() => expect(result.current.error).toBeDefined());

      expect(result.current.items).toEqual([]);
    });
  });

  describe('remove()', () => {
    it('성공 시 deleteQuiz 를 quizId 로 호출하고 true 를 반환한다', async () => {
      mockGetMyQuizzes.mockResolvedValue(MOCK_PAGE);
      mockDeleteQuiz.mockResolvedValue(undefined);

      const { result } = renderHook(() => useMyQuizzes(), { wrapper });
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      let returned: boolean | undefined;
      await act(async () => {
        returned = await result.current.remove(1);
      });

      expect(mockDeleteQuiz).toHaveBeenCalledWith(1);
      expect(returned).toBe(true);
    });

    it('성공 시 mutationErrorCode 가 null 이다', async () => {
      mockGetMyQuizzes.mockResolvedValue(MOCK_PAGE);
      mockDeleteQuiz.mockResolvedValue(undefined);

      const { result } = renderHook(() => useMyQuizzes(), { wrapper });
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      await act(async () => {
        await result.current.remove(1);
      });

      expect(result.current.mutationErrorCode).toBeNull();
    });

    it('실패(axios 404) 시 false 를 반환하고 mutationErrorCode=QUIZ_NOT_FOUND', async () => {
      mockGetMyQuizzes.mockResolvedValue(MOCK_PAGE);
      mockDeleteQuiz.mockRejectedValue(makeAxiosError(404));

      const { result } = renderHook(() => useMyQuizzes(), { wrapper });
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      let returned: boolean | undefined;
      await act(async () => {
        returned = await result.current.remove(99);
      });

      expect(returned).toBe(false);
      expect(result.current.mutationErrorCode).toBe('QUIZ_NOT_FOUND');
    });

    it('실패(axios 403) 시 mutationErrorCode=FORBIDDEN', async () => {
      mockGetMyQuizzes.mockResolvedValue(MOCK_PAGE);
      mockDeleteQuiz.mockRejectedValue(makeAxiosError(403));

      const { result } = renderHook(() => useMyQuizzes(), { wrapper });
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      await act(async () => {
        await result.current.remove(1);
      });

      expect(result.current.mutationErrorCode).toBe('FORBIDDEN');
    });

    it('실패(비-axios 에러) 시 mutationErrorCode=NETWORK', async () => {
      mockGetMyQuizzes.mockResolvedValue(MOCK_PAGE);
      mockDeleteQuiz.mockRejectedValue(new Error('unknown'));

      const { result } = renderHook(() => useMyQuizzes(), { wrapper });
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      await act(async () => {
        await result.current.remove(1);
      });

      expect(result.current.mutationErrorCode).toBe('NETWORK');
    });

    it('호출 중 isMutating=true → 완료 후 false', async () => {
      mockGetMyQuizzes.mockResolvedValue(MOCK_PAGE);
      let resolveDelete!: () => void;
      mockDeleteQuiz.mockReturnValue(
        new Promise<void>((res) => {
          resolveDelete = res;
        }),
      );

      const { result } = renderHook(() => useMyQuizzes(), { wrapper });
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      act(() => {
        result.current.remove(1);
      });
      await waitFor(() => expect(result.current.isMutating).toBe(true));

      await act(async () => {
        resolveDelete();
      });
      expect(result.current.isMutating).toBe(false);
    });
  });

  describe('update()', () => {
    it('성공 시 updateQuiz 를 quizId + payload 로 호출하고 true 를 반환한다', async () => {
      mockGetMyQuizzes.mockResolvedValue(MOCK_PAGE);
      mockUpdateQuiz.mockResolvedValue({ id: 1, title: '수정됨' });

      const { result } = renderHook(() => useMyQuizzes(), { wrapper });
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      let returned: boolean | undefined;
      await act(async () => {
        returned = await result.current.update(1, { title: '수정됨' });
      });

      expect(mockUpdateQuiz).toHaveBeenCalledWith(1, { title: '수정됨' });
      expect(returned).toBe(true);
    });

    it('실패(axios 401) 시 false 반환 + mutationErrorCode=UNAUTHORIZED', async () => {
      mockGetMyQuizzes.mockResolvedValue(MOCK_PAGE);
      mockUpdateQuiz.mockRejectedValue(makeAxiosError(401));

      const { result } = renderHook(() => useMyQuizzes(), { wrapper });
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      let returned: boolean | undefined;
      await act(async () => {
        returned = await result.current.update(1, { title: '나쁜' });
      });

      expect(returned).toBe(false);
      expect(result.current.mutationErrorCode).toBe('UNAUTHORIZED');
    });

    it('실패(비-axios) 시 mutationErrorCode=NETWORK', async () => {
      mockGetMyQuizzes.mockResolvedValue(MOCK_PAGE);
      mockUpdateQuiz.mockRejectedValue(new Error('boom'));

      const { result } = renderHook(() => useMyQuizzes(), { wrapper });
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      await act(async () => {
        await result.current.update(1, { title: 'x' });
      });

      expect(result.current.mutationErrorCode).toBe('NETWORK');
    });
  });

  describe('toggleVisibility()', () => {
    it('성공 시 updateQuiz 를 { isPublic } 으로 호출하고 true 를 반환한다', async () => {
      mockGetMyQuizzes.mockResolvedValue(MOCK_PAGE);
      mockUpdateQuiz.mockResolvedValue({ id: 1 });

      const { result } = renderHook(() => useMyQuizzes(), { wrapper });
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      let returned: boolean | undefined;
      await act(async () => {
        returned = await result.current.toggleVisibility(1, false);
      });

      expect(mockUpdateQuiz).toHaveBeenCalledWith(1, { isPublic: false });
      expect(returned).toBe(true);
    });

    it('실패(axios 403) 시 false 반환 + mutationErrorCode=FORBIDDEN', async () => {
      mockGetMyQuizzes.mockResolvedValue(MOCK_PAGE);
      mockUpdateQuiz.mockRejectedValue(makeAxiosError(403));

      const { result } = renderHook(() => useMyQuizzes(), { wrapper });
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      let returned: boolean | undefined;
      await act(async () => {
        returned = await result.current.toggleVisibility(1, true);
      });

      expect(returned).toBe(false);
      expect(result.current.mutationErrorCode).toBe('FORBIDDEN');
    });

    it('실패(비-axios) 시 mutationErrorCode=NETWORK', async () => {
      mockGetMyQuizzes.mockResolvedValue(MOCK_PAGE);
      mockUpdateQuiz.mockRejectedValue(new TypeError('net'));

      const { result } = renderHook(() => useMyQuizzes(), { wrapper });
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      await act(async () => {
        await result.current.toggleVisibility(1, true);
      });

      expect(result.current.mutationErrorCode).toBe('NETWORK');
    });
  });

  describe('mapQuizError 결과를 mutationErrorCode 로 노출', () => {
    it('400 응답 → INVALID_INPUT', async () => {
      mockGetMyQuizzes.mockResolvedValue(MOCK_PAGE);
      mockDeleteQuiz.mockRejectedValue(makeAxiosError(400));

      const { result } = renderHook(() => useMyQuizzes(), { wrapper });
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      await act(async () => {
        await result.current.remove(1);
      });

      expect(result.current.mutationErrorCode).toBe('INVALID_INPUT');
    });

    it('code=FORBIDDEN → FORBIDDEN', async () => {
      mockGetMyQuizzes.mockResolvedValue(MOCK_PAGE);
      mockDeleteQuiz.mockRejectedValue(makeAxiosError(400, 'FORBIDDEN'));

      const { result } = renderHook(() => useMyQuizzes(), { wrapper });
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      await act(async () => {
        await result.current.remove(1);
      });

      expect(result.current.mutationErrorCode).toBe('FORBIDDEN');
    });
  });

  describe('clearMutationError()', () => {
    it('에러 발생 후 clearMutationError 호출 시 mutationErrorCode 가 null 이 된다', async () => {
      mockGetMyQuizzes.mockResolvedValue(MOCK_PAGE);
      mockDeleteQuiz.mockRejectedValue(makeAxiosError(404));

      const { result } = renderHook(() => useMyQuizzes(), { wrapper });
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      await act(async () => {
        await result.current.remove(1);
      });

      expect(result.current.mutationErrorCode).toBe('QUIZ_NOT_FOUND');

      act(() => {
        result.current.clearMutationError();
      });

      expect(result.current.mutationErrorCode).toBeNull();
    });
  });
});
