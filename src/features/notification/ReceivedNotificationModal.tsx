import { memo } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import type { UserNotification } from '@/types';
import NotificationActions from './NotificationActions';
import NotificationTypeBadge from './NotificationTypeBadge';
import {
  cardStyle,
  contentStyle,
  metaStyle,
  metaWrapStyle,
  overlayStyle,
  titleStyle,
} from './NotificationModal.style';

type Props = {
  notification: UserNotification;
  onClose: () => void;
};

/**
 * 받은 알림 화면에서 리스트 아이템을 눌렀을 때 뜨는 단건 모달.
 * 큐(다음/M/N) 개념 없이 본문 전체를 보여준다. 버튼은 종류별 — INFO [확인] / WARNING [확인][문의하기].
 */
const ReceivedNotificationModal = memo(({ notification, onClose }: Props) => {
  const navigate = useNavigate();

  const handleInquiry = () => {
    onClose();
    navigate('/inquiry');
  };

  const node = (
    <div css={overlayStyle} onClick={onClose}>
      <div css={metaWrapStyle}>
        <div
          css={cardStyle}
          role="dialog"
          aria-modal="true"
          aria-label={notification.title}
          onClick={(e) => e.stopPropagation()}
        >
          <NotificationTypeBadge type={notification.type} label={notification.typeLabel} />
          <h2 css={titleStyle}>{notification.title}</h2>
          <p css={contentStyle}>{notification.content}</p>
          <p css={metaStyle}>
            {notification.senderLabel} · {notification.createdAt.slice(0, 10)}
          </p>
          <NotificationActions
            type={notification.type}
            onConfirm={onClose}
            onInquiry={handleInquiry}
          />
        </div>
      </div>
    </div>
  );

  return createPortal(node, document.body);
});

ReceivedNotificationModal.displayName = 'ReceivedNotificationModal';
export default ReceivedNotificationModal;
