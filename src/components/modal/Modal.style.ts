import { css, type Theme } from '@emotion/react';
import { text } from '@/styles/text';

export const overlayStyle = css`
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
`;

export const dialogStyle = (size: 'sm' | 'md') => (theme: Theme) => css`
  background-color: ${theme.colors.bg.primary};
  border-radius: ${theme.borderRadius.lg};
  width: 100%;
  max-width: ${size === 'sm' ? '24rem' : '30rem'};
  max-height: calc(100vh - 2rem);
  display: flex;
  flex-direction: column;
  box-shadow:
    0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
`;

export const headerStyle = (theme: Theme) => css`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${theme.spacing.lg} ${theme.spacing.lg} ${theme.spacing.sm};
`;

export const titleStyle = (theme: Theme) => css`
  ${text({ size: 'lg', weight: 'bold' })({ theme })}
  color: ${theme.colors.fg.primary};
  margin: 0;
`;

export const closeButtonStyle = (theme: Theme) => css`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.75rem;
  height: 1.75rem;
  padding: 0;
  background: transparent;
  border: none;
  border-radius: ${theme.borderRadius.sm};
  color: ${theme.colors.fg.secondary};
  cursor: pointer;

  &:hover {
    background-color: ${theme.colors.bg.secondary};
    color: ${theme.colors.fg.primary};
  }
`;

export const bodyStyle = (theme: Theme) => css`
  padding: 0 ${theme.spacing.lg};
  flex: 1;
  overflow-y: auto;
`;

export const footerStyle = (theme: Theme) => css`
  display: flex;
  justify-content: flex-end;
  gap: ${theme.spacing.sm};
  padding: ${theme.spacing.lg};
`;
