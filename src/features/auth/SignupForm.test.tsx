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

/**
 * PasswordInput mock — 실제 zxcvbn 없이 SignupForm 통합 테스트를 수행한다.
 *
 * 테스트에서 비밀번호 강도를 제어하기 위해:
 *   - data-testid="password-strength-ok" 인 hidden input 을 제공한다.
 *   - canSendCode 조건: isLengthValid(password) && canSubmitByStrength(score) 를
 *     mock 에서는 value.length >= 10 으로 단순화한다.
 *   - onStrengthChange 는 value.length >= 10 이면 score=2, 미달이면 score=0 으로 즉시 호출한다.
 */
vi.mock('@/components/password-input', () => ({
  default: ({
    label,
    value,
    onChange,
    placeholder,
    onStrengthChange,
    ruleStatus: _ruleStatus,
    error,
    disabled,
  }: any) => {
    const id = `input-${label}`;
    const score = value.length >= 10 ? 2 : 0;

    // onStrengthChange 를 동기로 호출 (SignupForm 이 useEffect 없이 상태를 받으려면)
    // React 렌더 중에 setState 를 호출하면 안 되므로 useLayoutEffect 처럼 동작하는
    // 패턴을 피하고, 대신 onChange 호출 시 score 를 함께 전달하는 방식을 쓴다.
    //
    // 실제로는 input change → onChange(value) → 부모 setPassword(value) → 리렌더 →
    // onStrengthChange(strength) 의 흐름이지만 mock 에서는 직접 호출한다.
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      onChange(newValue);
      const newScore = newValue.length >= 10 ? 2 : 0;
      onStrengthChange?.({
        score: newScore,
        crackTimesDisplay: '3 hours',
        feedbackWarning: '',
        feedbackSuggestions: [],
      });
    };

    return (
      <div>
        <label htmlFor={id}>{label}</label>
        <input
          id={id}
          type="password"
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          disabled={disabled ?? false}
          data-testid={`input-${label}`}
          data-score={score}
        />
        {error && <span data-testid="password-error">{error}</span>}
      </div>
    );
  },
  // re-export types used by SignupForm
  canSubmitByStrength: (score: number) => score >= 1,
}));

vi.mock('@/lib/password', () => ({
  isLengthValid: (pw: string) => pw.length >= 10,
  canSubmitByStrength: (score: number) => score >= 1,
}));

