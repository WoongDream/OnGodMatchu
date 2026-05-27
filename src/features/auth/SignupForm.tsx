import { memo, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '@/components/input';
import Button from '@/components/button';
import PasswordInput from '@/components/password-input';
import type { PasswordRuleStatus, PasswordStrength } from '@/components/password-input';
import TermsAgreementCheckboxes, {
  type TermsAgreementState,
} from '@/components/terms-agreement-checkboxes';
import { canSubmitByStrength, isLengthValid } from '@/lib/password';
import SocialLoginButtons from './SocialLoginButtons';
import {
  formStyle,
  titleStyle,
  linkRowStyle,
  linkTextStyle,
  linkButtonStyle,
  errorTextStyle,
  infoTextStyle,
  inlineLoginLinkStyle,
  nicknameStatusTextStyle,
  timerTextStyle,
  verifyButtonRowStyle,
} from './SignupForm.style';
import useSignup from '@/hooks/useSignup';
import useVerificationCode from '@/hooks/useVerificationCode';
import useNicknameCheck, { type NicknameStatus } from '@/hooks/useNicknameCheck';

const toneOf = (status: NicknameStatus): 'positive' | 'negative' | 'neutral' => {
  if (status === 'available') {
    return 'positive';
  }
  if (status === 'taken' || status === 'invalid' || status === 'error') {
    return 'negative';
  }
  return 'neutral';
};

const formatTime = (seconds: number): string => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
};

