import { memo } from 'react';
import { Wrapper, Spinner, Message, ErrorMessage } from './OAuthCallbackStatus.style';

type OAuthCallbackStatusProps = {
  error: string | null;
};

const OAuthCallbackStatus = memo(({ error }: OAuthCallbackStatusProps) => {
  if (error) {
    return (
      <Wrapper>
        <ErrorMessage>{error}</ErrorMessage>
        <Message>로그인 페이지로 이동합니다...</Message>
      </Wrapper>
    );
  }

  return (
    <Wrapper>
      <Spinner aria-label="로그인 처리 중" />
      <Message>로그인 처리 중입니다...</Message>
    </Wrapper>
  );
});

OAuthCallbackStatus.displayName = 'OAuthCallbackStatus';
export default OAuthCallbackStatus;
