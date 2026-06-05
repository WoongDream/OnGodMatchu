import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import React from 'react';
import { SWRConfig } from 'swr';
import useAdminUsers from './useAdminUsers';
import type { AdminUser } from '@/api/admin';

// ── API mock ─────────────────────────────────────────────────────────────────
const mockGetAdminUsers = vi.hoisted(() => vi.fn());

vi.mock('@/api/admin', () => ({
  getAdminUsers: mockGetAdminUsers,
}));

// ── 샘플 데이터 ───────────────────────────────────────────────────────────────
const makeUser = (id: number): AdminUser => ({
  userId: `user-${id}`,
  nickname: `유저${id}`,
  email: `user${id}@example.com`,
  profileImageUrl: null,
  role: 'USER',
  status: 'ACTIVE',
  suspendedUntil: null,
  provider: 'google',
  createdAt: '2025-01-01T00:00:00Z',
  withdrawnAt: null,
});

const makePage = (items: AdminUser[], totalElements: number, last: boolean) => ({
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

describe('useAdminUsers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('초기 로딩', () => {
    it('fetch 완료 전에는 isLoading=true, items=[], totalElements=0 이다', () => {
      mockGetAdminUsers.mockReturnValue(new Promise(() => {}));
      const { result } = renderHook(() => useAdminUsers(), { wrapper });

      expect(result.current.isLoading).toBe(true);
      expect(result.current.items).toEqual([]);
      expect(result.current.totalElements).toBe(0);
    });
  });

  describe('happy path', () => {
    it('getAdminUsers 를 호출하고 content 를 items 로 매핑한다', async () => {
      mockGetAdminUsers.mockResolvedValue(makePage([makeUser(1), makeUser(2)], 2, true));
      const { result } = renderHook(() => useAdminUsers(), { wrapper });

      await waitFor(() => expect(result.current.items).toHaveLength(2));

      expect(mockGetAdminUsers).toHaveBeenCalled();
      expect(result.current.items.map((u) => u.userId)).toEqual(['user-1', 'user-2']);
    });

    it('totalElements 는 첫 페이지 값에서 가져온다', async () => {
      mockGetAdminUsers.mockResolvedValue(makePage([makeUser(1)], 137, false));
      const { result } = renderHook(() => useAdminUsers(), { wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(result.current.totalElements).toBe(137);
    });
  });

  describe('빈 상태', () => {
    it('content 가 비면 items=[] 이고 totalElements=0 이다', async () => {
      mockGetAdminUsers.mockResolvedValue(makePage([], 0, true));
      const { result } = renderHook(() => useAdminUsers(), { wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(result.current.items).toEqual([]);
      expect(result.current.totalElements).toBe(0);
    });
  });

  describe('status/role/query 키 반영', () => {
    it('status/role/query 가 API 인자로 전달된다', async () => {
      mockGetAdminUsers.mockResolvedValue(makePage([makeUser(1)], 1, true));
      renderHook(() => useAdminUsers({ status: 'SUSPENDED', role: 'ADMIN', query: '지호' }), {
        wrapper,
      });

      await waitFor(() => expect(mockGetAdminUsers).toHaveBeenCalled());

      const [arg] = mockGetAdminUsers.mock.calls[0] as [
        { status?: string; role?: string; query?: string; page: number; size: number },
      ];
      expect(arg.status).toBe('SUSPENDED');
      expect(arg.role).toBe('ADMIN');
      expect(arg.query).toBe('지호');
    });

    it('필터 미지정 시 status/role/query 는 undefined 로 전달된다', async () => {
      mockGetAdminUsers.mockResolvedValue(makePage([makeUser(1)], 1, true));
      renderHook(() => useAdminUsers(), { wrapper });

      await waitFor(() => expect(mockGetAdminUsers).toHaveBeenCalled());

      const [arg] = mockGetAdminUsers.mock.calls[0] as [
        { status?: string; role?: string; query?: string },
      ];
      expect(arg.status).toBeUndefined();
      expect(arg.role).toBeUndefined();
      expect(arg.query).toBeUndefined();
    });

    it('status 가 바뀌면 새 키로 재요청한다', async () => {
      mockGetAdminUsers.mockResolvedValue(makePage([makeUser(1)], 1, true));
      const { rerender } = renderHook(
        (props: { status: 'ACTIVE' | 'SUSPENDED' }) => useAdminUsers(props),
        {
          wrapper,
          initialProps: { status: 'ACTIVE' } as { status: 'ACTIVE' | 'SUSPENDED' },
        },
      );

      await waitFor(() => expect(mockGetAdminUsers).toHaveBeenCalledTimes(1));

      rerender({ status: 'SUSPENDED' });

      await waitFor(() =>
        expect(mockGetAdminUsers.mock.calls.some(([a]) => a.status === 'SUSPENDED')).toBe(true),
      );
    });
  });

  describe('hasNext / loadMore', () => {
    it('마지막 페이지면 hasNext=false 이다', async () => {
      mockGetAdminUsers.mockResolvedValue(makePage([makeUser(1)], 1, true));
      const { result } = renderHook(() => useAdminUsers(), { wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(result.current.hasNext).toBe(false);
    });

    it('마지막 페이지가 아니면 hasNext=true 이다', async () => {
      mockGetAdminUsers.mockResolvedValue(makePage([makeUser(1)], 50, false));
      const { result } = renderHook(() => useAdminUsers(), { wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(result.current.hasNext).toBe(true);
    });

    it('loadMore 가 다음 페이지를 누적한다', async () => {
      mockGetAdminUsers.mockImplementation((q: { page: number }) => {
        if (q.page === 0) {
          return Promise.resolve(makePage([makeUser(1), makeUser(2)], 3, false));
        }
        return Promise.resolve(makePage([makeUser(3)], 3, true));
      });

      const { result } = renderHook(() => useAdminUsers({ size: 2 }), { wrapper });

      await waitFor(() => expect(result.current.items).toHaveLength(2));
      expect(result.current.hasNext).toBe(true);

      act(() => {
        result.current.loadMore();
      });

      await waitFor(() => expect(result.current.items).toHaveLength(3));
      expect(result.current.items.map((u) => u.userId)).toEqual(['user-1', 'user-2', 'user-3']);
      expect(result.current.hasNext).toBe(false);
    });
  });

  describe('refresh', () => {
    it('refresh 호출 시 재요청한다', async () => {
      mockGetAdminUsers.mockResolvedValue(makePage([makeUser(1)], 1, true));
      const { result } = renderHook(() => useAdminUsers(), { wrapper });

      await waitFor(() => expect(mockGetAdminUsers).toHaveBeenCalledTimes(1));

      act(() => {
        result.current.refresh();
      });

      await waitFor(() => expect(mockGetAdminUsers).toHaveBeenCalledTimes(2));
    });
  });

  describe('에러 노출', () => {
    it('API 실패 시 error 가 노출되고 items 는 [] 이다', async () => {
      mockGetAdminUsers.mockRejectedValue(new Error('forbidden'));
      const { result } = renderHook(() => useAdminUsers(), { wrapper });

      await waitFor(() => expect(result.current.error).toBeDefined());

      expect(result.current.items).toEqual([]);
    });
  });
});
