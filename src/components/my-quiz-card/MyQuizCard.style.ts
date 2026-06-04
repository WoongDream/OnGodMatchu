import { css, type Theme } from '@emotion/react';
import { text } from '@/styles/text';

export const cardStyle = (theme: Theme) => css`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
  padding: ${theme.spacing.md};
  border: 1px solid ${theme.colors.border.primary};
  border-radius: ${theme.borderRadius.lg};
  background-color: ${theme.colors.bg.primary};

  @media (max-width: ${theme.breakpoints.tablet}) {
    flex-direction: column;
    align-items: stretch;
  }
`;

export const clickableStyle = (theme: Theme) => css`
  cursor: pointer;
  transition:
    border-color 0.15s ease,
    box-shadow 0.15s ease;

  &:hover {
    border-color: ${theme.colors.accent.primary};
  }

  &:focus-visible {
    outline: 2px solid ${theme.colors.accent.primary};
    outline-offset: 2px;
  }
`;

export const thumbStyle = (theme: Theme) => css`
  flex-shrink: 0;
  width: 7rem;
  height: 4rem;
  border-radius: ${theme.borderRadius.md};
  overflow: hidden;
  background: linear-gradient(135deg, ${theme.colors.accent.muted}, ${theme.colors.accent.primary});

  & img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  @media (max-width: ${theme.breakpoints.tablet}) {
    width: 100%;
    height: 8rem;
  }
`;

export const bodyStyle = (theme: Theme) => css`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xs};
  min-width: 0;
`;

export const metaRowStyle = (theme: Theme) => css`
  display: inline-flex;
  align-items: center;
  flex-wrap: wrap;
  gap: ${theme.spacing.xs};
`;

export const categoryStyle = (theme: Theme) => css`
  ${text({ size: 'xs', weight: 'medium' })({ theme })}
  color: ${theme.colors.accent.primary};
`;

export const dotStyle = (theme: Theme) => css`
  ${text({ size: 'xs', weight: 'regular' })({ theme })}
  color: ${theme.colors.fg.tertiary};
`;

export const timeStyle = (theme: Theme) => css`
  ${text({ size: 'xs', weight: 'regular' })({ theme })}
  color: ${theme.colors.fg.tertiary};
`;

export const titleStyle = (theme: Theme) => css`
  ${text({ size: 'md', weight: 'semibold', ellipsis: 1 })({ theme })}
  color: ${theme.colors.fg.primary};
`;

export const statsRowStyle = (theme: Theme) => css`
  display: inline-flex;
  align-items: center;
  flex-wrap: wrap;
  gap: ${theme.spacing.md};
  ${text({ size: 'xs', weight: 'regular' })({ theme })}
  color: ${theme.colors.fg.secondary};
`;

export const statItemStyle = css`
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;

  svg {
    display: block;
    flex-shrink: 0;
  }
`;

export const actionsStyle = (theme: Theme) => css`
  display: inline-flex;
  align-items: center;
  gap: ${theme.spacing.xs};
  flex-shrink: 0;

  @media (max-width: ${theme.breakpoints.tablet}) {
    justify-content: flex-end;
  }
`;
