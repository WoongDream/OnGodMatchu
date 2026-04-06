import type { QuizCardProps } from './QuizCard.type';
import {
  CardWrapper,
  Thumbnail,
  CardTitle,
  CardDescription,
  CardMeta,
  Category,
  PlayCount,
} from './QuizCard.style';
import { memo } from 'react';

const QuizCard = memo(({ quiz, onClick }: QuizCardProps) => {
  const handleClick = () => {
    onClick(quiz.id);
  };

  return (
    <CardWrapper onClick={handleClick}>
      <Thumbnail>{quiz.thumbnailUrl && <img src={quiz.thumbnailUrl} alt={quiz.title} />}</Thumbnail>
      <CardMeta>
        <Category>{quiz.category}</Category>
        <PlayCount>· {quiz.playCount.toLocaleString()}명 플레이</PlayCount>
      </CardMeta>
      <CardTitle>{quiz.title}</CardTitle>
      <CardDescription>{quiz.description}</CardDescription>
    </CardWrapper>
  );
});

QuizCard.displayName = 'QuizCard';
export default QuizCard;
