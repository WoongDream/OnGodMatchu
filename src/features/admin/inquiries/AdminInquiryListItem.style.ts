import { css, type Theme } from '@emotion/react';

/** 헤더 행과 동일 정렬을 위해 페이지에서도 재사용. */
export const inquiryGridColumns = '1fr 12rem 6rem 7rem 1.5rem';

export const rowStyle = (theme: Theme) => css`
  display: grid;
  grid-template-columns: ${inquiryGridColumns};
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

export const titleStyle = (theme: Theme) => css`
  font-size: ${theme.fontSize.md};
  font-weight: ${theme.fontWeight.semibold};
  color: ${theme.colors.fg.primary};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const authorCellStyle = (theme: Theme) => css`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  min-width: 0;
`;

export const authorNameStyle = (theme: Theme) => css`
  font-size: ${theme.fontSize.sm};
  color: ${theme.colors.fg.secondary};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const dateCellStyle = (theme: Theme) => css`
  font-size: ${theme.fontSize.sm};
  color: ${theme.colors.fg.secondary};
`;

export const chevronStyle = (theme: Theme) => css`
  flex-shrink: 0;
  color: ${theme.colors.fg.tertiary};
`;
