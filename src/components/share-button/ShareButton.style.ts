import { css, type Theme } from '@emotion/react';
import type { ShareButtonSize } from './ShareButton.type';

const SIZE_TO_ICON: Record<ShareButtonSize, number> = { sm: 16, md: 20, lg: 24 };
export const getIconSize = (size: ShareButtonSize): number => SIZE_TO_ICON[size];

export const iconButtonStyle = (size: ShareButtonSize) => (theme: Theme) => css`
  appearance: none;
  background: transparent;
  border: none;
  padding: ${theme.spacing.xs};
  cursor: pointer;
  color: ${theme.colors.fg.tertiary};
  display: inline-flex;
  align-items: center;
  gap: ${theme.spacing.xs};
  border-radius: ${theme.borderRadius.full};
  line-height: 1;
  transition:
    color 0.15s,
    background-color 0.15s;

  &:hover:not(:disabled) {
    background-color: ${theme.colors.bg.secondary};
    color: ${theme.colors.fg.secondary};
  }
  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }

  ${size === 'sm' &&
  css`
    padding: 2px;
  `}
  ${size === 'lg' &&
  css`
    padding: ${theme.spacing.sm};
  `}
`;

export const chipLabelStyle = (theme: Theme) => css`
  display: inline-flex;
  align-items: center;
  gap: ${theme.spacing.xs};
  line-height: 1;

  svg {
    display: block;
    flex-shrink: 0;
  }
`;

export const chipStyle =
  (size: ShareButtonSize = 'md') =>
  (theme: Theme) => css`
    appearance: none;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: space-between;
    gap: ${theme.spacing.sm};
    padding: ${size === 'lg'
      ? `${theme.spacing.sm} ${theme.spacing.md}`
      : `${theme.spacing.xs} ${theme.spacing.sm}`};
    border-radius: ${theme.borderRadius.full};
    border: 1px solid ${theme.colors.border.primary};
    background-color: ${theme.colors.bg.primary};
    color: ${theme.colors.fg.primary};
    font-size: ${size === 'lg' ? theme.fontSize.md : theme.fontSize.sm};
    font-weight: ${theme.fontWeight.medium};
    line-height: 1;
    transition: background-color 0.15s;

    svg {
      color: ${theme.colors.fg.secondary};
    }

    &:hover:not(:disabled) {
      background-color: ${theme.colors.bg.secondary};
    }
    &:disabled {
      cursor: not-allowed;
      opacity: 0.6;
    }
  `;

export const countLabelStyle = (theme: Theme) => css`
  font-size: ${theme.fontSize.sm};
  font-weight: ${theme.fontWeight.medium};
  color: inherit;
`;
