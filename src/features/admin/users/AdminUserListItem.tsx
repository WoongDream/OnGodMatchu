import { memo } from 'react';
import ProfileImage from '@/components/profile-image/ProfileImage';
import type { AdminUser } from '@/api/admin';
import RoleBadge from './RoleBadge';
import StatusBadge from './StatusBadge';
import {
  actionCellStyle,
  chevronStyle,
  dateCellStyle,
  nicknameStyle,
  notifyButtonStyle,
  rowStyle,
  userCellStyle,
} from './AdminUserListItem.style';

type Props = {
  user: AdminUser;
  onSelect: (userId: string) => void;
  onNotify: (user: AdminUser) => void;
};

const AdminUserListItem = memo(({ user, onSelect, onNotify }: Props) => {
  const select = () => onSelect(user.userId);
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
      <div css={userCellStyle}>
        <ProfileImage nickname={user.nickname} imageUrl={user.profileImageUrl} size="sm" />
        <span css={nicknameStyle}>{user.nickname}</span>
      </div>
      <RoleBadge role={user.role} />
      <span css={dateCellStyle}>{user.createdAt.slice(0, 10)}</span>
      <StatusBadge status={user.status} />
      <div css={actionCellStyle}>
        <button
          type="button"
          css={notifyButtonStyle}
          onClick={(e) => {
            e.stopPropagation();
            onNotify(user);
          }}
        >
          알림 보내기
        </button>
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

AdminUserListItem.displayName = 'AdminUserListItem';
export default AdminUserListItem;
