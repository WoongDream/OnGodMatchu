import { memo } from 'react';
import { Navigate } from 'react-router-dom';
import useAuthStore from '@/store/authStore';

type Props = {
  children: React.ReactNode;
};

const ProtectedRoute = memo(({ children }: Props) => {
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
});

ProtectedRoute.displayName = 'ProtectedRoute';
export default ProtectedRoute;
