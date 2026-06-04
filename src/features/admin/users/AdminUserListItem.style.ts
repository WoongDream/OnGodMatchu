import { css, type Theme } from '@emotion/react';

/** 헤더 행과 동일 정렬을 위해 페이지에서도 재사용. */
export const userGridColumns = '1fr 6rem 7rem 5rem 11rem';

export const rowStyle = (theme: Theme) => css`
  display: grid;
  grid-template-columns: ${userGridColumns};
  align-items: center;
  gap: ${theme.spacing.md};
  padding: ${theme.spacing.md} ${theme.spacing.sm};
  border-top: 1px solid ${theme.colors.border.secondary};
  cursor: pointer;
  transition: background-color 0.12s ease;

  &:hover {
    background-color: ${theme.colors.bg.secondary};
  }

  &:focus-visible {
    outline: 2px solid ${theme.colors.accent.primary};
    outline-offset: -2px;
  }
`;

export const userCellStyle = (theme: Theme) => css`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  min-width: 0;
`;

export const nicknameStyle = (theme: Theme) => css`
  font-size: ${theme.fontSize.md};
  font-weight: ${theme.fontWeight.semibold};
  color: ${theme.colors.fg.primary};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const dateCellStyle = (theme: Theme) => css`
  font-size: ${theme.fontSize.sm};
  color: ${theme.colors.fg.secondary};
`;

export const actionCellStyle = (theme: Theme) => css`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 2.5rem;
  color: ${theme.colors.fg.tertiary};
`;

export const notifyButtonStyle = (theme: Theme) => css`
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  border: 1px solid ${theme.colors.border.primary};
  border-radius: ${theme.borderRadius.sm};
  background-color: ${theme.colors.bg.primary};
  font-size: ${theme.fontSize.sm};
  font-weight: ${theme.fontWeight.medium};
  color: ${theme.colors.fg.secondary};
  cursor: pointer;
  white-space: nowrap;

  &:hover {
    background-color: ${theme.colors.bg.secondary};
    color: ${theme.colors.fg.primary};
  }
`;

export const chevronStyle = css`
  flex-shrink: 0;
`;
