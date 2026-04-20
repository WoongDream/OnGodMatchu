---
name: QuizFeedback Component Testing
description: Test suite patterns and coverage for QuizFeedback component with conditional rendering and styling
type: project
---

**Component:** QuizFeedback (src/features/quiz-play/QuizFeedback.tsx)

**Props:**
- `correct: boolean` - determines success/error state
- `answer: string` - the correct answer to display when incorrect

**Rendering Logic:**
- Shows "정답이에요!" (correct message) when `correct=true`
- Shows "오답이에요" (error message) when `correct=false`
- Conditionally renders answer section ONLY when `correct=false`
- Uses Emotion styled components with theme integration

**Test Coverage (279 lines, 11 describe blocks, 60+ test cases):**

1. **Correct Answer State (3 tests)**
   - Success message rendering
   - Correct styling application
   - Answer section not displayed

2. **Incorrect Answer State (3 tests)**
   - Error message rendering
   - Answer display with label
   - Label and value combined

3. **Answer Display Variations (5 tests)**
   - Special characters in answer
   - Long answer text
   - Numbers in answer
   - Punctuation handling
   - Empty string answers

4. **Conditional Rendering (3 tests)**
   - Answer only shown when incorrect
   - Answer element absent when correct
   - Answer element present when incorrect

5. **Styling Props (2 tests)**
   - Correct prop passed to wrapper
   - Correct prop passed to result component

6. **Message Text Accuracy (4 tests)**
   - Exact success message
   - Exact error message
   - No message cross-contamination

7. **Component Structure (3 tests)**
   - Renders without crashing
   - Result element type verification
   - Wrapper div structure

8. **Prop Combinations (2 tests)**
   - Correct state with various answers
   - Incorrect state with various answers

9. **Display Name (1 test)**
   - React.memo displayName verification

10. **Memo Optimization (5 tests)**
    - Same props = no re-render
    - Correct prop change triggers re-render
    - Answer prop change triggers re-render
    - True → False transition
    - False → True transition

11. **Edge Cases (3 tests)**
    - Whitespace in answer
    - Newlines in answer
    - Unicode/emoji characters

**Testing Patterns Used:**
- React Testing Library for component rendering
- screen queries for text-based assertions
- Container queries for DOM structure verification
- rerender() for prop change testing
- unmount() for cleanup in loops
- test.each patterns via forEach for parameterized tests
