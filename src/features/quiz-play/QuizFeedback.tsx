import { memo } from 'react';
import { wrapperStyle, resultStyle, answerStyle } from './QuizFeedback.style';

type QuizFeedbackProps = {
  correct: boolean;
  answer: string;
};

const QuizFeedback = memo(({ correct, answer }: QuizFeedbackProps) => {
  return (
    <div css={wrapperStyle(correct)}>
      <span css={resultStyle(correct)}>{correct ? '정답이에요!' : '오답이에요'}</span>
      {!correct && <span css={answerStyle}>정답: {answer}</span>}
    </div>
  );
});

QuizFeedback.displayName = 'QuizFeedback';
export default QuizFeedback;
