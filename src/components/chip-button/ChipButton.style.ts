import { css, type Theme } from '@emotion/react';
import { text } from '@/styles/text';

export const chipStyle = (active: boolean) => (theme: Theme) => css`
  ${text({ size: 'sm', weight: 'medium' })({ theme })}
  flex-shrink: 0;
  height: 2rem;
  padding: 0 ${theme.spacing.md};
  border-radius: ${theme.borderRadius.full};
  border: 1px solid ${active ? theme.colors.accent.primary : theme.colors.border.primary};
  background-color: ${active ? theme.colors.accent.primary : theme.colors.bg.primary};
  color: ${active ? theme.colors.accent.fg : theme.colors.fg.secondary};
  transition:
    background-color 0.15s,
    color 0.15s,
    border-color 0.15s;

  &:hover {
    border-color: ${theme.colors.accent.primary};
    color: ${active ? theme.colors.accent.fg : theme.colors.accent.primary};
  }
`;
