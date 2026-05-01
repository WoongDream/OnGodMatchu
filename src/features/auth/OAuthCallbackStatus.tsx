import { memo } from 'react';
import {
  wrapperStyle,
  spinnerStyle,
  messageStyle,
  errorMessageStyle,
} from './OAuthCallbackStatus.style';

type OAuthCallbackStatusProps = {
  error: string | null;
};

const OAuthCallbackStatus = memo(({ error }: OAuthCallbackStatusProps) => {
  if (error) {
    return (
      <div css={wrapperStyle}>
        <p css={errorMessageStyle}>{error}</p>
        <p css={messageStyle}>로그인 페이지로 이동합니다...</p>
      </div>
    );
  }

  return (
    <div css={wrapperStyle}>
      <div css={spinnerStyle} aria-label="로그인 처리 중" />
      <p css={messageStyle}>로그인 처리 중입니다...</p>
    </div>
  );
});

OAuthCallbackStatus.displayName = 'OAuthCallbackStatus';
export default OAuthCallbackStatus;
