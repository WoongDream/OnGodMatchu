import { useNavigate } from 'react-router-dom';
import type { Quiz } from '@/types';
import QuizCard from './QuizCard';
import { ListWrapper, EmptyMessage } from './QuizList.style';
import { memo } from 'react';

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
      <ListWrapper>
        <EmptyMessage>퀴즈가 없어요</EmptyMessage>
      </ListWrapper>
    );
  }

  return (
    <ListWrapper>
      {quizzes.map((quiz) => (
        <QuizCard key={quiz.id} quiz={quiz} onClick={handleCardClick} />
      ))}
    </ListWrapper>
  );
});

QuizList.displayName = 'QuizList';
export default QuizList;
