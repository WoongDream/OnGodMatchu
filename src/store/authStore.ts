import { create } from 'zustand';
import type { User } from '../types';

// 'bootstrapping' = 저장된 토큰으로 사용자 복원(getMe) 진행 중. 가드는 이 동안 redirect 를 보류한다.
type AuthStatus = 'bootstrapping' | 'ready';

type AuthStore = {
  user: User | null;
  isLoggedIn: boolean;
  status: AuthStatus;
  setUser: (user: User) => void;
  logout: () => void;
  finishBootstrap: () => void;
};

// 첫 렌더 시점에 동기로 알 수 있어야 ProtectedRoute 가 복원 전 조기 redirect 를 피한다.
const hasStoredToken = (): boolean => Boolean(localStorage.getItem('accessToken'));

const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isLoggedIn: false,
  status: hasStoredToken() ? 'bootstrapping' : 'ready',
  setUser: (user) => set({ user, isLoggedIn: true, status: 'ready' }),
  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    set({ user: null, isLoggedIn: false, status: 'ready' });
  },
  finishBootstrap: () => set({ status: 'ready' }),
}));

export default useAuthStore;
