import { memo, useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import LoginPromptModal from '@/components/login-prompt-modal';
import { useToast } from '@/components/toast';
import { formatCount } from '@/lib/format/count';
import { pageWrapperStyle } from '@/styles/layout';
import { CommentForm, CommentList } from '@/features/quiz/comment';
import ResultActions from '@/features/quiz/result/ResultActions';
import ResultDistribution from '@/features/quiz/result/ResultDistribution';
import ResultHeader from '@/features/quiz/result/ResultHeader';
import useAuthStore from '@/store/authStore';
import useComments from '@/hooks/useComments';
import useQuizDetail from '@/hooks/useQuizDetail';
import useQuizScoreDistribution from '@/hooks/useQuizScoreDistribution';
import useShareQuiz from '@/hooks/useShareQuiz';
import useToggleStar from '@/hooks/useToggleStar';
import type { AttemptResponse, Question } from '@/types';
import { commentsHeaderStyle, commentsSectionStyle, pageStyle } from './QuizResultPage.style';

type ResultState = {
  result: AttemptResponse;
  questions: Question[];
};

const QuizResultPage = memo(() => {
  const { id } = useParams<{ id: string }>();
  const quizId = Number(id);
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const state = location.state as ResultState | null;

  const { quiz } = useQuizDetail(quizId);
  const { data: distribution } = useQuizScoreDistribution(quizId);
  const { isLoggedIn, user } = useAuthStore();
  const { toggle: toggleStar, pendingQuizId } = useToggleStar();
  const isStarPending = pendingQuizId === quizId;
  const { share } = useShareQuiz(quizId);
  const { comments, totalElements, create, remove, isMutating, mutationError } =
    useComments(quizId);

  const [isLoginPromptOpen, setIsLoginPromptOpen] = useState(false);

  useEffect(() => {
    if (!state) {
      navigate('/', { replace: true });
    }
  }, [state, navigate]);

  if (!state) {
    return null;
  }

  const { result } = state;

  const handleRetry = () => {
    navigate(`/quiz/${quizId}`);
  };

  const handleStar = async () => {
    if (!isLoggedIn) {
      setIsLoginPromptOpen(true);
      return;
    }
    if (!quiz) {
      return;
    }
    try {
      await toggleStar(quizId, !!quiz.isStarred);
    } catch {
      // silent
    }
  };

  const handleShare = async () => {
    const r = await share();
    if (r === 'copied') {
      toast.success('링크가 복사되었어요');
    } else if (r === 'failed') {
      toast.error('링크 복사에 실패했어요');
    }
  };

  return (
    <div css={[pageWrapperStyle('xl'), pageStyle]}>
      <ResultHeader
        score={result.score}
        totalQuestions={result.totalQuestions}
        topPercentile={result.topPercentile}
      />

      {distribution && distribution.totalAttempts > 0 && (
        <ResultDistribution
          data={distribution}
          myScore={result.score}
          topPercentile={result.topPercentile}
        />
      )}

      <ResultActions
        starred={!!quiz?.isStarred}
        starCount={quiz?.starCount ?? 0}
        shareCount={quiz?.shareCount ?? 0}
        starDisabled={isStarPending}
        onRetry={handleRetry}
        onStar={handleStar}
        onShare={handleShare}
      />

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
          onSubmit={async (content) => {
            await create(content);
          }}
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

QuizResultPage.displayName = 'QuizResultPage';
export default QuizResultPage;
