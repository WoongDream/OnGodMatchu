import { memo } from 'react';
import { FeedbackWrapper, FeedbackResult, FeedbackAnswer } from './QuizFeedback.style';

type QuizFeedbackProps = {
  correct: boolean;
  answer: string;
};

const QuizFeedback = memo(({ correct, answer }: QuizFeedbackProps) => {
  return (
    <FeedbackWrapper $correct={correct}>
      <FeedbackResult $correct={correct}>{correct ? '정답이에요!' : '오답이에요'}</FeedbackResult>
      {!correct && <FeedbackAnswer>정답: {answer}</FeedbackAnswer>}
    </FeedbackWrapper>
  );
});

QuizFeedback.displayName = 'QuizFeedback';
export default QuizFeedback;
