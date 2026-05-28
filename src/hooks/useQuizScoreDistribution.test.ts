import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import React from 'react';
import { SWRConfig } from 'swr';
import useQuizScoreDistribution from './useQuizScoreDistribution';
import type { QuizScoreDistribution } from '@/types';

// ── API mock ─────────────────────────────────────────────────────────────────
const mockGetQuizScoreDistribution = vi.hoisted(() => vi.fn());

vi.mock('@/api/quiz', () => ({
  getQuizScoreDistribution: mockGetQuizScoreDistribution,
}));

// ── 샘플 데이터 ───────────────────────────────────────────────────────────────
const MOCK_DISTRIBUTION: QuizScoreDistribution = {
  totalAttempts: 100,
  averageScore: 7.5,
  distribution: [
    { score: 0, count: 2 },
    { score: 1, count: 5 },
    { score: 2, count: 8 },
    { score: 3, count: 15 },
    { score: 4, count: 20 },
    { score: 5, count: 25 },
    { score: 6, count: 15 },
    { score: 7, count: 10 },
  ],
};

// ── SWR 격리 wrapper ──────────────────────────────────────────────────────────
const wrapper = ({ children }: { children: React.ReactNode }) =>
  React.createElement(
    SWRConfig,
    { value: { provider: () => new Map(), dedupingInterval: 0 } },
    children,
  );

// ── 테스트 ────────────────────────────────────────────────────────────────────
describe('useQuizScoreDistribution', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('정상 응답', () => {
    it('getQuizScoreDistribution 을 호출하고 data 를 반환한다', async () => {
      mockGetQuizScoreDistribution.mockResolvedValue(MOCK_DISTRIBUTION);
      const { result } = renderHook(() => useQuizScoreDistribution(1), { wrapper });

      await waitFor(() => expect(result.current.data).toBeDefined());

      expect(mockGetQuizScoreDistribution).toHaveBeenCalledTimes(1);
      expect(mockGetQuizScoreDistribution).toHaveBeenCalledWith(1);
      expect(result.current.data).toEqual(MOCK_DISTRIBUTION);
      expect(result.current.error).toBeUndefined();
    });
  });

  describe('로딩 → 데이터', () => {
    it('fetch 완료 전에는 isLoading=true, 완료 후 false 가 된다', async () => {
      mockGetQuizScoreDistribution.mockResolvedValue(MOCK_DISTRIBUTION);
      const { result } = renderHook(() => useQuizScoreDistribution(1), { wrapper });

      expect(result.current.isLoading).toBe(true);
      expect(result.current.data).toBeUndefined();

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(result.current.data).toEqual(MOCK_DISTRIBUTION);
    });
  });

  describe('에러 노출', () => {
    it('API 실패 시 error 가 노출되고 data 는 undefined 이다', async () => {
      const boom = new Error('서버 오류');
      mockGetQuizScoreDistribution.mockRejectedValue(boom);
      const { result } = renderHook(() => useQuizScoreDistribution(1), { wrapper });

      await waitFor(() => expect(result.current.error).toBeDefined());

      expect(result.current.data).toBeUndefined();
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe(boom);
    });
  });

  describe('invalid quizId', () => {
    it('quizId === 0 이면 fetcher 가 호출되지 않는다', async () => {
      mockGetQuizScoreDistribution.mockResolvedValue(MOCK_DISTRIBUTION);
      const { result } = renderHook(() => useQuizScoreDistribution(0), { wrapper });

      // SWR key 가 null 이면 fetcher 호출되지 않고 isLoading=false 유지
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(mockGetQuizScoreDistribution).not.toHaveBeenCalled();
      expect(result.current.data).toBeUndefined();
      expect(result.current.error).toBeUndefined();
    });

    it('quizId 가 음수면 fetcher 가 호출되지 않는다', async () => {
      mockGetQuizScoreDistribution.mockResolvedValue(MOCK_DISTRIBUTION);
      const { result } = renderHook(() => useQuizScoreDistribution(-5), { wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(mockGetQuizScoreDistribution).not.toHaveBeenCalled();
      expect(result.current.data).toBeUndefined();
      expect(result.current.error).toBeUndefined();
    });
  });
});
