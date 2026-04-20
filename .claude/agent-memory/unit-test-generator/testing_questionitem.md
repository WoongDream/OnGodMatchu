---
name: QuestionItem Component Testing
description: Comprehensive test suite for QuestionItem with 80+ test cases covering index numbering, button state management, and input handling
type: project
---

## QuestionItem.test.tsx — 80+ Test Cases

**Location:** `/src/features/quiz-create/QuestionItem.test.tsx`

**Component Purpose:** Renders a single question item in the quiz creation form with controls for ordering (move up/down), deletion, and editing fields (question text, answer, image upload).

### Test Coverage Areas

1. **Index Numbering (3 cases)**
   - Converts 0-based index to 1-based display (e.g., index=0 → "1번 문제")
   - Tests boundary values including MAX_SAFE_INTEGER

2. **Move Up Button (5 cases)**
   - Enabled when `isFirst=false`, disabled when `isFirst=true`
   - Calls `onMoveUp` callback when clicked and enabled
   - No callback on disabled state
   - Tests independence from `isLast` state

3. **Move Down Button (5 cases)**
   - Enabled when `isLast=false`, disabled when `isLast=true`
   - Calls `onMoveDown` callback when clicked and enabled
   - No callback on disabled state
   - Independent from `isFirst` state

4. **Delete Button (2 cases)**
   - Always enabled regardless of position (`isFirst`/`isLast`)
   - Calls `onDelete` callback on click

5. **Question Input (7 cases)**
   - Displays provided text via `screen.getByDisplayValue()`
   - Empty string handling
   - Placeholder: "문제를 입력하세요"
   - `onQuestionChange` called for each keystroke
   - Special characters and very long text (1000+ chars)

6. **Answer Input (7 cases)**
   - Displays provided text
   - Empty string and whitespace handling
   - Placeholder: "정답을 입력하세요"
   - `onAnswerChange` callback on each keystroke
   - Unicode (Korean) character support
   - Long text handling

7. **Image Upload (6 cases)**
   - Component receives correct label and props
   - Passes `imagePreviewUrl` to ImageUpload (null when no image)
   - `onImageChange` called with (File, url) on file selection
   - `onImageRemove` called when remove button clicked
   - Multiple sequential uploads handled correctly

8. **Integration (4 cases)**
   - All inputs render simultaneously with correct values
   - Multiple callbacks invoke in sequence
   - State maintained across re-renders
   - Works correctly when both first and last item

9. **Edge Cases (5 cases)**
   - Index boundary values
   - Rapid callback invocations
   - Empty and whitespace-only inputs
   - Newlines and special whitespace
   - Graceful handling of mocked callbacks

10. **Accessibility (3 cases)**
    - Aria labels on all action buttons (위로, 아래로, 삭제)
    - Buttons keyboard-navigable
    - Disabled buttons not keyboard-interactive

### Key Testing Patterns

- **Mock Setup:** `beforeEach` clears all mocks; `vi.clearAllMocks()`
- **Props Spreading:** `defaultProps` object with spread operator for DRY testing
- **User Events:** `userEvent.setup()` for realistic interactions
- **Accessibility-First:** Uses `getByLabelText()` and aria labels
- **Sequential Assertions:** Tests both state and callback invocation
- **Re-render Testing:** Uses `rerender()` to test prop updates

### Props Structure

```typescript
{
  index: number;                         // 0-based, displayed as index + 1
  questionText: string;
  answer: string;
  imagePreviewUrl: string | null;
  onQuestionChange: (value: string) => void;
  onAnswerChange: (value: string) => void;
  onImageChange: (file: File, url: string) => void;
  onImageRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDelete: () => void;
  isFirst: boolean;                      // Disables move up button
  isLast: boolean;                       // Disables move down button
}
```

### Notable Test Behaviors

- **Button Disabled States:** `isFirst` and `isLast` are independent flags—component can be both first AND last in a single-item list
- **Image Upload:** Hidden file input inside ImageUpload requires traversal via `querySelector('input[type="file"]')`
- **Callback Testing:** Each keystroke triggers callback; validated with `toHaveBeenCalledTimes()` and `toHaveBeenNthCalledWith()`
- **Delete Always Enabled:** Unlike move buttons, delete has no disabled state
- **Formatting:** Prettier applies line wrapping for JSX props; lint:fix formats to single line for short props

### Vitest Configuration Used

- Environment: `jsdom`
- Globals: `true` (describe/it/expect available without imports)
- Setup: `@testing-library/jest-dom` via `src/test/setup.ts`
- User Event: `@testing-library/user-event` for realistic interactions
