import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import React from 'react';
import { SWRConfig } from 'swr';
import useMonthlyUserStats from './useMonthlyUserStats';
import type { MonthlyUserStat } from '@/api/admin';

// ── API mock ─────────────────────────────────────────────────────────────────
const mockGetMonthlyUserStats = vi.hoisted(() => vi.fn());

vi.mock('@/api/admin', () => ({
  getMonthlyUserStats: mockGetMonthlyUserStats,
}));

const makeStat = (yearMonth: string): MonthlyUserStat => ({
  yearMonth,
  cumulative: 100,
  newCount: 10,
  churnCount: 2,
});

// ── SWR 격리 wrapper ──────────────────────────────────────────────────────────
const wrapper = ({ children }: { children: React.ReactNode }) =>
  React.createElement(
    SWRConfig,
    { value: { provider: () => new Map(), dedupingInterval: 0 } },
    children,
  );

describe('useMonthlyUserStats', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('enabled=false (key null → 요청 안 함)', () => {
    it('getMonthlyUserStats 를 호출하지 않고 stats=undefined 이다', () => {
      const { result } = renderHook(() => useMonthlyUserStats(false), { wrapper });

      expect(mockGetMonthlyUserStats).not.toHaveBeenCalled();
      expect(result.current.stats).toBeUndefined();
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('enabled=true', () => {
    it('getMonthlyUserStats(months) 를 호출하고 stats 를 노출한다', async () => {
      const stats = [makeStat('2025-01'), makeStat('2025-02')];
      mockGetMonthlyUserStats.mockResolvedValue(stats);
      const { result } = renderHook(() => useMonthlyUserStats(true, 6), { wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(mockGetMonthlyUserStats).toHaveBeenCalledWith(6);
      expect(result.current.stats).toEqual(stats);
    });

    it('months 기본값(6)으로 호출한다', async () => {
      mockGetMonthlyUserStats.mockResolvedValue([makeStat('2025-01')]);
      renderHook(() => useMonthlyUserStats(true), { wrapper });

      await waitFor(() => expect(mockGetMonthlyUserStats).toHaveBeenCalled());

      expect(mockGetMonthlyUserStats).toHaveBeenCalledWith(6);
    });

    it('months 가 지정되면 그 값으로 호출한다', async () => {
      mockGetMonthlyUserStats.mockResolvedValue([makeStat('2025-01')]);
      renderHook(() => useMonthlyUserStats(true, 12), { wrapper });

      await waitFor(() => expect(mockGetMonthlyUserStats).toHaveBeenCalled());

      expect(mockGetMonthlyUserStats).toHaveBeenCalledWith(12);
    });
  });

  describe('에러 노출', () => {
    it('API 실패 시 error 가 노출되고 stats 는 undefined 이다', async () => {
      mockGetMonthlyUserStats.mockRejectedValue(new Error('forbidden'));
      const { result } = renderHook(() => useMonthlyUserStats(true), { wrapper });

      await waitFor(() => expect(result.current.error).toBeDefined());

      expect(result.current.stats).toBeUndefined();
    });
  });
});
