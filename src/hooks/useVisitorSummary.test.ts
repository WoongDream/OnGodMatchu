import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { createElement, type ReactNode } from 'react';
import { SWRConfig } from 'swr';
import useVisitorSummary from './useVisitorSummary';
import { getVisitorSummary } from '@/api/stats';
import type { VisitorSummary } from '@/api/stats';

vi.mock('@/api/stats', () => ({
  getVisitorSummary: vi.fn(),
}));

const mockedGetVisitorSummary = vi.mocked(getVisitorSummary);

type WrapperProps = { children: ReactNode };

const createWrapper = () => {
  // SWRConfig 의 provider 타입(`Cache<any>`)은 내부 옵션. 테스트마다 cache 격리를 위해 cast.
  const value = {
    provider: () => new Map(),
    dedupingInterval: 0,
  } as unknown as Parameters<typeof SWRConfig>[0]['value'];
  const Wrapper = ({ children }: WrapperProps) => createElement(SWRConfig, { value }, children);
  return Wrapper;
};

const samplePayload: VisitorSummary = {
  today: 42,
  total: 1234,
  daily: [
    { date: '2026-05-27', visitorCount: 30 },
    { date: '2026-05-28', visitorCount: 42 },
  ],
};

beforeEach(() => {
  mockedGetVisitorSummary.mockReset();
});

describe('useVisitorSummary', () => {
  it('mount 직후 getVisitorSummary 가 호출된다', async () => {
    mockedGetVisitorSummary.mockResolvedValue(samplePayload);

    renderHook(() => useVisitorSummary(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(mockedGetVisitorSummary).toHaveBeenCalledTimes(1);
    });
  });

  it('초기 상태는 isLoading=true, data=undefined, error=undefined', () => {
    mockedGetVisitorSummary.mockResolvedValue(samplePayload);

    const { result } = renderHook(() => useVisitorSummary(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeUndefined();
    expect(result.current.error).toBeUndefined();
  });

  it('resolve 후 data 가 반환값으로 채워진다', async () => {
    mockedGetVisitorSummary.mockResolvedValue(samplePayload);

    const { result } = renderHook(() => useVisitorSummary(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.data).toEqual(samplePayload);
    expect(result.current.error).toBeUndefined();
  });

  it('reject 시 error 가 노출되고 data 는 undefined 로 남는다', async () => {
    const failure = new Error('stats down');
    mockedGetVisitorSummary.mockRejectedValue(failure);

    const { result } = renderHook(() => useVisitorSummary(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.error).toBeDefined());

    expect(result.current.error).toBe(failure);
    expect(result.current.data).toBeUndefined();
  });
});
