import { memo } from 'react';
import OAuthCallbackStatus from '@/features/auth/OAuthCallbackStatus';
import useOAuthCallback from '@/hooks/useOAuthCallback';
import { pageWrapperStyle } from '@/styles/layout';

const OAuthCallbackPage = memo(() => {
  const { error } = useOAuthCallback();

  return (
    <div css={pageWrapperStyle()}>
      <OAuthCallbackStatus error={error} />
    </div>
  );
});

OAuthCallbackPage.displayName = 'OAuthCallbackPage';
export default OAuthCallbackPage;
