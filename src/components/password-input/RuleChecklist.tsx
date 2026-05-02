import { memo } from 'react';
import { PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH } from '@/lib/password';
import type { RuleChecklistProps } from './PasswordInput.type';
import {
  checklistWrapperStyle,
  ruleItemStyle,
  ruleIconStyle,
  type RuleState,
} from './RuleChecklist.style';

const toState = (value: boolean | null): RuleState => {
  if (value === true) {
    return 'pass';
  }
  if (value === false) {
    return 'fail';
  }
  return 'pending';
};

const ICON: Record<RuleState, string> = {
  pass: '✓',
  fail: '✗',
  pending: '•',
};

const RuleChecklist = memo(({ ruleStatus }: RuleChecklistProps) => {
  const lengthState = toState(ruleStatus.lengthOk);

  return (
    <ul css={checklistWrapperStyle}>
      <li css={ruleItemStyle(lengthState)}>
        <span css={ruleIconStyle(lengthState)} aria-hidden="true">
          {ICON[lengthState]}
        </span>
        {PASSWORD_MIN_LENGTH}자 이상 {PASSWORD_MAX_LENGTH}자 이하
      </li>
    </ul>
  );
});

RuleChecklist.displayName = 'RuleChecklist';
export default RuleChecklist;
