import { css, type Theme } from '@emotion/react';
import { text } from '@/styles/text';

export const wrapperStyle = (theme: Theme) => css`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
`;

export const titleStyle = (theme: Theme) => css`
  ${text({ size: 'xl', weight: 'bold' })({ theme })}
  color: ${theme.colors.fg.primary};
  margin: 0;
`;

export const statsRowStyle = (theme: Theme) => css`
  display: flex;
  gap: ${theme.spacing.md};

  @media (max-width: 640px) {
    flex-direction: column;
  }
`;

export const statBlockStyle = (theme: Theme) => css`
  flex: 1 1 0;
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xs};
  padding: ${theme.spacing.md};
  border: 1px solid ${theme.colors.border.primary};
  border-radius: ${theme.borderRadius.lg};
  background-color: ${theme.colors.bg.secondary};
`;

export const statLabelStyle = (theme: Theme) => css`
  ${text({ size: 'sm' })({ theme })}
  color: ${theme.colors.fg.secondary};
`;

export const statValueStyle = (theme: Theme) => css`
  ${text({ size: 'xl', weight: 'bold' })({ theme })}
  color: ${theme.colors.fg.primary};
`;

export const toolbarStyle = (theme: Theme) => css`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${theme.spacing.md};

  @media (max-width: 640px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

export const countStyle = (theme: Theme) => css`
  ${text({ size: 'sm', weight: 'medium' })({ theme })}
  color: ${theme.colors.fg.secondary};
  white-space: nowrap;
`;

export const searchBoxStyle = () => css`
  width: 20rem;
  max-width: 100%;
`;

export const listStyle = (theme: Theme) => css`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
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
