import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import React from 'react';
import { SWRConfig } from 'swr';
import useReceivedNotifications from './useReceivedNotifications';
import type { ReceivedNotificationPage } from '@/api/notification';
import type { UserNotification } from '@/types';

// ── API mock ─────────────────────────────────────────────────────────────────
const mockGetReceivedNotifications = vi.hoisted(() => vi.fn());

vi.mock('@/api/notification', () => ({
  getReceivedNotifications: mockGetReceivedNotifications,
}));

// ── 샘플 데이터 ───────────────────────────────────────────────────────────────
const makeNotification = (id: number): UserNotification => ({
  id,
  type: 'INFO',
  typeLabel: '안내',
  title: `알림 ${id}`,
  content: '본문',
  senderLabel: '운영팀',
  createdAt: '2026-05-01T00:00:00+09:00',
});

const makePage = (
  notifications: UserNotification[],
  last: boolean,
  totalElements: number,
): ReceivedNotificationPage => ({
  content: notifications,
  totalElements,
  last,
});

// ── SWR 격리 wrapper ──────────────────────────────────────────────────────────
const wrapper = ({ children }: { children: React.ReactNode }) =>
  React.createElement(
    SWRConfig,
    { value: { provider: () => new Map(), dedupingInterval: 0 } },
    children,
  );

describe('useReceivedNotifications', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('초기 로딩', () => {
    it('fetch 완료 전에는 isLoading=true, items=[], totalElements=0 이다', () => {
      mockGetReceivedNotifications.mockReturnValue(new Promise(() => {}));
      const { result } = renderHook(() => useReceivedNotifications(), { wrapper });

      expect(result.current.isLoading).toBe(true);
      expect(result.current.items).toEqual([]);
      expect(result.current.totalElements).toBe(0);
      expect(result.current.error).toBeUndefined();
    });

    it('기본 size(20) 와 page 0 으로 getReceivedNotifications 를 호출한다', async () => {
      mockGetReceivedNotifications.mockResolvedValue(makePage([makeNotification(1)], true, 1));
      renderHook(() => useReceivedNotifications(), { wrapper });

      await waitFor(() => expect(mockGetReceivedNotifications).toHaveBeenCalled());

      expect(mockGetReceivedNotifications).toHaveBeenCalledWith({ page: 0, size: 20 });
    });

    it('size 옵션이 fetcher 에 전달된다', async () => {
      mockGetReceivedNotifications.mockResolvedValue(makePage([makeNotification(1)], true, 1));
      renderHook(() => useReceivedNotifications({ size: 5 }), { wrapper });

      await waitFor(() => expect(mockGetReceivedNotifications).toHaveBeenCalled());

      expect(mockGetReceivedNotifications).toHaveBeenCalledWith({ page: 0, size: 5 });
    });
  });

  describe('응답 집계', () => {
    it('첫 페이지 content 가 items 로 매핑된다', async () => {
      mockGetReceivedNotifications.mockResolvedValue(
        makePage([makeNotification(1), makeNotification(2)], true, 2),
      );
      const { result } = renderHook(() => useReceivedNotifications(), { wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(result.current.items.map((n) => n.id)).toEqual([1, 2]);
    });

    it('totalElements 는 첫 페이지 값에서 가져온다', async () => {
      mockGetReceivedNotifications.mockResolvedValue(makePage([makeNotification(1)], false, 42));
      const { result } = renderHook(() => useReceivedNotifications(), { wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(result.current.totalElements).toBe(42);
    });

    it('last=true 이면 hasNext=false 이다', async () => {
      mockGetReceivedNotifications.mockResolvedValue(makePage([makeNotification(1)], true, 1));
      const { result } = renderHook(() => useReceivedNotifications(), { wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(result.current.hasNext).toBe(false);
    });

    it('last=false 이면 hasNext=true 이다', async () => {
      mockGetReceivedNotifications.mockResolvedValue(makePage([makeNotification(1)], false, 10));
      const { result } = renderHook(() => useReceivedNotifications(), { wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(result.current.hasNext).toBe(true);
    });
  });

  describe('loadMore — 페이지 누적', () => {
    it('loadMore 호출 시 다음 페이지를 fetch 하고 items 를 누적한다 (setSize)', async () => {
      mockGetReceivedNotifications.mockImplementation(({ page }: { page: number }) =>
        page === 0
          ? Promise.resolve(makePage([makeNotification(1), makeNotification(2)], false, 4))
          : Promise.resolve(makePage([makeNotification(3), makeNotification(4)], true, 4)),
      );

      const { result } = renderHook(() => useReceivedNotifications({ size: 2 }), { wrapper });

      await waitFor(() => expect(result.current.items).toHaveLength(2));
      expect(result.current.hasNext).toBe(true);

      act(() => {
        result.current.loadMore();
      });

      await waitFor(() => expect(result.current.items).toHaveLength(4));
      expect(result.current.items.map((n) => n.id)).toEqual([1, 2, 3, 4]);
      expect(result.current.hasNext).toBe(false);
      expect(mockGetReceivedNotifications).toHaveBeenCalledWith({ page: 1, size: 2 });
    });

    it('hasNext=false(last=true) 이면 loadMore 가 추가 fetch 를 하지 않는다 (무시)', async () => {
      mockGetReceivedNotifications.mockResolvedValue(makePage([makeNotification(1)], true, 1));
      const { result } = renderHook(() => useReceivedNotifications(), { wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));
      expect(mockGetReceivedNotifications).toHaveBeenCalledTimes(1);

      act(() => {
        result.current.loadMore();
      });

      // hasNext=false 라 호출 횟수 변화 없음
      await waitFor(() => expect(result.current.isLoading).toBe(false));
      expect(mockGetReceivedNotifications).toHaveBeenCalledTimes(1);
    });
  });

  describe('빈 결과', () => {
    it('content 가 비면 items=[], totalElements=0, hasNext=false 이다', async () => {
      mockGetReceivedNotifications.mockResolvedValue(makePage([], true, 0));
      const { result } = renderHook(() => useReceivedNotifications(), { wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(result.current.items).toEqual([]);
      expect(result.current.totalElements).toBe(0);
      expect(result.current.hasNext).toBe(false);
    });
  });

  describe('에러 노출', () => {
    it('API 실패 시 error 가 노출되고 items 는 [] 이다', async () => {
      mockGetReceivedNotifications.mockRejectedValue(new Error('서버 오류'));
      const { result } = renderHook(() => useReceivedNotifications(), { wrapper });

      await waitFor(() => expect(result.current.error).toBeDefined());

      expect(result.current.items).toEqual([]);
      expect(result.current.isLoading).toBe(false);
    });
  });
});
