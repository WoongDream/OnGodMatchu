import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import React from 'react';
import { SWRConfig } from 'swr';
import useMyAttemptsInfinite from './useMyAttemptsInfinite';
import type { AttemptListItem } from '@/types';

// ── API mock ─────────────────────────────────────────────────────────────────
const mockGetMyAttempts = vi.hoisted(() => vi.fn());
const mockGetUserAttempts = vi.hoisted(() => vi.fn());

vi.mock('@/api/attempt', () => ({
  getMyAttempts: mockGetMyAttempts,
  getUserAttempts: mockGetUserAttempts,
  submitAttempt: vi.fn(),
  mapAttemptError: vi.fn(),
}));

// ── 샘플 데이터 ───────────────────────────────────────────────────────────────
const makeItem = (id: number): AttemptListItem => ({
  id,
  quizId: id,
  quizPublicId: `public-uuid-${id}`,
  quizTitle: `퀴즈 ${id}`,
  quizCategory: 'game',
  quizCategoryLabel: '게임',
  quizThumbnailKey: null,
  quizThumbnailUrl: null,
  playCount: 100,
  starCount: 10,
  commentCount: 5,
  shareCount: 2,
  score: 3,
  totalQuestions: 5,
  percent: 60,
  topPercentile: null,
  timeLimitSec: null,
  attemptCount: 1,
  completedAt: '2025-01-01T00:00:00Z',
});

const makePage = (items: AttemptListItem[], totalElements: number, last: boolean) => ({
  content: items,
  totalElements,
  totalPages: last ? 1 : 99,
  number: 0,
  size: 20,
  first: true,
  last,
  empty: items.length === 0,
});

// ── SWR 격리 wrapper ──────────────────────────────────────────────────────────
const wrapper = ({ children }: { children: React.ReactNode }) =>
  React.createElement(
    SWRConfig,
    { value: { provider: () => new Map(), dedupingInterval: 0 } },
    children,
  );

