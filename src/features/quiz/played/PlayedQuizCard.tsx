import { memo } from 'react';
import { CommentIcon, PlayIcon, ShareIcon, StarIcon } from '@/components/icon';
import { formatCount } from '@/lib/format/count';
import { formatRelativeKo } from '@/lib/time/relative';
import {
  type PlayedQuizCardProps,
  TOP_PERCENTILE_HIGHLIGHT_THRESHOLD,
} from './PlayedQuizCard.type';
import {
  bodyStyle,
  categoryStyle,
  dateStyle,
  metricItemStyle,
  metricsRowStyle,
  recordItemStyle,
  recordLabelStyle,
  recordRowStyle,
  recordValueStyle,
  replayChipStyle,
  replayCountStyle,
  thumbnailStyle,
  titleStyle,
  topPercentileStyle,
  wrapperStyle,
} from './PlayedQuizCard.style';

const PlayedQuizCard = memo(({ attempt, onClick }: PlayedQuizCardProps) => {
  const {
    quizId,
    quizTitle,
    quizCategoryLabel,
    quizThumbnailUrl,
    playCount,
    starCount,
    commentCount,
    shareCount,
    score,
    totalQuestions,
    topPercentile,
    timeLimitSec,
    attemptCount,
    completedAt,
  } = attempt;

  const highlightTop =
    topPercentile !== null && topPercentile <= TOP_PERCENTILE_HIGHLIGHT_THRESHOLD;

  return (
    <article css={wrapperStyle} onClick={() => onClick(quizId)}>
      <div css={thumbnailStyle}>{quizThumbnailUrl && <img src={quizThumbnailUrl} alt="" />}</div>
      <div css={bodyStyle}>
        <span css={categoryStyle}>{quizCategoryLabel}</span>
        <h3 css={titleStyle}>{quizTitle}</h3>
        <div css={metricsRowStyle}>
          <span css={metricItemStyle} aria-label={`플레이 ${playCount}회`}>
            <PlayIcon size={14} aria-hidden /> {formatCount(playCount)}
          </span>
          <span css={metricItemStyle} aria-label={`스타 ${starCount}개`}>
            <StarIcon size={14} aria-hidden /> {formatCount(starCount)}
          </span>
          <span css={metricItemStyle} aria-label={`댓글 ${commentCount}개`}>
            <CommentIcon size={14} aria-hidden /> {formatCount(commentCount)}
          </span>
          <span css={metricItemStyle} aria-label={`공유 ${shareCount}회`}>
            <ShareIcon size={14} aria-hidden /> {formatCount(shareCount)}
          </span>
        </div>

        <div css={recordRowStyle}>
          <span css={recordLabelStyle}>내 기록</span>
          <span css={recordItemStyle}>
            {timeLimitSec !== null ? `타이머 ${timeLimitSec}초` : '타이머 없음'}
          </span>
          <span css={recordItemStyle}>
            풀이{' '}
            <span css={recordValueStyle}>
              {score}/{totalQuestions}
            </span>
          </span>
          {topPercentile !== null && (
            <span css={recordItemStyle}>
              상위 <span css={topPercentileStyle(highlightTop)}>{topPercentile}%</span>
            </span>
          )}
          <span css={replayCountStyle}>
            {attemptCount > 1 && <span css={replayChipStyle}>{attemptCount}회 플레이</span>}
            <span css={dateStyle}>{formatRelativeKo(completedAt)}</span>
          </span>
        </div>
      </div>
    </article>
  );
});

PlayedQuizCard.displayName = 'PlayedQuizCard';
export default PlayedQuizCard;
