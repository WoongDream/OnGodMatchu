import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import useDebouncedValue from './useDebouncedValue';

describe('useDebouncedValue', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('초기값을 즉시 반환한다', () => {
    const { result } = renderHook(() => useDebouncedValue('initial', 300));
    expect(result.current).toBe('initial');
  });

  it('값이 바뀌어도 delay 가 지나기 전에는 이전 값을 유지한다', () => {
    const { result, rerender } = renderHook(({ value }) => useDebouncedValue(value, 300), {
      initialProps: { value: 'a' },
    });
    rerender({ value: 'b' });
    act(() => {
      vi.advanceTimersByTime(299);
    });
    expect(result.current).toBe('a');
  });

  it('delay 후에는 새 값을 반환한다', () => {
    const { result, rerender } = renderHook(({ value }) => useDebouncedValue(value, 300), {
      initialProps: { value: 'a' },
    });
    rerender({ value: 'b' });
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(result.current).toBe('b');
  });

  it('연속 변경 시 마지막 값으로 한 번만 갱신한다 (이전 타이머 취소)', () => {
    const { result, rerender } = renderHook(({ value }) => useDebouncedValue(value, 300), {
      initialProps: { value: 'a' },
    });
    rerender({ value: 'b' });
    act(() => {
      vi.advanceTimersByTime(150);
    });
    rerender({ value: 'c' });
    act(() => {
      vi.advanceTimersByTime(299);
    });
    expect(result.current).toBe('a');
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(result.current).toBe('c');
  });
});
