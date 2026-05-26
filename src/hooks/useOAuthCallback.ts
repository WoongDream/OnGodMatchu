import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { clearAuthSession, setAuthSession } from '@/lib/auth';

type UseOAuthCallbackReturn = {
  error: string | null;
};

const useOAuthCallback = (): UseOAuthCallbackReturn => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [fetchError, setFetchError] = useState<string | null>(null);

  const accessToken = searchParams.get('accessToken');
  const refreshToken = searchParams.get('refreshToken');
  const tokensMissing = !accessToken || !refreshToken;

  useEffect(() => {
    if (tokensMissing) {
      const t = setTimeout(() => navigate('/login', { replace: true }), 1500);
      return () => clearTimeout(t);
    }

    let cancelled = false;
    setAuthSession({ accessToken, refreshToken })
      .then((user) => {
        if (cancelled) {
          return;
        }
        const next = user.needsTermsAgreement === true ? '/terms-agreement' : '/';
        navigate(next, { replace: true });
      })
      .catch(() => {
        if (cancelled) {
          return;
        }
        clearAuthSession();
        setFetchError('사용자 정보를 불러오지 못했습니다.');
        setTimeout(() => navigate('/login', { replace: true }), 1500);
      });

    return () => {
      cancelled = true;
    };
  }, [tokensMissing, accessToken, refreshToken, navigate]);

  const error = tokensMissing ? '인증 정보가 누락되었습니다.' : fetchError;

  return { error };
};

export default useOAuthCallback;
