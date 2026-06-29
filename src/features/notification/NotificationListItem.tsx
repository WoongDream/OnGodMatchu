import { memo } from 'react';
import type { UserNotification } from '@/types';
import NotificationTypeBadge from './NotificationTypeBadge';
import {
  chevronStyle,
  contentStyle,
  dateStyle,
  mainStyle,
  rightStyle,
  rowStyle,
  titleRowStyle,
  titleStyle,
} from './NotificationListItem.style';

type Props = {
  notification: UserNotification;
  onSelect: (notification: UserNotification) => void;
};

/** 받은 알림 화면의 리스트 한 행. 유형 배지 + 제목 + 본문 미리보기 + 날짜 + chevron. */
const NotificationListItem = memo(({ notification, onSelect }: Props) => {
  const select = () => onSelect(notification);
  return (
    <div
      css={rowStyle}
      role="button"
      tabIndex={0}
      onClick={select}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          select();
        }
      }}
    >
      <div css={mainStyle}>
        <div css={titleRowStyle}>
          <NotificationTypeBadge type={notification.type} label={notification.typeLabel} />
          <span css={titleStyle}>{notification.title}</span>
        </div>
        <p css={contentStyle}>{notification.content}</p>
      </div>
      <div css={rightStyle}>
        <span css={dateStyle}>{notification.createdAt.slice(0, 10)}</span>
        <svg css={chevronStyle} width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
          <path
            d="M6 3.5L10.5 8L6 12.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  );
});

NotificationListItem.displayName = 'NotificationListItem';
export default NotificationListItem;
