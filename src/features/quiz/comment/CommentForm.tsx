import { memo, useState, type FormEvent } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Button from '@/components/button';
import ProfileImage from '@/components/profile-image';
import { COMMENT_MAX_LENGTH } from '@/api/comment';
import {
  cardStyle,
  captionStyle,
  errorStyle,
  footerStyle,
  inputAreaStyle,
  loginPromptActionStyle,
  loginPromptCardStyle,
  loginPromptTextStyle,
  nicknameLabelStyle,
  textareaStyle,
  userRowStyle,
} from './CommentForm.style';

type CommentFormProps = {
  isLoggedIn: boolean;
  /** 로그인 시 표시되는 닉네임 / 프로필 이미지 */
  nickname?: string;
  profileImageUrl?: string | null;
  isSubmitting?: boolean;
  errorMessage?: string | null;
  onSubmit: (content: string) => Promise<void> | void;
};

const CommentForm = memo(
  ({
    isLoggedIn,
    nickname,
    profileImageUrl,
    isSubmitting,
    errorMessage,
    onSubmit,
  }: CommentFormProps) => {
    const [content, setContent] = useState('');
    const navigate = useNavigate();
    const location = useLocation();

    if (!isLoggedIn) {
      return (
        <div css={loginPromptCardStyle}>
          <div css={loginPromptTextStyle}>
            <strong>댓글을 남기려면 로그인이 필요해요</strong>
            <span>로그인하고 다른 사람들과 의견을 나눠보세요.</span>
          </div>
          <div css={loginPromptActionStyle}>
            <Button
              onClick={() =>
                navigate('/login', { state: { from: location.pathname + location.search } })
              }
            >
              로그인하고 댓글 남기기 →
            </Button>
          </div>
        </div>
      );
    }

    const trimmed = content.trim();
    const disabled = trimmed.length === 0 || trimmed.length > COMMENT_MAX_LENGTH || !!isSubmitting;

    const handleSubmit = async (e: FormEvent) => {
      e.preventDefault();
      if (disabled) {
        return;
      }
      await onSubmit(trimmed);
      setContent('');
    };

    return (
      <form css={cardStyle} onSubmit={handleSubmit} aria-label="댓글 작성">
        <div css={userRowStyle}>
          <ProfileImage nickname={nickname ?? '나'} imageUrl={profileImageUrl ?? null} size="sm" />
          <span css={nicknameLabelStyle}>{nickname}</span>
        </div>
        <div css={inputAreaStyle}>
          <textarea
            css={textareaStyle}
            placeholder="댓글을 입력하세요"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            maxLength={COMMENT_MAX_LENGTH}
            rows={3}
            aria-label="댓글 본문"
          />
        </div>
        <div css={footerStyle}>
          <span css={captionStyle}>욕설·비방·스팸은 이용 제한될 수 있어요.</span>
          <Button type="submit" disabled={disabled}>
            {isSubmitting ? '댓글 남기는 중...' : '댓글 남기기'}
          </Button>
        </div>
        {errorMessage && <p css={errorStyle}>{errorMessage}</p>}
      </form>
    );
  },
);

CommentForm.displayName = 'CommentForm';
export default CommentForm;
