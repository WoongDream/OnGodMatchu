---
name: QuizInfoForm Component Testing
description: 700-line comprehensive test suite with 59 test cases for form inputs, category selection, and thumbnail handling
type: reference
---

## Test File Details
- **Location**: src/features/quiz-create/QuizInfoForm.test.tsx
- **Lines**: 700
- **Test Cases**: 59
- **Describe Blocks**: 11

## Test Coverage Areas

### 1. Component Rendering (6 tests)
- Form section rendering with title "퀴즈 정보"
- Image upload component presence
- Input labels (제목, 설명)
- All 5 category chip buttons
- Correct count of category buttons

### 2. Title Input Handling (7 tests)
- Initial value display
- Empty string handling
- onTitleChange callback execution
- Keystroke-by-keystroke callbacks
- Placeholder text verification
- Clear operation
- Special characters support (!@#$%, Korean, etc.)

### 3. Description Input Handling (7 tests)
- Initial value display
- Empty string handling
- onDescriptionChange callback execution
- Keystroke-by-keystroke callbacks
- Placeholder text verification
- Clear operation
- Multiline text and very long text (500+ chars)

### 4. Category Selection (11 tests)
- All 5 categories rendered from CATEGORIES constant
- Correct category order
- No category active when category prop is null
- Correct chip marked active when category selected
- Only one category active at a time
- onCategoryChange callback with correct values
- All category values tested (game, music, culture, broadcast, etc)
- Category switching behavior
- Multiple clicks on same category
- Inactive state display
- Active state updates on category change

### 5. Thumbnail Handling (5 tests)
- Image upload label display "썸네일 (선택)"
- Preview image display when URL provided
- No preview when thumbnailPreviewUrl is null
- onThumbnailRemove callback execution
- Preview URL passed correctly to component

### 6. Combined Props Scenarios (3 tests)
- All props filled scenario
- Minimal/empty props scenario
- Updating title while category selected
- Updating description and category together

### 7. Display Name (1 test)
- Component displayName is 'QuizInfoForm'

### 8. Memo Optimization (6 tests)
- No re-render when props unchanged
- Re-render when title prop changes
- Re-render when description prop changes
- Re-render when category prop changes
- Re-render when thumbnail prop changes
- Verify memo wrapper functionality

### 9. Event Handler Isolation (3 tests)
- Title changes don't trigger other callbacks
- Description changes don't trigger other callbacks
- Category changes don't trigger other callbacks

### 10. Edge Cases (7 tests)
- Empty strings for all inputs
- Very long title (1000 chars)
- Special characters in description (!@#$%^&*()_+-=[]{}|;:,.<>?)
- Korean characters throughout form
- All category types tested
- Empty URL for thumbnail
- Null values for all optional props

## Mock Strategy
- Input component: extracts value, onChange props
- ChipButton component: uses data-active attribute for active state
- ImageUpload component: simulates file input, preview rendering, remove button

## Key Assertions Used
- toBeInTheDocument()
- toEqual() for callback values
- toHaveBeenCalled() / toHaveBeenCalledWith()
- toHaveAttribute() for data-active
- Type-safe input value checking with (as HTMLInputElement).value

## Notes
- All callbacks mocked with vi.fn()
- beforeEach clears all mocks
- Follows project convention of testing props and callbacks
- Comprehensive edge case coverage
- Tests follow existing QuizFeedback pattern from project
