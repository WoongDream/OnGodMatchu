export type PasswordStrengthScore = 0 | 1 | 2 | 3 | 4;

export type PasswordStrength = {
  score: PasswordStrengthScore;
  crackTimesDisplay: string;
  feedbackWarning: string;
  feedbackSuggestions: readonly string[];
};

export type PasswordRuleStatus = {
  lengthOk: boolean;
  notBreached: boolean | null;
};

export type PasswordInputProps = {
  value: string;
  onChange: (value: string) => void;
  onStrengthChange?: (strength: PasswordStrength) => void;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  ruleStatus: PasswordRuleStatus;
  showStrengthMeter?: boolean;
  showChecklist?: boolean;
  showHint?: boolean;
  userInputs?: readonly string[];
};

export type StrengthMeterProps = {
  score: PasswordStrengthScore;
  crackTimesDisplay?: string;
};

export type RuleChecklistProps = {
  ruleStatus: PasswordRuleStatus;
};
