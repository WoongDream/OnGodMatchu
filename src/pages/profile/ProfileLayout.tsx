import { memo } from 'react';
import { Outlet, useParams, Link } from 'react-router-dom';
import useProfile from '@/hooks/useProfile';
import ProfileCard from '@/components/profile-card';
import ProfileSidebar from '@/components/profile-sidebar';
import ProfileTabBar from '@/components/profile-tab-bar';
import {
  wrapperStyle,
  sideColumnStyle,
  mainColumnStyle,
  desktopOnlyStyle,
  mobileOnlyStyle,
  noticeStyle,
  noticeLinkStyle,
  skeletonStyle,
} from './ProfileLayout.style';

const ProfileLayout = memo(() => {
  const { userId: userIdParam } = useParams<{ userId?: string }>();
  const userId = userIdParam ? Number(userIdParam) : undefined;
  const { profile, isLoading, error, isMe } = useProfile(userId);

  if (isLoading) {
    return <div css={skeletonStyle}>프로필을 불러오는 중...</div>;
  }

  if (error || !profile) {
    return (
      <div css={noticeStyle}>
        <span>프로필을 불러오지 못했습니다.</span>
        <Link to="/" css={noticeLinkStyle}>
          홈으로
        </Link>
      </div>
    );
  }

  if (!isMe && !profile.isProfilePublic) {
    return (
      <div css={noticeStyle}>
        <span>비공개 프로필입니다.</span>
        <Link to="/" css={noticeLinkStyle}>
          홈으로
        </Link>
      </div>
    );
  }

  return (
    <div css={wrapperStyle}>
      <aside css={sideColumnStyle}>
        <ProfileCard
          nickname={profile.nickname}
          imageUrl={profile.profileImageUrl}
          bio={profile.bio}
          isProfilePublic={profile.isProfilePublic}
          stats={profile.stats}
        />
        <div css={desktopOnlyStyle}>
          <ProfileSidebar isMe={isMe} userId={userId} stats={profile.stats} />
        </div>
      </aside>
      <div css={mainColumnStyle}>
        <div css={mobileOnlyStyle}>
          <ProfileTabBar isMe={isMe} userId={userId} stats={profile.stats} />
        </div>
        <Outlet context={{ profile, isMe }} />
      </div>
    </div>
  );
});

ProfileLayout.displayName = 'ProfileLayout';
export default ProfileLayout;
