import { css, type Theme } from '@emotion/react';

export const noticeStyle = (theme: Theme) => css`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: ${theme.spacing.sm};
  padding: ${theme.spacing.lg};
  border: 1px solid ${theme.colors.status.error};
  border-radius: ${theme.borderRadius.lg};
  background-color: #fef2f2;
`;

export const noticeTextStyle = (theme: Theme) => css`
  margin: 0;
  font-size: ${theme.fontSize.sm};
  line-height: 1.5;
  color: ${theme.colors.fg.secondary};
`;
