import { useEffect } from 'react';
import useAuthStore from '@/store/authStore';
import { getMe } from '@/api/auth';

const useBootstrapAuth = () => {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const finishBootstrap = useAuthStore((s) => s.finishBootstrap);

  useEffect(() => {
    if (user) {
      return;
    }
    const token = localStorage.getItem('accessToken');
    if (!token) {
      // 토큰이 없으면 store 가 이미 'ready' 로 초기화돼 있어 별도 처리 불필요.
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
      })
      .finally(() => {
        if (!cancelled) {
          // 성공 시 setUser 가 이미 ready 로 전환하지만, 실패 케이스를 위해 보장한다.
          finishBootstrap();
        }
      });
    return () => {
      cancelled = true;
    };
  }, [user, setUser, finishBootstrap]);
};

export default useBootstrapAuth;
