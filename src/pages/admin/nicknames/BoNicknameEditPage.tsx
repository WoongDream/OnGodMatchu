import { memo, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Input from '@/components/input';
import Button from '@/components/button';
import ConfirmModal from '@/components/confirm-modal';
import { useToast } from '@/components/toast';
import useBoNickname from '@/hooks/useBoNickname';
import {
  createNicknameRule,
  updateNicknameRule,
  deleteNicknameRule,
  mapNicknameError,
} from '@/api/admin';
import type { NicknameErrorCode } from '@/api/admin';
import type { NicknameMatchType, NicknameRuleType } from '@/types';
import {
  wrapperStyle,
  headerStyle,
  headerTitleStyle,
  headerSubtitleStyle,
  layoutStyle,
  cardStyle,
  fieldStyle,
  labelRowStyle,
  labelStyle,
  hintStyle,
  textareaStyle,
  panelStyle,
  panelTitleStyle,
  segmentTwoStyle,
  segmentThreeStyle,
  segmentButtonStyle,
  matchDescStyle,
  actionBarStyle,
  actionBarTextStyle,
  actionsStyle,
} from './BoNicknameEditPage.style';

const NICKNAME_ERROR_MESSAGES: Record<NicknameErrorCode, string> = {
  DUPLICATE: '이미 등록된 닉네임·매칭 조합이에요.',
  INVALID: '유효한 닉네임 패턴이 아니에요.',
  NOT_FOUND: '규칙을 찾을 수 없어요.',
  FORBIDDEN: '권한이 없어요.',
  UNKNOWN: '잠시 후 다시 시도해 주세요.',
};

const TYPE_OPTIONS: { value: NicknameRuleType; label: string }[] = [
  { value: 'FORBIDDEN', label: '금지' },
  { value: 'RESERVED', label: '예약' },
];

const MATCH_OPTIONS: { value: NicknameMatchType; label: string }[] = [
  { value: 'EXACT', label: '완전일치' },
  { value: 'PREFIX', label: '접두일치' },
  { value: 'CONTAINS', label: '부분일치' },
];

const MATCH_DESCRIPTIONS: Record<NicknameMatchType, string> = {
  EXACT: '닉네임이 정확히 같을 때만 차단해요.',
  PREFIX: '이 닉네임으로 시작하는 닉네임을 차단해요.',
  CONTAINS: '이 닉네임이 포함된 모든 닉네임을 차단해요.',
};

/** 유형 기본 매칭 — 예약어=접두, 금지어=부분. */
const DEFAULT_MATCH: Record<NicknameRuleType, NicknameMatchType> = {
  RESERVED: 'PREFIX',
  FORBIDDEN: 'CONTAINS',
};

const BoNicknameEditPage = memo(() => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const toast = useToast();

  const numericId = id != null && /^\d+$/.test(id) ? Number(id) : undefined;
  const isEdit = numericId != null;

  const { rule, isLoading } = useBoNickname(numericId);

  const [value, setValue] = useState('');
  const [reason, setReason] = useState('');
  const [type, setType] = useState<NicknameRuleType>('FORBIDDEN');
  const [matchType, setMatchType] = useState<NicknameMatchType>('CONTAINS');
  const [isSaving, setSaving] = useState(false);
  const [isDeleteOpen, setDeleteOpen] = useState(false);
  const [isDeleting, setDeleting] = useState(false);

  useEffect(() => {
    if (rule) {
      setValue(rule.value);
      setReason(rule.reason ?? '');
      setType(rule.type);
      setMatchType(rule.matchType);
    }
  }, [rule]);

  /** 유형 클릭 시 해당 유형의 기본 매칭으로 함께 전환. */
  const handleSelectType = (next: NicknameRuleType) => {
    setType(next);
    setMatchType(DEFAULT_MATCH[next]);
  };

  const canSubmit = value.trim().length > 0 && !isSaving;

  const handleSubmit = async () => {
    if (!canSubmit) {
      return;
    }
    setSaving(true);
    const payload = {
      value: value.trim(),
      type,
      matchType,
      reason: reason.trim() || null,
    };
    try {
      if (isEdit) {
        await updateNicknameRule(numericId, payload);
        toast.success('닉네임 규칙을 저장했어요.');
      } else {
        await createNicknameRule(payload);
        toast.success('닉네임 규칙을 등록했어요.');
      }
      navigate('/admin/nicknames');
      return;
    } catch (error) {
      toast.error(NICKNAME_ERROR_MESSAGES[mapNicknameError(error)]);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!isEdit) {
      return;
    }
    setDeleting(true);
    try {
      await deleteNicknameRule(numericId);
      navigate('/admin/nicknames');
    } catch (error) {
      toast.error(NICKNAME_ERROR_MESSAGES[mapNicknameError(error)]);
      setDeleting(false);
      setDeleteOpen(false);
    }
  };

  return (
    <div css={wrapperStyle}>
      <header css={headerStyle}>
        <h1 css={headerTitleStyle}>{isEdit ? '닉네임 수정' : '닉네임 추가'}</h1>
        <p css={headerSubtitleStyle}>사용을 막을 닉네임과 매칭 방식을 설정해요.</p>
      </header>

      <div css={layoutStyle}>
        <section css={cardStyle} aria-label="닉네임 패턴">
          <Input label="닉네임 · 패턴" value={value} onChange={setValue} placeholder="예: 관리자" />

          <div css={fieldStyle}>
            <div css={labelRowStyle}>
              <label css={labelStyle} htmlFor="nickname-reason">
                사유
              </label>
              <span css={hintStyle}>선택 사항</span>
            </div>
            <textarea
              id="nickname-reason"
              css={textareaStyle}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="차단 사유를 적어두면 관리에 도움이 돼요."
            />
          </div>
        </section>

        <aside css={panelStyle} aria-label="규칙 설정">
          <h2 css={panelTitleStyle}>규칙 설정</h2>

          <div css={fieldStyle}>
            <span css={labelStyle}>유형</span>
            <div css={segmentTwoStyle} role="group" aria-label="유형">
              {TYPE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  css={(theme) => segmentButtonStyle(theme, type === opt.value)}
                  aria-pressed={type === opt.value}
                  onClick={() => handleSelectType(opt.value)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div css={fieldStyle}>
            <span css={labelStyle}>매칭 방식</span>
            <div css={segmentThreeStyle} role="group" aria-label="매칭 방식">
              {MATCH_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  css={(theme) => segmentButtonStyle(theme, matchType === opt.value)}
                  aria-pressed={matchType === opt.value}
                  onClick={() => setMatchType(opt.value)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <p css={matchDescStyle}>{MATCH_DESCRIPTIONS[matchType]}</p>
          </div>
        </aside>
      </div>

      <div css={actionBarStyle}>
        <p css={actionBarTextStyle}>변경한 내용은 저장 즉시 반영돼요.</p>
        <div css={actionsStyle}>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={!canSubmit || (isEdit && isLoading)}
          >
            {isEdit ? '변경사항 저장' : '추가'}
          </Button>
          <Button variant="secondary" onClick={() => navigate('/admin/nicknames')}>
            취소
          </Button>
          {isEdit && (
            <Button
              variant="dangerOutline"
              onClick={() => setDeleteOpen(true)}
              disabled={isDeleting}
            >
              규칙 삭제
            </Button>
          )}
        </div>
      </div>

      {isEdit && (
        <ConfirmModal
          isOpen={isDeleteOpen}
          onClose={() => setDeleteOpen(false)}
          onConfirm={handleDelete}
          title="규칙을 삭제할까요?"
          message="삭제하면 이 닉네임은 다시 사용할 수 있게 돼요."
          confirmLabel="삭제"
          confirmVariant="danger"
          isConfirming={isDeleting}
          confirmingLabel="삭제 중…"
        />
      )}
    </div>
  );
});

BoNicknameEditPage.displayName = 'BoNicknameEditPage';
export default BoNicknameEditPage;
