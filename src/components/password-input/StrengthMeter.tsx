import { memo } from 'react';
import type { StrengthMeterProps } from './PasswordInput.type';
import {
  meterWrapperStyle,
  barRowStyle,
  barSegmentStyle,
  infoRowStyle,
  strengthLabelStyle,
  crackTimeTextStyle,
  feedbackTextStyle,
} from './StrengthMeter.style';

const STRENGTH_LABELS = ['매우 약함', '약함', '보통', '좋음', '매우 강함'] as const;

const StrengthMeter = memo(({ score, crackTimesDisplay, feedbackText }: StrengthMeterProps) => (
  <div css={meterWrapperStyle} aria-live="polite">
    <div
      css={barRowStyle}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={4}
      aria-valuenow={score}
    >
      {[0, 1, 2, 3, 4].map((idx) => (
        <span key={idx} css={barSegmentStyle(idx <= score, score)} />
      ))}
    </div>
    <div css={infoRowStyle}>
      <span css={strengthLabelStyle(score)}>{STRENGTH_LABELS[score]}</span>
      {crackTimesDisplay && (
        <span css={crackTimeTextStyle}>예상 해독 시간: {crackTimesDisplay}</span>
      )}
    </div>
    {feedbackText && <span css={feedbackTextStyle}>💡 {feedbackText}</span>}
  </div>
));

StrengthMeter.displayName = 'StrengthMeter';
export default StrengthMeter;
