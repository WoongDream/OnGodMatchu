import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import React from 'react';
import { SWRConfig } from 'swr';
import useMyQuizzesAggregate from './useMyQuizzesAggregate';
import type { MyQuizzesAggregate } from '@/types';

// ── API mock ─────────────────────────────────────────────────────────────────
const mockGetMyProfileStats = vi.hoisted(() => vi.fn());

vi.mock('@/api/user', () => ({
  getMyProfileStats: mockGetMyProfileStats,
}));

// ── 샘플 데이터 ───────────────────────────────────────────────────────────────
const MOCK_STATS: MyQuizzesAggregate = {
  totalQuizCount: 12,
  totalPlayCount: 340,
  totalShareCount: 20,
  totalStarCount: 88,
  totalCommentCount: 15,
  weeklyPlayCount: 42,
};

// ── SWR 격리 wrapper ──────────────────────────────────────────────────────────
const wrapper = ({ children }: { children: React.ReactNode }) =>
  React.createElement(
    SWRConfig,
    { value: { provider: () => new Map(), dedupingInterval: 0 } },
    children,
  );

// ── 테스트 ────────────────────────────────────────────────────────────────────
describe('useMyQuizzesAggregate', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('초기 로딩', () => {
    it('fetch 완료 전에는 isLoading=true, stats=undefined', () => {
      mockGetMyProfileStats.mockReturnValue(new Promise(() => {}));
      const { result } = renderHook(() => useMyQuizzesAggregate(), { wrapper });

      expect(result.current.isLoading).toBe(true);
      expect(result.current.stats).toBeUndefined();
      expect(result.current.error).toBeUndefined();
    });
  });

  describe('데이터 반환', () => {
    it('getMyProfileStats 를 호출하고 stats 를 반환한다', async () => {
      mockGetMyProfileStats.mockResolvedValue(MOCK_STATS);
      const { result } = renderHook(() => useMyQuizzesAggregate(), { wrapper });

      await waitFor(() => expect(result.current.stats).toBeDefined());

      expect(mockGetMyProfileStats).toHaveBeenCalledTimes(1);
      expect(result.current.stats).toEqual(MOCK_STATS);
      expect(result.current.isLoading).toBe(false);
    });

    it('stats 의 모든 필드가 올바르게 매핑된다', async () => {
      mockGetMyProfileStats.mockResolvedValue(MOCK_STATS);
      const { result } = renderHook(() => useMyQuizzesAggregate(), { wrapper });

      await waitFor(() => expect(result.current.stats).toBeDefined());

      expect(result.current.stats?.totalQuizCount).toBe(12);
      expect(result.current.stats?.totalPlayCount).toBe(340);
      expect(result.current.stats?.weeklyPlayCount).toBe(42);
    });
  });

  describe('에러 노출', () => {
    it('API 실패 시 error 가 노출되고 stats 는 undefined 이다', async () => {
      const boom = new Error('서버 오류');
      mockGetMyProfileStats.mockRejectedValue(boom);
      const { result } = renderHook(() => useMyQuizzesAggregate(), { wrapper });

      await waitFor(() => expect(result.current.error).toBeDefined());

      expect(result.current.stats).toBeUndefined();
      expect(result.current.isLoading).toBe(false);
    });

    it('에러 후 isLoading 은 false 이다', async () => {
      mockGetMyProfileStats.mockRejectedValue(new Error('network'));
      const { result } = renderHook(() => useMyQuizzesAggregate(), { wrapper });

      await waitFor(() => expect(result.current.error).toBeDefined());

      expect(result.current.isLoading).toBe(false);
    });
  });
});
