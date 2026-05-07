import { css, type Theme } from '@emotion/react';
import { text } from '@/styles/text';

export const cardStyle = (theme: Theme) => css`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing.sm};
  padding: ${theme.spacing.lg};
  border: 1px solid ${theme.colors.border.primary};
  border-radius: ${theme.borderRadius.lg};
  background-color: ${theme.colors.bg.primary};
`;

export const headerRowStyle = (theme: Theme) => css`
  display: inline-flex;
  align-items: center;
  gap: ${theme.spacing.sm};
`;

export const nicknameStyle = (theme: Theme) => css`
  ${text({ size: 'lg', weight: 'semibold' })({ theme })}
  color: ${theme.colors.fg.primary};
`;

export const bioStyle = (theme: Theme) => css`
  ${text({ size: 'sm', weight: 'regular' })({ theme })}
  color: ${theme.colors.fg.secondary};
  text-align: center;
  max-width: 16rem;
  margin: 0;
`;

export const statsRowStyle = (theme: Theme) => css`
  width: 100%;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: ${theme.spacing.sm};
  padding-top: ${theme.spacing.md};
  border-top: 1px solid ${theme.colors.border.secondary};
`;

export const statCellStyle = (theme: Theme) => css`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing.xs};
`;

export const statValueStyle = (theme: Theme) => css`
  ${text({ size: 'lg', weight: 'bold' })({ theme })}
  color: ${theme.colors.fg.primary};
`;

export const statLabelStyle = (theme: Theme) => css`
  ${text({ size: 'xs', weight: 'regular' })({ theme })}
  color: ${theme.colors.fg.secondary};
`;

export const statRowFullStyle = (theme: Theme) => css`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${theme.spacing.sm} 0;
  border-top: 1px solid ${theme.colors.border.secondary};
`;

export const statRowLabelStyle = (theme: Theme) => css`
  ${text({ size: 'sm', weight: 'regular' })({ theme })}
  color: ${theme.colors.fg.secondary};
`;

export const statRowValueStyle = (theme: Theme) => css`
  ${text({ size: 'md', weight: 'semibold' })({ theme })}
  color: ${theme.colors.fg.primary};
`;
