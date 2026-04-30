import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { signup, verifyEmail } from '@/api/auth';

export type SignupErrorCode = 'BREACH' | 'POLICY' | 'CONFLICT' | 'NETWORK' | null;

type UseSignupReturn = {
  handleSendCode: (email: string, nickname: string, password: string) => Promise<void>;
  handleVerify: (email: string, code: string) => Promise<void>;
  clearError: () => void;
  isSending: boolean;
  isVerifying: boolean;
  emailSent: boolean;
  error: string | null;
  signupErrorCode: SignupErrorCode;
};

const resolveSignupError = (err: unknown): { code: SignupErrorCode; message: string } => {
  if (axios.isAxiosError(err)) {
    const status = err.response?.status;
    if (status === 422) {
      return {
        code: 'BREACH',
        message: '이 비밀번호는 외부 유출 이력이 있어요. 다른 비밀번호를 사용해주세요.',
      };
    }
    if (status === 400) {
      return { code: 'POLICY', message: '비밀번호가 정책에 맞지 않습니다. 다시 확인해주세요.' };
    }
    if (status === 409) {
      return { code: 'CONFLICT', message: '이미 가입된 이메일일 수 있습니다.' };
    }
  }
  return { code: 'NETWORK', message: '회원가입 요청에 실패했습니다.' };
};

const useSignup = (): UseSignupReturn => {
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [signupErrorCode, setSignupErrorCode] = useState<SignupErrorCode>(null);
  const navigate = useNavigate();

  const clearError = () => {
    setError(null);
    setSignupErrorCode(null);
  };

  const handleSendCode = async (email: string, nickname: string, password: string) => {
    setIsSending(true);
    clearError();
    try {
      await signup(email, nickname, password);
      setEmailSent(true);
    } catch (err) {
      const { code, message } = resolveSignupError(err);
      setSignupErrorCode(code);
      setError(message);
    } finally {
      setIsSending(false);
    }
  };

  const handleVerify = async (email: string, code: string) => {
    setIsVerifying(true);
    setError(null);
    try {
      await verifyEmail(email, code);
      navigate('/login');
    } catch {
      setError('인증 코드가 올바르지 않습니다.');
    } finally {
      setIsVerifying(false);
    }
  };

  return {
    handleSendCode,
    handleVerify,
    clearError,
    isSending,
    isVerifying,
    emailSent,
    error,
    signupErrorCode,
  };
};

export default useSignup;
