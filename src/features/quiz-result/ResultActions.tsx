import { memo, useCallback } from 'react';
import Button from '@/components/button';
import { wrapperStyle } from './ResultActions.style';

type ResultActionsProps = {
  quizId: number;
  onRetry: () => void;
  onHome: () => void;
};

const ResultActions = memo(({ quizId, onRetry, onHome }: ResultActionsProps) => {
  const handleShare = useCallback(() => {
    const url = `${window.location.origin}/quiz/${quizId}`;
    navigator.clipboard
      .writeText(url)
      .then(() => {
        alert('링크가 복사됐어요!');
      })
      .catch(() => {});
  }, [quizId]);

  return (
    <div css={wrapperStyle}>
      <Button fullWidth onClick={onRetry}>
        다시 풀기
      </Button>
      <Button fullWidth variant="secondary" onClick={handleShare}>
        공유하기
      </Button>
      <Button fullWidth variant="ghost" onClick={onHome}>
        홈으로
      </Button>
    </div>
  );
});

ResultActions.displayName = 'ResultActions';
export default ResultActions;
