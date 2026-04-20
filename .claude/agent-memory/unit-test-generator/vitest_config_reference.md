---
name: Vitest Setup & Configuration
description: Vitest 4.1.2 configuration, file layout, and mocking patterns for this project
type: reference
---

## Test Framework
- **Vitest**: 4.1.2
- **Environment**: jsdom
- **Test Library**: @testing-library/react (16.3.2)
- **Setup file**: src/test/setup.ts (imports @testing-library/jest-dom)

## Configuration (vite.config.ts)
- Path alias: `@/` → `src/`
- Globals enabled: `true`
- Two test projects:
  1. **unit** (src/**/*.test.{ts,tsx}) — jsdom, excludes *.stories.*
  2. **storybook** — browser-based with Playwright

## Test File Conventions
- **Location**: Co-located with source (e.g., `components/Button/Button.test.tsx`)
- **Naming**: `{ComponentName}.test.tsx`
- **Imports**: Use `describe`, `it`, `expect` from `vitest`; `render`, `screen` from `@testing-library/react`
- **Structure**: Organize with nested `describe` blocks by feature/behavior

## Testing Patterns Observed
1. **Conditional rendering**: Use `screen.getByAltText()`, `screen.queryByAltText()`, `screen.getByText()`, `screen.queryByText()`
2. **Props changes**: Test with `rerender()` to verify updates
3. **React.memo optimization**: Test that same props prevent re-render, different props trigger re-render
4. **Styled components**: Query rendered elements via text content or semantic queries, not className
5. **Edge cases**: Test with null, empty strings, whitespace, long text, special characters

## Example Test Structure
```typescript
describe('ComponentName', () => {
  describe('feature group', () => {
    it('specific behavior', () => {
      render(<Component prop={value} />);
      expect(screen.getByText('expected')).toBeInTheDocument();
    });
  });
});
```

## Running Tests
- `npm test` — Run unit tests only (vitest run --project unit)
- `npm run test:watch` — Watch mode
