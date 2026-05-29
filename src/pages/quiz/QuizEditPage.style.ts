import { css, type Theme } from '@emotion/react';
import { text } from '@/styles/text';

export const noticeStyle = (theme: Theme) => css`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing.md};
  padding: ${theme.spacing.xl};
  ${text({ size: 'sm', weight: 'regular' })({ theme })}
  color: ${theme.colors.fg.secondary};
`;
