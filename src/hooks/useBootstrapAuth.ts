import { useEffect } from 'react';
import useAuthStore from '@/store/authStore';
import { getMe } from '@/api/auth';

const useBootstrapAuth = () => {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);

  useEffect(() => {
    if (user) {
      return;
    }
    const token = localStorage.getItem('accessToken');
    if (!token) {
      return;
    }
    let cancelled = false;
    getMe()
      .then((me) => {
        if (!cancelled) {
          setUser(me);
        }
      })
      .catch(() => {
        // 401 은 axios 인터셉터의 refresh 흐름이 처리. 그 외 실패 시 미로그인 상태 유지.
      });
    return () => {
      cancelled = true;
    };
  }, [user, setUser]);
};

export default useBootstrapAuth;
