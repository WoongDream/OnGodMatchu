import { memo } from 'react';
import { wrapperStyle, resultStyle, answerStyle, answerImageStyle } from './QuizFeedback.style';

type QuizFeedbackProps = {
  correct: boolean;
  answer: string;
  answerImageUrl?: string | null;
};

const QuizFeedback = memo(({ correct, answer, answerImageUrl }: QuizFeedbackProps) => {
  return (
    <div css={wrapperStyle(correct)}>
      <span css={resultStyle(correct)}>{correct ? '정답이에요!' : '오답이에요'}</span>
      {!correct && (
        <>
          <span css={answerStyle}>정답: {answer}</span>
          {answerImageUrl && <img css={answerImageStyle} src={answerImageUrl} alt="정답 이미지" />}
        </>
      )}
    </div>
  );
});

QuizFeedback.displayName = 'QuizFeedback';
export default QuizFeedback;
