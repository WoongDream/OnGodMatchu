import { memo } from 'react';
import type { Question } from '@/types';
import { wrapperStyle, imageStyle, textStyle } from './QuizQuestion.style';

type QuizQuestionProps = {
  question: Question;
  revealAnswer?: boolean;
};

const QuizQuestion = memo(({ question, revealAnswer = false }: QuizQuestionProps) => {
  const displayImageUrl = revealAnswer
    ? (question.answerImageUrl ?? question.imageUrl)
    : question.imageUrl;
  const imageAlt = revealAnswer && question.answerImageUrl ? '정답 이미지' : '문제 이미지';

  return (
    <div css={wrapperStyle}>
      {displayImageUrl && <img css={imageStyle} src={displayImageUrl} alt={imageAlt} />}
      {question.questionText && <p css={textStyle}>{question.questionText}</p>}
    </div>
  );
});

QuizQuestion.displayName = 'QuizQuestion';
export default QuizQuestion;
