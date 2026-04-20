---
name: QuizAnswer Component Test Patterns
description: Comprehensive test patterns for QuizAnswer component covering keyboard input, disabled state, and callbacks
type: feedback
---

## Component: QuizAnswer

**Location:** `src/features/quiz-play/QuizAnswer.tsx`

**Key Testing Patterns:**

### 1. Mocking Strategy
- Mock `@/components/input` and `@/components/button` with simple HTML elements
- Return native input/button with data-testid for test identification
- Pass through key props (value, onChange, placeholder, disabled, onClick, children)

### 2. Disabled State Logic
Component has **two independent disable conditions**:
- `disabled` prop: disables both input and button when true
- `value.trim() === ''`: only disables button (input stays enabled for typing)
- Button combines both: `disabled={disabled || value.trim() === ''}`

### 3. Enter Key Handler
- Attached via `onKeyDown` handler on wrapper div
- Only fires if `!disabled` (checks disabled prop, NOT value.trim())
- Note: Enter key submission works even with empty/whitespace-only values if `disabled={false}`
- Other keys (Tab, Shift, etc.) do not trigger submission

### 4. Callback Testing
- `onChange(value: string)` called with each character typed
- `onSubmit()` called with no arguments on button click or Enter key
- Use `vi.fn()` and verify call counts and arguments

### 5. Test Organization
Group tests by feature:
- `rendering`: Basic DOM presence and props
- `onChange callback`: Input value changes
- `button disabled state`: value.trim() check
- `disabled prop`: prop-based disabling
- `button click - onSubmit callback`: Button click behavior
- `Enter key submission`: Keyboard handling
- `combined scenarios`: Multi-step user flows
- `edge cases`: Unicode, whitespace, long strings

**Why:** This organization matches component logic and makes test intent clear.

## Implementation Notes

All 43 tests pass with proper mocking. The component uses:
- React.memo wrapper (check displayName in tests)
- Emotion styled components (AnswerWrapper)
- Controlled input via value/onChange
- Direct div for keyboard event handling (not form)

Test file: `src/features/quiz-play/QuizAnswer.test.tsx`
