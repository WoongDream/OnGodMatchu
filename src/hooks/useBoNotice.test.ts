import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import React from 'react';
import { SWRConfig } from 'swr';
import useBoNotice from './useBoNotice';
import type { BoNotice } from '@/types';

// ── API mock ─────────────────────────────────────────────────────────────────
const mockGetBoNotice = vi.hoisted(() => vi.fn());

vi.mock('@/api/admin', () => ({
  getBoNotice: mockGetBoNotice,
}));

const makeNotice = (overrides: Partial<BoNotice> = {}): BoNotice => ({
  id: 1,
  title: '공지 제목',
  content: '본문',
  status: 'PUBLISHED',
  pinned: false,
  viewCount: 0,
  publishedAt: '2026-01-01T00:00:00.000Z',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: null,
  ...overrides,
});

// ── SWR 격리 wrapper ──────────────────────────────────────────────────────────
const wrapper = ({ children }: { children: React.ReactNode }) =>
  React.createElement(
    SWRConfig,
    { value: { provider: () => new Map(), dedupingInterval: 0 } },
    children,
  );

describe('useBoNotice', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('id 없음 — 키 null', () => {
    it('id 가 undefined 면 getBoNotice 를 호출하지 않는다', async () => {
      const { result } = renderHook(() => useBoNotice(undefined), { wrapper });

      // 키가 null 이라 fetch 가 일어나지 않음
      await Promise.resolve();
      expect(mockGetBoNotice).not.toHaveBeenCalled();
      expect(result.current.notice).toBeUndefined();
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('id 있음 — happy path', () => {
    it('id 가 있으면 getBoNotice(id) 를 호출한다', async () => {
      mockGetBoNotice.mockResolvedValue(makeNotice({ id: 7 }));
      renderHook(() => useBoNotice(7), { wrapper });

      await waitFor(() => expect(mockGetBoNotice).toHaveBeenCalled());

      expect(mockGetBoNotice.mock.calls[0][0]).toBe(7);
    });

    it('notice 를 노출한다', async () => {
      const notice = makeNotice({ id: 7, title: '단건 공지' });
      mockGetBoNotice.mockResolvedValue(notice);
      const { result } = renderHook(() => useBoNotice(7), { wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(result.current.notice).toEqual(notice);
    });

    it('fetch 완료 전에는 isLoading=true, notice=undefined 이다', () => {
      mockGetBoNotice.mockReturnValue(new Promise(() => {}));
      const { result } = renderHook(() => useBoNotice(7), { wrapper });

      expect(result.current.isLoading).toBe(true);
      expect(result.current.notice).toBeUndefined();
    });
  });

  describe('id 변경 — 키 분리', () => {
    it('id 가 바뀌면 새 id 로 재요청한다', async () => {
      mockGetBoNotice.mockResolvedValue(makeNotice());
      const { rerender } = renderHook((id: number) => useBoNotice(id), {
        wrapper,
        initialProps: 1,
      });

      await waitFor(() => expect(mockGetBoNotice).toHaveBeenCalledTimes(1));

      rerender(2);

      await waitFor(() => expect(mockGetBoNotice).toHaveBeenCalledTimes(2));
      const ids = mockGetBoNotice.mock.calls.map(([id]) => id);
      expect(ids).toContain(1);
      expect(ids).toContain(2);
    });
  });

  describe('에러 노출', () => {
    it('API 실패 시 error 가 노출되고 notice 는 undefined 이다', async () => {
      mockGetBoNotice.mockRejectedValue(new Error('not found'));
      const { result } = renderHook(() => useBoNotice(7), { wrapper });

      await waitFor(() => expect(result.current.error).toBeDefined());

      expect(result.current.notice).toBeUndefined();
    });
  });
});
