import { css, type Theme } from '@emotion/react';
import type { ToastVariant } from './Toast.type';

export const containerStyle = (theme: Theme) => css`
  position: fixed;
  bottom: ${theme.spacing.xl};
  left: 50%;
  transform: translateX(-50%);
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.sm};
  pointer-events: none;

  @media (max-width: ${theme.breakpoints.tablet}) {
    bottom: ${theme.spacing.lg};
    left: ${theme.spacing.md};
    right: ${theme.spacing.md};
    transform: none;
    align-items: center;
  }
`;

const VARIANT_COLOR: Record<ToastVariant, (theme: Theme) => string> = {
  success: (theme) => theme.colors.status.success,
  info: (theme) => theme.colors.accent.primary,
  error: (theme) => theme.colors.status.error,
};

export const toastStyle = (variant: ToastVariant) => (theme: Theme) => css`
  pointer-events: auto;
  display: inline-flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  padding: ${theme.spacing.sm} ${theme.spacing.lg};
  background-color: ${theme.colors.fg.primary};
  color: ${theme.colors.fg.inverse};
  border-radius: ${theme.borderRadius.full};
  font-size: ${theme.fontSize.sm};
  line-height: 1.4;
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.18);
  max-width: 90vw;

  &::before {
    content: '';
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: ${theme.borderRadius.full};
    background-color: ${VARIANT_COLOR[variant](theme)};
    flex-shrink: 0;
  }
`;
