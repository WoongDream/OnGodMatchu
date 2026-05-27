import { memo } from 'react';
import { NavLink } from 'react-router-dom';
import { AnnouncementIcon, ReleaseNoteIcon } from '@/components/icon';
import {
  navStyle,
  groupHeaderStyle,
  linkStyle,
  countStyle,
  iconStyle,
} from './AnnouncementsSidebar.style';

export type AnnouncementsSidebarProps = {
  announcementCount: number;
  releaseNoteCount: number;
};

const AnnouncementsSidebar = memo(
  ({ announcementCount, releaseNoteCount }: AnnouncementsSidebarProps) => {
    return (
      <nav css={navStyle} aria-label="공지 메뉴">
        <div css={groupHeaderStyle}>공지 / 릴리즈</div>
        <NavLink to="/announcements/notices" css={linkStyle}>
          <span css={iconStyle}>
            <AnnouncementIcon size={18} />
          </span>
          <span>공지사항</span>
          <span css={countStyle}>{announcementCount}</span>
        </NavLink>
        <NavLink to="/announcements/release-notes" css={linkStyle}>
          <span css={iconStyle}>
            <ReleaseNoteIcon size={18} />
          </span>
          <span>릴리즈 노트</span>
          <span css={countStyle}>{releaseNoteCount}</span>
        </NavLink>
      </nav>
    );
  },
);

AnnouncementsSidebar.displayName = 'AnnouncementsSidebar';
export default AnnouncementsSidebar;
