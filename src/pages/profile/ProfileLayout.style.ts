import { css, type Theme } from '@emotion/react';
import { text } from '@/styles/text';

export const wrapperStyle = (theme: Theme) => css`
  width: 100%;
  max-width: ${theme.breakpoints.desktop};
  margin: 0 auto;
  padding: ${theme.spacing.lg} ${theme.spacing.md};

  @media (min-width: ${theme.breakpoints.tablet}) {
    padding: ${theme.spacing.xl};
    display: grid;
    grid-template-columns: 16rem 1fr;
    gap: ${theme.spacing.xl};
    align-items: start;
  }
`;

export const sideColumnStyle = (theme: Theme) => css`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};

  @media (max-width: calc(${theme.breakpoints.tablet} - 1px)) {
    margin-bottom: ${theme.spacing.md};
  }
`;

export const mainColumnStyle = (theme: Theme) => css`
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.lg};
`;

export const desktopOnlyStyle = (theme: Theme) => css`
  display: none;
  @media (min-width: ${theme.breakpoints.tablet}) {
    display: block;
  }
`;

export const mobileOnlyStyle = (theme: Theme) => css`
  display: block;
  @media (min-width: ${theme.breakpoints.tablet}) {
    display: none;
  }
`;

export const noticeStyle = (theme: Theme) => css`
  ${text({ size: 'md', weight: 'regular' })({ theme })}
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing.md};
  padding: ${theme.spacing.xl};
  color: ${theme.colors.fg.secondary};
  text-align: center;
`;

export const noticeLinkStyle = (theme: Theme) => css`
  ${text({ size: 'sm', weight: 'medium' })({ theme })}
  color: ${theme.colors.accent.primary};
`;

export const skeletonStyle = (theme: Theme) => css`
  ${text({ size: 'sm', weight: 'regular' })({ theme })}
  color: ${theme.colors.fg.tertiary};
  padding: ${theme.spacing.xl};
  text-align: center;
`;
