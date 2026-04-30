import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getMe } from '@/api/auth';
import useAuthStore from '@/store/authStore';

type UseOAuthCallbackReturn = {
  error: string | null;
};

const useOAuthCallback = (): UseOAuthCallbackReturn => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const setUser = useAuthStore((s) => s.setUser);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const accessToken = searchParams.get('accessToken');
  const refreshToken = searchParams.get('refreshToken');
  const tokensMissing = !accessToken || !refreshToken;

  useEffect(() => {
    if (tokensMissing) {
      const t = setTimeout(() => navigate('/login', { replace: true }), 1500);
      return () => clearTimeout(t);
    }

    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);

    let cancelled = false;
    getMe()
      .then((user) => {
        if (cancelled) {
          return;
        }
        setUser(user);
        navigate('/', { replace: true });
      })
      .catch(() => {
        if (cancelled) {
          return;
        }
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        setFetchError('사용자 정보를 불러오지 못했습니다.');
        setTimeout(() => navigate('/login', { replace: true }), 1500);
      });

    return () => {
      cancelled = true;
    };
  }, [tokensMissing, accessToken, refreshToken, navigate, setUser]);

  const error = tokensMissing ? '인증 정보가 누락되었습니다.' : fetchError;

  return { error };
};

export default useOAuthCallback;
