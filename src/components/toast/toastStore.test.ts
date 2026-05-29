import { describe, it, expect, beforeEach } from 'vitest';
import useToastStore from './toastStore';

describe('toastStore', () => {
  beforeEach(() => {
    // 전역 store 초기화
    useToastStore.setState({ toasts: [] });
  });

  it('show() 호출 시 토스트가 추가되고 id 가 반환된다', () => {
    const id = useToastStore.getState().show('hi');
    expect(typeof id).toBe('number');
    expect(useToastStore.getState().toasts).toHaveLength(1);
    expect(useToastStore.getState().toasts[0].message).toBe('hi');
  });

  it('기본 variant 는 success, durationMs 는 3000', () => {
    useToastStore.getState().show('hi');
    const t = useToastStore.getState().toasts[0];
    expect(t.variant).toBe('success');
    expect(t.durationMs).toBe(3000);
  });

  it('variant/durationMs 옵션이 전달된다', () => {
    useToastStore.getState().show('boom', { variant: 'error', durationMs: 1000 });
    const t = useToastStore.getState().toasts[0];
    expect(t.variant).toBe('error');
    expect(t.durationMs).toBe(1000);
  });

  it('dismiss(id) 는 해당 토스트만 제거한다', () => {
    const a = useToastStore.getState().show('a');
    const b = useToastStore.getState().show('b');
    useToastStore.getState().dismiss(a);
    const toasts = useToastStore.getState().toasts;
    expect(toasts).toHaveLength(1);
    expect(toasts[0].id).toBe(b);
  });

  it('연속 show 시 id 는 단조 증가', () => {
    const a = useToastStore.getState().show('a');
    const b = useToastStore.getState().show('b');
    const c = useToastStore.getState().show('c');
    expect(a < b).toBe(true);
    expect(b < c).toBe(true);
  });
});
