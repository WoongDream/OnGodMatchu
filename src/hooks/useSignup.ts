import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signup, verifyEmail } from '@/api/auth';

type UseSignupReturn = {
  handleSendCode: (email: string, nickname: string, password: string) => Promise<void>;
  handleVerify: (email: string, code: string) => Promise<void>;
  isSending: boolean;
  isVerifying: boolean;
  emailSent: boolean;
  error: string | null;
};

const useSignup = (): UseSignupReturn => {
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSendCode = async (email: string, nickname: string, password: string) => {
    setIsSending(true);
    setError(null);
    try {
      await signup(email, nickname, password);
      setEmailSent(true);
    } catch {
      setError('회원가입 요청에 실패했습니다. 이미 가입된 이메일일 수 있습니다.');
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

  return { handleSendCode, handleVerify, isSending, isVerifying, emailSent, error };
};

export default useSignup;
