import { css, type Theme } from '@emotion/react';

export const badgeStyle = (theme: Theme) => css`
  display: inline-flex;
  align-items: center;
  padding: 2px ${theme.spacing.sm};
  border-radius: ${theme.borderRadius.sm};
  background-color: #fef2f2;
  color: ${theme.colors.status.error};
  font-size: ${theme.fontSize.xs};
  font-weight: ${theme.fontWeight.bold};
  white-space: nowrap;
`;
