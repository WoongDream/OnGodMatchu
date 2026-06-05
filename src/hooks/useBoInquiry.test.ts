import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import React from 'react';
import { SWRConfig } from 'swr';
import useBoInquiry from './useBoInquiry';
import type { BoInquiry } from '@/types';

// ── API mock ─────────────────────────────────────────────────────────────────
const mockGetBoInquiry = vi.hoisted(() => vi.fn());

vi.mock('@/api/inquiry', () => ({
  getBoInquiry: mockGetBoInquiry,
}));

// ── 샘플 데이터 ───────────────────────────────────────────────────────────────
const makeInquiry = (id: number): BoInquiry => ({
  id,
  title: `문의 ${id}`,
  content: '내용',
  author: { publicId: `pub-${id}`, nickname: `유저${id}`, profileImageUrl: null },
  status: 'PENDING',
  statusLabel: '대기',
  createdAt: '2026-01-01T00:00:00.000Z',
  answers: [],
});

// ── SWR 격리 wrapper ──────────────────────────────────────────────────────────
const wrapper = ({ children }: { children: React.ReactNode }) =>
  React.createElement(
    SWRConfig,
    { value: { provider: () => new Map(), dedupingInterval: 0 } },
    children,
  );

describe('useBoInquiry', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('happy path', () => {
    it('id 로 getBoInquiry 를 호출하고 inquiry 를 반환한다', async () => {
      mockGetBoInquiry.mockResolvedValue(makeInquiry(7));
      const { result } = renderHook(() => useBoInquiry(7), { wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(mockGetBoInquiry).toHaveBeenCalledWith(7);
      expect(result.current.inquiry?.id).toBe(7);
      expect(result.current.error).toBeUndefined();
    });

    it('fetch 완료 전에는 isLoading=true, inquiry=undefined 이다', () => {
      mockGetBoInquiry.mockReturnValue(new Promise(() => {}));
      const { result } = renderHook(() => useBoInquiry(7), { wrapper });

      expect(result.current.isLoading).toBe(true);
      expect(result.current.inquiry).toBeUndefined();
    });
  });

  describe('비활성화 (key null)', () => {
    it('id 가 null 이면 fetch 하지 않는다', async () => {
      const { result } = renderHook(() => useBoInquiry(null), { wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(mockGetBoInquiry).not.toHaveBeenCalled();
      expect(result.current.inquiry).toBeUndefined();
    });

    it('id 가 0 이면 fetch 하지 않는다', async () => {
      const { result } = renderHook(() => useBoInquiry(0), { wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(mockGetBoInquiry).not.toHaveBeenCalled();
    });

    it('id 가 음수면 fetch 하지 않는다', async () => {
      const { result } = renderHook(() => useBoInquiry(-1), { wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(mockGetBoInquiry).not.toHaveBeenCalled();
    });

    it('id 가 null→유효값으로 바뀌면 그 시점에 fetch 한다', async () => {
      mockGetBoInquiry.mockResolvedValue(makeInquiry(9));
      const { result, rerender } = renderHook((id: number | null) => useBoInquiry(id), {
        wrapper,
        initialProps: null as number | null,
      });

      expect(mockGetBoInquiry).not.toHaveBeenCalled();

      rerender(9);

      await waitFor(() => expect(result.current.inquiry?.id).toBe(9));
      expect(mockGetBoInquiry).toHaveBeenCalledWith(9);
    });
  });

  describe('refresh', () => {
    it('refresh 호출 시 mutate 로 재검증한다', async () => {
      mockGetBoInquiry.mockResolvedValue(makeInquiry(7));
      const { result } = renderHook(() => useBoInquiry(7), { wrapper });

      await waitFor(() => expect(mockGetBoInquiry).toHaveBeenCalledTimes(1));

      await act(async () => {
        result.current.refresh();
      });

      await waitFor(() => expect(mockGetBoInquiry).toHaveBeenCalledTimes(2));
    });
  });

  describe('에러 노출', () => {
    it('API 실패 시 error 가 노출되고 inquiry 는 undefined 이다', async () => {
      mockGetBoInquiry.mockRejectedValue(new Error('not found'));
      const { result } = renderHook(() => useBoInquiry(7), { wrapper });

      await waitFor(() => expect(result.current.error).toBeDefined());

      expect(result.current.inquiry).toBeUndefined();
      expect(result.current.isLoading).toBe(false);
    });
  });
});
