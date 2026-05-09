import { css, type Theme } from '@emotion/react';
import { text } from '@/styles/text';

export const guideTextStyle = (theme: Theme) => css`
  ${text({ size: 'sm' })({ theme })}
  color: ${theme.colors.fg.secondary};
  margin-bottom: ${theme.spacing.md};
`;

export const progressTrackStyle = (theme: Theme) => css`
  position: relative;
  height: 4px;
  background-color: ${theme.colors.bg.tertiary};
  border-radius: ${theme.borderRadius.full};
  overflow: hidden;
  margin-top: ${theme.spacing.xs};
`;

export const progressBarStyle = (percent: number) => (theme: Theme) => css`
  position: absolute;
  inset: 0 ${100 - percent}% 0 0;
  background-color: ${theme.colors.accent.primary};
  transition: right 0.2s ease;
`;

export const stepLabelStyle = (theme: Theme) => css`
  ${text({ size: 'xs', weight: 'semibold' })({ theme })}
  color: ${theme.colors.fg.secondary};
`;

export const stepRowStyle = (theme: Theme) => css`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  margin-bottom: ${theme.spacing.md};
`;

export const stepRowTrackStyle = css`
  flex: 1;
`;

export const sectionLabelStyle = (theme: Theme) => css`
  ${text({ size: 'sm', weight: 'semibold' })({ theme })}
  color: ${theme.colors.fg.primary};
  margin: ${theme.spacing.md} 0 ${theme.spacing.sm};
`;

export const sectionLabelRowStyle = (theme: Theme) => css`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: ${theme.spacing.sm};
  margin: ${theme.spacing.md} 0 ${theme.spacing.sm};
`;

export const optionalTagStyle = (theme: Theme) => css`
  ${text({ size: 'xs', weight: 'regular' })({ theme })}
  color: ${theme.colors.fg.tertiary};
  margin-left: ${theme.spacing.xs};
`;

export const counterStyle = (theme: Theme) => css`
  ${text({ size: 'xs' })({ theme })}
  color: ${theme.colors.fg.tertiary};
`;

export const reasonTextareaStyle = (theme: Theme) => css`
  ${text({ size: 'sm' })({ theme })}
  width: 100%;
  min-height: 4.5rem;
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  border: 1px solid ${theme.colors.border.primary};
  border-radius: ${theme.borderRadius.md};
  background-color: ${theme.colors.bg.primary};
  color: ${theme.colors.fg.primary};
  resize: vertical;
  margin-bottom: ${theme.spacing.md};

  &:focus {
    outline: none;
    border-color: ${theme.colors.accent.primary};
  }

  &::placeholder {
    color: ${theme.colors.fg.tertiary};
  }
`;

export const codeRowStyle = (theme: Theme) => css`
  display: grid;
  grid-template-columns: 1fr auto;
  gap: ${theme.spacing.sm};
  align-items: center;
`;

export const codeInputStyle = (hasError: boolean) => (theme: Theme) => css`
  width: 100%;
  height: 2.75rem;
  padding: 0 ${theme.spacing.md};
  border: 1px solid ${hasError ? theme.colors.status.error : theme.colors.border.primary};
  border-radius: ${theme.borderRadius.md};
  background-color: ${theme.colors.bg.primary};
  color: ${theme.colors.fg.primary};
  ${text({ size: 'md' })({ theme })}
  letter-spacing: 0.25rem;

  &:focus {
    outline: none;
    border-color: ${theme.colors.accent.primary};
  }

  &:disabled {
    background-color: ${theme.colors.bg.secondary};
    cursor: not-allowed;
  }

  &::placeholder {
    color: ${theme.colors.fg.tertiary};
    letter-spacing: normal;
  }
`;

export const timerRowStyle = (theme: Theme) => css`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${theme.spacing.sm};
  margin-top: ${theme.spacing.xs};
  margin-bottom: ${theme.spacing.md};
`;

export const timerTextStyle = (expired: boolean) => (theme: Theme) => css`
  ${text({ size: 'xs' })({ theme })}
  color: ${expired ? theme.colors.status.error : theme.colors.fg.secondary};
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

export const confirmInputStyle = (hasError: boolean) => (theme: Theme) => css`
  height: 2.75rem;
  padding: 0 ${theme.spacing.md};
  border: 1px solid ${hasError ? theme.colors.status.error : theme.colors.border.primary};
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

export const inlineErrorStyle = (theme: Theme) => css`
  ${text({ size: 'xs' })({ theme })}
  color: ${theme.colors.status.error};
  margin-top: ${theme.spacing.xs};
`;

export const errorTextStyle = (theme: Theme) => css`
  ${text({ size: 'xs' })({ theme })}
  color: ${theme.colors.status.error};
  margin-top: ${theme.spacing.sm};
`;

export const codeIntroStyle = (theme: Theme) => css`
  ${text({ size: 'sm' })({ theme })}
  color: ${theme.colors.fg.secondary};
  margin-bottom: ${theme.spacing.sm};
`;

export const stepIntroStyle = (theme: Theme) => css`
  ${text({ size: 'sm' })({ theme })}
  color: ${theme.colors.fg.primary};
  margin-bottom: ${theme.spacing.lg};
`;

export const dividerStyle = (theme: Theme) => css`
  height: 1px;
  background-color: ${theme.colors.border.primary};
  margin: ${theme.spacing.lg} 0;
  border: 0;
`;

export const codeStatusStyle = (variant: 'success' | 'error') => (theme: Theme) => css`
  ${text({ size: 'xs' })({ theme })}
  color: ${variant === 'success' ? theme.colors.status.success : theme.colors.status.error};
  margin-top: ${theme.spacing.sm};
  display: inline-flex;
  align-items: center;
  gap: ${theme.spacing.xs};
`;

export const verifyButtonRowStyle = (theme: Theme) => css`
  display: grid;
  grid-template-columns: 4fr 1fr;
  gap: ${theme.spacing.sm};
  margin-top: ${theme.spacing.md};
`;
