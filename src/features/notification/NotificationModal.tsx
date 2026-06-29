import { memo } from 'react';
import { createPortal } from 'react-dom';
import Button from '@/components/button/Button';
import type { UserNotification } from '@/types';
import NotificationActions from './NotificationActions';
import NotificationTypeBadge from './NotificationTypeBadge';
import {
  cardStyle,
  contentStyle,
  countPillStyle,
  footerStyle,
  metaStyle,
  metaWrapStyle,
  overlayStyle,
  titleStyle,
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
            <NotificationTypeBadge type={notification.type} label={notification.typeLabel} />
            <h2 css={titleStyle}>{notification.title}</h2>
            <p css={contentStyle}>{notification.content}</p>
            <p css={metaStyle}>
              {notification.senderLabel} · {notification.createdAt.slice(0, 10)}
            </p>
            {isLast ? (
              <NotificationActions
                type={notification.type}
                onConfirm={onConfirm}
                onInquiry={onInquiry}
              />
            ) : (
              <div css={footerStyle}>
                <Button variant="primary" fullWidth onClick={onNext}>
                  다음 ({remaining}개 남음)
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    );

    return createPortal(node, document.body);
  },
);

NotificationModal.displayName = 'NotificationModal';
export default NotificationModal;
