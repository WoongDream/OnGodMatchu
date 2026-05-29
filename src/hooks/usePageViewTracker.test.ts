import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { recordVisit } from '@/api/visit';
import usePageViewTracker from './usePageViewTracker';

vi.mock('@/api/visit', () => ({
  recordVisit: vi.fn(),
}));

const makeWrapper = (initialPath: string) => {
  const Wrapper = ({ children }: { children: React.ReactNode }) =>
    React.createElement(MemoryRouter, { initialEntries: [initialPath] }, children);
  return Wrapper;
};

describe('usePageViewTracker', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.mocked(recordVisit).mockReset();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('트래킹 경로 마운트 → 300ms debounce 후 recordVisit 1회 호출', () => {
    renderHook(() => usePageViewTracker(), { wrapper: makeWrapper('/quiz') });

    expect(recordVisit).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(recordVisit).toHaveBeenCalledTimes(1);
    expect(recordVisit).toHaveBeenCalledWith('/quiz');
  });

  it('debounce 전 unmount 되면 recordVisit 호출 안 됨', () => {
    const { unmount } = renderHook(() => usePageViewTracker(), {
      wrapper: makeWrapper('/quiz'),
    });

    act(() => {
      vi.advanceTimersByTime(100);
    });
    unmount();
    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(recordVisit).not.toHaveBeenCalled();
  });

  it('트래킹 제외 경로(/quiz/123/play) 마운트 → recordVisit 호출 안 됨', () => {
    renderHook(() => usePageViewTracker(), { wrapper: makeWrapper('/quiz/123/play') });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(recordVisit).not.toHaveBeenCalled();
  });

  it('같은 pathname 으로 rerender 해도 recordVisit 추가 호출 없음 (lastTrackedRef 가드)', () => {
    const { rerender } = renderHook(() => usePageViewTracker(), {
      wrapper: makeWrapper('/quiz'),
    });

    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(recordVisit).toHaveBeenCalledTimes(1);
    expect(recordVisit).toHaveBeenCalledWith('/quiz');

    rerender();
    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(recordVisit).toHaveBeenCalledTimes(1);
  });

  it('다른 path 로 변경 시 각각 recordVisit 호출 (별도 mount 비교)', () => {
    const { unmount } = renderHook(() => usePageViewTracker(), {
      wrapper: makeWrapper('/quiz'),
    });
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(recordVisit).toHaveBeenCalledTimes(1);
    expect(recordVisit).toHaveBeenNthCalledWith(1, '/quiz');
    unmount();

    renderHook(() => usePageViewTracker(), { wrapper: makeWrapper('/quiz/123') });
    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(recordVisit).toHaveBeenCalledTimes(2);
    expect(recordVisit).toHaveBeenNthCalledWith(2, '/quiz/123');
  });
});
