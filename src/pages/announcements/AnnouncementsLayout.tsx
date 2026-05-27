import { memo } from 'react';
import { Outlet } from 'react-router-dom';
import useNoticesInfinite from '@/hooks/useNoticesInfinite';
import { getReleaseNotesCount } from '@/lib/release-notes/getAll';
import AnnouncementsSidebar from '@/components/announcements-sidebar';
import AnnouncementsTabBar from '@/components/announcements-tab-bar';
import {
  wrapperStyle,
  sideColumnStyle,
  mainColumnStyle,
  desktopOnlyStyle,
  mobileOnlyStyle,
} from './AnnouncementsLayout.style';

const AnnouncementsLayout = memo(() => {
  const { totalElements: announcementCount } = useNoticesInfinite({
    kind: 'announcements',
    size: 1,
  });
  const releaseNoteCount = getReleaseNotesCount();

  return (
    <div css={wrapperStyle}>
      <aside css={sideColumnStyle}>
        <div css={desktopOnlyStyle}>
          <AnnouncementsSidebar
            announcementCount={announcementCount}
            releaseNoteCount={releaseNoteCount}
          />
        </div>
      </aside>
      <div css={mainColumnStyle}>
        <div css={mobileOnlyStyle}>
          <AnnouncementsTabBar
            announcementCount={announcementCount}
            releaseNoteCount={releaseNoteCount}
          />
        </div>
        <Outlet />
      </div>
    </div>
  );
});

AnnouncementsLayout.displayName = 'AnnouncementsLayout';
export default AnnouncementsLayout;
