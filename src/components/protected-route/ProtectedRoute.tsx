import { memo } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useAuthStore from '@/store/authStore';

type Props = {
  children: React.ReactNode;
};

const TERMS_GATE_WHITELIST = ['/terms-agreement', '/terms', '/privacy'];

const ProtectedRoute = memo(({ children }: Props) => {
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const user = useAuthStore((state) => state.user);
  const { pathname } = useLocation();

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  if (
    user?.needsTermsAgreement === true &&
    !TERMS_GATE_WHITELIST.some((p) => pathname.startsWith(p))
  ) {
    return <Navigate to="/terms-agreement" replace />;
  }

  return <>{children}</>;
});

ProtectedRoute.displayName = 'ProtectedRoute';
export default ProtectedRoute;
