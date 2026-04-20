---
name: SignupForm Test Patterns & Mocking Strategy
description: Mocking approach for Input/Button components and react-router-dom in SignupForm tests
type: feedback
---

For SignupForm and similar auth components:

**Mocking Input Component:**
```javascript
vi.mock('@/components/input', () => ({
  default: ({ label, type, value, onChange, placeholder }: any) => (
    <div>
      <label>{label}</label>
      <input
        type={type || 'text'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        data-testid={`input-${label}`}
      />
    </div>
  ),
}));
```

**Mocking Button Component:**
```javascript
vi.mock('@/components/button', () => ({
  default: ({ fullWidth, variant, type, disabled, children, onClick }: any) => (
    <button
      type={type || 'button'}
      disabled={disabled}
      data-testid={`button-${children}`}
      onClick={onClick}
    >
      {children}
    </button>
  ),
}));
```

**Mocking useNavigate:**
```javascript
vi.mock('react-router-dom', () => ({
  useNavigate: vi.fn(),
}));

// In beforeEach:
const { useNavigate } = require('react-router-dom');
const mockNavigate = vi.fn();
useNavigate.mockReturnValue(mockNavigate);
```

**Why:** Direct rendering avoids Emotion styled component issues; mocks create minimal testing doubles. Render without BrowserRouter—the mock doesn't need it.

**How to apply:** Use for all auth form components that use Input, Button, and navigation hooks.
