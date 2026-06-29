import { memo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginPromptModal from '@/components/login-prompt-modal';
import useAuthStore from '@/store/authStore';
import useToggleStar from '@/hooks/useToggleStar';
import type { Quiz } from '@/types';
import QuizCard from './QuizCard';
import { wrapperStyle, emptyMessageStyle } from './QuizList.style';

type QuizListProps = {
  quizzes: Quiz[];
  /** 스타 토글 성공 후 호출 — nextStarred 는 토글 결과 상태. 스타 준 목록에서 취소 시 카드 제거 등에 사용 */
  onStarToggled?: (quizId: number, nextStarred: boolean) => void;
};

const QuizList = memo(({ quizzes, onStarToggled }: QuizListProps) => {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuthStore();
  const { toggle, pendingQuizId } = useToggleStar();
  const [isLoginPromptOpen, setIsLoginPromptOpen] = useState(false);

  const handleCardClick = (id: number) => {
    navigate(`/quiz/${id}`);
  };

  const handleStarClick = (quizId: number, isStarred: boolean) => {
    if (!isLoggedIn) {
      setIsLoginPromptOpen(true);
      return;
    }
    void toggle(quizId, isStarred)
      .then(() => onStarToggled?.(quizId, !isStarred))
      .catch(() => {});
  };

  if (quizzes.length === 0) {
    return (
      <section css={wrapperStyle}>
        <p css={emptyMessageStyle}>퀴즈가 없어요</p>
      </section>
    );
  }

  return (
    <>
      <section css={wrapperStyle}>
        {quizzes.map((quiz) => (
          <QuizCard
            key={quiz.id}
            quiz={quiz}
            onClick={handleCardClick}
            onStarClick={handleStarClick}
            isStarPending={pendingQuizId === quiz.id}
          />
        ))}
      </section>
      <LoginPromptModal
        isOpen={isLoginPromptOpen}
        onClose={() => setIsLoginPromptOpen(false)}
        title="로그인이 필요해요"
        message="로그인하고 스타를 눌러 좋아하는 퀴즈를 모아보세요."
      />
    </>
  );
});

QuizList.displayName = 'QuizList';
export default QuizList;
