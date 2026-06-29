import { css, type Theme } from '@emotion/react';
import type { NotificationType } from '@/types';

export const overlayStyle = css`
  position: fixed;
  inset: 0;
  z-index: 1100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background-color: rgba(24, 24, 27, 0.55);
`;

export const metaWrapStyle = (theme: Theme) => css`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing.sm};
  width: 100%;
  max-width: 22rem;
`;

export const countPillStyle = (theme: Theme) => css`
  padding: ${theme.spacing.xs} ${theme.spacing.md};
  border-radius: ${theme.borderRadius.full};
  background-color: rgba(24, 24, 27, 0.75);
  color: ${theme.colors.fg.inverse};
  font-size: ${theme.fontSize.xs};
  font-weight: ${theme.fontWeight.semibold};
`;

export const cardStyle = (theme: Theme) => css`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing.md};
  width: 100%;
  padding: ${theme.spacing.xl} ${theme.spacing.lg} ${theme.spacing.lg};
  border-radius: ${theme.borderRadius.lg};
  background-color: ${theme.colors.bg.primary};
  text-align: center;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.18);
`;

export const typeBadgeStyle = (theme: Theme, type: NotificationType) => {
  const warning = type === 'WARNING';
  return css`
    display: inline-flex;
    padding: 2px ${theme.spacing.sm};
    border-radius: ${theme.borderRadius.sm};
    font-size: ${theme.fontSize.xs};
    font-weight: ${theme.fontWeight.bold};
    background-color: ${warning ? '#fef9c3' : theme.colors.accent.subtle};
    color: ${warning ? '#ca8a04' : theme.colors.accent.active};
  `;
};

export const titleStyle = (theme: Theme) => css`
  margin: 0;
  font-size: ${theme.fontSize.lg};
  font-weight: ${theme.fontWeight.bold};
  color: ${theme.colors.fg.primary};
`;

export const contentStyle = (theme: Theme) => css`
  margin: 0;
  font-size: ${theme.fontSize.sm};
  line-height: 1.6;
  color: ${theme.colors.fg.secondary};
  white-space: pre-wrap;
  word-break: break-word;
`;

export const metaStyle = (theme: Theme) => css`
  margin: 0;
  font-size: ${theme.fontSize.xs};
  color: ${theme.colors.fg.tertiary};
`;

export const footerStyle = (theme: Theme) => css`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.sm};
  width: 100%;
  margin-top: ${theme.spacing.sm};
`;
