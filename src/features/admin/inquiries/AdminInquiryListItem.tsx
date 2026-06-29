import { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import ProfileImage from '@/components/profile-image/ProfileImage';
import InquiryStatusBadge from '@/components/inquiry-status-badge/InquiryStatusBadge';
import type { BoInquiryListItem } from '@/types';
import {
  authorCellStyle,
  authorNameStyle,
  chevronStyle,
  dateCellStyle,
  rowStyle,
  titleStyle,
} from './AdminInquiryListItem.style';

type AdminInquiryListItemProps = {
  item: BoInquiryListItem;
};

const AdminInquiryListItem = memo(({ item }: AdminInquiryListItemProps) => {
  const navigate = useNavigate();
  const select = () => navigate(`/admin/inquiries/${item.id}`);

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
      <span css={titleStyle}>{item.title}</span>
      <div css={authorCellStyle}>
        <ProfileImage
          nickname={item.author.nickname}
          imageUrl={item.author.profileImageUrl}
          size="sm"
        />
        <span css={authorNameStyle}>{item.author.nickname}</span>
      </div>
      <InquiryStatusBadge status={item.status} />
      <span css={dateCellStyle}>{item.createdAt.slice(0, 10)}</span>
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
  );
});

AdminInquiryListItem.displayName = 'AdminInquiryListItem';
export default AdminInquiryListItem;
