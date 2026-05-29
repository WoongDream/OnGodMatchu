import { memo } from 'react';
import ProfileImage from '@/components/profile-image';
import Badge from '@/components/badge';
import { PlayIcon, QuizIcon } from '@/components/icon';
import { formatCount } from '@/lib/format/count';
import type { ProfileCardProps } from './ProfileCard.type';
import {
  cardStyle,
  headerRowStyle,
  nicknameStyle,
  bioStyle,
  statsGroupStyle,
  statBlockStyle,
  blockTitleStyle,
  statRowStyle,
  statCellStyle,
  statValueStyle,
  statLabelStyle,
  statDividerStyle,
} from './ProfileCard.style';

const formatRate = (rate: number | null | undefined): string =>
  rate == null ? '—' : `${Math.round(rate)}%`;

const ProfileCard = memo(
  ({ nickname, imageUrl, bio, isProfilePublic, stats }: ProfileCardProps) => {
    return (
      <section css={cardStyle}>
        <ProfileImage nickname={nickname} imageUrl={imageUrl} size="lg" />
        <div css={headerRowStyle}>
          <span css={nicknameStyle}>{nickname}</span>
          <Badge variant={isProfilePublic ? 'info' : 'neutral'}>
            {isProfilePublic ? '공개' : '비공개'}
          </Badge>
        </div>
        {bio && <p css={bioStyle}>{bio}</p>}
        {stats && (
          <div css={statsGroupStyle}>
            <section css={statBlockStyle}>
              <h3 css={blockTitleStyle}>
                <PlayIcon size={14} aria-hidden />
                플레이 기록
              </h3>
              <div css={statRowStyle}>
                <div css={statCellStyle}>
                  <span css={statValueStyle}>{formatCount(stats.solvedCount ?? 0)}</span>
                  <span css={statLabelStyle}>풀어봄</span>
                </div>
                <span css={statDividerStyle} aria-hidden />
                <div css={statCellStyle}>
                  <span css={statValueStyle}>{formatRate(stats.avgSolveRate)}</span>
                  <span css={statLabelStyle}>정답률</span>
                </div>
              </div>
            </section>
            <section css={statBlockStyle}>
              <h3 css={blockTitleStyle}>
                <QuizIcon size={14} aria-hidden />
                만든 퀴즈
              </h3>
              <div css={statRowStyle}>
                <div css={statCellStyle}>
                  <span css={statValueStyle}>{formatCount(stats.totalQuizCount)}</span>
                  <span css={statLabelStyle}>총 개수</span>
                </div>
                <span css={statDividerStyle} aria-hidden />
                <div css={statCellStyle}>
                  <span css={statValueStyle}>{formatCount(stats.totalPlayCount)}</span>
                  <span css={statLabelStyle}>총 플레이</span>
                </div>
                <span css={statDividerStyle} aria-hidden />
                <div css={statCellStyle}>
                  <span css={statValueStyle}>{formatCount(stats.totalStarCount)}</span>
                  <span css={statLabelStyle}>받은 스타</span>
                </div>
              </div>
            </section>
          </div>
        )}
      </section>
    );
  },
);

ProfileCard.displayName = 'ProfileCard';
export default ProfileCard;
