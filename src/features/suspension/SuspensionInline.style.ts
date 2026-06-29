import { css, type Theme } from '@emotion/react';

export const inlineStyle = (theme: Theme) => css`
  display: inline-flex;
  align-items: center;
  gap: ${theme.spacing.sm};
`;

export const inquiryLinkStyle = (theme: Theme) => css`
  display: inline-flex;
  align-items: center;
  padding: 2px ${theme.spacing.sm};
  border: 1px solid ${theme.colors.status.error};
  border-radius: ${theme.borderRadius.sm};
  background-color: ${theme.colors.bg.primary};
  font-size: ${theme.fontSize.xs};
  font-weight: ${theme.fontWeight.semibold};
  color: ${theme.colors.status.error};
  text-decoration: none;
  white-space: nowrap;

  &:hover {
    background-color: #fef2f2;
  }
`;
