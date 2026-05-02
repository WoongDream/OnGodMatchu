import { css, type Theme } from '@emotion/react';
import { text } from '@/styles/text';

export const wrapperStyle = (theme: Theme) => css`
  width: 100%;
  background-color: ${theme.colors.bg.secondary};
  border-top: 1px solid ${theme.colors.border.primary};
`;

export const innerStyle = (theme: Theme) => css`
  width: 100%;
  max-width: ${theme.breakpoints.desktop};
  margin: 0 auto;
  padding: ${theme.spacing.lg} ${theme.spacing.md};
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.sm};

  @media (min-width: ${theme.breakpoints.tablet}) {
    padding: ${theme.spacing.lg} ${theme.spacing.xl};
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    gap: ${theme.spacing.lg};
  }
`;

export const brandColumnStyle = (theme: Theme) => css`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xs};
`;

export const brandNameStyle = (theme: Theme) => css`
  ${text({ size: 'sm', weight: 'semibold' })({ theme })}
  color: ${theme.colors.fg.primary};
`;

export const copyTextStyle = (theme: Theme) => css`
  ${text({ size: 'xs' })({ theme })}
  color: ${theme.colors.fg.tertiary};
`;

export const metaColumnStyle = (theme: Theme) => css`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: ${theme.spacing.md};
`;

export const footerLinkStyle = (theme: Theme) => css`
  ${text({ size: 'xs' })({ theme })}
  color: ${theme.colors.fg.secondary};

  &:hover {
    color: ${theme.colors.accent.primary};
    text-decoration: underline;
  }
`;

export const privacyLinkStyle = (theme: Theme) => css`
  ${text({ size: 'xs', weight: 'bold' })({ theme })}
  color: ${theme.colors.fg.primary};

  &:hover {
    color: ${theme.colors.accent.primary};
    text-decoration: underline;
  }
`;

export const contactLinkStyle = (theme: Theme) => css`
  ${text({ size: 'xs' })({ theme })}
  color: ${theme.colors.fg.secondary};

  &:hover {
    color: ${theme.colors.accent.primary};
    text-decoration: underline;
  }
`;
