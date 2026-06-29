import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import React from 'react';
import { SWRConfig } from 'swr';
import useBoNickname from './useBoNickname';
import type { ForbiddenNickname } from '@/types';

// ── API mock ─────────────────────────────────────────────────────────────────
const mockGetBoNickname = vi.hoisted(() => vi.fn());

vi.mock('@/api/admin', () => ({
  getBoNickname: mockGetBoNickname,
}));

const makeRule = (overrides: Partial<ForbiddenNickname> = {}): ForbiddenNickname => ({
  id: 1,
  value: '관리자',
  normalizedValue: '관리자',
  type: 'FORBIDDEN',
  matchType: 'EXACT',
  reason: '운영 예약어',
  createdAt: '2026-01-01T00:00:00.000Z',
  ...overrides,
});

// ── SWR 격리 wrapper ──────────────────────────────────────────────────────────
const wrapper = ({ children }: { children: React.ReactNode }) =>
  React.createElement(
    SWRConfig,
    { value: { provider: () => new Map(), dedupingInterval: 0 } },
    children,
  );

describe('useBoNickname', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('id 없음 — 키 null', () => {
    it('id 가 undefined 면 getBoNickname 를 호출하지 않는다', async () => {
      const { result } = renderHook(() => useBoNickname(undefined), { wrapper });

      // 키가 null 이라 fetch 가 일어나지 않음
      await Promise.resolve();
      expect(mockGetBoNickname).not.toHaveBeenCalled();
      expect(result.current.rule).toBeUndefined();
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('id 있음 — happy path', () => {
    it('id 가 있으면 getBoNickname(id) 를 호출한다', async () => {
      mockGetBoNickname.mockResolvedValue(makeRule({ id: 7 }));
      renderHook(() => useBoNickname(7), { wrapper });

      await waitFor(() => expect(mockGetBoNickname).toHaveBeenCalled());

      expect(mockGetBoNickname.mock.calls[0][0]).toBe(7);
    });

    it('rule 을 노출한다', async () => {
      const rule = makeRule({ id: 7, value: '단건 규칙' });
      mockGetBoNickname.mockResolvedValue(rule);
      const { result } = renderHook(() => useBoNickname(7), { wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(result.current.rule).toEqual(rule);
    });

    it('fetch 완료 전에는 isLoading=true, rule=undefined 이다', () => {
      mockGetBoNickname.mockReturnValue(new Promise(() => {}));
      const { result } = renderHook(() => useBoNickname(7), { wrapper });

      expect(result.current.isLoading).toBe(true);
      expect(result.current.rule).toBeUndefined();
    });
  });

  describe('id 변경 — 키 분리', () => {
    it('id 가 바뀌면 새 id 로 재요청한다', async () => {
      mockGetBoNickname.mockResolvedValue(makeRule());
      const { rerender } = renderHook((id: number) => useBoNickname(id), {
        wrapper,
        initialProps: 1,
      });

      await waitFor(() => expect(mockGetBoNickname).toHaveBeenCalledTimes(1));

      rerender(2);

      await waitFor(() => expect(mockGetBoNickname).toHaveBeenCalledTimes(2));
      const ids = mockGetBoNickname.mock.calls.map(([id]) => id);
      expect(ids).toContain(1);
      expect(ids).toContain(2);
    });
  });

  describe('에러 노출', () => {
    it('API 실패 시 error 가 노출되고 rule 은 undefined 이다', async () => {
      mockGetBoNickname.mockRejectedValue(new Error('not found'));
      const { result } = renderHook(() => useBoNickname(7), { wrapper });

      await waitFor(() => expect(result.current.error).toBeDefined());

      expect(result.current.rule).toBeUndefined();
    });
  });
});
