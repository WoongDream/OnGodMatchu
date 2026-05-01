import { css, type Theme } from '@emotion/react';
import { HEADER_HEIGHT } from '@/styles/constants';

export const appShellStyle = (theme: Theme) => css`
  width: 100%;
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  background-color: ${theme.colors.bg.primary};
`;

export const pageContentStyle = (theme: Theme) => css`
  flex: 1;
  display: flex;
  flex-direction: column;
  padding-top: ${HEADER_HEIGHT};
  width: 100%;
  max-width: ${theme.breakpoints.desktop};
  margin: 0 auto;
  padding-left: ${theme.spacing.md};
  padding-right: ${theme.spacing.md};

  @media (min-width: ${theme.breakpoints.tablet}) {
    padding-left: ${theme.spacing.xl};
    padding-right: ${theme.spacing.xl};
  }
`;

export const pageWrapperStyle = (gap?: keyof Theme['spacing']) => (theme: Theme) => css`
  display: flex;
  flex-direction: column;
  padding: ${theme.spacing.lg} 0;
  gap: ${gap ? theme.spacing[gap] : 0};
`;
