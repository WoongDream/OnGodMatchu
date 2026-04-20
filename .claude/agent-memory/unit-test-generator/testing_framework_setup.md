---
name: Vitest Setup & Configuration
description: Testing framework configuration and patterns for this project
type: project
---

**Framework:** Vitest 4.1.2 with globals: true

**Key Config Details:**
- Test file location: co-located with source files (e.g., `src/api/instance.test.ts`)
- Test discovery pattern: `src/**/*.test.{ts,tsx}`
- Environment: jsdom (for browser API mocking like localStorage)
- Setup file: `src/test/setup.ts` (imports @testing-library/jest-dom)
- Path alias: `@/` maps to `src/`

**Known Issues:**
- Storybook addon-vitest plugin in vite.config.ts has ESM/CJS resolution issues that prevent test execution
- The @chromatic-com/storybook preset has ESM compatibility problem with --project unit configuration
- Workaround: Tests are valid but may not run via npm run test without Storybook env fix
- Issue is not in test code quality but in project environment setup

**Mocking Patterns:**
- Use `vi.mock('module-name')` at top of test file for module mocking
- Mock localStorage with `global.localStorage` object in beforeEach hooks
- Use `vi.resetModules()` after each test to ensure fresh interceptor setup for modules with side effects (like axios instance creation)
- All external dependencies must be mocked to keep tests isolated
- Import testing utilities explicitly: `import { describe, it, expect, vi, beforeEach } from 'vitest'`
- For react-router-dom: `vi.mock('react-router-dom')` and set mock return values in `beforeEach`
- For child components: mock as div/span with data-testid for test isolation
- Input component mocks need onChange handler forwarding with `onChange(e.target.value)`

**Test Structure:**
- Use `describe()` blocks to group related tests
- Async tests should use `async/await` with `await expect(...).rejects` for promise rejections
- Clear mocks in both beforeEach and afterEach hooks
- All promise rejections must be properly awaited to avoid unhandled rejection errors
- Use React Testing Library for component tests with globals disabled (explicit imports needed)
