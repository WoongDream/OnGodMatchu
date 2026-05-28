import { css, type Theme } from '@emotion/react';

export const cardStyle = (theme: Theme) => css`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.sm};
  padding: ${theme.spacing.md};
  border: 1px solid ${theme.colors.border.primary};
  border-radius: ${theme.borderRadius.md};
  background-color: ${theme.colors.bg.primary};
`;

export const userRowStyle = (theme: Theme) => css`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
`;

export const nicknameLabelStyle = (theme: Theme) => css`
  font-size: ${theme.fontSize.sm};
  font-weight: ${theme.fontWeight.semibold};
  color: ${theme.colors.fg.primary};
`;

export const inputAreaStyle = () => css`
  display: flex;
`;

export const textareaStyle = (theme: Theme) => css`
  width: 100%;
  resize: vertical;
  min-height: 60px;
  padding: ${theme.spacing.sm};
  border: 1px solid ${theme.colors.border.primary};
  border-radius: ${theme.borderRadius.sm};
  font-size: ${theme.fontSize.sm};
  font-family: inherit;
  line-height: 1.5;
  color: ${theme.colors.fg.primary};
  background-color: ${theme.colors.bg.primary};

  &:focus-visible {
    outline: 2px solid ${theme.colors.accent.primary};
    outline-offset: 0;
    border-color: ${theme.colors.accent.primary};
  }
`;

export const footerStyle = (theme: Theme) => css`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${theme.spacing.sm};
`;

export const captionStyle = (theme: Theme) => css`
  font-size: ${theme.fontSize.xs};
  color: ${theme.colors.fg.tertiary};
`;

export const errorStyle = (theme: Theme) => css`
  font-size: ${theme.fontSize.xs};
  color: ${theme.colors.status.error};
  margin: 0;
`;

/* === Login prompt (비로그인 상태) === */

export const loginPromptCardStyle = (theme: Theme) => css`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${theme.spacing.md};
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  border: 1px solid ${theme.colors.border.primary};
  border-radius: ${theme.borderRadius.md};
  background-color: ${theme.colors.bg.primary};
  flex-wrap: wrap;
`;

export const loginPromptTextStyle = (theme: Theme) => css`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xs};

  strong {
    font-size: ${theme.fontSize.sm};
    font-weight: ${theme.fontWeight.semibold};
    color: ${theme.colors.fg.primary};
  }
  span {
    font-size: ${theme.fontSize.xs};
    color: ${theme.colors.fg.tertiary};
  }
`;

export const loginPromptActionStyle = () => css`
  display: flex;
`;
