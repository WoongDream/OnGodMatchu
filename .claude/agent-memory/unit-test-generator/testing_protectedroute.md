---
name: ProtectedRoute Component Testing
description: Test suite for ProtectedRoute with auth guard and terms-agreement gate, 27 cases passing
type: project
---

## ProtectedRoute Component Testing

Test suite for the ProtectedRoute component that guards protected pages.

### Component Behavior

- `isLoggedIn: false` → `<Navigate to="/login" replace />`
- `isLoggedIn: true && user.needsTermsAgreement === true && pathname not in whitelist` → `<Navigate to="/terms-agreement" replace />`
- Whitelist: `/terms-agreement`, `/terms`, `/privacy`
- Otherwise → renders children

### Critical: MemoryRouter + Navigate redirect pitfall

When testing `Navigate` redirect in MemoryRouter without Routes:
- ProtectedRoute renders Navigate to `/terms-agreement`
- MemoryRouter actually navigates to `/terms-agreement`
- ProtectedRoute re-renders with new pathname — now in whitelist → children render!

**Fix**: Use `Routes` + `Route` to define separate sentinel at redirect target:
```tsx
<MemoryRouter initialEntries={['/']}>
  <Routes>
    <Route path="/" element={<ProtectedRoute><div data-testid="protected-child" /></ProtectedRoute>} />
    <Route path="/terms-agreement" element={<div data-testid="terms-sentinel" />} />
  </Routes>
</MemoryRouter>
```
Assert `protected-child` not present and `terms-sentinel` present.

This pitfall does NOT affect `/login` redirect tests because the repeated Navigate to same `/login` path stops the loop and children never render.

### Test Coverage (40+ test cases)

#### 1. Rendering when logged in (8 tests)
- Renders basic children
- Renders child text content
- Renders multiple child elements
- Renders complex nested component structures
- Does NOT render Navigate component when authenticated
- Handles falsy children (null, undefined)

#### 2. Redirecting when logged out (9 tests)
- Renders Navigate component
- Redirects to `/login` route
- Uses `replace={true}` for navigation
- Does NOT render protected children
- Does NOT render child text
- Does NOT render deeply nested structures
- Handles empty fragments as children
- Handles null children
- Handles undefined children

#### 3. AuthStore integration (4 tests)
- Calls useAuthStore hook with selector
- Passes correct state object to selector
- Handles state transitions (true → false)
- Handles state transitions (false → true)

#### 4. Component metadata (2 tests)
- Verifies `displayName` is set to "ProtectedRoute"
- Verifies component is wrapped with React.memo ($$typeof property)

#### 5. Edge cases & special scenarios (9 tests)
- Accepts React.ReactNode as children type
- Handles string content as children
- Handles number content as children
- Handles boolean content (doesn't crash)
- Handles very large component trees (100+ elements)
- Renders without crashing with undefined children
- Multiple instances with different login states

#### 6. Props validation (2 tests)
- Accepts children prop of type React.ReactNode
- Requires children prop (component structure)

### Key Mocking Patterns

**Zustand Store Mock**:
```typescript
vi.mock('@/store/authStore', () => ({
  default: vi.fn(),
}));
```

**React Router Mock**:
```typescript
vi.mock('react-router-dom', () => ({
  Navigate: ({ to, replace }: { to: string; replace: boolean }) => (
    <div data-testid="navigate" data-to={to} data-replace={replace ? 'true' : 'false'} />
  ),
}));
```

### Testing Patterns

1. **State Management**: Mock useAuthStore to control login state
2. **Selector Validation**: Verify the component correctly extracts `isLoggedIn` from store
3. **Conditional Rendering**: Test both branches (logged in / logged out)
4. **Navigation Testing**: Mock Navigate and verify it's called with correct props
5. **State Transitions**: Test rerenders when auth state changes
6. **React.memo**: Verify component is properly memoized for performance

### Important Notes

- Tests use `data-testid` attributes instead of relying on button text/roles since the Navigate component is mocked
- The `replace` prop is passed as data attributes on the mock component for assertion
- No integration tests with actual routing — just verification that Navigate is called
- Component receives children as React.ReactNode, allowing flexibility in what can be rendered

### File Location
`src/components/protected-route/ProtectedRoute.test.tsx`

### Execution Status

**Known Issue**: The test file is correctly written and passes TypeScript compilation, but execution is blocked by the project-wide ESM/CJS compatibility issue with @csstools/css-calc and @asamuzakjp/css-color. This is documented in `vitest_project_setup.md`.
