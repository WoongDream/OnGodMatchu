import { memo } from 'react';
import Modal from '@/components/modal';
import ProfileCard from '@/components/profile-card';
import type { MyQuizzesAggregate, PublicProfileSummary } from '@/types';
import type { ProfileModalViewProps } from './ProfileModal.type';
import { stateStyle, goButtonStyle, bodyPadStyle } from './ProfileModal.style';

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

const ProfileModalView = memo(
  ({ isOpen, onClose, summary, isLoading, error, onGoProfile }: ProfileModalViewProps) => {
    const showButton = !!summary?.isProfilePublic;

    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title=""
        size="sm"
        footer={
          showButton ? (
            <button type="button" css={goButtonStyle} onClick={onGoProfile}>
              프로필 보러가기
            </button>
          ) : undefined
        }
      >
        <div css={showButton ? undefined : bodyPadStyle}>
          {isLoading && <p css={stateStyle}>불러오는 중...</p>}
          {error && !isLoading && <p css={stateStyle}>프로필을 불러오지 못했어요.</p>}
          {summary && !isLoading && !error && (
            <ProfileCard
              variant="plain"
              nickname={summary.nickname}
              imageUrl={summary.profileImageUrl}
              bio={summary.bio ?? undefined}
              isProfilePublic={summary.isProfilePublic}
              stats={toAggregate(summary)}
              role={summary.role}
            />
          )}
        </div>
      </Modal>
    );
  },
);

ProfileModalView.displayName = 'ProfileModalView';
export default ProfileModalView;
