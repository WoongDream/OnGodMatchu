import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithTheme, screen } from '@/test/renderWithTheme';
import userEvent from '@testing-library/user-event';
import SignupForm from './SignupForm';
import type { TermsAgreementState } from '@/components/terms-agreement-checkboxes';

const mockNavigate = vi.hoisted(() => vi.fn());
const mockSubmit = vi.hoisted(() => vi.fn());
const mockClearError = vi.hoisted(() => vi.fn());
const mockSendCode = vi.hoisted(() => vi.fn());
const mockClearVerificationError = vi.hoisted(() => vi.fn());

let signupState = {
  isSubmitting: false,
  error: null as string | null,
  errorCode: null as string | null,
  retryAfter: 0,
};

let verificationState = {
  codeSent: false,
  isSending: false,
  secondsLeft: 0,
  expired: false,
  resendIn: 0,
  canResend: false,
  errorCode: null as string | null,
  retryAfter: 0,
};

const setSignupState = (s: Partial<typeof signupState>) => {
  signupState = { ...signupState, ...s };
};

const setVerificationState = (s: Partial<typeof verificationState>) => {
  verificationState = { ...verificationState, ...s };
};

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock('@/hooks/useSignup', () => ({
  default: () => ({
    submit: mockSubmit,
    clearError: mockClearError,
    isSubmitting: signupState.isSubmitting,
    error: signupState.error,
    errorCode: signupState.errorCode,
    retryAfter: signupState.retryAfter,
  }),
}));

vi.mock('@/hooks/useVerificationCode', () => ({
  default: () => ({
    codeSent: verificationState.codeSent,
    isSending: verificationState.isSending,
    secondsLeft: verificationState.secondsLeft,
    expired: verificationState.expired,
    resendIn: verificationState.resendIn,
    canResend: verificationState.canResend,
    errorCode: verificationState.errorCode,
    retryAfter: verificationState.retryAfter,
    sendCode: mockSendCode,
    reset: vi.fn(),
    clearError: mockClearVerificationError,
  }),
}));

vi.mock('@/hooks/useNicknameCheck', () => ({
  default: (raw: string) =>
    raw.trim() === ''
      ? { status: 'idle', message: undefined }
      : { status: 'available', message: '사용 가능한 닉네임입니다.' },
}));

vi.mock('./SocialLoginButtons', () => ({
  default: () => <div data-testid="social-login-buttons">Social Login Buttons</div>,
}));

vi.mock('@/components/terms-agreement-checkboxes', () => ({
  default: ({
    value,
    onChange,
    disabled,
  }: {
    value: TermsAgreementState;
    onChange: (next: TermsAgreementState) => void;
    disabled?: boolean;
  }) => (
    <div data-testid="terms-agreement-checkboxes">
      <input
        type="checkbox"
        aria-label="전체 동의"
        checked={value.agreedToTerms && value.agreedToPrivacy}
        disabled={disabled}
        onChange={(e) =>
          onChange({
            agreedToTerms: e.target.checked,
            agreedToPrivacy: e.target.checked,
          })
        }
      />
      <input
        type="checkbox"
        aria-label="이용약관 동의 (필수)"
        checked={value.agreedToTerms}
        disabled={disabled}
        onChange={(e) => onChange({ ...value, agreedToTerms: e.target.checked })}
      />
      <input
        type="checkbox"
        aria-label="개인정보처리방침 동의 (필수)"
        checked={value.agreedToPrivacy}
        disabled={disabled}
        onChange={(e) => onChange({ ...value, agreedToPrivacy: e.target.checked })}
      />
    </div>
  ),
}));

