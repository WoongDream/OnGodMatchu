import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithTheme, screen } from '@/test/renderWithTheme';
import userEvent from '@testing-library/user-event';
import SignupForm from './SignupForm';

const mockNavigate = vi.hoisted(() => vi.fn());

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock('@/api/auth', () => ({
  signup: vi.fn().mockResolvedValue(undefined),
  verifyEmail: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('./SocialLoginButtons', () => ({
  default: () => <div data-testid="social-login-buttons">Social Login Buttons</div>,
}));

vi.mock('@/components/input', () => ({
  default: ({ label, type, value, onChange, placeholder }: any) => {
    const id = `input-${label}`;
    return (
      <div>
        <label htmlFor={id}>{label}</label>
        <input
          id={id}
          type={type || 'text'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          data-testid={`input-${label}`}
        />
      </div>
    );
  },
}));

vi.mock('@/components/button', () => ({
  default: ({
    type,
    disabled,
    children,
    onClick,
  }: {
    fullWidth?: boolean;
    variant?: string;
    type?: 'button' | 'submit' | 'reset';
    disabled?: boolean;
    children: React.ReactNode;
    onClick?: () => void;
  }) => (
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

describe('SignupForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Form Rendering', () => {
    it('should render the signup form with all input fields', () => {
      renderWithTheme(<SignupForm />);
      expect(screen.getByText('회원가입')).toBeInTheDocument();
      expect(screen.getByLabelText('이메일')).toBeInTheDocument();
      expect(screen.getByLabelText('닉네임')).toBeInTheDocument();
      expect(screen.getByLabelText('비밀번호')).toBeInTheDocument();
    });

    it('should render the send email verification button', () => {
      renderWithTheme(<SignupForm />);
      expect(screen.getByRole('button', { name: '인증 코드 발송' })).toBeInTheDocument();
    });

    it('should render the signup button', () => {
      renderWithTheme(<SignupForm />);
      expect(screen.getByRole('button', { name: '가입하기' })).toBeInTheDocument();
    });

    it('should render the login link button', () => {
      renderWithTheme(<SignupForm />);
      expect(screen.getByRole('button', { name: '로그인' })).toBeInTheDocument();
    });

    it('should render the login prompt text', () => {
      renderWithTheme(<SignupForm />);
      expect(screen.getByText('이미 계정이 있으신가요?')).toBeInTheDocument();
    });

    it('should render SocialLoginButtons component', () => {
      renderWithTheme(<SignupForm />);
      expect(screen.getByTestId('social-login-buttons')).toBeInTheDocument();
    });

    it('should not render verification code input initially', () => {
      renderWithTheme(<SignupForm />);
      expect(screen.queryByLabelText('인증 코드')).not.toBeInTheDocument();
    });
  });

  describe('Button States and Validation', () => {
    it('should disable send email button when email is empty', () => {
      renderWithTheme(<SignupForm />);
      const sendEmailButton = screen.getByRole('button', { name: '인증 코드 발송' });
      expect(sendEmailButton).toBeDisabled();
    });

    it('should enable send email button when all fields have value', async () => {
      const user = userEvent.setup();
      renderWithTheme(<SignupForm />);

      await user.type(screen.getByLabelText('이메일'), 'test@example.com');
      await user.type(screen.getByLabelText('닉네임'), 'testuser');
      await user.type(screen.getByLabelText('비밀번호'), 'password123');

      expect(screen.getByRole('button', { name: '인증 코드 발송' })).toBeEnabled();
    });

    it('should disable send email button when email is only whitespace', async () => {
      const user = userEvent.setup();
      renderWithTheme(<SignupForm />);
      const emailInput = screen.getByLabelText('이메일') as HTMLInputElement;

      await user.type(emailInput, '   ');

      const sendEmailButton = screen.getByRole('button', { name: '인증 코드 발송' });
      expect(sendEmailButton).toBeDisabled();
    });

    it('should disable signup button when form is invalid', () => {
      renderWithTheme(<SignupForm />);
      const signupButton = screen.getByRole('button', { name: '가입하기' });
      expect(signupButton).toBeDisabled();
    });

    it('should enable signup button after email sent and verification code entered', async () => {
      const user = userEvent.setup();
      renderWithTheme(<SignupForm />);

      await user.type(screen.getByLabelText('이메일'), 'test@example.com');
      await user.type(screen.getByLabelText('닉네임'), 'testuser');
      await user.type(screen.getByLabelText('비밀번호'), 'password123');

      await user.click(screen.getByRole('button', { name: '인증 코드 발송' }));
      await user.type(await screen.findByLabelText('인증 코드'), '123456');

      expect(screen.getByRole('button', { name: '가입하기' })).toBeEnabled();
    });

    it('should disable signup button when email is empty', async () => {
      const user = userEvent.setup();
      renderWithTheme(<SignupForm />);

      const nicknameInput = screen.getByLabelText('닉네임');
      const passwordInput = screen.getByLabelText('비밀번호');

      await user.type(nicknameInput, 'testuser');
      await user.type(passwordInput, 'password123');

      const signupButton = screen.getByRole('button', { name: '가입하기' });
      expect(signupButton).toBeDisabled();
    });

    it('should disable signup button when nickname is empty', async () => {
      const user = userEvent.setup();
      renderWithTheme(<SignupForm />);

      const emailInput = screen.getByLabelText('이메일');
      const passwordInput = screen.getByLabelText('비밀번호');

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');

      const signupButton = screen.getByRole('button', { name: '가입하기' });
      expect(signupButton).toBeDisabled();
    });

    it('should disable signup button when password is empty', async () => {
      const user = userEvent.setup();
      renderWithTheme(<SignupForm />);

      const emailInput = screen.getByLabelText('이메일');
      const nicknameInput = screen.getByLabelText('닉네임');

      await user.type(emailInput, 'test@example.com');
      await user.type(nicknameInput, 'testuser');

      const signupButton = screen.getByRole('button', { name: '가입하기' });
      expect(signupButton).toBeDisabled();
    });

    it('should require verification code when email has been sent', async () => {
      const user = userEvent.setup();
      renderWithTheme(<SignupForm />);

      await user.type(screen.getByLabelText('이메일'), 'test@example.com');
      await user.type(screen.getByLabelText('닉네임'), 'testuser');
      await user.type(screen.getByLabelText('비밀번호'), 'password123');

      await user.click(screen.getByRole('button', { name: '인증 코드 발송' }));

      await screen.findByLabelText('인증 코드');
      expect(screen.getByRole('button', { name: '가입하기' })).toBeDisabled();
    });

    it('should enable signup button when verification code is provided after email sent', async () => {
      const user = userEvent.setup();
      renderWithTheme(<SignupForm />);

      await user.type(screen.getByLabelText('이메일'), 'test@example.com');
      await user.type(screen.getByLabelText('닉네임'), 'testuser');
      await user.type(screen.getByLabelText('비밀번호'), 'password123');
      await user.click(screen.getByRole('button', { name: '인증 코드 발송' }));
      await user.type(await screen.findByLabelText('인증 코드'), '123456');

      expect(screen.getByRole('button', { name: '가입하기' })).toBeEnabled();
    });

    it('should disable signup button when verification code is only whitespace', async () => {
      const user = userEvent.setup();
      renderWithTheme(<SignupForm />);

      await user.type(screen.getByLabelText('이메일'), 'test@example.com');
      await user.type(screen.getByLabelText('닉네임'), 'testuser');
      await user.type(screen.getByLabelText('비밀번호'), 'password123');
      await user.click(screen.getByRole('button', { name: '인증 코드 발송' }));
      await user.type(await screen.findByLabelText('인증 코드'), '   ');

      expect(screen.getByRole('button', { name: '가입하기' })).toBeDisabled();
    });
  });

  describe('Email Verification', () => {
    it('should hide verification code input initially', () => {
      renderWithTheme(<SignupForm />);
      expect(screen.queryByLabelText('인증 코드')).not.toBeInTheDocument();
    });

    it('should show verification code input after sending email', async () => {
      const user = userEvent.setup();
      renderWithTheme(<SignupForm />);

      await user.type(screen.getByLabelText('이메일'), 'test@example.com');
      await user.type(screen.getByLabelText('닉네임'), 'testuser');
      await user.type(screen.getByLabelText('비밀번호'), 'password123');
      await user.click(screen.getByRole('button', { name: '인증 코드 발송' }));

      expect(await screen.findByLabelText('인증 코드')).toBeInTheDocument();
    });

    it('should call signup API when send email button is clicked', async () => {
      const { signup } = await import('@/api/auth');
      const user = userEvent.setup();
      renderWithTheme(<SignupForm />);

      await user.type(screen.getByLabelText('이메일'), 'test@example.com');
      await user.type(screen.getByLabelText('닉네임'), 'testuser');
      await user.type(screen.getByLabelText('비밀번호'), 'password123');
      await user.click(screen.getByRole('button', { name: '인증 코드 발송' }));

      expect(signup).toHaveBeenCalledWith('test@example.com', 'testuser', 'password123');
    });

    it('should toggle emailSent state to true when send email button is clicked', async () => {
      const user = userEvent.setup();
      renderWithTheme(<SignupForm />);

      await user.type(screen.getByLabelText('이메일'), 'test@example.com');
      await user.type(screen.getByLabelText('닉네임'), 'testuser');
      await user.type(screen.getByLabelText('비밀번호'), 'password123');

      expect(screen.queryByLabelText('인증 코드')).not.toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: '인증 코드 발송' }));

      expect(await screen.findByLabelText('인증 코드')).toBeInTheDocument();
    });

    it('should allow user to input verification code after sending email', async () => {
      const user = userEvent.setup();
      renderWithTheme(<SignupForm />);

      await user.type(screen.getByLabelText('이메일'), 'test@example.com');
      await user.type(screen.getByLabelText('닉네임'), 'testuser');
      await user.type(screen.getByLabelText('비밀번호'), 'password123');
      await user.click(screen.getByRole('button', { name: '인증 코드 발송' }));

      const verificationInput = (await screen.findByLabelText('인증 코드')) as HTMLInputElement;
      await user.type(verificationInput, 'ABC123');

      expect(verificationInput.value).toBe('ABC123');
    });
  });

  describe('Form Input Handling', () => {
    it('should update email input value when user types', async () => {
      const user = userEvent.setup();
      renderWithTheme(<SignupForm />);

      const emailInput = screen.getByLabelText('이메일') as HTMLInputElement;
      await user.type(emailInput, 'test@example.com');

      expect(emailInput.value).toBe('test@example.com');
    });

    it('should update nickname input value when user types', async () => {
      const user = userEvent.setup();
      renderWithTheme(<SignupForm />);

      const nicknameInput = screen.getByLabelText('닉네임') as HTMLInputElement;
      await user.type(nicknameInput, 'testuser');

      expect(nicknameInput.value).toBe('testuser');
    });

    it('should update password input value when user types', async () => {
      const user = userEvent.setup();
      renderWithTheme(<SignupForm />);

      const passwordInput = screen.getByLabelText('비밀번호') as HTMLInputElement;
      await user.type(passwordInput, 'password123');

      expect(passwordInput.value).toBe('password123');
    });

    it('should handle empty string inputs', async () => {
      const user = userEvent.setup();
      renderWithTheme(<SignupForm />);

      const emailInput = screen.getByLabelText('이메일') as HTMLInputElement;
      await user.type(emailInput, 'test@example.com');
      await user.clear(emailInput);

      expect(emailInput.value).toBe('');
    });

    it('should handle long input values', async () => {
      const user = userEvent.setup();
      renderWithTheme(<SignupForm />);

      const longEmail = 'a'.repeat(100) + '@example.com';
      const emailInput = screen.getByLabelText('이메일') as HTMLInputElement;
      await user.type(emailInput, longEmail);

      expect(emailInput.value).toBe(longEmail);
    });

    it('should trim whitespace in validation for send code button', async () => {
      const user = userEvent.setup();
      renderWithTheme(<SignupForm />);

      await user.type(screen.getByLabelText('이메일'), '   test@example.com   ');
      await user.type(screen.getByLabelText('닉네임'), '   testuser   ');
      await user.type(screen.getByLabelText('비밀번호'), '   password123   ');

      expect(screen.getByRole('button', { name: '인증 코드 발송' })).toBeEnabled();
    });
  });

  describe('Form Submission', () => {
    it('should prevent default form submission behavior', async () => {
      const user = userEvent.setup();
      renderWithTheme(<SignupForm />);

      await user.type(screen.getByLabelText('이메일'), 'test@example.com');
      await user.type(screen.getByLabelText('닉네임'), 'testuser');
      await user.type(screen.getByLabelText('비밀번호'), 'password123');
      await user.click(screen.getByRole('button', { name: '인증 코드 발송' }));
      await user.type(await screen.findByLabelText('인증 코드'), '123456');

      const signupButton = screen.getByRole('button', { name: '가입하기' });
      await user.click(signupButton);

      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });

    it('should call verifyEmail API when signup button is clicked with valid data', async () => {
      const { verifyEmail } = await import('@/api/auth');
      const user = userEvent.setup();
      renderWithTheme(<SignupForm />);

      await user.type(screen.getByLabelText('이메일'), 'test@example.com');
      await user.type(screen.getByLabelText('닉네임'), 'testuser');
      await user.type(screen.getByLabelText('비밀번호'), 'password123');
      await user.click(screen.getByRole('button', { name: '인증 코드 발송' }));
      await user.type(await screen.findByLabelText('인증 코드'), '123456');

      await user.click(screen.getByRole('button', { name: '가입하기' }));

      expect(verifyEmail).toHaveBeenCalledWith('test@example.com', '123456');
    });

    it('should navigate to login after successful verification', async () => {
      const user = userEvent.setup();
      renderWithTheme(<SignupForm />);

      await user.type(screen.getByLabelText('이메일'), 'test@example.com');
      await user.type(screen.getByLabelText('닉네임'), 'testuser');
      await user.type(screen.getByLabelText('비밀번호'), 'password123');
      await user.click(screen.getByRole('button', { name: '인증 코드 발송' }));
      await user.type(await screen.findByLabelText('인증 코드'), '123456');

      await user.click(screen.getByRole('button', { name: '가입하기' }));

      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });

  describe('Navigation', () => {
    it('should navigate to login page when login button is clicked', async () => {
      const user = userEvent.setup();
      renderWithTheme(<SignupForm />);

      const loginButton = screen.getByRole('button', { name: '로그인' });
      await user.click(loginButton);

      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });

    it('should call navigate function with correct path', async () => {
      const user = userEvent.setup();
      renderWithTheme(<SignupForm />);

      const loginButton = screen.getByRole('button', { name: '로그인' });
      await user.click(loginButton);

      expect(mockNavigate).toHaveBeenCalledWith('/login');
      expect(mockNavigate).toHaveBeenCalledTimes(1);
    });

    it('should call navigate only once on single click', async () => {
      const user = userEvent.setup();
      renderWithTheme(<SignupForm />);

      const loginButton = screen.getByRole('button', { name: '로그인' });
      await user.click(loginButton);

      expect(mockNavigate).toHaveBeenCalledTimes(1);
    });
  });

  describe('Edge Cases', () => {
    it('should handle special characters in input fields', async () => {
      const user = userEvent.setup();
      renderWithTheme(<SignupForm />);

      const emailInput = screen.getByLabelText('이메일') as HTMLInputElement;
      const nicknameInput = screen.getByLabelText('닉네임') as HTMLInputElement;
      const passwordInput = screen.getByLabelText('비밀번호') as HTMLInputElement;

      await user.type(emailInput, 'test+tag@example.com');
      await user.type(nicknameInput, 'user@123!');
      await user.type(passwordInput, 'pass!@#$%');

      expect(emailInput.value).toBe('test+tag@example.com');
      expect(nicknameInput.value).toBe('user@123!');
      expect(passwordInput.value).toBe('pass!@#$%');
    });

    it('should disable send email button after first send to prevent duplicates', async () => {
      const user = userEvent.setup();
      renderWithTheme(<SignupForm />);

      await user.type(screen.getByLabelText('이메일'), 'test@example.com');
      await user.type(screen.getByLabelText('닉네임'), 'testuser');
      await user.type(screen.getByLabelText('비밀번호'), 'password123');

      const sendEmailButton = screen.getByRole('button', { name: '인증 코드 발송' });
      await user.click(sendEmailButton);

      expect(await screen.findByLabelText('인증 코드')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '코드 발송됨' })).toBeDisabled();
    });

    it('should handle clearing and re-entering verification code', async () => {
      const user = userEvent.setup();
      renderWithTheme(<SignupForm />);

      await user.type(screen.getByLabelText('이메일'), 'test@example.com');
      await user.type(screen.getByLabelText('닉네임'), 'testuser');
      await user.type(screen.getByLabelText('비밀번호'), 'password123');
      await user.click(screen.getByRole('button', { name: '인증 코드 발송' }));

      const verificationInput = (await screen.findByLabelText('인증 코드')) as HTMLInputElement;
      await user.type(verificationInput, '123456');
      expect(verificationInput.value).toBe('123456');

      await user.clear(verificationInput);
      expect(verificationInput.value).toBe('');

      await user.type(verificationInput, '654321');
      expect(verificationInput.value).toBe('654321');
    });

    it('should validate form state correctly after clearing email', async () => {
      const user = userEvent.setup();
      renderWithTheme(<SignupForm />);

      const emailInput = screen.getByLabelText('이메일');
      await user.type(emailInput, 'test@example.com');
      await user.type(screen.getByLabelText('닉네임'), 'testuser');
      await user.type(screen.getByLabelText('비밀번호'), 'password123');

      expect(screen.getByRole('button', { name: '인증 코드 발송' })).toBeEnabled();

      await user.clear(emailInput);
      expect(screen.getByRole('button', { name: '인증 코드 발송' })).toBeDisabled();
    });

    it('should handle numeric-only input in email field', async () => {
      const user = userEvent.setup();
      renderWithTheme(<SignupForm />);

      const emailInput = screen.getByLabelText('이메일') as HTMLInputElement;
      await user.type(emailInput, '12345');
      await user.type(screen.getByLabelText('닉네임'), 'testuser');
      await user.type(screen.getByLabelText('비밀번호'), 'password123');

      expect(screen.getByRole('button', { name: '인증 코드 발송' })).toBeEnabled();
      expect(emailInput.value).toBe('12345');
    });

    it('should handle unicode characters in nickname field', async () => {
      const user = userEvent.setup();
      renderWithTheme(<SignupForm />);

      const nicknameInput = screen.getByLabelText('닉네임') as HTMLInputElement;
      await user.type(nicknameInput, '사용자이름');

      expect(nicknameInput.value).toBe('사용자이름');
    });
  });

  describe('Accessibility', () => {
    it('should have proper input type attributes', () => {
      renderWithTheme(<SignupForm />);

      const emailInput = screen.getByLabelText('이메일') as HTMLInputElement;
      expect(emailInput.type).toBe('email');

      const passwordInput = screen.getByLabelText('비밀번호') as HTMLInputElement;
      expect(passwordInput.type).toBe('password');
    });

    it('should have proper button types', () => {
      renderWithTheme(<SignupForm />);

      const sendEmailButton = screen.getByRole('button', {
        name: '인증 코드 발송',
      }) as HTMLButtonElement;
      expect(sendEmailButton.type).toBe('button');

      const signupButton = screen.getByRole('button', { name: '가입하기' }) as HTMLButtonElement;
      expect(signupButton.type).toBe('submit');
    });

    it('should have placeholders for all input fields', () => {
      renderWithTheme(<SignupForm />);

      expect(screen.getByPlaceholderText('example@email.com')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('닉네임 입력')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('비밀번호 입력')).toBeInTheDocument();
    });

    it('should have placeholder for verification code input', async () => {
      const user = userEvent.setup();
      renderWithTheme(<SignupForm />);

      await user.type(screen.getByLabelText('이메일'), 'test@example.com');
      await user.type(screen.getByLabelText('닉네임'), 'testuser');
      await user.type(screen.getByLabelText('비밀번호'), 'password123');
      await user.click(screen.getByRole('button', { name: '인증 코드 발송' }));

      expect(await screen.findByPlaceholderText('이메일로 받은 코드 입력')).toBeInTheDocument();
    });
  });
});
