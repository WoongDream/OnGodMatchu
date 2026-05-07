import { memo } from 'react';
import ProfileImage from '@/components/profile-image';
import Badge from '@/components/badge';
import type { ProfileCardProps } from './ProfileCard.type';
import {
  cardStyle,
  headerRowStyle,
  nicknameStyle,
  bioStyle,
  statsRowStyle,
  statCellStyle,
  statValueStyle,
  statLabelStyle,
  statRowFullStyle,
  statRowLabelStyle,
  statRowValueStyle,
} from './ProfileCard.style';

const formatRate = (rate: number): string => `${Math.round(rate)}%`;

const ProfileCard = memo(
  ({ nickname, imageUrl, bio, isProfilePublic, stats }: ProfileCardProps) => {
    return (
      <section css={cardStyle}>
        <ProfileImage nickname={nickname} imageUrl={imageUrl} size="lg" />
        <div css={headerRowStyle}>
          <span css={nicknameStyle}>{nickname}</span>
          {isProfilePublic && <Badge variant="info">공개</Badge>}
        </div>
        {bio && <p css={bioStyle}>{bio}</p>}
        {stats && (
          <>
            <div css={statsRowStyle}>
              <div css={statCellStyle}>
                <span css={statValueStyle}>{stats.playCount}</span>
                <span css={statLabelStyle}>플레이</span>
              </div>
              <div css={statCellStyle}>
                <span css={statValueStyle}>{formatRate(stats.correctRate)}</span>
                <span css={statLabelStyle}>정답률</span>
              </div>
            </div>
            <div css={statRowFullStyle}>
              <span css={statRowLabelStyle}>만든 퀴즈</span>
              <span css={statRowValueStyle}>{stats.createdQuizCount}</span>
            </div>
          </>
        )}
      </section>
    );
  },
);

ProfileCard.displayName = 'ProfileCard';
export default ProfileCard;
