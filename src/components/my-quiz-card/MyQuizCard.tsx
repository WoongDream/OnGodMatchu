import { memo, useCallback } from 'react';
import Button from '@/components/button';
import Badge from '@/components/badge';
import { PlayIcon, ShareIcon, StarIcon, CommentIcon, AccuracyIcon } from '@/components/icon';
import { formatRelativeKo } from '@/lib/time/relative';
import type { MyQuizCardProps } from './MyQuizCard.type';
import {
  cardStyle,
  thumbStyle,
  bodyStyle,
  metaRowStyle,
  categoryStyle,
  dotStyle,
  timeStyle,
  titleStyle,
  statsRowStyle,
  statItemStyle,
  actionsStyle,
} from './MyQuizCard.style';

const formatNumber = (n: number): string => n.toLocaleString('ko-KR');

const formatRate = (rate: number | null): string => (rate === null ? '—' : `${Math.round(rate)}%`);

const STAT_ICON_SIZE = 14;

const MyQuizCard = memo(({ item, onEdit, onDelete, isMutating = false }: MyQuizCardProps) => {
  const handleEdit = useCallback(() => onEdit(item.id), [onEdit, item.id]);
  const handleDelete = useCallback(() => {
    if (window.confirm('이 퀴즈를 삭제할까요? 되돌릴 수 없습니다.')) {
      onDelete(item.id);
    }
  }, [onDelete, item.id]);

  return (
    <article css={cardStyle}>
      <div css={thumbStyle}>{item.thumbnailUrl && <img src={item.thumbnailUrl} alt="" />}</div>
      <div css={bodyStyle}>
        <div css={metaRowStyle}>
          <span css={categoryStyle}>{item.categoryLabel}</span>
          <Badge variant={item.isPublic ? 'info' : 'warning'}>
            {item.isPublic ? '공개' : '비공개'}
          </Badge>
          <span css={dotStyle} aria-hidden="true">
            ·
          </span>
          <span css={timeStyle}>{formatRelativeKo(item.updatedAt)}</span>
        </div>
        <h3 css={titleStyle}>{item.title}</h3>
        <div css={statsRowStyle}>
          <span css={statItemStyle} aria-label="플레이">
            <PlayIcon size={STAT_ICON_SIZE} />
            {formatNumber(item.playCount)}
          </span>
          <span css={statItemStyle} aria-label="스타">
            <StarIcon size={STAT_ICON_SIZE} />
            {formatNumber(item.starCount)}
          </span>
          <span css={statItemStyle} aria-label="댓글">
            <CommentIcon size={STAT_ICON_SIZE} />
            {formatNumber(item.commentCount)}
          </span>
          <span css={statItemStyle} aria-label="공유">
            <ShareIcon size={STAT_ICON_SIZE} />
            {formatNumber(item.shareCount)}
          </span>
          <span css={statItemStyle} aria-label="정답률">
            <AccuracyIcon size={STAT_ICON_SIZE} />
            {formatRate(item.correctRate)}
          </span>
        </div>
      </div>
      <div css={actionsStyle}>
        <Button variant="secondary" size="sm" onClick={handleEdit} disabled={isMutating}>
          편집
        </Button>
        <Button variant="ghost" size="sm" onClick={handleDelete} disabled={isMutating}>
          삭제
        </Button>
      </div>
    </article>
  );
});

MyQuizCard.displayName = 'MyQuizCard';
export default MyQuizCard;
