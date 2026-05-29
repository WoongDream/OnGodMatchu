import { memo } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import useAuthStore from '@/store/authStore';

const TERMS_GATE_WHITELIST = ['/terms-agreement', '/terms', '/privacy'];

const TermsAgreementGate = memo(() => {
  const user = useAuthStore((state) => state.user);
  const { pathname } = useLocation();

  if (
    user?.needsTermsAgreement === true &&
    !TERMS_GATE_WHITELIST.some((p) => pathname.startsWith(p))
  ) {
    return <Navigate to="/terms-agreement" replace />;
  }

  return <Outlet />;
});

TermsAgreementGate.displayName = 'TermsAgreementGate';
export default TermsAgreementGate;
