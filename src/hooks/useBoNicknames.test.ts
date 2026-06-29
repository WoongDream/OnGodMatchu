import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import React from 'react';
import { SWRConfig } from 'swr';
import useBoNicknames from './useBoNicknames';
import type { ForbiddenNickname } from '@/types';

// ── API mock ─────────────────────────────────────────────────────────────────
const mockGetBoNicknames = vi.hoisted(() => vi.fn());

vi.mock('@/api/admin', () => ({
  getBoNicknames: mockGetBoNicknames,
}));

// ── 샘플 데이터 ───────────────────────────────────────────────────────────────
const makeItem = (id: number): ForbiddenNickname => ({
  id,
  value: `차단어 ${id}`,
  normalizedValue: `차단어${id}`,
  type: 'FORBIDDEN',
  matchType: 'EXACT',
  reason: null,
  createdAt: '2026-01-01T00:00:00.000Z',
});

const makePage = (items: ForbiddenNickname[], totalElements: number, last: boolean) => ({
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

describe('useBoNicknames', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('초기 로딩', () => {
    it('fetch 완료 전에는 isLoading=true, items=[] 이다', () => {
      mockGetBoNicknames.mockReturnValue(new Promise(() => {}));
      const { result } = renderHook(() => useBoNicknames(), { wrapper });

      expect(result.current.isLoading).toBe(true);
      expect(result.current.items).toEqual([]);
      expect(result.current.totalElements).toBe(0);
    });
  });

  describe('happy path', () => {
    it('첫 페이지 content 가 items 로 flatMap 매핑된다', async () => {
      mockGetBoNicknames.mockResolvedValue(makePage([makeItem(1), makeItem(2)], 2, true));
      const { result } = renderHook(() => useBoNicknames(), { wrapper });

      await waitFor(() => expect(result.current.items).toHaveLength(2));

      expect(result.current.items.map((i) => i.id)).toEqual([1, 2]);
    });

    it('totalElements 는 첫 페이지 값에서 가져온다', async () => {
      mockGetBoNicknames.mockResolvedValue(makePage([makeItem(1)], 42, false));
      const { result } = renderHook(() => useBoNicknames(), { wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(result.current.totalElements).toBe(42);
    });

    it('기본값으로 filter=ALL, query=undefined, page=0, size=20 를 API 에 전달한다', async () => {
      mockGetBoNicknames.mockResolvedValue(makePage([makeItem(1)], 1, true));
      renderHook(() => useBoNicknames(), { wrapper });

      await waitFor(() => expect(mockGetBoNicknames).toHaveBeenCalled());

      const [query] = mockGetBoNicknames.mock.calls[0] as [
        { filter: string; query?: string; page: number; size: number },
      ];
      expect(query.filter).toBe('ALL');
      expect(query.query).toBeUndefined();
      expect(query.page).toBe(0);
      expect(query.size).toBe(20);
    });
  });

  describe('빈 상태', () => {
    it('content 가 비면 items=[] 이고 totalElements=0 이다', async () => {
      mockGetBoNicknames.mockResolvedValue(makePage([], 0, true));
      const { result } = renderHook(() => useBoNicknames(), { wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(result.current.items).toEqual([]);
      expect(result.current.totalElements).toBe(0);
      expect(result.current.hasNext).toBe(false);
    });
  });

  describe('filter / query 키 분리', () => {
    it('filter 가 API 쿼리에 전달된다', async () => {
      mockGetBoNicknames.mockResolvedValue(makePage([makeItem(1)], 1, true));
      renderHook(() => useBoNicknames({ filter: 'RESERVED' }), { wrapper });

      await waitFor(() => expect(mockGetBoNicknames).toHaveBeenCalled());

      const [query] = mockGetBoNicknames.mock.calls[0] as [{ filter: string }];
      expect(query.filter).toBe('RESERVED');
    });

    it('query 가 API 쿼리에 전달된다', async () => {
      mockGetBoNicknames.mockResolvedValue(makePage([makeItem(1)], 1, true));
      renderHook(() => useBoNicknames({ query: '관리자' }), { wrapper });

      await waitFor(() => expect(mockGetBoNicknames).toHaveBeenCalled());

      const [query] = mockGetBoNicknames.mock.calls[0] as [{ query?: string }];
      expect(query.query).toBe('관리자');
    });

    it('빈 query 는 undefined 로 정규화되어 전달된다', async () => {
      mockGetBoNicknames.mockResolvedValue(makePage([makeItem(1)], 1, true));
      renderHook(() => useBoNicknames({ query: '' }), { wrapper });

      await waitFor(() => expect(mockGetBoNicknames).toHaveBeenCalled());

      const [query] = mockGetBoNicknames.mock.calls[0] as [{ query?: string }];
      expect(query.query).toBeUndefined();
    });

    it('filter 가 바뀌면 캐시 키가 분리되어 재요청한다', async () => {
      mockGetBoNicknames.mockResolvedValue(makePage([makeItem(1)], 1, true));
      const { rerender } = renderHook((p: { filter: 'ALL' | 'RESERVED' }) => useBoNicknames(p), {
        wrapper,
        initialProps: { filter: 'ALL' as 'ALL' | 'RESERVED' },
      });

      await waitFor(() => expect(mockGetBoNicknames).toHaveBeenCalledTimes(1));

      rerender({ filter: 'RESERVED' });

      await waitFor(() => expect(mockGetBoNicknames).toHaveBeenCalledTimes(2));
      const filters = mockGetBoNicknames.mock.calls.map(([q]) => (q as { filter: string }).filter);
      expect(filters).toContain('ALL');
      expect(filters).toContain('RESERVED');
    });
  });

  describe('hasNext / loadMore', () => {
    it('마지막 페이지면 hasNext=false 이다', async () => {
      mockGetBoNicknames.mockResolvedValue(makePage([makeItem(1)], 1, true));
      const { result } = renderHook(() => useBoNicknames(), { wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(result.current.hasNext).toBe(false);
    });

    it('마지막 페이지가 아니면 hasNext=true 이다', async () => {
      mockGetBoNicknames.mockResolvedValue(makePage([makeItem(1)], 50, false));
      const { result } = renderHook(() => useBoNicknames(), { wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(result.current.hasNext).toBe(true);
    });

    it('loadMore 가 다음 페이지를 불러와 items 를 누적한다', async () => {
      mockGetBoNicknames.mockImplementation((query: { page: number }) => {
        if (query.page === 0) {
          return Promise.resolve(makePage([makeItem(1), makeItem(2)], 3, false));
        }
        return Promise.resolve(makePage([makeItem(3)], 3, true));
      });

      const { result } = renderHook(() => useBoNicknames({ size: 2 }), { wrapper });

      await waitFor(() => expect(result.current.items).toHaveLength(2));
      expect(result.current.hasNext).toBe(true);

      act(() => {
        result.current.loadMore();
      });

      await waitFor(() => expect(result.current.items).toHaveLength(3));
      expect(result.current.items.map((i) => i.id)).toEqual([1, 2, 3]);
      expect(result.current.hasNext).toBe(false);
    });

    it('hasNext=false 이면 loadMore 는 추가 요청하지 않는다', async () => {
      mockGetBoNicknames.mockResolvedValue(makePage([makeItem(1)], 1, true));
      const { result } = renderHook(() => useBoNicknames(), { wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));
      expect(result.current.hasNext).toBe(false);

      act(() => {
        result.current.loadMore();
      });

      expect(mockGetBoNicknames).toHaveBeenCalledTimes(1);
    });
  });

  describe('에러 노출', () => {
    it('API 실패 시 error 가 노출되고 items 는 [] 이다', async () => {
      mockGetBoNicknames.mockRejectedValue(new Error('서버 오류'));
      const { result } = renderHook(() => useBoNicknames(), { wrapper });

      await waitFor(() => expect(result.current.error).toBeDefined());

      expect(result.current.items).toEqual([]);
    });
  });
});
