import { memo } from 'react';
import { Link } from 'react-router-dom';
import {
  wrapperStyle,
  dividerStyle,
  dividerTextStyle,
  socialButtonStyle,
  consentNoticeStyle,
  consentLinkStyle,
} from './SocialLoginButtons.style';
import { buildOAuthAuthorizationUrl } from '@/api/oauth';
import type { OAuthProvider } from '@/types';

const SocialLoginButtons = memo(() => {
  const handleSocialLogin = (provider: OAuthProvider) => {
    window.location.href = buildOAuthAuthorizationUrl(provider);
  };

  return (
    <div css={wrapperStyle}>
      <div css={dividerStyle}>
        <span css={dividerTextStyle}>또는</span>
      </div>
      <button
        type="button"
        css={socialButtonStyle('google')}
        onClick={() => handleSocialLogin('google')}
      >
        Google로 계속하기
      </button>
      <button
        type="button"
        css={socialButtonStyle('naver')}
        onClick={() => handleSocialLogin('naver')}
      >
        네이버로 계속하기
      </button>
      <p css={consentNoticeStyle}>
        로그인 시{' '}
        <Link to="/terms" css={consentLinkStyle}>
          이용약관
        </Link>{' '}
        및{' '}
        <Link to="/privacy" css={consentLinkStyle}>
          개인정보처리방침
        </Link>
        에 동의하는 것으로 간주됩니다.
      </p>
    </div>
  );
});

SocialLoginButtons.displayName = 'SocialLoginButtons';
export default SocialLoginButtons;
