import { memo } from 'react';
import ProfileImage from '@/components/profile-image';
import type { Comment } from '@/types';
import {
  actionsStyle,
  bodyStyle,
  contentStyle,
  deleteButtonStyle,
  headStyle,
  itemStyle,
  nicknameStyle,
  timeStyle,
} from './CommentItem.style';

const formatDateTime = (iso: string): string => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) {
    return iso;
  }
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const mi = String(d.getMinutes()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd} ${hh}:${mi}`;
};

type CommentItemProps = {
  comment: Comment;
  canDelete: boolean;
  onDelete: (commentId: number) => void;
  isMutating?: boolean;
};

const CommentItem = memo(({ comment, canDelete, onDelete, isMutating }: CommentItemProps) => {
  const nickname = comment.authorNickname || '익명';

  return (
    <li css={itemStyle}>
      <ProfileImage nickname={nickname} imageUrl={comment.authorProfileImageUrl} size="sm" />
      <div css={bodyStyle}>
        <div css={headStyle}>
          <span css={nicknameStyle}>{nickname}</span>
          <span css={timeStyle}>{formatDateTime(comment.createdAt)}</span>
        </div>
        <p css={contentStyle}>{comment.content}</p>
      </div>
      {canDelete && (
        <div css={actionsStyle}>
          <button
            type="button"
            css={deleteButtonStyle}
            onClick={() => onDelete(comment.id)}
            disabled={isMutating}
          >
            삭제
          </button>
        </div>
      )}
    </li>
  );
});

CommentItem.displayName = 'CommentItem';
export default CommentItem;
