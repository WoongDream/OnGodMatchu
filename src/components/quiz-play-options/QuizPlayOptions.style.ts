import { css, type Theme } from '@emotion/react';

export const cardStyle = (theme: Theme) => css`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.lg};
  padding: ${theme.spacing.lg};
  border: 1px solid ${theme.colors.border.primary};
  border-radius: ${theme.borderRadius.lg};
  background-color: ${theme.colors.bg.primary};
`;

export const sectionStyle = (theme: Theme) => css`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
`;

export const sectionHeaderStyle = (theme: Theme) => css`
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: ${theme.spacing.sm};
`;

export const sectionLabelStyle = (theme: Theme) => css`
  font-size: ${theme.fontSize.md};
  font-weight: ${theme.fontWeight.semibold};
  color: ${theme.colors.fg.primary};
  margin: 0;
`;

export const sectionCaptionStyle = (theme: Theme) => css`
  font-size: ${theme.fontSize.xs};
  color: ${theme.colors.fg.tertiary};
`;

/* ===== Time slider (segmented dots) ===== */

export const timeRowStyle = (theme: Theme) => css`
  position: relative;
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: ${theme.spacing.sm};
  padding: ${theme.spacing.sm} 0 ${theme.spacing.md};

  &::before {
    content: '';
    position: absolute;
    top: calc(${theme.spacing.sm} + 6px);
    left: 5%;
    right: 5%;
    height: 2px;
    background-color: ${theme.colors.border.primary};
  }
`;

export const timeDotWrapStyle = (theme: Theme) => css`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing.xs};
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
  z-index: 1;
  font-size: ${theme.fontSize.sm};
  color: ${theme.colors.fg.secondary};
`;

export const timeDotStyle = (selected: boolean) => (theme: Theme) => css`
  width: 14px;
  height: 14px;
  border-radius: ${theme.borderRadius.full};
  background-color: ${selected ? theme.colors.accent.primary : theme.colors.bg.primary};
  border: 2px solid ${selected ? theme.colors.accent.primary : theme.colors.border.primary};
  transition:
    background-color 0.15s,
    border-color 0.15s;
`;

export const timeLabelStyle = (selected: boolean) => (theme: Theme) => css`
  font-size: ${theme.fontSize.md};
  font-weight: ${selected ? theme.fontWeight.semibold : theme.fontWeight.regular};
  color: ${selected ? theme.colors.fg.primary : theme.colors.fg.secondary};

  @media (min-width: ${theme.breakpoints.tablet}) {
    font-size: ${theme.fontSize.lg};
  }
`;

/* ===== Count grid ===== */

export const countGridStyle = (theme: Theme) => css`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: ${theme.spacing.sm};

  @media (max-width: ${theme.breakpoints.tablet}) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

export const countFewNoticeBoxStyle = (theme: Theme) => css`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${theme.spacing.md};
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  border-radius: ${theme.borderRadius.md};
  background-color: ${theme.colors.bg.secondary};
`;

export const countFewNoticeTextStyle = (theme: Theme) => css`
  font-size: ${theme.fontSize.sm};
  color: ${theme.colors.fg.secondary};
`;

export const countFewNoticeTotalStyle = (theme: Theme) => css`
  font-size: ${theme.fontSize.md};
  font-weight: ${theme.fontWeight.semibold};
  color: ${theme.colors.fg.primary};
  flex-shrink: 0;
`;

export const countCardStyle = (selected: boolean, disabled: boolean) => (theme: Theme) => css`
  appearance: none;
  cursor: ${disabled ? 'not-allowed' : 'pointer'};
  padding: ${theme.spacing.md};
  border-radius: ${theme.borderRadius.md};
  border: 1.5px solid ${selected ? theme.colors.accent.primary : theme.colors.border.primary};
  background-color: ${selected ? theme.colors.accent.subtle : theme.colors.bg.primary};
  color: ${disabled ? theme.colors.fg.tertiary : theme.colors.fg.primary};
  font-size: ${theme.fontSize.md};
  font-weight: ${theme.fontWeight.semibold};
  transition:
    border-color 0.15s,
    background-color 0.15s;
  opacity: ${disabled ? 0.6 : 1};

  &:hover:not(:disabled) {
    border-color: ${theme.colors.accent.primary};
  }
`;
