import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import React from 'react';
import { SWRConfig } from 'swr';
import useBoNoticeStats from './useBoNoticeStats';
import type { NoticeStats } from '@/types';

// ── API mock ─────────────────────────────────────────────────────────────────
const mockGetBoNoticeStats = vi.hoisted(() => vi.fn());

vi.mock('@/api/admin', () => ({
  getBoNoticeStats: mockGetBoNoticeStats,
}));

const makeStats = (overrides: Partial<NoticeStats> = {}): NoticeStats => ({
  total: 10,
  published: 6,
  pinned: 2,
  draft: 4,
  ...overrides,
});

// ── SWR 격리 wrapper ──────────────────────────────────────────────────────────
const wrapper = ({ children }: { children: React.ReactNode }) =>
  React.createElement(
    SWRConfig,
    { value: { provider: () => new Map(), dedupingInterval: 0 } },
    children,
  );

describe('useBoNoticeStats', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('초기 로딩', () => {
    it('fetch 완료 전에는 isLoading=true, stats=undefined 이다', () => {
      mockGetBoNoticeStats.mockReturnValue(new Promise(() => {}));
      const { result } = renderHook(() => useBoNoticeStats(), { wrapper });

      expect(result.current.isLoading).toBe(true);
      expect(result.current.stats).toBeUndefined();
    });
  });

  describe('happy path', () => {
    it('getBoNoticeStats 를 호출하고 stats 를 노출한다', async () => {
      const stats = makeStats();
      mockGetBoNoticeStats.mockResolvedValue(stats);
      const { result } = renderHook(() => useBoNoticeStats(), { wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(mockGetBoNoticeStats).toHaveBeenCalled();
      expect(result.current.stats).toEqual(stats);
    });

    it('0 집계도 그대로 노출한다', async () => {
      const stats = makeStats({ total: 0, published: 0, pinned: 0, draft: 0 });
      mockGetBoNoticeStats.mockResolvedValue(stats);
      const { result } = renderHook(() => useBoNoticeStats(), { wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(result.current.stats).toEqual(stats);
    });
  });

  describe('에러 노출', () => {
    it('API 실패 시 error 가 노출되고 stats 는 undefined 이다', async () => {
      mockGetBoNoticeStats.mockRejectedValue(new Error('forbidden'));
      const { result } = renderHook(() => useBoNoticeStats(), { wrapper });

      await waitFor(() => expect(result.current.error).toBeDefined());

      expect(result.current.stats).toBeUndefined();
    });
  });

  describe('refresh', () => {
    it('refresh 호출 시 재요청한다', async () => {
      mockGetBoNoticeStats.mockResolvedValue(makeStats());
      const { result } = renderHook(() => useBoNoticeStats(), { wrapper });

      await waitFor(() => expect(mockGetBoNoticeStats).toHaveBeenCalledTimes(1));

      result.current.refresh();

      await waitFor(() => expect(mockGetBoNoticeStats).toHaveBeenCalledTimes(2));
    });
  });
});
