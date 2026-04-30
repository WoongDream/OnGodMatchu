import { memo } from 'react';
import { SocialWrapper, Divider, DividerText, SocialButton } from './SocialLoginButtons.style';
import { buildOAuthAuthorizationUrl } from '@/api/oauth';
import type { OAuthProvider } from '@/types';

const SocialLoginButtons = memo(() => {
  const handleSocialLogin = (provider: OAuthProvider) => {
    window.location.href = buildOAuthAuthorizationUrl(provider);
  };

  return (
    <SocialWrapper>
      <Divider>
        <DividerText>또는</DividerText>
      </Divider>
      <SocialButton type="button" $provider="google" onClick={() => handleSocialLogin('google')}>
        Google로 계속하기
      </SocialButton>
      <SocialButton type="button" $provider="naver" onClick={() => handleSocialLogin('naver')}>
        네이버로 계속하기
      </SocialButton>
      <SocialButton type="button" $provider="kakao" onClick={() => handleSocialLogin('kakao')}>
        카카오로 계속하기
      </SocialButton>
    </SocialWrapper>
  );
});

SocialLoginButtons.displayName = 'SocialLoginButtons';
export default SocialLoginButtons;
