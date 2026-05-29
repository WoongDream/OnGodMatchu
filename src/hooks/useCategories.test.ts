import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import React from 'react';
import { SWRConfig } from 'swr';
import useCategories from './useCategories';

const mockGetCategories = vi.hoisted(() => vi.fn());

vi.mock('@/api/quiz', () => ({
  getCategories: mockGetCategories,
}));

const wrapper = ({ children }: { children: React.ReactNode }) =>
  React.createElement(
    SWRConfig,
    { value: { provider: () => new Map(), dedupingInterval: 0 } },
    children,
  );

describe('useCategories', () => {
  beforeEach(() => {
    mockGetCategories.mockReset();
  });

  it('초기 상태는 isLoading=true, categories=undefined', () => {
    mockGetCategories.mockResolvedValue([]);
    const { result } = renderHook(() => useCategories(), { wrapper });
    expect(result.current.isLoading).toBe(true);
    expect(result.current.categories).toBeUndefined();
  });

  it('성공 시 응답을 그대로 반환 (배열 순서 유지)', async () => {
    const items = [
      { key: 'sports', label: '스포츠' },
      { key: 'culture', label: '문화' },
      { key: 'game', label: '게임' },
    ];
    mockGetCategories.mockResolvedValue(items);

    const { result } = renderHook(() => useCategories(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.categories).toEqual(items);
    expect(result.current.error).toBeUndefined();
  });

  it('실패 시 error 가 채워지고 categories 는 undefined', async () => {
    const err = new Error('boom');
    mockGetCategories.mockRejectedValue(err);

    const { result } = renderHook(() => useCategories(), { wrapper });
    await waitFor(() => expect(result.current.error).toBeDefined());

    expect(result.current.categories).toBeUndefined();
  });

  it('동일 SWR 캐시에서 두 번 호출해도 fetch 는 한 번만 일어난다', async () => {
    mockGetCategories.mockResolvedValue([]);

    const cache = new Map();
    const sharedWrapper = ({ children }: { children: React.ReactNode }) =>
      React.createElement(
        SWRConfig,
        { value: { provider: () => cache, dedupingInterval: 60_000 } },
        children,
      );

    const { result: r1 } = renderHook(() => useCategories(), { wrapper: sharedWrapper });
    await waitFor(() => expect(r1.current.isLoading).toBe(false));
    const { result: r2 } = renderHook(() => useCategories(), { wrapper: sharedWrapper });
    await waitFor(() => expect(r2.current.isLoading).toBe(false));

    expect(mockGetCategories).toHaveBeenCalledTimes(1);
  });
});
