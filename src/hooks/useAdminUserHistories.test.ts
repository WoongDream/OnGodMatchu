import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import React from 'react';
import { SWRConfig } from 'swr';
import useAdminUserHistories from './useAdminUserHistories';
import type { AdminUserHistory } from '@/api/admin';

// ── API mock ─────────────────────────────────────────────────────────────────
const mockGetAdminUserHistories = vi.hoisted(() => vi.fn());

vi.mock('@/api/admin', () => ({
  getAdminUserHistories: mockGetAdminUserHistories,
}));

// ── 샘플 데이터 ───────────────────────────────────────────────────────────────
const makeHistory = (id: number): AdminUserHistory => ({
  id,
  actorId: `actor-${id}`,
  actorNickname: `관리자${id}`,
  actorRole: 'ADMIN',
  changeType: 'ROLE_CHANGE',
  changeTypeLabel: '역할 변경',
  detail: 'USER → ADMIN',
  notification: null,
  createdAt: '2025-01-01T00:00:00Z',
});

const makePage = (items: AdminUserHistory[], totalElements: number, last: boolean) => ({
  content: items,
  totalElements,
  totalPages: last ? 1 : 99,
  number: 0,
  size: 20,
  first: true,
  last,
  empty: items.length === 0,
});

// ── SWR 격리 wrapper ──────────────────────────────────────────────────────────
const wrapper = ({ children }: { children: React.ReactNode }) =>
  React.createElement(
    SWRConfig,
    { value: { provider: () => new Map(), dedupingInterval: 0 } },
    children,
  );

describe('useAdminUserHistories', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('publicId 없음 (key null → 요청 안 함)', () => {
    it('undefined 면 getAdminUserHistories 를 호출하지 않는다', () => {
      const { result } = renderHook(() => useAdminUserHistories(undefined), { wrapper });

      expect(mockGetAdminUserHistories).not.toHaveBeenCalled();
      expect(result.current.items).toEqual([]);
      expect(result.current.totalElements).toBe(0);
    });

    it('null 이면 getAdminUserHistories 를 호출하지 않는다', () => {
      renderHook(() => useAdminUserHistories(null), { wrapper });

      expect(mockGetAdminUserHistories).not.toHaveBeenCalled();
    });

    it('빈 문자열이면 getAdminUserHistories 를 호출하지 않고 hasNext=false 이다', () => {
      const { result } = renderHook(() => useAdminUserHistories(''), { wrapper });

      expect(mockGetAdminUserHistories).not.toHaveBeenCalled();
      expect(result.current.hasNext).toBe(false);
    });
  });

  describe('happy path', () => {
    it('getAdminUserHistories(publicId) 를 호출하고 content 를 items 로 매핑한다', async () => {
      mockGetAdminUserHistories.mockResolvedValue(
        makePage([makeHistory(1), makeHistory(2)], 2, true),
      );
      const { result } = renderHook(() => useAdminUserHistories('user-1'), { wrapper });

      await waitFor(() => expect(result.current.items).toHaveLength(2));

      expect(mockGetAdminUserHistories.mock.calls[0][0]).toBe('user-1');
      expect(result.current.items.map((h) => h.id)).toEqual([1, 2]);
    });

    it('totalElements 는 첫 페이지 값에서 가져온다', async () => {
      mockGetAdminUserHistories.mockResolvedValue(makePage([makeHistory(1)], 33, false));
      const { result } = renderHook(() => useAdminUserHistories('user-1'), { wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(result.current.totalElements).toBe(33);
    });
  });

  describe('hasNext / loadMore', () => {
    it('마지막 페이지면 hasNext=false 이다', async () => {
      mockGetAdminUserHistories.mockResolvedValue(makePage([makeHistory(1)], 1, true));
      const { result } = renderHook(() => useAdminUserHistories('user-1'), { wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(result.current.hasNext).toBe(false);
    });

    it('마지막 페이지가 아니면 hasNext=true 이다', async () => {
      mockGetAdminUserHistories.mockResolvedValue(makePage([makeHistory(1)], 50, false));
      const { result } = renderHook(() => useAdminUserHistories('user-1'), { wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(result.current.hasNext).toBe(true);
    });

    it('loadMore 가 다음 페이지를 누적한다', async () => {
      mockGetAdminUserHistories.mockImplementation((_id: string, q: { page: number }) => {
        if (q.page === 0) {
          return Promise.resolve(makePage([makeHistory(1), makeHistory(2)], 3, false));
        }
        return Promise.resolve(makePage([makeHistory(3)], 3, true));
      });

      const { result } = renderHook(() => useAdminUserHistories('user-1', 2), { wrapper });

      await waitFor(() => expect(result.current.items).toHaveLength(2));
      expect(result.current.hasNext).toBe(true);

      act(() => {
        result.current.loadMore();
      });

      await waitFor(() => expect(result.current.items).toHaveLength(3));
      expect(result.current.items.map((h) => h.id)).toEqual([1, 2, 3]);
      expect(result.current.hasNext).toBe(false);
    });
  });

  describe('refresh', () => {
    it('refresh 호출 시 재요청한다', async () => {
      mockGetAdminUserHistories.mockResolvedValue(makePage([makeHistory(1)], 1, true));
      const { result } = renderHook(() => useAdminUserHistories('user-1'), { wrapper });

      await waitFor(() => expect(mockGetAdminUserHistories).toHaveBeenCalledTimes(1));

      act(() => {
        result.current.refresh();
      });

      await waitFor(() => expect(mockGetAdminUserHistories).toHaveBeenCalledTimes(2));
    });
  });

  describe('에러 노출', () => {
    it('API 실패 시 error 가 노출되고 items 는 [] 이다', async () => {
      mockGetAdminUserHistories.mockRejectedValue(new Error('forbidden'));
      const { result } = renderHook(() => useAdminUserHistories('user-1'), { wrapper });

      await waitFor(() => expect(result.current.error).toBeDefined());

      expect(result.current.items).toEqual([]);
    });
  });
});
