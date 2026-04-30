import { memo } from 'react';
import { useSearchParams } from 'react-router-dom';
import LoginForm from '@/features/auth/LoginForm';
import { PageWrapper } from '@/styles/layout';
import { ErrorBanner } from './LoginPage.style';

const OAUTH_ERROR_MESSAGES: Record<string, string> = {
  oauth2_failed: '소셜 로그인에 실패했습니다. 다시 시도해주세요.',
};

const LoginPage = memo(() => {
  const [searchParams] = useSearchParams();
  const errorCode = searchParams.get('error');
  const errorMessage = errorCode ? OAUTH_ERROR_MESSAGES[errorCode] : null;

  return (
    <PageWrapper>
      {errorMessage && <ErrorBanner role="alert">{errorMessage}</ErrorBanner>}
      <LoginForm />
    </PageWrapper>
  );
});

LoginPage.displayName = 'LoginPage';
export default LoginPage;
