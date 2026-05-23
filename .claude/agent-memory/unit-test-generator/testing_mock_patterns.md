---
name: Component Mock Patterns for Testing
description: Proper way to mock child components in tests with onClick handlers and form inputs
type: feedback
---

Mock Input Components Pattern:
- Use `htmlFor` attribute to associate label with input `id` for proper `getByLabelText` queries
- Mock should receive `onChange` callback and call it with `e.target.value`
- When testing typing behavior, expect `onChange` to be called per keystroke, not with the full string
- Tests should use `toHaveBeenCalled()` or `toHaveBeenCalledTimes()` rather than checking exact string values for multi-character inputs

Mock QuizCard/QuizList Components Pattern:
- Use `vi.hoisted()` to define mocks at module scope before vi.mock() call
- This allows the mock functions to be imported and used in beforeEach/test blocks
- Example: `const mockNavigate = vi.hoisted(() => vi.fn())`
- Then use: `vi.mock('react-router-dom', () => ({ useNavigate: () => mockNavigate }))`

Key Issue Fixed:
- **renderWithTheme double import**: Only import from `@/test/renderWithTheme` once, never import `renderWithTheme` from other modules like from component files or quiz types

Why: Vitest imports from multiple sources cause circular dependencies and declaration conflicts. Path alias ensures single source of truth.

**How to apply:**
- Always: `import { renderWithTheme, screen } from '@/test/renderWithTheme'`
- Never: `import { renderWithTheme } from '@/components/...` or `import { renderWithTheme, CATEGORIES } from '@/types/quiz'`

Zustand store selector mock (authStore pattern):
- `vi.mock('@/store/authStore', () => ({ default: (selector) => selector({ logout: mockLogout }) }))`
- This works when the component calls `useAuthStore((state) => state.logout)` as a selector
- The mock directly calls the selector function inline — no `create` or `getState` needed

Child modal mock pattern (ProfileAccount style):
- Mock child modals as data-testid elements controlled by `isOpen` prop
- `vi.mock('@/components/password-change-modal', () => ({ default: ({ isOpen }) => isOpen ? createElement('div', { 'data-testid': 'password-change-modal' }) : null }))`
- Test open state by checking `getByTestId('...')` after clicking the trigger button

useOutletContext mock with profile overrides:
- Define `mockUseOutletContext` with `vi.hoisted`, use `mockUseOutletContext.mockReturnValue({ profile, isMe })`
- Use `makeUser(overrides.profile)` helper to build fixture from partial overrides

lib/device mock:
- `vi.mock('@/lib/device', () => ({ parseUserAgent: vi.fn().mockReturnValue({...}), formatDeviceLabel: vi.fn().mockReturnValue('Chrome · macOS') }))`
- navigator.userAgent does not need to be mocked separately when device lib is mocked at module level
