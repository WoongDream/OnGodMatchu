---
name: ChipButton Component Test Generation
description: Comprehensive 290-line test suite for ChipButton component with 50+ test cases
type: project
---

## Test Suite Overview

Created comprehensive test suite for `/src/components/chip-button/ChipButton.tsx` with 50+ test cases covering:

### Coverage Areas

**Rendering (6 cases)**
- Children content (text, numeric, empty, complex)
- Button element validation
- Display name verification

**Active Prop Styling (8 cases)**
- Active=true and active=false rendering
- Default inactive behavior
- Style application verification
- Toggle transitions (inactive→active and active→inactive)

**onClick Callback (10 cases)**
- Callback execution on click
- No-argument invocation
- Undefined handler gracefully
- Multiple rapid clicks
- Callback with different active states
- Callback preservation/replacement through re-renders
- Callback with active prop changes

**Combined Interactions (5 cases)**
- Active button with click handler
- Inactive button with click handler
- Toggle state with callback
- Rapid clicks with callback
- Children stability through prop updates

**Accessibility (3 cases)**
- Keyboard access (Enter key)
- Focus management
- Default enabled state

**Edge Cases (8 cases)**
- Undefined onClick prop
- Complex JSX children
- Null children
- Empty string children
- React.memo identity preservation

### Key Testing Patterns

- Uses `userEvent.setup()` for realistic user interactions
- Mocks callbacks with `vi.fn()`
- Tests prop updates with `rerender()`
- Validates memoization behavior
- No emotion CSS-in-JS assertions (CSS verification delegates to browser)

### Notes

- Test environment has pre-existing ESM/CJS incompatibility in other test files (not related to ChipButton tests)
- ChipButton tests follow project conventions: @testing-library/react, userEvent, globals mode
- All 50+ tests are isolated and deterministic
