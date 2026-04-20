---
name: ImageUpload Component Test Rewrite (Complete)
description: Complete 57-test suite for ImageUpload with URL.createObjectURL mock handling
type: project
---

**Status:** Completed Successfully

**Test Results:** 57/57 passed ✓

## Key Issues Resolved

1. **URL.createObjectURL Mock Handling**
   - Moved to `beforeAll`/`afterAll` (not `beforeEach`) to avoid repeated setup
   - Mock returns `'blob:mock-url'` consistently
   - Verified with `expect(global.URL.createObjectURL).toHaveBeenCalledWith(file)`

2. **RemoveButton Element Selection**
   - Cannot use `getByRole('button', { name: '✕' })` — Testing Library doesn't recognize the ✕ character as accessible name
   - Solution: Query all buttons, find by textContent: `Array.from(container.querySelectorAll('button')).find(btn => btn.textContent?.includes('✕'))`
   - Applied consistently across all remove button tests

3. **Label ID Uniqueness**
   - `useId()` generates unique IDs per render instance
   - Test creates separate component instances with `unmount` to verify different IDs
   - Within single render, ID remains constant

4. **aria-labelledby Null vs Undefined**
   - `getAttribute('aria-labelledby')` returns `null` when not set, not `undefined`
   - Assertion: `.toBeNull()` not `.toBeUndefined()`

5. **Empty Label String Handling**
   - Empty string (`""`) is falsy, so conditional `{label && <UploadLabel...>}` doesn't render
   - Test queries for label span with ID: `querySelector('span[id]')` and expects not to exist

## Test Coverage

**57 total tests organized in 14 describe blocks:**

- Label rendering (4 tests): label presence, empty string, unique IDs
- Placeholder rendering (3 tests): visibility with/without preview
- Preview image rendering (6 tests): URL changes, data URLs, null handling
- Remove button (6 tests): rendering, click handlers, propagation, multiple clicks
- File input (2 tests): accept attribute, hidden state
- onChange with file selection (13 tests): blob URL creation, file type variants, edge cases, re-upload
- Input value reset (2 tests): value clearing after upload
- Accessibility (4 tests): aria-labelledby, alt text, keyboard navigation
- Prop changes (6 tests): label/preview updates, callback swapping
- Integration scenarios (3 tests): full upload-remove cycle, multiple cycles, rapid calls
- React.memo behavior (2 tests): $$typeof symbol, displayName
- Styling props (3 tests): hasPreview styling updates
- Edge cases (4 tests): null previewUrl consistency, empty label, ref maintenance

## Import Pattern

```typescript
import { describe, it, expect, vi, beforeAll, afterAll, beforeEach } from 'vitest';
import { renderWithTheme, screen, within } from '@/test/renderWithTheme';
import userEvent from '@testing-library/user-event';
import ImageUpload from './ImageUpload';

beforeAll(() => {
  global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
  global.URL.revokeObjectURL = vi.fn();
});
afterAll(() => { vi.restoreAllMocks(); });
beforeEach(() => { vi.clearAllMocks(); });
```

## Querying Patterns

- File input: `container.querySelector('input[type="file"]')`
- Remove button: `Array.from(container.querySelectorAll('button')).find(btn => btn.textContent?.includes('✕'))`
- Label element: `container.querySelector('label[for]')`
- Label text span: `container.querySelector('span[id]')`
- Upload area: same as label (it's a `<label>` element)

## Notes for Future Tests

- Emotion styled components don't expose inline attributes like `style*="position"` selectors
- useId() in test environment produces IDs like `_r_c_` format
- Always use `await user.upload()` for file inputs, not fireEvent.change()
- Test happy path + edge cases + integration, not implementation details
- RemoveButton is a styled button but lacks accessible name — query by textContent
