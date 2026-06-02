import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import React from 'react';
import { SWRConfig } from 'swr';
import useStarredQuizzes from './useStarredQuizzes';
import type { Quiz } from '@/types';

// ── API mock ─────────────────────────────────────────────────────────────────
const mockGetMyStarredQuizzes = vi.hoisted(() => vi.fn());

vi.mock('@/api/quiz', () => ({
  getMyStarredQuizzes: mockGetMyStarredQuizzes,
}));

// ── 샘플 데이터 ───────────────────────────────────────────────────────────────
const makeQuiz = (id: number): Quiz => ({
  id,
  authorNickname: '작성자',
  title: `퀴즈 ${id}`,
  description: '',
  category: 'game',
  thumbnailUrl: null,
  playCount: 0,
  starCount: 0,
  commentCount: 0,
  shareCount: 0,
  isStarred: true,
  isPublic: true,
  createdAt: '2026-05-01T00:00:00+09:00',
});

const makePage = (quizzes: Quiz[], last: boolean, totalElements: number) => ({
  content: quizzes,
  totalElements,
  last,
});

// ── SWR 격리 wrapper ──────────────────────────────────────────────────────────
const wrapper = ({ children }: { children: React.ReactNode }) =>
  React.createElement(
    SWRConfig,
    { value: { provider: () => new Map(), dedupingInterval: 0 } },
    children,
  );

