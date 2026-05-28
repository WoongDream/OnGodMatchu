import { css, type Theme } from '@emotion/react';
import { text } from '@/styles/text';

export const wrapperStyle =
  (invalid = false) =>
  (theme: Theme) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.md};
    padding: ${theme.spacing.md};
    border: 1px solid ${invalid ? theme.colors.status.error : theme.colors.border.primary};
    border-radius: ${theme.borderRadius.lg};
    background-color: ${theme.colors.bg.primary};
  `;

export const headerStyle = css`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
`;

export const headerLeftStyle = (theme: Theme) => css`
  display: inline-flex;
  align-items: center;
  gap: ${theme.spacing.sm};
`;

export const numberStyle = (theme: Theme) => css`
  ${text({ size: 'md', weight: 'semibold' })({ theme })}
  color: ${theme.colors.fg.primary};
`;

export const invalidPillStyle = (theme: Theme) => css`
  ${text({ size: 'xs', weight: 'semibold' })({ theme })}
  color: ${theme.colors.status.error};
  background-color: ${theme.colors.bg.secondary};
  padding: 0.125rem 0.5rem;
  border-radius: ${theme.borderRadius.full};
`;

export const actionsStyle = (theme: Theme) => css`
  display: flex;
  gap: ${theme.spacing.xs};
`;

export const iconButtonStyle = (theme: Theme) => css`
  ${text({ size: 'sm' })({ theme })}
  color: ${theme.colors.fg.tertiary};
  padding: ${theme.spacing.xs};
  border-radius: ${theme.borderRadius.sm};

  &:hover {
    color: ${theme.colors.fg.secondary};
    background-color: ${theme.colors.bg.secondary};
  }

  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }
`;

export const deleteButtonStyle = (theme: Theme) => css`
  ${text({ size: 'sm', weight: 'medium' })({ theme })}
  display: inline-flex;
  align-items: center;
  gap: ${theme.spacing.xs};
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  border-radius: ${theme.borderRadius.md};
  border: 1px solid ${theme.colors.status.error};
  background-color: ${theme.colors.bg.primary};
  color: ${theme.colors.status.error};

  &:hover {
    background-color: ${theme.colors.status.error};
    color: ${theme.colors.fg.inverse};
  }
`;

export const sectionStyle = (theme: Theme) => css`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.sm};
`;

export const sectionHeadingStyle = (theme: Theme) => css`
  ${text({ size: 'sm', weight: 'semibold' })({ theme })}
  color: ${theme.colors.fg.secondary};
  margin: 0;
`;

export const checkboxRowStyle = (theme: Theme) => css`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};
  ${text({ size: 'sm' })({ theme })}
  color: ${theme.colors.fg.secondary};
  cursor: pointer;
  user-select: none;

  & input[type='checkbox'] {
    cursor: pointer;
  }
`;

export const sameAsQuestionHintStyle = (theme: Theme) => css`
  ${text({ size: 'sm' })({ theme })}
  color: ${theme.colors.fg.tertiary};
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  border: 1px dashed ${theme.colors.border.primary};
  border-radius: ${theme.borderRadius.md};
  background-color: ${theme.colors.bg.secondary};
`;

export const questionBlockStyle =
  (invalid = false) =>
  (theme: Theme) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.sm};
    padding: ${invalid ? theme.spacing.md : '0'};
    border-radius: ${theme.borderRadius.md};
    border: 1px solid ${invalid ? theme.colors.status.error : 'transparent'};
  `;

export const answerBlockStyle =
  (invalid = false) =>
  (theme: Theme) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.sm};
    padding: ${theme.spacing.md};
    border-radius: ${theme.borderRadius.md};
    border: 1px solid ${invalid ? theme.colors.status.error : theme.colors.accent.muted};
    background-color: ${invalid ? theme.colors.bg.secondary : theme.colors.accent.subtle};
  `;

export const answerHeadingStyle =
  (invalid = false) =>
  (theme: Theme) => css`
    ${text({ size: 'sm', weight: 'semibold' })({ theme })}
    color: ${invalid ? theme.colors.status.error : theme.colors.accent.active};
    display: inline-flex;
    align-items: center;
    gap: ${theme.spacing.xs};
    margin: 0;

    &::before {
      content: '';
      display: inline-block;
      width: 0.4rem;
      height: 0.4rem;
      border-radius: 50%;
      background-color: ${invalid ? theme.colors.status.error : theme.colors.accent.active};
    }
  `;

export const fieldErrorStyle = (theme: Theme) => css`
  ${text({ size: 'xs' })({ theme })}
  color: ${theme.colors.status.error};
`;

export const requiredDotStyle = (theme: Theme) => css`
  color: ${theme.colors.status.error};
  font-size: ${theme.fontSize.md};
  line-height: 1;
`;
