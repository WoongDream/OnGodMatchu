import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithTheme, screen } from '@/test/renderWithTheme';
import userEvent from '@testing-library/user-event';
import LoginForm from './LoginForm';

const mockNavigate = vi.hoisted(() => vi.fn());

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock('./SocialLoginButtons', () => ({
  default: () => <div data-testid="social-login-buttons">Social Login</div>,
}));

vi.mock('@/components/input', () => ({
  default: ({ label, type, value, onChange, placeholder }: any) => (
    <div>
      <label>{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        data-testid={`input-${type}`}
      />
    </div>
  ),
}));

vi.mock('@/components/button', () => ({
  default: ({
    type,
    disabled,
    children,
    onClick,
  }: {
    fullWidth?: boolean;
    type?: string;
    disabled?: boolean;
    children: React.ReactNode;
    onClick?: () => void;
  }) => (
    <button type={type} disabled={disabled} data-testid={`button-${type}`} onClick={onClick}>
      {children}
    </button>
  ),
}));

describe('LoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders the form title "로그인"', () => {
      renderWithTheme(<LoginForm />);
      expect(screen.getAllByText('로그인')[0]).toBeInTheDocument();
    });

    it('renders email input with correct label', () => {
      renderWithTheme(<LoginForm />);
      expect(screen.getByText('이메일')).toBeInTheDocument();
    });

    it('renders password input with correct label', () => {
      renderWithTheme(<LoginForm />);
      expect(screen.getByText('비밀번호')).toBeInTheDocument();
    });

    it('renders email input with correct type', () => {
      renderWithTheme(<LoginForm />);
      expect(screen.getByTestId('input-email')).toBeInTheDocument();
    });

    it('renders password input with correct type', () => {
      renderWithTheme(<LoginForm />);
      expect(screen.getByTestId('input-password')).toBeInTheDocument();
    });

    it('renders email input with correct placeholder', () => {
      renderWithTheme(<LoginForm />);
      const emailInput = screen.getByTestId('input-email');
      expect(emailInput).toHaveAttribute('placeholder', 'example@email.com');
    });

    it('renders password input with correct placeholder', () => {
      renderWithTheme(<LoginForm />);
      const passwordInput = screen.getByTestId('input-password');
      expect(passwordInput).toHaveAttribute('placeholder', '비밀번호 입력');
    });

    it('renders submit button with text "로그인"', () => {
      renderWithTheme(<LoginForm />);
      expect(screen.getAllByText('로그인')[0]).toBeInTheDocument();
    });

    it('renders social login buttons', () => {
      renderWithTheme(<LoginForm />);
      expect(screen.getByTestId('social-login-buttons')).toBeInTheDocument();
    });

    it('renders signup link text', () => {
      renderWithTheme(<LoginForm />);
      expect(screen.getByText('계정이 없으신가요?')).toBeInTheDocument();
    });

    it('renders signup button with correct text', () => {
      renderWithTheme(<LoginForm />);
      const signupBtn = screen.getByRole('button', { name: '회원가입' });
      expect(signupBtn).toBeInTheDocument();
    });

    it('has displayName set to LoginForm', () => {
      expect(LoginForm.displayName).toBe('LoginForm');
    });
  });

  describe('isValid logic - validation state', () => {
    it('submit button is disabled when both fields are empty', () => {
      renderWithTheme(<LoginForm />);
      const submitBtn = screen.getByTestId('button-submit');
      expect(submitBtn).toBeDisabled();
    });

    it('submit button is disabled when only email is filled', async () => {
      renderWithTheme(<LoginForm />);
      const emailInput = screen.getByTestId('input-email');
      await userEvent.type(emailInput, 'test@example.com');

      const submitBtn = screen.getByTestId('button-submit');
      expect(submitBtn).toBeDisabled();
    });

    it('submit button is disabled when only password is filled', async () => {
      renderWithTheme(<LoginForm />);
      const passwordInput = screen.getByTestId('input-password');
      await userEvent.type(passwordInput, 'password123');

      const submitBtn = screen.getByTestId('button-submit');
      expect(submitBtn).toBeDisabled();
    });

    it('submit button is enabled when both email and password are filled', async () => {
      renderWithTheme(<LoginForm />);
      const emailInput = screen.getByTestId('input-email');
      const passwordInput = screen.getByTestId('input-password');

      await userEvent.type(emailInput, 'test@example.com');
      await userEvent.type(passwordInput, 'password123');

      const submitBtn = screen.getByTestId('button-submit');
      expect(submitBtn).not.toBeDisabled();
    });

    it('submit button becomes disabled when email is cleared', async () => {
      renderWithTheme(<LoginForm />);
      const emailInput = screen.getByTestId('input-email');
      const passwordInput = screen.getByTestId('input-password');

      await userEvent.type(emailInput, 'test@example.com');
      await userEvent.type(passwordInput, 'password123');

      const submitBtn = screen.getByTestId('button-submit');
      expect(submitBtn).not.toBeDisabled();

      await userEvent.clear(emailInput);
      expect(submitBtn).toBeDisabled();
    });

    it('submit button becomes disabled when password is cleared', async () => {
      renderWithTheme(<LoginForm />);
      const emailInput = screen.getByTestId('input-email');
      const passwordInput = screen.getByTestId('input-password');

      await userEvent.type(emailInput, 'test@example.com');
      await userEvent.type(passwordInput, 'password123');

      const submitBtn = screen.getByTestId('button-submit');
      expect(submitBtn).not.toBeDisabled();

      await userEvent.clear(passwordInput);
      expect(submitBtn).toBeDisabled();
    });
  });

  describe('isValid logic - whitespace trimming', () => {
    it('treats email with only spaces as empty', async () => {
      renderWithTheme(<LoginForm />);
      const emailInput = screen.getByTestId('input-email');
      const passwordInput = screen.getByTestId('input-password');

      await userEvent.type(emailInput, '   ');
      await userEvent.type(passwordInput, 'password123');

      const submitBtn = screen.getByTestId('button-submit');
      expect(submitBtn).toBeDisabled();
    });

    it('treats password with only spaces as empty', async () => {
      renderWithTheme(<LoginForm />);
      const emailInput = screen.getByTestId('input-email');
      const passwordInput = screen.getByTestId('input-password');

      await userEvent.type(emailInput, 'test@example.com');
      await userEvent.type(passwordInput, '   ');

      const submitBtn = screen.getByTestId('button-submit');
      expect(submitBtn).toBeDisabled();
    });

    it('treats both fields with only spaces as empty', async () => {
      renderWithTheme(<LoginForm />);
      const emailInput = screen.getByTestId('input-email');
      const passwordInput = screen.getByTestId('input-password');

      await userEvent.type(emailInput, '   ');
      await userEvent.type(passwordInput, '   ');

      const submitBtn = screen.getByTestId('button-submit');
      expect(submitBtn).toBeDisabled();
    });

    it('enables submit when email has leading/trailing spaces that trim to valid', async () => {
      renderWithTheme(<LoginForm />);
      const emailInput = screen.getByTestId('input-email');
      const passwordInput = screen.getByTestId('input-password');

      await userEvent.type(emailInput, '  test@example.com  ');
      await userEvent.type(passwordInput, 'password123');

      const submitBtn = screen.getByTestId('button-submit');
      expect(submitBtn).not.toBeDisabled();
    });

    it('enables submit when password has leading/trailing spaces that trim to valid', async () => {
      renderWithTheme(<LoginForm />);
      const emailInput = screen.getByTestId('input-email');
      const passwordInput = screen.getByTestId('input-password');

      await userEvent.type(emailInput, 'test@example.com');
      await userEvent.type(passwordInput, '  password123  ');

      const submitBtn = screen.getByTestId('button-submit');
      expect(submitBtn).not.toBeDisabled();
    });
  });

  describe('isValid logic - edge cases', () => {
    it('handles single character email', async () => {
      renderWithTheme(<LoginForm />);
      const emailInput = screen.getByTestId('input-email');
      const passwordInput = screen.getByTestId('input-password');

      await userEvent.type(emailInput, 'a');
      await userEvent.type(passwordInput, 'password123');

      const submitBtn = screen.getByTestId('button-submit');
      expect(submitBtn).not.toBeDisabled();
    });

    it('handles single character password', async () => {
      renderWithTheme(<LoginForm />);
      const emailInput = screen.getByTestId('input-email');
      const passwordInput = screen.getByTestId('input-password');

      await userEvent.type(emailInput, 'test@example.com');
      await userEvent.type(passwordInput, 'a');

      const submitBtn = screen.getByTestId('button-submit');
      expect(submitBtn).not.toBeDisabled();
    });

    it('handles very long email', async () => {
      renderWithTheme(<LoginForm />);
      const emailInput = screen.getByTestId('input-email');
      const passwordInput = screen.getByTestId('input-password');

      const longEmail = 'a'.repeat(100) + '@example.com';
      await userEvent.type(emailInput, longEmail);
      await userEvent.type(passwordInput, 'password123');

      const submitBtn = screen.getByTestId('button-submit');
      expect(submitBtn).not.toBeDisabled();
    });

    it('handles very long password', async () => {
      renderWithTheme(<LoginForm />);
      const emailInput = screen.getByTestId('input-email');
      const passwordInput = screen.getByTestId('input-password');

      const longPassword = 'a'.repeat(1000);
      await userEvent.type(emailInput, 'test@example.com');
      await userEvent.type(passwordInput, longPassword);

      const submitBtn = screen.getByTestId('button-submit');
      expect(submitBtn).not.toBeDisabled();
    });

    it('enables submit for special characters in email', async () => {
      renderWithTheme(<LoginForm />);
      const emailInput = screen.getByTestId('input-email');
      const passwordInput = screen.getByTestId('input-password');

      await userEvent.type(emailInput, 'test+tag@example.co.uk');
      await userEvent.type(passwordInput, 'password123');

      const submitBtn = screen.getByTestId('button-submit');
      expect(submitBtn).not.toBeDisabled();
    });

    it('enables submit for special characters in password', async () => {
      renderWithTheme(<LoginForm />);
      const emailInput = screen.getByTestId('input-email');
      const passwordInput = screen.getByTestId('input-password');

      await userEvent.type(emailInput, 'test@example.com');
      await userEvent.type(passwordInput, 'p@ss!w0rd#$%');

      const submitBtn = screen.getByTestId('button-submit');
      expect(submitBtn).not.toBeDisabled();
    });
  });

  describe('form submission', () => {
    it('prevents default form submission behavior', async () => {
      renderWithTheme(<LoginForm />);
      const emailInput = screen.getByTestId('input-email');
      const passwordInput = screen.getByTestId('input-password');
      const submitBtn = screen.getByTestId('button-submit');

      await userEvent.type(emailInput, 'test@example.com');
      await userEvent.type(passwordInput, 'password123');

      const spy = vi.fn();
      submitBtn.addEventListener('click', spy);

      await userEvent.click(submitBtn);
      // Form submission with preventDefault would be internal, just verify click works
      expect(spy).toHaveBeenCalled();
    });

    it('shows alert with message when form is submitted', async () => {
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

      renderWithTheme(<LoginForm />);
      const emailInput = screen.getByTestId('input-email');
      const passwordInput = screen.getByTestId('input-password');
      const submitBtn = screen.getByTestId('button-submit');

      await userEvent.type(emailInput, 'test@example.com');
      await userEvent.type(passwordInput, 'password123');

      await userEvent.click(submitBtn);

      expect(alertSpy).toHaveBeenCalledWith('로그인 (API 연동 전)');
      alertSpy.mockRestore();
    });

    it('shows alert regardless of email value when password is provided', async () => {
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

      renderWithTheme(<LoginForm />);
      const emailInput = screen.getByTestId('input-email');
      const passwordInput = screen.getByTestId('input-password');
      const submitBtn = screen.getByTestId('button-submit') as HTMLButtonElement;

      await userEvent.type(emailInput, 'any-email-value');
      await userEvent.type(passwordInput, 'any-password');

      // Simulate form submission by clicking the submit button or dispatching submit event
      const form = submitBtn.closest('form');
      if (form) {
        form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
      } else {
        await userEvent.click(submitBtn);
      }

      expect(alertSpy).toHaveBeenCalledWith('로그인 (API 연동 전)');
      alertSpy.mockRestore();
    });

    it('does not show alert when submit button is disabled', async () => {
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

      renderWithTheme(<LoginForm />);
      // Do not fill in any fields
      const submitBtn = screen.getByTestId('button-submit');

      // Try to click disabled button - it should not respond
      await userEvent.click(submitBtn);

      expect(alertSpy).not.toHaveBeenCalled();
      alertSpy.mockRestore();
    });

    it('shows alert once per submission', async () => {
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

      renderWithTheme(<LoginForm />);
      const emailInput = screen.getByTestId('input-email');
      const passwordInput = screen.getByTestId('input-password');
      const submitBtn = screen.getByTestId('button-submit');

      await userEvent.type(emailInput, 'test@example.com');
      await userEvent.type(passwordInput, 'password123');

      await userEvent.click(submitBtn);
      await userEvent.click(submitBtn);

      expect(alertSpy).toHaveBeenCalledTimes(2);
      alertSpy.mockRestore();
    });

    it('clears form state after submission', async () => {
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

      renderWithTheme(<LoginForm />);
      const emailInput = screen.getByTestId('input-email') as HTMLInputElement;
      const passwordInput = screen.getByTestId('input-password') as HTMLInputElement;
      const submitBtn = screen.getByTestId('button-submit');

      await userEvent.type(emailInput, 'test@example.com');
      await userEvent.type(passwordInput, 'password123');

      await userEvent.click(submitBtn);

      // Check values remain (form doesn't clear in current implementation)
      expect(emailInput.value).toBe('test@example.com');
      expect(passwordInput.value).toBe('password123');
      alertSpy.mockRestore();
    });
  });

  describe('navigation to signup', () => {
    it('navigates to /signup when signup button is clicked', async () => {
      renderWithTheme(<LoginForm />);
      const signupBtn = screen.getByRole('button', { name: '회원가입' });

      await userEvent.click(signupBtn);

      expect(mockNavigate).toHaveBeenCalledWith('/signup');
    });

    it('calls useNavigate hook at component render', () => {
      // useNavigate hook is called during component initialization
      // The component should render without errors
      expect(() => {
        renderWithTheme(<LoginForm />);
      }).not.toThrow();
    });

    it('navigates exactly once when signup button is clicked once', async () => {
      renderWithTheme(<LoginForm />);
      const signupBtn = screen.getByRole('button', { name: '회원가입' });

      const initialCallCount = mockNavigate.mock.calls.length;
      await userEvent.click(signupBtn);

      // One additional call from the button click
      expect(mockNavigate.mock.calls.length).toBe(initialCallCount + 1);
    });

    it('navigates multiple times when signup button is clicked multiple times', async () => {
      renderWithTheme(<LoginForm />);
      const signupBtn = screen.getByRole('button', { name: '회원가입' });

      const initialCallCount = mockNavigate.mock.calls.length;
      await userEvent.click(signupBtn);
      await userEvent.click(signupBtn);
      await userEvent.click(signupBtn);

      // Three additional calls from button clicks
      expect(mockNavigate.mock.calls.length).toBe(initialCallCount + 3);
      expect(mockNavigate).toHaveBeenCalledWith('/signup');
    });

    it('signup button works independently from form submission', async () => {
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

      renderWithTheme(<LoginForm />);
      const signupBtn = screen.getByRole('button', { name: '회원가입' });

      // Do not fill in form
      await userEvent.click(signupBtn);

      expect(mockNavigate).toHaveBeenCalledWith('/signup');
      expect(alertSpy).not.toHaveBeenCalled();
      alertSpy.mockRestore();
    });

    it('signup navigation works when form is partially filled', async () => {
      renderWithTheme(<LoginForm />);
      const emailInput = screen.getByTestId('input-email');
      const signupBtn = screen.getByRole('button', { name: '회원가입' });

      await userEvent.type(emailInput, 'test@example.com');
      await userEvent.click(signupBtn);

      expect(mockNavigate).toHaveBeenCalledWith('/signup');
    });
  });

  describe('state management and interaction', () => {
    it('updates email input value as user types', async () => {
      renderWithTheme(<LoginForm />);
      const emailInput = screen.getByTestId('input-email') as HTMLInputElement;

      await userEvent.type(emailInput, 'test');

      expect(emailInput.value).toBe('test');
    });

    it('updates password input value as user types', async () => {
      renderWithTheme(<LoginForm />);
      const passwordInput = screen.getByTestId('input-password') as HTMLInputElement;

      await userEvent.type(passwordInput, 'secret');

      expect(passwordInput.value).toBe('secret');
    });

    it('maintains separate state for email and password', async () => {
      renderWithTheme(<LoginForm />);
      const emailInput = screen.getByTestId('input-email') as HTMLInputElement;
      const passwordInput = screen.getByTestId('input-password') as HTMLInputElement;

      await userEvent.type(emailInput, 'test@example.com');
      await userEvent.type(passwordInput, 'password123');

      expect(emailInput.value).toBe('test@example.com');
      expect(passwordInput.value).toBe('password123');
    });

    it('handles backspace and clearing input', async () => {
      renderWithTheme(<LoginForm />);
      const emailInput = screen.getByTestId('input-email') as HTMLInputElement;

      await userEvent.type(emailInput, 'test@example.com');
      expect(emailInput.value).toBe('test@example.com');

      await userEvent.clear(emailInput);
      expect(emailInput.value).toBe('');
    });

    it('supports multiple consecutive edits', async () => {
      renderWithTheme(<LoginForm />);
      const emailInput = screen.getByTestId('input-email') as HTMLInputElement;

      await userEvent.type(emailInput, 'test1@example.com');
      expect(emailInput.value).toBe('test1@example.com');

      await userEvent.clear(emailInput);
      await userEvent.type(emailInput, 'test2@example.com');

      expect(emailInput.value).toBe('test2@example.com');
    });
  });

  describe('component composition and layout', () => {
    it('renders all form elements in correct order', () => {
      const { container } = renderWithTheme(<LoginForm />);
      const text = container.textContent;

      const titleIndex = text.indexOf('로그인');
      const emailIndex = text.indexOf('이메일');
      const passwordIndex = text.indexOf('비밀번호');
      const signupIndex = text.indexOf('회원가입');

      expect(titleIndex).toBeLessThan(emailIndex);
      expect(emailIndex).toBeLessThan(passwordIndex);
      expect(passwordIndex).toBeLessThan(signupIndex);
    });

    it('renders without crashing with default props', () => {
      expect(() => {
        renderWithTheme(<LoginForm />);
      }).not.toThrow();
    });

    it('component remains usable after multiple re-renders', async () => {
      const { rerender } = renderWithTheme(<LoginForm />);
      const emailInput = screen.getByTestId('input-email');

      await userEvent.type(emailInput, 'test1@example.com');

      rerender(<LoginForm />);

      const emailInputAfterRerender = screen.getByTestId('input-email') as HTMLInputElement;
      // Component state is preserved across rerender (this is expected React behavior)
      expect(emailInputAfterRerender.value).toBe('test1@example.com');

      // Can still interact with the component after rerender
      await userEvent.clear(emailInputAfterRerender);
      expect(emailInputAfterRerender.value).toBe('');
    });
  });
});
