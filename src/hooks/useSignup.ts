import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { signup } from '@/api/auth';
import { setAuthSession } from '@/lib/auth';

export type SignupErrorCode =
  | 'BREACH'
  | 'POLICY'
  | 'INVALID_CODE'
  | 'EXPIRED_CODE'
  | 'EMAIL_ALREADY_EXISTS'
  | 'INVALID_EMAIL_FORMAT'
  | 'RATE_LIMITED'
  | 'NICKNAME_TAKEN'
  | 'TERMS_AGREEMENT_REQUIRED'
  | 'NETWORK'
  | null;

const ERROR_MESSAGES: Record<Exclude<SignupErrorCode, null>, string> = {
  BREACH: '이 비밀번호는 외부 유출 이력이 있어요. 다른 비밀번호를 사용해주세요.',
  POLICY: '비밀번호가 정책에 맞지 않습니다. 다시 확인해주세요.',
  INVALID_CODE: '인증코드가 올바르지 않습니다.',
  EXPIRED_CODE: '코드가 만료되었습니다. 재발송해주세요.',
  EMAIL_ALREADY_EXISTS: '이미 가입된 이메일입니다. 로그인하시겠어요?',
  INVALID_EMAIL_FORMAT: '이메일 형식이 올바르지 않습니다.',
  RATE_LIMITED: '잠시 후 다시 시도해주세요.',
  NICKNAME_TAKEN: '이미 사용 중인 닉네임입니다.',
  TERMS_AGREEMENT_REQUIRED: '필수 약관에 동의해야 합니다.',
  NETWORK: '회원가입 요청에 실패했습니다.',
};

type SignupErrorBody = {
  error?: { code?: string; retryAfter?: number };
};

type Resolved = {
  code: Exclude<SignupErrorCode, null>;
  message: string;
  retryAfter: number;
};

const resolveSignupError = (err: unknown): Resolved => {
  if (axios.isAxiosError(err)) {
    const status = err.response?.status;
    const body = err.response?.data as SignupErrorBody | undefined;
    const apiCode = body?.error?.code;
    const retryAfter = body?.error?.retryAfter ?? 0;

    const direct: SignupErrorCode | undefined = (() => {
      switch (apiCode) {
        case 'INVALID_CODE':
          return 'INVALID_CODE';
        case 'EXPIRED_CODE':
          return 'EXPIRED_CODE';
        case 'EMAIL_ALREADY_EXISTS':
          return 'EMAIL_ALREADY_EXISTS';
        case 'INVALID_EMAIL_FORMAT':
          return 'INVALID_EMAIL_FORMAT';
        case 'RATE_LIMITED':
          return 'RATE_LIMITED';
        case 'NICKNAME_ALREADY_EXISTS':
          return 'NICKNAME_TAKEN';
        case 'TERMS_AGREEMENT_REQUIRED':
          return 'TERMS_AGREEMENT_REQUIRED';
        default:
          return undefined;
      }
    })();
    if (direct) {
      return { code: direct, message: ERROR_MESSAGES[direct], retryAfter };
    }

    if (status === 429) {
      return { code: 'RATE_LIMITED', message: ERROR_MESSAGES.RATE_LIMITED, retryAfter };
    }
    if (status === 422) {
      return { code: 'BREACH', message: ERROR_MESSAGES.BREACH, retryAfter: 0 };
    }
    if (status === 400) {
      return { code: 'POLICY', message: ERROR_MESSAGES.POLICY, retryAfter: 0 };
    }
    if (status === 409) {
      return {
        code: 'EMAIL_ALREADY_EXISTS',
        message: ERROR_MESSAGES.EMAIL_ALREADY_EXISTS,
        retryAfter: 0,
      };
    }
  }
  return { code: 'NETWORK', message: ERROR_MESSAGES.NETWORK, retryAfter: 0 };
};

type SignupParams = {
  email: string;
  password: string;
  nickname: string;
  code: string;
  agreedToTerms: boolean;
  agreedToPrivacy: boolean;
  agreedToAge14: boolean;
};

type UseSignupReturn = {
  submit: (params: SignupParams) => Promise<boolean>;
  clearError: () => void;
  isSubmitting: boolean;
  error: string | null;
  errorCode: SignupErrorCode;
  retryAfter: number;
};

const useSignup = (): UseSignupReturn => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<SignupErrorCode>(null);
  const [retryAfter, setRetryAfter] = useState(0);
  const navigate = useNavigate();

  const clearError = useCallback(() => {
    setError(null);
    setErrorCode(null);
    setRetryAfter(0);
  }, []);

  const submit = useCallback(
    async (params: SignupParams): Promise<boolean> => {
      setIsSubmitting(true);
      setError(null);
      setErrorCode(null);
      setRetryAfter(0);
      try {
        const tokens = await signup(params);
        await setAuthSession(tokens);
        navigate('/');
        return true;
      } catch (err) {
        const resolved = resolveSignupError(err);
        setErrorCode(resolved.code);
        setError(resolved.message);
        setRetryAfter(resolved.retryAfter);
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [navigate],
  );

  return {
    submit,
    clearError,
    isSubmitting,
    error,
    errorCode,
    retryAfter,
  };
};

export default useSignup;
