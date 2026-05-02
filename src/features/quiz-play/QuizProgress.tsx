import { memo } from 'react';
import { wrapperStyle, labelStyle, barStyle, fillStyle } from './QuizProgress.style';

type QuizProgressProps = {
  current: number;
  total: number;
};

const QuizProgress = memo(({ current, total }: QuizProgressProps) => {
  const percent = (current / total) * 100;

  return (
    <div css={wrapperStyle}>
      <span css={labelStyle}>
        {current} / {total}
      </span>
      <div css={barStyle}>
        <div css={fillStyle(percent)} />
      </div>
    </div>
  );
});

QuizProgress.displayName = 'QuizProgress';
export default QuizProgress;
