import { memo } from 'react';
import type { Comment } from '@/types';
import CommentItem from './CommentItem';
import { emptyStyle, listStyle } from './CommentList.style';

type CommentListProps = {
  comments: Comment[];
  /** 본인 댓글 판정용. 닉네임은 BE 에서 unique 제약. */
  currentUserNickname: string | null;
  onDelete: (commentId: number) => void;
  isMutating?: boolean;
  /** 글쓴이 프로필 클릭 시 (publicId 전달) — 프로필 모달 오픈용 */
  onAuthorClick?: (publicId: string) => void;
};

const CommentList = memo(
  ({ comments, currentUserNickname, onDelete, isMutating, onAuthorClick }: CommentListProps) => {
    if (comments.length === 0) {
      return <p css={emptyStyle}>첫 번째 댓글을 남겨보세요.</p>;
    }

    return (
      <ul css={listStyle}>
        {comments.map((c) => (
          <CommentItem
            key={c.id}
            comment={c}
            canDelete={!!currentUserNickname && currentUserNickname === c.authorNickname}
            onDelete={onDelete}
            isMutating={isMutating}
            onAuthorClick={onAuthorClick}
          />
        ))}
      </ul>
    );
  },
);

CommentList.displayName = 'CommentList';
export default CommentList;
