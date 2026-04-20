---
name: Header Component Unit Tests
description: Comprehensive test suite for Header component covering navigation, auth state, buttons, and edge cases
type: project
---

## Header Component Test Suite

**File**: `src/components/header/Header.test.tsx` (407 lines, 27 test cases)

## Coverage Overview

### Logo & Navigation (3 tests)
- Logo text rendering ("OnGodMatchu")
- Logo click navigates to `/`
- Single navigate call per click

### Login Button When Not Logged In (5 tests)
- Shows login button when `isLoggedIn` is false
- Hides create/logout buttons
- Login button navigates to `/login`
- Exactly one login button rendered
- Button count assertion (1 button)

### Logout & Create Buttons When Logged In (4 tests)
- Shows create button when `isLoggedIn` is true
- Shows logout button when `isLoggedIn` is true
- Hides login button when logged in
- Both buttons present together

### Create Button Navigation (2 tests)
- Navigates to `/quiz/create` on click
- Only one navigate call per click

### Logout Button Behavior (3 tests)
- Calls `logout()` from authStore
- Navigates to `/` after logout
- Calls logout before navigate (call order verification)

### Authentication State Transitions (2 tests)
- Switches from login → create/logout when `isLoggedIn` changes
- Switches from create/logout → login when `isLoggedIn` changes

### Button Count Assertions (2 tests)
- Exactly 1 button when not logged in
- Exactly 2 buttons when logged in

### Accessibility (1 test)
- All buttons are keyboard focusable

### Edge Cases (3 tests)
- Multiple rapid clicks on login button
- Logout without prior navigate calls
- Logo clicks don't interfere with button clicks

### Render Consistency (1 test)
- Consistent rendering when auth state unchanged

### Memoization (1 test)
- Component has displayName ('Header') from React.memo

## Mocking Strategy

1. **react-router-dom**: Mocks `useNavigate` hook, captures all navigate calls
2. **authStore**: Mocks Zustand store, controls `isLoggedIn` state per test

## Test Patterns Used

- `userEvent.setup()` for user interactions
- `screen.getByRole()` / `screen.queryByRole()` for accessible queries
- `mockNavigate` for verifying navigation calls
- `rerender()` for state transition testing
- `vi.clearAllMocks()` in beforeEach for test isolation

## Notes

- Tests follow project conventions: describe blocks by feature, descriptive test names
- Uses globals: true configuration (no explicit describe/it/expect imports needed)
- All TypeScript compilation passes (no errors or warnings)
- Tests are isolated and deterministic (no shared state between tests)
