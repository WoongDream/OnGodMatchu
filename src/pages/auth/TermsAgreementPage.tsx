import { memo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSWRConfig } from 'swr';
import axios from 'axios';
import Button from '@/components/button';
import TermsAgreementCheckboxes, {
  type TermsAgreementState,
} from '@/components/terms-agreement-checkboxes';
import { agreeTerms, mapUserError, USER_ERROR_MESSAGES } from '@/api/user';
import { logout as logoutApi } from '@/api/auth';
import { clearAuthSession } from '@/lib/auth';
import useAuthStore from '@/store/authStore';
import {
  wrapperStyle,
  titleStyle,
  subtitleStyle,
  buttonRowStyle,
  errorTextStyle,
} from './TermsAgreementPage.style';

const MY_PROFILE_KEY = ['profile', 'me'] as const;

const TermsAgreementPage = memo(() => {
  const navigate = useNavigate();
  const { mutate } = useSWRConfig();
  const [agreements, setAgreements] = useState<TermsAgreementState>({
    agreedToTerms: false,
    agreedToPrivacy: false,
    agreedToAge14: false,
  });
  const [isAgreeing, setIsAgreeing] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canAgree =
    agreements.agreedToTerms &&
    agreements.agreedToPrivacy &&
    agreements.agreedToAge14 &&
    !isAgreeing &&
    !isLoggingOut;

  const handleAgree = async () => {
    if (!canAgree) {
      return;
    }
    setIsAgreeing(true);
    setError(null);
    try {
      const updatedUser = await agreeTerms();
      useAuthStore.getState().setUser(updatedUser);
      await mutate(MY_PROFILE_KEY, updatedUser, { revalidate: false });
      navigate('/', { replace: true });
    } catch (err) {
      const code = axios.isAxiosError(err) ? mapUserError(err) : 'NETWORK';
      setError(USER_ERROR_MESSAGES[code]);
    } finally {
      setIsAgreeing(false);
    }
  };

  const handleReject = async () => {
    setIsLoggingOut(true);
    setError(null);
    try {
      await logoutApi();
    } catch {
      // best-effort: 서버 logout 실패해도 로컬 세션은 비움
    }
    clearAuthSession();
    useAuthStore.getState().logout();
    navigate('/login', { replace: true });
  };

  return (
    <div css={wrapperStyle}>
      <h1 css={titleStyle}>약관 동의</h1>
      <p css={subtitleStyle}>
        OnGodMatchu 서비스를 이용하려면 아래 약관에 동의해주세요. 거부하면 로그아웃되며 계정은
        유지됩니다.
      </p>

      <TermsAgreementCheckboxes
        value={agreements}
        onChange={setAgreements}
        disabled={isAgreeing || isLoggingOut}
      />

      {error && (
        <p css={errorTextStyle} role="alert">
          {error}
        </p>
      )}

      <div css={buttonRowStyle}>
        <Button onClick={handleAgree} disabled={!canAgree} fullWidth>
          {isAgreeing ? '처리 중...' : '동의하고 계속하기'}
        </Button>
        <Button variant="ghost" onClick={handleReject} disabled={isLoggingOut} fullWidth>
          {isLoggingOut ? '로그아웃 중...' : '거부하고 로그아웃'}
        </Button>
      </div>
    </div>
  );
});

TermsAgreementPage.displayName = 'TermsAgreementPage';
export default TermsAgreementPage;
