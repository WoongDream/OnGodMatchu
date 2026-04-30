import { memo } from 'react';
import type { StrengthMeterProps } from './PasswordInput.type';
import {
  MeterWrapper,
  BarRow,
  BarSegment,
  InfoRow,
  StrengthLabel,
  CrackTimeText,
  FeedbackText,
} from './StrengthMeter.style';

const STRENGTH_LABELS = ['매우 약함', '약함', '보통', '좋음', '매우 강함'] as const;

const StrengthMeter = memo(({ score, crackTimesDisplay, feedbackText }: StrengthMeterProps) => (
  <MeterWrapper aria-live="polite">
    <BarRow role="progressbar" aria-valuemin={0} aria-valuemax={4} aria-valuenow={score}>
      {[0, 1, 2, 3, 4].map((idx) => (
        <BarSegment key={idx} $filled={idx <= score} $score={score} />
      ))}
    </BarRow>
    <InfoRow>
      <StrengthLabel $score={score}>{STRENGTH_LABELS[score]}</StrengthLabel>
      {crackTimesDisplay && <CrackTimeText>예상 해독 시간: {crackTimesDisplay}</CrackTimeText>}
    </InfoRow>
    {feedbackText && <FeedbackText>💡 {feedbackText}</FeedbackText>}
  </MeterWrapper>
));

StrengthMeter.displayName = 'StrengthMeter';
export default StrengthMeter;
