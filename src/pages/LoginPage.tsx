import { memo } from 'react';
import { useSearchParams } from 'react-router-dom';
import LoginForm from '@/features/auth/LoginForm';
import { pageWrapperStyle } from '@/styles/layout';
import { errorBannerStyle } from './LoginPage.style';

const OAUTH_ERROR_MESSAGES: Record<string, string> = {
  oauth2_failed: '소셜 로그인에 실패했습니다. 다시 시도해주세요.',
};

const LoginPage = memo(() => {
  const [searchParams] = useSearchParams();
  const errorCode = searchParams.get('error');
  const errorMessage = errorCode ? OAUTH_ERROR_MESSAGES[errorCode] : null;

  return (
    <div css={pageWrapperStyle()}>
      {errorMessage && (
        <div css={errorBannerStyle} role="alert">
          {errorMessage}
        </div>
      )}
      <LoginForm />
    </div>
  );
});

LoginPage.displayName = 'LoginPage';
export default LoginPage;
