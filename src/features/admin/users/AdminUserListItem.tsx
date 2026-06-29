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

/** 탈퇴 유저는 식별정보가 파기돼 원본 값 대신 이 문구로 표시. 아바타는 "탈" 이니셜 기본 이미지. */
const WITHDRAWN_INFO = '탈퇴한 유저 정보 삭제됨';
const WITHDRAWN_AVATAR_NICKNAME = '탈퇴한 사용자';

type Props = {
  user: AdminUser;
  onSelect: (userId: string) => void;
  onNotify: (user: AdminUser) => void;
};

const AdminUserListItem = memo(({ user, onSelect, onNotify }: Props) => {
  const select = () => onSelect(user.userId);
  const withdrawn = user.status === 'WITHDRAWN';
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
        <ProfileImage
          nickname={withdrawn ? WITHDRAWN_AVATAR_NICKNAME : user.nickname}
          imageUrl={withdrawn ? null : user.profileImageUrl}
          size="sm"
        />
        <span css={nicknameStyle}>{withdrawn ? WITHDRAWN_INFO : user.nickname}</span>
      </div>
      <RoleBadge role={user.role} />
      <span css={dateCellStyle}>{user.createdAt.slice(0, 10)}</span>
      <StatusBadge status={user.status} />
      <div css={actionCellStyle}>
        {withdrawn ? null : (
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
        )}
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
