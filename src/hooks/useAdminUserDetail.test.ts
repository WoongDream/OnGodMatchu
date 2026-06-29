import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import React from 'react';
import { SWRConfig } from 'swr';
import useAdminUserDetail from './useAdminUserDetail';
import type { AdminUserDetail } from '@/api/admin';

// ── API mock ─────────────────────────────────────────────────────────────────
const mockGetAdminUserDetail = vi.hoisted(() => vi.fn());

vi.mock('@/api/admin', () => ({
  getAdminUserDetail: mockGetAdminUserDetail,
}));

const makeDetail = (overrides: Partial<AdminUserDetail> = {}): AdminUserDetail => ({
  userId: 'user-1',
  nickname: '지호',
  email: 'jiho@example.com',
  profileImageUrl: '',
  bio: null,
  role: 'USER',
  status: 'ACTIVE',
  suspendedUntil: null,
  provider: 'google',
  createdAt: '2025-01-01T00:00:00Z',
  withdrawnAt: null,
  solvedCount: 10,
  avgSolveRate: 70,
  quizCount: 3,
  totalPlayCount: 100,
  totalStarCount: 20,
  ...overrides,
});

// ── SWR 격리 wrapper ──────────────────────────────────────────────────────────
const wrapper = ({ children }: { children: React.ReactNode }) =>
  React.createElement(
    SWRConfig,
    { value: { provider: () => new Map(), dedupingInterval: 0 } },
    children,
  );

describe('useAdminUserDetail', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('publicId 지정', () => {
    it('fetch 완료 전에는 isLoading=true, user=undefined 이다', () => {
      mockGetAdminUserDetail.mockReturnValue(new Promise(() => {}));
      const { result } = renderHook(() => useAdminUserDetail('user-1'), { wrapper });

      expect(result.current.isLoading).toBe(true);
      expect(result.current.user).toBeUndefined();
    });

    it('getAdminUserDetail(publicId) 를 호출하고 user 를 반환한다', async () => {
      const detail = makeDetail();
      mockGetAdminUserDetail.mockResolvedValue(detail);
      const { result } = renderHook(() => useAdminUserDetail('user-1'), { wrapper });

      await waitFor(() => expect(result.current.user).toEqual(detail));

      expect(mockGetAdminUserDetail).toHaveBeenCalledWith('user-1');
      expect(result.current.isLoading).toBe(false);
    });

    it('API 실패 시 error 가 노출되고 user 는 undefined 이다', async () => {
      mockGetAdminUserDetail.mockRejectedValue(new Error('not found'));
      const { result } = renderHook(() => useAdminUserDetail('user-1'), { wrapper });

      await waitFor(() => expect(result.current.error).toBeDefined());

      expect(result.current.user).toBeUndefined();
    });

    it('refresh 호출 시 재요청한다', async () => {
      mockGetAdminUserDetail.mockResolvedValue(makeDetail());
      const { result } = renderHook(() => useAdminUserDetail('user-1'), { wrapper });

      await waitFor(() => expect(mockGetAdminUserDetail).toHaveBeenCalledTimes(1));

      act(() => {
        result.current.refresh();
      });

      await waitFor(() => expect(mockGetAdminUserDetail).toHaveBeenCalledTimes(2));
    });
  });

  describe('publicId falsy (key null → 요청 안 함)', () => {
    it('undefined 면 getAdminUserDetail 를 호출하지 않는다', () => {
      const { result } = renderHook(() => useAdminUserDetail(undefined), { wrapper });

      expect(mockGetAdminUserDetail).not.toHaveBeenCalled();
      expect(result.current.user).toBeUndefined();
      expect(result.current.isLoading).toBe(false);
    });

    it('null 이면 getAdminUserDetail 를 호출하지 않는다', () => {
      renderHook(() => useAdminUserDetail(null), { wrapper });

      expect(mockGetAdminUserDetail).not.toHaveBeenCalled();
    });

    it('빈 문자열이면 getAdminUserDetail 를 호출하지 않는다', () => {
      renderHook(() => useAdminUserDetail(''), { wrapper });

      expect(mockGetAdminUserDetail).not.toHaveBeenCalled();
    });
  });
});
