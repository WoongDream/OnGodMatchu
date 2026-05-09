import { memo, useEffect, useState } from 'react';
import Modal from '@/components/modal';
import Button from '@/components/button';
import PasswordInput from '@/components/password-input';
import useChangePassword from '@/hooks/useChangePassword';
import { isLengthValid, canSubmitByStrength, evaluateStrength } from '@/lib/password';
import {
  progressTrackStyle,
  progressBarStyle,
  stepLabelStyle,
  stepRowStyle,
  stepRowTrackStyle,
  guideTextStyle,
  fieldStyle,
  fieldLabelStyle,
  inputStyle,
  errorTextStyle,
} from './PasswordChangeModal.style';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  userInputs?: readonly string[];
};

type Step = 1 | 2;

const PasswordChangeModal = memo(({ isOpen, onClose, onSuccess, userInputs }: Props) => {
  const [step, setStep] = useState<Step>(1);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [currentPasswordError, setCurrentPasswordError] = useState<string | null>(null);

  const { change, isSubmitting, error, errorCode, clearError } = useChangePassword();

  useEffect(() => {
    if (!isOpen) {
      setStep(1);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setCurrentPasswordError(null);
      clearError();
    }
  }, [isOpen, clearError]);

  const newStrength = evaluateStrength(newPassword, userInputs ?? []);
  const newLengthOk = isLengthValid(newPassword);
  const newStrengthOk = canSubmitByStrength(newStrength.score);
  const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;
  const canSubmitStep2 = newLengthOk && newStrengthOk && passwordsMatch && !isSubmitting;

  const handleNext = () => {
    if (currentPassword.length === 0) {
      setCurrentPasswordError('현재 비밀번호를 입력해 주세요.');
      return;
    }
    setCurrentPasswordError(null);
    setStep(2);
  };

  const handleBack = () => {
    setStep(1);
    clearError();
  };

  const handleSubmit = async () => {
    if (!canSubmitStep2) {
      return;
    }
    const ok = await change({ currentPassword, newPassword });
    if (ok) {
      onSuccess?.();
      onClose();
      return;
    }
  };

  useEffect(() => {
    if (errorCode === 'INVALID_CURRENT_PASSWORD') {
      setStep(1);
      setCurrentPasswordError(error);
    }
  }, [errorCode, error]);

  const stepFooter =
    step === 1 ? (
      <>
        <Button variant="ghost" onClick={onClose}>
          취소
        </Button>
        <Button onClick={handleNext} disabled={currentPassword.length === 0}>
          다음
        </Button>
      </>
    ) : (
      <>
        <Button variant="ghost" onClick={handleBack}>
          이전
        </Button>
        <Button onClick={handleSubmit} disabled={!canSubmitStep2}>
          {isSubmitting ? '변경 중...' : '변경하기'}
        </Button>
      </>
    );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="비밀번호 변경"
      footer={stepFooter}
      closeOnOverlay={false}
    >
      <div css={stepRowStyle}>
        <span css={stepLabelStyle}>STEP {step} / 2</span>
        <div css={[progressTrackStyle, stepRowTrackStyle]}>
          <div css={progressBarStyle(step === 1 ? 50 : 100)} />
        </div>
      </div>

      {step === 1 ? (
        <>
          <p css={guideTextStyle}>본인 확인을 위해 현재 사용 중인 비밀번호를 입력해 주세요.</p>
          <div css={fieldStyle}>
            <label css={fieldLabelStyle} htmlFor="current-password">
              현재 비밀번호
            </label>
            <input
              id="current-password"
              type="password"
              css={inputStyle(!!currentPasswordError)}
              value={currentPassword}
              onChange={(e) => {
                setCurrentPassword(e.target.value);
                if (currentPasswordError) {
                  setCurrentPasswordError(null);
                }
              }}
              autoComplete="current-password"
              placeholder="현재 비밀번호"
            />
            {currentPasswordError && (
              <span css={errorTextStyle} role="alert">
                {currentPasswordError}
              </span>
            )}
          </div>
        </>
      ) : (
        <>
          <p css={guideTextStyle}>
            새 비밀번호를 입력해 주세요. 10자 이상, 강도 게이지를 참고해 주세요.
          </p>
          <div css={fieldStyle}>
            <label css={fieldLabelStyle}>새 비밀번호</label>
            <PasswordInput
              value={newPassword}
              onChange={setNewPassword}
              placeholder="새 비밀번호"
              ruleStatus={{ lengthOk: newLengthOk }}
              userInputs={userInputs}
            />
          </div>
          <div css={fieldStyle}>
            <label css={fieldLabelStyle} htmlFor="confirm-password">
              새 비밀번호 확인
            </label>
            <input
              id="confirm-password"
              type="password"
              css={inputStyle(confirmPassword.length > 0 && !passwordsMatch)}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              placeholder="새 비밀번호 한번 더"
            />
            {confirmPassword.length > 0 && !passwordsMatch && (
              <span css={errorTextStyle} role="alert">
                새 비밀번호와 일치하지 않아요.
              </span>
            )}
          </div>
          {error && errorCode !== 'INVALID_CURRENT_PASSWORD' && (
            <span css={errorTextStyle} role="alert">
              {error}
            </span>
          )}
        </>
      )}
    </Modal>
  );
});

PasswordChangeModal.displayName = 'PasswordChangeModal';
export default PasswordChangeModal;
