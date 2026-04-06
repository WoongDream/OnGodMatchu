import { memo } from 'react';
import type { Question } from '@/types';
import { QuestionWrapper, QuestionImage, QuestionText } from './QuizQuestion.style';

type QuizQuestionProps = {
  question: Question;
};

const QuizQuestion = memo(({ question }: QuizQuestionProps) => {
  return (
    <QuestionWrapper>
      {question.imageUrl && <QuestionImage src={question.imageUrl} alt="문제 이미지" />}
      {question.questionText && <QuestionText>{question.questionText}</QuestionText>}
    </QuestionWrapper>
  );
});

QuizQuestion.displayName = 'QuizQuestion';
export default QuizQuestion;
