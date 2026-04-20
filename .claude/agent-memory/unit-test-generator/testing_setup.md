---
name: Unit Test Setup for OnGodMatchu
description: Testing framework configuration, patterns, and conventions for this project
type: project
---

## Testing Framework Configuration

- **Framework**: Vitest 4.1.2
- **Environment**: jsdom
- **Setup file**: `src/test/setup.ts` (imports @testing-library/jest-dom)
- **Test location**: Same directory as source (e.g., `src/store/authStore.test.ts`)
- **Path alias**: `@/` maps to `src/`
- **Globals enabled**: true (no need to import `describe`, `it`, `expect`)

## Project Structure

Two test projects configured in vite.config.ts:
1. **unit** - Standard unit tests (jsdom environment, no browser)
2. **storybook** - Storybook component tests (browser-based with playwright)

Run unit tests: `npm run test` (runs `vitest run --project unit`)

## Zustand Store Testing Patterns

For Zustand stores:
- Reset state in `beforeEach` using `store.setState()`
- Get current state with `store.getState()`
- Clear localStorage mock in `beforeEach`
- Use `vi.fn()` to create mock subscribers
- Subscribe/unsubscribe tests available via `store.subscribe()`

## localStorage Mocking

Example pattern used in authStore.test.ts:
```typescript
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value.toString(); },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });
```

## Test Coverage Expected

- Initial state verification
- All exported actions/functions
- Edge cases (rapid calls, multiple state changes)
- localStorage interactions
- Derived state (computed/selector behavior)
- Store subscriptions

## React Component Testing with React Testing Library

For React components:
- Import from `@testing-library/react`: `render`, `screen`
- Render component with test props: `render(<Component prop={value} />)`
- Query DOM with `screen.getByText()`, `screen.getByRole()`, `screen.getByTestId()`, etc.
- Use `rerender()` to test prop changes
- Check `toBeInTheDocument()` for presence assertions
- Use `query` variants (`queryByText`) when element might not exist
- Mock child components and external dependencies with `vi.mock()`
- Return mocked components with testid attributes for selection
- Test component composition and message display based on logic

Component test example patterns:
```typescript
vi.mock('./QuestionItem', () => ({
  default: ({ index, onDelete }: any) => (
    <div data-testid={`question-item-${index}`}>
      <button data-testid={`delete-btn-${index}`} onClick={onDelete}>
        Delete
      </button>
    </div>
  ),
}));

it('renders with expected callback', async () => {
  const onChange = vi.fn();
  render(<Component questions={[]} onChange={onChange} />);
  
  const btn = screen.getByTestId('add-question-btn');
  await userEvent.click(btn);
  
  expect(onChange).toHaveBeenCalledTimes(1);
  expect(onChange.mock.calls[0][0]).toHaveLength(1);
});
```

## Explicit Import Pattern

For consistency, explicitly import vitest utilities even with globals enabled:
```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
```

This improves IDE support, debugging, and reliability across different environments.

## TypeScript in Tests

- No type errors with current tsconfig.json setup
- Proper path resolution for `@/types` imports
- Use `type` imports for types only: `import type { User } from '@/types'`

## React Component Event Handler Testing

For components with event handlers (buttons, forms):
- Mock global functions like `alert` with `vi.spyOn(global, 'alert').mockImplementation(() => {})`
- Use `userEvent.setup()` for realistic user interactions
- Always restore spies in tests: `alertSpy.mockRestore()`
- Test both the trigger (button click) and the effect (alert call)
- Use `await user.click()` for click events
- Test keyboard interactions: `await user.keyboard('{Enter}')` or space key
- Verify alert/callback order with `toHaveBeenCalledWith()` for exact messages
- Test multiple sequential clicks and verify correct handler is called each time
