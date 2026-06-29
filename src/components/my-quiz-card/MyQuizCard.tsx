import { memo, useCallback, useState } from 'react';
import Button from '@/components/button';
import Badge from '@/components/badge';
import ConfirmModal from '@/components/confirm-modal';
import { PlayIcon, ShareIcon, StarIcon, CommentIcon, AccuracyIcon } from '@/components/icon';
import { formatRelativeKo } from '@/lib/time/relative';
import type { MyQuizCardProps } from './MyQuizCard.type';
import {
  cardStyle,
  clickableStyle,
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

const MyQuizCard = memo(
  ({ item, onEdit, onDelete, isMutating = false, readOnly = false, onOpen }: MyQuizCardProps) => {
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const handleEdit = useCallback(() => onEdit?.(item.id), [onEdit, item.id]);
    const openConfirm = useCallback(() => setIsConfirmOpen(true), []);
    const closeConfirm = useCallback(() => setIsConfirmOpen(false), []);
    const handleConfirmDelete = useCallback(() => {
      onDelete?.(item.id);
      setIsConfirmOpen(false);
    }, [onDelete, item.id]);
    const handleOpen = useCallback(() => onOpen?.(item.id), [onOpen, item.id]);

    const interactiveProps = readOnly
      ? {
          role: 'button' as const,
          tabIndex: 0,
          onClick: handleOpen,
          onKeyDown: (e: React.KeyboardEvent<HTMLElement>) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleOpen();
            }
          },
          'aria-label': `${item.title} 퀴즈 보기`,
        }
      : {};

    return (
      <article css={readOnly ? [cardStyle, clickableStyle] : cardStyle} {...interactiveProps}>
        <div css={thumbStyle}>{item.thumbnailUrl && <img src={item.thumbnailUrl} alt="" />}</div>
        <div css={bodyStyle}>
          <div css={metaRowStyle}>
            <span css={categoryStyle}>{item.categoryLabel}</span>
            {!readOnly && (
              <Badge variant={item.isPublic ? 'info' : 'warning'}>
                {item.isPublic ? '공개' : '비공개'}
              </Badge>
            )}
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
        {!readOnly && (
          <div css={actionsStyle}>
            <Button variant="secondary" size="sm" onClick={handleEdit} disabled={isMutating}>
              편집
            </Button>
            <Button variant="ghost" size="sm" onClick={openConfirm} disabled={isMutating}>
              삭제
            </Button>
          </div>
        )}
        {!readOnly && (
          <ConfirmModal
            isOpen={isConfirmOpen}
            onClose={closeConfirm}
            onConfirm={handleConfirmDelete}
            title="이 퀴즈를 삭제할까요?"
            message="삭제하면 되돌릴 수 없어요."
            confirmLabel="삭제"
            confirmVariant="danger"
            isConfirming={isMutating}
            confirmingLabel="삭제 중..."
          />
        )}
      </article>
    );
  },
);

MyQuizCard.displayName = 'MyQuizCard';
export default MyQuizCard;
