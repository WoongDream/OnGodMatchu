import { memo } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useAuthStore from '@/store/authStore';

type Props = {
  children: React.ReactNode;
};

const ProtectedRoute = memo(({ children }: Props) => {
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const status = useAuthStore((state) => state.status);
  const location = useLocation();

  // 토큰으로 사용자 복원 중이면 판단을 보류한다. 여기서 redirect 하면
  // 새로고침 시 인증 상태 복원 전에 /login 으로 튕긴다.
  if (status === 'bootstrapping') {
    return null;
  }

  if (!isLoggedIn) {
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  }

  return <>{children}</>;
});

ProtectedRoute.displayName = 'ProtectedRoute';
export default ProtectedRoute;
