import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { login } from '@/api/auth';
import { setAuthSession } from '@/lib/auth';

type UseLoginReturn = {
  handleLogin: (email: string, password: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
};

const useLogin = (): UseLoginReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogin = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const tokens = await login(email, password);
      await setAuthSession(tokens);
      // 보호 페이지에서 로그인으로 튕겨온 경우 그 경로로 복귀, 없으면 메인.
      const from = (location.state as { from?: string } | null)?.from;
      navigate(from ?? '/', { replace: true });
    } catch {
      setError('이메일 또는 비밀번호가 올바르지 않습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return { handleLogin, isLoading, error };
};

export default useLogin;
