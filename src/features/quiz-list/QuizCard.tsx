import { memo } from 'react';
import type { QuizCardProps } from './QuizCard.type';
import {
  wrapperStyle,
  thumbnailStyle,
  titleStyle,
  descriptionStyle,
  metaStyle,
  categoryStyle,
  playCountStyle,
} from './QuizCard.style';

const QuizCard = memo(({ quiz, onClick }: QuizCardProps) => {
  const handleClick = () => {
    onClick(quiz.id);
  };

  return (
    <article css={wrapperStyle} onClick={handleClick}>
      <div css={thumbnailStyle}>
        {quiz.thumbnailUrl && <img src={quiz.thumbnailUrl} alt={quiz.title} />}
      </div>
      <div css={metaStyle}>
        <span css={categoryStyle}>{quiz.category}</span>
        <span css={playCountStyle}>· {quiz.playCount.toLocaleString()}명 플레이</span>
      </div>
      <h3 css={titleStyle}>{quiz.title}</h3>
      <p css={descriptionStyle}>{quiz.description}</p>
    </article>
  );
});

QuizCard.displayName = 'QuizCard';
export default QuizCard;
