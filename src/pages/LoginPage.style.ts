import { css, type Theme } from '@emotion/react';
import { text } from '@/styles/text';

export const errorBannerStyle = (theme: Theme) => css`
  ${text({ size: 'sm', weight: 'medium' })({ theme })}
  width: 100%;
  max-width: 28rem;
  margin: 0 auto ${theme.spacing.md};
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  border: 1px solid ${theme.colors.status.error};
  border-radius: ${theme.borderRadius.md};
  color: ${theme.colors.status.error};
  background-color: ${theme.colors.bg.secondary};
  text-align: center;
`;