// 강한 비밀번호 — 길이 10 이상 + mock score >= 1
const STRONG_PASSWORD = '내고양이는오늘도잠만잔다';
// 약한 비밀번호 — 9자 이하
const WEAK_PASSWORD = 'short';

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

    it('should enable send email button when all fields have a strong password', async () => {
      const user = userEvent.setup();
      renderWithTheme(<SignupForm />);

      await user.type(screen.getByLabelText('이메일'), 'test@example.com');
      await user.type(screen.getByLabelText('닉네임'), 'testuser');
      await user.type(screen.getByLabelText('비밀번호'), STRONG_PASSWORD);

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
      await user.type(screen.getByLabelText('비밀번호'), STRONG_PASSWORD);

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
      await user.type(passwordInput, STRONG_PASSWORD);

      const signupButton = screen.getByRole('button', { name: '가입하기' });
      expect(signupButton).toBeDisabled();
    });

    it('should disable signup button when nickname is empty', async () => {
      const user = userEvent.setup();
      renderWithTheme(<SignupForm />);

      const emailInput = screen.getByLabelText('이메일');
      const passwordInput = screen.getByLabelText('비밀번호');

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, STRONG_PASSWORD);

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
      await user.type(screen.getByLabelText('비밀번호'), STRONG_PASSWORD);

      await user.click(screen.getByRole('button', { name: '인증 코드 발송' }));

      await screen.findByLabelText('인증 코드');
      expect(screen.getByRole('button', { name: '가입하기' })).toBeDisabled();
    });

    it('should enable signup button when verification code is provided after email sent', async () => {
      const user = userEvent.setup();
      renderWithTheme(<SignupForm />);

      await user.type(screen.getByLabelText('이메일'), 'test@example.com');
      await user.type(screen.getByLabelText('닉네임'), 'testuser');
      await user.type(screen.getByLabelText('비밀번호'), STRONG_PASSWORD);
      await user.click(screen.getByRole('button', { name: '인증 코드 발송' }));
      await user.type(await screen.findByLabelText('인증 코드'), '123456');

      expect(screen.getByRole('button', { name: '가입하기' })).toBeEnabled();
    });

    it('should disable signup button when verification code is only whitespace', async () => {
      const user = userEvent.setup();
      renderWithTheme(<SignupForm />);

      await user.type(screen.getByLabelText('이메일'), 'test@example.com');
      await user.type(screen.getByLabelText('닉네임'), 'testuser');
      await user.type(screen.getByLabelText('비밀번호'), STRONG_PASSWORD);
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
      await user.type(screen.getByLabelText('비밀번호'), STRONG_PASSWORD);
      await user.click(screen.getByRole('button', { name: '인증 코드 발송' }));

      expect(await screen.findByLabelText('인증 코드')).toBeInTheDocument();
    });

    it('should call signup API when send email button is clicked', async () => {
      const { signup } = await import('@/api/auth');
      const user = userEvent.setup();
      renderWithTheme(<SignupForm />);

      await user.type(screen.getByLabelText('이메일'), 'test@example.com');
      await user.type(screen.getByLabelText('닉네임'), 'testuser');
      await user.type(screen.getByLabelText('비밀번호'), STRONG_PASSWORD);
      await user.click(screen.getByRole('button', { name: '인증 코드 발송' }));

      expect(signup).toHaveBeenCalledWith('test@example.com', 'testuser', STRONG_PASSWORD);
    });

    it('should toggle emailSent state to true when send email button is clicked', async () => {
      const user = userEvent.setup();
      renderWithTheme(<SignupForm />);

      await user.type(screen.getByLabelText('이메일'), 'test@example.com');
      await user.type(screen.getByLabelText('닉네임'), 'testuser');
      await user.type(screen.getByLabelText('비밀번호'), STRONG_PASSWORD);

      expect(screen.queryByLabelText('인증 코드')).not.toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: '인증 코드 발송' }));

      expect(await screen.findByLabelText('인증 코드')).toBeInTheDocument();
    });

    it('should allow user to input verification code after sending email', async () => {
      const user = userEvent.setup();
      renderWithTheme(<SignupForm />);

      await user.type(screen.getByLabelText('이메일'), 'test@example.com');
      await user.type(screen.getByLabelText('닉네임'), 'testuser');
      await user.type(screen.getByLabelText('비밀번호'), STRONG_PASSWORD);
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
      await user.type(passwordInput, STRONG_PASSWORD);

      expect(passwordInput.value).toBe(STRONG_PASSWORD);
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
      // 공백 포함 길이가 10 이상인 강한 비밀번호
      await user.type(screen.getByLabelText('비밀번호'), STRONG_PASSWORD);

      expect(screen.getByRole('button', { name: '인증 코드 발송' })).toBeEnabled();
    });
  });

  describe('Form Submission', () => {
    it('should prevent default form submission behavior', async () => {
      const user = userEvent.setup();
      renderWithTheme(<SignupForm />);

      await user.type(screen.getByLabelText('이메일'), 'test@example.com');
      await user.type(screen.getByLabelText('닉네임'), 'testuser');
      await user.type(screen.getByLabelText('비밀번호'), STRONG_PASSWORD);
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
      await user.type(screen.getByLabelText('비밀번호'), STRONG_PASSWORD);
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
      await user.type(screen.getByLabelText('비밀번호'), STRONG_PASSWORD);
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
      await user.type(passwordInput, STRONG_PASSWORD);

      expect(emailInput.value).toBe('test+tag@example.com');
      expect(nicknameInput.value).toBe('user@123!');
      expect(passwordInput.value).toBe(STRONG_PASSWORD);
    });

    it('should disable send email button after first send to prevent duplicates', async () => {
      const user = userEvent.setup();
      renderWithTheme(<SignupForm />);

      await user.type(screen.getByLabelText('이메일'), 'test@example.com');
      await user.type(screen.getByLabelText('닉네임'), 'testuser');
      await user.type(screen.getByLabelText('비밀번호'), STRONG_PASSWORD);

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
      await user.type(screen.getByLabelText('비밀번호'), STRONG_PASSWORD);
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
      await user.type(screen.getByLabelText('비밀번호'), STRONG_PASSWORD);

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
      await user.type(screen.getByLabelText('비밀번호'), STRONG_PASSWORD);

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
      await user.type(screen.getByLabelText('비밀번호'), STRONG_PASSWORD);
      await user.click(screen.getByRole('button', { name: '인증 코드 발송' }));

      expect(await screen.findByPlaceholderText('이메일로 받은 코드 입력')).toBeInTheDocument();
    });
  });

  // =====================================================================
  // 비밀번호 강도 정책 (신규)
  // =====================================================================
  describe('비밀번호 강도 정책', () => {
    it('비밀번호가 9자 이하(약함)이면 인증 코드 발송 버튼이 비활성화된다', async () => {
      const user = userEvent.setup();
      renderWithTheme(<SignupForm />);

      await user.type(screen.getByLabelText('이메일'), 'test@example.com');
      await user.type(screen.getByLabelText('닉네임'), 'testuser');
      await user.type(screen.getByLabelText('비밀번호'), WEAK_PASSWORD);

      expect(screen.getByRole('button', { name: '인증 코드 발송' })).toBeDisabled();
    });

    it('비밀번호가 10자 이상(강함)이면 인증 코드 발송 버튼이 활성화된다', async () => {
      const user = userEvent.setup();
      renderWithTheme(<SignupForm />);

      await user.type(screen.getByLabelText('이메일'), 'test@example.com');
      await user.type(screen.getByLabelText('닉네임'), 'testuser');
      await user.type(screen.getByLabelText('비밀번호'), STRONG_PASSWORD);

      expect(screen.getByRole('button', { name: '인증 코드 발송' })).toBeEnabled();
    });

    it('비밀번호를 강한 값으로 교체하면 버튼이 활성화된다', async () => {
      const user = userEvent.setup();
      renderWithTheme(<SignupForm />);

      const emailInput = screen.getByLabelText('이메일');
      const nicknameInput = screen.getByLabelText('닉네임');
      const passwordInput = screen.getByLabelText('비밀번호');

      await user.type(emailInput, 'test@example.com');
      await user.type(nicknameInput, 'testuser');

      // 먼저 약한 비밀번호 입력
      await user.type(passwordInput, WEAK_PASSWORD);
      expect(screen.getByRole('button', { name: '인증 코드 발송' })).toBeDisabled();

      // 강한 비밀번호로 교체
      await user.clear(passwordInput);
      await user.type(passwordInput, STRONG_PASSWORD);
      expect(screen.getByRole('button', { name: '인증 코드 발송' })).toBeEnabled();
    });
  });
});