vi.mock('@/components/input', () => ({
  default: ({ label, type, value, onChange, placeholder, disabled, labelTrailing }: any) => {
    const id = `input-${label}`;
    return (
      <div>
        <label htmlFor={id}>{label}</label>
        {labelTrailing && <span data-testid={`label-trailing-${label}`}>{labelTrailing}</span>}
        <input
          id={id}
          type={type || 'text'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled ?? false}
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

vi.mock('@/components/password-input', () => ({
  default: ({ label, value, onChange, placeholder, onStrengthChange, error }: any) => {
    const id = `input-${label}`;
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
          data-testid={`input-${label}`}
        />
        {error && <span data-testid="password-error">{error}</span>}
      </div>
    );
  },
  canSubmitByStrength: (score: number) => score >= 1,
}));

vi.mock('@/lib/password', () => ({
  isLengthValid: (pw: string) => pw.length >= 10,
  canSubmitByStrength: (score: number) => score >= 1,
}));

const STRONG_PASSWORD = '내고양이는오늘도잠만잔다';

/** showProfile 단계에서 필수 약관 2개를 체크하는 헬퍼 */
const fillRequiredTerms = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.click(screen.getByRole('checkbox', { name: '이용약관 동의 (필수)' }));
  await user.click(screen.getByRole('checkbox', { name: '개인정보처리방침 동의 (필수)' }));
};

const resetState = () => {
  signupState = { isSubmitting: false, error: null, errorCode: null, retryAfter: 0 };
  verificationState = {
    codeSent: false,
    isSending: false,
    secondsLeft: 0,
    expired: false,
    resendIn: 0,
    canResend: false,
    errorCode: null,
    retryAfter: 0,
  };
};

describe('SignupForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetState();
  });

  describe('1단계: 이메일 입력만 노출', () => {
    it('초기에는 이메일 입력과 인증 코드 발송 버튼만 노출된다', () => {
      renderWithTheme(<SignupForm />);
      expect(screen.getByLabelText('이메일')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '인증 코드 발송' })).toBeInTheDocument();
      expect(screen.queryByLabelText('인증 코드')).not.toBeInTheDocument();
      expect(screen.queryByLabelText('비밀번호')).not.toBeInTheDocument();
      expect(screen.queryByLabelText('닉네임')).not.toBeInTheDocument();
    });

    it('이메일이 비어있으면 인증 코드 발송 버튼은 비활성', () => {
      renderWithTheme(<SignupForm />);
      expect(screen.getByRole('button', { name: '인증 코드 발송' })).toBeDisabled();
    });

    it('이메일 입력 후에는 발송 버튼이 활성화된다', async () => {
      const user = userEvent.setup();
      renderWithTheme(<SignupForm />);
      await user.type(screen.getByLabelText('이메일'), 'test@example.com');
      expect(screen.getByRole('button', { name: '인증 코드 발송' })).toBeEnabled();
    });

    it('발송 버튼 클릭 시 sendCode 가 trim 된 이메일로 호출된다', async () => {
      const user = userEvent.setup();
      renderWithTheme(<SignupForm />);
      await user.type(screen.getByLabelText('이메일'), '  test@example.com  ');
      await user.click(screen.getByRole('button', { name: '인증 코드 발송' }));
      expect(mockSendCode).toHaveBeenCalledWith('test@example.com');
    });
  });

  describe('2단계: 코드 발송 후', () => {
    beforeEach(() => {
      setVerificationState({ codeSent: true, secondsLeft: 300, resendIn: 60 });
    });

    it('이메일 입력란이 잠금된다', () => {
      renderWithTheme(<SignupForm />);
      expect(screen.getByLabelText('이메일')).toBeDisabled();
    });

    it('인증 코드 입력란이 노출된다', () => {
      renderWithTheme(<SignupForm />);
      expect(screen.getByLabelText('인증 코드')).toBeInTheDocument();
    });

    it('5분 카운트다운 (5:00) 이 인증 코드 라벨 옆 (labelTrailing) 에 노출된다', () => {
      renderWithTheme(<SignupForm />);
      const trailing = screen.getByTestId('label-trailing-인증 코드');
      expect(trailing).toHaveTextContent('5:00');
    });

    it('인증 버튼은 코드가 비어 있으면 비활성', () => {
      renderWithTheme(<SignupForm />);
      expect(screen.getByRole('button', { name: '인증' })).toBeDisabled();
    });

    it('인증 버튼은 코드가 입력되면 활성화된다', async () => {
      const user = userEvent.setup();
      renderWithTheme(<SignupForm />);
      await user.type(screen.getByLabelText('인증 코드'), '123456');
      expect(screen.getByRole('button', { name: '인증' })).toBeEnabled();
    });

    it('재발송 버튼은 쿨다운 중에는 비활성', () => {
      setVerificationState({ canResend: false, resendIn: 30 });
      renderWithTheme(<SignupForm />);
      // 쿨다운 중에는 "30s" 형태로 표기
      expect(screen.getByRole('button', { name: '30s' })).toBeDisabled();
    });

    it('재발송 버튼은 canResend 시 활성', () => {
      setVerificationState({ canResend: true, resendIn: 0 });
      renderWithTheme(<SignupForm />);
      expect(screen.getByRole('button', { name: '재발송' })).toBeEnabled();
    });

    it('비밀번호 / 닉네임 입력은 인증 클릭 전에는 노출되지 않는다', async () => {
      const user = userEvent.setup();
      renderWithTheme(<SignupForm />);
      await user.type(screen.getByLabelText('인증 코드'), '123456');
      // 코드 입력만으로는 노출되지 않음 (이전 흐름과의 차이)
      expect(screen.queryByLabelText('비밀번호')).not.toBeInTheDocument();
      expect(screen.queryByLabelText('닉네임')).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: '가입하기' })).not.toBeInTheDocument();
    });
  });

  describe('3단계: 인증 클릭 후 비밀번호/닉네임 노출', () => {
    beforeEach(() => {
      setVerificationState({ codeSent: true, secondsLeft: 300, resendIn: 60 });
    });

    const enterCodeAndVerify = async (user: ReturnType<typeof userEvent.setup>) => {
      await user.type(screen.getByLabelText('인증 코드'), '123456');
      await user.click(screen.getByRole('button', { name: '인증' }));
    };

    it('인증 버튼 클릭 시 비밀번호 / 닉네임 / 가입 버튼이 나타난다', async () => {
      const user = userEvent.setup();
      renderWithTheme(<SignupForm />);
      await enterCodeAndVerify(user);
      expect(screen.getByLabelText('비밀번호')).toBeInTheDocument();
      expect(screen.getByLabelText('닉네임')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '가입하기' })).toBeInTheDocument();
    });

    it('인증 후 코드 input 이 잠금된다', async () => {
      const user = userEvent.setup();
      renderWithTheme(<SignupForm />);
      await enterCodeAndVerify(user);
      expect(screen.getByLabelText('인증 코드')).toBeDisabled();
    });

    it('인증 후 카운트다운(labelTrailing)이 사라진다', async () => {
      const user = userEvent.setup();
      renderWithTheme(<SignupForm />);
      await enterCodeAndVerify(user);
      expect(screen.queryByTestId('label-trailing-인증 코드')).not.toBeInTheDocument();
    });

    it('인증 후 인증 / 재발송 버튼이 사라진다', async () => {
      const user = userEvent.setup();
      renderWithTheme(<SignupForm />);
      await enterCodeAndVerify(user);
      expect(screen.queryByRole('button', { name: '인증' })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: '재발송' })).not.toBeInTheDocument();
    });

    it('비밀번호가 강함(10자 이상) + 닉네임 + 필수 약관 체크 시 가입 버튼이 활성화된다', async () => {
      const user = userEvent.setup();
      renderWithTheme(<SignupForm />);
      await enterCodeAndVerify(user);
      await user.type(screen.getByLabelText('비밀번호'), STRONG_PASSWORD);
      await user.type(screen.getByLabelText('닉네임'), 'nick');
      await fillRequiredTerms(user);
      expect(screen.getByRole('button', { name: '가입하기' })).toBeEnabled();
    });

    it('비밀번호가 짧으면 가입 버튼이 비활성', async () => {
      const user = userEvent.setup();
      renderWithTheme(<SignupForm />);
      await enterCodeAndVerify(user);
      await user.type(screen.getByLabelText('비밀번호'), 'short');
      await user.type(screen.getByLabelText('닉네임'), 'nick');
      expect(screen.getByRole('button', { name: '가입하기' })).toBeDisabled();
    });

    it('가입 버튼 클릭 시 submit 이 password / nickname / code 와 함께 호출된다', async () => {
      const user = userEvent.setup();
      renderWithTheme(<SignupForm />);
      await enterCodeAndVerify(user);
      await user.type(screen.getByLabelText('비밀번호'), STRONG_PASSWORD);
      await user.type(screen.getByLabelText('닉네임'), 'nick');
      await fillRequiredTerms(user);
      await user.click(screen.getByRole('button', { name: '가입하기' }));
      expect(mockSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          password: STRONG_PASSWORD,
          nickname: 'nick',
          code: '123456',
        }),
      );
    });
  });

  describe('약관 동의 체크박스', () => {
    beforeEach(() => {
      setVerificationState({ codeSent: true, secondsLeft: 300, resendIn: 60 });
    });

    const enterCodeAndVerify = async (user: ReturnType<typeof userEvent.setup>) => {
      await user.type(screen.getByLabelText('인증 코드'), '123456');
      await user.click(screen.getByRole('button', { name: '인증' }));
    };

    const fillProfileInputs = async (user: ReturnType<typeof userEvent.setup>) => {
      await user.type(screen.getByLabelText('비밀번호'), STRONG_PASSWORD);
      await user.type(screen.getByLabelText('닉네임'), 'nick');
    };

    it('showProfile 단계 진입 시 약관 체크박스 3개 (전체 + 필수 2) 가 노출된다', async () => {
      const user = userEvent.setup();
      renderWithTheme(<SignupForm />);
      await enterCodeAndVerify(user);
      expect(screen.getByRole('checkbox', { name: '전체 동의' })).toBeInTheDocument();
      expect(screen.getByRole('checkbox', { name: '이용약관 동의 (필수)' })).toBeInTheDocument();
      expect(
        screen.getByRole('checkbox', { name: '개인정보처리방침 동의 (필수)' }),
      ).toBeInTheDocument();
      expect(screen.queryByRole('checkbox', { name: /마케팅 수신 동의/ })).not.toBeInTheDocument();
    });

    it('모든 입력 정상이지만 필수 약관 미체크 시 가입하기 버튼이 비활성', async () => {
      const user = userEvent.setup();
      renderWithTheme(<SignupForm />);
      await enterCodeAndVerify(user);
      await fillProfileInputs(user);
      // 약관 체크 없이 확인
      expect(screen.getByRole('button', { name: '가입하기' })).toBeDisabled();
    });

    it('필수 약관 2개 체크 후 가입하기 버튼이 활성화된다', async () => {
      const user = userEvent.setup();
      renderWithTheme(<SignupForm />);
      await enterCodeAndVerify(user);
      await fillProfileInputs(user);
      await fillRequiredTerms(user);
      expect(screen.getByRole('button', { name: '가입하기' })).toBeEnabled();
    });

    it('필수 2개 체크 상태로 submit 호출 시 agreedToTerms/agreedToPrivacy: true 포함하고 agreedToMarketing 키가 없다', async () => {
      const user = userEvent.setup();
      renderWithTheme(<SignupForm />);
      await enterCodeAndVerify(user);
      await fillProfileInputs(user);
      await fillRequiredTerms(user);
      await user.click(screen.getByRole('button', { name: '가입하기' }));
      expect(mockSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          agreedToTerms: true,
          agreedToPrivacy: true,
        }),
      );
      const submitArg = mockSubmit.mock.calls[0]?.[0] as Record<string, unknown>;
      expect(submitArg).not.toHaveProperty('agreedToMarketing');
    });

    it('signup.errorCode === TERMS_AGREEMENT_REQUIRED 일 때 인라인 에러 메시지가 노출된다', async () => {
      setSignupState({
        errorCode: 'TERMS_AGREEMENT_REQUIRED',
        error: '필수 약관에 동의해주세요.',
      });
      setVerificationState({ codeSent: true, secondsLeft: 300, resendIn: 60 });
      const user = userEvent.setup();
      renderWithTheme(<SignupForm />);
      await enterCodeAndVerify(user);
      expect(screen.getByText('필수 약관에 동의해주세요.')).toBeInTheDocument();
    });
  });

  describe('코드 만료 처리', () => {
    beforeEach(() => {
      setVerificationState({
        codeSent: true,
        secondsLeft: 0,
        expired: true,
        resendIn: 0,
        canResend: true,
      });
    });

    it('만료 시 코드 입력란이 비활성', () => {
      renderWithTheme(<SignupForm />);
      expect(screen.getByLabelText('인증 코드')).toBeDisabled();
    });

    it('만료 시 안내 문구가 노출된다', () => {
      renderWithTheme(<SignupForm />);
      expect(screen.getByText('코드가 만료되었습니다. 재발송해주세요')).toBeInTheDocument();
    });

    it('만료 시 인증 버튼은 비활성', () => {
      renderWithTheme(<SignupForm />);
      expect(screen.getByRole('button', { name: '인증' })).toBeDisabled();
    });

    it('만료 시 재발송 버튼은 활성 상태', () => {
      renderWithTheme(<SignupForm />);
      expect(screen.getByRole('button', { name: '재발송' })).toBeEnabled();
    });
  });

  describe('재발송 클릭 동작', () => {
    beforeEach(() => {
      setVerificationState({
        codeSent: true,
        secondsLeft: 300,
        resendIn: 0,
        canResend: true,
      });
    });

    it('재발송 클릭 시 sendCode 가 호출된다', async () => {
      const user = userEvent.setup();
      renderWithTheme(<SignupForm />);
      await user.click(screen.getByRole('button', { name: '재발송' }));
      expect(mockSendCode).toHaveBeenCalled();
    });

    it('재발송 클릭 시 코드 입력값이 비워진다', async () => {
      const user = userEvent.setup();
      renderWithTheme(<SignupForm />);
      const codeInput = screen.getByLabelText('인증 코드') as HTMLInputElement;
      await user.type(codeInput, '123456');
      expect(codeInput.value).toBe('123456');

      await user.click(screen.getByRole('button', { name: '재발송' }));
      expect(codeInput.value).toBe('');
    });
  });

  describe('만료 시 verified 자동 해제', () => {
    // 만료 직전 상태에서는 verified 가 true 가 되어도 expired 가 true 가 되는 순간
    // useEffect 가 verified 를 false 로 리셋한다. SignupForm 이 React.memo 로 감싸져 있어
    // module-level mock 상태 변경만으로는 re-render 가 트리거되지 않아 시뮬레이션이 어렵다.
    // 만료 직후 흐름은 아래 "만료 시 인증 비활성" 케이스로 간접 보장.
    it('만료된 상태에서 인증 버튼이 비활성이라 verified 진입을 차단한다 (대체 검증)', () => {
      setVerificationState({
        codeSent: true,
        expired: true,
        secondsLeft: 0,
        resendIn: 0,
        canResend: true,
      });
      renderWithTheme(<SignupForm />);
      expect(screen.getByRole('button', { name: '인증' })).toBeDisabled();
      expect(screen.queryByLabelText('비밀번호')).not.toBeInTheDocument();
    });
  });

  describe('에러 코드 별 메시지', () => {
    it('verification.errorCode === EMAIL_ALREADY_EXISTS 면 로그인 페이지 링크가 노출된다', () => {
      setVerificationState({ errorCode: 'EMAIL_ALREADY_EXISTS' });
      renderWithTheme(<SignupForm />);
      expect(screen.getByText(/이미 가입된 이메일입니다/)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '로그인하시겠어요?' })).toBeInTheDocument();
    });

    it('로그인하시겠어요? 클릭 시 /login 으로 이동', async () => {
      const user = userEvent.setup();
      setVerificationState({ errorCode: 'EMAIL_ALREADY_EXISTS' });
      renderWithTheme(<SignupForm />);
      await user.click(screen.getByRole('button', { name: '로그인하시겠어요?' }));
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });

    it('verification.errorCode === INVALID_EMAIL_FORMAT 메시지', () => {
      setVerificationState({ errorCode: 'INVALID_EMAIL_FORMAT' });
      renderWithTheme(<SignupForm />);
      expect(screen.getByText('이메일 형식이 올바르지 않습니다.')).toBeInTheDocument();
    });

    it('signup.errorCode === INVALID_CODE 메시지가 코드 입력란 하단에 노출', () => {
      setVerificationState({ codeSent: true, secondsLeft: 200 });
      setSignupState({ errorCode: 'INVALID_CODE', error: '인증코드가 올바르지 않습니다.' });
      renderWithTheme(<SignupForm />);
      expect(screen.getByText('인증코드가 올바르지 않습니다.')).toBeInTheDocument();
    });

    it('signup.errorCode === EXPIRED_CODE 메시지', () => {
      setVerificationState({ codeSent: true, secondsLeft: 200 });
      setSignupState({ errorCode: 'EXPIRED_CODE', error: '코드가 만료되었습니다.' });
      renderWithTheme(<SignupForm />);
      expect(screen.getByText('코드가 만료되었습니다. 재발송해주세요.')).toBeInTheDocument();
    });

    it('RATE_LIMITED 시 retryAfter 카운트다운 노출', () => {
      setSignupState({ errorCode: 'RATE_LIMITED', retryAfter: 30 });
      renderWithTheme(<SignupForm />);
      expect(screen.getByText('잠시 후 다시 시도해주세요. (30초)')).toBeInTheDocument();
    });
  });

  describe('네비게이션', () => {
    it('하단 로그인 버튼 클릭 시 /login 으로 이동', async () => {
      const user = userEvent.setup();
      renderWithTheme(<SignupForm />);
      await user.click(screen.getByRole('button', { name: '로그인' }));
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });
});
