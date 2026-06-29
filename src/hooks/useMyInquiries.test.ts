import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import React from 'react';
import { SWRConfig } from 'swr';
import useMyInquiries from './useMyInquiries';
import type { InquiryListItem } from '@/types';

// ── API mock ─────────────────────────────────────────────────────────────────
const mockGetMyInquiries = vi.hoisted(() => vi.fn());

vi.mock('@/api/inquiry', () => ({
  getMyInquiries: mockGetMyInquiries,
}));

// ── 샘플 데이터 ───────────────────────────────────────────────────────────────
const makeItem = (id: number): InquiryListItem => ({
  id,
  title: `문의 ${id}`,
  content: '내용',
  status: 'PENDING',
  statusLabel: '대기',
  createdAt: '2026-01-01T00:00:00.000Z',
  answers: [],
});

const makePage = (items: InquiryListItem[], totalElements: number, last: boolean) => ({
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

describe('useMyInquiries', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('초기 로딩', () => {
    it('fetch 완료 전에는 isLoading=true, items=[], totalElements=0 이다', () => {
      mockGetMyInquiries.mockReturnValue(new Promise(() => {}));
      const { result } = renderHook(() => useMyInquiries(), { wrapper });

      expect(result.current.isLoading).toBe(true);
      expect(result.current.items).toEqual([]);
      expect(result.current.totalElements).toBe(0);
      expect(result.current.error).toBeUndefined();
    });

    it('기본 size(20) 와 page 0 으로 getMyInquiries 를 호출한다', async () => {
      mockGetMyInquiries.mockResolvedValue(makePage([makeItem(1)], 1, true));
      renderHook(() => useMyInquiries(), { wrapper });

      await waitFor(() => expect(mockGetMyInquiries).toHaveBeenCalled());

      expect(mockGetMyInquiries).toHaveBeenCalledWith({ page: 0, size: 20 });
    });

    it('size 인자가 fetcher 에 전달된다', async () => {
      mockGetMyInquiries.mockResolvedValue(makePage([makeItem(1)], 1, true));
      renderHook(() => useMyInquiries(5), { wrapper });

      await waitFor(() => expect(mockGetMyInquiries).toHaveBeenCalled());

      expect(mockGetMyInquiries).toHaveBeenCalledWith({ page: 0, size: 5 });
    });
  });

  describe('응답 집계', () => {
    it('첫 페이지 content 가 items 로 flatMap 매핑된다', async () => {
      mockGetMyInquiries.mockResolvedValue(makePage([makeItem(1), makeItem(2)], 2, true));
      const { result } = renderHook(() => useMyInquiries(), { wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(result.current.items.map((i) => i.id)).toEqual([1, 2]);
    });

    it('totalElements 는 첫 페이지 값에서 가져온다', async () => {
      mockGetMyInquiries.mockResolvedValue(makePage([makeItem(1)], 42, false));
      const { result } = renderHook(() => useMyInquiries(), { wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(result.current.totalElements).toBe(42);
    });

    it('last=true 이면 hasNext=false 이다', async () => {
      mockGetMyInquiries.mockResolvedValue(makePage([makeItem(1)], 1, true));
      const { result } = renderHook(() => useMyInquiries(), { wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(result.current.hasNext).toBe(false);
    });

    it('last=false 이면 hasNext=true 이다', async () => {
      mockGetMyInquiries.mockResolvedValue(makePage([makeItem(1)], 10, false));
      const { result } = renderHook(() => useMyInquiries(), { wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(result.current.hasNext).toBe(true);
    });
  });

  describe('loadMore — 페이지 누적', () => {
    it('loadMore 호출 시 다음 페이지를 fetch 하고 items 를 누적한다 (setSize)', async () => {
      mockGetMyInquiries.mockImplementation(({ page }: { page: number }) =>
        page === 0
          ? Promise.resolve(makePage([makeItem(1), makeItem(2)], 4, false))
          : Promise.resolve(makePage([makeItem(3), makeItem(4)], 4, true)),
      );

      const { result } = renderHook(() => useMyInquiries(2), { wrapper });

      await waitFor(() => expect(result.current.items).toHaveLength(2));
      expect(result.current.hasNext).toBe(true);

      act(() => {
        result.current.loadMore();
      });

      await waitFor(() => expect(result.current.items).toHaveLength(4));
      expect(result.current.items.map((i) => i.id)).toEqual([1, 2, 3, 4]);
      expect(result.current.hasNext).toBe(false);
      expect(mockGetMyInquiries).toHaveBeenCalledWith({ page: 1, size: 2 });
    });

    it('hasNext=false(last=true) 이면 loadMore 가 추가 fetch 를 하지 않는다', async () => {
      mockGetMyInquiries.mockResolvedValue(makePage([makeItem(1)], 1, true));
      const { result } = renderHook(() => useMyInquiries(), { wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));
      expect(mockGetMyInquiries).toHaveBeenCalledTimes(1);

      act(() => {
        result.current.loadMore();
      });

      expect(mockGetMyInquiries).toHaveBeenCalledTimes(1);
    });
  });

  describe('refresh', () => {
    it('refresh 호출 시 mutate 로 재검증한다', async () => {
      mockGetMyInquiries.mockResolvedValue(makePage([makeItem(1)], 1, true));
      const { result } = renderHook(() => useMyInquiries(), { wrapper });

      await waitFor(() => expect(mockGetMyInquiries).toHaveBeenCalledTimes(1));

      await act(async () => {
        result.current.refresh();
      });

      await waitFor(() => expect(mockGetMyInquiries).toHaveBeenCalledTimes(2));
    });
  });

  describe('빈 결과', () => {
    it('content 가 비면 items=[], totalElements=0, hasNext=false 이다', async () => {
      mockGetMyInquiries.mockResolvedValue(makePage([], 0, true));
      const { result } = renderHook(() => useMyInquiries(), { wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(result.current.items).toEqual([]);
      expect(result.current.totalElements).toBe(0);
      expect(result.current.hasNext).toBe(false);
    });
  });

  describe('에러 노출', () => {
    it('API 실패 시 error 가 노출되고 items 는 [] 이다', async () => {
      mockGetMyInquiries.mockRejectedValue(new Error('서버 오류'));
      const { result } = renderHook(() => useMyInquiries(), { wrapper });

      await waitFor(() => expect(result.current.error).toBeDefined());

      expect(result.current.items).toEqual([]);
      expect(result.current.isLoading).toBe(false);
    });
  });
});
