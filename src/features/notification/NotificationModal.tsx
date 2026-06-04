import { memo } from 'react';
import { createPortal } from 'react-dom';
import Button from '@/components/button/Button';
import type { UserNotification } from '@/types';
import {
  cardStyle,
  contentStyle,
  countPillStyle,
  footerStyle,
  metaStyle,
  metaWrapStyle,
  overlayStyle,
  titleStyle,
  typeBadgeStyle,
} from './NotificationModal.style';

type Props = {
  notification: UserNotification;
  /** 이번 배치 총 알림 수. */
  total: number;
  /** 0-based 현재 인덱스. */
  index: number;
  onNext: () => void;
  onConfirm: () => void;
  onInquiry: () => void;
};

const NotificationModal = memo(
  ({ notification, total, index, onNext, onConfirm, onInquiry }: Props) => {
    const isLast = index === total - 1;
    const remaining = total - index - 1;

    const node = (
      <div css={overlayStyle}>
        <div css={metaWrapStyle}>
          {total > 1 ? (
            <span css={countPillStyle}>
              새 알림 {total}개 · {index + 1} / {total}
            </span>
          ) : null}
          <div css={cardStyle} role="alertdialog" aria-modal="true" aria-label={notification.title}>
            <span css={(theme) => typeBadgeStyle(theme, notification.type)}>
              {notification.typeLabel}
            </span>
            <h2 css={titleStyle}>{notification.title}</h2>
            <p css={contentStyle}>{notification.content}</p>
            <p css={metaStyle}>
              {notification.senderLabel} · {notification.createdAt.slice(0, 10)}
            </p>
            <div css={footerStyle}>
              {isLast ? (
                <>
                  <Button variant="primary" fullWidth onClick={onConfirm}>
                    확인
                  </Button>
                  <Button variant="secondary" fullWidth onClick={onInquiry}>
                    문의하기
                  </Button>
                </>
              ) : (
                <Button variant="primary" fullWidth onClick={onNext}>
                  다음 ({remaining}개 남음)
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    );

    return createPortal(node, document.body);
  },
);

NotificationModal.displayName = 'NotificationModal';
export default NotificationModal;