describe('useStarredQuizzes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('초기 로딩', () => {
    it('fetch 완료 전에는 isLoading=true, items=[], totalElements=0 이다', () => {
      mockGetMyStarredQuizzes.mockReturnValue(new Promise(() => {}));
      const { result } = renderHook(() => useStarredQuizzes(), { wrapper });

      expect(result.current.isLoading).toBe(true);
      expect(result.current.items).toEqual([]);
      expect(result.current.totalElements).toBe(0);
      expect(result.current.error).toBeUndefined();
    });

    it('기본 size(20) 와 page 0 으로 getMyStarredQuizzes 를 호출한다', async () => {
      mockGetMyStarredQuizzes.mockResolvedValue(makePage([makeQuiz(1)], true, 1));
      renderHook(() => useStarredQuizzes(), { wrapper });

      await waitFor(() => expect(mockGetMyStarredQuizzes).toHaveBeenCalled());

      expect(mockGetMyStarredQuizzes).toHaveBeenCalledWith({ page: 0, size: 20, title: '' });
    });

    it('size 옵션이 fetcher 에 전달된다', async () => {
      mockGetMyStarredQuizzes.mockResolvedValue(makePage([makeQuiz(1)], true, 1));
      renderHook(() => useStarredQuizzes({ size: 5 }), { wrapper });

      await waitFor(() => expect(mockGetMyStarredQuizzes).toHaveBeenCalled());

      expect(mockGetMyStarredQuizzes).toHaveBeenCalledWith({ page: 0, size: 5, title: '' });
    });
  });

  describe('응답 집계', () => {
    it('첫 페이지 content 가 items 로 매핑된다', async () => {
      mockGetMyStarredQuizzes.mockResolvedValue(makePage([makeQuiz(1), makeQuiz(2)], true, 2));
      const { result } = renderHook(() => useStarredQuizzes(), { wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(result.current.items.map((q) => q.id)).toEqual([1, 2]);
    });

    it('totalElements 는 첫 페이지 값에서 가져온다', async () => {
      mockGetMyStarredQuizzes.mockResolvedValue(makePage([makeQuiz(1)], false, 42));
      const { result } = renderHook(() => useStarredQuizzes(), { wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(result.current.totalElements).toBe(42);
    });

    it('last=true 이면 hasNext=false, last=false 이면 hasNext=true', async () => {
      mockGetMyStarredQuizzes.mockResolvedValue(makePage([makeQuiz(1)], true, 1));
      const { result } = renderHook(() => useStarredQuizzes(), { wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(result.current.hasNext).toBe(false);
    });

    it('last=false 이면 hasNext=true 이다', async () => {
      mockGetMyStarredQuizzes.mockResolvedValue(makePage([makeQuiz(1)], false, 10));
      const { result } = renderHook(() => useStarredQuizzes(), { wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(result.current.hasNext).toBe(true);
    });
  });

  describe('loadMore — 페이지 누적', () => {
    it('loadMore 호출 시 다음 페이지를 fetch 하고 items 를 누적한다', async () => {
      mockGetMyStarredQuizzes.mockImplementation(({ page }: { page: number }) =>
        page === 0
          ? Promise.resolve(makePage([makeQuiz(1), makeQuiz(2)], false, 4))
          : Promise.resolve(makePage([makeQuiz(3), makeQuiz(4)], true, 4)),
      );

      const { result } = renderHook(() => useStarredQuizzes({ size: 2 }), { wrapper });

      await waitFor(() => expect(result.current.items).toHaveLength(2));
      expect(result.current.hasNext).toBe(true);

      act(() => {
        result.current.loadMore();
      });

      await waitFor(() => expect(result.current.items).toHaveLength(4));
      expect(result.current.items.map((q) => q.id)).toEqual([1, 2, 3, 4]);
      expect(result.current.hasNext).toBe(false);
      expect(mockGetMyStarredQuizzes).toHaveBeenCalledWith({ page: 1, size: 2, title: '' });
    });

    it('hasNext=false 이면 loadMore 가 추가 fetch 를 하지 않는다', async () => {
      mockGetMyStarredQuizzes.mockResolvedValue(makePage([makeQuiz(1)], true, 1));
      const { result } = renderHook(() => useStarredQuizzes(), { wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));
      expect(mockGetMyStarredQuizzes).toHaveBeenCalledTimes(1);

      act(() => {
        result.current.loadMore();
      });

      // hasNext=false 라 호출 횟수 변화 없음
      await waitFor(() => expect(result.current.isLoading).toBe(false));
      expect(mockGetMyStarredQuizzes).toHaveBeenCalledTimes(1);
    });
  });

  describe('title 전달', () => {
    it('title 이 fetcher 와 SWR key 에 전달된다', async () => {
      mockGetMyStarredQuizzes.mockResolvedValue(makePage([makeQuiz(1)], true, 1));
      renderHook(() => useStarredQuizzes({ title: '리액트' }), { wrapper });

      await waitFor(() => expect(mockGetMyStarredQuizzes).toHaveBeenCalled());

      expect(mockGetMyStarredQuizzes).toHaveBeenCalledWith(
        expect.objectContaining({ title: '리액트', page: 0 }),
      );
    });

    it('title 의 앞뒤 공백은 정규화되어 전달된다', async () => {
      mockGetMyStarredQuizzes.mockResolvedValue(makePage([makeQuiz(1)], true, 1));
      renderHook(() => useStarredQuizzes({ title: '  리액트  ' }), { wrapper });

      await waitFor(() => expect(mockGetMyStarredQuizzes).toHaveBeenCalled());

      expect(mockGetMyStarredQuizzes).toHaveBeenCalledWith(
        expect.objectContaining({ title: '리액트' }),
      );
    });
  });

  describe('removeQuiz — 낙관적 제거', () => {
    it('removeQuiz(id) 후 items 에서 해당 퀴즈가 사라지고 totalElements 가 1 감소한다', async () => {
      mockGetMyStarredQuizzes.mockResolvedValue(
        makePage([makeQuiz(1), makeQuiz(2), makeQuiz(3)], true, 3),
      );
      const { result } = renderHook(() => useStarredQuizzes(), { wrapper });

      await waitFor(() => expect(result.current.items).toHaveLength(3));
      expect(result.current.totalElements).toBe(3);

      act(() => {
        result.current.removeQuiz(2);
      });

      await waitFor(() => expect(result.current.items.map((q) => q.id)).toEqual([1, 3]));
      expect(result.current.items.map((q) => q.id)).not.toContain(2);
      expect(result.current.totalElements).toBe(2);
    });

    it('여러 페이지에서도 해당 퀴즈만 제거하고 totalElements 는 첫 페이지에서만 감소한다', async () => {
      mockGetMyStarredQuizzes.mockImplementation(({ page }: { page: number }) =>
        page === 0
          ? Promise.resolve(makePage([makeQuiz(1), makeQuiz(2)], false, 4))
          : Promise.resolve(makePage([makeQuiz(3), makeQuiz(4)], true, 4)),
      );
      const { result } = renderHook(() => useStarredQuizzes({ size: 2 }), { wrapper });

      await waitFor(() => expect(result.current.items).toHaveLength(2));
      act(() => {
        result.current.loadMore();
      });
      await waitFor(() => expect(result.current.items).toHaveLength(4));
      expect(result.current.totalElements).toBe(4);

      act(() => {
        result.current.removeQuiz(3);
      });

      await waitFor(() => expect(result.current.items.map((q) => q.id)).toEqual([1, 2, 4]));
      expect(result.current.totalElements).toBe(3);
    });

    it('존재하지 않는 id 를 제거하면 items 목록은 그대로다 (제거 no-op)', async () => {
      mockGetMyStarredQuizzes.mockResolvedValue(makePage([makeQuiz(1), makeQuiz(2)], true, 2));
      const { result } = renderHook(() => useStarredQuizzes(), { wrapper });

      await waitFor(() => expect(result.current.items).toHaveLength(2));
      const before = result.current.items.map((q) => q.id);

      act(() => {
        result.current.removeQuiz(999);
      });

      // content 에 없는 id 이므로 어떤 퀴즈도 제거되지 않는다
      await waitFor(() => expect(result.current.items).toHaveLength(2));
      expect(result.current.items.map((q) => q.id)).toEqual(before);
    });
  });

  describe('에러 노출', () => {
    it('API 실패 시 error 가 노출되고 items 는 [] 이다', async () => {
      mockGetMyStarredQuizzes.mockRejectedValue(new Error('서버 오류'));
      const { result } = renderHook(() => useStarredQuizzes(), { wrapper });

      await waitFor(() => expect(result.current.error).toBeDefined());

      expect(result.current.items).toEqual([]);
      expect(result.current.isLoading).toBe(false);
    });
  });
});
