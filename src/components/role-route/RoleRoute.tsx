import { memo } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useAuthStore from '@/store/authStore';
import { hasRole } from '@/lib/auth/role';
import type { Role } from '@/types';

type Props = {
  /** 최소 요구 역할 (USER < ADMIN < OWNER). */
  min: Role;
  children: React.ReactNode;
};

/**
 * 역할 기반 라우트 가드. 복원 중에는 판단 보류, 미인증이면 /login, 역할 미달이면 홈으로 redirect.
 * UI 게이트일 뿐 실제 권한 검증은 BE 가 담당한다.
 */
const RoleRoute = memo(({ min, children }: Props) => {
  const user = useAuthStore((state) => state.user);
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const status = useAuthStore((state) => state.status);
  const location = useLocation();

  if (status === 'bootstrapping') {
    return null;
  }
  if (!isLoggedIn) {
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  }
  if (!hasRole(user, min)) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
});

RoleRoute.displayName = 'RoleRoute';
export default RoleRoute;
