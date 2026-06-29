import { css, type Theme } from '@emotion/react';
import { text } from '@/styles/text';

export const cardStyle = (theme: Theme) => css`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.sm};
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  border: 1px solid ${theme.colors.border.secondary};
  border-radius: ${theme.borderRadius.lg};
  background-color: ${theme.colors.bg.primary};
`;

export const headerRowStyle = (theme: Theme) => css`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${theme.spacing.sm};
`;

export const dateStyle = (theme: Theme) => css`
  ${text({ size: 'sm' })({ theme })}
  color: ${theme.colors.fg.tertiary};
  white-space: nowrap;
`;

export const titleStyle = (theme: Theme) => css`
  ${text({ size: 'md', weight: 'semibold' })({ theme })}
  color: ${theme.colors.fg.primary};
  margin: 0;
`;

export const contentStyle = (theme: Theme) => css`
  ${text({ size: 'sm' })({ theme })}
  color: ${theme.colors.fg.secondary};
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

export const answerListStyle = (theme: Theme) => css`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xs};
  margin-top: ${theme.spacing.xs};
  padding-top: ${theme.spacing.sm};
  border-top: 1px solid ${theme.colors.border.secondary};
`;

export const answerSectionLabelStyle = (theme: Theme) => css`
  ${text({ size: 'xs', weight: 'medium' })({ theme })}
  color: ${theme.colors.fg.tertiary};
`;

export const answerItemStyle = (theme: Theme) => css`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${theme.spacing.sm};
  width: 100%;
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  border: 1px solid ${theme.colors.border.secondary};
  border-radius: ${theme.borderRadius.md};
  background-color: ${theme.colors.bg.secondary};
  cursor: pointer;
  text-align: left;

  &:hover {
    background-color: ${theme.colors.bg.tertiary};
  }

  &:focus-visible {
    outline: 2px solid ${theme.colors.accent.primary};
    outline-offset: 2px;
  }
`;

export const answerTitleStyle = (theme: Theme) => css`
  ${text({ size: 'sm', weight: 'semibold' })({ theme })}
  color: ${theme.colors.accent.primary};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const answerDateStyle = (theme: Theme) => css`
  ${text({ size: 'xs' })({ theme })}
  color: ${theme.colors.fg.tertiary};
  white-space: nowrap;
`;
