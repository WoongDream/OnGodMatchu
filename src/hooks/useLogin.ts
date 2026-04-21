import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, getMe } from '@/api/auth';
import useAuthStore from '@/store/authStore';

type UseLoginReturn = {
  handleLogin: (email: string, password: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
};

const useLogin = (): UseLoginReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const setUser = useAuthStore((s) => s.setUser);

  const handleLogin = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const { accessToken, refreshToken } = await login(email, password);
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      const user = await getMe();
      setUser(user);
      navigate('/');
    } catch {
      setError('이메일 또는 비밀번호가 올바르지 않습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return { handleLogin, isLoading, error };
};

export default useLogin;
