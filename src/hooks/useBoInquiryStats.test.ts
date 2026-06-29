import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import React from 'react';
import { SWRConfig } from 'swr';
import useBoInquiryStats from './useBoInquiryStats';
import type { InquiryStats } from '@/types';

// ── API mock ─────────────────────────────────────────────────────────────────
const mockGetBoInquiryStats = vi.hoisted(() => vi.fn());

vi.mock('@/api/inquiry', () => ({
  getBoInquiryStats: mockGetBoInquiryStats,
}));

const makeStats = (overrides: Partial<InquiryStats> = {}): InquiryStats => ({
  total: 10,
  pending: 4,
  inProgress: 3,
  done: 3,
  ...overrides,
});

// ── SWR 격리 wrapper ──────────────────────────────────────────────────────────
const wrapper = ({ children }: { children: React.ReactNode }) =>
  React.createElement(
    SWRConfig,
    { value: { provider: () => new Map(), dedupingInterval: 0 } },
    children,
  );

describe('useBoInquiryStats', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('happy path', () => {
    it('getBoInquiryStats 를 호출하고 stats 를 반환한다', async () => {
      const stats = makeStats({ total: 100, pending: 10, inProgress: 20, done: 70 });
      mockGetBoInquiryStats.mockResolvedValue(stats);
      const { result } = renderHook(() => useBoInquiryStats(), { wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(mockGetBoInquiryStats).toHaveBeenCalledTimes(1);
      expect(result.current.stats).toEqual(stats);
      expect(result.current.error).toBeUndefined();
    });

    it('fetch 완료 전에는 isLoading=true, stats=undefined 이다', () => {
      mockGetBoInquiryStats.mockReturnValue(new Promise(() => {}));
      const { result } = renderHook(() => useBoInquiryStats(), { wrapper });

      expect(result.current.isLoading).toBe(true);
      expect(result.current.stats).toBeUndefined();
    });
  });

  describe('refresh', () => {
    it('refresh 호출 시 mutate 로 재검증한다', async () => {
      mockGetBoInquiryStats.mockResolvedValue(makeStats());
      const { result } = renderHook(() => useBoInquiryStats(), { wrapper });

      await waitFor(() => expect(mockGetBoInquiryStats).toHaveBeenCalledTimes(1));

      await act(async () => {
        result.current.refresh();
      });

      await waitFor(() => expect(mockGetBoInquiryStats).toHaveBeenCalledTimes(2));
    });
  });

  describe('에러 노출', () => {
    it('API 실패 시 error 가 노출되고 stats 는 undefined 이다', async () => {
      mockGetBoInquiryStats.mockRejectedValue(new Error('forbidden'));
      const { result } = renderHook(() => useBoInquiryStats(), { wrapper });

      await waitFor(() => expect(result.current.error).toBeDefined());

      expect(result.current.stats).toBeUndefined();
      expect(result.current.isLoading).toBe(false);
    });
  });
});
