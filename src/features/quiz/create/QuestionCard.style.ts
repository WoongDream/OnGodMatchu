import { css, type Theme } from '@emotion/react';
import { text } from '@/styles/text';

type CardState = {
  selected: boolean;
  invalid: boolean;
};

export const itemCardStyle =
  ({ selected, invalid }: CardState) =>
  (theme: Theme) => css`
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    aspect-ratio: 4 / 3;
    width: 100%;
    border-radius: ${theme.borderRadius.lg};
    background-color: ${theme.colors.bg.secondary};
    border: 2px solid
      ${invalid
        ? theme.colors.status.error
        : selected
          ? theme.colors.accent.primary
          : theme.colors.border.primary};
    cursor: pointer;
    overflow: hidden;
    padding: 0;
    transition:
      border-color 0.15s,
      background-color 0.15s;

    &:hover {
      border-color: ${invalid
        ? theme.colors.status.error
        : selected
          ? theme.colors.accent.primary
          : theme.colors.fg.tertiary};
    }
  `;

export const imageStyle = css`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

export const textStyle = (theme: Theme) => css`
  ${text({ size: 'sm' })({ theme })}
  color: ${theme.colors.fg.secondary};
  padding: ${theme.spacing.md};
  text-align: center;
  width: 100%;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  overflow: hidden;
`;

export const placeholderTextStyle = (theme: Theme) => css`
  ${text({ size: 'xs' })({ theme })}
  color: ${theme.colors.fg.tertiary};
`;

export const addCardStyle =
  ({ invalid }: { invalid: boolean }) =>
  (theme: Theme) => css`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: ${theme.spacing.xs};
    aspect-ratio: 4 / 3;
    width: 100%;
    border-radius: ${theme.borderRadius.lg};
    background-color: ${theme.colors.bg.primary};
    border: 2px dashed ${invalid ? theme.colors.status.error : theme.colors.border.primary};
    color: ${theme.colors.fg.secondary};
    cursor: pointer;
    padding: 0;
    transition: border-color 0.15s;

    &:hover {
      border-color: ${invalid ? theme.colors.status.error : theme.colors.accent.primary};
      color: ${theme.colors.accent.primary};
    }
  `;

export const addLabelStyle = (theme: Theme) => css`
  ${text({ size: 'sm', weight: 'medium' })({ theme })}
`;

export const alertBadgeStyle = (theme: Theme) => css`
  position: absolute;
  top: ${theme.spacing.xs};
  right: ${theme.spacing.xs};
  width: 1.25rem;
  height: 1.25rem;
  border-radius: ${theme.borderRadius.full};
  background-color: ${theme.colors.status.error};
  color: ${theme.colors.fg.inverse};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  font-weight: ${theme.fontWeight.bold};
  line-height: 1;
`;
