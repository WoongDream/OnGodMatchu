import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import React from 'react';
import { SWRConfig } from 'swr';
import useBoNicknameStats from './useBoNicknameStats';
import type { NicknameRuleStats } from '@/types';

// ── API mock ─────────────────────────────────────────────────────────────────
const mockGetBoNicknameStats = vi.hoisted(() => vi.fn());

vi.mock('@/api/admin', () => ({
  getBoNicknameStats: mockGetBoNicknameStats,
}));

const makeStats = (overrides: Partial<NicknameRuleStats> = {}): NicknameRuleStats => ({
  total: 10,
  forbidden: 6,
  reserved: 4,
  ...overrides,
});

// ── SWR 격리 wrapper ──────────────────────────────────────────────────────────
const wrapper = ({ children }: { children: React.ReactNode }) =>
  React.createElement(
    SWRConfig,
    { value: { provider: () => new Map(), dedupingInterval: 0 } },
    children,
  );

describe('useBoNicknameStats', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('초기 로딩', () => {
    it('fetch 완료 전에는 isLoading=true, stats=undefined 이다', () => {
      mockGetBoNicknameStats.mockReturnValue(new Promise(() => {}));
      const { result } = renderHook(() => useBoNicknameStats(), { wrapper });

      expect(result.current.isLoading).toBe(true);
      expect(result.current.stats).toBeUndefined();
    });
  });

  describe('happy path', () => {
    it('getBoNicknameStats 를 호출하고 stats 를 노출한다', async () => {
      const stats = makeStats();
      mockGetBoNicknameStats.mockResolvedValue(stats);
      const { result } = renderHook(() => useBoNicknameStats(), { wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(mockGetBoNicknameStats).toHaveBeenCalled();
      expect(result.current.stats).toEqual(stats);
    });

    it('0 집계도 그대로 노출한다', async () => {
      const stats = makeStats({ total: 0, forbidden: 0, reserved: 0 });
      mockGetBoNicknameStats.mockResolvedValue(stats);
      const { result } = renderHook(() => useBoNicknameStats(), { wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(result.current.stats).toEqual(stats);
    });
  });

  describe('에러 노출', () => {
    it('API 실패 시 error 가 노출되고 stats 는 undefined 이다', async () => {
      mockGetBoNicknameStats.mockRejectedValue(new Error('forbidden'));
      const { result } = renderHook(() => useBoNicknameStats(), { wrapper });

      await waitFor(() => expect(result.current.error).toBeDefined());

      expect(result.current.stats).toBeUndefined();
    });
  });

  describe('refresh', () => {
    it('refresh 호출 시 재요청한다', async () => {
      mockGetBoNicknameStats.mockResolvedValue(makeStats());
      const { result } = renderHook(() => useBoNicknameStats(), { wrapper });

      await waitFor(() => expect(mockGetBoNicknameStats).toHaveBeenCalledTimes(1));

      result.current.refresh();

      await waitFor(() => expect(mockGetBoNicknameStats).toHaveBeenCalledTimes(2));
    });
  });
});
