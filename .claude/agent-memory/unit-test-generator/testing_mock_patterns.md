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
