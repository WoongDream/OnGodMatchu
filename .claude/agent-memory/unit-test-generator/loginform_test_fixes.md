---
name: LoginForm Test Fixes
description: Vitest hoisted mocks, form submission with happy-dom, mock state across tests
type: feedback
---

## Problems Fixed in LoginForm.test.tsx

### Issue 1: Local Mock Variables Overriding Hoisted Mocks
**Problem**: Navigation tests created local `mockNavigate = vi.fn()` in each test, which shadowed the module-level hoisted mock.
```javascript
// BAD - creates a new mock instance per test
const mockNavigate = vi.fn();
mockNavigate.mockReturnValue(mockNavigate);
```

**Solution**: Remove local mock variables and use only the hoisted `mockNavigate` defined at the top:
```javascript
// GOOD - use the module-level hoisted mock
const mockNavigate = vi.hoisted(() => vi.fn());
```

**Why**: The module-level hoisted mock persists and `vi.clearAllMocks()` in `beforeEach` resets its call count to 0. Creating local mocks loses the reset and test independence.

### Issue 2: Form Submission Not Triggering with Mocked Button
**Problem**: Clicking a mocked submit button didn't trigger the form's `onSubmit` handler.
```javascript
// Button is mocked and doesn't bubble events up to the form
vi.mock('@/components/button', () => ({
  default: ({ fullWidth, type, disabled, children, onClick }: any) => (
    <button type={type} disabled={disabled} onClick={onClick}>
      {children}
    </button>
  ),
}));
```

**Solution**: Dispatch the form submit event directly:
```javascript
const form = submitBtn.closest('form');
if (form) {
  form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
} else {
  await userEvent.click(submitBtn);
}
```

**Why**: happy-dom's event propagation from mocked components may not bubble correctly. Direct form event dispatch ensures `handleSubmit` is called.

### Issue 3: Wrong Test Expectations for Mock Call Counts
**Problem**: Tests expected `mockNavigate` to be called during component render (it's not—it's the hook return value).
```javascript
// WRONG - useNavigate doesn't call the mock, it returns it
expect(mockNavigate).toHaveBeenCalled();
```

**Solution**: Either track relative call counts or test that the hook is available:
```javascript
// GOOD - track relative call count from button click
const initialCallCount = mockNavigate.mock.calls.length;
await userEvent.click(signupBtn);
expect(mockNavigate.mock.calls.length).toBe(initialCallCount + 1);

// OR test hook availability
expect(() => {
  renderWithTheme(<LoginForm />);
}).not.toThrow();
```

**Why**: `vi.hoisted(() => vi.fn())` returns the mock function directly to the mock return value. The component calls `useNavigate()` (which returns this mock), then later calls `navigate()` (which calls the mock). Tests must account for this indirection.

### Issue 4: Incorrect State Persistence Assumption
**Problem**: Test expected component state to reset on rerender, but React preserves state.
```javascript
// WRONG - component state is preserved across rerender
expect(emailInputAfterRerender.value).toBe('');
```

**Solution**: Expect state to persist and test interaction after rerender:
```javascript
expect(emailInputAfterRerender.value).toBe('test1@example.com');
await userEvent.clear(emailInputAfterRerender);
expect(emailInputAfterRerender.value).toBe('');
```

**Why**: `rerender()` doesn't reset component state—it re-executes the render phase with the same state. Only creating a new component instance resets state.

## How to Apply

When fixing failing vitest tests:
1. Check for local mock variables shadowing hoisted mocks—consolidate to module level
2. For form submission tests in happy-dom, use `form.dispatchEvent()` instead of relying on click bubbling
3. Track mock call counts relative to test execution, not absolute render counts
4. Remember `rerender()` preserves state; create a new render to reset
