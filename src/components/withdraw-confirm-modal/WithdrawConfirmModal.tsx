import { memo, useEffect, useState } from 'react';
import Modal from '@/components/modal';
import Button from '@/components/button';
import useWithdrawAccount from '@/hooks/useWithdrawAccount';
import useWithdrawalCode from '@/hooks/useWithdrawalCode';
import {
  guideTextStyle,
  progressTrackStyle,
  progressBarStyle,
  stepLabelStyle,
  stepRowStyle,
  stepRowTrackStyle,
  stepIntroStyle,
  dividerStyle,
  codeStatusStyle,
  sectionLabelRowStyle,
  optionalTagStyle,
  counterStyle,
  reasonTextareaStyle,
  codeIntroStyle,
  codeInputStyle,
  verifyButtonRowStyle,
  timerTextStyle,
  noticeBoxStyle,
  noticeTextStyle,
  checkboxRowStyle,
  checkboxInputStyle,
  checkboxLabelTextStyle,
  checkboxHintStyle,
  policyTextStyle,
  confirmFieldStyle,
  confirmLabelStyle,
  confirmHighlightStyle,
  confirmInputStyle,
  inlineErrorStyle,
  errorTextStyle,
} from './WithdrawConfirmModal.style';

const CONFIRM_TEXT = '탈퇴하겠습니다.';
const REASON_MAX_LENGTH = 500;
const CODE_LENGTH = 6;

const formatTime = (seconds: number): string => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  createdQuizCount: number;
  email: string;
};

type Step = 1 | 2;

