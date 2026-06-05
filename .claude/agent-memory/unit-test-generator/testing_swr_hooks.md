---
name: SWR / useSWRInfinite Hook Testing Patterns
description: How to test SWR-based data hooks (useSWR, useSWRInfinite) — isolation wrapper, null-key (no-fetch) branches, loadMore, refreshInterval polling
type: feedback
---

## SWR isolation wrapper (always use this)

SWR caches globally across renderHook calls. Wrap every test with a fresh cache + no dedup:

```ts
const wrapper = ({ children }: { children: React.ReactNode }) =>
  React.createElement(
    SWRConfig,
    { value: { provider: () => new Map(), dedupingInterval: 0 } },
    children,
  );
```

`provider: () => new Map()` gives each render a private cache (no cross-test bleed); `dedupingInterval: 0` lets `refresh()` and rerenders re-fetch immediately. This is the established convention across the hooks/ test suite (useBoNoticeStats, useProfileSummary, useMyAttemptsInfinite).

## Mock the api module, not instance

For hooks, `vi.mock('@/api/admin', () => ({ getX: mockGetX }))` with `const mockGetX = vi.hoisted(() => vi.fn())`. Only export the functions the hook imports — extra members aren't needed.

## null-key (no-fetch) branch

Hooks gate fetching with `enabled ? key : null` or `publicId ? key : null` (incl. empty-string falsy). Assert the fetcher is NOT called AND isLoading is false:

```ts
renderHook(() => useX(false /* or undefined/null/'' */), { wrapper });
expect(mockGetX).not.toHaveBeenCalled();
expect(result.current.isLoading).toBe(false);
```

useSWRInfinite returns the no-fetch state via getKey returning null (e.g. `!publicId`).

## useSWRInfinite: loadMore / hasNext

Page shape: `{ content, totalElements, totalPages, number, size, first, last, empty }`.
- `items` = flatMap of all pages' content; `totalElements` from page[0].
- For loadMore, use `mockImplementation((arg) => page based on arg.page)`. For hooks taking `(id, query)` the page arg is the 2nd param: `(_id, q) => q.page === 0 ? ... : ...`.
- Wrap `result.current.loadMore()` / `refresh()` in `act(() => ...)`, then `await waitFor` on the accumulated length.
- hasNext default differs per hook: useAdminUsers defaults true before data; useAdminUserHistories defaults false when no publicId — check the source.

## refreshInterval polling (usePendingNotifications)

To verify `refreshInterval` re-fetches, use fake timers scoped to that single test (see testing_hooks_async.md for why not global):

```ts
vi.useFakeTimers();
renderHook(...);
await vi.waitFor(() => expect(mockGet).toHaveBeenCalledTimes(1));
await act(async () => { await vi.advanceTimersByTimeAsync(60_000); });
await vi.waitFor(() => expect(mockGet.mock.calls.length).toBeGreaterThanOrEqual(2));
// afterEach: vi.useRealTimers()
```

Use `vi.waitFor` (not RTL `waitFor`) while fake timers are active.
