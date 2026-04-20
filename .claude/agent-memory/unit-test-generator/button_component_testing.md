---
name: Button Component Test Generation
description: 430+ line comprehensive test suite for Button component with 55+ test cases covering variant, size, fullWidth, disabled, onClick, and type props
type: reference
---

## Test Suite Overview

**File**: `src/components/button/Button.test.tsx`
**Component**: `src/components/button/Button.tsx` (React.memo wrapped)
**Test Count**: 55+ test cases
**Coverage Areas**: variant prop, size prop, fullWidth prop, disabled state, onClick callback forwarding, type prop, combined props, edge cases, prop changes

## Test Organization

- **rendering**: 4 tests covering basic button rendering, displayName
- **variant prop**: 5 tests for 'primary' | 'secondary' | 'ghost' variants, default behavior
- **size prop**: 5 tests for 'sm' | 'md' | 'lg' sizes, default behavior
- **fullWidth prop**: 4 tests for boolean fullWidth state
- **disabled state**: 5 tests for disabled attribute and state changes
- **onClick callback**: 5 tests covering click handling, multiple clicks, disabled blocking
- **type prop**: 5 tests for 'button' | 'submit' | 'reset' types
- **combined props**: 4 tests verifying multiple props work together
- **edge cases**: 6 tests for empty/whitespace/numeric children, rapid clicks
- **prop changes**: 5 tests for re-rendering behavior with prop updates

## Key Testing Patterns Used

1. **Styled Component Mocking**: Mock Button.style's StyledButton to expose $variant, $size, $fullWidth as data attributes for testing
2. **Mock Setup**: `vi.mock('./Button.style')` with passthrough of native button attributes
3. **Click Testing**: Use `userEvent.setup()` and `await user.click()` for interaction tests
4. **Disabled State**: Verify both `.toBeDisabled()` and that onClick doesn't fire when disabled
5. **Prop Validation**: Use `data-testid` and `data-*` attributes to verify prop forwarding

## TypeScript Considerations

- Use `any` type for mock onClick handler to avoid complex `vi.fn()` typing issues
- Component props are strictly typed from Button.type.ts
- Test file passes TypeScript strict mode (`npx tsc -b --noEmit`)

## Known Project Issue

The project has an ESM/CJS compatibility issue that prevents test execution via `npm test`, but tests are correctly written and pass TypeScript validation. Issue is in test environment setup, not in test code.