const WithdrawConfirmModal = memo(({ isOpen, onClose, createdQuizCount, email }: Props) => {
  const [step, setStep] = useState<Step>(1);
  const [reasonText, setReasonText] = useState('');
  const [deleteOwnQuizzes, setDeleteOwnQuizzes] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [verified, setVerified] = useState(false);
  const [confirmText, setConfirmText] = useState('');

  const code = useWithdrawalCode();
  const { withdraw, isSubmitting, error, errorCode, clearError } = useWithdrawAccount();

  useEffect(() => {
    if (!isOpen) {
      setStep(1);
      setReasonText('');
      setDeleteOwnQuizzes(false);
      setVerificationCode('');
      setVerified(false);
      setConfirmText('');
      code.reset();
      clearError();
    }
  }, [isOpen, code, clearError]);

  useEffect(() => {
    if (code.expired && verified) {
      setVerified(false);
    }
  }, [code.expired, verified]);

  useEffect(() => {
    if (errorCode === 'INVALID_VERIFICATION_CODE' || errorCode === 'VERIFICATION_CODE_EXPIRED') {
      setVerified(false);
    }
  }, [errorCode]);

  const codeError =
    errorCode === 'INVALID_VERIFICATION_CODE' || errorCode === 'VERIFICATION_CODE_EXPIRED'
      ? error
      : null;
  const confirmError = errorCode === 'INVALID_WITHDRAWAL_CONFIRMATION' ? error : null;
  const generalError =
    error && !codeError && !confirmError && errorCode !== 'RATE_LIMITED' ? error : null;

  const codeFilled = verificationCode.trim().length === CODE_LENGTH;
  const canVerify = code.codeSent && !verified && !code.expired && codeFilled;
  const confirmMatched = confirmText === CONFIRM_TEXT;
  const canSubmit = verified && confirmMatched && !isSubmitting;

  const handleVerify = () => {
    if (!canVerify) {
      return;
    }
    setVerified(true);
  };

  const handleNext = () => {
    clearError();
    setStep(2);
  };

  const handleBack = () => {
    clearError();
    setStep(1);
  };

  const handleSendCode = async () => {
    clearError();
    await code.sendCode();
  };

  const handleSubmit = async () => {
    if (!canSubmit) {
      return;
    }
    await withdraw({
      verificationCode: verificationCode.trim(),
      confirmationPhrase: confirmText,
      deleteOwnQuizzes,
      ...(reasonText.trim() ? { reasonText: reasonText.trim() } : {}),
    });
  };

  const submitLabel = isSubmitting
    ? '처리 중...'
    : deleteOwnQuizzes
      ? '퀴즈 삭제 후 탈퇴'
      : '탈퇴하기';

  const stepFooter =
    step === 1 ? (
      <>
        <Button variant="ghost" onClick={onClose}>
          취소
        </Button>
        <Button onClick={handleNext}>다음</Button>
      </>
    ) : (
      <>
        <Button variant="ghost" onClick={handleBack}>
          이전
        </Button>
        <Button variant="danger" onClick={handleSubmit} disabled={!canSubmit}>
          {submitLabel}
        </Button>
      </>
    );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="회원 탈퇴" footer={stepFooter}>
      <div css={stepRowStyle}>
        <span css={stepLabelStyle}>STEP {step} / 2</span>
        <div css={[progressTrackStyle, stepRowTrackStyle]}>
          <div css={progressBarStyle(step === 1 ? 50 : 100)} />
        </div>
      </div>

      {step === 1 ? (
        <>
          <p css={guideTextStyle}>정말 떠나시는 게 맞나요? 떠나기 전에 알려주세요.</p>

          <div>
            <div css={sectionLabelRowStyle}>
              <span>
                탈퇴 이유<span css={optionalTagStyle}>(선택)</span>
              </span>
              <span css={counterStyle}>
                {reasonText.length}/{REASON_MAX_LENGTH}
              </span>
            </div>
            <textarea
              css={reasonTextareaStyle}
              value={reasonText}
              onChange={(e) => setReasonText(e.target.value.slice(0, REASON_MAX_LENGTH))}
              placeholder="떠나는 이유를 알려주세요 (선택)"
              maxLength={REASON_MAX_LENGTH}
              aria-label="탈퇴 이유"
            />
          </div>

          <div css={noticeBoxStyle}>
            <span css={noticeTextStyle}>
              회원님이 만든 <strong>{createdQuizCount}개</strong>의 퀴즈는 '관리자' 계정으로
              이전되어 서비스에 남습니다.
            </span>
            <label css={checkboxRowStyle}>
              <input
                css={checkboxInputStyle}
                type="checkbox"
                checked={deleteOwnQuizzes}
                onChange={(e) => setDeleteOwnQuizzes(e.target.checked)}
              />
              <span css={checkboxLabelTextStyle}>
                <span>내가 만든 퀴즈도 모두 삭제하기</span>
                <span css={checkboxHintStyle}>다시 복구할 수 없어요.</span>
              </span>
            </label>
          </div>

          <p css={policyTextStyle}>
            남기신 플레이 기록·정답률·스타·댓글은 다른 사용자를 위해 그대로 남으며, 닉네임은 '탈퇴한
            사용자' 로 표시됩니다.
          </p>
        </>
      ) : (
        <>
          <p css={stepIntroStyle}>본인 확인을 위해 가입하신 이메일로 인증코드를 보내드릴게요.</p>

          <div>
            <div css={sectionLabelRowStyle}>
              <span>본인 확인 인증코드</span>
              {code.codeSent && !code.expired && (
                <span css={timerTextStyle(false)}>{formatTime(code.secondsLeft)}</span>
              )}
            </div>
            <p css={codeIntroStyle}>
              <strong>{email}</strong> 로 인증코드를 보내드릴게요.
            </p>

            {!code.codeSent ? (
              <Button
                variant="secondary"
                onClick={handleSendCode}
                disabled={code.isSending}
                fullWidth
              >
                {code.isSending ? '발송 중...' : '인증코드 받기'}
              </Button>
            ) : (
              <>
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  css={codeInputStyle(!!codeError || code.expired)}
                  value={verificationCode}
                  onChange={(e) =>
                    setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, CODE_LENGTH))
                  }
                  placeholder="이메일로 받은 코드 입력"
                  aria-label="인증코드"
                  disabled={verified}
                />
                {verified ? (
                  <span css={codeStatusStyle('success')}>✓ 인증되었어요.</span>
                ) : code.expired ? (
                  <span css={codeStatusStyle('error')} role="alert">
                    코드가 만료되었어요. 다시 받아주세요.
                  </span>
                ) : (
                  <span css={codeStatusStyle('success')}>
                    ✓ 인증코드를 이메일로 보냈어요. 5분 내 입력해 주세요.
                  </span>
                )}
                {code.errorCode === 'RATE_LIMITED' && code.retryAfter > 0 && (
                  <span css={inlineErrorStyle} role="alert">
                    잠시 후 다시 시도해주세요. ({code.retryAfter}초)
                  </span>
                )}
                {codeError && (
                  <span css={inlineErrorStyle} role="alert">
                    {codeError}
                  </span>
                )}
                {!verified && (
                  <div css={verifyButtonRowStyle}>
                    <Button onClick={handleVerify} disabled={!canVerify}>
                      인증
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={handleSendCode}
                      disabled={!code.canResend || code.isSending}
                    >
                      {code.isSending ? '발송 중' : code.canResend ? '재발송' : `${code.resendIn}s`}
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>

          <hr css={dividerStyle} />

          <div css={confirmFieldStyle}>
            <label css={confirmLabelStyle} htmlFor="withdraw-confirm">
              확인을 위해 <span css={confirmHighlightStyle}>'{CONFIRM_TEXT}'</span>을(를) 입력해
              주세요.
            </label>
            <input
              id="withdraw-confirm"
              type="text"
              css={confirmInputStyle(!!confirmError)}
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder={CONFIRM_TEXT}
              autoComplete="off"
            />
            {confirmError && (
              <span css={inlineErrorStyle} role="alert">
                {confirmError}
              </span>
            )}
          </div>

          {generalError && (
            <span css={errorTextStyle} role="alert">
              {generalError}
            </span>
          )}
        </>
      )}
    </Modal>
  );
});

WithdrawConfirmModal.displayName = 'WithdrawConfirmModal';
export default WithdrawConfirmModal;
