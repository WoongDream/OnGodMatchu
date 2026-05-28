import { css, type Theme } from '@emotion/react';
import { HEADER_HEIGHT, Z_INDEX } from '@/styles/constants';

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
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: ${theme.spacing.md};

  @media (min-width: ${theme.breakpoints.tablet}) {
    padding: 0 ${theme.spacing.xl};
    gap: ${theme.spacing.xl};
  }
`;

export const leftSlotStyle = (theme: Theme) => css`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
  min-width: 0;
`;

export const logoStyle = css`
  display: block;
  height: 2rem;
  width: auto;
  cursor: pointer;
  flex-shrink: 0;
`;

export const tabsStyle = (theme: Theme) => css`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${theme.spacing.lg};
  height: 100%;
`;

export const tabStyle = (theme: Theme) => css`
  position: relative;
  display: inline-flex;
  align-items: flex-end;
  height: 100%;
  padding: 0 ${theme.spacing.xs} 6px;
  color: ${theme.colors.fg.secondary};
  font-size: ${theme.fontSize.sm};
  font-weight: ${theme.fontWeight.medium};
  text-decoration: none;
  transition:
    color 0.15s ease,
    font-weight 0.15s ease;

  &:hover {
    color: ${theme.colors.fg.primary};
  }

  &.active {
    color: ${theme.colors.accent.primary};
    font-weight: ${theme.fontWeight.bold};
  }

  &.active::after {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    height: 2px;
    background-color: ${theme.colors.accent.primary};
    border-radius: 1px;
  }

  @media (min-width: ${theme.breakpoints.tablet}) {
    font-size: ${theme.fontSize.md};
  }
`;

export const navActionsStyle = (theme: Theme) => css`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  justify-self: end;
`;

export const loginPillStyle = (theme: Theme) => css`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 2rem;
  padding: 0 ${theme.spacing.md};
  border: none;
  border-radius: ${theme.borderRadius.full};
  background-color: ${theme.colors.accent.primary};
  color: #ffffff;
  font-size: ${theme.fontSize.sm};
  font-weight: ${theme.fontWeight.semibold};
  cursor: pointer;
  white-space: nowrap;
  transition: background-color 0.15s ease;

  &:hover {
    background-color: ${theme.colors.accent.active};
  }
`;

export const profileButtonStyle = css`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
`;
