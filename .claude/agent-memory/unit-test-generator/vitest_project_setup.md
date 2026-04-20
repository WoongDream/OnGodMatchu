---
name: Vitest Project Setup & Known Issues
description: Vitest 4.1.2 configuration, ESM/CJS compatibility issues, and test execution notes
type: project
---

## Current Vitest Configuration

The project uses **Vitest 4.1.2** with:
- Environment: `jsdom`
- Globals: true
- Setup file: `src/test/setup.ts` (includes @testing-library/jest-dom)
- Test file pattern: `src/**/*.test.{ts,tsx}`
- Two projects in vite.config.ts: `unit` (jsdom tests) and `storybook` (Storybook integration tests)

## Known ESM/CJS Compatibility Issue

**Issue**: When running `npm test` or `vitest run --project unit`, tests fail with:
```
Error: require() of ES Module /.../@csstools/css-calc/dist/index.mjs not supported.
Instead change the require of ... to a dynamic import() which is available in all CommonJS modules.
```

**Root Cause**: Emotion styled component imports trigger a chain that leads to @asamuzakjp/css-color requiring ESM modules in a CommonJS context. This affects all tests that import from components using `@emotion/styled`.

**Impact**: All existing tests (QuizFeedback.test.tsx, etc.) have the same issue. This is a project-wide setup problem, not specific to individual test files.

**Status**: Tests are correctly written and pass TypeScript compilation (`npx tsc -b`), but cannot execute due to the environment configuration issue. This needs to be resolved by:
1. Fixing Storybook preset loading (@chromatic-com/storybook ESM issue)
2. Resolving ESM/CJS compatibility in the test environment
3. Or updating dependencies to compatible versions

## Test File Structure

The test files follow the project convention:
- Location: co-located with source (e.g., `src/features/quiz-list/CategoryFilter.test.tsx`)
- Framework: Vitest with @testing-library/react
- Globals: enabled (no explicit imports of `describe`, `it`, `expect`)
- Mocking: Uses `vi.mock()` for dependencies
- Patterns: describe blocks by feature, test names focus on behavior