// ── 테스트 ────────────────────────────────────────────────────────────────────
describe('useMyAttemptsInfinite', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('초기 로딩', () => {
    it('fetch 완료 전에는 isLoading=true, items=[] 이다', () => {
      mockGetMyAttempts.mockReturnValue(new Promise(() => {}));
      const { result } = renderHook(() => useMyAttemptsInfinite(), { wrapper });

      expect(result.current.isLoading).toBe(true);
      expect(result.current.items).toEqual([]);
      expect(result.current.totalElements).toBe(0);
    });
  });

  describe('userId 없을 때 — getMyAttempts 호출', () => {
    it('userId 미지정 시 getMyAttempts 를 호출한다', async () => {
      mockGetMyAttempts.mockResolvedValue(makePage([makeItem(1)], 1, true));
      const { result } = renderHook(() => useMyAttemptsInfinite(), { wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(mockGetMyAttempts).toHaveBeenCalled();
      expect(mockGetUserAttempts).not.toHaveBeenCalled();
    });

    it('첫 페이지 content 가 items 로 매핑된다', async () => {
      mockGetMyAttempts.mockResolvedValue(makePage([makeItem(1), makeItem(2)], 2, true));
      const { result } = renderHook(() => useMyAttemptsInfinite(), { wrapper });

      await waitFor(() => expect(result.current.items).toHaveLength(2));

      expect(result.current.items.map((i) => i.id)).toEqual([1, 2]);
    });

    it('totalElements 는 첫 페이지 값에서 가져온다', async () => {
      mockGetMyAttempts.mockResolvedValue(makePage([makeItem(1)], 42, false));
      const { result } = renderHook(() => useMyAttemptsInfinite(), { wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(result.current.totalElements).toBe(42);
    });
  });

  describe('userId 있을 때 — getUserAttempts 호출', () => {
    it('userId 지정 시 getUserAttempts(publicId) 를 호출한다', async () => {
      mockGetUserAttempts.mockResolvedValue(makePage([makeItem(1)], 1, true));
      const { result } = renderHook(() => useMyAttemptsInfinite({ userId: 'user-42' }), {
        wrapper,
      });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(mockGetUserAttempts).toHaveBeenCalled();
      expect(mockGetUserAttempts.mock.calls[0][0]).toBe('user-42');
      expect(mockGetMyAttempts).not.toHaveBeenCalled();
    });
  });

  describe('title 검색', () => {
    it('title 이 API 쿼리에 전달된다', async () => {
      mockGetMyAttempts.mockResolvedValue(makePage([makeItem(1)], 1, true));
      renderHook(() => useMyAttemptsInfinite({ title: '역사' }), { wrapper });

      await waitFor(() => expect(mockGetMyAttempts).toHaveBeenCalled());

      const [query] = mockGetMyAttempts.mock.calls[0] as [
        { page: number; size: number; title: string },
      ];
      expect(query.title).toBe('역사');
    });

    it('userId + title 이면 getUserAttempts 에 title 이 전달된다', async () => {
      mockGetUserAttempts.mockResolvedValue(makePage([makeItem(1)], 1, true));
      renderHook(() => useMyAttemptsInfinite({ userId: 'user-7', title: '과학' }), { wrapper });

      await waitFor(() => expect(mockGetUserAttempts).toHaveBeenCalled());

      const call = mockGetUserAttempts.mock.calls[0] as [
        string,
        { page: number; size: number; title: string },
      ];
      expect(call[0]).toBe('user-7');
      expect(call[1].title).toBe('과학');
    });
  });

  describe('hasNext / 페이지 집계', () => {
    it('마지막 페이지면 hasNext=false 이다', async () => {
      mockGetMyAttempts.mockResolvedValue(makePage([makeItem(1)], 1, true));
      const { result } = renderHook(() => useMyAttemptsInfinite(), { wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(result.current.hasNext).toBe(false);
    });

    it('마지막 페이지가 아니면 hasNext=true 이다', async () => {
      mockGetMyAttempts.mockResolvedValue(makePage([makeItem(1)], 50, false));
      const { result } = renderHook(() => useMyAttemptsInfinite(), { wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(result.current.hasNext).toBe(true);
    });

    it('loadMore 가 다음 페이지를 불러와 items 를 누적한다', async () => {
      mockGetMyAttempts.mockImplementation((query: { page: number }) => {
        if (query.page === 0) {
          return Promise.resolve(makePage([makeItem(1), makeItem(2)], 3, false));
        }
        return Promise.resolve(makePage([makeItem(3)], 3, true));
      });

      const { result } = renderHook(() => useMyAttemptsInfinite({ size: 2 }), { wrapper });

      await waitFor(() => expect(result.current.items).toHaveLength(2));
      expect(result.current.hasNext).toBe(true);

      act(() => {
        result.current.loadMore();
      });

      await waitFor(() => expect(result.current.items).toHaveLength(3));
      expect(result.current.items.map((i) => i.id)).toEqual([1, 2, 3]);
      expect(result.current.hasNext).toBe(false);
    });

    it('loadMore 호출 시 다음 페이지 page 인덱스가 증가한다', async () => {
      mockGetMyAttempts.mockImplementation((query: { page: number }) => {
        if (query.page === 0) {
          return Promise.resolve(makePage([makeItem(1)], 2, false));
        }
        return Promise.resolve(makePage([makeItem(2)], 2, true));
      });

      const { result } = renderHook(() => useMyAttemptsInfinite(), { wrapper });

      await waitFor(() => expect(result.current.items).toHaveLength(1));

      act(() => {
        result.current.loadMore();
      });

      await waitFor(() =>
        expect(mockGetMyAttempts.mock.calls.some(([q]) => q.page === 1)).toBe(true),
      );
    });
  });

  describe('에러 노출', () => {
    it('API 실패 시 error 가 노출되고 items 는 [] 이다', async () => {
      mockGetMyAttempts.mockRejectedValue(new Error('서버 오류'));
      const { result } = renderHook(() => useMyAttemptsInfinite(), { wrapper });

      await waitFor(() => expect(result.current.error).toBeDefined());

      expect(result.current.items).toEqual([]);
    });
  });
});
