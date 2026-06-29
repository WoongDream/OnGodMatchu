import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import React from 'react';
import { SWRConfig } from 'swr';
import useAdminUserSummary from './useAdminUserSummary';
import type { AdminUserSummary } from '@/api/admin';

// ── API mock ─────────────────────────────────────────────────────────────────
const mockGetAdminUserSummary = vi.hoisted(() => vi.fn());

vi.mock('@/api/admin', () => ({
  getAdminUserSummary: mockGetAdminUserSummary,
}));

const makeSummary = (overrides: Partial<AdminUserSummary> = {}): AdminUserSummary => ({
  totalUsers: 100,
  ownerCount: 1,
  adminCount: 3,
  userCount: 96,
  suspendedCount: 2,
  newThisMonth: 10,
  ...overrides,
});

// ── SWR 격리 wrapper ──────────────────────────────────────────────────────────
const wrapper = ({ children }: { children: React.ReactNode }) =>
  React.createElement(
    SWRConfig,
    { value: { provider: () => new Map(), dedupingInterval: 0 } },
    children,
  );

describe('useAdminUserSummary', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('초기 로딩', () => {
    it('fetch 완료 전에는 isLoading=true, summary=undefined 이다', () => {
      mockGetAdminUserSummary.mockReturnValue(new Promise(() => {}));
      const { result } = renderHook(() => useAdminUserSummary(), { wrapper });

      expect(result.current.isLoading).toBe(true);
      expect(result.current.summary).toBeUndefined();
    });
  });

  describe('happy path', () => {
    it('getAdminUserSummary 를 호출하고 summary 를 노출한다', async () => {
      const summary = makeSummary();
      mockGetAdminUserSummary.mockResolvedValue(summary);
      const { result } = renderHook(() => useAdminUserSummary(), { wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(mockGetAdminUserSummary).toHaveBeenCalled();
      expect(result.current.summary).toEqual(summary);
    });
  });

  describe('에러 노출', () => {
    it('API 실패 시 error 가 노출되고 summary 는 undefined 이다', async () => {
      mockGetAdminUserSummary.mockRejectedValue(new Error('forbidden'));
      const { result } = renderHook(() => useAdminUserSummary(), { wrapper });

      await waitFor(() => expect(result.current.error).toBeDefined());

      expect(result.current.summary).toBeUndefined();
    });
  });

  describe('refresh', () => {
    it('refresh 호출 시 재요청한다', async () => {
      mockGetAdminUserSummary.mockResolvedValue(makeSummary());
      const { result } = renderHook(() => useAdminUserSummary(), { wrapper });

      await waitFor(() => expect(mockGetAdminUserSummary).toHaveBeenCalledTimes(1));

      act(() => {
        result.current.refresh();
      });

      await waitFor(() => expect(mockGetAdminUserSummary).toHaveBeenCalledTimes(2));
    });
  });
});
