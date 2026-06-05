import { css, type Theme } from '@emotion/react';
import { text } from '@/styles/text';

export const wrapperStyle = (theme: Theme) => css`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.lg};
`;

export const titleStyle = (theme: Theme) => css`
  ${text({ size: 'xl', weight: 'bold' })({ theme })}
  color: ${theme.colors.fg.primary};
  margin: 0;
`;

export const panelStyle = (theme: Theme) => css`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
  padding: ${theme.spacing.lg};
  border: 1px solid ${theme.colors.border.secondary};
  border-radius: ${theme.borderRadius.lg};
  background-color: ${theme.colors.bg.primary};
`;

export const panelTitleStyle = (theme: Theme) => css`
  ${text({ size: 'lg', weight: 'semibold' })({ theme })}
  color: ${theme.colors.fg.primary};
  margin: 0;
`;

export const fieldStyle = (theme: Theme) => css`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xs};
`;

export const fieldHeaderStyle = (theme: Theme) => css`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${theme.spacing.sm};
`;

export const fieldLabelStyle = (theme: Theme) => css`
  ${text({ size: 'sm', weight: 'medium' })({ theme })}
  color: ${theme.colors.fg.secondary};
`;

export const counterStyle = (theme: Theme) => css`
  ${text({ size: 'xs' })({ theme })}
  color: ${theme.colors.fg.tertiary};
  white-space: nowrap;
`;

export const textareaStyle = (theme: Theme) => css`
  ${text({ size: 'sm' })({ theme })}
  width: 100%;
  box-sizing: border-box;
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  border: 1px solid ${theme.colors.border.secondary};
  border-radius: ${theme.borderRadius.md};
  background-color: ${theme.colors.bg.primary};
  color: ${theme.colors.fg.primary};
  resize: vertical;

  &::placeholder {
    color: ${theme.colors.fg.tertiary};
  }

  &:focus-visible {
    outline: none;
    border-color: ${theme.colors.accent.primary};
  }
`;

export const footerStyle = (theme: Theme) => css`
  display: flex;
  justify-content: flex-end;
  gap: ${theme.spacing.sm};
`;

export const noteStyle = (theme: Theme) => css`
  ${text({ size: 'xs' })({ theme })}
  color: ${theme.colors.fg.tertiary};
  margin: 0;
`;

export const sectionHeaderStyle = (theme: Theme) => css`
  display: flex;
  align-items: baseline;
  gap: ${theme.spacing.sm};
`;

export const sectionTitleStyle = (theme: Theme) => css`
  ${text({ size: 'lg', weight: 'semibold' })({ theme })}
  color: ${theme.colors.fg.primary};
  margin: 0;
`;

export const countStyle = (theme: Theme) => css`
  ${text({ size: 'sm', weight: 'medium' })({ theme })}
  color: ${theme.colors.fg.secondary};
  white-space: nowrap;
`;

export const listStyle = (theme: Theme) => css`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.sm};
`;

export const messageStyle = (theme: Theme) => css`
  ${text({ size: 'sm' })({ theme })}
  color: ${theme.colors.fg.tertiary};
  text-align: center;
  padding: ${theme.spacing.xl} 0;
`;

export const emptyStyle = (theme: Theme) => css`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing.md};
  padding: ${theme.spacing['2xl']} 0;
  color: ${theme.colors.fg.secondary};
`;

export const sentinelStyle = (theme: Theme) => css`
  display: flex;
  justify-content: center;
  padding: ${theme.spacing.lg} 0;
  color: ${theme.colors.fg.tertiary};
  font-size: ${theme.fontSize.sm};
`;
