import { memo } from 'react';
import { ProgressWrapper, ProgressLabel, ProgressBar, ProgressFill } from './QuizProgress.style';

type QuizProgressProps = {
  current: number;
  total: number;
};

const QuizProgress = memo(({ current, total }: QuizProgressProps) => {
  const percent = (current / total) * 100;

  return (
    <ProgressWrapper>
      <ProgressLabel>
        {current} / {total}
      </ProgressLabel>
      <ProgressBar>
        <ProgressFill $percent={percent} />
      </ProgressBar>
    </ProgressWrapper>
  );
});

QuizProgress.displayName = 'QuizProgress';
export default QuizProgress;
