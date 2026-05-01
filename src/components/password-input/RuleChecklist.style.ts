import { css, type Theme } from '@emotion/react';
import { text } from '@/styles/text';

export type RuleState = 'pending' | 'pass' | 'fail';

const stateColor = (state: RuleState, theme: Theme) => {
  if (state === 'pass') {
    return theme.colors.status.success;
  }
  if (state === 'fail') {
    return theme.colors.status.error;
  }
  return theme.colors.fg.tertiary;
};

export const checklistWrapperStyle = (theme: Theme) => css`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xs};
  margin: 0;
  padding: 0;
  list-style: none;
`;

export const ruleItemStyle = (state: RuleState) => (theme: Theme) => css`
  ${text({ size: 'xs' })({ theme })}
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};
  color: ${stateColor(state, theme)};
`;

export const ruleIconStyle = (state: RuleState) => (theme: Theme) => css`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1rem;
  height: 1rem;
  font-weight: ${theme.fontWeight.bold};
  color: ${stateColor(state, theme)};
`;
