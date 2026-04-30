---
name: Async Hook Testing Patterns (fake timers + promises)
description: How to test hooks that use setTimeout AND async Promises without waitFor timeouts
type: feedback
---

## Problem: vi.useFakeTimers() breaks waitFor

`waitFor` uses real timers internally for its polling interval. When `vi.useFakeTimers()` is active globally in `beforeEach`, all `waitFor` calls hang indefinitely (5s timeout).

**Why:** `waitFor` polls via `setInterval` which is frozen by fake timers.

**How to apply:**
- Never call `vi.useFakeTimers()` in a top-level `beforeEach` for hooks that also need async assertions
- Instead, call `vi.useFakeTimers()` and `vi.useRealTimers()` **inside individual test cases** that need timer control, using try/finally

## Pattern: Scoped fake timers

```ts
it('1.5초 후 navigate 호출', async () => {
  vi.useFakeTimers();
  try {
    renderHook(...);
    await act(async () => { /* flush promises */ });
    expect(mockNavigate).not.toHaveBeenCalled();
    act(() => { vi.advanceTimersByTime(1500); });
    expect(mockNavigate).toHaveBeenCalled();
  } finally {
    vi.useRealTimers();
  }
});
```

## Pattern: flushPromises for async hooks

For hooks that call `getMe()` (promise-based), use a local `flushPromises`:

```ts
async function flushPromises() {
  await act(async () => {
    await new Promise<void>((resolve) => setTimeout(resolve, 0));
  });
}
```

This ensures `.then()` / `.catch()` handlers run before assertions.

## Pattern: Storage.prototype.spyOn limitation in happy-dom

`vi.spyOn(Storage.prototype, 'setItem')` may report 0 calls even when localStorage.setItem is invoked in the hook. This is a happy-dom limitation.

**Workaround:** Verify localStorage side effects via `localStorage.getItem()` instead of spy call counts:
```ts
// Instead of:
expect(setItemSpy).toHaveBeenCalledWith('accessToken', 'val');

// Use:
expect(localStorage.getItem('accessToken')).toBe('val');
```

## Pattern: Zustand store mock for selector-based hooks

When a hook calls `useAuthStore((s) => s.setUser)`, mock the store like:
```ts
const mockSetUser = vi.hoisted(() => vi.fn());
vi.mock('@/store/authStore', () => ({
  default: (selector: (s: { setUser: typeof mockSetUser }) => unknown) =>
    selector({ setUser: mockSetUser }),
}));
```

This passes the selector function a plain object with the mocked action, matching Zustand's usage pattern.
