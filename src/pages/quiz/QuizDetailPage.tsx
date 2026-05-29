import { memo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Button from '@/components/button';
import LoginPromptModal from '@/components/login-prompt-modal';
import ProfileImage from '@/components/profile-image';
import QuizPlayOptions, { type StartOption } from '@/components/quiz-play-options';
import ShareButton from '@/components/share-button';
import StarButton from '@/components/star-button';
import { PlayIcon } from '@/components/icon';
import { useToast } from '@/components/toast';
import { CATEGORIES } from '@/types/quiz';
import { formatCount } from '@/lib/format/count';
import { pageWrapperStyle } from '@/styles/layout';
import { CommentList, CommentForm } from '@/features/quiz/comment';
import useAuthStore from '@/store/authStore';
import useComments from '@/hooks/useComments';
import useQuizDetail from '@/hooks/useQuizDetail';
import useShareQuiz from '@/hooks/useShareQuiz';
import useToggleStar from '@/hooks/useToggleStar';
import {
  authorBlockStyle,
  authorDateStyle,
  authorDividerStyle,
  authorLabelStyle,
  authorNameStyle,
  authorProfileButtonStyle,
  commentsHeaderStyle,
  commentsSectionStyle,
  descriptionStyle,
  metaActionsRowStyle,
  metaCategoryStyle,
  metaHeaderRowStyle,
  metaPanelStyle,
  metaPlayCountStyle,
  thumbnailStyle,
  titleBlockStyle,
  titleStyle,
  topGridStyle,
  wrapperStyle,
} from './QuizDetailPage.style';

const formatAuthorDate = (iso: string): string => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) {
    return iso;
  }
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;
};

const QuizDetailPage = memo(() => {
  const { id } = useParams<{ id: string }>();
  const quizId = Number(id);
  const navigate = useNavigate();
  const toast = useToast();

  const { quiz, isLoading, error } = useQuizDetail(quizId);
  const { isLoggedIn, user } = useAuthStore();
  const { toggle: toggleStar, pendingQuizId } = useToggleStar();
  const isStarPending = pendingQuizId === quizId;
  const { share } = useShareQuiz(quizId);
  const { comments, totalElements, create, remove, isMutating, mutationError } =
    useComments(quizId);

  const [isLoginPromptOpen, setIsLoginPromptOpen] = useState(false);

  if (isLoading) {
    return (
      <div css={pageWrapperStyle('lg')}>
        <p>로딩 중...</p>
      </div>
    );
  }

  if (error || !quiz) {
    const status = (error as { response?: { status?: number } } | null | undefined)?.response
      ?.status;
    const message =
      status === 403 || status === 404
        ? '비공개 퀴즈이거나 존재하지 않는 퀴즈입니다.'
        : '퀴즈를 불러오지 못했습니다.';
    return (
      <div css={pageWrapperStyle('lg')}>
        <p>{message}</p>
        <Button fullWidth onClick={() => navigate('/quiz')}>
          퀴즈 목록으로
        </Button>
      </div>
    );
  }

  const categoryLabel = CATEGORIES.find((c) => c.value === quiz.category)?.label ?? quiz.category;
  const questionCount = quiz.questions.length;

  const handleStartPlay = (option: StartOption) => {
    navigate(`/quiz/${quizId}/play`, { state: option });
  };

  const handleStarClick = async () => {
    if (!isLoggedIn) {
      setIsLoginPromptOpen(true);
      return;
    }
    try {
      await toggleStar(quizId, !!quiz.isStarred);
    } catch {
      // silent — hook 이 메시지 보관, Toast 는 공유 전용
    }
  };

  const handleShareClick = async () => {
    const result = await share();
    if (result === 'copied') {
      toast.success('링크가 복사되었어요');
    } else if (result === 'failed') {
      toast.error('링크 복사에 실패했어요');
    }
  };

  const handleCreateComment = async (content: string) => {
    await create(content);
  };

  return (
    <div css={wrapperStyle}>
      <div css={topGridStyle}>
        <div css={thumbnailStyle}>
          {quiz.thumbnailUrl ? (
            <img src={quiz.thumbnailUrl} alt={quiz.title} />
          ) : (
            <div aria-hidden>QUIZ_THUMBNAIL</div>
          )}
        </div>

        <div css={metaPanelStyle}>
          <header css={metaHeaderRowStyle}>
            <span css={metaCategoryStyle}>{categoryLabel}</span>
          </header>

          <div css={titleBlockStyle}>
            <h1 css={titleStyle}>{quiz.title}</h1>
            <p css={descriptionStyle}>{quiz.description}</p>
          </div>

          <div css={metaActionsRowStyle}>
            <span css={metaPlayCountStyle}>
              <PlayIcon size={20} aria-hidden />
              <span>{formatCount(quiz.playCount)}명 플레이</span>
            </span>
            <StarButton
              variant="chip"
              active={!!quiz.isStarred}
              count={quiz.starCount}
              disabled={isStarPending}
              onClick={handleStarClick}
            />
            <ShareButton variant="chip" count={quiz.shareCount} onClick={handleShareClick} />
          </div>

          <div css={authorBlockStyle}>
            <span css={authorLabelStyle}>만든이</span>
            <span css={authorDividerStyle} aria-hidden />
            <button
              type="button"
              css={authorProfileButtonStyle}
              aria-label={`${quiz.authorNickname} 프로필 보기`}
            >
              <ProfileImage
                nickname={quiz.authorNickname}
                imageUrl={quiz.authorProfileImageUrl ?? null}
                size="sm"
              />
              <span css={authorNameStyle}>{quiz.authorNickname}</span>
            </button>
            <span css={authorDateStyle}>{formatAuthorDate(quiz.createdAt)}</span>
          </div>
        </div>
      </div>

      <QuizPlayOptions questionCount={questionCount} onStart={handleStartPlay} />

      <section css={commentsSectionStyle} aria-label="댓글">
        <h2 css={commentsHeaderStyle}>
          댓글 <span>{formatCount(totalElements)}</span>
        </h2>
        <CommentForm
          isLoggedIn={isLoggedIn}
          nickname={user?.nickname}
          profileImageUrl={user?.profileImageUrl ?? null}
          isSubmitting={isMutating}
          errorMessage={
            mutationError === 'INVALID_COMMENT_FORMAT'
              ? '댓글 형식이 올바르지 않아요. 1~500자 이내로 입력해주세요.'
              : mutationError === 'UNAUTHORIZED'
                ? '로그인이 필요해요.'
                : mutationError === 'NETWORK'
                  ? '네트워크 오류로 댓글을 작성하지 못했어요.'
                  : null
          }
          onSubmit={handleCreateComment}
        />
        <CommentList
          comments={comments}
          currentUserNickname={user?.nickname ?? null}
          onDelete={(commentId) => {
            void remove(commentId);
          }}
          isMutating={isMutating}
        />
      </section>

      <LoginPromptModal
        isOpen={isLoginPromptOpen}
        onClose={() => setIsLoginPromptOpen(false)}
        title="로그인이 필요해요"
        message="로그인하고 스타를 눌러 좋아하는 퀴즈를 모아보세요."
      />
    </div>
  );
});

QuizDetailPage.displayName = 'QuizDetailPage';
export default QuizDetailPage;
