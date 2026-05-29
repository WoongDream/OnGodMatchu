import { memo } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useAuthStore from '@/store/authStore';

type Props = {
  children: React.ReactNode;
};

// 비로그인 사용자 전용 라우트(로그인/회원가입). 이미 로그인한 사용자는 프로필로 돌려보낸다.
const GuestOnlyRoute = memo(({ children }: Props) => {
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const status = useAuthStore((state) => state.status);
  const location = useLocation();

  // 복원 중에는 판단 보류 (로그인 폼이 잠깐 노출됐다가 redirect 되는 깜빡임 방지).
  if (status === 'bootstrapping') {
    return null;
  }

  if (isLoggedIn) {
    const from = (location.state as { from?: string } | null)?.from;
    return <Navigate to={from ?? '/profile'} replace />;
  }

  return <>{children}</>;
});

GuestOnlyRoute.displayName = 'GuestOnlyRoute';
export default GuestOnlyRoute;
