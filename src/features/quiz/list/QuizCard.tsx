import { memo } from 'react';
import { CommentIcon, PlayIcon, ShareIcon, StarIcon } from '@/components/icon';
import StarButton from '@/components/star-button';
import { CATEGORIES } from '@/types/quiz';
import { formatCount } from '@/lib/format/count';
import type { QuizCardProps } from './QuizCard.type';
import {
  categoryStyle,
  descriptionStyle,
  metricsRowStyle,
  metricItemStyle,
  starCornerStyle,
  thumbnailStyle,
  titleStyle,
  wrapperStyle,
} from './QuizCard.style';

const QuizCard = memo(({ quiz, onClick, onStarClick, isStarPending }: QuizCardProps) => {
  const handleClick = () => {
    onClick(quiz.id);
  };

  const handleStar = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    onStarClick(quiz.id, !!quiz.isStarred, e);
  };

  const categoryLabel = CATEGORIES.find((c) => c.value === quiz.category)?.label ?? quiz.category;

  return (
    <article css={wrapperStyle} onClick={handleClick}>
      <div css={thumbnailStyle}>{quiz.thumbnailUrl && <img src={quiz.thumbnailUrl} alt="" />}</div>
      <span css={categoryStyle}>{categoryLabel}</span>
      <h3 css={titleStyle}>{quiz.title}</h3>
      <p css={descriptionStyle}>{quiz.description}</p>
      <div css={metricsRowStyle}>
        <span css={metricItemStyle} aria-label={`플레이 ${quiz.playCount}회`}>
          <PlayIcon size={14} aria-hidden /> {formatCount(quiz.playCount)}
        </span>
        <span css={metricItemStyle} aria-label={`스타 ${quiz.starCount}개`}>
          <StarIcon size={14} aria-hidden /> {formatCount(quiz.starCount)}
        </span>
        <span css={metricItemStyle} aria-label={`댓글 ${quiz.commentCount}개`}>
          <CommentIcon size={14} aria-hidden /> {formatCount(quiz.commentCount)}
        </span>
        <span css={metricItemStyle} aria-label={`공유 ${quiz.shareCount}회`}>
          <ShareIcon size={14} aria-hidden /> {formatCount(quiz.shareCount)}
        </span>
        <span css={starCornerStyle}>
          <StarButton
            active={!!quiz.isStarred}
            variant="icon"
            size="lg"
            showCount={false}
            disabled={isStarPending}
            onClick={handleStar}
          />
        </span>
      </div>
    </article>
  );
});

QuizCard.displayName = 'QuizCard';
export default QuizCard;
