import { css, type Theme } from '@emotion/react';
import { text } from '@/styles/text';

export const wrapperStyle = css`
  position: relative;
  display: inline-block;
`;

export const triggerStyle = (open: boolean, disabled: boolean) => (theme: Theme) => css`
  ${text({ size: 'sm', weight: 'medium' })({ theme })}
  display: inline-flex;
  align-items: center;
  gap: ${theme.spacing.xs};
  height: 2rem;
  padding: 0 ${theme.spacing.md};
  border-radius: ${theme.borderRadius.md};
  border: 1px solid ${open ? theme.colors.accent.primary : theme.colors.border.primary};
  background-color: ${theme.colors.bg.primary};
  color: ${theme.colors.fg.primary};
  cursor: ${disabled ? 'not-allowed' : 'pointer'};
  opacity: ${disabled ? 0.5 : 1};
  transition: border-color 0.15s;

  &:hover {
    border-color: ${disabled ? theme.colors.border.primary : theme.colors.accent.primary};
  }

  &:focus-visible {
    outline: 2px solid ${theme.colors.accent.primary};
    outline-offset: 2px;
  }
`;

export const valueStyle = (theme: Theme) => css`
  color: ${theme.colors.fg.primary};
`;

export const caretStyle = (open: boolean) => css`
  display: inline-block;
  margin-left: 0.125rem;
  transition: transform 0.15s;
  transform: rotate(${open ? 180 : 0}deg);
`;

export const listStyle = (theme: Theme) => css`
  position: absolute;
  top: calc(100% + ${theme.spacing.xs});
  right: 0;
  min-width: 100%;
  margin: 0;
  padding: ${theme.spacing.xs};
  list-style: none;
  border: 1px solid ${theme.colors.border.primary};
  border-radius: ${theme.borderRadius.md};
  background-color: ${theme.colors.bg.primary};
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
  z-index: 10;
`;

export const optionStyle = (selected: boolean, focused: boolean) => (theme: Theme) => css`
  ${text({ size: 'sm', weight: selected ? 'semibold' : 'regular' })({ theme })}
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  border-radius: ${theme.borderRadius.sm};
  color: ${selected ? theme.colors.accent.primary : theme.colors.fg.primary};
  background-color: ${focused ? theme.colors.accent.subtle : 'transparent'};
  cursor: pointer;
  white-space: nowrap;

  &:hover {
    background-color: ${theme.colors.accent.subtle};
  }
`;
