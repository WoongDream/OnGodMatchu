import { memo, useEffect, useState } from 'react';
import Modal from '@/components/modal';
import Button from '@/components/button';
import useWithdrawAccount from '@/hooks/useWithdrawAccount';
import type { WithdrawReason } from '@/api/user';
import {
  guideTextStyle,
  sectionLabelStyle,
  optionalTagStyle,
  reasonListStyle,
  reasonItemStyle,
  radioInputStyle,
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
  errorTextStyle,
} from './WithdrawConfirmModal.style';

const REASON_OPTIONS: { value: WithdrawReason; label: string }[] = [
  { value: 'no_time', label: '시간이 없어요' },
  { value: 'low_quality_quizzes', label: '쓸 만한 퀴즈가 별로 없어요' },
  { value: 'privacy_concern', label: '개인정보가 걱정돼요' },
  { value: 'will_recreate', label: '계정을 다시 만들 거예요' },
  { value: 'other', label: '기타' },
];

const CONFIRM_TEXT = '탈퇴하겠습니다.';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  createdQuizCount: number;
};

const WithdrawConfirmModal = memo(({ isOpen, onClose, createdQuizCount }: Props) => {
  const [reason, setReason] = useState<WithdrawReason | null>(null);
  const [deleteMyQuizzes, setDeleteMyQuizzes] = useState(false);
  const [confirmText, setConfirmText] = useState('');

  const { withdraw, isSubmitting, error, clearError } = useWithdrawAccount();

  useEffect(() => {
    if (!isOpen) {
      setReason(null);
      setDeleteMyQuizzes(false);
      setConfirmText('');
      clearError();
    }
  }, [isOpen, clearError]);

  const confirmMatched = confirmText === CONFIRM_TEXT;
  const canSubmit = confirmMatched && !isSubmitting;

  const handleSubmit = async () => {
    if (!canSubmit) {
      return;
    }
    await withdraw({
      reason: reason ?? undefined,
      deleteMyQuizzes,
    });
  };

  const submitLabel = isSubmitting
    ? '처리 중...'
    : deleteMyQuizzes
      ? '퀴즈 삭제 후 탈퇴'
      : '탈퇴하기';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="회원 탈퇴"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            취소
          </Button>
          <Button variant="danger" onClick={handleSubmit} disabled={!canSubmit}>
            {submitLabel}
          </Button>
        </>
      }
    >
      <p css={guideTextStyle}>정말 떠나시는 게 맞나요? 떠나기 전에 알려주세요.</p>

      <div>
        <p css={sectionLabelStyle}>
          탈퇴 이유<span css={optionalTagStyle}>(선택)</span>
        </p>
        <div css={reasonListStyle} role="radiogroup" aria-label="탈퇴 이유">
          {REASON_OPTIONS.map((opt) => {
            const selected = reason === opt.value;
            return (
              <label key={opt.value} css={reasonItemStyle(selected)}>
                <input
                  css={radioInputStyle}
                  type="radio"
                  name="withdraw-reason"
                  value={opt.value}
                  checked={selected}
                  onChange={() => setReason(opt.value)}
                />
                {opt.label}
              </label>
            );
          })}
        </div>
      </div>

      <div css={noticeBoxStyle}>
        <span css={noticeTextStyle}>
          회원님이 만든 <strong>{createdQuizCount}개</strong>의 퀴즈는 '관리자' 계정으로 이전되어
          서비스에 남습니다.
        </span>
        <label css={checkboxRowStyle}>
          <input
            css={checkboxInputStyle}
            type="checkbox"
            checked={deleteMyQuizzes}
            onChange={(e) => setDeleteMyQuizzes(e.target.checked)}
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

      <div css={confirmFieldStyle}>
        <label css={confirmLabelStyle} htmlFor="withdraw-confirm">
          확인을 위해 <span css={confirmHighlightStyle}>'{CONFIRM_TEXT}'</span>을(를) 입력해 주세요.
        </label>
        <input
          id="withdraw-confirm"
          type="text"
          css={confirmInputStyle}
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          placeholder={CONFIRM_TEXT}
          autoComplete="off"
        />
      </div>

      {error && (
        <span css={errorTextStyle} role="alert">
          {error}
        </span>
      )}
    </Modal>
  );
});

WithdrawConfirmModal.displayName = 'WithdrawConfirmModal';
export default WithdrawConfirmModal;
