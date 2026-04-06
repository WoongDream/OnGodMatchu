import { memo } from 'react';
import {
  ScoreWrapper,
  ScoreLabel,
  ScoreNumber,
  ScoreTotal,
  ScoreMessage,
} from './ResultScore.style';

type ResultScoreProps = {
  scores: number;
  total: number;
};

const getScoreMessage = (scores: number, total: number): string => {
  const ratio = scores / total;
  if (ratio === 1) {
    return '완벽해요! 천재인가요? 🎉';
  }
  if (ratio >= 0.8) {
    return '거의 다 맞췄어요! 대단해요 👏';
  }
  if (ratio >= 0.5) {
    return '절반 이상 맞췄어요! 🙂';
  }
  return '다음엔 더 잘 할 수 있어요 💪';
};

const ResultScore = memo(({ scores, total }: ResultScoreProps) => {
  return (
    <ScoreWrapper>
      <ScoreLabel>최종 점수</ScoreLabel>
      <ScoreNumber>{scores}</ScoreNumber>
      <ScoreTotal>/ {total}</ScoreTotal>
      <ScoreMessage>{getScoreMessage(scores, total)}</ScoreMessage>
    </ScoreWrapper>
  );
});

ResultScore.displayName = 'ResultScore';
export default ResultScore;
