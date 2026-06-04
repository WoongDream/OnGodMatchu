import { memo, useEffect, useState } from 'react';
import Modal from '@/components/modal/Modal';
import Button from '@/components/button/Button';
import Input from '@/components/input/Input';
import type { NotificationDraft, NotificationType } from '@/types';
import {
  changeItemLabelStyle,
  changeItemStyle,
  changeItemValueStyle,
  changeSummaryStyle,
  changeSummaryTitleStyle,
  contentLabelStyle,
  contentTextareaStyle,
  fieldLabelStyle,
  footerStyle,
  infoNoteStyle,
  recipientStyle,
  typeToggleStyle,
  typeOptionStyle,
} from './NotificationComposeModal.style';

export type ComposeChangeItem = { label: string; value: string; emphasize?: boolean };

type Props = {
  isOpen: boolean;
  onClose: () => void;
  recipient: { nickname: string; email: string };
  /** 수정 저장 동반 시 좌측 변경 요약. 알림만 보낼 때는 생략. */
  changeSummary?: ComposeChangeItem[] | null;
  isSubmitting?: boolean;
  /** "알림 보내고 수정 저장" (수정 동반) / "알림 보내기" (알림만). */
  onSend: (draft: NotificationDraft) => void;
  /** "알림 없이 수정 저장" — 수정 동반 시에만 노출. */
  onSaveWithoutNotification?: () => void;
};

const TYPES: { value: NotificationType; label: string }[] = [
  { value: 'INFO', label: '안내' },
  { value: 'WARNING', label: '경고' },
];

const NotificationComposeModal = memo(
  ({
    isOpen,
    onClose,
    recipient,
    changeSummary,
    isSubmitting = false,
    onSend,
    onSaveWithoutNotification,
  }: Props) => {
    const [type, setType] = useState<NotificationType>('INFO');
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');

    useEffect(() => {
      if (isOpen) {
        setType('INFO');
        setTitle('');
        setContent('');
      }
    }, [isOpen]);

    const hasChanges = changeSummary != null && changeSummary.length > 0;
    const canSend = title.trim() !== '' && content.trim() !== '' && !isSubmitting;

    const send = () => {
      if (!canSend) {
        return;
      }
      onSend({ type, title: title.trim(), content: content.trim() });
    };

    const footer = (
      <div css={footerStyle}>
        <Button variant="primary" onClick={send} disabled={!canSend}>
          {hasChanges ? '알림 보내고 수정 저장' : '알림 보내기'}
        </Button>
        <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
          취소
        </Button>
        {hasChanges && onSaveWithoutNotification ? (
          <Button
            variant="dangerOutline"
            onClick={onSaveWithoutNotification}
            disabled={isSubmitting}
          >
            알림 없이 수정 저장
          </Button>
        ) : null}
      </div>
    );

    return (
      <Modal isOpen={isOpen} onClose={onClose} title="알림 보내기" footer={footer} size="lg">
        {hasChanges ? (
          <div css={changeSummaryStyle}>
            <p css={changeSummaryTitleStyle}>이번에 저장되는 변경사항</p>
            {changeSummary?.map((item) => (
              <div key={item.label} css={changeItemStyle}>
                <span css={changeItemLabelStyle}>{item.label}</span>
                <span css={(theme) => changeItemValueStyle(theme, item.emphasize)}>
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        ) : null}

        <div css={recipientStyle}>
          받는 사람 · {recipient.nickname} · {recipient.email}
        </div>

        <p css={fieldLabelStyle}>유형</p>
        <div css={typeToggleStyle}>
          {TYPES.map((t) => (
            <button
              key={t.value}
              type="button"
              css={(theme) => typeOptionStyle(theme, type === t.value, t.value)}
              onClick={() => setType(t.value)}
            >
              {t.label}
            </button>
          ))}
        </div>

        <p css={fieldLabelStyle}>제목</p>
        <Input value={title} onChange={setTitle} placeholder="알림 제목" />

        <p css={contentLabelStyle}>내용</p>
        <textarea
          css={contentTextareaStyle}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="사용자에게 전할 내용을 입력해주세요."
          rows={4}
        />

        <p css={infoNoteStyle}>
          사용자는 다음 로그인 시 이 알림을 모달로 받아요. 보낸 알림은 발송 후 수정할 수 없어요.
        </p>
      </Modal>
    );
  },
);

NotificationComposeModal.displayName = 'NotificationComposeModal';
export default NotificationComposeModal;
