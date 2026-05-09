import { css, type Theme } from '@emotion/react';
import { text } from '@/styles/text';

export const guideTextStyle = (theme: Theme) => css`
  ${text({ size: 'sm' })({ theme })}
  color: ${theme.colors.fg.secondary};
  margin-bottom: ${theme.spacing.md};
`;

export const sectionLabelStyle = (theme: Theme) => css`
  ${text({ size: 'sm', weight: 'semibold' })({ theme })}
  color: ${theme.colors.fg.primary};
  margin: ${theme.spacing.md} 0 ${theme.spacing.sm};
`;

export const optionalTagStyle = (theme: Theme) => css`
  ${text({ size: 'xs', weight: 'regular' })({ theme })}
  color: ${theme.colors.fg.tertiary};
  margin-left: ${theme.spacing.xs};
`;

export const reasonListStyle = (theme: Theme) => css`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xs};
  margin-bottom: ${theme.spacing.md};
`;

export const reasonItemStyle = (selected: boolean) => (theme: Theme) => css`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  border: 1px solid ${selected ? theme.colors.accent.primary : theme.colors.border.primary};
  background-color: ${selected ? theme.colors.accent.subtle : theme.colors.bg.primary};
  border-radius: ${theme.borderRadius.md};
  cursor: pointer;
  color: ${selected ? theme.colors.accent.primary : theme.colors.fg.primary};
  ${text({ size: 'sm', weight: selected ? 'semibold' : 'regular' })({ theme })}
`;

export const radioInputStyle = css`
  margin: 0;
  cursor: pointer;
`;

export const noticeBoxStyle = (theme: Theme) => css`
  background-color: ${theme.colors.bg.secondary};
  border: 1px solid ${theme.colors.border.primary};
  border-radius: ${theme.borderRadius.md};
  padding: ${theme.spacing.md};
  margin-bottom: ${theme.spacing.md};
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.sm};
`;

export const noticeTextStyle = (theme: Theme) => css`
  ${text({ size: 'sm' })({ theme })}
  color: ${theme.colors.fg.primary};
`;

export const checkboxRowStyle = (theme: Theme) => css`
  display: flex;
  align-items: flex-start;
  gap: ${theme.spacing.sm};
  cursor: pointer;
`;

export const checkboxInputStyle = (theme: Theme) => css`
  margin: 0;
  margin-top: 2px;
  width: 1.125rem;
  height: 1.125rem;
  accent-color: ${theme.colors.status.error};
  cursor: pointer;
`;

export const checkboxLabelTextStyle = (theme: Theme) => css`
  display: flex;
  flex-direction: column;
  gap: 2px;
  ${text({ size: 'sm' })({ theme })}
  color: ${theme.colors.fg.primary};
`;

export const checkboxHintStyle = (theme: Theme) => css`
  ${text({ size: 'xs' })({ theme })}
  color: ${theme.colors.fg.secondary};
`;

export const policyTextStyle = (theme: Theme) => css`
  ${text({ size: 'xs' })({ theme })}
  color: ${theme.colors.fg.secondary};
  margin-bottom: ${theme.spacing.lg};
  line-height: 1.5;
`;

export const confirmFieldStyle = (theme: Theme) => css`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xs};
`;

export const confirmLabelStyle = (theme: Theme) => css`
  ${text({ size: 'sm', weight: 'semibold' })({ theme })}
  color: ${theme.colors.fg.primary};
`;

export const confirmHighlightStyle = (theme: Theme) => css`
  color: ${theme.colors.status.error};
`;

export const confirmInputStyle = (theme: Theme) => css`
  height: 2.75rem;
  padding: 0 ${theme.spacing.md};
  border: 1px solid ${theme.colors.border.primary};
  border-radius: ${theme.borderRadius.md};
  background-color: ${theme.colors.bg.primary};
  color: ${theme.colors.fg.primary};
  ${text({ size: 'md' })({ theme })}

  &:focus {
    outline: none;
    border-color: ${theme.colors.status.error};
  }

  &::placeholder {
    color: ${theme.colors.fg.tertiary};
  }
`;

export const errorTextStyle = (theme: Theme) => css`
  ${text({ size: 'xs' })({ theme })}
  color: ${theme.colors.status.error};
  margin-top: ${theme.spacing.sm};
`;