const SignupForm = memo(() => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [verified, setVerified] = useState(false);
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [strength, setStrength] = useState<PasswordStrength | null>(null);
  const [agreements, setAgreements] = useState<TermsAgreementState>({
    agreedToTerms: false,
    agreedToPrivacy: false,
  });

  const verification = useVerificationCode();
  const signup = useSignup();

  const codeSent = verification.codeSent;
  const expired = verification.expired;
  const showProfile = codeSent && verified;

  const userInputs = useMemo(() => [email, nickname].filter(Boolean), [email, nickname]);

  const { status: nicknameStatus, message: nicknameMessage } = useNicknameCheck(nickname, {
    enabled: showProfile,
  });

  const ruleStatus: PasswordRuleStatus = {
    lengthOk: isLengthValid(password),
  };

  useEffect(() => {
    if (expired && verified) {
      setVerified(false);
    }
  }, [expired, verified]);

  const lastPasswordRef = useRef(password);
  useEffect(() => {
    if (password !== lastPasswordRef.current) {
      lastPasswordRef.current = password;
      if (signup.errorCode === 'BREACH') {
        signup.clearError();
      }
    }
  }, [password, signup]);

  const [rateLimitSec, setRateLimitSec] = useState(0);
  useEffect(() => {
    if (signup.errorCode !== 'RATE_LIMITED' || signup.retryAfter <= 0) {
      setRateLimitSec(0);
      return;
    }
    setRateLimitSec(signup.retryAfter);
    const id = setInterval(() => {
      setRateLimitSec((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(id);
  }, [signup.errorCode, signup.retryAfter]);

  const isNicknameRaceConflict = signup.errorCode === 'NICKNAME_TAKEN';
  const effectiveNicknameMessage = isNicknameRaceConflict
    ? '이미 사용 중인 닉네임입니다.'
    : nicknameMessage;
  const nicknameTone: 'positive' | 'negative' | 'neutral' = isNicknameRaceConflict
    ? 'negative'
    : toneOf(nicknameStatus);

  const canSendEmail = email.trim() !== '' && !verification.isSending;
  const canVerify = codeSent && !verified && !expired && code.trim().length > 0;

  const canSubmit =
    showProfile &&
    nicknameStatus === 'available' &&
    !isNicknameRaceConflict &&
    isLengthValid(password) &&
    canSubmitByStrength(strength?.score ?? 0) &&
    agreements.agreedToTerms &&
    agreements.agreedToPrivacy &&
    signup.errorCode !== 'BREACH';

  const emailErrorCode =
    verification.errorCode === 'EMAIL_ALREADY_EXISTS' || signup.errorCode === 'EMAIL_ALREADY_EXISTS'
      ? 'EMAIL_ALREADY_EXISTS'
      : verification.errorCode === 'INVALID_EMAIL_FORMAT' ||
          signup.errorCode === 'INVALID_EMAIL_FORMAT'
        ? 'INVALID_EMAIL_FORMAT'
        : null;

  const codeErrorMessage =
    signup.errorCode === 'INVALID_CODE'
      ? '인증코드가 올바르지 않습니다.'
      : signup.errorCode === 'EXPIRED_CODE'
        ? '코드가 만료되었습니다. 재발송해주세요.'
        : null;

  const rateLimitMessage =
    verification.errorCode === 'RATE_LIMITED' || signup.errorCode === 'RATE_LIMITED'
      ? rateLimitSec > 0 || verification.resendIn > 0
        ? `잠시 후 다시 시도해주세요. (${rateLimitSec || verification.resendIn}초)`
        : '잠시 후 다시 시도해주세요.'
      : null;

  const generalError =
    signup.errorCode === 'NETWORK' || signup.errorCode === 'POLICY' ? signup.error : null;

  const handleSendCode = async () => {
    const trimmed = email.trim();
    if (!trimmed) {
      return;
    }
    signup.clearError();
    await verification.sendCode(trimmed);
  };

  const handleResend = async () => {
    if (!verification.canResend) {
      return;
    }
    setCode('');
    setVerified(false);
    signup.clearError();
    await verification.sendCode(email.trim());
  };

  const handleVerify = () => {
    if (!canVerify) {
      return;
    }
    setVerified(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || signup.isSubmitting) {
      return;
    }
    await signup.submit({
      email: email.trim(),
      password,
      nickname,
      code: code.trim(),
      agreedToTerms: agreements.agreedToTerms,
      agreedToPrivacy: agreements.agreedToPrivacy,
    });
  };

  return (
    <form css={formStyle} onSubmit={handleSubmit}>
      <h1 css={titleStyle}>회원가입</h1>

      <Input
        label="이메일"
        type="email"
        value={email}
        onChange={setEmail}
        placeholder="example@email.com"
        disabled={codeSent}
      />
      {emailErrorCode === 'EMAIL_ALREADY_EXISTS' && (
        <p css={errorTextStyle}>
          이미 가입된 이메일입니다.{' '}
          <button type="button" css={inlineLoginLinkStyle} onClick={() => navigate('/login')}>
            로그인하시겠어요?
          </button>
        </p>
      )}
      {emailErrorCode === 'INVALID_EMAIL_FORMAT' && (
        <p css={errorTextStyle}>이메일 형식이 올바르지 않습니다.</p>
      )}

      {!codeSent && (
        <Button
          type="button"
          variant="secondary"
          fullWidth
          onClick={handleSendCode}
          disabled={!canSendEmail}
        >
          {verification.isSending ? '발송 중...' : '인증 코드 발송'}
        </Button>
      )}

      {codeSent && (
        <>
          <Input
            label="인증 코드"
            value={code}
            onChange={setCode}
            placeholder="이메일로 받은 코드 입력"
            disabled={expired || verified}
            labelTrailing={
              !verified ? (
                <span css={timerTextStyle(expired)}>{formatTime(verification.secondsLeft)}</span>
              ) : null
            }
          />
          {!verified && (
            <div css={verifyButtonRowStyle}>
              <Button
                type="button"
                variant="primary"
                fullWidth
                onClick={handleVerify}
                disabled={!canVerify}
              >
                인증
              </Button>
              <Button
                type="button"
                variant="secondary"
                fullWidth
                onClick={handleResend}
                disabled={!verification.canResend || verification.isSending}
              >
                {verification.isSending
                  ? '발송 중'
                  : verification.canResend
                    ? '재발송'
                    : `${verification.resendIn}s`}
              </Button>
            </div>
          )}
          {expired && !verified && <p css={infoTextStyle}>코드가 만료되었습니다. 재발송해주세요</p>}
          {codeErrorMessage && <p css={errorTextStyle}>{codeErrorMessage}</p>}
        </>
      )}

      {showProfile && (
        <>
          <PasswordInput
            label="비밀번호"
            value={password}
            onChange={setPassword}
            placeholder="비밀번호 입력"
            ruleStatus={ruleStatus}
            userInputs={userInputs}
            onStrengthChange={setStrength}
            error={signup.errorCode === 'BREACH' && signup.error ? signup.error : undefined}
          />
          <Input label="닉네임" value={nickname} onChange={setNickname} placeholder="닉네임 입력" />
          {effectiveNicknameMessage && (
            <p css={nicknameStatusTextStyle(nicknameTone)}>{effectiveNicknameMessage}</p>
          )}
          <TermsAgreementCheckboxes
            value={agreements}
            onChange={setAgreements}
            disabled={signup.isSubmitting}
          />
          {signup.errorCode === 'TERMS_AGREEMENT_REQUIRED' && (
            <p css={errorTextStyle}>{signup.error}</p>
          )}
          <Button fullWidth type="submit" disabled={!canSubmit || signup.isSubmitting}>
            {signup.isSubmitting ? '가입 중...' : '가입하기'}
          </Button>
        </>
      )}

      {rateLimitMessage && <p css={errorTextStyle}>{rateLimitMessage}</p>}
      {generalError && <p css={errorTextStyle}>{generalError}</p>}

      <SocialLoginButtons />
      <div css={linkRowStyle}>
        <span css={linkTextStyle}>이미 계정이 있으신가요?</span>
        <button type="button" css={linkButtonStyle} onClick={() => navigate('/login')}>
          로그인
        </button>
      </div>
    </form>
  );
});

SignupForm.displayName = 'SignupForm';
export default SignupForm;
