---
name: QuizCard Component Test Generation
description: 621-line comprehensive test suite for QuizCard component with 60+ test cases
type: project
---

## Generated Test File

**Path:** `/Users/woong/WebstormProjects/OnGodMatchu/src/features/quiz-list/QuizCard.test.tsx`

**Stats:**
- 621 lines total
- 60+ test cases across 9 describe blocks
- Coverage: onClick callback, toLocaleString() formatting, thumbnail conditional rendering, category display, title/description handling, React.memo optimization, edge cases, integration tests

## Test Organization

1. **rendering** (7 tests) - Basic component rendering and structure
2. **thumbnail rendering** (6 tests) - Image conditional rendering, src/alt attributes, null handling
3. **playCount formatting with toLocaleString()** (8 tests) - Number formatting for display (1,234명 플레이), edge cases (0, 1, 999, 1000, 1000000)
4. **onClick callback with quiz.id** (9 tests) - Callback invocation with correct quiz.id, multiple clicks, boundary values (0, MAX_SAFE_INTEGER), prop updates
5. **category rendering** (2 tests) - All 5 category types, prop updates
6. **title and description rendering** (6 tests) - Text display, special characters, long strings, updates
7. **React.memo optimization** (3 tests) - Memoization verification, re-render behavior
8. **edge cases and boundary conditions** (8 tests) - Empty strings, emoji support, absent thumbnails
9. **integration tests** (3 tests) - Full component interaction sequences

## Key Testing Patterns Used

- Vitest globals API (`describe`, `it`, `expect`, `beforeEach`, `vi`)
- @testing-library/react (`render`, `screen`)
- @testing-library/user-event (`userEvent.setup()`, `user.click()`)
- Mock styled components with data-testid attributes for testing
- Proper async/await for user interactions
- Parameterized testing with forEach loops
- Clear test names focusing on behavior, not implementation

## Focus Areas Implemented (Per User Request)

✅ onClick callback with quiz.id - 9 dedicated tests verifying correct id passed, multiple clicks, prop changes, edge values
✅ playCount formatting with toLocaleString() - 8 dedicated tests covering comma-separated numbers, Korean text, edge cases
✅ thumbnail conditional rendering - 6 dedicated tests for null/presence, src/alt attributes, url changes

## Notes

- All styled components mocked with proper JSX structure for testing
- No Claude attribution in test code (per project feedback_no_claude_attribution.md)
- Test file co-located with source file (project pattern)
- Follows existing test patterns from QuizProgress.test.tsx and ResultActions.test.tsx
