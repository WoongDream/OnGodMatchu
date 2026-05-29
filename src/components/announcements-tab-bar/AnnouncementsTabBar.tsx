import { memo } from 'react';
import { NavLink } from 'react-router-dom';
import { tabsStyle, tabStyle, countStyle } from './AnnouncementsTabBar.style';

export type AnnouncementsTabBarProps = {
  announcementCount: number;
  releaseNoteCount: number;
};

const AnnouncementsTabBar = memo(
  ({ announcementCount, releaseNoteCount }: AnnouncementsTabBarProps) => {
    return (
      <nav css={tabsStyle} aria-label="공지 메뉴">
        <NavLink to="/announcements/notices" css={tabStyle}>
          공지사항
          <span css={countStyle}>{announcementCount}</span>
        </NavLink>
        <NavLink to="/announcements/release-notes" css={tabStyle}>
          릴리즈 노트
          <span css={countStyle}>{releaseNoteCount}</span>
        </NavLink>
      </nav>
    );
  },
);

AnnouncementsTabBar.displayName = 'AnnouncementsTabBar';
export default AnnouncementsTabBar;
