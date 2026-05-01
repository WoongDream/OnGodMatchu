import { memo } from 'react';
import type { Question } from '@/types';
import { wrapperStyle, imageStyle, textStyle } from './QuizQuestion.style';

type QuizQuestionProps = {
  question: Question;
};

const QuizQuestion = memo(({ question }: QuizQuestionProps) => {
  return (
    <div css={wrapperStyle}>
      {question.imageUrl && <img css={imageStyle} src={question.imageUrl} alt="문제 이미지" />}
      {question.questionText && <p css={textStyle}>{question.questionText}</p>}
    </div>
  );
});

QuizQuestion.displayName = 'QuizQuestion';
export default QuizQuestion;
