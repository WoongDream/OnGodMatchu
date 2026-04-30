---
name: Password Policy & PasswordInput Testing Patterns
description: Patterns for testing zxcvbn-based password strength, policy constants, PasswordInput component with toggle/ruleStatus, and useSignup hook error codes
type: feedback
---

## zxcvbn Mock Pattern

When testing PasswordInput or strength.ts consumers, mock `zxcvbn` at the module level:

```ts
vi.mock('zxcvbn', () => ({
  default: (password: string, userInputs?: string[]) => {
    const isBreached = userInputs?.includes(password) ?? false;
    const score = isBreached ? 0 : password.length >= 10 ? 3 : 0;
    return {
      score,
      crack_times_display: { offline_slow_hashing_1e4_per_second: '3 hours' },
      feedback: { warning: score === 0 ? 'This is a top-10 common password' : '', suggestions: [] },
    };
  },
}));
```

## SignupForm: PasswordInput Mock

`SignupForm.test.tsx` mocks `@/components/password-input` because the real component calls `evaluateStrength` (zxcvbn) and manages its own strength state. The mock:
- Calls `onStrengthChange` synchronously inside `handleChange` so the parent form receives score immediately
- Uses `value.length >= 10` as the proxy for "strong password"
- Also mocks `@/lib/password` (`isLengthValid`, `canSubmitByStrength`) to match the same threshold

Strong password constant: `'내고양이는오늘도잠만잔다'` (14자, mock score=2).
Weak password constant: `'short'` (5자, mock score=0).

## showChecklist=false Selector Pitfall

When testing `showChecklist=false` on PasswordInput, do NOT query `/10자 이상/` — the HintList also contains "10자 이상의 길이가 가장 중요해요". Use `/10자 이상 64자 이하/` (exact RuleChecklist text) instead.

## useSignup AxiosError Construction

```ts
function makeAxiosError(status: number): AxiosError {
  const err = new AxiosError('Request failed');
  err.response = { status, data: {}, headers: {}, config: {} as never, statusText: '' };
  return err;
}
```

Error code mapping: 422 → BREACH, 400 → POLICY, 409 → CONFLICT, non-axios/no-response → NETWORK.

**Why:** The real `useSignup` uses `axios.isAxiosError` to detect axios errors, so must use `AxiosError` from axios (not plain `Error`). The `response` field must be set for status-based routing.

**How to apply:** Use `makeAxiosError(status)` pattern in any hook test that needs to trigger signup error codes.
