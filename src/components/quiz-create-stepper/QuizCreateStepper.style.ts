import { css, type Theme } from '@emotion/react';

export const wrapperStyle = (theme: Theme) => css`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
`;

export const stepButtonStyle = (theme: Theme) => css`
  display: inline-flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  background: transparent;
  border: none;
  padding: 0;
  cursor: pointer;

  &:disabled {
    cursor: default;
  }
`;

type StepState = 'current' | 'done' | 'todo';

export const stepCircleStyle = (state: StepState) => (theme: Theme) => {
  if (state === 'current') {
    return css`
      width: 1.5rem;
      height: 1.5rem;
      border-radius: ${theme.borderRadius.full};
      background-color: ${theme.colors.accent.primary};
      color: ${theme.colors.accent.fg};
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: ${theme.fontSize.xs};
      font-weight: ${theme.fontWeight.bold};
    `;
  }
  if (state === 'done') {
    return css`
      width: 1.5rem;
      height: 1.5rem;
      border-radius: ${theme.borderRadius.full};
      background-color: ${theme.colors.fg.primary};
      color: ${theme.colors.accent.fg};
      display: inline-flex;
      align-items: center;
      justify-content: center;
    `;
  }
  return css`
    width: 1.5rem;
    height: 1.5rem;
    border-radius: ${theme.borderRadius.full};
    background-color: ${theme.colors.bg.tertiary};
    color: ${theme.colors.fg.tertiary};
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: ${theme.fontSize.xs};
    font-weight: ${theme.fontWeight.bold};
  `;
};

export const stepLabelStyle = (state: StepState) => (theme: Theme) => css`
  font-size: ${theme.fontSize.sm};
  font-weight: ${state === 'current' ? theme.fontWeight.bold : theme.fontWeight.medium};
  color: ${state === 'todo' ? theme.colors.fg.tertiary : theme.colors.fg.primary};
`;

export const connectorStyle = (theme: Theme) => css`
  flex: 0 0 1.5rem;
  height: 1px;
  background-color: ${theme.colors.border.primary};
`;
