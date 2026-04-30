import zxcvbn from 'zxcvbn';
import type { PasswordStrength } from '@/components/password-input/PasswordInput.type';
import { PASSWORD_MIN_SCORE } from './policy';
import { translateCrackTimes, translateFeedback } from './i18n';

export const evaluateStrength = (
  password: string,
  userInputs: readonly string[] = [],
): PasswordStrength => {
  const result = zxcvbn(password, [...userInputs]);
  const offlineSlow = result.crack_times_display.offline_slow_hashing_1e4_per_second;
  const crackTimesRaw = typeof offlineSlow === 'string' ? offlineSlow : String(offlineSlow);
  return {
    score: result.score as PasswordStrength['score'],
    crackTimesDisplay: translateCrackTimes(crackTimesRaw),
    feedbackWarning: translateFeedback(result.feedback.warning ?? ''),
    feedbackSuggestions: result.feedback.suggestions.map(translateFeedback),
  };
};

export const canSubmitByStrength = (score: number): boolean => score >= PASSWORD_MIN_SCORE;
