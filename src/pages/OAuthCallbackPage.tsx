import { memo } from 'react';
import OAuthCallbackStatus from '@/features/auth/OAuthCallbackStatus';
import useOAuthCallback from '@/hooks/useOAuthCallback';
import { PageWrapper } from '@/styles/layout';

const OAuthCallbackPage = memo(() => {
  const { error } = useOAuthCallback();

  return (
    <PageWrapper>
      <OAuthCallbackStatus error={error} />
    </PageWrapper>
  );
});

OAuthCallbackPage.displayName = 'OAuthCallbackPage';
export default OAuthCallbackPage;
