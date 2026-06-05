import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import React from 'react';
import { SWRConfig } from 'swr';
import usePendingNotifications from './usePendingNotifications';
import type { UserNotification } from '@/types';

// ── API mock ─────────────────────────────────────────────────────────────────
const mockGetPendingNotifications = vi.hoisted(() => vi.fn());

vi.mock('@/api/notification', () => ({
  getPendingNotifications: mockGetPendingNotifications,
}));

const makeNotification = (id: number): UserNotification => ({
  id,
  type: 'INFO',
  typeLabel: '안내',
  title: `알림 ${id}`,
  content: '내용',
  senderLabel: '운영팀',
  createdAt: '2025-01-01T00:00:00Z',
});

// ── SWR 격리 wrapper ──────────────────────────────────────────────────────────
const wrapper = ({ children }: { children: React.ReactNode }) =>
  React.createElement(
    SWRConfig,
    { value: { provider: () => new Map(), dedupingInterval: 0 } },
    children,
  );

describe('usePendingNotifications', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('enabled=false (비로그인 → 요청 안 함)', () => {
    it('getPendingNotifications 를 호출하지 않고 기본값 [] 을 반환한다', () => {
      const { result } = renderHook(() => usePendingNotifications(false), { wrapper });

      expect(mockGetPendingNotifications).not.toHaveBeenCalled();
      expect(result.current.notifications).toEqual([]);
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('enabled=true (로그인)', () => {
    it('getPendingNotifications 를 호출하고 notifications 를 노출한다', async () => {
      const items = [makeNotification(1), makeNotification(2)];
      mockGetPendingNotifications.mockResolvedValue(items);
      const { result } = renderHook(() => usePendingNotifications(true), { wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(mockGetPendingNotifications).toHaveBeenCalled();
      expect(result.current.notifications).toEqual(items);
    });

    it('data 가 비면(undefined 단계 포함) 기본값 [] 을 반환한다', async () => {
      mockGetPendingNotifications.mockResolvedValue([]);
      const { result } = renderHook(() => usePendingNotifications(true), { wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(result.current.notifications).toEqual([]);
    });
  });

  describe('폴링 (refreshInterval)', () => {
    afterEach(() => {
      vi.useRealTimers();
    });

    it('refreshInterval 경과 시 재요청한다', async () => {
      vi.useFakeTimers();
      mockGetPendingNotifications.mockResolvedValue([makeNotification(1)]);

      const { result } = renderHook(() => usePendingNotifications(true), { wrapper });

      await vi.waitFor(() => expect(mockGetPendingNotifications).toHaveBeenCalledTimes(1));

      // 폴링 주기(60s) 경과 → 추가 호출
      await act(async () => {
        await vi.advanceTimersByTimeAsync(60_000);
      });

      await vi.waitFor(() =>
        expect(mockGetPendingNotifications.mock.calls.length).toBeGreaterThanOrEqual(2),
      );
      expect(result.current.notifications).toEqual([makeNotification(1)]);
    });
  });

  describe('refresh', () => {
    it('refresh 호출 시 재요청한다', async () => {
      mockGetPendingNotifications.mockResolvedValue([makeNotification(1)]);
      const { result } = renderHook(() => usePendingNotifications(true), { wrapper });

      await waitFor(() => expect(mockGetPendingNotifications).toHaveBeenCalledTimes(1));

      act(() => {
        result.current.refresh();
      });

      await waitFor(() => expect(mockGetPendingNotifications).toHaveBeenCalledTimes(2));
    });
  });

  describe('에러 노출', () => {
    it('API 실패 시 error 가 노출되고 notifications 는 [] 이다', async () => {
      mockGetPendingNotifications.mockRejectedValue(new Error('서버 오류'));
      const { result } = renderHook(() => usePendingNotifications(true), { wrapper });

      await waitFor(() => expect(result.current.error).toBeDefined());

      expect(result.current.notifications).toEqual([]);
    });
  });
});
