import { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Quiz } from '@/types';
import QuizCard from './QuizCard';
import { wrapperStyle, emptyMessageStyle } from './QuizList.style';

type QuizListProps = {
  quizzes: Quiz[];
};

const QuizList = memo(({ quizzes }: QuizListProps) => {
  const navigate = useNavigate();

  const handleCardClick = (id: number) => {
    navigate(`/quiz/${id}`);
  };

  if (quizzes.length === 0) {
    return (
      <section css={wrapperStyle}>
        <p css={emptyMessageStyle}>퀴즈가 없어요</p>
      </section>
    );
  }

  return (
    <section css={wrapperStyle}>
      {quizzes.map((quiz) => (
        <QuizCard key={quiz.id} quiz={quiz} onClick={handleCardClick} />
      ))}
    </section>
  );
});

QuizList.displayName = 'QuizList';
export default QuizList;
