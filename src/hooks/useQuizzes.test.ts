import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import React from 'react';
import { SWRConfig } from 'swr';
import useQuizzes from './useQuizzes';
import type { Quiz } from '@/types';

// ── API mock ─────────────────────────────────────────────────────────────────
const mockGetQuizzes = vi.hoisted(() => vi.fn());

vi.mock('@/api/quiz', () => ({
  getQuizzes: mockGetQuizzes,
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
  isStarred: false,
  isPublic: true,
  createdAt: '2026-05-01T00:00:00+09:00',
});

const makePage = (quizzes: Quiz[], totalPages: number) => ({
  content: quizzes,
  totalPages,
});

// ── SWR 격리 wrapper ──────────────────────────────────────────────────────────
const wrapper = ({ children }: { children: React.ReactNode }) =>
  React.createElement(
    SWRConfig,
    { value: { provider: () => new Map(), dedupingInterval: 0 } },
    children,
  );

describe('useQuizzes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('응답 매핑', () => {
    it('getQuizzes 응답의 content/totalPages 가 quizzes/totalPages 로 매핑된다', async () => {
      mockGetQuizzes.mockResolvedValue(makePage([makeQuiz(1), makeQuiz(2)], 5));
      const { result } = renderHook(() => useQuizzes(), { wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(result.current.quizzes.map((q) => q.id)).toEqual([1, 2]);
      expect(result.current.totalPages).toBe(5);
    });

    it('응답에 content/totalPages 가 없으면 빈 배열과 0 으로 대체된다', async () => {
      mockGetQuizzes.mockResolvedValue({});
      const { result } = renderHook(() => useQuizzes(), { wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(result.current.quizzes).toEqual([]);
      expect(result.current.totalPages).toBe(0);
    });

    it('fetch 완료 전에는 quizzes=[], totalPages=0, isLoading=true 이다', () => {
      mockGetQuizzes.mockReturnValue(new Promise(() => {}));
      const { result } = renderHook(() => useQuizzes(), { wrapper });

      expect(result.current.isLoading).toBe(true);
      expect(result.current.quizzes).toEqual([]);
      expect(result.current.totalPages).toBe(0);
      expect(result.current.error).toBeUndefined();
    });
  });

  describe('params 전달', () => {
    it('category/q/sort 등 params 가 getQuizzes 로 그대로 전달된다', async () => {
      mockGetQuizzes.mockResolvedValue(makePage([makeQuiz(1)], 1));
      const params = { category: 'game', q: '리액트', sort: 'latest' as const, page: 2, size: 10 };
      renderHook(() => useQuizzes(params), { wrapper });

      await waitFor(() => expect(mockGetQuizzes).toHaveBeenCalled());

      expect(mockGetQuizzes).toHaveBeenCalledWith(params);
    });

    it('params 없이 호출하면 getQuizzes 는 undefined 로 호출된다', async () => {
      mockGetQuizzes.mockResolvedValue(makePage([makeQuiz(1)], 1));
      renderHook(() => useQuizzes(), { wrapper });

      await waitFor(() => expect(mockGetQuizzes).toHaveBeenCalled());

      expect(mockGetQuizzes).toHaveBeenCalledWith(undefined);
    });
  });

  describe('SWR key — q / sort 분기', () => {
    it('q 가 다르면 별도의 key 로 각각 다시 fetch 한다', async () => {
      mockGetQuizzes.mockResolvedValue(makePage([makeQuiz(1)], 1));

      const { rerender } = renderHook(({ q }: { q: string }) => useQuizzes({ q }), {
        wrapper,
        initialProps: { q: '리액트' },
      });
      await waitFor(() => expect(mockGetQuizzes).toHaveBeenCalledTimes(1));

      rerender({ q: '뷰' });
      // q 가 바뀌면 SWR key 가 달라져 새 요청이 발생한다
      await waitFor(() => expect(mockGetQuizzes).toHaveBeenCalledTimes(2));
    });

    it('q 의 앞뒤 공백만 다르면 같은 key 로 취급되어 추가 fetch 가 없다', async () => {
      mockGetQuizzes.mockResolvedValue(makePage([makeQuiz(1)], 1));

      const { rerender } = renderHook(({ q }: { q: string }) => useQuizzes({ q }), {
        wrapper,
        initialProps: { q: '리액트' },
      });
      await waitFor(() => expect(mockGetQuizzes).toHaveBeenCalledTimes(1));

      // key 는 q.trim() 을 사용하므로 공백만 추가된 값은 동일 key
      rerender({ q: '  리액트  ' });
      await waitFor(() => expect(mockGetQuizzes).toHaveBeenCalledTimes(1));
      expect(mockGetQuizzes).toHaveBeenCalledTimes(1);
    });

    it('공백만 있는 q 와 빈 문자열 q 는 같은 key(빈 문자열) 로 취급된다', async () => {
      mockGetQuizzes.mockResolvedValue(makePage([makeQuiz(1)], 1));

      const { rerender } = renderHook(({ q }: { q: string }) => useQuizzes({ q }), {
        wrapper,
        initialProps: { q: '' },
      });
      await waitFor(() => expect(mockGetQuizzes).toHaveBeenCalledTimes(1));

      rerender({ q: '   ' });
      await waitFor(() => expect(mockGetQuizzes).toHaveBeenCalledTimes(1));
      expect(mockGetQuizzes).toHaveBeenCalledTimes(1);
    });

    it("sort 미지정과 sort='plays' 는 같은 key 로 취급되어 추가 fetch 가 없다", async () => {
      mockGetQuizzes.mockResolvedValue(makePage([makeQuiz(1)], 1));

      const { rerender } = renderHook(
        ({ sort }: { sort?: 'plays' | 'latest' }) => useQuizzes({ sort }),
        { wrapper, initialProps: { sort: undefined as 'plays' | 'latest' | undefined } },
      );
      await waitFor(() => expect(mockGetQuizzes).toHaveBeenCalledTimes(1));

      // 기본 sort 는 'plays' 이므로 동일 key
      rerender({ sort: 'plays' });
      await waitFor(() => expect(mockGetQuizzes).toHaveBeenCalledTimes(1));
      expect(mockGetQuizzes).toHaveBeenCalledTimes(1);
    });

    it("sort='latest' 는 기본값과 다른 key 로 다시 fetch 한다", async () => {
      mockGetQuizzes.mockResolvedValue(makePage([makeQuiz(1)], 1));

      const { rerender } = renderHook(
        ({ sort }: { sort?: 'plays' | 'latest' }) => useQuizzes({ sort }),
        { wrapper, initialProps: { sort: undefined as 'plays' | 'latest' | undefined } },
      );
      await waitFor(() => expect(mockGetQuizzes).toHaveBeenCalledTimes(1));

      rerender({ sort: 'latest' });
      await waitFor(() => expect(mockGetQuizzes).toHaveBeenCalledTimes(2));
    });
  });

  describe('로딩 / 에러 전달', () => {
    it('API 실패 시 error 가 노출되고 quizzes 는 [], totalPages 는 0 이다', async () => {
      mockGetQuizzes.mockRejectedValue(new Error('서버 오류'));
      const { result } = renderHook(() => useQuizzes(), { wrapper });

      await waitFor(() => expect(result.current.error).toBeDefined());

      expect(result.current.quizzes).toEqual([]);
      expect(result.current.totalPages).toBe(0);
      expect(result.current.isLoading).toBe(false);
    });
  });
});
