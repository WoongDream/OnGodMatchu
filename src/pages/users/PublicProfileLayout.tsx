import { memo } from 'react';
import { Link, NavLink, Outlet, useParams } from 'react-router-dom';
import ProfileCard from '@/components/profile-card';
import useProfileSummary from '@/hooks/useProfileSummary';
import type { MyQuizzesAggregate, PublicProfileSummary } from '@/types';
import {
  wrapperStyle,
  sideColumnStyle,
  mainColumnStyle,
  noticeStyle,
  noticeLinkStyle,
  skeletonStyle,
} from '@/pages/profile/ProfileLayout.style';
import { navStyle, groupLabelStyle, navLinkStyle, countStyle } from './PublicProfileLayout.style';

export type PublicProfileContext = {
  publicId: string;
  summary: PublicProfileSummary;
};

const toAggregate = (s: PublicProfileSummary): MyQuizzesAggregate => ({
  totalQuizCount: s.quizCount,
  totalPlayCount: s.totalPlayCount,
  totalShareCount: 0,
  totalStarCount: s.totalStarCount,
  totalCommentCount: 0,
  weeklyPlayCount: 0,
  avgCorrectRate: null,
  solvedCount: s.solvedCount,
  avgSolveRate: s.avgSolveRate,
});

const PublicProfileLayout = memo(() => {
  const { publicId } = useParams<{ publicId: string }>();
  const { summary, isLoading, error } = useProfileSummary(publicId);

  if (isLoading) {
    return <div css={skeletonStyle}>프로필을 불러오는 중...</div>;
  }

  if (error || !summary) {
    return (
      <div css={noticeStyle}>
        <span>프로필을 불러오지 못했습니다.</span>
        <Link to="/" css={noticeLinkStyle}>
          홈으로
        </Link>
      </div>
    );
  }

  if (!summary.isProfilePublic) {
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
          nickname={summary.nickname}
          imageUrl={summary.profileImageUrl}
          bio={summary.bio ?? undefined}
          isProfilePublic={summary.isProfilePublic}
          stats={toAggregate(summary)}
        />
        <nav css={navStyle} aria-label="프로필 메뉴">
          <span css={groupLabelStyle}>퀴즈</span>
          <NavLink to="quizzes-made" css={navLinkStyle}>
            <span>만든 퀴즈</span>
            <span css={countStyle}>{summary.quizCount}</span>
          </NavLink>
          <NavLink to="quizzes-played" css={navLinkStyle}>
            <span>푼 퀴즈</span>
            <span css={countStyle}>{summary.solvedCount}</span>
          </NavLink>
        </nav>
      </aside>
      <div css={mainColumnStyle}>
        <Outlet context={{ publicId: publicId as string, summary }} />
      </div>
    </div>
  );
});

PublicProfileLayout.displayName = 'PublicProfileLayout';
export default PublicProfileLayout;
