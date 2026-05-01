import { css, type Theme } from '@emotion/react';
import { HEADER_HEIGHT, Z_INDEX } from '@/styles/constants';
import { text } from '@/styles/text';

export const wrapperStyle = (theme: Theme) => css`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: ${HEADER_HEIGHT};
  background-color: ${theme.colors.bg.primary};
  border-bottom: 1px solid ${theme.colors.border.primary};
  z-index: ${Z_INDEX.LOW};
`;

export const innerStyle = (theme: Theme) => css`
  width: 100%;
  max-width: ${theme.breakpoints.desktop};
  height: 100%;
  margin: 0 auto;
  padding: 0 ${theme.spacing.md};
  display: flex;
  align-items: center;
  justify-content: space-between;

  @media (min-width: ${theme.breakpoints.tablet}) {
    padding: 0 ${theme.spacing.xl};
  }
`;

export const logoStyle = (theme: Theme) => css`
  ${text({ size: 'lg', weight: 'bold' })({ theme })}
  color: ${theme.colors.accent.primary};
  cursor: pointer;
`;

export const navActionsStyle = (theme: Theme) => css`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
`;
