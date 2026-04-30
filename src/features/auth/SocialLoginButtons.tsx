import { memo } from 'react';
import {
  SocialWrapper,
  Divider,
  DividerText,
  SocialButton,
  ConsentNotice,
  ConsentLink,
} from './SocialLoginButtons.style';
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
      <ConsentNotice>
        로그인 시 <ConsentLink to="/terms">이용약관</ConsentLink> 및{' '}
        <ConsentLink to="/privacy">개인정보처리방침</ConsentLink>에 동의하는 것으로 간주됩니다.
      </ConsentNotice>
    </SocialWrapper>
  );
});

SocialLoginButtons.displayName = 'SocialLoginButtons';
export default SocialLoginButtons;
